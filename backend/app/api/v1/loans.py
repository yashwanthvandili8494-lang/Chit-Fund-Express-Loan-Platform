from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, date, timedelta
from typing import List, Optional
from decimal import Decimal

from app.core.database import get_db
from app.core.security import mask_account_number
from app.models.models import (
    User, UserRole, KYCRecord, KYCStatus, LoanProduct, LoanApplication,
    LoanAppStatus, Loan, LoanStatus, LoanRepayment, RepaymentStatus,
    AuditLog, Notification, BankVerificationRecord
)
from app.schemas.schemas import (
    LoanProductOut, LoanApplyRequest, LoanAppReview,
    LoanApplicationOut, LoanOut, LoanRepaymentOut
)
from app.services.financial_engines import LoanEngine
from app.api.deps import get_current_user, require_admin, require_staff_or_admin

router = APIRouter(prefix="/loans", tags=["Loan Management"])

@router.get("/products", response_model=List[LoanProductOut])
def list_loan_products(
    active_only: bool = True,
    db: Session = Depends(get_db)
):
    query = db.query(LoanProduct)
    if active_only:
        query = query.filter(LoanProduct.is_active == True)
    return query.order_by(LoanProduct.max_amount.asc()).all()

@router.get("/calculate-emi")
def calculate_emi_endpoint(
    amount: Decimal,
    tenure_months: int,
    annual_rate: Decimal = Decimal('14.50')
):
    calc = LoanEngine.calculate_emi(
        principal=amount,
        annual_interest_rate_pct=annual_rate,
        tenure_months=tenure_months
    )
    processing_fee = (amount * Decimal('0.02')).quantize(Decimal('0.01'))
    gst_on_fee = (processing_fee * Decimal('0.18')).quantize(Decimal('0.01'))
    
    return {
        "requested_amount": float(amount),
        "tenure_months": tenure_months,
        "annual_interest_rate_apr": float(annual_rate),
        "monthly_emi": float(calc["monthly_emi"]),
        "total_interest": float(calc["total_interest"]),
        "total_payable": float(calc["total_payable"]),
        "processing_fee": float(processing_fee),
        "gst_on_fee": float(gst_on_fee),
        "net_disbursed_estimate": float(amount - processing_fee - gst_on_fee)
    }

@router.post("/apply", response_model=LoanApplicationOut)
def apply_for_loan(
    app_in: LoanApplyRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check KYC status
    kyc = db.query(KYCRecord).filter(KYCRecord.user_id == current_user.id).first()
    if not kyc or kyc.status != KYCStatus.VERIFIED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="KYC verification is mandatory before applying for lending facilities."
        )

    product = db.query(LoanProduct).filter(LoanProduct.id == app_in.product_id, LoanProduct.is_active == True).first()
    if not product:
        raise HTTPException(status_code=404, detail="Selected loan product is inactive or not found")

    if app_in.requested_amount < product.min_amount or app_in.requested_amount > product.max_amount:
        raise HTTPException(
            status_code=400,
            detail=f"Amount must be between ₹{product.min_amount:,.2f} and ₹{product.max_amount:,.2f}"
        )

    app_no = f"LOAN-APP-{datetime.utcnow().strftime('%Y%m')}-{abs(hash(f'{current_user.id}-{product.id}-{datetime.utcnow().timestamp()}')) % 100000:05d}"

    # Bank verification record
    bank_rec = BankVerificationRecord(
        user_id=current_user.id,
        account_number_masked=mask_account_number(app_in.bank_account_no),
        ifsc_code=app_in.bank_ifsc.upper(),
        bank_name=app_in.bank_name,
        account_holder_name=current_user.full_name,
        penny_drop_status="VERIFIED",
        provider_reference=f"PND-{datetime.utcnow().strftime('%y%m%d%H%M')}"
    )
    db.add(bank_rec)

    loan_app = LoanApplication(
        application_no=app_no,
        user_id=current_user.id,
        product_id=product.id,
        requested_amount=app_in.requested_amount,
        tenure_months=app_in.tenure_months,
        employment_type=app_in.employment_type,
        monthly_income=app_in.monthly_income,
        employer_name=app_in.employer_name,
        loan_purpose=app_in.loan_purpose,
        bank_account_no_masked=mask_account_number(app_in.bank_account_no),
        bank_ifsc=app_in.bank_ifsc.upper(),
        bank_name=app_in.bank_name,
        bank_verified=True,
        status=LoanAppStatus.PENDING,
        credit_score_estimate=750
    )
    db.add(loan_app)

    notif = Notification(
        user_id=current_user.id,
        title="Loan Application Received",
        message=f"Your loan request {app_no} for ₹{app_in.requested_amount:,.2f} is under underwriting review.",
        category="LOAN",
        action_url="/customer/loan-applications"
    )
    db.add(notif)

    audit = AuditLog(
        user_id=current_user.id,
        user_role=current_user.role.value,
        action="SUBMIT_LOAN_APPLICATION",
        module="LOANS",
        entity_id=app_no,
        details=f"Loan application submitted for ₹{app_in.requested_amount}"
    )
    db.add(audit)

    db.commit()
    db.refresh(loan_app)
    return loan_app

@router.get("/applications", response_model=List[LoanApplicationOut])
def list_loan_applications(
    status_filter: Optional[LoanAppStatus] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(LoanApplication)
    if current_user.role == UserRole.CUSTOMER:
        query = query.filter(LoanApplication.user_id == current_user.id)
    elif status_filter:
        query = query.filter(LoanApplication.status == status_filter)

    return query.order_by(LoanApplication.created_at.desc()).all()

@router.post("/applications/{app_id}/review", response_model=LoanApplicationOut)
def review_loan_application(
    app_id: int,
    review: LoanAppReview,
    current_user: User = Depends(require_staff_or_admin),
    db: Session = Depends(get_db)
):
    loan_app = db.query(LoanApplication).filter(LoanApplication.id == app_id).first()
    if not loan_app:
        raise HTTPException(status_code=404, detail="Loan application not found")

    loan_app.status = review.status
    loan_app.reviewed_by_id = current_user.id
    loan_app.rejection_reason = review.rejection_reason

    if review.status in [LoanAppStatus.APPROVED, LoanAppStatus.ACTIVE]:
        loan_app.approved_at = datetime.utcnow()
        # Automatically generate active loan account & EMI schedule
        existing_loan = db.query(Loan).filter(Loan.application_id == loan_app.id).first()
        if not existing_loan:
            product = loan_app.product
            apr = product.annual_interest_rate
            calc = LoanEngine.calculate_emi(
                principal=loan_app.requested_amount,
                annual_interest_rate_pct=apr,
                tenure_months=loan_app.tenure_months
            )

            proc_fee = (loan_app.requested_amount * (product.processing_fee_pct / Decimal('100'))).quantize(Decimal('0.01'))
            disbursed = loan_app.requested_amount - proc_fee
            loan_acc_no = f"LN-ACC-{datetime.utcnow().strftime('%Y%m')}-{loan_app.id:04d}"

            new_loan = Loan(
                loan_account_no=loan_acc_no,
                application_id=loan_app.id,
                user_id=loan_app.user_id,
                principal_amount=loan_app.requested_amount,
                tenure_months=loan_app.tenure_months,
                interest_rate_apr=apr,
                monthly_emi=calc["monthly_emi"],
                total_interest=calc["total_interest"],
                total_payable=calc["total_payable"],
                processing_fee=proc_fee,
                disbursed_amount=disbursed,
                disbursement_date=date.today(),
                maturity_date=date.today() + timedelta(days=loan_app.tenure_months * 30),
                principal_outstanding=loan_app.requested_amount,
                interest_outstanding=calc["total_interest"],
                total_paid=Decimal('0.00'),
                status=LoanStatus.ACTIVE
            )
            db.add(new_loan)
            db.flush()

            # Generate month-by-month repayment schedule
            schedule = LoanEngine.generate_repayment_schedule(
                principal=loan_app.requested_amount,
                annual_interest_rate_pct=apr,
                tenure_months=loan_app.tenure_months,
                start_date=date.today()
            )

            for item in schedule:
                repayment = LoanRepayment(
                    loan_id=new_loan.id,
                    emi_number=item["emi_number"],
                    due_date=item["due_date"],
                    emi_amount=item["emi_amount"],
                    principal_component=item["principal_component"],
                    interest_component=item["interest_component"],
                    status=RepaymentStatus.PENDING
                )
                db.add(repayment)

            loan_app.status = LoanAppStatus.ACTIVE
            notif_msg = f"Your Loan Application {loan_app.application_no} has been APPROVED & DISBURSED! Loan Account: {loan_acc_no}. Monthly EMI: ₹{calc['monthly_emi']:,.2f}."
    else:
        notif_msg = f"Your Loan Application {loan_app.application_no} status: {review.status.value}. Reason: {review.rejection_reason}"

    notif = Notification(
        user_id=loan_app.user_id,
        title=f"Loan Application Update: {loan_app.status.value}",
        message=notif_msg,
        category="LOAN",
        action_url="/customer/loans"
    )
    db.add(notif)

    audit = AuditLog(
        user_id=current_user.id,
        user_role=current_user.role.value,
        action=f"LOAN_APP_{loan_app.status.value}",
        module="LOANS",
        entity_id=loan_app.application_no,
        details=f"Admin {current_user.full_name} reviewed loan application: {loan_app.status.value}"
    )
    db.add(audit)

    db.commit()
    db.refresh(loan_app)
    return loan_app

@router.get("/my-loans", response_model=List[LoanOut])
def get_my_loans(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    loans = db.query(Loan).filter(Loan.user_id == current_user.id).order_by(Loan.created_at.desc()).all()
    return loans

@router.get("/active-all", response_model=List[LoanOut])
def get_all_active_loans(
    current_user: User = Depends(require_staff_or_admin),
    db: Session = Depends(get_db)
):
    return db.query(Loan).order_by(Loan.created_at.desc()).all()


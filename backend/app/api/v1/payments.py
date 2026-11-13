from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Optional
from decimal import Decimal

from app.core.database import get_db
from app.models.models import (
    User, UserRole, PaymentTransaction, PaymentStatus, PaymentType,
    PaymentMode, LoanRepayment, RepaymentStatus, Loan,
    ChitInstallment, ChitMember, AuditLog, Notification
)
from app.schemas.schemas import PaymentPayRequest, PaymentTransactionOut
from app.api.deps import get_current_user, require_staff_or_admin

router = APIRouter(prefix="/payments", tags=["Payment Management"])

@router.post("/process", response_model=PaymentTransactionOut)
def process_payment(
    req: PaymentPayRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    timestamp = datetime.utcnow()
    txn_ref = f"TXN-{timestamp.strftime('%Y%m%d%H%M%S')}-{abs(hash(f'{current_user.id}-{req.reference_id}-{timestamp.timestamp()}')) % 10000:04d}"
    receipt_no = f"RCPT-{timestamp.strftime('%Y%m')}-{abs(hash(txn_ref)) % 100000:05d}"
    gateway_order = f"order_{timestamp.strftime('%y%m%d%H%M')}_{abs(hash(txn_ref)) % 1000:03d}"
    gateway_pay_id = f"pay_{timestamp.strftime('%y%m%d%H%M%S')}_{abs(hash(receipt_no)) % 1000:03d}"

    # Process based on payment type
    if req.payment_type == PaymentType.LOAN_EMI:
        repayment = db.query(LoanRepayment).filter(LoanRepayment.id == req.reference_id).first()
        if not repayment:
            raise HTTPException(status_code=404, detail="Loan repayment record not found")
        
        repayment.status = RepaymentStatus.PAID
        repayment.paid_amount = req.amount
        repayment.paid_at = timestamp

        loan = repayment.loan
        loan.principal_outstanding = max(Decimal('0.00'), loan.principal_outstanding - repayment.principal_component)
        loan.interest_outstanding = max(Decimal('0.00'), loan.interest_outstanding - repayment.interest_component)
        loan.total_paid += req.amount
        
        # Check if all EMIs are paid
        pending_emis = db.query(LoanRepayment).filter(
            LoanRepayment.loan_id == loan.id,
            LoanRepayment.status != RepaymentStatus.PAID
        ).count()
        if pending_emis == 0:
            loan.status = "CLOSED"

    elif req.payment_type == PaymentType.CHIT_SUBSCRIPTION:
        member = db.query(ChitMember).filter(
            ChitMember.user_id == current_user.id,
            ChitMember.id == req.reference_id
        ).first()
        if member:
            member.total_subscription_paid += req.amount

    # Create immutable transaction record
    txn = PaymentTransaction(
        txn_reference=txn_ref,
        gateway_order_id=gateway_order,
        gateway_payment_id=gateway_pay_id,
        user_id=current_user.id,
        amount=req.amount,
        payment_mode=req.payment_mode,
        payment_type=req.payment_type,
        reference_id=req.reference_id,
        status=PaymentStatus.SUCCESS,
        receipt_number=receipt_no,
        notes=req.notes or f"Payment received via {req.payment_mode.value}"
    )
    db.add(txn)

    # Link transaction to repayment if applicable
    if req.payment_type == PaymentType.LOAN_EMI and repayment:
        repayment.payment_transaction_id = txn.id

    # User Notification
    notif = Notification(
        user_id=current_user.id,
        title="Payment Successful",
        message=f"Received payment of ₹{req.amount:,.2f} for {req.payment_type.value}. Receipt: {receipt_no}",
        category="PAYMENT",
        action_url="/customer/payments"
    )
    db.add(notif)

    # Audit Trail
    audit = AuditLog(
        user_id=current_user.id,
        user_role=current_user.role.value,
        action="PAYMENT_RECEIVED",
        module="PAYMENTS",
        entity_id=txn_ref,
        details=f"Payment of ₹{req.amount} processed successfully via {req.payment_mode.value}"
    )
    db.add(audit)

    db.commit()
    db.refresh(txn)
    return txn

@router.get("/transactions", response_model=List[PaymentTransactionOut])
def list_transactions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(PaymentTransaction)
    if current_user.role == UserRole.CUSTOMER:
        query = query.filter(PaymentTransaction.user_id == current_user.id)
    return query.order_by(PaymentTransaction.created_at.desc()).all()

@router.get("/receipt/{receipt_number}")
def get_payment_receipt(
    receipt_number: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    txn = db.query(PaymentTransaction).filter(PaymentTransaction.receipt_number == receipt_number).first()
    if not txn:
        raise HTTPException(status_code=404, detail="Receipt not found")

    if current_user.role == UserRole.CUSTOMER and txn.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied to this receipt")

    return {
        "receipt_number": txn.receipt_number,
        "transaction_ref": txn.txn_reference,
        "payment_date": txn.created_at.strftime("%d-%b-%Y %I:%M %p"),
        "customer_name": txn.user.full_name,
        "customer_mobile": txn.user.mobile_number,
        "customer_email": txn.user.email,
        "amount": float(txn.amount),
        "payment_mode": txn.payment_mode.value,
        "payment_type": txn.payment_type.value,
        "gateway_ref": txn.gateway_payment_id,
        "status": txn.status.value,
        "notes": txn.notes,
        "company": {
            "name": "Sowbhagya Chits & FinServe Private Limited",
            "cin": "U65992KA2018PTC112345",
            "gstin": "29ABCDE1234F1Z5",
            "address": "#42, 3rd Floor, FinTech Towers, MG Road, Bengaluru 560001",
            "phone": "+91 80 4912 8800",
            "registrar_chit_no": "KA/BLR/CHIT/2019/882",
            "money_lending_license": "KA/BLR/MLL/2021/409"
        }
    }


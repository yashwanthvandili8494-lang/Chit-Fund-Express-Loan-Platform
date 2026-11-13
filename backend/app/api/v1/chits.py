from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, date, timedelta
from typing import List, Optional
from decimal import Decimal

from app.core.database import get_db
from app.core.security import mask_account_number
from app.models.models import (
    User, UserRole, KYCRecord, KYCStatus, ChitPlan, ChitGroup,
    ChitApplication, ChitAppStatus, ChitMember, ChitMemberStatus,
    ChitAuction, AuctionStatus, ChitBid, ChitInstallment,
    ChitPrizeDistribution, PrizeDisbursementStatus, AuditLog, Notification,
    ChitGroupStatus
)
from app.schemas.schemas import (
    ChitPlanCreate, ChitPlanOut, ChitApplyRequest, ChitAppReview,
    ChitApplicationOut, ChitGroupOut, ChitAuctionOut, ChitBidSubmit,
    ChitAuctionConduct
)
from app.services.financial_engines import ChitEngine
from app.api.deps import get_current_user, require_admin, require_staff_or_admin

router = APIRouter(prefix="/chits", tags=["Chit Fund Management"])

@router.get("/plans", response_model=List[ChitPlanOut])
def list_chit_plans(
    active_only: bool = True,
    db: Session = Depends(get_db)
):
    query = db.query(ChitPlan)
    if active_only:
        query = query.filter(ChitPlan.is_active == True)
    return query.order_by(ChitPlan.chit_value.asc()).all()

@router.post("/plans", response_model=ChitPlanOut)
def create_chit_plan(
    plan_in: ChitPlanCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    plan_code = f"CP-{int(plan_in.chit_value // 1000)}K-{plan_in.duration_months}M"
    existing = db.query(ChitPlan).filter(ChitPlan.plan_code == plan_code).first()
    if existing:
        plan_code = f"{plan_code}-{int(datetime.utcnow().timestamp()) % 1000}"

    new_plan = ChitPlan(
        plan_code=plan_code,
        name=plan_in.name,
        chit_value=plan_in.chit_value,
        duration_months=plan_in.duration_months,
        monthly_subscription=plan_in.monthly_subscription,
        max_subscribers=plan_in.max_subscribers,
        foreman_commission_pct=plan_in.foreman_commission_pct,
        max_discount_pct=plan_in.max_discount_pct,
        min_discount_pct=plan_in.min_discount_pct,
        registered_scheme_ref=plan_in.registered_scheme_ref,
        registration_authority=plan_in.registration_authority,
        terms_conditions=plan_in.terms_conditions,
        is_active=True
    )
    db.add(new_plan)
    db.commit()
    db.refresh(new_plan)

    audit = AuditLog(
        user_id=current_user.id,
        user_role=current_user.role.value,
        action="CREATE_CHIT_PLAN",
        module="CHITS",
        entity_id=str(new_plan.id),
        details=f"Created Chit Plan: {new_plan.name} with value ₹{new_plan.chit_value}"
    )
    db.add(audit)
    db.commit()

    return new_plan

@router.patch("/plans/{plan_id}/toggle-status", response_model=ChitPlanOut)
def toggle_chit_plan_status(
    plan_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    plan = db.query(ChitPlan).filter(ChitPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Chit plan not found")
    plan.is_active = not plan.is_active
    db.commit()
    db.refresh(plan)
    return plan

@router.post("/apply", response_model=ChitApplicationOut)
def apply_for_chit(
    app_req: ChitApplyRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify KYC status first
    kyc = db.query(KYCRecord).filter(KYCRecord.user_id == current_user.id).first()
    if not kyc or kyc.status != KYCStatus.VERIFIED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Your KYC must be Verified by our compliance team before applying for a Chit Fund scheme."
        )

    plan = db.query(ChitPlan).filter(ChitPlan.id == app_req.plan_id, ChitPlan.is_active == True).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Selected Chit Plan is inactive or does not exist")

    # Generate unique application number
    app_no = f"CHIT-APP-{datetime.utcnow().strftime('%Y%m')}-{abs(hash(f'{current_user.id}-{plan.id}-{datetime.utcnow().timestamp()}')) % 100000:05d}"

    chit_app = ChitApplication(
        application_no=app_no,
        user_id=current_user.id,
        plan_id=plan.id,
        status=ChitAppStatus.PENDING,
        nominee_name=app_req.nominee_name,
        nominee_relationship=app_req.nominee_relationship,
        nominee_phone=app_req.nominee_phone,
        bank_name=app_req.bank_name,
        bank_account_no_masked=mask_account_number(app_req.bank_account_no),
        bank_ifsc=app_req.bank_ifsc.upper(),
        agreement_accepted=app_req.accept_terms
    )
    db.add(chit_app)

    # Customer notification
    notif = Notification(
        user_id=current_user.id,
        title="Chit Application Submitted",
        message=f"Application {app_no} for scheme '{plan.name}' (Value ₹{plan.chit_value:,.2f}) has been submitted for administrative verification.",
        category="CHIT",
        action_url="/customer/chit-applications"
    )
    db.add(notif)

    # Audit log
    audit = AuditLog(
        user_id=current_user.id,
        user_role=current_user.role.value,
        action="SUBMIT_CHIT_APPLICATION",
        module="CHITS",
        entity_id=app_no,
        details=f"Application submitted for plan {plan.plan_code}"
    )
    db.add(audit)

    db.commit()
    db.refresh(chit_app)
    return chit_app

@router.get("/applications", response_model=List[ChitApplicationOut])
def list_chit_applications(
    status_filter: Optional[ChitAppStatus] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(ChitApplication)
    
    # If customer, only show their own applications
    if current_user.role == UserRole.CUSTOMER:
        query = query.filter(ChitApplication.user_id == current_user.id)
    elif status_filter:
        query = query.filter(ChitApplication.status == status_filter)

    return query.order_by(ChitApplication.created_at.desc()).all()

@router.post("/applications/{app_id}/review", response_model=ChitApplicationOut)
def review_chit_application(
    app_id: int,
    review: ChitAppReview,
    current_user: User = Depends(require_staff_or_admin),
    db: Session = Depends(get_db)
):
    chit_app = db.query(ChitApplication).filter(ChitApplication.id == app_id).first()
    if not chit_app:
        raise HTTPException(status_code=404, detail="Chit application not found")

    chit_app.status = review.status
    chit_app.reviewed_by_id = current_user.id
    chit_app.rejection_reason = review.rejection_reason

    if review.status in [ChitAppStatus.APPROVED, ChitAppStatus.ENROLLED]:
        chit_app.approved_at = datetime.utcnow()
        # Find or link active group
        group = None
        if review.group_id:
            group = db.query(ChitGroup).filter(ChitGroup.id == review.group_id).first()
        else:
            group = db.query(ChitGroup).filter(
                ChitGroup.plan_id == chit_app.plan_id,
                ChitGroup.status.in_([ChitGroupStatus.COMMENCED, ChitGroupStatus.ACTIVE])
            ).first()

        if group:
            chit_app.group_id = group.id
            # Assign ticket number and create member record
            existing_count = db.query(ChitMember).filter(ChitMember.group_id == group.id).count()
            ticket_no = existing_count + 1
            member = ChitMember(
                group_id=group.id,
                user_id=chit_app.user_id,
                ticket_number=ticket_no,
                status=ChitMemberStatus.ACTIVE
            )
            db.add(member)
            chit_app.status = ChitAppStatus.ENROLLED
            notif_msg = f"Your Chit Application {chit_app.application_no} has been APPROVED and ENROLLED into Group {group.group_code} (Ticket #{ticket_no})."
        else:
            notif_msg = f"Your Chit Application {chit_app.application_no} has been APPROVED. Group allotment in progress."
    else:
        notif_msg = f"Your Chit Application {chit_app.application_no} status: {review.status.value}. Reason: {review.rejection_reason}"

    # Notification to customer
    notif = Notification(
        user_id=chit_app.user_id,
        title=f"Chit Application Update: {chit_app.status.value}",
        message=notif_msg,
        category="CHIT",
        action_url="/customer/chits"
    )
    db.add(notif)

    # Audit log
    audit = AuditLog(
        user_id=current_user.id,
        user_role=current_user.role.value,
        action=f"CHIT_APP_{chit_app.status.value}",
        module="CHITS",
        entity_id=chit_app.application_no,
        details=f"Admin {current_user.full_name} reviewed application: {chit_app.status.value}"
    )
    db.add(audit)

    db.commit()
    db.refresh(chit_app)
    return chit_app

@router.get("/groups", response_model=List[ChitGroupOut])
def list_chit_groups(
    db: Session = Depends(get_db)
):
    return db.query(ChitGroup).order_by(ChitGroup.created_at.desc()).all()

@router.get("/groups/{group_id}/members")
def get_group_members(
    group_id: int,
    db: Session = Depends(get_db)
):
    members = db.query(ChitMember).filter(ChitMember.group_id == group_id).all()
    results = []
    for m in members:
        results.append({
            "id": m.id,
            "ticket_number": m.ticket_number,
            "user_id": m.user_id,
            "full_name": m.user.full_name if m.user else "Unknown",
            "email": m.user.email if m.user else "",
            "mobile": m.user.mobile_number if m.user else "",
            "is_prized": m.is_prized,
            "prized_installment_no": m.prized_installment_no,
            "prized_amount": float(m.prized_amount),
            "status": m.status.value
        })
    return results

@router.get("/auctions", response_model=List[ChitAuctionOut])
def list_auctions(
    group_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(ChitAuction)
    if group_id:
        query = query.filter(ChitAuction.group_id == group_id)
    return query.order_by(ChitAuction.auction_date.desc()).all()

@router.post("/auctions/conduct", response_model=ChitAuctionOut)
def conduct_auction(
    conduct_in: ChitAuctionConduct,
    current_user: User = Depends(require_staff_or_admin),
    db: Session = Depends(get_db)
):
    auction = db.query(ChitAuction).filter(ChitAuction.id == conduct_in.auction_id).first()
    if not auction:
        raise HTTPException(status_code=404, detail="Auction session not found")

    member = db.query(ChitMember).filter(ChitMember.id == conduct_in.winning_member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Winning member record not found")

    plan = auction.group.plan
    total_subscribers = plan.max_subscribers

    # Use Chit Funds Act 1982 distribution calculations
    dist = ChitEngine.calculate_auction_distribution(
        chit_value=auction.chit_value,
        total_subscribers=total_subscribers,
        foreman_commission_pct=plan.foreman_commission_pct,
        winning_bid_discount=conduct_in.winning_bid_discount
    )

    auction.winning_bid_discount = conduct_in.winning_bid_discount
    auction.winning_member_id = member.id
    auction.foreman_commission = dist["foreman_commission"]
    auction.total_dividend = dist["total_dividend"]
    auction.dividend_per_member = dist["dividend_per_member"]
    auction.net_prize_amount = dist["net_prize_amount"]
    auction.status = AuctionStatus.COMPLETED
    auction.conducted_by_id = current_user.id
    auction.completed_at = datetime.utcnow()

    # Update member prize status
    member.is_prized = True
    member.prized_installment_no = auction.auction_no
    member.prized_amount = dist["net_prize_amount"]

    # Increment group installment
    auction.group.current_installment += 1
    auction.group.next_auction_date = datetime.utcnow() + timedelta(days=30)

    # Create next installment schedule record with calculated dividend
    next_inst = ChitInstallment(
        group_id=auction.group_id,
        installment_no=auction.auction_no + 1,
        due_date=date.today() + timedelta(days=30),
        gross_subscription=dist["gross_monthly_installment"],
        dividend_earned=dist["dividend_per_member"],
        net_payable=dist["net_monthly_payable"],
        status="OPEN",
        auction_id=auction.id
    )
    db.add(next_inst)

    # Create prize distribution record
    prize_dist = ChitPrizeDistribution(
        auction_id=auction.id,
        group_id=auction.group_id,
        member_id=member.id,
        gross_chit_value=auction.chit_value,
        winning_bid_discount=conduct_in.winning_bid_discount,
        foreman_commission=dist["foreman_commission"],
        net_disbursed_amount=dist["net_prize_amount"],
        surety_status=PrizeDisbursementStatus.PENDING_SURETY
    )
    db.add(prize_dist)

    # Notify winning member
    notif = Notification(
        user_id=member.user_id,
        title="Congratulations! You Won the Chit Auction",
        message=f"You won Auction #{auction.auction_no} for Group {auction.group.group_code}. Net Prize Amount: ₹{dist['net_prize_amount']:,.2f}. Please submit surety documents for disbursement.",
        category="CHIT",
        action_url="/customer/chits"
    )
    db.add(notif)

    # Notify all other group members of dividend earned
    other_members = db.query(ChitMember).filter(
        ChitMember.group_id == auction.group_id,
        ChitMember.id != member.id
    ).all()
    for om in other_members:
        om.total_dividend_earned += dist["dividend_per_member"]
        d_notif = Notification(
            user_id=om.user_id,
            title=f"Dividend Credited: ₹{dist['dividend_per_member']:,.2f}",
            message=f"Auction #{auction.auction_no} completed. Your dividend of ₹{dist['dividend_per_member']:,.2f} has been adjusted against next month's installment.",
            category="CHIT",
            action_url="/customer/chits"
        )
        db.add(d_notif)

    db.commit()
    db.refresh(auction)
    return auction

@router.get("/my-memberships")
def get_my_chit_memberships(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    memberships = db.query(ChitMember).filter(ChitMember.user_id == current_user.id).all()
    out = []
    for m in memberships:
        out.append({
            "membership_id": m.id,
            "ticket_number": m.ticket_number,
            "group_id": m.group_id,
            "group_code": m.group.group_code,
            "group_name": m.group.group_name,
            "chit_value": float(m.group.plan.chit_value),
            "monthly_subscription": float(m.group.plan.monthly_subscription),
            "duration_months": m.group.plan.duration_months,
            "current_installment": m.group.current_installment,
            "is_prized": m.is_prized,
            "prized_amount": float(m.prized_amount),
            "total_paid": float(m.total_subscription_paid),
            "total_dividend_earned": float(m.total_dividend_earned),
            "next_auction_date": m.group.next_auction_date.isoformat() if m.group.next_auction_date else None,
            "status": m.status.value
        })
    return out


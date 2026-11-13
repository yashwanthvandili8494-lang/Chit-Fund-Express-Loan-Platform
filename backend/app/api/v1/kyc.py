from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Optional

from app.core.database import get_db
from app.core.security import mask_aadhaar, mask_pan
from app.models.models import (
    User, UserRole, KYCRecord, KYCStatus, KYCVerificationLog,
    CustomerProfile, AuditLog, Notification
)
from app.schemas.schemas import KYCSubmit, KYCReviewAction, KYCRecordOut
from app.api.deps import get_current_user, require_staff_or_admin

router = APIRouter(prefix="/kyc", tags=["KYC Management"])

@router.get("/status", response_model=KYCRecordOut)
def get_my_kyc(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    kyc = db.query(KYCRecord).filter(KYCRecord.user_id == current_user.id).first()
    if not kyc:
        kyc = KYCRecord(user_id=current_user.id, status=KYCStatus.NOT_SUBMITTED)
        db.add(kyc)
        db.commit()
        db.refresh(kyc)
    return kyc

@router.post("/submit", response_model=KYCRecordOut)
def submit_kyc(
    kyc_data: KYCSubmit,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    kyc = db.query(KYCRecord).filter(KYCRecord.user_id == current_user.id).first()
    if not kyc:
        kyc = KYCRecord(user_id=current_user.id)
        db.add(kyc)

    # UIDAI & Income Tax compliant masking
    masked_aadhaar = mask_aadhaar(kyc_data.aadhaar_number)
    masked_pan = mask_pan(kyc_data.pan_number)

    kyc.aadhaar_masked = masked_aadhaar
    kyc.aadhaar_ref_token = f"UIDAI-TOKEN-{abs(hash(kyc_data.aadhaar_number)) % 1000000000:09d}"
    kyc.aadhaar_verified = True # Authorized UIDAI demographic simulation
    kyc.pan_number_masked = masked_pan
    kyc.pan_verified = True # Authorized NSDL / UTIITSL sandbox simulation
    kyc.pan_name_matched = True
    kyc.id_proof_type = kyc_data.id_proof_type
    kyc.id_proof_url = kyc_data.id_proof_url
    kyc.address_proof_type = kyc_data.address_proof_type
    kyc.address_proof_url = kyc_data.address_proof_url
    kyc.selfie_url = kyc_data.selfie_url
    kyc.status = KYCStatus.SUBMITTED
    kyc.updated_at = datetime.utcnow()

    # Update or create customer profile
    profile = db.query(CustomerProfile).filter(CustomerProfile.user_id == current_user.id).first()
    if not profile:
        profile = CustomerProfile(user_id=current_user.id)
        db.add(profile)
    
    if kyc_data.dob:
        profile.dob = kyc_data.dob
    profile.gender = kyc_data.gender
    profile.address_line1 = kyc_data.address_line1
    profile.address_line2 = kyc_data.address_line2
    profile.city = kyc_data.city
    profile.state = kyc_data.state
    profile.postal_code = kyc_data.postal_code
    profile.occupation = kyc_data.occupation
    profile.monthly_income = kyc_data.monthly_income

    # Log action
    log = KYCVerificationLog(
        kyc_id=kyc.id if kyc.id else 1,
        performed_by_id=current_user.id,
        previous_status=KYCStatus.NOT_SUBMITTED.value,
        new_status=KYCStatus.SUBMITTED.value,
        notes="Customer submitted demographic & document details for e-KYC review"
    )
    db.add(log)

    # Customer notification
    notif = Notification(
        user_id=current_user.id,
        title="KYC Documents Submitted",
        message="Your KYC documents have been submitted and are under review by our compliance team.",
        category="KYC",
        action_url="/customer/kyc"
    )
    db.add(notif)
    
    db.commit()
    db.refresh(kyc)
    return kyc

@router.get("/list", response_model=List[KYCRecordOut])
def list_all_kyc_records(
    status_filter: Optional[KYCStatus] = None,
    current_user: User = Depends(require_staff_or_admin),
    db: Session = Depends(get_db)
):
    query = db.query(KYCRecord).join(User, KYCRecord.user_id == User.id)
    if status_filter:
        query = query.filter(KYCRecord.status == status_filter)
    return query.order_by(KYCRecord.updated_at.desc()).all()

@router.post("/{kyc_id}/review", response_model=KYCRecordOut)
def review_kyc(
    kyc_id: int,
    action: KYCReviewAction,
    current_user: User = Depends(require_staff_or_admin),
    db: Session = Depends(get_db)
):
    kyc = db.query(KYCRecord).filter(KYCRecord.id == kyc_id).first()
    if not kyc:
        raise HTTPException(status_code=404, detail="KYC record not found")

    prev_status = kyc.status.value
    kyc.status = action.status
    kyc.verified_by_user_id = current_user.id
    kyc.updated_at = datetime.utcnow()

    if action.status == KYCStatus.VERIFIED:
        kyc.verified_at = datetime.utcnow()
        kyc.rejection_reason = None
        # Mark user as verified
        kyc.user.is_verified = True
        notif_msg = "Congratulations! Your KYC profile has been verified. You can now enroll in Chit Schemes and apply for Quick Loans."
    else:
        kyc.rejection_reason = action.rejection_reason or "Document quality or mismatch issue"
        notif_msg = f"Your KYC status is now {action.status.value}. Reason: {kyc.rejection_reason}"

    # Log to KYC audit trail
    log = KYCVerificationLog(
        kyc_id=kyc.id,
        performed_by_id=current_user.id,
        previous_status=prev_status,
        new_status=action.status.value,
        notes=action.notes or f"Action performed by {current_user.role.value}: {current_user.full_name}"
    )
    db.add(log)

    # General audit trail
    audit = AuditLog(
        user_id=current_user.id,
        user_role=current_user.role.value,
        action=f"KYC_{action.status.value}",
        module="KYC",
        entity_id=str(kyc.id),
        details=f"KYC for customer {kyc.user.full_name} set to {action.status.value}"
    )
    db.add(audit)

    # User notification
    notif = Notification(
        user_id=kyc.user_id,
        title=f"KYC Verification Update: {action.status.value}",
        message=notif_msg,
        category="KYC",
        action_url="/customer/kyc"
    )
    db.add(notif)

    db.commit()
    db.refresh(kyc)
    return kyc


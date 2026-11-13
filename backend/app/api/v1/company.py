from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from decimal import Decimal

from app.core.database import get_db
from app.models.models import User, UserRole, StaffProfile, CompanySetting, AuditLog, Notification
from app.schemas.schemas import UserOut
from app.api.deps import get_current_user, require_admin, require_staff_or_admin

router = APIRouter(prefix="/company", tags=["Company & Staff Management"])

class CompanySettingsUpdate(BaseModel):
    company_name: str
    cin_number: str
    chit_registrar_license_no: str
    money_lending_license_no: str
    registered_office_address: str
    support_email: str
    support_phone: str
    gstin: str
    foreman_commission_standard_pct: Decimal = Decimal('5.00')
    max_chit_discount_pct: Decimal = Decimal('40.00')
    default_loan_apr_pct: Decimal = Decimal('14.50')

class CreateStaffRequest(BaseModel):
    full_name: str
    email: str
    mobile_number: str
    password: str
    department: str = "Operations"
    designation: str = "Relationship Officer"
    branch: str = "Bengaluru Main Branch"
    can_verify_kyc: bool = True
    can_collect_payments: bool = True
    can_review_applications: bool = True

@router.get("/settings")
def get_company_settings(db: Session = Depends(get_db)):
    setting = db.query(CompanySetting).first()
    if not setting:
        setting = CompanySetting()
        db.add(setting)
        db.commit()
        db.refresh(setting)
    return setting

@router.put("/settings")
def update_company_settings(
    settings_in: CompanySettingsUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    setting = db.query(CompanySetting).first()
    if not setting:
        setting = CompanySetting()
        db.add(setting)

    setting.company_name = settings_in.company_name
    setting.cin_number = settings_in.cin_number
    setting.chit_registrar_license_no = settings_in.chit_registrar_license_no
    setting.money_lending_license_no = settings_in.money_lending_license_no
    setting.registered_office_address = settings_in.registered_office_address
    setting.support_email = settings_in.support_email
    setting.support_phone = settings_in.support_phone
    setting.gstin = settings_in.gstin
    setting.foreman_commission_standard_pct = settings_in.foreman_commission_standard_pct
    setting.max_chit_discount_pct = settings_in.max_chit_discount_pct
    setting.default_loan_apr_pct = settings_in.default_loan_apr_pct

    audit = AuditLog(
        user_id=current_user.id,
        user_role=current_user.role.value,
        action="UPDATE_COMPANY_SETTINGS",
        module="COMPANY",
        details="Owner updated statutory company regulatory settings and license details"
    )
    db.add(audit)

    db.commit()
    db.refresh(setting)
    return setting

@router.get("/staff")
def list_staff_members(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    staff_users = db.query(User).filter(User.role == UserRole.STAFF).all()
    results = []
    for s in staff_users:
        prof = s.staff_profile
        results.append({
            "id": s.id,
            "full_name": s.full_name,
            "email": s.email,
            "mobile_number": s.mobile_number,
            "employee_code": prof.employee_code if prof else f"EMP{s.id:04d}",
            "department": prof.department if prof else "General",
            "designation": prof.designation if prof else "Staff",
            "branch": prof.branch if prof else "Bengaluru Main",
            "is_active": s.is_active,
            "can_verify_kyc": prof.can_verify_kyc if prof else True,
            "can_collect_payments": prof.can_collect_payments if prof else True,
            "can_review_applications": prof.can_review_applications if prof else True
        })
    return results

@router.get("/customers")
def list_all_customers(
    current_user: User = Depends(require_staff_or_admin),
    db: Session = Depends(get_db)
):
    customers = db.query(User).filter(User.role == UserRole.CUSTOMER).order_by(User.created_at.desc()).all()
    out = []
    for c in customers:
        kyc_status = c.kyc_record.status.value if c.kyc_record else "NOT_SUBMITTED"
        pan = c.kyc_record.pan_number_masked if c.kyc_record else "Not provided"
        aadhaar = c.kyc_record.aadhaar_masked if c.kyc_record else "Not provided"
        out.append({
            "id": c.id,
            "full_name": c.full_name,
            "email": c.email,
            "mobile_number": c.mobile_number,
            "kyc_status": kyc_status,
            "aadhaar_masked": aadhaar,
            "pan_masked": pan,
            "is_active": c.is_active,
            "is_verified": c.is_verified,
            "joined_date": c.created_at.strftime("%d %b %Y")
        })
    return out

@router.get("/audit-logs")
def list_audit_logs(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(100).all()
    results = []
    for l in logs:
        results.append({
            "id": l.id,
            "user_id": l.user_id,
            "user_name": l.user.full_name if l.user else "System",
            "user_role": l.user_role or "SYSTEM",
            "action": l.action,
            "module": l.module,
            "entity_id": l.entity_id,
            "details": l.details,
            "ip_address": l.ip_address,
            "created_at": l.created_at.strftime("%d %b %Y, %I:%M:%S %p")
        })
    return results


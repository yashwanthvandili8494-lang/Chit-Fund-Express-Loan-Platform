from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.core.database import get_db
from app.api.deps import require_admin, require_staff_or_admin, get_current_user
from app.models.models import User, Employee, LeaveApplication, LeaveStatus, AuditLog
from app.schemas.schemas import LeaveApplicationOut, LeaveApplyRequest, LeaveReviewRequest

router = APIRouter(prefix="/leaves", tags=["Leave Management"])

# Staff: Apply for Leave
@router.post("/apply", response_model=LeaveApplicationOut)
def apply_leave(
    req: LeaveApplyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    employee = db.query(Employee).filter(Employee.user_id == current_user.id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee record not found")

    if req.end_date < req.start_date:
        raise HTTPException(status_code=400, detail="End date cannot be earlier than start date")

    days = (req.end_date - req.start_date).days + 1

    leave = LeaveApplication(
        employee_id=employee.id,
        leave_type=req.leave_type,
        start_date=req.start_date,
        end_date=req.end_date,
        total_days=days,
        reason=req.reason,
        status=LeaveStatus.PENDING
    )
    db.add(leave)
    db.commit()
    db.refresh(leave)
    return leave

# Staff: Get My Leaves
@router.get("/my-leaves", response_model=List[LeaveApplicationOut])
def get_my_leaves(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    employee = db.query(Employee).filter(Employee.user_id == current_user.id).first()
    if not employee:
        return []
    return db.query(LeaveApplication).filter(LeaveApplication.employee_id == employee.id).order_by(LeaveApplication.created_at.desc()).all()

# Admin: Get All Leaves
@router.get("/all", response_model=List[LeaveApplicationOut])
def get_all_leaves(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    return db.query(LeaveApplication).order_by(LeaveApplication.created_at.desc()).all()

# Admin: Approve / Reject Leave
@router.post("/{leave_id}/review", response_model=LeaveApplicationOut)
def review_leave(
    leave_id: int,
    req: LeaveReviewRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    leave = db.query(LeaveApplication).filter(LeaveApplication.id == leave_id).first()
    if not leave:
        raise HTTPException(status_code=404, detail="Leave application not found")

    leave.status = req.status
    leave.reviewed_by_id = admin.id
    leave.reviewed_at = datetime.utcnow()
    leave.review_notes = req.review_notes

    # Audit log
    audit = AuditLog(
        user_id=admin.id,
        user_role="ADMIN",
        action="REVIEW_LEAVE",
        module="LEAVES",
        entity_id=str(leave_id),
        details=f"Leave {req.status.value} for employee ID {leave.employee_id}. Notes: {req.review_notes}"
    )
    db.add(audit)
    db.commit()
    db.refresh(leave)
    return leave

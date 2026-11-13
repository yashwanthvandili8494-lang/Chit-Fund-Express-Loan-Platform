from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, date
from decimal import Decimal

from app.core.database import get_db
from app.api.deps import require_admin, require_staff_or_admin, get_current_user
from app.models.models import User, Employee, Attendance, AttendanceStatus
from app.schemas.schemas import AttendanceOut, AttendanceCheckIn

router = APIRouter(prefix="/attendance", tags=["Attendance Management"])

# Employee Check-In
@router.post("/check-in", response_model=AttendanceOut)
def check_in(
    req: AttendanceCheckIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    employee = db.query(Employee).filter(Employee.user_id == current_user.id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee record not linked to current user")

    today = date.today()
    existing = db.query(Attendance).filter(
        Attendance.employee_id == employee.id,
        Attendance.attendance_date == today
    ).first()

    now = datetime.utcnow()
    late_minutes = 0
    # Office starts at 9:30 AM (9*60 + 30 = 570 mins)
    cur_mins = now.hour * 60 + now.minute
    if cur_mins > 570:
        late_minutes = min(cur_mins - 570, 180)

    status_val = AttendanceStatus.LATE if late_minutes > 15 else AttendanceStatus.PRESENT

    if existing:
        if existing.check_in_time:
            raise HTTPException(status_code=400, detail="Already checked in for today")
        existing.check_in_time = now
        existing.status = status_val
        existing.late_minutes = late_minutes
        if req.notes:
            existing.notes = req.notes
        db.commit()
        db.refresh(existing)
        return existing

    record = Attendance(
        employee_id=employee.id,
        attendance_date=today,
        check_in_time=now,
        status=status_val,
        late_minutes=late_minutes,
        work_hours=Decimal('8.50'),
        notes=req.notes
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record

# Employee Check-Out
@router.post("/check-out", response_model=AttendanceOut)
def check_out(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    employee = db.query(Employee).filter(Employee.user_id == current_user.id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee record not found")

    today = date.today()
    record = db.query(Attendance).filter(
        Attendance.employee_id == employee.id,
        Attendance.attendance_date == today
    ).first()

    if not record or not record.check_in_time:
        raise HTTPException(status_code=400, detail="Cannot check out without checking in first")

    now = datetime.utcnow()
    record.check_out_time = now
    
    # Calculate work hours
    duration_hours = (now - record.check_in_time).total_seconds() / 3600.0
    record.work_hours = Decimal(f"{duration_hours:.2f}")

    db.commit()
    db.refresh(record)
    return record

# Get Current Staff Attendance Log (Own Only)
@router.get("/my-attendance", response_model=List[AttendanceOut])
def get_my_attendance(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    employee = db.query(Employee).filter(Employee.user_id == current_user.id).first()
    if not employee:
        return []
    return db.query(Attendance).filter(Attendance.employee_id == employee.id).order_by(Attendance.attendance_date.desc()).all()

# Admin: Get All Attendance Records (Filtered by Date)
@router.get("/all", response_model=List[AttendanceOut])
def get_all_attendance(
    attendance_date: Optional[date] = None,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    query = db.query(Attendance)
    if attendance_date:
        query = query.filter(Attendance.attendance_date == attendance_date)
    return query.order_by(Attendance.attendance_date.desc()).all()

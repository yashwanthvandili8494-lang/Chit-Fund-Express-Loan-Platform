from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, date
from decimal import Decimal
import calendar

from app.core.database import get_db
from app.api.deps import require_admin, require_staff_or_admin, get_current_user
from app.models.models import (
    User, Employee, SalaryStructure, Payroll, SalarySlip, PayrollStatus, AuditLog
)
from app.schemas.schemas import (
    PayrollOut, PayrollRunRequest, SalarySlipOut, SalaryStructureOut
)
from app.services.hrms_engine import HRMSEngine

router = APIRouter(prefix="/payroll", tags=["Payroll & Salary Management"])

# Admin: Execute Monthly Payroll Run
@router.post("/run", response_model=List[PayrollOut])
def execute_monthly_payroll(
    req: PayrollRunRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    employees = db.query(Employee).filter(Employee.employment_status == "ACTIVE").all()
    if not employees:
        raise HTTPException(status_code=400, detail="No active employees found to process payroll")

    batch_no = f"PAY-{req.year}{req.month:02d}"
    days_in_month = calendar.monthrange(req.year, req.month)[1]
    month_name = calendar.month_name[req.month]
    month_year_str = f"{month_name} {req.year}"

    processed_payroll_list = []

    for emp in employees:
        # Check if already processed
        existing = db.query(Payroll).filter(
            Payroll.employee_id == emp.id,
            Payroll.month == req.month,
            Payroll.year == req.year
        ).first()

        if existing:
            processed_payroll_list.append(existing)
            continue

        struct = emp.salary_structure
        if not struct:
            # Create default structure if not present
            basic = Decimal('25000.00')
            hra = Decimal('10000.00')
            allowances = Decimal('5000.00')
        else:
            basic = struct.basic_salary
            hra = struct.hra
            allowances = struct.special_allowances

        # Calculate attendance-adjusted earnings and statutory deductions
        # Assume full attendance or 2 days leave default for realistic run
        calc = HRMSEngine.calculate_monthly_payroll(
            basic=basic,
            hra=hra,
            allowances=allowances,
            total_working_days=days_in_month,
            days_present=days_in_month - 1, # 1 day leave
            bonuses=req.bonus_incentives
        )

        payroll_entry = Payroll(
            payroll_batch_no=batch_no,
            employee_id=emp.id,
            month=req.month,
            year=req.year,
            total_working_days=days_in_month,
            days_present=calc["days_present"],
            days_absent=calc["days_absent"],
            earned_basic=calc["earned_basic"],
            earned_hra=calc["earned_hra"],
            earned_allowances=calc["earned_allowances"],
            bonus_incentives=calc["bonuses"],
            gross_earned=calc["gross_earned"],
            deduction_pf=calc["deduction_pf"],
            deduction_esi=calc["deduction_esi"],
            deduction_pt=calc["deduction_pt"],
            deduction_tds=calc["deduction_tds"],
            advance_deduction=calc["advance_deduction"],
            total_deductions=calc["total_deductions"],
            net_pay=calc["net_pay"],
            payment_status=PayrollStatus.PAID,
            payment_reference=f"NEFT{req.year}{req.month:02d}{emp.id:04d}",
            paid_at=datetime.utcnow()
        )
        db.add(payroll_entry)
        db.flush()

        # Generate official Salary Slip
        payslip_no = f"SLIP-{req.year}{req.month:02d}-{emp.employee_id}"
        earnings = {
            "Basic Salary": float(calc["earned_basic"]),
            "House Rent Allowance (HRA)": float(calc["earned_hra"]),
            "Special Allowances": float(calc["earned_allowances"]),
            "Bonuses / Incentives": float(calc["bonuses"])
        }
        deductions = {
            "Provident Fund (EPF 12%)": float(calc["deduction_pf"]),
            "Employee State Insurance (ESI)": float(calc["deduction_esi"]),
            "Professional Tax (PT Karnataka)": float(calc["deduction_pt"]),
            "Income Tax (TDS)": float(calc["deduction_tds"])
        }

        salary_slip = SalarySlip(
            payslip_number=payslip_no,
            payroll_id=payroll_entry.id,
            employee_name=emp.full_name,
            employee_code=emp.employee_id,
            designation=emp.designation,
            department=emp.department,
            month_year=month_year_str,
            bank_account_masked=emp.bank_account_masked,
            uan_epfo=emp.uan_epfo_masked,
            pan_masked=emp.pan_masked,
            earnings_breakdown=earnings,
            deductions_breakdown=deductions,
            gross_earnings=calc["gross_earned"],
            total_deductions=calc["total_deductions"],
            net_pay_in_words=calc["net_pay_in_words"],
            net_pay=calc["net_pay"]
        )
        db.add(salary_slip)
        processed_payroll_list.append(payroll_entry)

    # Audit Log
    audit = AuditLog(
        user_id=admin.id,
        user_role="ADMIN",
        action="RUN_PAYROLL",
        module="PAYROLL",
        entity_id=batch_no,
        details=f"Processed payroll batch {batch_no} for {len(processed_payroll_list)} employees"
    )
    db.add(audit)
    db.commit()

    return processed_payroll_list

# Admin: Get All Payroll Records
@router.get("/all", response_model=List[PayrollOut])
def get_all_payroll(
    month: Optional[int] = None,
    year: Optional[int] = None,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    query = db.query(Payroll)
    if month:
        query = query.filter(Payroll.month == month)
    if year:
        query = query.filter(Payroll.year == year)
    return query.order_by(Payroll.year.desc(), Payroll.month.desc()).all()

# Staff: Get My Salary Slips (Strict Privacy: Own Only)
@router.get("/my-slips", response_model=List[SalarySlipOut])
def get_my_salary_slips(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    employee = db.query(Employee).filter(Employee.user_id == current_user.id).first()
    if not employee:
        return []

    payrolls = db.query(Payroll).filter(Payroll.employee_id == employee.id).all()
    payroll_ids = [p.id for p in payrolls]
    return db.query(SalarySlip).filter(SalarySlip.payroll_id.in_(payroll_ids)).order_by(SalarySlip.generated_at.desc()).all()

# Get Payslip by Slip Number or ID
@router.get("/slips/{slip_id}", response_model=SalarySlipOut)
def get_salary_slip_by_id(
    slip_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    slip = db.query(SalarySlip).filter(SalarySlip.id == slip_id).first()
    if not slip:
        raise HTTPException(status_code=404, detail="Salary slip not found")

    # If not admin, ensure slip belongs to current employee
    if current_user.role != "ADMIN":
        employee = db.query(Employee).filter(Employee.user_id == current_user.id).first()
        if not employee or slip.payroll.employee_id != employee.id:
            raise HTTPException(status_code=403, detail="Access denied to private salary slip")

    return slip

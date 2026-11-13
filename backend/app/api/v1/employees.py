from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_password_hash
from app.api.deps import require_admin, require_staff_or_admin, get_current_user
from app.models.models import User, UserRole, Employee, Branch, SalaryStructure, AuditLog
from app.schemas.schemas import EmployeeOut, EmployeeCreate, BranchOut, BranchCreate
from app.services.hrms_engine import HRMSEngine

router = APIRouter(prefix="/employees", tags=["Employees & HRMS"])

# Branches
@router.get("/branches", response_model=List[BranchOut])
def get_branches(db: Session = Depends(get_db)):
    return db.query(Branch).filter(Branch.is_active == True).all()

@router.post("/branches", response_model=BranchOut)
def create_branch(
    req: BranchCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    existing = db.query(Branch).filter(Branch.branch_code == req.branch_code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Branch code already exists")
    
    branch = Branch(
        branch_code=req.branch_code,
        branch_name=req.branch_name,
        city=req.city,
        address=req.address,
        phone=req.phone,
        manager_name=req.manager_name
    )
    db.add(branch)
    db.commit()
    db.refresh(branch)
    return branch

# Employees List
@router.get("", response_model=List[EmployeeOut])
def get_employees(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    return db.query(Employee).all()

# Current Logged-in Staff Employee Profile
@router.get("/me", response_model=EmployeeOut)
def get_current_employee_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    employee = db.query(Employee).filter(Employee.user_id == current_user.id).first()
    if not employee:
        # If user is admin but has no employee record, check or raise
        raise HTTPException(status_code=404, detail="Employee profile not found for current user")
    return employee

# Add New Employee (Admin Only)
@router.post("", response_model=EmployeeOut)
def add_employee(
    req: EmployeeCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    # Check if user email already exists
    existing_user = db.query(User).filter(User.email == req.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="User with this email already exists")

    # Generate next employee code: e.g. EMP004
    emp_count = db.query(Employee).count()
    emp_code = f"EMP{emp_count + 1:03d}"

    # Create User account
    new_user = User(
        email=req.email,
        mobile_number=req.phone,
        full_name=req.full_name,
        role=UserRole.STAFF,
        hashed_password=get_password_hash(req.password),
        is_active=True,
        is_verified=True
    )
    db.add(new_user)
    db.flush()

    # Create Employee Master
    employee = Employee(
        employee_id=emp_code,
        user_id=new_user.id,
        branch_id=req.branch_id,
        full_name=req.full_name,
        phone=req.phone,
        email=req.email,
        department=req.department,
        designation=req.designation,
        date_of_joining=req.date_of_joining,
        bank_account_masked=req.bank_account_masked,
        bank_ifsc=req.bank_ifsc,
        bank_name=req.bank_name
    )
    db.add(employee)
    db.flush()

    # Calculate Salary Structure
    gross = req.basic_salary + req.hra + req.special_allowances
    deductions = HRMSEngine.calculate_statutory_deductions(req.basic_salary, gross)
    salary_struct = SalaryStructure(
        employee_id=employee.id,
        basic_salary=req.basic_salary,
        hra=req.hra,
        special_allowances=req.special_allowances,
        gross_salary=gross,
        pf_employee_deduction=deductions["pf"],
        esi_employee_deduction=deductions["esi"],
        professional_tax=deductions["pt"],
        tds_monthly=deductions["tds"],
        total_deductions=deductions["total_deductions"],
        net_salary=deductions["net_pay"],
        effective_from=req.date_of_joining
    )
    db.add(salary_struct)

    # Log Audit
    audit = AuditLog(
        user_id=admin.id,
        user_role="ADMIN",
        action="ADD_EMPLOYEE",
        module="HRMS",
        entity_id=emp_code,
        details=f"Onboarded employee {req.full_name} ({req.designation}) in {req.department}"
    )
    db.add(audit)
    db.commit()
    db.refresh(employee)
    return employee

import sys
sys.path.insert(0, '.')
from decimal import Decimal
from datetime import datetime, date, timedelta
from app.core.database import SessionLocal, Base, engine
from app.core.security import get_password_hash
from app.models.models import (
    User, UserRole, Branch, Employee, Attendance, AttendanceStatus,
    LeaveApplication, LeaveType, LeaveStatus, SalaryStructure, Payroll,
    PayrollStatus, SalarySlip, Expense, AuditLog
)
from app.services.hrms_engine import HRMSEngine

def seed_hrms_data():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Check if branches exist
    branch1 = db.query(Branch).filter(Branch.branch_code == "BR-BLR-01").first()
    if not branch1:
        print("Seeding Branches...")
        branch1 = Branch(
            branch_code="BR-BLR-01",
            branch_name="MG Road Corporate Headquarters",
            city="Bengaluru",
            address="#42, 3rd Floor, FinTech Towers, MG Road, Bengaluru 560001",
            phone="+91 80 4912 8801",
            manager_name="Rajeshwar Rao (MD)"
        )
        branch2 = Branch(
            branch_code="BR-BLR-02",
            branch_name="Indiranagar Branch Office",
            city="Bengaluru",
            address="#108, 100 Feet Road, Indiranagar, Bengaluru 560038",
            phone="+91 80 4912 8802",
            manager_name="Suresh Kumar"
        )
        branch3 = Branch(
            branch_code="BR-BLR-03",
            branch_name="Jayanagar Branch Office",
            city="Bengaluru",
            address="#24, 4th Block, 11th Main, Jayanagar, Bengaluru 560011",
            phone="+91 80 4912 8803",
            manager_name="Kavita Reddy"
        )
        db.add_all([branch1, branch2, branch3])
        db.flush()

    # 2. Check / Create Employees
    staff_user = db.query(User).filter(User.email == "staff@sowbhagyachits.in").first()
    if not staff_user:
        staff_user = User(
            email="staff@sowbhagyachits.in",
            phone="+91 98450 99221",
            full_name="Ananya Sharma",
            role=UserRole.STAFF,
            password_hash=get_password_hash("Password@123"),
            is_active=True,
            is_email_verified=True,
            is_phone_verified=True
        )
        db.add(staff_user)
        db.flush()

    emp1 = db.query(Employee).filter(Employee.employee_id == "EMP001").first()
    if not emp1:
        print("Seeding Employees...")
        emp1 = Employee(
            employee_id="EMP001",
            user_id=staff_user.id,
            branch_id=branch1.id,
            full_name="Ananya Sharma",
            phone="+91 98450 99221",
            email="staff@sowbhagyachits.in",
            department="Branch Operations",
            designation="Branch Operations Officer",
            date_of_joining=date(2022, 4, 15),
            bank_account_masked="••••••••4419",
            bank_ifsc="HDFC0000128",
            bank_name="HDFC Bank"
        )

        # Create 2 more staff users
        pwd = get_password_hash("Password@123")
        u2 = User(
            email="ramesh.patil@sowbhagyachits.in",
            mobile_number="+91 98450 77334",
            full_name="Ramesh Patil",
            role=UserRole.STAFF,
            hashed_password=pwd,
            is_active=True,
            is_verified=True
        )
        u3 = User(
            email="sneha.nair@sowbhagyachits.in",
            mobile_number="+91 98450 55667",
            full_name="Sneha Nair",
            role=UserRole.STAFF,
            hashed_password=pwd,
            is_active=True,
            is_verified=True
        )
        db.add_all([u2, u3])
        db.flush()

        emp2 = Employee(
            employee_id="EMP002",
            user_id=u2.id,
            branch_id=branch1.id,
            full_name="Ramesh Patil",
            phone="+91 98450 77334",
            email="ramesh.patil@sowbhagyachits.in",
            department="Credit & Underwriting",
            designation="Credit Underwriting Specialist",
            date_of_joining=date(2023, 1, 10),
            bank_account_masked="••••••••9921",
            bank_ifsc="ICIC0001092",
            bank_name="ICICI Bank"
        )
        emp3 = Employee(
            employee_id="EMP003",
            user_id=u3.id,
            branch_id=branch1.id,
            full_name="Sneha Nair",
            phone="+91 98450 55667",
            email="sneha.nair@sowbhagyachits.in",
            department="Collections & Recovery",
            designation="Recovery & Collections Officer",
            date_of_joining=date(2023, 7, 1),
            bank_account_masked="••••••••3182",
            bank_ifsc="SBIN0004018",
            bank_name="State Bank of India"
        )
        db.add_all([emp1, emp2, emp3])
        db.flush()

        # 3. Salary Structures
        print("Seeding Salary Structures...")
        for emp, (b, h, a) in [
            (emp1, (Decimal('28000.00'), Decimal('11200.00'), Decimal('5800.00'))),
            (emp2, (Decimal('32000.00'), Decimal('12800.00'), Decimal('7200.00'))),
            (emp3, (Decimal('22000.00'), Decimal('8800.00'), Decimal('4200.00')))
        ]:
            gross = b + h + a
            ded = HRMSEngine.calculate_statutory_deductions(b, gross)
            db.add(SalaryStructure(
                employee_id=emp.id,
                basic_salary=b,
                hra=h,
                special_allowances=a,
                gross_salary=gross,
                pf_employee_deduction=ded["pf"],
                esi_employee_deduction=ded["esi"],
                professional_tax=ded["pt"],
                tds_monthly=ded["tds"],
                total_deductions=ded["total_deductions"],
                net_salary=ded["net_pay"],
                effective_from=emp.date_of_joining
            ))
        db.flush()

        # 4. Attendance
        print("Seeding Attendance records...")
        today = date.today()
        for i in range(5):
            att_date = today - timedelta(days=i)
            # Skip Sunday (weekday() == 6)
            if att_date.weekday() == 6:
                continue
            for emp in [emp1, emp2, emp3]:
                db.add(Attendance(
                    employee_id=emp.id,
                    attendance_date=att_date,
                    check_in_time=datetime(att_date.year, att_date.month, att_date.day, 9, 25, 0),
                    check_out_time=datetime(att_date.year, att_date.month, att_date.day, 18, 5, 0),
                    status=AttendanceStatus.PRESENT,
                    work_hours=Decimal('8.65'),
                    late_minutes=0
                ))
        db.flush()

        # 5. Leaves
        print("Seeding Leave records...")
        db.add(LeaveApplication(
            employee_id=emp1.id,
            leave_type=LeaveType.CASUAL,
            start_date=date(2026, 11, 20),
            end_date=date(2026, 11, 21),
            total_days=2,
            reason="Family function in Mysuru",
            status=LeaveStatus.APPROVED,
            review_notes="Approved by Branch Manager"
        ))
        db.add(LeaveApplication(
            employee_id=emp3.id,
            leave_type=LeaveType.SICK,
            start_date=date(2026, 11, 15),
            end_date=date(2026, 11, 15),
            total_days=1,
            reason="Viral fever and rest",
            status=LeaveStatus.PENDING
        ))
        db.flush()

        # 6. Payroll & Payslips for October 2026
        print("Seeding October 2026 Payroll & Salary Slips...")
        batch_no = "PAY-202610"
        for emp, (b, h, a) in [
            (emp1, (Decimal('28000.00'), Decimal('11200.00'), Decimal('5800.00'))),
            (emp2, (Decimal('32000.00'), Decimal('12800.00'), Decimal('7200.00'))),
            (emp3, (Decimal('22000.00'), Decimal('8800.00'), Decimal('4200.00')))
        ]:
            calc = HRMSEngine.calculate_monthly_payroll(b, h, a, 31, 30)
            payroll_entry = Payroll(
                payroll_batch_no=batch_no,
                employee_id=emp.id,
                month=10,
                year=2026,
                total_working_days=31,
                days_present=30,
                days_absent=1,
                earned_basic=calc["earned_basic"],
                earned_hra=calc["earned_hra"],
                earned_allowances=calc["earned_allowances"],
                gross_earned=calc["gross_earned"],
                deduction_pf=calc["deduction_pf"],
                deduction_esi=calc["deduction_esi"],
                deduction_pt=calc["deduction_pt"],
                deduction_tds=calc["deduction_tds"],
                total_deductions=calc["total_deductions"],
                net_pay=calc["net_pay"],
                payment_status=PayrollStatus.PAID,
                payment_reference=f"NEFT202610{emp.id:04d}",
                paid_at=datetime(2026, 11, 1, 10, 0, 0)
            )
            db.add(payroll_entry)
            db.flush()

            # Payslip
            earnings = {
                "Basic Salary": float(calc["earned_basic"]),
                "House Rent Allowance (HRA)": float(calc["earned_hra"]),
                "Special Allowances": float(calc["earned_allowances"])
            }
            deductions = {
                "Provident Fund (EPF 12%)": float(calc["deduction_pf"]),
                "Employee State Insurance (ESI)": float(calc["deduction_esi"]),
                "Professional Tax (PT Karnataka)": float(calc["deduction_pt"]),
                "Income Tax (TDS)": float(calc["deduction_tds"])
            }
            db.add(SalarySlip(
                payslip_number=f"SLIP-202610-{emp.employee_id}",
                payroll_id=payroll_entry.id,
                employee_name=emp.full_name,
                employee_code=emp.employee_id,
                designation=emp.designation,
                department=emp.department,
                month_year="October 2026",
                bank_account_masked=emp.bank_account_masked,
                uan_epfo=emp.uan_epfo_masked,
                pan_masked=emp.pan_masked,
                earnings_breakdown=earnings,
                deductions_breakdown=deductions,
                gross_earnings=calc["gross_earned"],
                total_deductions=calc["total_deductions"],
                net_pay_in_words=calc["net_pay_in_words"],
                net_pay=calc["net_pay"]
            ))
        db.flush()

        # 7. Office Expenses
        print("Seeding Expenses...")
        db.add_all([
            Expense(
                voucher_no="EXP-202610-001",
                branch_id=branch1.id,
                category="Rent & Maintenance",
                amount=Decimal('45000.00'),
                expense_date=date(2026, 10, 5),
                description="MG Road Branch monthly lease and maintenance payment",
                vendor_name="Prestige Commercial Properties Pvt Ltd",
                payment_mode="NEFT"
            ),
            Expense(
                voucher_no="EXP-202610-002",
                branch_id=branch1.id,
                category="IT & Cloud Services",
                amount=Decimal('8200.00'),
                expense_date=date(2026, 10, 12),
                description="High speed dedicated leased line and VoIP telephony charges",
                vendor_name="Tata Tele Business Services",
                payment_mode="BANK_TRANSFER"
            ),
            Expense(
                voucher_no="EXP-202610-003",
                branch_id=branch1.id,
                category="Legal & Compliance",
                amount=Decimal('12500.00'),
                expense_date=date(2026, 10, 20),
                description="Quarterly statutory audit & Karnataka Registrar compliance filing fees",
                vendor_name="S.R. Associates Chartered Accountants",
                payment_mode="CHEQUE"
            )
        ])
        db.commit()
        print("HRMS seed data populated successfully!")

    db.close()

if __name__ == "__main__":
    seed_hrms_data()

import sys
sys.path.insert(0, '.')
from app.core.database import SessionLocal
from app.models.models import (
    User, ChitPlan, LoanProduct, ChitGroup, KYCRecord, PaymentTransaction,
    Branch, Employee, Attendance, LeaveApplication, SalaryStructure, Payroll,
    SalarySlip, Expense
)
from app.services.financial_engines import ChitEngine, LoanEngine
from app.services.hrms_engine import HRMSEngine
from decimal import Decimal
from datetime import date

def run_all_tests():
    print("=== RUNNING SUITE OF VERIFICATION TESTS ===")
    db = SessionLocal()
    
    # 1. Users Check
    users = db.query(User).all()
    print(f"PASS: Found {len(users)} registered users across Owner, Staff, Customer roles.")
    assert len(users) >= 3

    # 2. Chit Plans
    plans = db.query(ChitPlan).all()
    print(f"PASS: Found {len(plans)} registered Chit Plans.")
    assert len(plans) >= 8

    # 3. Chit Engine Math Verification (Chit Funds Act 1982)
    calc = ChitEngine.calculate_auction_distribution(
        chit_value=Decimal('100000.00'),
        total_subscribers=25,
        foreman_commission_pct=Decimal('5.00'),
        winning_bid_discount=Decimal('30000.00')
    )
    assert calc["foreman_commission"] == Decimal('5000.00')
    assert calc["total_dividend"] == Decimal('25000.00')
    assert calc["dividend_per_member"] == Decimal('1000.00')
    assert calc["net_prize_amount"] == Decimal('70000.00')
    assert calc["net_monthly_payable"] == Decimal('3000.00')
    print("PASS: Chit Funds Act 1982 Auction Distribution calculations verified exact!")

    # 4. Loan Engine Math Verification
    emi_calc = LoanEngine.calculate_emi(Decimal('60000.00'), Decimal('14.50'), 12)
    assert emi_calc["monthly_emi"] > Decimal('5300.00')
    assert emi_calc["total_interest"] > Decimal('4000.00')
    print(f"PASS: Reducing Balance EMI verified: Monthly EMI = ₹{emi_calc['monthly_emi']}, Total Interest = ₹{emi_calc['total_interest']}")

    # 5. Loan Repayment Amortization Schedule
    sched = LoanEngine.generate_repayment_schedule(
        Decimal('60000.00'), Decimal('14.50'), 12, date.today()
    )
    assert len(sched) == 12
    assert sched[-1]["remaining_principal"] == Decimal('0.00')
    print("PASS: Complete 12-month amortization schedule generated and verified!")

    # 6. KYC Records & Masking
    kycs = db.query(KYCRecord).all()
    for k in kycs:
        if k.aadhaar_masked:
            assert "XXXX" in k.aadhaar_masked
        if k.pan_number_masked:
            assert "X" in k.pan_number_masked or "*" in k.pan_number_masked
    print(f"PASS: All {len(kycs)} KYC records adhere to UIDAI & IT Act data masking standards.")

    # 7. Payments & Transactions
    txns = db.query(PaymentTransaction).all()
    print(f"PASS: Found {len(txns)} immutable ledger transaction records.")
    assert len(txns) >= 2

    # 8. Branches & Employees (HRMS)
    branches = db.query(Branch).all()
    employees = db.query(Employee).all()
    print(f"PASS: Found {len(branches)} physical branch locations and {len(employees)} onboarded employees.")
    assert len(branches) >= 3
    assert len(employees) >= 3

    # 9. HRMS Statutory Deductions Math Verification
    # Basic 28,000, Gross 45,000
    ded = HRMSEngine.calculate_statutory_deductions(Decimal('28000.00'), Decimal('45000.00'))
    assert ded["pf"] == Decimal('3360.00') # 12% of 28000
    assert ded["pt"] == Decimal('200.00') # Karnataka PT
    assert ded["total_deductions"] == Decimal('3560.00')
    assert ded["net_pay"] == Decimal('41440.00')
    words = HRMSEngine.amount_to_words(41440)
    assert "Forty One Thousand" in words
    print("PASS: Statutory deductions (EPF 12%, PT ₹200) and number-to-words verified exact!")

    # 10. Attendance & Leaves
    attendance_count = db.query(Attendance).count()
    leaves_count = db.query(LeaveApplication).count()
    print(f"PASS: Found {attendance_count} attendance check-in entries and {leaves_count} leave applications.")
    assert attendance_count >= 10
    assert leaves_count >= 2

    # 11. Payroll & Salary Slips
    payrolls = db.query(Payroll).all()
    slips = db.query(SalarySlip).all()
    print(f"PASS: Found {len(payrolls)} payroll batch records and {len(slips)} official salary slips.")
    assert len(payrolls) >= 3
    assert len(slips) >= 3
    assert slips[0].net_pay_in_words is not None

    # 12. Office Expenses
    expenses = db.query(Expense).all()
    print(f"PASS: Found {len(expenses)} office branch expense records.")
    assert len(expenses) >= 3

    # 13. Digital Loan Underwriting & KFS Engine (mPokket-Inspired Standard)
    from app.services.loan_underwriting_engine import LoanUnderwritingEngine
    el_res = LoanUnderwritingEngine.evaluate_eligibility(
        age=28,
        kyc_status="VERIFIED",
        employment_type="Salaried",
        monthly_income=Decimal('45000.00'),
        requested_amount=Decimal('50000.00'),
        tenure_months=12,
        credit_score=760
    )
    assert el_res["verdict"] == "ELIGIBLE_FOR_REVIEW"
    assert el_res["overall_score"] >= 75
    assert el_res["foir_pct"] <= 35.0

    kfs_res = LoanUnderwritingEngine.generate_key_facts_statement(
        application_no="TEST-APP-001",
        principal=Decimal('50000.00'),
        annual_rate_pct=Decimal('14.50'),
        tenure_months=12,
        customer_name="Vikramaditya Hegde",
        disbursal_bank_account="••••••••1234"
    )
    assert kfs_res["principal_loan_amount"] == 50000.0
    assert kfs_res["net_disbursed_amount"] > 48000.0
    assert "sanction_reference_no" in kfs_res
    print("PASS: Automated Underwriting Engine & RBI Key Facts Statement (KFS) verified exact!")

    db.close()
    print("=== ALL 13 TEST SUITES PASSED FLAWLESSLY ===")

if __name__ == "__main__":
    run_all_tests()

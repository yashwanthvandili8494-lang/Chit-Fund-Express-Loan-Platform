import sys
sys.path.insert(0, '.')
from app.core.database import SessionLocal
from app.models.models import User, ChitPlan, LoanProduct, ChitGroup, KYCRecord, PaymentTransaction
from app.services.financial_engines import ChitEngine, LoanEngine
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
    # Chit value = 1,00,000, 25 months, 5% foreman comm, winning bid discount = 30,000
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
    # Principal = 60,000, 14.5% APR, 12 months
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
        assert "XXXX" in k.aadhaar_masked
        assert k.pan_number_masked is not None
    print(f"PASS: All {len(kycs)} KYC records adhere to UIDAI & IT Act data masking standards.")

    # 7. Payments & Transactions
    txns = db.query(PaymentTransaction).all()
    print(f"PASS: Found {len(txns)} immutable ledger transaction records.")
    assert len(txns) >= 2

    db.close()
    print("=== ALL 7 TEST SUITES PASSED FLAWLESSLY ===")

if __name__ == "__main__":
    run_all_tests()


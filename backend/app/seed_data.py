import os
from decimal import Decimal
from datetime import datetime, date, timedelta
from app.core.database import SessionLocal, Base, engine
from app.core.security import get_password_hash, mask_aadhaar, mask_pan, mask_account_number
from app.models.models import (
    User, UserRole, CustomerProfile, StaffProfile, KYCRecord, KYCStatus,
    KYCVerificationLog, ChitPlan, ChitGroup, ChitGroupStatus, ChitApplication,
    ChitAppStatus, ChitMember, ChitMemberStatus, ChitAuction, AuctionStatus,
    ChitBid, ChitInstallment, ChitPrizeDistribution, PrizeDisbursementStatus,
    LoanProduct, LoanApplication, LoanAppStatus, Loan, LoanStatus,
    LoanRepayment, RepaymentStatus, PaymentTransaction, PaymentStatus,
    PaymentType, PaymentMode, CompanySetting, AuditLog, Notification
)
from app.services.financial_engines import ChitEngine, LoanEngine

def seed_all():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Check if already seeded
    existing_owner = db.query(User).filter(User.email == "owner@sowbhagyachits.in").first()
    if existing_owner:
        print("Database already seeded.")
        db.close()
        return

    print("Seeding Indian Chit Fund & Lending Platform database...")

    # 1. Company Setting
    company = CompanySetting(
        company_name="Sowbhagya Chits & FinServe Private Limited",
        cin_number="U65992KA2018PTC112345",
        chit_registrar_license_no="KA/BLR/CHIT/2019/882",
        money_lending_license_no="KA/BLR/MLL/2021/409",
        registered_office_address="#42, 3rd Floor, FinTech Towers, MG Road, Bengaluru, Karnataka 560001",
        support_email="support@sowbhagyachits.in",
        support_phone="+91 80 4912 8800",
        gstin="29ABCDE1234F1Z5",
        foreman_commission_standard_pct=Decimal('5.00'),
        max_chit_discount_pct=Decimal('40.00'),
        default_loan_apr_pct=Decimal('14.50')
    )
    db.add(company)
    db.flush()

    # 2. Users
    pwd_hash = get_password_hash("Password@123")

    # A. Owner / Admin
    owner = User(
        email="owner@sowbhagyachits.in",
        mobile_number="+919880112233",
        full_name="Rajeshwar Rao",
        hashed_password=pwd_hash,
        role=UserRole.ADMIN,
        is_active=True,
        is_verified=True
    )
    db.add(owner)
    db.flush()

    # B. Staff
    staff = User(
        email="staff@sowbhagyachits.in",
        mobile_number="+919880223344",
        full_name="Ananya Sharma",
        hashed_password=pwd_hash,
        role=UserRole.STAFF,
        is_active=True,
        is_verified=True
    )
    db.add(staff)
    db.flush()

    staff_profile = StaffProfile(
        user_id=staff.id,
        employee_code="SO-BLR-0042",
        department="Credit & Chit Operations",
        designation="Senior Branch Officer",
        branch="Bengaluru Central Branch",
        can_verify_kyc=True,
        can_collect_payments=True,
        can_review_applications=True
    )
    db.add(staff_profile)

    # C. Customer 1 (Verified with active chits and loans)
    customer1 = User(
        email="customer@sowbhagyachits.in",
        mobile_number="+919880334455",
        full_name="Vikramaditya Hegde",
        hashed_password=pwd_hash,
        role=UserRole.CUSTOMER,
        is_active=True,
        is_verified=True
    )
    db.add(customer1)
    db.flush()

    cust1_profile = CustomerProfile(
        user_id=customer1.id,
        dob=date(1988, 6, 15),
        gender="Male",
        address_line1="Flat 402, Green Glen Layout, Bellandur",
        city="Bengaluru",
        state="Karnataka",
        postal_code="560103",
        occupation="Software Engineering Lead",
        employer_business_name="Infosys Technologies Ltd",
        monthly_income=Decimal('145000.00'),
        emergency_contact_name="Sunita Hegde",
        emergency_contact_phone="+919880334456"
    )
    db.add(cust1_profile)

    cust1_kyc = KYCRecord(
        user_id=customer1.id,
        status=KYCStatus.VERIFIED,
        aadhaar_masked=mask_aadhaar("987654321234"),
        aadhaar_ref_token="UIDAI-TOKEN-849204123",
        aadhaar_verified=True,
        pan_number_masked=mask_pan("ABCDE1234F"),
        pan_verified=True,
        pan_name_matched=True,
        id_proof_type="Passport",
        id_proof_url="/sample_docs/passport_vikram.pdf",
        address_proof_type="Electricity Bill",
        address_proof_url="/sample_docs/bescom_bill.pdf",
        selfie_url="/sample_docs/selfie_vikram.jpg",
        verified_by_user_id=staff.id,
        verified_at=datetime.utcnow() - timedelta(days=60)
    )
    db.add(cust1_kyc)

    # D. Customer 2 (Submitted KYC awaiting review)
    customer2 = User(
        email="priya.nair@example.com",
        mobile_number="+919880445566",
        full_name="Priya Nair",
        hashed_password=pwd_hash,
        role=UserRole.CUSTOMER,
        is_active=True,
        is_verified=False
    )
    db.add(customer2)
    db.flush()

    cust2_profile = CustomerProfile(
        user_id=customer2.id,
        dob=date(1994, 9, 21),
        gender="Female",
        address_line1="12/A, 5th Cross, Indiranagar",
        city="Bengaluru",
        state="Karnataka",
        postal_code="560038",
        occupation="Digital Marketing Specialist",
        employer_business_name="Freshworks India",
        monthly_income=Decimal('78000.00')
    )
    db.add(cust2_profile)

    cust2_kyc = KYCRecord(
        user_id=customer2.id,
        status=KYCStatus.SUBMITTED,
        aadhaar_masked=mask_aadhaar("554433221199"),
        aadhaar_ref_token="UIDAI-TOKEN-391829304",
        aadhaar_verified=True,
        pan_number_masked=mask_pan("BKPPS9988K"),
        pan_verified=True,
        pan_name_matched=True,
        id_proof_type="Voter ID",
        id_proof_url="/sample_docs/voter_priya.pdf",
        address_proof_type="Rental Agreement",
        address_proof_url="/sample_docs/rent_agreement.pdf",
        selfie_url="/sample_docs/selfie_priya.jpg"
    )
    db.add(cust2_kyc)

    # E. Customer 3 (Verified with pending chit and loan application)
    customer3 = User(
        email="arun.kumar@example.com",
        mobile_number="+919880556677",
        full_name="Arun Kumar",
        hashed_password=pwd_hash,
        role=UserRole.CUSTOMER,
        is_active=True,
        is_verified=True
    )
    db.add(customer3)
    db.flush()

    cust3_profile = CustomerProfile(
        user_id=customer3.id,
        dob=date(1990, 3, 10),
        gender="Male",
        address_line1="#88, 2nd Main, Malleshwaram",
        city="Bengaluru",
        state="Karnataka",
        postal_code="560003",
        occupation="Self-Employed / Retailer",
        employer_business_name="Kumar Electricals & Hardware",
        monthly_income=Decimal('92000.00')
    )
    db.add(cust3_profile)

    cust3_kyc = KYCRecord(
        user_id=customer3.id,
        status=KYCStatus.VERIFIED,
        aadhaar_masked=mask_aadhaar("332211445566"),
        aadhaar_ref_token="UIDAI-TOKEN-771829103",
        aadhaar_verified=True,
        pan_number_masked=mask_pan("CQJPK4432N"),
        pan_verified=True,
        pan_name_matched=True,
        id_proof_type="Driving License",
        id_proof_url="/sample_docs/dl_arun.pdf",
        address_proof_type="Property Tax Receipt",
        address_proof_url="/sample_docs/bbmp_tax.pdf",
        selfie_url="/sample_docs/selfie_arun.jpg",
        verified_by_user_id=owner.id,
        verified_at=datetime.utcnow() - timedelta(days=30)
    )
    db.add(cust3_kyc)

    # 3. Chit Plans (Section 4 illustrative values: ₹50,000 to ₹20,00,000)
    plans_data = [
        {"name": "Sowbhagya Pragati Chit - 50K", "val": 50000, "dur": 20, "sub": 2500, "code": "CP-50K-20M"},
        {"name": "Sowbhagya Samruddhi Chit - 1 Lakh", "val": 100000, "dur": 25, "sub": 4000, "code": "CP-100K-25M"},
        {"name": "Sowbhagya Utkarsh Chit - 2 Lakhs", "val": 200000, "dur": 20, "sub": 10000, "code": "CP-200K-20M"},
        {"name": "Sowbhagya Vikas Chit - 3 Lakhs", "val": 300000, "dur": 25, "sub": 12000, "code": "CP-300K-25M"},
        {"name": "Sowbhagya Sampada Chit - 5 Lakhs", "val": 500000, "dur": 25, "sub": 20000, "code": "CP-500K-25M"},
        {"name": "Sowbhagya Ratna Chit - 10 Lakhs", "val": 1000000, "dur": 40, "sub": 25000, "code": "CP-10L-40M"},
        {"name": "Sowbhagya Vaibhav Chit - 15 Lakhs", "val": 1500000, "dur": 50, "sub": 30000, "code": "CP-15L-50M"},
        {"name": "Sowbhagya Mahasamruddhi Chit - 20 Lakhs", "val": 2000000, "dur": 50, "sub": 40000, "code": "CP-20L-50M"},
    ]

    created_plans = []
    for p in plans_data:
        plan = ChitPlan(
            plan_code=p["code"],
            name=p["name"],
            chit_value=Decimal(str(p["val"])),
            duration_months=p["dur"],
            monthly_subscription=Decimal(str(p["sub"])),
            max_subscribers=p["dur"],
            foreman_commission_pct=Decimal('5.00'),
            max_discount_pct=Decimal('40.00'),
            min_discount_pct=Decimal('5.00'),
            registered_scheme_ref=f"KA/BLR/REG/{p['code']}/2026",
            registration_authority="Registrar of Chits, Bengaluru North, Karnataka",
            terms_conditions="Governed by the Chit Funds Act, 1982 and the Karnataka Chit Funds Rules. 100% Security FD deposited in treasury before commencement.",
            is_active=True
        )
        db.add(plan)
        created_plans.append(plan)
    db.flush()

    # 4. Live Chit Groups
    # Group 1: 1 Lakh Chit (active, in 3rd month)
    plan_100k = created_plans[1]
    group_100k = ChitGroup(
        plan_id=plan_100k.id,
        group_code="SOWBHAGYA-BLR-100K-G01",
        group_name="Sowbhagya Bengaluru 1L Series 01",
        current_installment=3,
        status=ChitGroupStatus.ACTIVE,
        pso_order_number="PSO/BLR/2026/8912",
        commencement_cert_no="CC/BLR/2026/4102",
        bank_fd_ref="CANARA-FD-8891002341",
        bank_fd_amount=Decimal('100000.00'),
        start_date=date.today() - timedelta(days=90),
        end_date=date.today() + timedelta(days=660),
        next_auction_date=datetime.utcnow() + timedelta(days=12)
    )
    db.add(group_100k)

    # Group 2: 5 Lakh Chit (active, 1st month)
    plan_500k = created_plans[4]
    group_500k = ChitGroup(
        plan_id=plan_500k.id,
        group_code="SOWBHAGYA-BLR-500K-G04",
        group_name="Sowbhagya Bengaluru 5L Series 04",
        current_installment=1,
        status=ChitGroupStatus.ACTIVE,
        pso_order_number="PSO/BLR/2026/9044",
        commencement_cert_no="CC/BLR/2026/4890",
        bank_fd_ref="SBI-FD-994810231",
        bank_fd_amount=Decimal('500000.00'),
        start_date=date.today() - timedelta(days=15),
        end_date=date.today() + timedelta(days=735),
        next_auction_date=datetime.utcnow() + timedelta(days=15)
    )
    db.add(group_500k)
    db.flush()

    # 5. Members in Group 100K
    # Customer 1 enrolled as Ticket #1
    member1 = ChitMember(
        group_id=group_100k.id,
        user_id=customer1.id,
        ticket_number=1,
        status=ChitMemberStatus.ACTIVE,
        is_prized=False,
        total_subscription_paid=Decimal('10800.00'),
        total_dividend_earned=Decimal('1200.00'),
        balance_payable=Decimal('0.00')
    )
    db.add(member1)

    # Foreman membership (Statutory Ticket 0/Foreman prized in 1st month without auction)
    foreman_member = ChitMember(
        group_id=group_100k.id,
        user_id=owner.id,
        ticket_number=2,
        status=ChitMemberStatus.ACTIVE,
        is_prized=True,
        prized_installment_no=1,
        prized_amount=Decimal('100000.00'),
        total_subscription_paid=Decimal('12000.00')
    )
    db.add(foreman_member)

    # Member 3 (won auction 2)
    member3 = ChitMember(
        group_id=group_100k.id,
        user_id=customer3.id,
        ticket_number=3,
        status=ChitMemberStatus.ACTIVE,
        is_prized=True,
        prized_installment_no=2,
        prized_amount=Decimal('70000.00'),
        total_subscription_paid=Decimal('10800.00'),
        total_dividend_earned=Decimal('1200.00')
    )
    db.add(member3)
    db.flush()

    # 6. Past Auction 2 in Group 100K
    # Chit value = 1,00,000, Winning bid discount = 30,000 (30%)
    # Foreman comm = 5,000, Total Dividend = 25,000, per member = 1,000
    # Net prize = 70,000
    auction2 = ChitAuction(
        group_id=group_100k.id,
        auction_no=2,
        auction_date=datetime.utcnow() - timedelta(days=30),
        chit_value=Decimal('100000.00'),
        min_bid=Decimal('5000.00'),
        max_bid=Decimal('40000.00'),
        winning_bid_discount=Decimal('30000.00'),
        winning_member_id=member3.id,
        foreman_commission=Decimal('5000.00'),
        total_dividend=Decimal('25000.00'),
        dividend_per_member=Decimal('1000.00'),
        net_prize_amount=Decimal('70000.00'),
        status=AuctionStatus.COMPLETED,
        conducted_by_id=staff.id,
        completed_at=datetime.utcnow() - timedelta(days=30)
    )
    db.add(auction2)

    # Upcoming Auction 3
    auction3 = ChitAuction(
        group_id=group_100k.id,
        auction_no=3,
        auction_date=datetime.utcnow() + timedelta(days=12),
        chit_value=Decimal('100000.00'),
        min_bid=Decimal('5000.00'),
        max_bid=Decimal('40000.00'),
        winning_bid_discount=Decimal('0.00'),
        foreman_commission=Decimal('5000.00'),
        status=AuctionStatus.SCHEDULED
    )
    db.add(auction3)
    db.flush()

    # Installment 3 Schedule
    inst3 = ChitInstallment(
        group_id=group_100k.id,
        installment_no=3,
        due_date=date.today() + timedelta(days=12),
        gross_subscription=Decimal('4000.00'),
        dividend_earned=Decimal('1000.00'),
        net_payable=Decimal('3000.00'),
        status="OPEN",
        auction_id=auction2.id
    )
    db.add(inst3)

    # 7. Chit Applications
    # Customer 1 enrolled application
    app1 = ChitApplication(
        application_no="CHIT-APP-202610-00102",
        user_id=customer1.id,
        plan_id=plan_100k.id,
        group_id=group_100k.id,
        status=ChitAppStatus.ENROLLED,
        nominee_name="Sunita Hegde",
        nominee_relationship="Spouse",
        nominee_phone="+919880334456",
        bank_name="HDFC Bank",
        bank_account_no_masked=mask_account_number("5010023491823"),
        bank_ifsc="HDFC0001234",
        agreement_accepted=True,
        reviewed_by_id=staff.id,
        approved_at=datetime.utcnow() - timedelta(days=70)
    )
    db.add(app1)

    # Customer 3 pending application for 5 Lakh Chit
    app3 = ChitApplication(
        application_no="CHIT-APP-202611-00215",
        user_id=customer3.id,
        plan_id=plan_500k.id,
        status=ChitAppStatus.PENDING,
        nominee_name="Meenakshi Kumar",
        nominee_relationship="Mother",
        nominee_phone="+919880556678",
        bank_name="State Bank of India",
        bank_account_no_masked=mask_account_number("30918274619"),
        bank_ifsc="SBIN0004018",
        agreement_accepted=True
    )
    db.add(app3)

    # 8. Loan Products (Section 5 illustrative amounts: ₹10,000 to ₹1,00,000)
    loan_products_data = [
        {"name": "Express Nano Loan", "code": "LN-NANO-10K", "min": 10000, "max": 25000, "rate": 14.00, "desc": "Instant collateral-free emergency fund for verified subscribers."},
        {"name": "Pradhan Smart Personal Loan", "code": "LN-SMART-50K", "min": 25000, "max": 50000, "rate": 14.50, "desc": "Flexible personal financing with convenient 6 to 18 months repayment."},
        {"name": "Vyapar Express Working Capital Loan", "code": "LN-BIZ-100K", "min": 50000, "max": 100000, "rate": 15.00, "desc": "Short-term enterprise credit for inventory, supplies & working capital."}
    ]

    created_loan_prods = []
    for lp in loan_products_data:
        prod = LoanProduct(
            product_code=lp["code"],
            name=lp["name"],
            category="FinServe Express Credit",
            description=lp["desc"],
            min_amount=Decimal(str(lp["min"])),
            max_amount=Decimal(str(lp["max"])),
            min_tenure_months=3,
            max_tenure_months=24,
            annual_interest_rate=Decimal(str(lp["rate"])),
            processing_fee_pct=Decimal('2.00'),
            legal_disclaimer="Licensed under Karnataka Money Lenders Act, 1961 (Registration No. KA/BLR/MLL/2021/409). APR displayed includes all charges.",
            is_active=True
        )
        db.add(prod)
        created_loan_prods.append(prod)
    db.flush()

    # 9. Active Loan for Customer 1 (₹60,000, 12 months @ 14.50%)
    loan_prod_50k = created_loan_prods[1]
    loan_app1 = LoanApplication(
        application_no="LOAN-APP-202610-00045",
        user_id=customer1.id,
        product_id=loan_prod_50k.id,
        requested_amount=Decimal('60000.00'),
        tenure_months=12,
        employment_type="Salaried",
        monthly_income=Decimal('145000.00'),
        employer_name="Infosys Technologies Ltd",
        loan_purpose="Home Renovation & Appliances",
        bank_account_no_masked=mask_account_number("5010023491823"),
        bank_ifsc="HDFC0001234",
        bank_name="HDFC Bank",
        bank_verified=True,
        status=LoanAppStatus.ACTIVE,
        credit_score_estimate=780,
        reviewed_by_id=owner.id,
        approved_at=datetime.utcnow() - timedelta(days=60)
    )
    db.add(loan_app1)
    db.flush()

    emi_calc = LoanEngine.calculate_emi(Decimal('60000.00'), Decimal('14.50'), 12)
    proc_fee = Decimal('1200.00')

    loan1 = Loan(
        loan_account_no="LN-ACC-202610-0045",
        application_id=loan_app1.id,
        user_id=customer1.id,
        principal_amount=Decimal('60000.00'),
        tenure_months=12,
        interest_rate_apr=Decimal('14.50'),
        monthly_emi=emi_calc["monthly_emi"],
        total_interest=emi_calc["total_interest"],
        total_payable=emi_calc["total_payable"],
        processing_fee=proc_fee,
        disbursed_amount=Decimal('58800.00'),
        disbursement_date=date.today() - timedelta(days=60),
        maturity_date=date.today() + timedelta(days=300),
        principal_outstanding=Decimal('50450.00'),
        interest_outstanding=Decimal('3950.00'),
        total_paid=Decimal('10804.00'),
        status=LoanStatus.ACTIVE
    )
    db.add(loan1)
    db.flush()

    # Generate 12 EMI repayments (first 2 PAID, 10 PENDING)
    sched = LoanEngine.generate_repayment_schedule(
        principal=Decimal('60000.00'),
        annual_interest_rate_pct=Decimal('14.50'),
        tenure_months=12,
        start_date=date.today() - timedelta(days=60)
    )

    for idx, item in enumerate(sched):
        is_paid = idx < 2
        repay = LoanRepayment(
            loan_id=loan1.id,
            emi_number=item["emi_number"],
            due_date=item["due_date"],
            emi_amount=item["emi_amount"],
            principal_component=item["principal_component"],
            interest_component=item["interest_component"],
            paid_amount=item["emi_amount"] if is_paid else Decimal('0.00'),
            paid_at=(datetime.utcnow() - timedelta(days=30 * (2 - idx))) if is_paid else None,
            status=RepaymentStatus.PAID if is_paid else RepaymentStatus.PENDING
        )
        db.add(repay)

    # 10. Pending Loan Application for Customer 3
    loan_app3 = LoanApplication(
        application_no="LOAN-APP-202611-00088",
        user_id=customer3.id,
        product_id=created_loan_prods[2].id,
        requested_amount=Decimal('80000.00'),
        tenure_months=18,
        employment_type="Self-Employed / Business",
        monthly_income=Decimal('92000.00'),
        employer_name="Kumar Electricals & Hardware",
        loan_purpose="Inventory expansion for upcoming festive season",
        bank_account_no_masked=mask_account_number("30918274619"),
        bank_ifsc="SBIN0004018",
        bank_name="State Bank of India",
        bank_verified=True,
        status=LoanAppStatus.PENDING,
        credit_score_estimate=742
    )
    db.add(loan_app3)

    # 11. Payment Transactions
    txn1 = PaymentTransaction(
        txn_reference="TXN-20261015-8812",
        gateway_order_id="order_2610151120_812",
        gateway_payment_id="pay_261015112102_901",
        user_id=customer1.id,
        amount=Decimal('5402.00'),
        payment_mode=PaymentMode.UPI,
        payment_type=PaymentType.LOAN_EMI,
        reference_id=1,
        status=PaymentStatus.SUCCESS,
        receipt_number="RCPT-202610-04192",
        notes="EMI #1 received via Google Pay UPI"
    )
    db.add(txn1)

    txn2 = PaymentTransaction(
        txn_reference="TXN-20261110-9143",
        gateway_order_id="order_2611101430_231",
        gateway_payment_id="pay_261110143115_774",
        user_id=customer1.id,
        amount=Decimal('5402.00'),
        payment_mode=PaymentMode.NET_BANKING,
        payment_type=PaymentType.LOAN_EMI,
        reference_id=2,
        status=PaymentStatus.SUCCESS,
        receipt_number="RCPT-202611-05218",
        notes="EMI #2 received via HDFC NetBanking"
    )
    db.add(txn2)

    # 12. Notifications for Customer 1
    db.add(Notification(
        user_id=customer1.id,
        title="Chit Auction #3 Scheduled",
        message="Auction #3 for Group SOWBHAGYA-BLR-100K-G01 is scheduled for 12 days from today at 4:00 PM IST.",
        category="CHIT",
        action_url="/customer/chits"
    ))
    db.add(Notification(
        user_id=customer1.id,
        title="Upcoming EMI Due Alert",
        message="EMI #3 of ₹5,402.00 for Loan Account LN-ACC-202610-0045 is due soon.",
        category="LOAN",
        action_url="/customer/loans"
    ))

    # 13. Audit Logs
    db.add(AuditLog(
        user_id=owner.id,
        user_role=UserRole.ADMIN.value,
        action="SYSTEM_INIT",
        module="CORE",
        details="Platform initialised with Karnataka Registrar of Chits registration KA/BLR/CHIT/2019/882"
    ))
    db.add(AuditLog(
        user_id=staff.id,
        user_role=UserRole.STAFF.value,
        action="KYC_VERIFIED",
        module="KYC",
        entity_id="KYC-001",
        details=f"Customer Vikramaditya Hegde verified with Passport and Aadhaar demographic match"
    ))

    db.commit()
    db.close()
    print("Database seeding completed successfully!")

if __name__ == "__main__":
    seed_all()


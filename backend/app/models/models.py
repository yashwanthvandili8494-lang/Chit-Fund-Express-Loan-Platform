import enum
from datetime import datetime, date
from decimal import Decimal
from typing import Optional, List
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, Numeric, DateTime, Date,
    ForeignKey, Enum, Index, JSON
)
from sqlalchemy.orm import relationship
from app.core.database import Base

class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    STAFF = "STAFF"
    CUSTOMER = "CUSTOMER"

class KYCStatus(str, enum.Enum):
    NOT_SUBMITTED = "NOT_SUBMITTED"
    SUBMITTED = "SUBMITTED"
    UNDER_REVIEW = "UNDER_REVIEW"
    VERIFIED = "VERIFIED"
    REJECTED = "REJECTED"
    REVERIFICATION_REQUIRED = "REVERIFICATION_REQUIRED"

class ChitGroupStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    REGISTERED = "REGISTERED"
    COMMENCED = "COMMENCED"
    ACTIVE = "ACTIVE"
    COMPLETED = "COMPLETED"
    TERMINATED = "TERMINATED"

class ChitAppStatus(str, enum.Enum):
    PENDING = "PENDING"
    UNDER_REVIEW = "UNDER_REVIEW"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    WAITLISTED = "WAITLISTED"
    ENROLLED = "ENROLLED"

class ChitMemberStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    DEFAULTED = "DEFAULTED"
    SUBSTITUTED = "SUBSTITUTED"
    SURRENDERED = "SURRENDERED"

class AuctionStatus(str, enum.Enum):
    SCHEDULED = "SCHEDULED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

class PrizeDisbursementStatus(str, enum.Enum):
    PENDING_SURETY = "PENDING_SURETY"
    SURETY_APPROVED = "SURETY_APPROVED"
    DISBURSED = "DISBURSED"
    ON_HOLD = "ON_HOLD"

class LoanAppStatus(str, enum.Enum):
    PENDING = "PENDING"
    UNDER_REVIEW = "UNDER_REVIEW"
    DOCUMENTS_REQUIRED = "DOCUMENTS_REQUIRED"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    DISBURSEMENT_PENDING = "DISBURSEMENT_PENDING"
    ACTIVE = "ACTIVE"
    CLOSED = "CLOSED"
    OVERDUE = "OVERDUE"

class LoanStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    CLOSED = "CLOSED"
    OVERDUE = "OVERDUE"
    DEFAULTED = "DEFAULTED"
    SETTLED = "SETTLED"

class RepaymentStatus(str, enum.Enum):
    PENDING = "PENDING"
    PAID = "PAID"
    PARTIALLY_PAID = "PARTIALLY_PAID"
    OVERDUE = "OVERDUE"
    WAIVED = "WAIVED"

class PaymentStatus(str, enum.Enum):
    PENDING = "PENDING"
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"
    REFUNDED = "REFUNDED"

class PaymentType(str, enum.Enum):
    CHIT_SUBSCRIPTION = "CHIT_SUBSCRIPTION"
    LOAN_EMI = "LOAN_EMI"
    LOAN_PROCESSING_FEE = "LOAN_PROCESSING_FEE"
    PENALTY = "PENALTY"

class PaymentMode(str, enum.Enum):
    UPI = "UPI"
    NET_BANKING = "NET_BANKING"
    DEBIT_CARD = "DEBIT_CARD"
    NEFT_RTGS = "NEFT_RTGS"
    CASH_COLLECTION = "CASH_COLLECTION"

# 1. Users Table
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    mobile_number = Column(String(20), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.CUSTOMER, nullable=False, index=True)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    customer_profile = relationship("CustomerProfile", back_populates="user", uselist=False)
    staff_profile = relationship("StaffProfile", back_populates="user", uselist=False)
    kyc_record = relationship("KYCRecord", foreign_keys="[KYCRecord.user_id]", back_populates="user", uselist=False)
    chit_applications = relationship("ChitApplication", foreign_keys="[ChitApplication.user_id]", back_populates="user")
    loan_applications = relationship("LoanApplication", foreign_keys="[LoanApplication.user_id]", back_populates="user")
    loans = relationship("Loan", foreign_keys="[Loan.user_id]", back_populates="user")
    chit_members = relationship("ChitMember", back_populates="user")
    payment_transactions = relationship("PaymentTransaction", back_populates="user")
    notifications = relationship("Notification", back_populates="user")

# 2. Customer Profile
class CustomerProfile(Base):
    __tablename__ = "customer_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    dob = Column(Date, nullable=True)
    gender = Column(String(20), nullable=True)
    address_line1 = Column(String(255), nullable=True)
    address_line2 = Column(String(255), nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(100), default="Karnataka")
    postal_code = Column(String(20), nullable=True)
    occupation = Column(String(100), nullable=True)
    employer_business_name = Column(String(255), nullable=True)
    monthly_income = Column(Numeric(12, 2), default=Decimal('0.00'))
    emergency_contact_name = Column(String(255), nullable=True)
    emergency_contact_phone = Column(String(20), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="customer_profile")

# 3. Staff Profile
class StaffProfile(Base):
    __tablename__ = "staff_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    employee_code = Column(String(50), unique=True, nullable=False)
    department = Column(String(100), default="Operations")
    designation = Column(String(100), default="Relationship Officer")
    branch = Column(String(100), default="Bengaluru Main Branch")
    can_verify_kyc = Column(Boolean, default=True)
    can_collect_payments = Column(Boolean, default=True)
    can_review_applications = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="staff_profile")

# 4. KYC Records
class KYCRecord(Base):
    __tablename__ = "kyc_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    status = Column(Enum(KYCStatus), default=KYCStatus.NOT_SUBMITTED, nullable=False, index=True)
    aadhaar_masked = Column(String(50), nullable=True) # Only XXXX-XXXX-1234
    aadhaar_ref_token = Column(String(100), nullable=True)
    aadhaar_verified = Column(Boolean, default=False)
    pan_number_masked = Column(String(50), nullable=True) # ABCDE1234F masked
    pan_verified = Column(Boolean, default=False)
    pan_name_matched = Column(Boolean, default=False)
    id_proof_type = Column(String(50), nullable=True) # Voter ID, Passport, DL
    id_proof_url = Column(String(500), nullable=True)
    address_proof_type = Column(String(50), nullable=True) # Electricity Bill, Rent Agreement
    address_proof_url = Column(String(500), nullable=True)
    selfie_url = Column(String(500), nullable=True)
    rejection_reason = Column(Text, nullable=True)
    verified_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    verified_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", foreign_keys=[user_id], back_populates="kyc_record")
    verifier = relationship("User", foreign_keys=[verified_by_user_id])
    logs = relationship("KYCVerificationLog", back_populates="kyc_record")

# 5. KYC Verification Logs (Audit)
class KYCVerificationLog(Base):
    __tablename__ = "kyc_verification_logs"

    id = Column(Integer, primary_key=True, index=True)
    kyc_id = Column(Integer, ForeignKey("kyc_records.id"), nullable=False)
    performed_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    previous_status = Column(String(50), nullable=False)
    new_status = Column(String(50), nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    kyc_record = relationship("KYCRecord", back_populates="logs")
    performer = relationship("User")

# 6. Chit Plans (Master Scheme Catalog)
class ChitPlan(Base):
    __tablename__ = "chit_plans"

    id = Column(Integer, primary_key=True, index=True)
    plan_code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    chit_value = Column(Numeric(14, 2), nullable=False) # e.g. 50000 to 2000000
    duration_months = Column(Integer, nullable=False) # e.g. 20, 25, 40, 50
    monthly_subscription = Column(Numeric(12, 2), nullable=False)
    max_subscribers = Column(Integer, nullable=False)
    foreman_commission_pct = Column(Numeric(5, 2), default=Decimal('5.00')) # Statutory 5%
    max_discount_pct = Column(Numeric(5, 2), default=Decimal('40.00')) # Statutory max 40%
    min_discount_pct = Column(Numeric(5, 2), default=Decimal('5.00'))
    registered_scheme_ref = Column(String(100), nullable=False)
    registration_authority = Column(String(255), default="Registrar of Chits, Govt. of Karnataka")
    terms_conditions = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    groups = relationship("ChitGroup", back_populates="plan")
    applications = relationship("ChitApplication", back_populates="plan")

# 7. Chit Groups (Live Chits in Progress)
class ChitGroup(Base):
    __tablename__ = "chit_groups"

    id = Column(Integer, primary_key=True, index=True)
    plan_id = Column(Integer, ForeignKey("chit_plans.id"), nullable=False)
    group_code = Column(String(50), unique=True, index=True, nullable=False)
    group_name = Column(String(255), nullable=False)
    current_installment = Column(Integer, default=1)
    status = Column(Enum(ChitGroupStatus), default=ChitGroupStatus.ACTIVE, nullable=False)
    pso_order_number = Column(String(100), nullable=True) # Prior Sanction Order
    commencement_cert_no = Column(String(100), nullable=True)
    bank_fd_ref = Column(String(100), nullable=True) # 100% Security FD with Registrar
    bank_fd_amount = Column(Numeric(14, 2), nullable=True)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    next_auction_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    plan = relationship("ChitPlan", back_populates="groups")
    members = relationship("ChitMember", back_populates="group")
    auctions = relationship("ChitAuction", back_populates="group")
    installments = relationship("ChitInstallment", back_populates="group")

# 8. Chit Applications
class ChitApplication(Base):
    __tablename__ = "chit_applications"

    id = Column(Integer, primary_key=True, index=True)
    application_no = Column(String(50), unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    plan_id = Column(Integer, ForeignKey("chit_plans.id"), nullable=False)
    group_id = Column(Integer, ForeignKey("chit_groups.id"), nullable=True)
    status = Column(Enum(ChitAppStatus), default=ChitAppStatus.PENDING, nullable=False, index=True)
    nominee_name = Column(String(255), nullable=False)
    nominee_relationship = Column(String(50), nullable=False)
    nominee_phone = Column(String(20), nullable=True)
    bank_name = Column(String(100), nullable=False)
    bank_account_no_masked = Column(String(50), nullable=False)
    bank_ifsc = Column(String(20), nullable=False)
    agreement_accepted = Column(Boolean, default=True)
    reviewed_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    approved_at = Column(DateTime, nullable=True)
    rejection_reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", foreign_keys=[user_id], back_populates="chit_applications")
    plan = relationship("ChitPlan", back_populates="applications")
    group = relationship("ChitGroup")
    reviewer = relationship("User", foreign_keys=[reviewed_by_id])

# 9. Chit Members (Subscribers in Group)
class ChitMember(Base):
    __tablename__ = "chit_members"

    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("chit_groups.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    ticket_number = Column(Integer, nullable=False)
    status = Column(Enum(ChitMemberStatus), default=ChitMemberStatus.ACTIVE, nullable=False)
    is_prized = Column(Boolean, default=False)
    prized_installment_no = Column(Integer, nullable=True)
    prized_amount = Column(Numeric(14, 2), default=Decimal('0.00'))
    total_subscription_paid = Column(Numeric(14, 2), default=Decimal('0.00'))
    total_dividend_earned = Column(Numeric(14, 2), default=Decimal('0.00'))
    balance_payable = Column(Numeric(14, 2), default=Decimal('0.00'))
    enrolled_at = Column(DateTime, default=datetime.utcnow)

    group = relationship("ChitGroup", back_populates="members")
    user = relationship("User", back_populates="chit_members")
    bids = relationship("ChitBid", back_populates="member")

# 10. Chit Auctions
class ChitAuction(Base):
    __tablename__ = "chit_auctions"

    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("chit_groups.id"), nullable=False)
    auction_no = Column(Integer, nullable=False)
    auction_date = Column(DateTime, nullable=False)
    chit_value = Column(Numeric(14, 2), nullable=False)
    min_bid = Column(Numeric(14, 2), nullable=False)
    max_bid = Column(Numeric(14, 2), nullable=False) # capped at max discount (e.g. 40%)
    winning_bid_discount = Column(Numeric(14, 2), default=Decimal('0.00'))
    winning_member_id = Column(Integer, ForeignKey("chit_members.id"), nullable=True)
    foreman_commission = Column(Numeric(14, 2), default=Decimal('0.00')) # 5%
    total_dividend = Column(Numeric(14, 2), default=Decimal('0.00'))
    dividend_per_member = Column(Numeric(12, 2), default=Decimal('0.00'))
    net_prize_amount = Column(Numeric(14, 2), default=Decimal('0.00'))
    status = Column(Enum(AuctionStatus), default=AuctionStatus.SCHEDULED, nullable=False)
    conducted_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    group = relationship("ChitGroup", back_populates="auctions")
    winning_member = relationship("ChitMember", foreign_keys=[winning_member_id])
    bids = relationship("ChitBid", back_populates="auction")
    prize_distribution = relationship("ChitPrizeDistribution", back_populates="auction", uselist=False)

# 11. Chit Bids
class ChitBid(Base):
    __tablename__ = "chit_bids"

    id = Column(Integer, primary_key=True, index=True)
    auction_id = Column(Integer, ForeignKey("chit_auctions.id"), nullable=False)
    member_id = Column(Integer, ForeignKey("chit_members.id"), nullable=False)
    bid_discount_amount = Column(Numeric(14, 2), nullable=False)
    bid_time = Column(DateTime, default=datetime.utcnow)
    is_winning_bid = Column(Boolean, default=False)

    auction = relationship("ChitAuction", back_populates="bids")
    member = relationship("ChitMember", back_populates="bids")

# 12. Chit Installments (Schedule & Payments)
class ChitInstallment(Base):
    __tablename__ = "chit_installments"

    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("chit_groups.id"), nullable=False)
    installment_no = Column(Integer, nullable=False)
    due_date = Column(Date, nullable=False)
    gross_subscription = Column(Numeric(12, 2), nullable=False)
    dividend_earned = Column(Numeric(12, 2), default=Decimal('0.00'))
    net_payable = Column(Numeric(12, 2), nullable=False)
    status = Column(String(50), default="SCHEDULED") # SCHEDULED, OPEN, CLOSED
    auction_id = Column(Integer, ForeignKey("chit_auctions.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    group = relationship("ChitGroup", back_populates="installments")
    auction = relationship("ChitAuction")

# 13. Chit Prize Distributions
class ChitPrizeDistribution(Base):
    __tablename__ = "chit_prize_distributions"

    id = Column(Integer, primary_key=True, index=True)
    auction_id = Column(Integer, ForeignKey("chit_auctions.id"), unique=True, nullable=False)
    group_id = Column(Integer, ForeignKey("chit_groups.id"), nullable=False)
    member_id = Column(Integer, ForeignKey("chit_members.id"), nullable=False)
    gross_chit_value = Column(Numeric(14, 2), nullable=False)
    winning_bid_discount = Column(Numeric(14, 2), nullable=False)
    foreman_commission = Column(Numeric(14, 2), nullable=False)
    net_disbursed_amount = Column(Numeric(14, 2), nullable=False)
    surety_status = Column(Enum(PrizeDisbursementStatus), default=PrizeDisbursementStatus.PENDING_SURETY)
    surety_details = Column(Text, nullable=True)
    bank_reference_no = Column(String(100), nullable=True)
    disbursed_at = Column(DateTime, nullable=True)
    disbursed_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    auction = relationship("ChitAuction", back_populates="prize_distribution")
    member = relationship("ChitMember")

# 14. Loan Products
class LoanProduct(Base):
    __tablename__ = "loan_products"

    id = Column(Integer, primary_key=True, index=True)
    product_code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    category = Column(String(100), default="Personal / Business Express")
    description = Column(Text, nullable=True)
    min_amount = Column(Numeric(12, 2), default=Decimal('10000.00'))
    max_amount = Column(Numeric(12, 2), default=Decimal('100000.00'))
    min_tenure_months = Column(Integer, default=3)
    max_tenure_months = Column(Integer, default=24)
    annual_interest_rate = Column(Numeric(5, 2), default=Decimal('14.50')) # APR %
    processing_fee_pct = Column(Numeric(5, 2), default=Decimal('2.00'))
    legal_disclaimer = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    applications = relationship("LoanApplication", back_populates="product")

# 15. Loan Applications
class LoanApplication(Base):
    __tablename__ = "loan_applications"

    id = Column(Integer, primary_key=True, index=True)
    application_no = Column(String(50), unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("loan_products.id"), nullable=False)
    requested_amount = Column(Numeric(12, 2), nullable=False)
    tenure_months = Column(Integer, nullable=False)
    employment_type = Column(String(50), nullable=False) # Salaried, Self-Employed, Business
    monthly_income = Column(Numeric(12, 2), nullable=False)
    employer_name = Column(String(255), nullable=True)
    loan_purpose = Column(String(255), nullable=False)
    bank_account_no_masked = Column(String(50), nullable=False)
    bank_ifsc = Column(String(20), nullable=False)
    bank_name = Column(String(100), nullable=False)
    bank_verified = Column(Boolean, default=True)
    status = Column(Enum(LoanAppStatus), default=LoanAppStatus.PENDING, nullable=False, index=True)
    credit_score_estimate = Column(Integer, default=740)
    reviewed_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    approved_at = Column(DateTime, nullable=True)
    rejection_reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", foreign_keys=[user_id], back_populates="loan_applications")
    product = relationship("LoanProduct", back_populates="applications")
    reviewer = relationship("User", foreign_keys=[reviewed_by_id])
    loan = relationship("Loan", back_populates="application", uselist=False)

# 16. Loans (Active Loan Accounts)
class Loan(Base):
    __tablename__ = "loans"

    id = Column(Integer, primary_key=True, index=True)
    loan_account_no = Column(String(50), unique=True, index=True, nullable=False)
    application_id = Column(Integer, ForeignKey("loan_applications.id"), unique=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    principal_amount = Column(Numeric(12, 2), nullable=False)
    tenure_months = Column(Integer, nullable=False)
    interest_rate_apr = Column(Numeric(5, 2), nullable=False)
    monthly_emi = Column(Numeric(12, 2), nullable=False)
    total_interest = Column(Numeric(12, 2), nullable=False)
    total_payable = Column(Numeric(12, 2), nullable=False)
    processing_fee = Column(Numeric(12, 2), nullable=False)
    disbursed_amount = Column(Numeric(12, 2), nullable=False)
    disbursement_date = Column(Date, nullable=False)
    maturity_date = Column(Date, nullable=False)
    principal_outstanding = Column(Numeric(12, 2), nullable=False)
    interest_outstanding = Column(Numeric(12, 2), nullable=False)
    total_paid = Column(Numeric(12, 2), default=Decimal('0.00'))
    status = Column(Enum(LoanStatus), default=LoanStatus.ACTIVE, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    application = relationship("LoanApplication", back_populates="loan")
    user = relationship("User", back_populates="loans")
    repayments = relationship("LoanRepayment", back_populates="loan", order_by="LoanRepayment.emi_number")

# 17. Loan Repayments (EMI Schedules)
class LoanRepayment(Base):
    __tablename__ = "loan_repayments"

    id = Column(Integer, primary_key=True, index=True)
    loan_id = Column(Integer, ForeignKey("loans.id"), nullable=False)
    emi_number = Column(Integer, nullable=False)
    due_date = Column(Date, nullable=False)
    emi_amount = Column(Numeric(12, 2), nullable=False)
    principal_component = Column(Numeric(12, 2), nullable=False)
    interest_component = Column(Numeric(12, 2), nullable=False)
    paid_amount = Column(Numeric(12, 2), default=Decimal('0.00'))
    paid_at = Column(DateTime, nullable=True)
    late_fee = Column(Numeric(10, 2), default=Decimal('0.00'))
    status = Column(Enum(RepaymentStatus), default=RepaymentStatus.PENDING, nullable=False)
    payment_transaction_id = Column(Integer, ForeignKey("payment_transactions.id"), nullable=True)

    loan = relationship("Loan", back_populates="repayments")
    payment_transaction = relationship("PaymentTransaction")

# 18. Payment Transactions (Fintech Ledger)
class PaymentTransaction(Base):
    __tablename__ = "payment_transactions"

    id = Column(Integer, primary_key=True, index=True)
    txn_reference = Column(String(50), unique=True, index=True, nullable=False)
    gateway_order_id = Column(String(100), nullable=True)
    gateway_payment_id = Column(String(100), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)
    payment_mode = Column(Enum(PaymentMode), default=PaymentMode.UPI, nullable=False)
    payment_type = Column(Enum(PaymentType), nullable=False)
    reference_id = Column(Integer, nullable=True) # chit_installment_id or loan_repayment_id
    status = Column(Enum(PaymentStatus), default=PaymentStatus.SUCCESS, nullable=False)
    receipt_number = Column(String(50), unique=True, nullable=False)
    notes = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="payment_transactions")

# 19. Bank Verification Records (Penny Drop / Account Verification)
class BankVerificationRecord(Base):
    __tablename__ = "bank_verification_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    account_number_masked = Column(String(50), nullable=False)
    ifsc_code = Column(String(20), nullable=False)
    bank_name = Column(String(100), nullable=False)
    account_holder_name = Column(String(255), nullable=False)
    penny_drop_status = Column(String(50), default="VERIFIED")
    provider_reference = Column(String(100), nullable=True)
    verified_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")

# 20. Notifications
class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    category = Column(String(50), default="SYSTEM") # CHIT, LOAN, KYC, PAYMENT
    is_read = Column(Boolean, default=False)
    action_url = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")

# 21. Agreements
class Agreement(Base):
    __tablename__ = "agreements"

    id = Column(Integer, primary_key=True, index=True)
    agreement_no = Column(String(50), unique=True, index=True, nullable=False)
    agreement_type = Column(String(50), nullable=False) # CHIT_SUBSCRIBER, LOAN_CONTRACT
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    reference_id = Column(Integer, nullable=False)
    terms_hash = Column(String(100), nullable=False)
    ip_address = Column(String(50), default="127.0.0.1")
    signed_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")

# 22. Audit Logs
class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    user_role = Column(String(50), nullable=True)
    action = Column(String(100), nullable=False)
    module = Column(String(100), nullable=False)
    entity_id = Column(String(100), nullable=True)
    details = Column(Text, nullable=True)
    ip_address = Column(String(50), default="127.0.0.1")
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")

# 23. Company Settings
class CompanySetting(Base):
    __tablename__ = "company_settings"

    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String(255), default="Sowbhagya Chits & FinServe Private Limited")
    cin_number = Column(String(50), default="U65992KA2018PTC112345")
    chit_registrar_license_no = Column(String(100), default="KA/BLR/CHIT/2019/882")
    money_lending_license_no = Column(String(100), default="KA/BLR/MLL/2021/409")
    registered_office_address = Column(Text, default="#42, 3rd Floor, FinTech Towers, MG Road, Bengaluru, Karnataka 560001")
    support_email = Column(String(100), default="support@sowbhagyachits.in")
    support_phone = Column(String(50), default="+91 80 4912 8800")
    gstin = Column(String(50), default="29ABCDE1234F1Z5")
    foreman_commission_standard_pct = Column(Numeric(5, 2), default=Decimal('5.00'))
    max_chit_discount_pct = Column(Numeric(5, 2), default=Decimal('40.00'))
    default_loan_apr_pct = Column(Numeric(5, 2), default=Decimal('14.50'))


# ==========================================
# 24. BRANCHES & HRMS MODULES
# ==========================================

class AttendanceStatus(str, enum.Enum):
    PRESENT = "PRESENT"
    ABSENT = "ABSENT"
    HALF_DAY = "HALF_DAY"
    LATE = "LATE"
    ON_LEAVE = "ON_LEAVE"

class LeaveType(str, enum.Enum):
    CASUAL = "CASUAL"
    SICK = "SICK"
    PAID = "PAID"
    UNPAID = "UNPAID"

class LeaveStatus(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"

class PayrollStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    PROCESSED = "PROCESSED"
    PAID = "PAID"

# 24. Branches
class Branch(Base):
    __tablename__ = "branches"

    id = Column(Integer, primary_key=True, index=True)
    branch_code = Column(String(50), unique=True, index=True, nullable=False)
    branch_name = Column(String(100), nullable=False)
    city = Column(String(100), default="Bengaluru", nullable=False)
    address = Column(Text, nullable=False)
    phone = Column(String(50), default="+91 80 4912 8800")
    manager_name = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    employees = relationship("Employee", back_populates="branch")
    expenses = relationship("Expense", back_populates="branch")

# 25. Employees (HRMS Master)
class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String(50), unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    branch_id = Column(Integer, ForeignKey("branches.id"), nullable=False)
    full_name = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=False)
    email = Column(String(255), nullable=False)
    department = Column(String(100), nullable=False) # Branch Ops, Underwriting, Collections, Accounts, IT
    designation = Column(String(100), nullable=False)
    date_of_joining = Column(Date, nullable=False)
    employment_status = Column(String(50), default="ACTIVE") # ACTIVE, PROBATION, RESIGNED, TERMINATED
    emergency_contact_name = Column(String(100), nullable=True)
    emergency_contact_phone = Column(String(20), nullable=True)
    bank_account_masked = Column(String(50), default="••••••••5512")
    bank_ifsc = Column(String(20), default="HDFC0001234")
    bank_name = Column(String(100), default="HDFC Bank")
    pan_masked = Column(String(20), default="ABCDE****F")
    uan_epfo_masked = Column(String(50), default="1012****9988")
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")
    branch = relationship("Branch", back_populates="employees")
    attendance_records = relationship("Attendance", back_populates="employee", order_by="desc(Attendance.attendance_date)")
    leave_applications = relationship("LeaveApplication", back_populates="employee")
    salary_structure = relationship("SalaryStructure", back_populates="employee", uselist=False)
    payroll_records = relationship("Payroll", back_populates="employee")
    salary_advances = relationship("SalaryAdvance", back_populates="employee")

# 26. Attendance Records
class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False, index=True)
    attendance_date = Column(Date, nullable=False, index=True)
    check_in_time = Column(DateTime, nullable=True)
    check_out_time = Column(DateTime, nullable=True)
    status = Column(Enum(AttendanceStatus), default=AttendanceStatus.PRESENT, nullable=False)
    work_hours = Column(Numeric(4, 2), default=Decimal('8.50'))
    late_minutes = Column(Integer, default=0)
    check_in_ip = Column(String(50), default="127.0.0.1")
    notes = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    employee = relationship("Employee", back_populates="attendance_records")

# 27. Leave Applications
class LeaveApplication(Base):
    __tablename__ = "leave_applications"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False, index=True)
    leave_type = Column(Enum(LeaveType), default=LeaveType.CASUAL, nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    total_days = Column(Integer, default=1, nullable=False)
    reason = Column(Text, nullable=False)
    status = Column(Enum(LeaveStatus), default=LeaveStatus.PENDING, nullable=False, index=True)
    reviewed_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    review_notes = Column(Text, nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    employee = relationship("Employee", back_populates="leave_applications")
    reviewer = relationship("User")

# 28. Salary Structures
class SalaryStructure(Base):
    __tablename__ = "salary_structures"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), unique=True, nullable=False)
    basic_salary = Column(Numeric(12, 2), nullable=False)
    hra = Column(Numeric(12, 2), nullable=False)
    special_allowances = Column(Numeric(12, 2), default=Decimal('0.00'))
    conveyance_allowance = Column(Numeric(12, 2), default=Decimal('0.00'))
    medical_allowance = Column(Numeric(12, 2), default=Decimal('0.00'))
    gross_salary = Column(Numeric(12, 2), nullable=False)
    pf_employee_deduction = Column(Numeric(12, 2), default=Decimal('0.00'))
    esi_employee_deduction = Column(Numeric(12, 2), default=Decimal('0.00'))
    professional_tax = Column(Numeric(12, 2), default=Decimal('200.00'))
    tds_monthly = Column(Numeric(12, 2), default=Decimal('0.00'))
    total_deductions = Column(Numeric(12, 2), nullable=False)
    net_salary = Column(Numeric(12, 2), nullable=False)
    effective_from = Column(Date, default=date.today)
    created_at = Column(DateTime, default=datetime.utcnow)

    employee = relationship("Employee", back_populates="salary_structure")

# 29. Monthly Payroll
class Payroll(Base):
    __tablename__ = "payroll"

    id = Column(Integer, primary_key=True, index=True)
    payroll_batch_no = Column(String(50), index=True, nullable=False)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False, index=True)
    month = Column(Integer, nullable=False) # 1-12
    year = Column(Integer, nullable=False)
    total_working_days = Column(Integer, default=30)
    days_present = Column(Integer, default=30)
    days_absent = Column(Integer, default=0)
    earned_basic = Column(Numeric(12, 2), nullable=False)
    earned_hra = Column(Numeric(12, 2), nullable=False)
    earned_allowances = Column(Numeric(12, 2), default=Decimal('0.00'))
    bonus_incentives = Column(Numeric(12, 2), default=Decimal('0.00'))
    gross_earned = Column(Numeric(12, 2), nullable=False)
    deduction_pf = Column(Numeric(12, 2), default=Decimal('0.00'))
    deduction_esi = Column(Numeric(12, 2), default=Decimal('0.00'))
    deduction_pt = Column(Numeric(12, 2), default=Decimal('200.00'))
    deduction_tds = Column(Numeric(12, 2), default=Decimal('0.00'))
    advance_deduction = Column(Numeric(12, 2), default=Decimal('0.00'))
    total_deductions = Column(Numeric(12, 2), nullable=False)
    net_pay = Column(Numeric(12, 2), nullable=False)
    payment_status = Column(Enum(PayrollStatus), default=PayrollStatus.PAID, nullable=False)
    payment_reference = Column(String(100), nullable=True) # NEFT/IMPS UTR
    paid_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    employee = relationship("Employee", back_populates="payroll_records")
    salary_slip = relationship("SalarySlip", back_populates="payroll", uselist=False)

# 30. Salary Slips (Payslips)
class SalarySlip(Base):
    __tablename__ = "salary_slips"

    id = Column(Integer, primary_key=True, index=True)
    payslip_number = Column(String(50), unique=True, index=True, nullable=False)
    payroll_id = Column(Integer, ForeignKey("payroll.id"), unique=True, nullable=False)
    employee_name = Column(String(255), nullable=False)
    employee_code = Column(String(50), nullable=False)
    designation = Column(String(100), nullable=False)
    department = Column(String(100), nullable=False)
    month_year = Column(String(50), nullable=False) # e.g. "October 2026"
    bank_account_masked = Column(String(50), nullable=False)
    uan_epfo = Column(String(50), nullable=True)
    pan_masked = Column(String(20), nullable=True)
    earnings_breakdown = Column(JSON, nullable=False)
    deductions_breakdown = Column(JSON, nullable=False)
    gross_earnings = Column(Numeric(12, 2), nullable=False)
    total_deductions = Column(Numeric(12, 2), nullable=False)
    net_pay_in_words = Column(String(255), nullable=False)
    net_pay = Column(Numeric(12, 2), nullable=False)
    generated_at = Column(DateTime, default=datetime.utcnow)

    payroll = relationship("Payroll", back_populates="salary_slip")

# 31. Salary Advances
class SalaryAdvance(Base):
    __tablename__ = "salary_advances"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    requested_amount = Column(Numeric(12, 2), nullable=False)
    approved_amount = Column(Numeric(12, 2), nullable=True)
    monthly_installment = Column(Numeric(12, 2), nullable=True)
    reason = Column(Text, nullable=False)
    status = Column(String(50), default="PENDING") # PENDING, APPROVED, REJECTED, REPAID
    approved_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    employee = relationship("Employee", back_populates="salary_advances")
    approver = relationship("User")

# 32. Expenses (Office / Branch Expenses)
class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    voucher_no = Column(String(50), unique=True, index=True, nullable=False)
    branch_id = Column(Integer, ForeignKey("branches.id"), nullable=False)
    category = Column(String(100), nullable=False) # Rent, Utilities, Legal & Compliance, Office Supplies, IT Infrastructure
    amount = Column(Numeric(12, 2), nullable=False)
    expense_date = Column(Date, nullable=False)
    description = Column(String(255), nullable=False)
    vendor_name = Column(String(100), nullable=True)
    receipt_reference = Column(String(100), nullable=True)
    payment_mode = Column(String(50), default="BANK_TRANSFER")
    approved_by = Column(String(100), default="Rajeshwar Rao (MD)")
    created_at = Column(DateTime, default=datetime.utcnow)

    branch = relationship("Branch", back_populates="expenses")

# 33. KYC Consents
class KYCConsent(Base):
    __tablename__ = "kyc_consents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    consent_purpose = Column(String(255), nullable=False)
    ip_address = Column(String(50), default="127.0.0.1")
    consented_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")

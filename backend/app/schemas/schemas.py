from datetime import datetime, date
from decimal import Decimal
from typing import Optional, List, Any
from pydantic import BaseModel, EmailStr, Field
from app.models.models import (
    UserRole, KYCStatus, ChitGroupStatus, ChitAppStatus,
    ChitMemberStatus, AuctionStatus, PrizeDisbursementStatus,
    LoanAppStatus, LoanStatus, RepaymentStatus, PaymentStatus,
    PaymentType, PaymentMode
)

# Auth Schemas
class UserLogin(BaseModel):
    email_or_phone: str
    password: str

class UserRegister(BaseModel):
    full_name: str
    email: EmailStr
    mobile_number: str
    password: str
    role: UserRole = UserRole.CUSTOMER

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"

class UserOut(BaseModel):
    id: int
    email: str
    mobile_number: str
    full_name: str
    role: UserRole
    is_active: bool
    is_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True

# KYC Schemas
class KYCSubmit(BaseModel):
    aadhaar_number: str # will be validated and masked before saving
    pan_number: str # validated and formatted
    id_proof_type: str = "Voter ID"
    id_proof_url: Optional[str] = "/docs/sample_id_proof.pdf"
    address_proof_type: str = "Electricity Bill"
    address_proof_url: Optional[str] = "/docs/sample_address_proof.pdf"
    selfie_url: Optional[str] = "/docs/sample_selfie.jpg"
    dob: Optional[date] = None
    gender: Optional[str] = "Male"
    address_line1: str = ""
    address_line2: Optional[str] = ""
    city: str = ""
    state: str = "Karnataka"
    postal_code: str = ""
    occupation: str = "Salaried"
    monthly_income: Decimal = Decimal('50000.00')

class KYCReviewAction(BaseModel):
    status: KYCStatus # VERIFIED or REJECTED or REVERIFICATION_REQUIRED
    rejection_reason: Optional[str] = None
    notes: Optional[str] = None

class KYCRecordOut(BaseModel):
    id: int
    user_id: int
    status: KYCStatus
    aadhaar_masked: Optional[str]
    aadhaar_verified: bool
    pan_number_masked: Optional[str]
    pan_verified: bool
    pan_name_matched: bool
    id_proof_type: Optional[str]
    id_proof_url: Optional[str]
    address_proof_type: Optional[str]
    address_proof_url: Optional[str]
    selfie_url: Optional[str]
    rejection_reason: Optional[str]
    verified_at: Optional[datetime]
    created_at: datetime
    user: Optional[UserOut] = None

    class Config:
        from_attributes = True

# Chit Plan Schemas
class ChitPlanCreate(BaseModel):
    name: str
    chit_value: Decimal
    duration_months: int
    monthly_subscription: Decimal
    max_subscribers: int
    foreman_commission_pct: Decimal = Decimal('5.00')
    max_discount_pct: Decimal = Decimal('40.00')
    min_discount_pct: Decimal = Decimal('5.00')
    registered_scheme_ref: str
    registration_authority: str = "Registrar of Chits, Govt. of Karnataka"
    terms_conditions: Optional[str] = None

class ChitPlanOut(BaseModel):
    id: int
    plan_code: str
    name: str
    chit_value: Decimal
    duration_months: int
    monthly_subscription: Decimal
    max_subscribers: int
    foreman_commission_pct: Decimal
    max_discount_pct: Decimal
    min_discount_pct: Decimal
    registered_scheme_ref: str
    registration_authority: str
    terms_conditions: Optional[str]
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Chit Application Schemas
class ChitApplyRequest(BaseModel):
    plan_id: int
    nominee_name: str
    nominee_relationship: str
    nominee_phone: Optional[str] = None
    bank_name: str
    bank_account_no: str
    bank_ifsc: str
    accept_terms: bool = True

class ChitAppReview(BaseModel):
    status: ChitAppStatus # APPROVED, REJECTED, ENROLLED
    group_id: Optional[int] = None
    rejection_reason: Optional[str] = None

class ChitApplicationOut(BaseModel):
    id: int
    application_no: str
    user_id: int
    plan_id: int
    group_id: Optional[int]
    status: ChitAppStatus
    nominee_name: str
    nominee_relationship: str
    nominee_phone: Optional[str]
    bank_name: str
    bank_account_no_masked: str
    bank_ifsc: str
    approved_at: Optional[datetime]
    rejection_reason: Optional[str]
    created_at: datetime
    plan: Optional[ChitPlanOut] = None
    user: Optional[UserOut] = None

    class Config:
        from_attributes = True

# Chit Group & Auction Schemas
class ChitGroupOut(BaseModel):
    id: int
    group_code: str
    group_name: str
    plan_id: int
    current_installment: int
    status: ChitGroupStatus
    pso_order_number: Optional[str]
    commencement_cert_no: Optional[str]
    bank_fd_ref: Optional[str]
    bank_fd_amount: Optional[Decimal]
    start_date: date
    end_date: date
    next_auction_date: Optional[datetime]
    plan: Optional[ChitPlanOut] = None

    class Config:
        from_attributes = True

class ChitBidSubmit(BaseModel):
    auction_id: int
    bid_discount_amount: Decimal

class ChitAuctionConduct(BaseModel):
    auction_id: int
    winning_member_id: int
    winning_bid_discount: Decimal

class ChitAuctionOut(BaseModel):
    id: int
    group_id: int
    auction_no: int
    auction_date: datetime
    chit_value: Decimal
    min_bid: Decimal
    max_bid: Decimal
    winning_bid_discount: Decimal
    winning_member_id: Optional[int]
    foreman_commission: Decimal
    total_dividend: Decimal
    dividend_per_member: Decimal
    net_prize_amount: Decimal
    status: AuctionStatus
    completed_at: Optional[datetime]
    group: Optional[ChitGroupOut] = None

    class Config:
        from_attributes = True

# Loan Product Schemas
class LoanProductOut(BaseModel):
    id: int
    product_code: str
    name: str
    category: str
    description: Optional[str]
    min_amount: Decimal
    max_amount: Decimal
    min_tenure_months: int
    max_tenure_months: int
    annual_interest_rate: Decimal
    processing_fee_pct: Decimal
    legal_disclaimer: Optional[str]
    is_active: bool

    class Config:
        from_attributes = True

# Loan Application Schemas
class LoanApplyRequest(BaseModel):
    product_id: int
    requested_amount: Decimal
    tenure_months: int
    employment_type: str
    monthly_income: Decimal
    employer_name: Optional[str] = None
    loan_purpose: str
    bank_account_no: str
    bank_ifsc: str
    bank_name: str

class LoanAppReview(BaseModel):
    status: LoanAppStatus # APPROVED, REJECTED, DOCUMENTS_REQUIRED
    rejection_reason: Optional[str] = None

class LoanApplicationOut(BaseModel):
    id: int
    application_no: str
    user_id: int
    product_id: int
    requested_amount: Decimal
    tenure_months: int
    employment_type: str
    monthly_income: Decimal
    employer_name: Optional[str]
    loan_purpose: str
    bank_account_no_masked: str
    bank_ifsc: str
    bank_name: str
    bank_verified: bool
    status: LoanAppStatus
    credit_score_estimate: int
    approved_at: Optional[datetime]
    rejection_reason: Optional[str]
    created_at: datetime
    product: Optional[LoanProductOut] = None
    user: Optional[UserOut] = None

    class Config:
        from_attributes = True

class LoanRepaymentOut(BaseModel):
    id: int
    loan_id: int
    emi_number: int
    due_date: date
    emi_amount: Decimal
    principal_component: Decimal
    interest_component: Decimal
    paid_amount: Decimal
    paid_at: Optional[datetime]
    late_fee: Decimal
    status: RepaymentStatus

    class Config:
        from_attributes = True

class LoanOut(BaseModel):
    id: int
    loan_account_no: str
    principal_amount: Decimal
    tenure_months: int
    interest_rate_apr: Decimal
    monthly_emi: Decimal
    total_interest: Decimal
    total_payable: Decimal
    processing_fee: Decimal
    disbursed_amount: Decimal
    disbursement_date: date
    maturity_date: date
    principal_outstanding: Decimal
    interest_outstanding: Decimal
    total_paid: Decimal
    status: LoanStatus
    repayments: List[LoanRepaymentOut] = []

    class Config:
        from_attributes = True

# Payment Transaction Schemas
class PaymentPayRequest(BaseModel):
    payment_type: PaymentType
    reference_id: int # chit_installment_id or loan_repayment_id
    amount: Decimal
    payment_mode: PaymentMode = PaymentMode.UPI
    notes: Optional[str] = None

class PaymentTransactionOut(BaseModel):
    id: int
    txn_reference: str
    gateway_order_id: Optional[str]
    gateway_payment_id: Optional[str]
    user_id: int
    amount: Decimal
    payment_mode: PaymentMode
    payment_type: PaymentType
    reference_id: Optional[int]
    status: PaymentStatus
    receipt_number: str
    notes: Optional[str]
    created_at: datetime
    user: Optional[UserOut] = None

    class Config:
        from_attributes = True

# Dashboard Stats Schemas
class AdminDashboardStats(BaseModel):
    total_customers: int
    kyc_verified_customers: int
    pending_kyc: int
    active_chit_groups: int
    total_chit_collections: Decimal
    pending_chit_applications: int
    active_loans: int
    total_loan_disbursed: Decimal
    total_emi_collected: Decimal
    overdue_loans: int
    total_business_income: Decimal
    monthly_revenue_data: List[dict]
    chit_collection_trends: List[dict]
    loan_disbursement_trends: List[dict]
    customer_growth_trends: List[dict]

class CustomerDashboardStats(BaseModel):
    kyc_status: KYCStatus
    active_chit_count: int
    active_loan_count: int
    total_chit_paid: Decimal
    total_loan_outstanding: Decimal
    upcoming_emis: List[dict]
    recent_transactions: List[PaymentTransactionOut]
    recent_notifications: List[dict]

# Notification Schemas
class NotificationOut(BaseModel):
    id: int
    title: str
    message: str
    category: str
    is_read: bool
    action_url: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


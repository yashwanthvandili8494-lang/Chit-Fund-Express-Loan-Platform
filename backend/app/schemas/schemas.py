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
    status: LoanAppStatus # APPROVED, REJECTED, DOCUMENTS_REQUIRED, etc.
    rejection_reason: Optional[str] = None
    internal_notes: Optional[str] = None
    requested_document_notes: Optional[str] = None
    assigned_staff_id: Optional[int] = None

class LoanDisbursementRequest(BaseModel):
    bank_reference_no: str
    disbursed_amount: Optional[Decimal] = None
    notes: Optional[str] = None

class LoanAgreementSignRequest(BaseModel):
    accept_terms: bool = True
    ip_address: Optional[str] = "127.0.0.1"

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
    automated_eligibility_status: Optional[str] = None
    eligibility_score: Optional[int] = None
    eligibility_breakdown: Optional[dict] = None
    sanction_letter_number: Optional[str] = None
    key_facts_statement: Optional[dict] = None
    agreement_signed: bool = False
    agreement_signed_at: Optional[datetime] = None
    internal_notes: Optional[str] = None
    requested_document_notes: Optional[str] = None
    salary_slip_url: Optional[str] = None
    bank_statement_url: Optional[str] = None
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



# ==========================================
# HRMS, ATTENDANCE & PAYROLL SCHEMAS
# ==========================================

from app.models.models import AttendanceStatus, LeaveType, LeaveStatus, PayrollStatus

class BranchOut(BaseModel):
    id: int
    branch_code: str
    branch_name: str
    city: str
    address: str
    phone: str
    manager_name: Optional[str] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class BranchCreate(BaseModel):
    branch_code: str
    branch_name: str
    city: str = "Bengaluru"
    address: str
    phone: str = "+91 80 4912 8800"
    manager_name: Optional[str] = None

class EmployeeOut(BaseModel):
    id: int
    employee_id: str
    user_id: int
    branch_id: int
    full_name: str
    phone: str
    email: str
    department: str
    designation: str
    date_of_joining: date
    employment_status: str
    bank_account_masked: str
    bank_ifsc: str
    bank_name: str
    pan_masked: str
    uan_epfo_masked: str
    branch: Optional[BranchOut] = None

    class Config:
        from_attributes = True

class EmployeeCreate(BaseModel):
    full_name: str
    email: str
    phone: str
    department: str
    designation: str
    branch_id: int
    date_of_joining: date
    password: str = "Password@123"
    bank_account_masked: str = "••••••••5512"
    bank_ifsc: str = "HDFC0001234"
    bank_name: str = "HDFC Bank"
    basic_salary: Decimal = Decimal('25000.00')
    hra: Decimal = Decimal('10000.00')
    special_allowances: Decimal = Decimal('5000.00')

class AttendanceCheckIn(BaseModel):
    notes: Optional[str] = None

class AttendanceOut(BaseModel):
    id: int
    employee_id: int
    attendance_date: date
    check_in_time: Optional[datetime]
    check_out_time: Optional[datetime]
    status: AttendanceStatus
    work_hours: Decimal
    late_minutes: int
    notes: Optional[str]

    class Config:
        from_attributes = True

class LeaveApplyRequest(BaseModel):
    leave_type: LeaveType = LeaveType.CASUAL
    start_date: date
    end_date: date
    reason: str

class LeaveReviewRequest(BaseModel):
    status: LeaveStatus # APPROVED or REJECTED
    review_notes: Optional[str] = None

class LeaveApplicationOut(BaseModel):
    id: int
    employee_id: int
    leave_type: LeaveType
    start_date: date
    end_date: date
    total_days: int
    reason: str
    status: LeaveStatus
    reviewed_at: Optional[datetime] = None
    review_notes: Optional[str] = None
    created_at: datetime
    employee: Optional[EmployeeOut] = None

    class Config:
        from_attributes = True

class SalaryStructureOut(BaseModel):
    id: int
    employee_id: int
    basic_salary: Decimal
    hra: Decimal
    special_allowances: Decimal
    gross_salary: Decimal
    pf_employee_deduction: Decimal
    esi_employee_deduction: Decimal
    professional_tax: Decimal
    tds_monthly: Decimal
    total_deductions: Decimal
    net_salary: Decimal
    effective_from: date

    class Config:
        from_attributes = True

class PayrollRunRequest(BaseModel):
    month: int
    year: int
    bonus_incentives: Decimal = Decimal('0.00')

class SalarySlipOut(BaseModel):
    id: int
    payslip_number: str
    payroll_id: int
    employee_name: str
    employee_code: str
    designation: str
    department: str
    month_year: str
    bank_account_masked: str
    uan_epfo: Optional[str] = None
    pan_masked: Optional[str] = None
    earnings_breakdown: dict
    deductions_breakdown: dict
    gross_earnings: Decimal
    total_deductions: Decimal
    net_pay_in_words: str
    net_pay: Decimal
    generated_at: datetime

    class Config:
        from_attributes = True

class PayrollOut(BaseModel):
    id: int
    payroll_batch_no: str
    employee_id: int
    month: int
    year: int
    total_working_days: int
    days_present: int
    days_absent: int
    gross_earned: Decimal
    total_deductions: Decimal
    net_pay: Decimal
    payment_status: PayrollStatus
    payment_reference: Optional[str] = None
    paid_at: Optional[datetime] = None
    employee: Optional[EmployeeOut] = None
    salary_slip: Optional[SalarySlipOut] = None

    class Config:
        from_attributes = True

class ExpenseCreate(BaseModel):
    branch_id: int
    category: str
    amount: Decimal
    expense_date: date
    description: str
    vendor_name: Optional[str] = None
    receipt_reference: Optional[str] = None
    payment_mode: str = "BANK_TRANSFER"

class ExpenseOut(BaseModel):
    id: int
    voucher_no: str
    branch_id: int
    category: str
    amount: Decimal
    expense_date: date
    description: str
    vendor_name: Optional[str]
    receipt_reference: Optional[str]
    payment_mode: str
    approved_by: str
    created_at: datetime

    class Config:
        from_attributes = True

export type UserRole = 'ADMIN' | 'STAFF' | 'CUSTOMER';

export type KYCStatus = 
  | 'NOT_SUBMITTED' 
  | 'SUBMITTED' 
  | 'UNDER_REVIEW' 
  | 'VERIFIED' 
  | 'REJECTED' 
  | 'REVERIFICATION_REQUIRED';

export type ChitAppStatus = 
  | 'PENDING' 
  | 'UNDER_REVIEW' 
  | 'APPROVED' 
  | 'REJECTED' 
  | 'WAITLISTED' 
  | 'ENROLLED';

export type LoanAppStatus = 
  | 'PENDING' 
  | 'UNDER_REVIEW' 
  | 'DOCUMENTS_REQUIRED' 
  | 'APPROVED' 
  | 'REJECTED' 
  | 'DISBURSEMENT_PENDING' 
  | 'ACTIVE' 
  | 'CLOSED' 
  | 'OVERDUE';

export interface User {
  id: number;
  email: string;
  mobile_number: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

export interface KYCRecord {
  id: number;
  user_id: number;
  status: KYCStatus;
  aadhaar_masked?: string;
  aadhaar_verified: boolean;
  pan_number_masked?: string;
  pan_verified: boolean;
  pan_name_matched: boolean;
  id_proof_type?: string;
  id_proof_url?: string;
  address_proof_type?: string;
  address_proof_url?: string;
  selfie_url?: string;
  rejection_reason?: string;
  verified_at?: string;
  created_at: string;
  user?: User;
}

export interface ChitPlan {
  id: number;
  plan_code: string;
  name: string;
  chit_value: number;
  duration_months: number;
  monthly_subscription: number;
  max_subscribers: number;
  foreman_commission_pct: number;
  max_discount_pct: number;
  min_discount_pct: number;
  registered_scheme_ref: string;
  registration_authority: string;
  terms_conditions?: string;
  is_active: boolean;
  created_at: string;
}

export interface ChitGroup {
  id: number;
  group_code: string;
  group_name: string;
  plan_id: number;
  current_installment: number;
  status: string;
  pso_order_number?: string;
  commencement_cert_no?: string;
  bank_fd_ref?: string;
  bank_fd_amount?: number;
  start_date: string;
  end_date: string;
  next_auction_date?: string;
  plan?: ChitPlan;
}

export interface ChitApplication {
  id: number;
  application_no: string;
  user_id: number;
  plan_id: number;
  group_id?: number;
  status: ChitAppStatus;
  nominee_name: string;
  nominee_relationship: string;
  nominee_phone?: string;
  bank_name: string;
  bank_account_no_masked: string;
  bank_ifsc: string;
  approved_at?: string;
  rejection_reason?: string;
  created_at: string;
  plan?: ChitPlan;
  user?: User;
}

export interface ChitMember {
  id: number;
  membership_id?: number;
  group_id: number;
  group_code?: string;
  group_name?: string;
  ticket_number: number;
  user_id: number;
  chit_value?: number;
  monthly_subscription?: number;
  duration_months?: number;
  current_installment?: number;
  is_prized: boolean;
  prized_amount: number;
  total_paid: number;
  total_dividend_earned: number;
  next_auction_date?: string;
  status: string;
}

export interface ChitAuction {
  id: number;
  group_id: number;
  auction_no: number;
  auction_date: string;
  chit_value: number;
  min_bid: number;
  max_bid: number;
  winning_bid_discount: number;
  winning_member_id?: number;
  foreman_commission: number;
  total_dividend: number;
  dividend_per_member: number;
  net_prize_amount: number;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  completed_at?: string;
  group?: ChitGroup;
}

export interface LoanProduct {
  id: number;
  product_code: string;
  name: string;
  category: string;
  description?: string;
  min_amount: number;
  max_amount: number;
  min_tenure_months: number;
  max_tenure_months: number;
  annual_interest_rate: number;
  processing_fee_pct: number;
  legal_disclaimer?: string;
  is_active: boolean;
}

export interface LoanApplication {
  id: number;
  application_no: string;
  user_id: number;
  product_id: number;
  requested_amount: number;
  tenure_months: number;
  employment_type: string;
  monthly_income: number;
  employer_name?: string;
  loan_purpose: string;
  bank_account_no_masked: string;
  bank_ifsc: string;
  bank_name: string;
  bank_verified: boolean;
  status: LoanAppStatus;
  credit_score_estimate: number;
  approved_at?: string;
  rejection_reason?: string;
  created_at: string;
  product?: LoanProduct;
  user?: User;
}

export interface LoanRepayment {
  id: number;
  loan_id: number;
  emi_number: number;
  due_date: string;
  emi_amount: number;
  principal_component: number;
  interest_component: number;
  paid_amount: number;
  paid_at?: string;
  late_fee: number;
  status: 'PENDING' | 'PAID' | 'PARTIALLY_PAID' | 'OVERDUE' | 'WAIVED';
}

export interface Loan {
  id: number;
  loan_account_no: string;
  principal_amount: number;
  tenure_months: number;
  interest_rate_apr: number;
  monthly_emi: number;
  total_interest: number;
  total_payable: number;
  processing_fee: number;
  disbursed_amount: number;
  disbursement_date: string;
  maturity_date: string;
  principal_outstanding: number;
  interest_outstanding: number;
  total_paid: number;
  status: 'ACTIVE' | 'CLOSED' | 'OVERDUE' | 'DEFAULTED';
  repayments: LoanRepayment[];
}

export interface PaymentTransaction {
  id: number;
  txn_reference: string;
  gateway_order_id?: string;
  gateway_payment_id?: string;
  user_id: number;
  amount: number;
  payment_mode: 'UPI' | 'NET_BANKING' | 'DEBIT_CARD' | 'NEFT_RTGS' | 'CASH_COLLECTION';
  payment_type: 'CHIT_SUBSCRIPTION' | 'LOAN_EMI' | 'LOAN_PROCESSING_FEE' | 'PENALTY';
  reference_id?: number;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
  receipt_number: string;
  notes?: string;
  created_at: string;
  user?: User;
}

export interface PaymentReceipt {
  receipt_number: string;
  transaction_ref: string;
  payment_date: string;
  customer_name: string;
  customer_mobile: string;
  customer_email: string;
  amount: number;
  payment_mode: string;
  payment_type: string;
  gateway_ref?: string;
  status: string;
  notes?: string;
  company: {
    name: string;
    cin: string;
    gstin: string;
    address: string;
    phone: string;
    registrar_chit_no: string;
    money_lending_license: string;
  };
}

export interface AdminStats {
  total_customers: number;
  kyc_verified_customers: number;
  pending_kyc: number;
  active_chit_groups: number;
  total_chit_collections: number;
  pending_chit_applications: number;
  pending_loan_applications: number;
  active_loans: number;
  total_loan_disbursed: number;
  total_emi_collected: number;
  overdue_loans: number;
  total_business_income: number;
}


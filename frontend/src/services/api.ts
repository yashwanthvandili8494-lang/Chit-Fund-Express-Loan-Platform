import {
  User, KYCRecord, ChitPlan, ChitGroup, ChitApplication, ChitMember,
  ChitAuction, LoanProduct, LoanApplication, Loan, PaymentTransaction,
  PaymentReceipt, AdminStats
} from '../types';

const BASE_URL = 'http://127.0.0.1:8000/api/v1';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('fintech_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  };

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || `Request failed with status ${res.status}`);
    }
    return await res.json();
  } catch (err: any) {
    console.warn(`API call ${endpoint} failed or offline:`, err.message);
    throw err;
  }
}

export const api = {
  // Auth
  login: (data: { email_or_phone: string; password: string }) =>
    request<{ access_token: string; token_type: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  register: (data: any) =>
    request<{ access_token: string; token_type: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getMe: () => request<User>('/auth/me'),
  getDemoAccounts: () => request<{ demo_accounts: any[] }>('/auth/demo-accounts'),

  // KYC
  getKYCStatus: () => request<KYCRecord>('/kyc/status'),
  submitKYC: (data: any) =>
    request<KYCRecord>('/kyc/submit', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  listKYCRecords: (statusFilter?: string) =>
    request<KYCRecord[]>(`/kyc/list${statusFilter ? `?status_filter=${statusFilter}` : ''}`),
  reviewKYC: (kycId: number, data: { status: string; rejection_reason?: string; notes?: string }) =>
    request<KYCRecord>(`/kyc/${kycId}/review`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Chit Fund
  getChitPlans: (activeOnly: boolean = false) =>
    request<ChitPlan[]>(`/chits/plans?active_only=${activeOnly}`),
  createChitPlan: (data: any) =>
    request<ChitPlan>('/chits/plans', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  toggleChitPlanStatus: (planId: number) =>
    request<ChitPlan>(`/chits/plans/${planId}/toggle-status`, { method: 'PATCH' }),
  applyChit: (data: any) =>
    request<ChitApplication>('/chits/apply', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getChitApplications: (statusFilter?: string) =>
    request<ChitApplication[]>(`/chits/applications${statusFilter ? `?status_filter=${statusFilter}` : ''}`),
  reviewChitApplication: (appId: number, data: { status: string; group_id?: number; rejection_reason?: string }) =>
    request<ChitApplication>(`/chits/applications/${appId}/review`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getChitGroups: () => request<ChitGroup[]>('/chits/groups'),
  getGroupMembers: (groupId: number) => request<any[]>(`/chits/groups/${groupId}/members`),
  getAuctions: (groupId?: number) =>
    request<ChitAuction[]>(`/chits/auctions${groupId ? `?group_id=${groupId}` : ''}`),
  conductAuction: (data: { auction_id: number; winning_member_id: number; winning_bid_discount: number }) =>
    request<ChitAuction>('/chits/auctions/conduct', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getMyChitMemberships: () => request<ChitMember[]>('/chits/my-memberships'),

  // Loans
  getLoanProducts: () => request<LoanProduct[]>('/loans/products'),
  calculateEMI: (amount: number, tenureMonths: number, annualRate: number = 14.5) =>
    request<any>(`/loans/calculate-emi?amount=${amount}&tenure_months=${tenureMonths}&annual_rate=${annualRate}`),
  applyLoan: (data: any) =>
    request<LoanApplication>('/loans/apply', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getLoanApplications: (statusFilter?: string) =>
    request<LoanApplication[]>(`/loans/applications${statusFilter ? `?status_filter=${statusFilter}` : ''}`),
  reviewLoanApplication: (appId: number, data: { status: string; rejection_reason?: string }) =>
    request<LoanApplication>(`/loans/applications/${appId}/review`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getMyLoans: () => request<Loan[]>('/loans/my-loans'),
  getAllActiveLoans: () => request<Loan[]>('/loans/active-all'),

  // Payments
  processPayment: (data: { payment_type: string; reference_id: number; amount: number; payment_mode: string; notes?: string }) =>
    request<PaymentTransaction>('/payments/process', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getTransactions: () => request<PaymentTransaction[]>('/payments/transactions'),
  getPaymentReceipt: (receiptNumber: string) =>
    request<PaymentReceipt>(`/payments/receipt/${receiptNumber}`),

  // Dashboards
  getAdminStats: () => request<{ stats: AdminStats; monthly_trends: any[]; customer_growth: any[]; recent_activities: any[] }>('/dashboard/admin-stats'),
  getCustomerStats: () => request<any>('/dashboard/customer-stats'),

  // Company & Staff
  getCompanySettings: () => request<any>('/company/settings'),
  updateCompanySettings: (data: any) =>
    request<any>('/company/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  getStaffMembers: () => request<any[]>('/company/staff'),
  getAllCustomers: () => request<any[]>('/company/customers'),
  getAuditLogs: () => request<any[]>('/company/audit-logs'),
};


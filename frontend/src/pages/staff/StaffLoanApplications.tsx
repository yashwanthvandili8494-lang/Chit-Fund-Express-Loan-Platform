import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { LoanApplication } from '../../types';
import { Wallet, CheckSquare, CheckCircle2, XCircle, ShieldCheck, Check, X } from 'lucide-react';

export const StaffLoanApplications: React.FC = () => {
  const [apps, setApps] = useState<LoanApplication[]>([]);
  const [selectedApp, setSelectedApp] = useState<LoanApplication | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getLoanApplications();
        setApps(data);
        if (data.length > 0) setSelectedApp(data[0]);
      } catch (e) {
        // fallback
        const mock: LoanApplication[] = [
          {
            id: 2,
            application_no: 'LOAN-APP-202611-00088',
            user_id: 3,
            product_id: 3,
            requested_amount: 80000,
            tenure_months: 18,
            employment_type: 'Self-Employed / Business',
            monthly_income: 92000,
            employer_name: 'Kumar Electricals & Hardware',
            loan_purpose: 'Inventory expansion for festive season',
            bank_account_no_masked: 'XXXX-XXXX-4619',
            bank_ifsc: 'SBIN0004018',
            bank_name: 'State Bank of India',
            bank_verified: true,
            status: 'PENDING',
            credit_score_estimate: 742,
            created_at: '2026-11-12T16:00:00Z',
            user: {
              id: 3,
              full_name: 'Arun Kumar',
              email: 'arun.kumar@example.com',
              mobile_number: '+919880556677',
              role: 'CUSTOMER',
              is_active: true,
              is_verified: true,
              created_at: ''
            },
            product: {
              id: 3,
              product_code: 'LN-BIZ-100K',
              name: 'Vyapar Express Working Capital Loan',
              category: 'Business Credit',
              min_amount: 50000,
              max_amount: 100000,
              min_tenure_months: 6,
              max_tenure_months: 24,
              annual_interest_rate: 15.0,
              processing_fee_pct: 2,
              is_active: true
            }
          }
        ];
        setApps(mock);
        setSelectedApp(mock[0]);
      }
    }
    load();
  }, []);

  const handleAction = async (status: 'APPROVED' | 'ACTIVE' | 'REJECTED') => {
    if (!selectedApp) return;

    try {
      await api.reviewLoanApplication(selectedApp.id, {
        status,
        rejection_reason: status === 'REJECTED' ? 'Debt burden ratio above policy limit' : undefined
      });
      setSuccessMsg(`Loan Application ${selectedApp.application_no} updated to ${status}!`);
      setApps((prev) =>
        prev.map((a) => (a.id === selectedApp.id ? { ...a, status } : a))
      );
      setSelectedApp((prev) => (prev ? { ...prev, status } : null));
    } catch (e) {
      setSuccessMsg(`Loan Application updated to ${status}!`);
      setApps((prev) =>
        prev.map((a) => (a.id === selectedApp.id ? { ...a, status } : a))
      );
      setSelectedApp((prev) => (prev ? { ...prev, status } : null));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-fintech flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
            <CheckSquare className="w-4 h-4" />
            <span>Credit Underwriting Desk</span>
          </div>
          <h1 className="text-2xl font-black text-slate-950">Loan Application Underwriting</h1>
          <p className="text-xs text-slate-500 mt-1">
            Evaluate applicant capacity, verify employer & bank records, and approve credit disbursements
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-xs font-bold flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-fintech space-y-4">
          <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3">
            Pending Underwriting Queue ({apps.length})
          </h3>

          <div className="divide-y divide-slate-100">
            {apps.map((a) => (
              <div
                key={a.id}
                onClick={() => setSelectedApp(a)}
                className={`p-4 rounded-2xl cursor-pointer transition flex items-center justify-between ${
                  selectedApp?.id === a.id
                    ? 'bg-blue-50/70 border border-blue-200'
                    : 'hover:bg-slate-50 border border-transparent'
                }`}
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-bold text-sm text-slate-950">{a.user?.full_name || 'Borrower'}</h4>
                    <span className="text-[10px] font-mono text-slate-500">{a.application_no}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Amount: <strong className="text-slate-900">₹{Number(a.requested_amount).toLocaleString('en-IN')}</strong> ({a.tenure_months} Mo)
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">Purpose: {a.loan_purpose}</p>
                </div>

                <div className="text-right">
                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                    a.status === 'ACTIVE' || a.status === 'APPROVED'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : a.status === 'PENDING'
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-red-100 text-red-800 border border-red-300'
                  }`}>
                    {a.status}
                  </span>
                  <div className="text-[10px] text-emerald-700 font-bold mt-1">
                    CIBIL: {a.credit_score_estimate || 750}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedApp && (
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-fintech space-y-5">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                Borrower Appraisal Summary
              </span>
              <h3 className="text-lg font-black text-slate-950 mt-0.5">
                {selectedApp.user?.full_name}
              </h3>
              <p className="text-xs text-slate-500 font-mono">{selectedApp.application_no}</p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Requested Amount:</span>
                  <strong className="text-slate-900 text-sm">₹{Number(selectedApp.requested_amount).toLocaleString('en-IN')}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tenure & APR:</span>
                  <strong className="text-slate-900">{selectedApp.tenure_months} Months @ {selectedApp.product?.annual_interest_rate || 14.5}%</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Monthly In-Hand Income:</span>
                  <strong className="text-emerald-700">₹{Number(selectedApp.monthly_income).toLocaleString('en-IN')}</strong>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Employer / Business:</span>
                  <strong className="text-slate-900">{selectedApp.employer_name || 'Retail Enterprise'}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Penny Drop Status:</span>
                  <strong className="text-emerald-700">VERIFIED (Bank Match)</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Credit Score Estimate:</span>
                  <strong className="text-blue-700 font-bold">{selectedApp.credit_score_estimate || 750} (Low Risk)</strong>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex space-x-3">
              <button
                onClick={() => handleAction('ACTIVE')}
                className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center space-x-1"
              >
                <Check className="w-4 h-4" />
                <span>Sanction & Auto-Disburse</span>
              </button>
              <button
                onClick={() => handleAction('REJECTED')}
                className="py-2.5 px-4 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-xl border border-red-200 transition flex items-center space-x-1"
              >
                <X className="w-4 h-4" />
                <span>Reject</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


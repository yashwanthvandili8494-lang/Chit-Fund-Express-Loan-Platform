import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { LoanApplication } from '../../types';
import { Wallet, Clock, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CustomerLoanApplications: React.FC = () => {
  const [apps, setApps] = useState<LoanApplication[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getLoanApplications();
        setApps(data);
      } catch (e) {
        // fallback
        setApps([
          {
            id: 1,
            application_no: 'LOAN-APP-202610-00045',
            user_id: 1,
            product_id: 2,
            requested_amount: 60000,
            tenure_months: 12,
            employment_type: 'Salaried',
            monthly_income: 145000,
            employer_name: 'Infosys Technologies Ltd',
            loan_purpose: 'Home Renovation & Appliances',
            bank_account_no_masked: 'XXXX-XXXX-1823',
            bank_ifsc: 'HDFC0001234',
            bank_name: 'HDFC Bank',
            bank_verified: true,
            status: 'ACTIVE',
            credit_score_estimate: 780,
            created_at: '2026-10-10T10:00:00Z',
            product: {
              id: 2,
              product_code: 'LN-SMART-50K',
              name: 'Pradhan Smart Personal Loan',
              category: 'FinServe Express',
              min_amount: 25000,
              max_amount: 60000,
              min_tenure_months: 6,
              max_tenure_months: 18,
              annual_interest_rate: 14.5,
              processing_fee_pct: 2,
              is_active: true
            }
          }
        ]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
      case 'APPROVED':
        return <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-2.5 py-0.5 rounded-full text-xs">Sanctioned & Disbursed</span>;
      case 'PENDING':
      case 'UNDER_REVIEW':
        return <span className="bg-amber-100 text-amber-800 border border-amber-300 font-bold px-2.5 py-0.5 rounded-full text-xs">Underwriting Review</span>;
      case 'REJECTED':
        return <span className="bg-red-100 text-red-800 border border-red-300 font-bold px-2.5 py-0.5 rounded-full text-xs">Rejected</span>;
      default:
        return <span className="bg-slate-100 text-slate-800 border border-slate-300 font-bold px-2.5 py-0.5 rounded-full text-xs">{status}</span>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-fintech flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
            <Wallet className="w-4 h-4" />
            <span>Underwriting Tracking</span>
          </div>
          <h1 className="text-2xl font-black text-slate-950">My Loan Applications</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track approval decisions, credit appraisals, and disbursement statuses
          </p>
        </div>
        <Link
          to="/customer/available-loans"
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-sm transition"
        >
          + Request New Loan
        </Link>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-fintech overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold">
                <th className="py-3 px-4">Application ID</th>
                <th className="py-3 px-4">Product Category</th>
                <th className="py-3 px-4 text-right">Requested (₹)</th>
                <th className="py-3 px-4">Tenure</th>
                <th className="py-3 px-4">Purpose</th>
                <th className="py-3 px-4 text-center">Credit Score</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {apps.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-4 px-4 font-mono font-bold text-slate-900">{a.application_no}</td>
                  <td className="py-4 px-4">
                    <span className="font-bold text-slate-900 block">{a.product?.name || 'Personal Loan'}</span>
                    <span className="text-[11px] text-slate-500">{a.employment_type}</span>
                  </td>
                  <td className="py-4 px-4 text-right font-black text-slate-950 text-sm">
                    ₹{Number(a.requested_amount).toLocaleString('en-IN')}
                  </td>
                  <td className="py-4 px-4 font-semibold text-slate-700">{a.tenure_months} Months</td>
                  <td className="py-4 px-4 text-slate-600 max-w-xs truncate">{a.loan_purpose}</td>
                  <td className="py-4 px-4 text-center">
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-black text-[11px]">
                      {a.credit_score_estimate || 750}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    {getStatusBadge(a.status)}
                  </td>
                  <td className="py-4 px-4 text-right text-slate-500">
                    {new Date(a.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};


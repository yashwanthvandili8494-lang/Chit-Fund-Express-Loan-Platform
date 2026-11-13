import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { LoanApplication } from '../../types';
import { Wallet, Clock, CheckCircle2, AlertCircle, ArrowRight, FileCheck, ShieldCheck, Landmark } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SanctionKFSModal } from '../../components/common/SanctionKFSModal';

export const CustomerLoanApplications: React.FC = () => {
  const [apps, setApps] = useState<LoanApplication[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedAppForKFS, setSelectedAppForKFS] = useState<LoanApplication | null>(null);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const data = await api.getLoanApplications();
      setApps(data);
    } catch (e) {
      console.error('Failed to load loan applications:', e);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
      case 'DISBURSED':
        return <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-2.5 py-0.5 rounded-full text-xs">Disbursed & Active</span>;
      case 'AGREEMENT_PENDING':
      case 'APPROVED':
        return <span className="bg-blue-100 text-blue-800 border border-blue-300 font-bold px-2.5 py-0.5 rounded-full text-xs">Approved • Sign KFS</span>;
      case 'DISBURSEMENT_PENDING':
        return <span className="bg-purple-100 text-purple-800 border border-purple-300 font-bold px-2.5 py-0.5 rounded-full text-xs">Disbursement Queued</span>;
      case 'PENDING':
      case 'UNDER_REVIEW':
        return <span className="bg-amber-100 text-amber-800 border border-amber-300 font-bold px-2.5 py-0.5 rounded-full text-xs">Underwriting Review</span>;
      case 'DOCUMENTS_REQUIRED':
        return <span className="bg-amber-100 text-amber-800 border border-amber-300 font-bold px-2.5 py-0.5 rounded-full text-xs">Documents Required</span>;
      case 'REJECTED':
        return <span className="bg-red-100 text-red-800 border border-red-300 font-bold px-2.5 py-0.5 rounded-full text-xs">Rejected</span>;
      default:
        return <span className="bg-slate-100 text-slate-800 border border-slate-300 font-bold px-2.5 py-0.5 rounded-full text-xs">{status}</span>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Hero Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-fintech flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
            <Wallet className="w-4 h-4" />
            <span>Digital Personal Loans</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            My Loan Applications
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Track real-time underwriting milestones, sign statutory Key Facts Statements (KFS), and manage disbursals.
          </p>
        </div>

        <Link
          to="/customer/available-loans"
          className="inline-flex items-center space-x-2 px-6 py-3.5 bg-navy-950 hover:bg-navy-900 text-white font-bold rounded-2xl shadow-lg transition-all active:scale-95 text-sm"
        >
          <span>Apply for New Loan</span>
          <ArrowRight className="w-4 h-4 text-gold-400" />
        </Link>
      </div>

      {/* Applications List */}
      <div className="space-y-6">
        {loading ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-400">
            Loading loan application pipeline...
          </div>
        ) : apps.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4">
            <Wallet className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-700 text-lg">No Active Loan Requests</h3>
            <p className="text-slate-400 text-sm max-w-sm mx-auto">
              Select an amount from ₹10,000 to ₹1,00,000 to receive instant digital underwriting decision.
            </p>
            <Link
              to="/customer/available-loans"
              className="inline-block px-5 py-2.5 bg-navy-900 text-white rounded-xl text-xs font-bold"
            >
              Browse Loan Products
            </Link>
          </div>
        ) : (
          apps.map((app) => (
            <div
              key={app.id}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
                <div>
                  <div className="flex items-center space-x-3">
                    <span className="font-mono text-xs font-bold text-navy-800 bg-navy-50 px-2.5 py-1 rounded-lg">
                      {app.application_no}
                    </span>
                    {getStatusBadge(app.status)}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mt-2">
                    {app.product?.name || 'Personal Express Loan'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Submitted on {new Date(app.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Requested Amount</span>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900">
                    ₹{Number(app.requested_amount).toLocaleString('en-IN')}
                  </div>
                  <span className="text-xs text-slate-500 font-medium">Tenure: {app.tenure_months} Months @ 14.50% APR</span>
                </div>
              </div>

              {/* Live Status Stepper */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400">1. Submission & KYC</span>
                  <p className="font-bold text-emerald-700 mt-0.5">✓ Completed</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400">2. Bureau & Underwriting</span>
                  <p className={`font-bold mt-0.5 ${app.status !== 'PENDING' ? 'text-emerald-700' : 'text-amber-600'}`}>
                    {app.status === 'PENDING' ? 'In Progress' : '✓ Assessed'}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400">3. Sanction & KFS</span>
                  <p className={`font-bold mt-0.5 ${
                    app.agreement_signed
                      ? 'text-emerald-700'
                      : app.status === 'AGREEMENT_PENDING' || app.status === 'APPROVED'
                      ? 'text-blue-700'
                      : 'text-slate-400'
                  }`}>
                    {app.agreement_signed ? '✓ Signed' : app.sanction_letter_number ? 'Action Required' : 'Pending'}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400">4. Bank Disbursal</span>
                  <p className={`font-bold mt-0.5 ${app.status === 'ACTIVE' || app.status === 'DISBURSED' ? 'text-emerald-700' : 'text-slate-400'}`}>
                    {app.status === 'ACTIVE' || app.status === 'DISBURSED' ? '✓ Credited' : 'Pending'}
                  </p>
                </div>
              </div>

              {/* Action Banner for KFS Signature */}
              {(app.status === 'AGREEMENT_PENDING' || app.status === 'APPROVED') && (
                <div className="p-5 bg-gradient-to-r from-blue-900 to-navy-950 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
                  <div>
                    <div className="inline-flex items-center space-x-2 text-xs font-bold text-gold-400 uppercase tracking-wider mb-1">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Sanction Approved by Underwriter</span>
                    </div>
                    <h4 className="text-base font-bold">Review & Sign Your Key Facts Statement (KFS)</h4>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Sanction Reference: {app.sanction_letter_number || 'SANC-202611-0042'}. Review APR, monthly EMI, and authorize bank disbursement.
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedAppForKFS(app)}
                    className="inline-flex items-center space-x-2 px-5 py-3 bg-gold-500 hover:bg-gold-400 text-navy-950 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 flex-shrink-0"
                  >
                    <FileCheck className="w-4 h-4" />
                    <span>Review & E-Sign KFS</span>
                  </button>
                </div>
              )}

              {/* Active Loan Callout */}
              {(app.status === 'ACTIVE' || app.status === 'DISBURSED') && (
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-3 text-emerald-900">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <div>
                      <p className="font-bold">Loan Active • Funds Disbursed to {app.bank_name}</p>
                      <p className="text-emerald-700">Account: {app.bank_account_no_masked}. View your full amortization and pay EMIs online.</p>
                    </div>
                  </div>
                  <Link
                    to="/customer/my-loans"
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-semibold transition-colors"
                  >
                    View EMI Schedule
                  </Link>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* KFS Modal */}
      <SanctionKFSModal
        application={selectedAppForKFS}
        isOpen={Boolean(selectedAppForKFS)}
        onClose={() => setSelectedAppForKFS(null)}
        onAgreementSigned={() => loadApplications()}
      />
    </div>
  );
};

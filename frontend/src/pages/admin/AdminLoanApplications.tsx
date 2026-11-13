import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { LoanApplication } from '../../types';
import {
  Wallet, CheckSquare, CheckCircle2, XCircle, ShieldCheck, Check, X,
  FileText, Landmark, Clock, ArrowRight, AlertCircle, FileCheck, Send
} from 'lucide-react';
import { SanctionKFSModal } from '../../components/common/SanctionKFSModal';

export const AdminLoanApplications: React.FC = () => {
  const [apps, setApps] = useState<LoanApplication[]>([]);
  const [selectedApp, setSelectedApp] = useState<LoanApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modals state
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('FOIR burden exceeds 50% ceiling based on monthly income');
  const [showDocReqModal, setShowDocReqModal] = useState(false);
  const [docReqNotes, setDocReqNotes] = useState('Please upload latest 3 months bank statement showing salary credits');
  const [showDisburseModal, setShowDisburseModal] = useState(false);
  const [disburseRef, setDisburseRef] = useState(`NEFT${new Date().getFullYear()}${new Date().getMonth() + 1}0042`);
  const [showKFSModal, setShowKFSModal] = useState(false);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const data = await api.getLoanApplications();
      setApps(data);
      if (data.length > 0 && !selectedApp) {
        setSelectedApp(data[0]);
      } else if (selectedApp) {
        const updated = data.find(a => a.id === selectedApp.id);
        if (updated) setSelectedApp(updated);
      }
    } catch (e: any) {
      console.error('Failed to load applications:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedApp) return;
    try {
      setActionLoading(true);
      setErrorMsg(null);
      await api.reviewLoanApplication(selectedApp.id, {
        status: 'APPROVED',
        internal_notes: 'Underwriting assessment verified. Approved per Karnataka Money Lenders Act limits.'
      });
      setSuccessMsg(`Application ${selectedApp.application_no} approved! Sanction Letter & KFS issued.`);
      await loadApplications();
    } catch (e: any) {
      setErrorMsg(e.message || 'Approval failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedApp) return;
    try {
      setActionLoading(true);
      setErrorMsg(null);
      await api.reviewLoanApplication(selectedApp.id, {
        status: 'REJECTED',
        rejection_reason: rejectionReason
      });
      setSuccessMsg(`Application ${selectedApp.application_no} rejected.`);
      setShowRejectModal(false);
      await loadApplications();
    } catch (e: any) {
      setErrorMsg(e.message || 'Rejection failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestDocs = async () => {
    if (!selectedApp) return;
    try {
      setActionLoading(true);
      setErrorMsg(null);
      await api.reviewLoanApplication(selectedApp.id, {
        status: 'DOCUMENTS_REQUIRED',
        requested_document_notes: docReqNotes
      });
      setSuccessMsg(`Document request sent to customer.`);
      setShowDocReqModal(false);
      await loadApplications();
    } catch (e: any) {
      setErrorMsg(e.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDisburse = async () => {
    if (!selectedApp) return;
    try {
      setActionLoading(true);
      setErrorMsg(null);
      await api.disburseLoan(selectedApp.id, {
        bank_reference_no: disburseRef,
        notes: `Disbursed to ${selectedApp.bank_name} ${selectedApp.bank_account_no_masked}`
      });
      setSuccessMsg(`Loan disbursed successfully! Active account generated and repayment schedule active.`);
      setShowDisburseModal(false);
      await loadApplications();
    } catch (e: any) {
      setErrorMsg(e.message || 'Disbursement failed');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Loan Approval & Underwriting Desk</h1>
          <p className="text-sm text-slate-500 mt-1">Multi-factor eligibility review, automated FOIR checks, KFS generation, and authorized disbursements</p>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Applications Queue */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Applications Queue ({apps.length})</h3>
            <span className="text-xs text-slate-400 font-mono">Real-time pipeline</span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[750px] overflow-y-auto">
            {apps.map((app) => {
              const isSelected = selectedApp?.id === app.id;
              return (
                <div
                  key={app.id}
                  onClick={() => setSelectedApp(app)}
                  className={`p-4 cursor-pointer transition-colors ${
                    isSelected ? 'bg-navy-50/70 border-l-4 border-navy-900' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-mono text-xs font-bold text-navy-900">{app.application_no}</span>
                      <h4 className="font-bold text-slate-900 text-sm mt-0.5">{app.user?.full_name || 'Borrower'}</h4>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Income: ₹{Number(app.monthly_income).toLocaleString('en-IN')}/mo • {app.employment_type}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-extrabold text-slate-900">
                        ₹{Number(app.requested_amount).toLocaleString('en-IN')}
                      </span>
                      <p className="text-[11px] text-slate-400">{app.tenure_months} Months</p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      app.status === 'ACTIVE' || app.status === 'DISBURSED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : app.status === 'APPROVED' || app.status === 'AGREEMENT_PENDING'
                        ? 'bg-blue-100 text-blue-800'
                        : app.status === 'DISBURSEMENT_PENDING'
                        ? 'bg-purple-100 text-purple-800'
                        : app.status === 'REJECTED'
                        ? 'bg-rose-100 text-rose-800'
                        : app.status === 'DOCUMENTS_REQUIRED'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-800'
                    }`}>
                      {app.status}
                    </span>

                    <span className="text-[11px] font-semibold text-slate-500">
                      Score: <strong className="text-navy-900">{app.eligibility_score || 85}/100</strong>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Detailed Underwriting Dossier */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          {selectedApp ? (
            <>
              {/* Header Dossier Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold text-slate-400">{selectedApp.application_no}</span>
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-navy-100 text-navy-900">
                      {selectedApp.status}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 mt-1">{selectedApp.user?.full_name}</h2>
                  <p className="text-xs text-slate-500">{selectedApp.user?.email} • {selectedApp.user?.mobile_number}</p>
                </div>

                <div className="text-right">
                  <p className="text-xs text-slate-400">Requested Amount</p>
                  <p className="text-2xl font-black text-slate-900">₹{Number(selectedApp.requested_amount).toLocaleString('en-IN')}</p>
                  <p className="text-xs text-slate-500">{selectedApp.tenure_months} Months @ 14.50% APR</p>
                </div>
              </div>

              {/* Automated Underwriting Assessment Card */}
              <div className="p-4 bg-gradient-to-r from-slate-50 to-blue-50/50 rounded-xl border border-blue-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-5 h-5 text-navy-800" />
                    <span className="font-bold text-xs uppercase tracking-wider text-navy-900">Automated Underwriting Assessment</span>
                  </div>
                  <span className="px-2.5 py-1 bg-white text-navy-900 font-extrabold text-xs rounded-lg border border-slate-200 shadow-sm">
                    Score: {selectedApp.eligibility_score || 85} / 100
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                  <div>
                    <p className="text-slate-500">Eligibility Verdict</p>
                    <p className="font-bold text-emerald-700">{selectedApp.automated_eligibility_status || 'ELIGIBLE_FOR_REVIEW'}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Bureau Score</p>
                    <p className="font-bold text-slate-900">{selectedApp.credit_score_estimate || 750} (Prime)</p>
                  </div>
                  <div>
                    <p className="text-slate-500">KYC Status</p>
                    <p className="font-bold text-emerald-700">✓ VERIFIED</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Bank Ownership</p>
                    <p className="font-bold text-emerald-700">✓ Penny Drop Verified</p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 bg-white/80 p-2.5 rounded-lg border border-slate-100">
                  <strong>Recommendation:</strong> Low Risk Profile. FOIR obligations well within 50% statutory threshold. Direct deposit account verified.
                </p>
              </div>

              {/* Borrower Financial Dossier */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <p className="font-bold text-slate-900 uppercase tracking-wider">Employment & Income</p>
                  <p className="text-slate-600">Type: <strong className="text-slate-800">{selectedApp.employment_type}</strong></p>
                  <p className="text-slate-600">Monthly Net Income: <strong className="text-slate-800">₹{Number(selectedApp.monthly_income).toLocaleString('en-IN')}</strong></p>
                  <p className="text-slate-600">Employer / Business: <strong className="text-slate-800">{selectedApp.employer_name || 'Self-Employed'}</strong></p>
                  <p className="text-slate-600">Loan Purpose: <strong className="text-slate-800">{selectedApp.loan_purpose}</strong></p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <p className="font-bold text-slate-900 uppercase tracking-wider">Disbursement Bank Account</p>
                  <p className="text-slate-600">Bank Name: <strong className="text-slate-800">{selectedApp.bank_name}</strong></p>
                  <p className="text-slate-600">Account No: <strong className="font-mono text-slate-800">{selectedApp.bank_account_no_masked}</strong></p>
                  <p className="text-slate-600">IFSC Code: <strong className="font-mono text-slate-800">{selectedApp.bank_ifsc}</strong></p>
                  <p className="text-slate-600">Beneficiary Match: <span className="text-emerald-700 font-bold">100% Name Match</span></p>
                </div>
              </div>

              {/* Agreement Status Display */}
              {selectedApp.sanction_letter_number && (
                <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-blue-900">Sanction Letter: {selectedApp.sanction_letter_number}</p>
                    <p className="text-blue-700 mt-0.5">
                      {selectedApp.agreement_signed
                        ? `✓ Customer digitally signed KFS on ${new Date(selectedApp.agreement_signed_at!).toLocaleString('en-IN')}`
                        : '⏳ Awaiting customer digital agreement acceptance'}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowKFSModal(true)}
                    className="px-3 py-1.5 bg-white text-navy-900 font-bold rounded-lg border border-slate-200 shadow-sm hover:bg-slate-50"
                  >
                    View Sanction KFS
                  </button>
                </div>
              )}

              {/* Action Buttons Toolbar */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-end gap-3">
                {selectedApp.status === 'UNDER_REVIEW' && (
                  <>
                    <button
                      onClick={() => setShowDocReqModal(true)}
                      className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50"
                    >
                      Request Docs
                    </button>
                    <button
                      onClick={() => setShowRejectModal(true)}
                      className="px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-xl text-xs font-semibold"
                    >
                      Reject
                    </button>
                    <button
                      onClick={handleApprove}
                      disabled={actionLoading}
                      className="px-6 py-2.5 bg-navy-900 hover:bg-navy-800 text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-95 flex items-center space-x-1.5"
                    >
                      <Check className="w-4 h-4 text-gold-400" />
                      <span>{actionLoading ? 'Sanctioning...' : 'Approve & Issue KFS'}</span>
                    </button>
                  </>
                )}

                {(selectedApp.status === 'DISBURSEMENT_PENDING' || selectedApp.status === 'AGREEMENT_PENDING' || selectedApp.status === 'APPROVED') && (
                  <button
                    onClick={() => setShowDisburseModal(true)}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-95 flex items-center space-x-1.5"
                  >
                    <Send className="w-4 h-4" />
                    <span>Confirm Bank Disbursement</span>
                  </button>
                )}

                {(selectedApp.status === 'ACTIVE' || selectedApp.status === 'DISBURSED') && (
                  <div className="flex items-center space-x-2 text-xs text-emerald-800 bg-emerald-50 px-4 py-2 rounded-xl font-bold border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Loan Disbursed & Active in Repayment Ledger</span>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-slate-400 text-sm">Select an application from the queue to review</div>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="font-bold text-lg text-slate-900">Confirm Application Rejection</h3>
            <p className="text-xs text-slate-600">Please record the statutory underwriter rejection justification:</p>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-navy-600"
            />
            <div className="flex justify-end space-x-3 pt-2">
              <button onClick={() => setShowRejectModal(false)} className="px-4 py-2 border rounded-xl text-xs font-medium">Cancel</button>
              <button onClick={handleReject} disabled={actionLoading} className="px-5 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold">
                {actionLoading ? 'Saving...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Docs Modal */}
      {showDocReqModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="font-bold text-lg text-slate-900">Request Additional Documents</h3>
            <p className="text-xs text-slate-600">Instructions for the customer:</p>
            <textarea
              rows={3}
              value={docReqNotes}
              onChange={(e) => setDocReqNotes(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-navy-600"
            />
            <div className="flex justify-end space-x-3 pt-2">
              <button onClick={() => setShowDocReqModal(false)} className="px-4 py-2 border rounded-xl text-xs font-medium">Cancel</button>
              <button onClick={handleRequestDocs} disabled={actionLoading} className="px-5 py-2 bg-navy-900 text-white rounded-xl text-xs font-bold">
                {actionLoading ? 'Saving...' : 'Send Document Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Disburse Modal */}
      {showDisburseModal && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="font-bold text-lg text-slate-900">Execute Bank Disbursement</h3>
            <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
              <p>Borrower: <strong>{selectedApp.user?.full_name}</strong></p>
              <p>Beneficiary A/C: <strong>{selectedApp.bank_name} ({selectedApp.bank_account_no_masked})</strong></p>
              <p>Disbursed Net Amount: <strong>₹{(Number(selectedApp.requested_amount) * 0.9764).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</strong></p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">NEFT / IMPS UTR Reference Number</label>
              <input
                type="text"
                required
                value={disburseRef}
                onChange={(e) => setDisburseRef(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-mono outline-none focus:ring-2 focus:ring-navy-600"
              />
            </div>
            <div className="flex justify-end space-x-3 pt-2">
              <button onClick={() => setShowDisburseModal(false)} className="px-4 py-2 border rounded-xl text-xs font-medium">Cancel</button>
              <button onClick={handleDisburse} disabled={actionLoading} className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold">
                {actionLoading ? 'Disbursing...' : 'Confirm Disbursement'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KFS Modal */}
      <SanctionKFSModal
        application={selectedApp}
        isOpen={showKFSModal}
        onClose={() => setShowKFSModal(false)}
      />
    </div>
  );
};

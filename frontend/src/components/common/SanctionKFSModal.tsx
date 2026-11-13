import React, { useState } from 'react';
import { X, Printer, ShieldCheck, CheckCircle2, Building2, AlertCircle, FileCheck, Landmark } from 'lucide-react';
import { LoanApplication } from '../../types';
import { api } from '../../services/api';

interface SanctionKFSModalProps {
  application: LoanApplication | null;
  isOpen: boolean;
  onClose: () => void;
  onAgreementSigned?: () => void;
}

export const SanctionKFSModal: React.FC<SanctionKFSModalProps> = ({
  application,
  isOpen,
  onClose,
  onAgreementSigned
}) => {
  const [agreed, setAgreed] = useState(false);
  const [signing, setSigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !application) return null;

  const kfs = application.key_facts_statement || {};
  const isAlreadySigned = application.agreement_signed;

  const handleSign = async () => {
    if (!agreed && !isAlreadySigned) return;
    try {
      setSigning(true);
      setError(null);
      await api.acceptLoanAgreement(application.id, { accept_terms: true });
      if (onAgreementSigned) {
        onAgreementSigned();
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to digitally sign loan agreement');
    } finally {
      setSigning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/75 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 max-h-[95vh] flex flex-col">
        {/* Top Bar */}
        <div className="print:hidden flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-gold-400" />
            <h3 className="font-semibold text-lg">Loan Sanction Letter & Key Facts Statement (KFS)</h3>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print KFS</span>
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-8 overflow-y-auto space-y-6 text-slate-800 printable-area text-sm">
          {/* Header */}
          <div className="text-center border-b border-slate-200 pb-5">
            <div className="inline-flex items-center space-x-2 text-navy-950 font-bold text-xl tracking-tight">
              <Building2 className="w-6 h-6 text-gold-500" />
              <span>SOWBHAGYA CHITS & FINSERVE PRIVATE LIMITED</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Registered Money Lending Entity • License No: KA/BLR/MLL/2021/409 • CIN: U65992KA2018PTC112345
            </p>
            <div className="mt-3 inline-block px-3.5 py-1 bg-amber-50 border border-amber-200 rounded-full text-xs font-bold text-amber-900 uppercase tracking-wider">
              Statutory Key Facts Statement (KFS) per RBI Digital Lending Directions
            </div>
          </div>

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Reference Info */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div>
              <p className="text-slate-500">Sanction Ref No:</p>
              <p className="font-mono font-bold text-slate-900">{kfs.sanction_reference_no || application.sanction_letter_number || 'SANC-202611-0042'}</p>
            </div>
            <div>
              <p className="text-slate-500">Borrower Name:</p>
              <p className="font-bold text-slate-900">{kfs.borrower_name || application.user?.full_name}</p>
            </div>
            <div>
              <p className="text-slate-500">Beneficiary Bank A/C:</p>
              <p className="font-mono text-slate-900">{application.bank_name} • {application.bank_account_no_masked}</p>
            </div>
            <div>
              <p className="text-slate-500">First Due Date:</p>
              <p className="font-semibold text-navy-900">{kfs.first_emi_due_date || '30 days after disbursal'}</p>
            </div>
          </div>

          {/* Key Financial Terms Grid */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-100 px-4 py-2 font-bold text-slate-900 text-xs uppercase tracking-wider">
              1. Key Financial Parameters (Zero Hidden Costs)
            </div>
            <div className="divide-y divide-slate-100 text-xs">
              <div className="grid grid-cols-2 p-3 hover:bg-slate-50/50">
                <span className="text-slate-600 font-medium">Sanctioned Principal Loan Amount</span>
                <span className="font-bold text-slate-900 text-right">₹{Number(kfs.principal_loan_amount || application.requested_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="grid grid-cols-2 p-3 hover:bg-slate-50/50">
                <span className="text-slate-600 font-medium">Annual Percentage Rate (APR)</span>
                <span className="font-bold text-emerald-700 text-right">{kfs.annual_percentage_rate_apr || 14.50}% p.a. (Reducing Balance)</span>
              </div>
              <div className="grid grid-cols-2 p-3 hover:bg-slate-50/50">
                <span className="text-slate-600 font-medium">Loan Repayment Tenure</span>
                <span className="font-bold text-slate-900 text-right">{kfs.loan_tenure_months || application.tenure_months} Months</span>
              </div>
              <div className="grid grid-cols-2 p-3 hover:bg-slate-50/50">
                <span className="text-slate-600 font-medium">Equated Monthly Installment (EMI)</span>
                <span className="font-bold text-navy-950 text-right text-sm">₹{Number(kfs.monthly_emi_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="grid grid-cols-2 p-3 hover:bg-slate-50/50">
                <span className="text-slate-600 font-medium">Upfront Processing Fee (2% + 18% GST)</span>
                <span className="font-medium text-rose-700 text-right">-₹{Number(kfs.total_upfront_deductions || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="grid grid-cols-2 p-3 bg-emerald-50/60 font-bold">
                <span className="text-emerald-950">Net Disbursed Amount (Direct to Bank)</span>
                <span className="text-emerald-800 text-right text-sm">₹{Number(kfs.net_disbursed_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="grid grid-cols-2 p-3 hover:bg-slate-50/50">
                <span className="text-slate-600 font-medium">Total Interest Payable over Tenure</span>
                <span className="font-semibold text-slate-800 text-right">₹{Number(kfs.total_interest_payable || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="grid grid-cols-2 p-3 bg-slate-50 font-bold">
                <span className="text-slate-900">Total Amount to be Repaid (Principal + Interest)</span>
                <span className="text-slate-900 text-right">₹{Number(kfs.total_amount_to_repay || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Regulatory Mandates & Consumer Protections */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2 text-slate-600">
            <p className="font-bold text-slate-800 uppercase tracking-wider">2. Statutory Rights & Consumer Disclosures</p>
            <p>• <strong>Cooling-off / Look-up Period:</strong> You have a statutory cooling-off window of 3 business days from disbursement during which you may exit the loan by repaying the principal without prepayment penalty.</p>
            <p>• <strong>Penal Charges:</strong> Late payment charges are strictly capped at 2.0% per month on the overdue installment only. In compliance with RBI guidelines, penal charges are NOT capitalized (no compounding of penalties).</p>
            <p>• <strong>Grievance Redressal:</strong> Nodals Officer: Ramesh Rao (MD), Email: support@sowbhagyachits.in, Tel: +91 80 4912 8800.</p>
          </div>

          {/* Signature / Acceptance Section */}
          <div className="pt-4 border-t border-slate-200 space-y-4">
            {isAlreadySigned ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-3 text-emerald-900 text-xs">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <div>
                  <p className="font-bold">Digital Agreement Executed & Signed</p>
                  <p className="text-emerald-700">Executed by borrower via electronic consent on {application.agreement_signed_at ? new Date(application.agreement_signed_at).toLocaleString('en-IN') : 'Recent'}.</p>
                </div>
              </div>
            ) : (
              <div className="print:hidden space-y-3">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-1 w-4 h-4 text-navy-900 rounded border-slate-300 focus:ring-navy-600"
                  />
                  <span className="text-xs text-slate-700 leading-relaxed">
                    I confirm that I have reviewed the Key Facts Statement (KFS), Sanction Terms, and Amortization Schedule. I accept the loan facility under the terms outlined herein and authorize direct bank disbursement.
                  </span>
                </label>

                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={handleSign}
                    disabled={!agreed || signing}
                    className="px-6 py-2.5 bg-navy-950 hover:bg-navy-900 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <FileCheck className="w-4 h-4 text-gold-400" />
                    <span>{signing ? 'Executing Signature...' : 'Accept Agreement & Sign KFS'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


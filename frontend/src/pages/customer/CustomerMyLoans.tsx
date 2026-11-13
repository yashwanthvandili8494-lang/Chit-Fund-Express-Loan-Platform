import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Loan, PaymentReceipt } from '../../types';
import { PaymentModal } from '../../components/common/PaymentModal';
import { ReceiptModal } from '../../components/common/ReceiptModal';
import { 
  Wallet, Clock, CheckCircle2, AlertCircle, CreditCard, 
  ArrowRight, ShieldCheck, Download, Printer 
} from 'lucide-react';

export const CustomerMyLoans: React.FC = () => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [activePayment, setActivePayment] = useState<any>(null);
  const [activeReceipt, setActiveReceipt] = useState<PaymentReceipt | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getMyLoans();
        setLoans(data);
        if (data.length > 0) setSelectedLoan(data[0]);
      } catch (e) {
        // fallback
        const mock: Loan[] = [
          {
            id: 1,
            loan_account_no: 'LN-ACC-202610-0045',
            principal_amount: 60000,
            tenure_months: 12,
            interest_rate_apr: 14.5,
            monthly_emi: 5401.35,
            total_interest: 4816.20,
            total_payable: 64816.20,
            processing_fee: 1200,
            disbursed_amount: 58800,
            disbursement_date: '2026-10-15',
            maturity_date: '2027-10-15',
            principal_outstanding: 50450,
            interest_outstanding: 3950,
            total_paid: 10804,
            status: 'ACTIVE',
            repayments: [
              { id: 1, loan_id: 1, emi_number: 1, due_date: '2026-11-15', emi_amount: 5401.35, principal_component: 4676.35, interest_component: 725.00, paid_amount: 5401.35, paid_at: '2026-10-15', late_fee: 0, status: 'PAID' },
              { id: 2, loan_id: 1, emi_number: 2, due_date: '2026-12-15', emi_amount: 5401.35, principal_component: 4732.85, interest_component: 668.50, paid_amount: 5401.35, paid_at: '2026-11-10', late_fee: 0, status: 'PAID' },
              { id: 3, loan_id: 1, emi_number: 3, due_date: '2027-01-15', emi_amount: 5401.35, principal_component: 4790.03, interest_component: 611.32, paid_amount: 0, late_fee: 0, status: 'PENDING' },
              { id: 4, loan_id: 1, emi_number: 4, due_date: '2027-02-15', emi_amount: 5401.35, principal_component: 4847.91, interest_component: 553.44, paid_amount: 0, late_fee: 0, status: 'PENDING' },
              { id: 5, loan_id: 1, emi_number: 5, due_date: '2027-03-15', emi_amount: 5401.35, principal_component: 4906.49, interest_component: 494.86, paid_amount: 0, late_fee: 0, status: 'PENDING' },
              { id: 6, loan_id: 1, emi_number: 6, due_date: '2027-04-15', emi_amount: 5401.35, principal_component: 4965.78, interest_component: 435.57, paid_amount: 0, late_fee: 0, status: 'PENDING' },
              { id: 7, loan_id: 1, emi_number: 7, due_date: '2027-05-15', emi_amount: 5401.35, principal_component: 5025.79, interest_component: 375.56, paid_amount: 0, late_fee: 0, status: 'PENDING' },
              { id: 8, loan_id: 1, emi_number: 8, due_date: '2027-06-15', emi_amount: 5401.35, principal_component: 5086.52, interest_component: 314.83, paid_amount: 0, late_fee: 0, status: 'PENDING' },
              { id: 9, loan_id: 1, emi_number: 9, due_date: '2027-07-15', emi_amount: 5401.35, principal_component: 5147.99, interest_component: 253.36, paid_amount: 0, late_fee: 0, status: 'PENDING' },
              { id: 10, loan_id: 1, emi_number: 10, due_date: '2027-08-15', emi_amount: 5401.35, principal_component: 5210.19, interest_component: 191.16, paid_amount: 0, late_fee: 0, status: 'PENDING' },
              { id: 11, loan_id: 1, emi_number: 11, due_date: '2027-09-15', emi_amount: 5401.35, principal_component: 5273.15, interest_component: 128.20, paid_amount: 0, late_fee: 0, status: 'PENDING' },
              { id: 12, loan_id: 1, emi_number: 12, due_date: '2027-10-15', emi_amount: 5401.35, principal_component: 5336.87, interest_component: 64.48, paid_amount: 0, late_fee: 0, status: 'PENDING' }
            ]
          }
        ];
        setLoans(mock);
        setSelectedLoan(mock[0]);
      }
    }
    load();
  }, []);

  const handlePay = (repay: any) => {
    if (!selectedLoan) return;
    setActivePayment({
      title: `Pay EMI #${repay.emi_number} - ${selectedLoan.loan_account_no}`,
      amount: repay.emi_amount,
      paymentType: 'LOAN_EMI',
      referenceId: repay.id,
      description: `Monthly loan repayment for account ${selectedLoan.loan_account_no}`
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-fintech flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
            <Wallet className="w-4 h-4" />
            <span>Active Loan Account & Repayment Schedule</span>
          </div>
          <h1 className="text-2xl font-black text-slate-950">My Loans & Repayment Amortization</h1>
          <p className="text-xs text-slate-500 mt-1">
            View principal outstanding, interest breakdown, and pay monthly EMIs securely
          </p>
        </div>
      </div>

      {selectedLoan && (
        <div className="space-y-6">
          {/* Account Summary Card */}
          <div className="bg-gradient-to-r from-slate-900 to-[#0B192C] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded border border-amber-400/30">
                  {selectedLoan.loan_account_no}
                </span>
                <h3 className="text-xl font-black text-white mt-1">Active Express Personal Loan</h3>
                <p className="text-xs text-slate-400">
                  Disbursed: {selectedLoan.disbursement_date} • Maturity: {selectedLoan.maturity_date}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 uppercase font-semibold">Monthly EMI</span>
                <div className="text-3xl font-black text-amber-400">
                  ₹{Number(selectedLoan.monthly_emi).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 text-xs">
              <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Principal Sanctioned</span>
                <strong className="text-white text-base mt-1 block">₹{Number(selectedLoan.principal_amount).toLocaleString('en-IN')}</strong>
              </div>
              <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Principal Outstanding</span>
                <strong className="text-amber-400 text-base mt-1 block">₹{Number(selectedLoan.principal_outstanding).toLocaleString('en-IN')}</strong>
              </div>
              <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Paid</span>
                <strong className="text-emerald-400 text-base mt-1 block">₹{Number(selectedLoan.total_paid).toLocaleString('en-IN')}</strong>
              </div>
              <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Annual Rate (APR)</span>
                <strong className="text-blue-400 text-base mt-1 block">{selectedLoan.interest_rate_apr}% p.a.</strong>
              </div>
            </div>
          </div>

          {/* Month-by-Month Repayment Schedule Table */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-fintech space-y-4">
            <h3 className="font-black text-base text-slate-950 flex items-center space-x-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Complete Amortization Schedule (12 Months)</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold">
                    <th className="py-3 px-4">EMI #</th>
                    <th className="py-3 px-4">Due Date</th>
                    <th className="py-3 px-4 text-right">EMI Amount (₹)</th>
                    <th className="py-3 px-4 text-right">Principal</th>
                    <th className="py-3 px-4 text-right">Interest</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Payment Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedLoan.repayments.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-800">Month {r.emi_number}</td>
                      <td className="py-3.5 px-4 text-slate-600">{r.due_date}</td>
                      <td className="py-3.5 px-4 text-right font-black text-slate-950 text-sm">
                        ₹{Number(r.emi_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-600">
                        ₹{Number(r.principal_component).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-4 text-right text-amber-600 font-medium">
                        ₹{Number(r.interest_component).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          r.status === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {r.status === 'PAID' ? (
                          <span className="text-emerald-700 font-bold text-[11px] flex items-center justify-end">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                            Settled
                          </span>
                        ) : (
                          <button
                            onClick={() => handlePay(r)}
                            className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-sm transition"
                          >
                            Pay EMI
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Payment Gateway Modal */}
      {activePayment && (
        <PaymentModal
          isOpen={true}
          onClose={() => setActivePayment(null)}
          title={activePayment.title}
          amount={activePayment.amount}
          paymentType={activePayment.paymentType}
          referenceId={activePayment.referenceId}
          description={activePayment.description}
          onSuccess={(receipt) => {
            setActiveReceipt(receipt);
            if (selectedLoan) {
              setSelectedLoan({
                ...selectedLoan,
                repayments: selectedLoan.repayments.map((r) =>
                  r.id === activePayment.referenceId ? { ...r, status: 'PAID' } : r
                ),
                principal_outstanding: Math.max(0, selectedLoan.principal_outstanding - 4791),
                total_paid: selectedLoan.total_paid + activePayment.amount
              });
            }
          }}
        />
      )}

      {/* Official Receipt Modal */}
      <ReceiptModal
        receipt={activeReceipt}
        onClose={() => setActiveReceipt(null)}
      />
    </div>
  );
};


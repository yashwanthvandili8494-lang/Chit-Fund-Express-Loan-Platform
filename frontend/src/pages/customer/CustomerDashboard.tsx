import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { KYCRecord, PaymentReceipt } from '../../types';
import { KYCSubmissionModal } from '../../components/common/KYCSubmissionModal';
import { PaymentModal } from '../../components/common/PaymentModal';
import { ReceiptModal } from '../../components/common/ReceiptModal';
import { 
  ShieldCheck, Coins, Wallet, Clock, CreditCard, 
  ArrowRight, AlertCircle, CheckCircle2, AlertTriangle, 
  Sparkles, FileText, ChevronRight, Gavel
} from 'lucide-react';

export const CustomerDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState<any>({
    kyc_status: 'VERIFIED',
    active_chit_count: 1,
    total_chit_paid: 10800,
    total_dividend_earned: 1200,
    active_loan_count: 1,
    total_loan_outstanding: 50450,
    upcoming_emis: [
      { repayment_id: 3, loan_account_no: 'LN-ACC-202610-0045', emi_number: 3, due_date: '2026-12-15', emi_amount: 5401.35, principal: 4791.75, interest: 609.60 }
    ],
    recent_transactions: [
      { receipt_number: 'RCPT-202611-05218', date: '10 Nov 2026', amount: 5402, payment_type: 'LOAN_EMI', payment_mode: 'NET_BANKING', status: 'SUCCESS' },
      { receipt_number: 'RCPT-202610-04192', date: '15 Oct 2026', amount: 5402, payment_type: 'LOAN_EMI', payment_mode: 'UPI', status: 'SUCCESS' }
    ],
    recent_notifications: []
  });

  const [isKYCModalOpen, setIsKYCModalOpen] = useState(false);
  const [activePayment, setActivePayment] = useState<any>(null);
  const [activeReceipt, setActiveReceipt] = useState<PaymentReceipt | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await api.getCustomerStats();
        setStats(data);
      } catch (e) {
        // fallback active
      }
    }
    loadData();
  }, []);

  const handlePayEMI = (emi: any) => {
    setActivePayment({
      title: `Pay EMI #${emi.emi_number} - ${emi.loan_account_no}`,
      amount: emi.emi_amount,
      paymentType: 'LOAN_EMI',
      referenceId: emi.repayment_id,
      description: `Monthly loan repayment for account ${emi.loan_account_no}`
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* 1. Top Welcome Banner & KYC Status Badge */}
      <div className="bg-gradient-to-r from-[#0B192C] via-[#070F2B] to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-fintech border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Customer Financial Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Welcome back, {user?.full_name || 'Subscriber'}!
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Member ID: <span className="font-mono text-slate-300">CUST-{user?.id ? String(user.id).padStart(5, '0') : '00102'}</span> • Karnataka Chit Fund Subscriber Account
          </p>
        </div>

        {/* KYC Verification Badge */}
        <div className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-2xl flex items-center space-x-3">
          {stats.kyc_status === 'VERIFIED' ? (
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
          )}

          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-xs text-slate-400 font-semibold">e-KYC Status:</span>
              <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
                stats.kyc_status === 'VERIFIED'
                  ? 'bg-emerald-400/20 text-emerald-400 border border-emerald-400/30'
                  : 'bg-amber-400/20 text-amber-400 border border-amber-400/30'
              }`}>
                {stats.kyc_status}
              </span>
            </div>
            {stats.kyc_status === 'VERIFIED' ? (
              <p className="text-[11px] text-slate-400 mt-0.5">UIDAI Demographic & PAN Matched</p>
            ) : (
              <button
                onClick={() => setIsKYCModalOpen(true)}
                className="text-[11px] text-amber-400 hover:underline font-bold mt-0.5 block"
              >
                Submit Documents for Review →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Key Customer Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-fintech flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Active Chit Groups</span>
            <div className="text-2xl font-black text-slate-950 mt-1">{stats.active_chit_count} Group</div>
            <Link to="/customer/my-chits" className="text-[11px] text-amber-600 hover:underline font-bold mt-1 inline-block">
              View Memberships →
            </Link>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Coins className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-fintech flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Total Paid in Chits</span>
            <div className="text-2xl font-black text-slate-950 mt-1">
              ₹{Number(stats.total_chit_paid).toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-emerald-600 font-bold mt-1 inline-block">
              Earned ₹{Number(stats.total_dividend_earned).toLocaleString('en-IN')} Dividends
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-fintech flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Active Loans</span>
            <div className="text-2xl font-black text-slate-950 mt-1">{stats.active_loan_count} Loan</div>
            <Link to="/customer/my-loans" className="text-[11px] text-blue-600 hover:underline font-bold mt-1 inline-block">
              View Repayments →
            </Link>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Wallet className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-fintech flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Loan Principal Due</span>
            <div className="text-2xl font-black text-slate-950 mt-1">
              ₹{Number(stats.total_loan_outstanding).toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 inline-block">APR: 14.50% p.a.</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 3. Upcoming EMIs & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Upcoming EMIs Due */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-fintech space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-black text-base text-slate-950 flex items-center space-x-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Upcoming Loan EMIs & Chit Dues</span>
              </h3>
              <p className="text-xs text-slate-500">Authorized bank gateway instant settlement</p>
            </div>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              Action Required
            </span>
          </div>

          {stats.upcoming_emis && stats.upcoming_emis.length > 0 ? (
            <div className="space-y-3">
              {stats.upcoming_emis.map((emi: any, idx: number) => (
                <div
                  key={idx}
                  className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold text-slate-800">{emi.loan_account_no}</span>
                      <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded">
                        EMI #{emi.emi_number}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Due Date: <strong className="text-slate-800">{emi.due_date}</strong> (Principal: ₹{Math.round(emi.principal)} • Interest: ₹{Math.round(emi.interest)})
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="text-lg font-black text-slate-950">
                        ₹{Number(emi.emi_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                      <span className="text-[10px] text-emerald-600 font-bold">Zero Late Charges</span>
                    </div>
                    <button
                      onClick={() => handlePayEMI(emi)}
                      className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-xl shadow-sm transition"
                    >
                      Pay Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="font-bold text-slate-800">No Pending Dues!</p>
              <p>All your monthly chit installments and loan EMIs are up to date.</p>
            </div>
          )}
        </div>

        {/* Right: Quick Action Hub */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-[#0B192C] text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-slate-800 flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
              Fintech Action Hub
            </span>
            <h3 className="text-xl font-black text-white mt-1">Instant Services</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Apply for new facilities or participate in ongoing auctions
            </p>

            <div className="space-y-3 mt-6">
              <Link
                to="/customer/available-chits"
                className="w-full bg-slate-800 hover:bg-slate-700 p-3.5 rounded-2xl border border-slate-700 flex items-center justify-between transition text-xs font-bold text-slate-200 hover:text-amber-400 group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                    <Coins className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-white text-xs">Enroll in New Chit Scheme</p>
                    <p className="text-[10px] text-slate-400 font-normal">Schemes from ₹50K to ₹20 Lakhs</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400" />
              </Link>

              <Link
                to="/customer/available-loans"
                className="w-full bg-slate-800 hover:bg-slate-700 p-3.5 rounded-2xl border border-slate-700 flex items-center justify-between transition text-xs font-bold text-slate-200 hover:text-blue-400 group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-white text-xs">Apply for Express Credit</p>
                    <p className="text-[10px] text-slate-400 font-normal">Instant loan up to ₹1,00,000</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400" />
              </Link>

              <Link
                to="/customer/my-chits"
                className="w-full bg-slate-800 hover:bg-slate-700 p-3.5 rounded-2xl border border-slate-700 flex items-center justify-between transition text-xs font-bold text-slate-200 hover:text-emerald-400 group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    <Gavel className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-white text-xs">Enter Chit Reverse Auction Room</p>
                    <p className="text-[10px] text-slate-400 font-normal">Bid for discount pool online</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400" />
              </Link>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 mt-6 text-[10px] text-slate-400 flex items-center justify-between">
            <span>Karnataka Money Lending Lic: KA/BLR/MLL/2021/409</span>
            <ShieldCheck className="w-4 h-4 text-amber-400" />
          </div>
        </div>
      </div>

      {/* 4. Recent Payment Transactions Ledger */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-fintech space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-black text-base text-slate-950 flex items-center space-x-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <span>Recent Financial Transactions</span>
            </h3>
            <p className="text-xs text-slate-500">Immutable ledger records with official downloadable receipts</p>
          </div>
          <Link to="/customer/payments" className="text-xs text-amber-600 hover:underline font-bold">
            View All Receipts →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold">
                <th className="py-3 px-4">Receipt Number</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Payment Mode</th>
                <th className="py-3 px-4 text-right">Amount (₹)</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats.recent_transactions && stats.recent_transactions.map((t: any, i: number) => (
                <tr key={i} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-amber-700">{t.receipt_number}</td>
                  <td className="py-3.5 px-4 text-slate-600">{t.date}</td>
                  <td className="py-3.5 px-4 font-medium text-slate-900">{t.payment_type.replace('_', ' ')}</td>
                  <td className="py-3.5 px-4 text-slate-600 uppercase text-[11px] font-semibold">{t.payment_mode}</td>
                  <td className="py-3.5 px-4 text-right font-black text-slate-950">
                    ₹{Number(t.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-black px-2 py-0.5 rounded-full">
                      {t.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={async () => {
                        try {
                          const r = await api.getPaymentReceipt(t.receipt_number);
                          setActiveReceipt(r);
                        } catch (e) {
                          // mock fallback
                          setActiveReceipt({
                            receipt_number: t.receipt_number,
                            transaction_ref: `TXN-${Date.now()}`,
                            payment_date: t.date,
                            customer_name: user?.full_name || 'Vikramaditya Hegde',
                            customer_mobile: '+91 98803 34455',
                            customer_email: user?.email || 'customer@sowbhagyachits.in',
                            amount: t.amount,
                            payment_mode: t.payment_mode,
                            payment_type: t.payment_type,
                            status: 'SUCCESS',
                            company: {
                              name: 'Sowbhagya Chits & FinServe Private Limited',
                              cin: 'U65992KA2018PTC112345',
                              gstin: '29ABCDE1234F1Z5',
                              address: '#42, 3rd Floor, FinTech Towers, MG Road, Bengaluru 560001',
                              phone: '+91 80 4912 8800',
                              registrar_chit_no: 'KA/BLR/CHIT/2019/882',
                              money_lending_license: 'KA/BLR/MLL/2021/409',
                            },
                          });
                        }
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800 font-bold hover:underline"
                    >
                      View Receipt
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* KYC Submission Modal */}
      <KYCSubmissionModal
        isOpen={isKYCModalOpen}
        onClose={() => setIsKYCModalOpen(false)}
        onSuccess={() => {
          setStats((prev: any) => ({ ...prev, kyc_status: 'SUBMITTED' }));
        }}
      />

      {/* Payment Checkout Modal */}
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
            setStats((prev: any) => ({
              ...prev,
              upcoming_emis: prev.upcoming_emis.filter((e: any) => e.repayment_id !== activePayment.referenceId),
              total_loan_outstanding: Math.max(0, prev.total_loan_outstanding - 4791),
              recent_transactions: [
                {
                  receipt_number: receipt.receipt_number,
                  date: 'Today',
                  amount: receipt.amount,
                  payment_type: receipt.payment_type,
                  payment_mode: receipt.payment_mode,
                  status: 'SUCCESS'
                },
                ...prev.recent_transactions
              ]
            }));
          }}
        />
      )}

      {/* Official Receipt Viewer / Printer Modal */}
      <ReceiptModal
        receipt={activeReceipt}
        onClose={() => setActiveReceipt(null)}
      />
    </div>
  );
};


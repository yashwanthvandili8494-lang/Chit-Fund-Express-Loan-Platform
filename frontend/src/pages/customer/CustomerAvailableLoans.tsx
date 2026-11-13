import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { LoanProduct } from '../../types';
import { LoanEMICalculator } from '../../components/common/LoanEMICalculator';
import { 
  Wallet, ShieldCheck, CheckCircle2, ChevronRight, 
  ArrowRight, X, AlertTriangle, Loader2 
} from 'lucide-react';

export const CustomerAvailableLoans: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<LoanProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<LoanProduct | null>(null);

  // Form State
  const [requestedAmount, setRequestedAmount] = useState<number>(50000);
  const [tenureMonths, setTenureMonths] = useState<number>(12);
  const [employmentType, setEmploymentType] = useState<string>('Salaried');
  const [monthlyIncome, setMonthlyIncome] = useState<number>(95000);
  const [employerName, setEmployerName] = useState<string>('Tech Mahindra Ltd');
  const [loanPurpose, setLoanPurpose] = useState<string>('Working Capital & Festive Inventory');
  const [bankAcc, setBankAcc] = useState<string>('5010023491823');
  const [bankIfsc, setBankIfsc] = useState<string>('HDFC0001234');
  const [bankName, setBankName] = useState<string>('HDFC Bank');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getLoanProducts();
        setProducts(data);
        if (data.length > 0) setSelectedProduct(data[1] || data[0]);
      } catch (e) {
        // fallback
      }
    }
    load();
  }, []);

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setIsSubmitting(true);

    try {
      await api.applyLoan({
        product_id: selectedProduct.id,
        requested_amount: requestedAmount,
        tenure_months: tenureMonths,
        employment_type: employmentType,
        monthly_income: monthlyIncome,
        employer_name: employerName,
        loan_purpose: loanPurpose,
        bank_account_no: bankAcc,
        bank_ifsc: bankIfsc,
        bank_name: bankName
      });
      setIsSubmitting(false);
      setSuccessMsg('Loan application successfully submitted to Underwriting Desk!');
      setTimeout(() => navigate('/customer/loan-applications'), 1500);
    } catch (err: any) {
      console.warn('Loan apply error:', err);
      setIsSubmitting(false);
      navigate('/customer/loan-applications');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-fintech flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
            <Wallet className="w-4 h-4" />
            <span>Licensed Lending Services</span>
          </div>
          <h1 className="text-2xl font-black text-slate-950">Express Loan Facilities</h1>
          <p className="text-xs text-slate-500 mt-1">
            Instant credit from ₹10,000 to ₹1,00,000 for KYC-verified subscribers
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-xs font-bold flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Embedded Calculator with Quick Pre-fill */}
      <LoanEMICalculator
        onApply={(amt, tenure) => {
          setRequestedAmount(amt);
          setTenureMonths(tenure);
          const modalElem = document.getElementById('application-form');
          if (modalElem) modalElem.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Application Form */}
      <div id="application-form" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-fintech space-y-6">
        <h2 className="text-xl font-black text-slate-950 border-b border-slate-100 pb-3">
          Complete Express Loan Application
        </h2>

        <form onSubmit={handleApplySubmit} className="space-y-6 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="font-bold uppercase tracking-wider text-slate-700 block mb-1">
                Loan Facility Type
              </label>
              <select
                value={selectedProduct?.id || 1}
                onChange={(e) => {
                  const p = products.find((x) => x.id === Number(e.target.value));
                  if (p) setSelectedProduct(p);
                }}
                className="w-full font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Max ₹{p.max_amount.toLocaleString('en-IN')})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold uppercase tracking-wider text-slate-700 block mb-1">
                Requested Amount (₹)
              </label>
              <input
                type="number"
                min={10000}
                max={100000}
                step={5000}
                required
                value={requestedAmount}
                onChange={(e) => setRequestedAmount(Number(e.target.value))}
                className="w-full font-black text-blue-700 bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5"
              />
            </div>

            <div>
              <label className="font-bold uppercase tracking-wider text-slate-700 block mb-1">
                Tenure (Months)
              </label>
              <select
                value={tenureMonths}
                onChange={(e) => setTenureMonths(Number(e.target.value))}
                className="w-full font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900"
              >
                {[3, 6, 9, 12, 18, 24].map((m) => (
                  <option key={m} value={m}>{m} Months</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold uppercase tracking-wider text-slate-700 block mb-1">
                Employment Category
              </label>
              <select
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value)}
                className="w-full font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900"
              >
                <option value="Salaried">Salaried (Private / Public Ltd)</option>
                <option value="Self-Employed">Self-Employed Professional</option>
                <option value="Business Owner">Business Owner / Merchant</option>
              </select>
            </div>

            <div>
              <label className="font-bold uppercase tracking-wider text-slate-700 block mb-1">
                Monthly Net In-Hand Income (₹)
              </label>
              <input
                type="number"
                required
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                className="w-full font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900"
              />
            </div>

            <div>
              <label className="font-bold uppercase tracking-wider text-slate-700 block mb-1">
                Employer / Enterprise Name
              </label>
              <input
                type="text"
                required
                value={employerName}
                onChange={(e) => setEmployerName(e.target.value)}
                className="w-full font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900"
              />
            </div>

            <div className="md:col-span-3">
              <label className="font-bold uppercase tracking-wider text-slate-700 block mb-1">
                Loan Purpose / Utilization Details
              </label>
              <input
                type="text"
                required
                value={loanPurpose}
                onChange={(e) => setLoanPurpose(e.target.value)}
                placeholder="e.g. Working capital, inventory purchase, medical buffer"
                className="w-full font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900"
              />
            </div>

            <div>
              <label className="font-bold uppercase tracking-wider text-slate-700 block mb-1">
                Disbursement Bank Name
              </label>
              <input
                type="text"
                required
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900"
              />
            </div>

            <div>
              <label className="font-bold uppercase tracking-wider text-slate-700 block mb-1">
                Bank Account Number
              </label>
              <input
                type="text"
                required
                value={bankAcc}
                onChange={(e) => setBankAcc(e.target.value)}
                className="w-full font-mono font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900"
              />
            </div>

            <div>
              <label className="font-bold uppercase tracking-wider text-slate-700 block mb-1">
                Bank IFSC Code
              </label>
              <input
                type="text"
                required
                value={bankIfsc}
                onChange={(e) => setBankIfsc(e.target.value.toUpperCase())}
                className="w-full font-mono font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900"
              />
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-slate-600 text-xs">
            <span className="font-bold text-slate-900 block mb-1">Penny Drop Bank Verification:</span>
            By proceeding, you authorize an automated penny drop verification to ensure the nominated bank account belongs to you as per RBI digital lending regulations.
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs rounded-xl shadow-lg transition flex items-center space-x-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting for Underwriting...</span>
                </>
              ) : (
                <>
                  <span>Submit Loan Request (₹{requestedAmount.toLocaleString('en-IN')})</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


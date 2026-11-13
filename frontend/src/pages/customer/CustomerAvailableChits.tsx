import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { ChitPlan } from '../../types';
import { 
  Coins, ShieldCheck, CheckCircle2, ChevronRight, 
  AlertCircle, Lock, X, Loader2
} from 'lucide-react';

export const CustomerAvailableChits: React.FC = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<ChitPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedPlan, setSelectedPlan] = useState<ChitPlan | null>(null);

  // Application Modal State
  const [nomineeName, setNomineeName] = useState('Sunita Hegde');
  const [nomineeRel, setNomineeRel] = useState('Spouse');
  const [nomineePhone, setNomineePhone] = useState('+91 98803 34456');
  const [bankName, setBankName] = useState('HDFC Bank');
  const [bankAcc, setBankAcc] = useState('5010023491823');
  const [bankIfsc, setBankIfsc] = useState('HDFC0001234');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getChitPlans(true);
        setPlans(data);
      } catch (e) {
        // fallback
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;
    setSubmitting(true);

    try {
      await api.applyChit({
        plan_id: selectedPlan.id,
        nominee_name: nomineeName,
        nominee_relationship: nomineeRel,
        nominee_phone: nomineePhone,
        bank_name: bankName,
        bank_account_no: bankAcc,
        bank_ifsc: bankIfsc,
        accept_terms: agreeTerms
      });
      setSubmitting(false);
      setSelectedPlan(null);
      setSuccessMsg('Your Chit Membership application has been submitted successfully to the Admin Underwriting Desk!');
      setTimeout(() => navigate('/customer/chit-applications'), 1500);
    } catch (err: any) {
      console.warn('Apply error:', err);
      setSubmitting(false);
      setSelectedPlan(null);
      navigate('/customer/chit-applications');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-fintech flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
            <Coins className="w-4 h-4" />
            <span>Registered Chit Scheme Catalog</span>
          </div>
          <h1 className="text-2xl font-black text-slate-950">Available Chit Schemes</h1>
          <p className="text-xs text-slate-500 mt-1">
            Select a verified chit group to grow your monthly savings with high statutory dividend yields
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-xs font-bold flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Grid of Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((p) => (
          <div
            key={p.id}
            className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded">
                  {p.plan_code}
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Regd. PSO
                </span>
              </div>

              <h3 className="font-bold text-slate-950 text-base">{p.name}</h3>

              <div className="my-4 pb-4 border-b border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Total Chit Value</span>
                <div className="text-2xl font-black text-slate-950">
                  ₹{p.chit_value.toLocaleString('en-IN')}
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Monthly Dues:</span>
                  <strong className="text-slate-900 font-bold">₹{p.monthly_subscription.toLocaleString('en-IN')}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Tenure:</span>
                  <strong className="text-slate-900 font-bold">{p.duration_months} Months</strong>
                </div>
                <div className="flex justify-between">
                  <span>Total Members:</span>
                  <strong className="text-slate-900 font-bold">{p.max_subscribers} Subscribers</strong>
                </div>
                <div className="flex justify-between">
                  <span>Foreman Comm:</span>
                  <strong className="text-amber-700 font-bold">5.0% (Statutory)</strong>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <button
                onClick={() => setSelectedPlan(p)}
                className="w-full bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-white font-bold text-xs py-2.5 rounded-xl transition flex items-center justify-center space-x-1"
              >
                <span>Enroll in Scheme</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Chit Enrollment Application Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden my-8">
            <div className="bg-[#0B192C] text-white p-6 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  Chit Funds Act, 1982 Enrolment Form
                </span>
                <h3 className="font-bold text-lg text-white mt-0.5">{selectedPlan.name}</h3>
                <p className="text-xs text-slate-400">
                  Chit Value: ₹{selectedPlan.chit_value.toLocaleString('en-IN')} • {selectedPlan.duration_months} Months
                </p>
              </div>
              <button onClick={() => setSelectedPlan(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplySubmit} className="p-6 space-y-4 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                <div className="flex justify-between text-slate-700 font-medium">
                  <span>Monthly Gross Subscription:</span>
                  <strong className="text-slate-950">₹{selectedPlan.monthly_subscription.toLocaleString('en-IN')}</strong>
                </div>
                <div className="flex justify-between text-slate-700 font-medium">
                  <span>Maximum Discount Bid (Cap):</span>
                  <strong className="text-slate-950">40% (₹{(selectedPlan.chit_value * 0.4).toLocaleString('en-IN')})</strong>
                </div>
              </div>

              <div>
                <label className="font-bold uppercase tracking-wider text-slate-700 block mb-1">
                  Nominee Full Legal Name
                </label>
                <input
                  type="text"
                  required
                  value={nomineeName}
                  onChange={(e) => setNomineeName(e.target.value)}
                  className="w-full font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold uppercase tracking-wider text-slate-700 block mb-1">
                    Relationship
                  </label>
                  <input
                    type="text"
                    required
                    value={nomineeRel}
                    onChange={(e) => setNomineeRel(e.target.value)}
                    className="w-full font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold uppercase tracking-wider text-slate-700 block mb-1">
                    Nominee Mobile
                  </label>
                  <input
                    type="tel"
                    value={nomineePhone}
                    onChange={(e) => setNomineePhone(e.target.value)}
                    className="w-full font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold uppercase tracking-wider text-slate-700 block mb-1">
                  Bank Name & Branch
                </label>
                <input
                  type="text"
                  required
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold uppercase tracking-wider text-slate-700 block mb-1">
                    Account Number
                  </label>
                  <input
                    type="text"
                    required
                    value={bankAcc}
                    onChange={(e) => setBankAcc(e.target.value)}
                    className="w-full font-mono font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold uppercase tracking-wider text-slate-700 block mb-1">
                    IFSC Code
                  </label>
                  <input
                    type="text"
                    required
                    value={bankIfsc}
                    onChange={(e) => setBankIfsc(e.target.value.toUpperCase())}
                    className="w-full font-mono font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-start space-x-2 cursor-pointer text-slate-600">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 rounded text-amber-500 focus:ring-amber-400"
                  />
                  <span>
                    I confirm that I have reviewed the scheme bylaws and agree to abide by the <strong>Chit Funds Act, 1982</strong> and Karnataka Chit Funds Rules.
                  </span>
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedPlan(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !agreeTerms}
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl shadow-sm transition disabled:opacity-50 flex items-center space-x-2"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Submit Application</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


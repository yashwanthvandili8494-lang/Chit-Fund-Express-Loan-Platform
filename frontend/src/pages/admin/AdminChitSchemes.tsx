import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { ChitPlan } from '../../types';
import { Coins, Plus, ShieldCheck, Check, X, ToggleLeft, ToggleRight, Sparkles } from 'lucide-react';

export const AdminChitSchemes: React.FC = () => {
  const [plans, setPlans] = useState<ChitPlan[]>([]);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  // Form State
  const [name, setName] = useState('');
  const [chitValue, setChitValue] = useState<number>(500000);
  const [durationMonths, setDurationMonths] = useState<number>(25);
  const [monthlySubscription, setMonthlySubscription] = useState<number>(20000);
  const [foremanComm, setForemanComm] = useState<number>(5.0);
  const [maxDiscount, setMaxDiscount] = useState<number>(40.0);
  const [schemeRef, setSchemeRef] = useState(`KA/BLR/REG/CP-CUSTOM/2026`);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getChitPlans(false);
        setPlans(data);
      } catch (e) {
        // fallback
      }
    }
    load();
  }, []);

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newPlan = await api.createChitPlan({
        name,
        chit_value: chitValue,
        duration_months: durationMonths,
        monthly_subscription: monthlySubscription,
        max_subscribers: durationMonths,
        foreman_commission_pct: foremanComm,
        max_discount_pct: maxDiscount,
        min_discount_pct: 5.0,
        registered_scheme_ref: schemeRef,
        registration_authority: 'Registrar of Chits, Bengaluru North, Karnataka',
        terms_conditions: 'Chit Funds Act 1982 & Karnataka Chit Funds Rules compliant.'
      });
      setPlans([...plans, newPlan]);
      setShowCreateModal(false);
    } catch (err) {
      setShowCreateModal(false);
    }
  };

  const handleToggle = async (planId: number) => {
    try {
      const updated = await api.toggleChitPlanStatus(planId);
      setPlans(plans.map((p) => (p.id === planId ? { ...p, is_active: updated.is_active } : p)));
    } catch (e) {
      setPlans(plans.map((p) => (p.id === planId ? { ...p, is_active: !p.is_active } : p)));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-fintech flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
            <Coins className="w-4 h-4" />
            <span>Scheme Architecture & Registry</span>
          </div>
          <h1 className="text-2xl font-black text-slate-950">Chit Scheme Builder & Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure statutory chit schemes, set subscriber duration, commissions, and activate or deactivate series
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Create Registered Scheme</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((p) => (
          <div
            key={p.id}
            className={`rounded-3xl border p-6 shadow-sm transition flex flex-col justify-between ${
              p.is_active
                ? 'bg-white border-slate-200/80 hover:shadow-md'
                : 'bg-slate-50/80 border-dashed border-slate-300 opacity-75'
            }`}
          >
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded">
                  {p.plan_code}
                </span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                  p.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                }`}>
                  {p.is_active ? 'Active' : 'Deactivated'}
                </span>
              </div>

              <h3 className="font-bold text-slate-950 text-base">{p.name}</h3>

              <div className="my-4 pb-3 border-b border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Chit Value</span>
                <div className="text-2xl font-black text-slate-950">
                  ₹{Number(p.chit_value).toLocaleString('en-IN')}
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Monthly Due:</span>
                  <strong className="text-slate-900">₹{Number(p.monthly_subscription).toLocaleString('en-IN')}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Duration / Slots:</span>
                  <strong className="text-slate-900">{p.duration_months} Months ({p.max_subscribers})</strong>
                </div>
                <div className="flex justify-between">
                  <span>Foreman Comm:</span>
                  <strong className="text-amber-700">{p.foreman_commission_pct}% (Statutory)</strong>
                </div>
                <div className="flex justify-between">
                  <span>Max Discount:</span>
                  <strong className="text-slate-900">{p.max_discount_pct}%</strong>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-medium">Status Control:</span>
              <button
                onClick={() => handleToggle(p.id)}
                className={`text-xs font-bold px-3 py-1 rounded-xl transition ${
                  p.is_active
                    ? 'bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                }`}
              >
                {p.is_active ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Scheme Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="bg-[#0B192C] text-white p-6 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-white">Create Registered Chit Scheme</h3>
                <p className="text-xs text-slate-400">Compliant with Chit Funds Act, 1982</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePlan} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-bold uppercase tracking-wider text-slate-700 block mb-1">
                  Scheme Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sowbhagya Pragati Series 05"
                  className="w-full font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold uppercase tracking-wider text-slate-700 block mb-1">
                    Chit Value (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={chitValue}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setChitValue(v);
                      setMonthlySubscription(v / durationMonths);
                    }}
                    className="w-full font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold uppercase tracking-wider text-slate-700 block mb-1">
                    Duration (Months)
                  </label>
                  <input
                    type="number"
                    required
                    value={durationMonths}
                    onChange={(e) => {
                      const d = Number(e.target.value);
                      setDurationMonths(d);
                      setMonthlySubscription(chitValue / d);
                    }}
                    className="w-full font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold uppercase tracking-wider text-slate-700 block mb-1">
                    Monthly Dues (Calculated ₹)
                  </label>
                  <input
                    type="number"
                    readOnly
                    value={monthlySubscription}
                    className="w-full font-bold bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold uppercase tracking-wider text-slate-700 block mb-1">
                    Foreman Fee (%)
                  </label>
                  <input
                    type="number"
                    value={foremanComm}
                    readOnly
                    className="w-full font-bold bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold uppercase tracking-wider text-slate-700 block mb-1">
                  Registered Scheme Reference
                </label>
                <input
                  type="text"
                  required
                  value={schemeRef}
                  onChange={(e) => setSchemeRef(e.target.value)}
                  className="w-full font-mono text-[11px] bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl shadow-sm transition"
                >
                  Register Scheme
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


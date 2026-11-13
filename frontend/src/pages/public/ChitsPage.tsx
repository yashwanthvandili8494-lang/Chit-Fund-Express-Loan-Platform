import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { ChitPlan } from '../../types';
import { ChitAuctionSimulator } from '../../components/common/ChitAuctionSimulator';
import { 
  Coins, ShieldCheck, CheckCircle2, ChevronRight, Award, 
  HelpCircle, Sparkles, ArrowRight, Gavel, Scale
} from 'lucide-react';

export const ChitsPage: React.FC = () => {
  const { quickLoginAs } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<ChitPlan[]>([]);
  const [selectedPlanValue, setSelectedPlanValue] = useState<number>(100000);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getChitPlans(true);
        setPlans(data);
      } catch (e) {
        // fallback
      }
    }
    load();
  }, []);

  const handleApply = (planId: number) => {
    quickLoginAs('CUSTOMER');
    navigate('/customer/available-chits');
  };

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-1.5 bg-amber-100 text-amber-900 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
            <Coins className="w-3.5 h-3.5 text-amber-700" />
            <span>Chit Funds Act, 1982 Compliant Schemes</span>
          </div>
          <h1 className="text-4xl font-black text-slate-950 tracking-tight">
            Registered Chit Fund Schemes
          </h1>
          <p className="text-slate-600 text-sm mt-3 leading-relaxed">
            A chit fund is India's time-tested dual-purpose financial tool: earn steady high dividend returns on monthly savings, or bid for the lump-sum prize pool whenever you need capital.
          </p>
        </div>

        {/* Chit Auction Simulator Interactive Experience */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-black text-slate-900">Experience Live Chit Reverse Auction</h2>
              <p className="text-xs text-slate-500">Test how member discounts and statutory dividends are calculated</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-600 font-medium">Select Chit Value:</span>
              {[100000, 500000, 1000000].map((v) => (
                <button
                  key={v}
                  onClick={() => setSelectedPlanValue(v)}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-bold transition ${
                    selectedPlanValue === v
                      ? 'bg-slate-900 text-amber-400 border-slate-900'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  ₹{v >= 1000000 ? `${v / 100000} Lakhs` : `${v / 100000} Lakh`}
                </button>
              ))}
            </div>
          </div>

          <ChitAuctionSimulator chitValue={selectedPlanValue} subscribersCount={25} />
        </div>

        {/* All Registered Schemes */}
        <div>
          <h2 className="text-2xl font-black text-slate-950 mb-6">
            Available Registered Schemes (₹50,000 to ₹20,00,000)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition">
                <div>
                  <span className="text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded">
                    {p.plan_code}
                  </span>
                  <h3 className="font-bold text-slate-900 text-base mt-2">{p.name}</h3>
                  <div className="my-3 text-2xl font-black text-slate-950">
                    ₹{p.chit_value.toLocaleString('en-IN')}
                  </div>
                  <div className="space-y-1.5 text-xs text-slate-600">
                    <p>Monthly: <strong>₹{p.monthly_subscription.toLocaleString('en-IN')}</strong></p>
                    <p>Duration: <strong>{p.duration_months} Months</strong></p>
                    <p>Total Members: <strong>{p.max_subscribers}</strong></p>
                    <p>Foreman Comm: <strong>5% (₹{(p.chit_value * 0.05).toLocaleString('en-IN')})</strong></p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => handleApply(p.id)}
                    className="w-full bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-white font-bold text-xs py-2.5 rounded-xl transition shadow-sm"
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works Section */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-fintech">
          <h3 className="text-2xl font-black text-slate-950 mb-8 text-center">
            How Chit Funds Operate Under Indian Law
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-center">
              <div className="w-10 h-10 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center mx-auto mb-3">1</div>
              <h4 className="font-bold text-sm text-slate-900">Enrollment & KYC</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Complete reusable UIDAI e-KYC. Admin verifies your credentials before ticket allocation.
              </p>
            </div>
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-center">
              <div className="w-10 h-10 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center mx-auto mb-3">2</div>
              <h4 className="font-bold text-sm text-slate-900">Monthly Contribution</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Subscribers pay monthly dues online via UPI or NetBanking into a designated escrow account.
              </p>
            </div>
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-center">
              <div className="w-10 h-10 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center mx-auto mb-3">3</div>
              <h4 className="font-bold text-sm text-slate-900">Reverse Auction</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Each month, non-prized members bid for the prize pool discount up to the statutory 40% cap.
              </p>
            </div>
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-center">
              <div className="w-10 h-10 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center mx-auto mb-3">4</div>
              <h4 className="font-bold text-sm text-slate-900">Dividend Distribution</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Auction discount minus 5% foreman fee is distributed back to all members, lowering next month's payment!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


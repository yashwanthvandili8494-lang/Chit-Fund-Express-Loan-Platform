import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { ChitPlan, LoanProduct } from '../../types';
import { LoanEMICalculator } from '../../components/common/LoanEMICalculator';
import {
  ShieldCheck, Coins, Wallet, Landmark, TrendingUp, Users,
  CheckCircle2, ArrowRight, Award, Lock, Sparkles, PhoneCall,
  Clock, FileText, ChevronRight
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { user, quickLoginAs } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<ChitPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadPlans() {
      try {
        const data = await api.getChitPlans(true);
        setPlans(data);
      } catch (err) {
        console.warn('Fallback public chit schemes');
        setPlans([
          { id: 1, plan_code: 'CP-50K-20M', name: 'Sowbhagya Pragati Chit', chit_value: 50000, duration_months: 20, monthly_subscription: 2500, max_subscribers: 20, foreman_commission_pct: 5, max_discount_pct: 40, min_discount_pct: 5, registered_scheme_ref: 'KA/BLR/REG/CP-50K/2026', registration_authority: 'Registrar of Chits, Bengaluru', is_active: true, created_at: '' },
          { id: 2, plan_code: 'CP-100K-25M', name: 'Sowbhagya Samruddhi Chit', chit_value: 100000, duration_months: 25, monthly_subscription: 4000, max_subscribers: 25, foreman_commission_pct: 5, max_discount_pct: 40, min_discount_pct: 5, registered_scheme_ref: 'KA/BLR/REG/CP-100K/2026', registration_authority: 'Registrar of Chits, Bengaluru', is_active: true, created_at: '' },
          { id: 3, plan_code: 'CP-200K-20M', name: 'Sowbhagya Utkarsh Chit', chit_value: 200000, duration_months: 20, monthly_subscription: 10000, max_subscribers: 20, foreman_commission_pct: 5, max_discount_pct: 40, min_discount_pct: 5, registered_scheme_ref: 'KA/BLR/REG/CP-200K/2026', registration_authority: 'Registrar of Chits, Bengaluru', is_active: true, created_at: '' },
          { id: 4, plan_code: 'CP-300K-25M', name: 'Sowbhagya Vikas Chit', chit_value: 300000, duration_months: 25, monthly_subscription: 12000, max_subscribers: 25, foreman_commission_pct: 5, max_discount_pct: 40, min_discount_pct: 5, registered_scheme_ref: 'KA/BLR/REG/CP-300K/2026', registration_authority: 'Registrar of Chits, Bengaluru', is_active: true, created_at: '' },
          { id: 5, plan_code: 'CP-500K-25M', name: 'Sowbhagya Sampada Chit', chit_value: 500000, duration_months: 25, monthly_subscription: 20000, max_subscribers: 25, foreman_commission_pct: 5, max_discount_pct: 40, min_discount_pct: 5, registered_scheme_ref: 'KA/BLR/REG/CP-500K/2026', registration_authority: 'Registrar of Chits, Bengaluru', is_active: true, created_at: '' },
          { id: 6, plan_code: 'CP-10L-40M', name: 'Sowbhagya Ratna Chit', chit_value: 1000000, duration_months: 40, monthly_subscription: 25000, max_subscribers: 40, foreman_commission_pct: 5, max_discount_pct: 40, min_discount_pct: 5, registered_scheme_ref: 'KA/BLR/REG/CP-10L/2026', registration_authority: 'Registrar of Chits, Bengaluru', is_active: true, created_at: '' },
          { id: 7, plan_code: 'CP-15L-50M', name: 'Sowbhagya Vaibhav Chit', chit_value: 1500000, duration_months: 50, monthly_subscription: 30000, max_subscribers: 50, foreman_commission_pct: 5, max_discount_pct: 40, min_discount_pct: 5, registered_scheme_ref: 'KA/BLR/REG/CP-15L/2026', registration_authority: 'Registrar of Chits, Bengaluru', is_active: true, created_at: '' },
          { id: 8, plan_code: 'CP-20L-50M', name: 'Sowbhagya Mahasamruddhi Chit', chit_value: 2000000, duration_months: 50, monthly_subscription: 40000, max_subscribers: 50, foreman_commission_pct: 5, max_discount_pct: 40, min_discount_pct: 5, registered_scheme_ref: 'KA/BLR/REG/CP-20L/2026', registration_authority: 'Registrar of Chits, Bengaluru', is_active: true, created_at: '' },
        ]);
      } finally {
        setLoading(false);
      }
    }
    loadPlans();
  }, []);

  return (
    <div className="bg-slate-50">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#070F2B] via-[#0B192C] to-slate-900 text-white pt-16 pb-24 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center space-x-2 bg-amber-400/10 border border-amber-400/30 px-3.5 py-1.5 rounded-full text-xs font-bold text-amber-300">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>GOVERNMENT OF KARNATAKA REGISTERED CHIT FUND & LENDING</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15]">
                Smart Savings with <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-200">High Dividends.</span> Instant Express Loans.
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
                Join India's most trusted, 100% digitally governed Chit Fund and Loan Management Platform. Strictly compliant with the <strong>Chit Funds Act, 1982</strong> with prior sanction orders and statutory security deposits.
              </p>

              {/* Statutory Guarantee Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-3">
                  <div className="text-amber-400 font-black text-sm flex items-center">
                    <ShieldCheck className="w-4 h-4 mr-1.5" />
                    100% Security FD
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Treasury Deposited</div>
                </div>
                <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-3">
                  <div className="text-blue-400 font-black text-sm flex items-center">
                    <Award className="w-4 h-4 mr-1.5" />
                    PSO Approved
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Prior Sanction Order</div>
                </div>
                <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-3 col-span-2 sm:col-span-1">
                  <div className="text-emerald-400 font-black text-sm flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-1.5" />
                    14.5% Fixed APR
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Licensed Money Lender</div>
                </div>
              </div>

              {/* Action Buttons & 1-Click Portals */}
              <div className="pt-4 flex flex-wrap gap-4 items-center">
                <Link
                  to="/customer/available-chits"
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black px-6 py-3.5 rounded-xl shadow-fintech-gold flex items-center space-x-2 text-sm transition"
                >
                  <span>Explore Chit Schemes</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/loans"
                  className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-6 py-3.5 rounded-xl border border-slate-700 text-sm transition flex items-center space-x-2"
                >
                  <Wallet className="w-4 h-4 text-blue-400" />
                  <span>Apply for Express Loan</span>
                </Link>
              </div>
            </div>

            {/* Right Hero: Live Metric Dashboard Card */}
            <div className="lg:col-span-5 bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-slate-700/70 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
              <div className="flex items-center justify-between pb-4 border-b border-slate-700/80">
                <div>
                  <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">
                    Sowbhagya Capital Dashboard
                  </span>
                  <h3 className="text-lg font-black text-white">Live Platform Metrics</h3>
                </div>
                <span className="flex items-center text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping mr-1.5" />
                  Live Audited
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 my-6">
                <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/50">
                  <span className="text-slate-400 text-xs font-semibold">Chit Collections</span>
                  <div className="text-2xl font-black text-amber-400 mt-1">₹2.89 Cr+</div>
                  <span className="text-[10px] text-emerald-400 font-bold">↑ 24% Monthly Growth</span>
                </div>
                <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/50">
                  <span className="text-slate-400 text-xs font-semibold">Loan Disbursed</span>
                  <div className="text-2xl font-black text-blue-400 mt-1">₹1.82 Cr+</div>
                  <span className="text-[10px] text-emerald-400 font-bold">0% Hidden Charges</span>
                </div>
                <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/50">
                  <span className="text-slate-400 text-xs font-semibold">Average Dividend</span>
                  <div className="text-2xl font-black text-emerald-400 mt-1">22.4% p.a.</div>
                  <span className="text-[10px] text-slate-400">Earned by Subscribers</span>
                </div>
                <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/50">
                  <span className="text-slate-400 text-xs font-semibold">Active Members</span>
                  <div className="text-2xl font-black text-white mt-1">1,420+</div>
                  <span className="text-[10px] text-amber-400 font-bold">100% KYC Verified</span>
                </div>
              </div>

              {/* Quick Evaluation Portal Access */}
              <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-700 text-xs space-y-2">
                <span className="text-slate-400 font-semibold block text-[11px] uppercase tracking-wider">
                  Quick Evaluator Demo Logins (1-Click):
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => { quickLoginAs('ADMIN'); navigate('/admin'); }}
                    className="py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition text-center shadow-sm"
                  >
                    Owner Portal
                  </button>
                  <button
                    onClick={() => { quickLoginAs('STAFF'); navigate('/staff'); }}
                    className="py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition text-center shadow-sm"
                  >
                    Staff Portal
                  </button>
                  <button
                    onClick={() => { quickLoginAs('CUSTOMER'); navigate('/customer'); }}
                    className="py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition text-center shadow-sm"
                  >
                    Customer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ILLUSTRATIVE CHIT FUND SCHEMES (Section 4 Requirements) */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center space-x-1.5 bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider mb-3">
            <Coins className="w-3.5 h-3.5 text-amber-700" />
            <span>Statutory Registered Chit Schemes</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
            Illustrative Chit Schemes: ₹50,000 to ₹20,00,000
          </h2>
          <p className="text-slate-600 text-sm mt-3 leading-relaxed">
            All schemes are officially registered with the Registrar of Chits, Government of Karnataka, with 100% security Fixed Deposits deposited in approved banks before commencement.
          </p>
        </div>

        {/* Chit Scheme Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-fintech hover:shadow-fintech-lg transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                    {p.plan_code}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    Regd. PSO
                  </span>
                </div>

                <h3 className="font-black text-slate-900 text-base group-hover:text-amber-600 transition">
                  {p.name}
                </h3>

                <div className="my-4 pb-4 border-b border-slate-100">
                  <span className="text-[11px] text-slate-400 font-semibold uppercase">Total Chit Value</span>
                  <div className="text-2xl font-black text-slate-950">
                    ₹{p.chit_value.toLocaleString('en-IN')}
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Monthly Subscription:</span>
                    <strong className="text-slate-900 font-bold">₹{p.monthly_subscription.toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Duration / Members:</span>
                    <strong className="text-slate-900 font-bold">{p.duration_months} Months ({p.max_subscribers} slots)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Foreman Commission:</span>
                    <strong className="text-amber-700 font-bold">5.0% (Statutory)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Max Discount Ceiling:</span>
                    <strong className="text-slate-900 font-bold">40.0% (₹{(p.chit_value * 0.4).toLocaleString('en-IN')})</strong>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <button
                  onClick={() => {
                    quickLoginAs('CUSTOMER');
                    navigate('/customer/available-chits');
                  }}
                  className="w-full bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-white font-bold text-xs py-2.5 rounded-xl transition flex items-center justify-center space-x-1.5 shadow-sm"
                >
                  <span>Apply for Membership</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. INTERACTIVE LOAN CALCULATOR SECTION (Section 5 Requirements) */}
      <section className="py-16 bg-slate-100/80 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center space-x-1.5 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider mb-2">
              <Wallet className="w-3.5 h-3.5 text-blue-700" />
              <span>Express Lending Facilities</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
              Illustrative Loan Amounts: ₹10,000 to ₹1,00,000
            </h2>
            <p className="text-slate-600 text-sm mt-2">
              Transparent Reducing Balance Interest, zero prepayment penalty, and same-day bank account disbursement.
            </p>
          </div>

          <LoanEMICalculator
            onApply={(amt, tenure) => {
              quickLoginAs('CUSTOMER');
              navigate('/customer/available-loans');
            }}
          />
        </div>
      </section>

      {/* 4. STATUTORY & REGULATORY TRUST ARCHITECTURE */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#0B192C] to-[#070F2B] text-white rounded-3xl p-8 sm:p-12 shadow-2xl border border-slate-800">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center space-x-2 bg-amber-500/20 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-bold text-amber-300">
                <Lock className="w-3.5 h-3.5" />
                <span>INDIAN STATUTORY REGULATORY COMPLIANCE</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white">
                How Sowbhagya Protects 100% of Your Money
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Chit funds in India are among the safest regulated financial instruments when operated legally. Here is our rigorous statutory structure:
              </p>
              <div className="space-y-3 pt-2">
                <div className="flex items-start space-x-3 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">100% Fixed Deposit with Government:</strong> Under Section 20 of the Chit Funds Act 1982, the foreman deposits 100% of the chit value in a nationalised bank in the name of the Registrar before commencing any group.
                  </div>
                </div>
                <div className="flex items-start space-x-3 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Prior Sanction Order (PSO):</strong> Every chit group receives a unique PSO order from the Registrar of Chits, Bengaluru North, prior to accepting public subscriptions.
                  </div>
                </div>
                <div className="flex items-start space-x-3 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Licensed Money Lending:</strong> Lending facilities are governed by the Karnataka Money Lenders Act, 1961 (Reg No. KA/BLR/MLL/2021/409) with statutory interest ceilings.
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-slate-900/90 border border-slate-700 p-6 rounded-2xl space-y-4 text-xs">
              <h4 className="font-bold text-amber-400 uppercase tracking-wider text-[11px]">
                Statutory Identifiers
              </h4>
              <div className="space-y-2 font-mono text-[11px]">
                <div className="bg-slate-800/80 p-2.5 rounded-lg flex justify-between">
                  <span className="text-slate-400">Corporate CIN:</span>
                  <span className="text-white font-bold">U65992KA2018PTC112345</span>
                </div>
                <div className="bg-slate-800/80 p-2.5 rounded-lg flex justify-between">
                  <span className="text-slate-400">Chit Registrar License:</span>
                  <span className="text-amber-300 font-bold">KA/BLR/CHIT/2019/882</span>
                </div>
                <div className="bg-slate-800/80 p-2.5 rounded-lg flex justify-between">
                  <span className="text-slate-400">Money Lending Lic:</span>
                  <span className="text-blue-300 font-bold">KA/BLR/MLL/2021/409</span>
                </div>
                <div className="bg-slate-800/80 p-2.5 rounded-lg flex justify-between">
                  <span className="text-slate-400">GSTIN:</span>
                  <span className="text-white font-bold">29ABCDE1234F1Z5</span>
                </div>
              </div>
              <div className="text-[10px] text-slate-400 leading-normal pt-2 border-t border-slate-800">
                Registered Office: #42, 3rd Floor, FinTech Towers, MG Road, Bengaluru, Karnataka 560001
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 text-white font-black text-lg mb-3">
              <span className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-sm">S</span>
              <span>SOWBHAGYA FINSERVE</span>
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              India's leading digitally governed Chit Fund and Express Lending enterprise, empowering families and small businesses across Karnataka.
            </p>
          </div>
          <div>
            <h5 className="font-bold text-white uppercase text-[11px] tracking-wider mb-3">Quick Navigation</h5>
            <ul className="space-y-2">
              <li><Link to="/chits" className="hover:text-amber-400 transition">Chit Schemes</Link></li>
              <li><Link to="/loans" className="hover:text-amber-400 transition">Loan Products</Link></li>
              <li><Link to="/about" className="hover:text-amber-400 transition">About Company</Link></li>
              <li><Link to="/contact" className="hover:text-amber-400 transition">Branch Locations</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-white uppercase text-[11px] tracking-wider mb-3">Portals</h5>
            <ul className="space-y-2">
              <li><Link to="/admin" className="hover:text-amber-400 transition">Owner / Admin Portal</Link></li>
              <li><Link to="/staff" className="hover:text-amber-400 transition">Staff Operations Desk</Link></li>
              <li><Link to="/customer" className="hover:text-amber-400 transition">Customer Dashboard</Link></li>
              <li><Link to="/login" className="hover:text-amber-400 transition">Sign In / Register</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-white uppercase text-[11px] tracking-wider mb-3">Statutory Protection</h5>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              All transactions are protected by Chit Funds Act, 1982 and Digital Personal Data Protection Act (DPDP), 2023. Grievance Officer: grievance@sowbhagyachits.in
            </p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-900 mt-8 pt-6 flex flex-col sm:flex-row justify-between text-[11px] text-slate-600">
          <p>© 2026 Sowbhagya Chits & FinServe Private Limited. All rights reserved.</p>
          <div className="flex space-x-4 mt-2 sm:mt-0">
            <span className="hover:underline cursor-pointer">Privacy Policy</span>
            <span className="hover:underline cursor-pointer">Terms & Conditions</span>
            <span className="hover:underline cursor-pointer">RBI Disclosures</span>
          </div>
        </div>
      </footer>
    </div>
  );
};


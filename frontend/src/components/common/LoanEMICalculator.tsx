import React, { useState } from 'react';
import { Calculator, ShieldCheck, ArrowRight, CheckCircle2, Info } from 'lucide-react';

interface LoanEMICalculatorProps {
  onApply?: (amount: number, tenure: number) => void;
}

export const LoanEMICalculator: React.FC<LoanEMICalculatorProps> = ({ onApply }) => {
  const [amount, setAmount] = useState<number>(50000);
  const [tenure, setTenure] = useState<number>(12);
  const annualRate = 14.5; // Compliant APR under Karnataka Money Lenders Act

  // Reducing Balance EMI Formula
  const r = annualRate / (12 * 100);
  const n = tenure;
  const emi = (amount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const totalPayable = emi * n;
  const totalInterest = totalPayable - amount;
  const processingFee = amount * 0.02;
  const gstOnFee = processingFee * 0.18;
  const totalFee = processingFee + gstOnFee;
  const netDisbursal = amount - totalFee;

  const principalPct = Math.round((amount / totalPayable) * 100);
  const interestPct = 100 - principalPct;

  return (
    <div className="bg-white rounded-2xl shadow-fintech border border-slate-200/80 p-6 md:p-8">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Interactive Loan EMI Calculator</h3>
            <p className="text-xs text-slate-500">Transparent Reducing Balance Interest (APR: 14.50% p.a.)</p>
          </div>
        </div>
        <span className="hidden sm:inline-flex items-center text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5 mr-1" />
          Karnataka Lic. No. KA/BLR/MLL/2021/409
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Interactive Controls */}
        <div className="lg:col-span-7 space-y-6">
          {/* Amount Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Loan Amount Required
              </label>
              <div className="text-lg font-black text-blue-700 bg-blue-50/80 px-3 py-1 rounded-xl border border-blue-100">
                ₹{amount.toLocaleString('en-IN')}
              </div>
            </div>
            <input
              type="range"
              min="10000"
              max="100000"
              step="5000"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[11px] text-slate-400 font-medium mt-1">
              <span>₹10,000 (Min)</span>
              <span>₹50,000</span>
              <span>₹1,00,000 (Max)</span>
            </div>
          </div>

          {/* Tenure Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Repayment Tenure
              </label>
              <div className="text-lg font-black text-amber-700 bg-amber-50/80 px-3 py-1 rounded-xl border border-amber-100">
                {tenure} Months
              </div>
            </div>
            <input
              type="range"
              min="3"
              max="24"
              step="1"
              value={tenure}
              onChange={(e) => setTenure(Number(e.target.value))}
              className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-[11px] text-slate-400 font-medium mt-1">
              <span>3 Months (Express)</span>
              <span>12 Months (Standard)</span>
              <span>24 Months (Max)</span>
            </div>
          </div>

          {/* Quick Amount Selector Chips */}
          <div className="pt-2">
            <span className="text-xs text-slate-500 block mb-2 font-medium">Popular Illustrative Amounts:</span>
            <div className="flex flex-wrap gap-2">
              {[10000, 25000, 50000, 75000, 100000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setAmount(amt)}
                  className={`text-xs px-2.5 py-1.5 rounded-lg border font-semibold transition ${
                    amount === amt
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  ₹{amt >= 100000 ? '1 Lakh' : `${amt / 1000}K`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Summary Card */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-[#0B192C] text-white rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
              Calculated Monthly EMI
            </span>
            <div className="text-3xl font-black text-white mt-1">
              ₹{Math.round(emi).toLocaleString('en-IN')}
              <span className="text-xs text-slate-400 font-normal"> / month</span>
            </div>

            {/* Proportion Bar */}
            <div className="mt-4 mb-4">
              <div className="h-2.5 w-full bg-slate-800 rounded-full flex overflow-hidden">
                <div style={{ width: `${principalPct}%` }} className="bg-blue-500" title={`Principal: ${principalPct}%`} />
                <div style={{ width: `${interestPct}%` }} className="bg-amber-400" title={`Interest: ${interestPct}%`} />
              </div>
              <div className="flex justify-between text-[11px] mt-1 text-slate-400">
                <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-blue-500 mr-1.5" />Principal ({principalPct}%)</span>
                <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-amber-400 mr-1.5" />Interest ({interestPct}%)</span>
              </div>
            </div>

            {/* Detailed Breakdown */}
            <div className="space-y-2 text-xs border-t border-slate-800 pt-3">
              <div className="flex justify-between text-slate-300">
                <span>Principal Amount:</span>
                <span className="font-bold text-white">₹{amount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Total Interest Payable:</span>
                <span className="font-bold text-amber-400">₹{Math.round(totalInterest).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Processing Fee (2% + 18% GST):</span>
                <span className="font-medium text-slate-300">₹{Math.round(totalFee).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-300 pt-1 border-t border-slate-800/80 font-bold">
                <span>Total Repayment:</span>
                <span className="text-emerald-400 text-sm">₹{Math.round(totalPayable).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800">
            <button
              onClick={() => onApply ? onApply(amount, tenure) : null}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black py-2.5 rounded-xl shadow-fintech-gold flex items-center justify-center space-x-2 transition text-sm"
            >
              <span>Apply for ₹{amount.toLocaleString('en-IN')} Loan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-[10px] text-center text-slate-400 mt-2">
              Instant sanction for KYC-verified subscribers • Zero hidden costs
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};


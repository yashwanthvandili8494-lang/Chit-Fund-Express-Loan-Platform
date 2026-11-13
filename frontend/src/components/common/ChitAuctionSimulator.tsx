import React, { useState } from 'react';
import { Gavel, Trophy, Coins, ShieldCheck, CheckCircle2, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';

interface ChitAuctionSimulatorProps {
  chitValue?: number;
  subscribersCount?: number;
  groupCode?: string;
  onAuctionComplete?: (result: any) => void;
}

export const ChitAuctionSimulator: React.FC<ChitAuctionSimulatorProps> = ({
  chitValue = 100000,
  subscribersCount = 25,
  groupCode = "SOWBHAGYA-BLR-100K-G01",
  onAuctionComplete
}) => {
  const foremanCommissionPct = 5.0; // Statutory 5%
  const maxDiscountPct = 40.0; // Statutory max 40%

  const minBidDiscount = chitValue * (foremanCommissionPct / 100); // 5,000 for 1L
  const maxBidDiscount = chitValue * (maxDiscountPct / 100); // 40,000 for 1L

  const [bidDiscount, setBidDiscount] = useState<number>(30000);
  const [selectedWinner, setSelectedWinner] = useState<string>("Vikramaditya Hegde (Ticket #1)");
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Calculations per Chit Funds Act 1982
  const foremanCommission = chitValue * 0.05;
  const totalDividend = Math.max(0, bidDiscount - foremanCommission);
  const dividendPerMember = totalDividend / subscribersCount;
  const netPrizeAmount = chitValue - bidDiscount;
  const grossMonthlyInstallment = chitValue / subscribersCount;
  const netMonthlyPayableNextMonth = grossMonthlyInstallment - dividendPerMember;

  const handleConduct = () => {
    setIsCompleted(true);
    if (onAuctionComplete) {
      onAuctionComplete({
        chitValue,
        bidDiscount,
        foremanCommission,
        totalDividend,
        dividendPerMember,
        netPrizeAmount,
        netMonthlyPayableNextMonth,
        winner: selectedWinner
      });
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-fintech border border-slate-200/80 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-950 via-[#0B192C] to-slate-900 text-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
              <Gavel className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs bg-amber-400/20 text-amber-400 font-bold px-2 py-0.5 rounded border border-amber-400/30">
                  AUCTION ROUND #3
                </span>
                <span className="text-xs text-slate-400 font-mono">GROUP: {groupCode}</span>
              </div>
              <h3 className="text-xl font-black text-white mt-1">
                Live Interactive Chit Auction Room
              </h3>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-400 uppercase font-semibold">Chit Value</div>
            <div className="text-2xl font-black text-amber-400">
              ₹{chitValue.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8">
        {/* Compliance Callout */}
        <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 mb-6 flex items-start space-x-3 text-xs text-amber-900">
          <ShieldCheck className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Statutory Auction Rules (Chit Funds Act, 1982):</span>
            <p className="mt-0.5 text-amber-800 leading-relaxed">
              Foreman's commission is fixed by law at <strong>5% (₹{foremanCommission.toLocaleString('en-IN')})</strong>. 
              The maximum permitted discount bid is capped at <strong>40% (₹{maxBidDiscount.toLocaleString('en-IN')})</strong> under the Karnataka Chit Funds Rules. 
              The remaining balance after foreman commission is distributed equally to all {subscribersCount} subscribers as a cash dividend.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Bid Controls */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Winning Bid Discount Offered
                </label>
                <span className="text-base font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                  ₹{bidDiscount.toLocaleString('en-IN')} ({((bidDiscount / chitValue) * 100).toFixed(1)}%)
                </span>
              </div>
              <input
                type="range"
                min={minBidDiscount}
                max={maxBidDiscount}
                step="1000"
                value={bidDiscount}
                disabled={isCompleted}
                onChange={(e) => setBidDiscount(Number(e.target.value))}
                className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-medium">
                <span>Min: ₹{minBidDiscount.toLocaleString('en-IN')} (5% Floor)</span>
                <span>Max: ₹{maxBidDiscount.toLocaleString('en-IN')} (40% Statutory Cap)</span>
              </div>
            </div>

            {/* Subscriber Selector */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-2">
                Eligible Non-Prized Bidding Member
              </label>
              <select
                value={selectedWinner}
                disabled={isCompleted}
                onChange={(e) => setSelectedWinner(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="Vikramaditya Hegde (Ticket #1)">Vikramaditya Hegde (Ticket #1) - Verified</option>
                <option value="Sunil Murthy (Ticket #4)">Sunil Murthy (Ticket #4) - Verified</option>
                <option value="Deepak Raj (Ticket #7)">Deepak Raj (Ticket #7) - Verified</option>
                <option value="Kavita Gowda (Ticket #11)">Kavita Gowda (Ticket #11) - Verified</option>
              </select>
            </div>

            {/* Action Button */}
            {!isCompleted ? (
              <button
                onClick={handleConduct}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black py-3 rounded-xl shadow-fintech-gold flex items-center justify-center space-x-2 transition"
              >
                <Gavel className="w-4 h-4" />
                <span>Declare Winner & Distribute Dividend</span>
              </button>
            ) : (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-emerald-800 font-bold text-xs">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Auction Successfully Completed & Logged</span>
                </div>
                <button
                  onClick={() => setIsCompleted(false)}
                  className="text-xs text-amber-700 font-bold hover:underline"
                >
                  Reset Simulator
                </button>
              </div>
            )}
          </div>

          {/* Right: Calculated Yield & Distribution */}
          <div className="lg:col-span-6 bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center space-x-1.5">
              <Coins className="w-4 h-4 text-amber-600" />
              <span>Statutory Yield & Dividend Ledger</span>
            </h4>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Net Prize Money to Winner</span>
                <div className="text-lg font-black text-emerald-700 mt-1">
                  ₹{netPrizeAmount.toLocaleString('en-IN')}
                </div>
                <span className="text-[10px] text-slate-400">(Chit Value - Discount)</span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Foreman Commission (5%)</span>
                <div className="text-lg font-black text-slate-900 mt-1">
                  ₹{foremanCommission.toLocaleString('en-IN')}
                </div>
                <span className="text-[10px] text-slate-400">Statutory Company Revenue</span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Total Pool Dividend</span>
                <div className="text-lg font-black text-blue-700 mt-1">
                  ₹{totalDividend.toLocaleString('en-IN')}
                </div>
                <span className="text-[10px] text-slate-400">Shared among {subscribersCount} members</span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Dividend per Member</span>
                <div className="text-lg font-black text-amber-600 mt-1">
                  ₹{dividendPerMember.toLocaleString('en-IN')}
                </div>
                <span className="text-[10px] text-slate-400">Deducted from next installment</span>
              </div>
            </div>

            {/* Next Month Net Installment */}
            <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-xl p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                  Next Month's Net Subscription
                </span>
                <p className="text-xs text-slate-300 mt-0.5">
                  Gross ₹{grossMonthlyInstallment.toLocaleString('en-IN')} - Dividend ₹{dividendPerMember.toLocaleString('en-IN')}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xl font-black text-white">
                  ₹{netMonthlyPayableNextMonth.toLocaleString('en-IN')}
                </span>
                <span className="block text-[10px] text-emerald-400 font-semibold">
                  Save ₹{dividendPerMember.toLocaleString('en-IN')} this month
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


import React, { useState } from 'react';
import { LoanEMICalculator } from '../../components/common/LoanEMICalculator';
import { ChitAuctionSimulator } from '../../components/common/ChitAuctionSimulator';
import { Calculator, Coins, Wallet } from 'lucide-react';

export const CalculatorPage: React.FC = () => {
  const [tab, setTab] = useState<'LOAN' | 'CHIT'>('LOAN');

  return (
    <div className="bg-slate-50 min-h-screen py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-1.5 bg-amber-100 text-amber-900 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
            <Calculator className="w-3.5 h-3.5 text-amber-700" />
            <span>Interactive Financial Planning</span>
          </div>
          <h1 className="text-4xl font-black text-slate-950 tracking-tight">
            Chit & Loan Financial Calculators
          </h1>
          <p className="text-slate-600 text-sm mt-3 leading-relaxed">
            Simulate your monthly loan repayment installments or test reverse auction dividend distributions before applying.
          </p>

          <div className="flex justify-center mt-6">
            <div className="bg-slate-200 p-1 rounded-2xl flex space-x-1 text-xs font-bold">
              <button
                onClick={() => setTab('LOAN')}
                className={`px-5 py-2.5 rounded-xl transition flex items-center space-x-2 ${
                  tab === 'LOAN'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-700 hover:text-slate-950'
                }`}
              >
                <Wallet className="w-4 h-4 text-blue-400" />
                <span>Loan EMI Calculator</span>
              </button>
              <button
                onClick={() => setTab('CHIT')}
                className={`px-5 py-2.5 rounded-xl transition flex items-center space-x-2 ${
                  tab === 'CHIT'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-700 hover:text-slate-950'
                }`}
              >
                <Coins className="w-4 h-4 text-amber-400" />
                <span>Chit Auction Simulator</span>
              </button>
            </div>
          </div>
        </div>

        {tab === 'LOAN' ? (
          <LoanEMICalculator />
        ) : (
          <ChitAuctionSimulator chitValue={100000} subscribersCount={25} />
        )}
      </div>
    </div>
  );
};


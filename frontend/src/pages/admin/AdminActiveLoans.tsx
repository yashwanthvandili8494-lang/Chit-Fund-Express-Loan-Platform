import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Loan } from '../../types';
import { Wallet, Clock, CheckCircle2, AlertCircle, Search } from 'lucide-react';

export const AdminActiveLoans: React.FC = () => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getAllActiveLoans();
        setLoans(data);
      } catch (e) {
        // fallback
        setLoans([
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
            repayments: []
          }
        ]);
      }
    }
    load();
  }, []);

  const filtered = loans.filter((l) =>
    l.loan_account_no.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-fintech flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
            <Clock className="w-4 h-4" />
            <span>Loan Book Portfolio</span>
          </div>
          <h1 className="text-2xl font-black text-slate-950">Active Loans & Recovery Monitor</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track live loan accounts, principal outstanding, and delinquency recovery metrics under Karnataka money lending rules
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search Loan Account..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-fintech overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold">
                <th className="py-3 px-4">Loan Account #</th>
                <th className="py-3 px-4 text-right">Sanctioned (₹)</th>
                <th className="py-3 px-4 text-right">Monthly EMI (₹)</th>
                <th className="py-3 px-4 text-right">Principal Outstanding</th>
                <th className="py-3 px-4 text-right">Total Recovered</th>
                <th className="py-3 px-4 text-center">APR Rate</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Disbursed Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-4 px-4 font-mono font-bold text-blue-700">{l.loan_account_no}</td>
                  <td className="py-4 px-4 text-right font-bold text-slate-900">₹{Number(l.principal_amount).toLocaleString('en-IN')}</td>
                  <td className="py-4 px-4 text-right font-black text-amber-600">₹{Number(l.monthly_emi).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td className="py-4 px-4 text-right font-bold text-slate-800">₹{Number(l.principal_outstanding).toLocaleString('en-IN')}</td>
                  <td className="py-4 px-4 text-right font-bold text-emerald-700">₹{Number(l.total_paid).toLocaleString('en-IN')}</td>
                  <td className="py-4 px-4 text-center font-semibold text-slate-600">{l.interest_rate_apr}%</td>
                  <td className="py-4 px-4 text-center">
                    <span className="bg-emerald-100 text-emerald-800 font-black px-2.5 py-0.5 rounded-full text-[10px]">
                      {l.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right text-slate-500 font-medium">{l.disbursement_date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};


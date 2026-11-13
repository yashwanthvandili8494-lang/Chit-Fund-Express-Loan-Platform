import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { LoanProduct } from '../../types';
import { Wallet, Plus, ShieldCheck, Check, X, Percent } from 'lucide-react';

export const AdminLoanProducts: React.FC = () => {
  const [products, setProducts] = useState<LoanProduct[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getLoanProducts();
        setProducts(data);
      } catch (e) {
        // fallback
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-fintech flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
            <Wallet className="w-4 h-4" />
            <span>Karnataka Money Lending Regulations</span>
          </div>
          <h1 className="text-2xl font-black text-slate-950">Loan Products & APR Architecture</h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure express personal and working capital credit lines with strict legal interest and fee caps
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map((p) => (
          <div key={p.id} className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-mono font-bold bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-0.5 rounded">
                {p.product_code}
              </span>
              <span className="text-xs font-black text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                {p.annual_interest_rate}% APR
              </span>
            </div>

            <h3 className="font-bold text-slate-950 text-base">{p.name}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">{p.description}</p>

            <div className="space-y-2 border-t border-slate-100 pt-3 text-xs text-slate-700">
              <div className="flex justify-between">
                <span>Sanction Limit:</span>
                <strong className="text-slate-950">₹{p.min_amount.toLocaleString('en-IN')} - ₹{p.max_amount.toLocaleString('en-IN')}</strong>
              </div>
              <div className="flex justify-between">
                <span>Tenure Range:</span>
                <strong className="text-slate-950">{p.min_tenure_months} to {p.max_tenure_months} Months</strong>
              </div>
              <div className="flex justify-between">
                <span>Processing Fee:</span>
                <strong className="text-slate-950">{p.processing_fee_pct}% + 18% GST</strong>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 text-[10px] text-slate-400">
              Licensed under Karnataka Money Lenders Act, 1961
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


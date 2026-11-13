import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { LoanProduct } from '../../types';
import { LoanEMICalculator } from '../../components/common/LoanEMICalculator';
import { Wallet, ShieldCheck, CheckCircle2, ArrowRight, Clock, Percent, FileCheck } from 'lucide-react';

export const LoansPage: React.FC = () => {
  const { quickLoginAs } = useAuth();
  const navigate = useNavigate();
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

  const handleApply = () => {
    quickLoginAs('CUSTOMER');
    navigate('/customer/available-loans');
  };

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-1.5 bg-blue-100 text-blue-900 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
            <Wallet className="w-3.5 h-3.5 text-blue-700" />
            <span>Licensed Money Lending Under Karnataka Law</span>
          </div>
          <h1 className="text-4xl font-black text-slate-950 tracking-tight">
            Express Personal & Business Credit
          </h1>
          <p className="text-slate-600 text-sm mt-3 leading-relaxed">
            Borrow transparently from ₹10,000 to ₹1,00,000 with clear reducing balance interest, fixed statutory APR disclosures, and instant bank disbursement upon underwriting approval.
          </p>
        </div>

        {/* Embedded Loan Calculator */}
        <LoanEMICalculator onApply={handleApply} />

        {/* Loan Products Grid */}
        <div>
          <h2 className="text-2xl font-black text-slate-950 mb-6">Our Regulated Loan Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {products.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded">
                      {p.product_code}
                    </span>
                    <span className="text-xs font-black text-amber-600">{p.annual_interest_rate}% APR</span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-lg">{p.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">{p.description}</p>

                  <div className="my-4 py-3 border-y border-slate-100 space-y-1.5 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span>Loan Limit:</span>
                      <strong className="text-slate-900 font-bold">₹{p.min_amount.toLocaleString('en-IN')} - ₹{p.max_amount.toLocaleString('en-IN')}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Tenure Options:</span>
                      <strong className="text-slate-900 font-bold">{p.min_tenure_months} to {p.max_tenure_months} Months</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Processing Fee:</span>
                      <strong className="text-slate-900 font-bold">{p.processing_fee_pct}% + GST</strong>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleApply}
                  className="w-full bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs py-2.5 rounded-xl transition flex items-center justify-center space-x-1"
                >
                  <span>Apply for Loan</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Regulatory Disclosures */}
        <div className="bg-blue-50/70 border border-blue-200 rounded-3xl p-8 text-xs text-blue-950 space-y-3">
          <div className="flex items-center space-x-2 text-blue-900 font-bold text-sm">
            <ShieldCheck className="w-5 h-5 text-blue-700" />
            <span>Statutory Money Lending Disclosures</span>
          </div>
          <p className="leading-relaxed text-blue-900/90">
            Sowbhagya Chits & FinServe Private Limited operates lending services under Karnataka Money Lenders Act, 1961 (Registration No. KA/BLR/MLL/2021/409). 
            All loans are subjected to borrower repayment capacity verification, verifiable bank statement validation, and credit appraisal. 
            There are zero pre-closure or hidden charges. APR displayed includes all applicable administrative fees.
          </p>
        </div>
      </div>
    </div>
  );
};


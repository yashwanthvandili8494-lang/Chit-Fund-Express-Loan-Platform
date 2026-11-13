import React from 'react';
import { BarChart3, Download, Printer, ShieldCheck, FileSpreadsheet } from 'lucide-react';

export const AdminReports: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-fintech flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>Statutory Accounting & Regulatory Statements</span>
          </div>
          <h1 className="text-2xl font-black text-slate-950">Financial Accounting & Audit Reports</h1>
          <p className="text-xs text-slate-500 mt-1">
            Download quarterly statutory statements for filing with Registrar of Chits and Income Tax Department
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center space-x-1.5"
        >
          <Printer className="w-4 h-4" />
          <span>Print All Audit Statements</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <span className="text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded">
            FORM XXI (Section 24)
          </span>
          <h3 className="font-bold text-slate-950 text-base">Registrar Chit Balance Sheet</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Statutory statement of assets and liabilities of chit fund groups filed annually with the Government of Karnataka.
          </p>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400">Status: Audited</span>
            <button className="text-blue-600 font-bold hover:underline flex items-center space-x-1">
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded">
            MLL FORM VIII
          </span>
          <h3 className="font-bold text-slate-950 text-base">Money Lending Returns</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Quarterly register of debtors, interest charged, recovery ratios, and outstanding principal balances.
          </p>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400">Status: Verified</span>
            <button className="text-blue-600 font-bold hover:underline flex items-center space-x-1">
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded">
            GST GSTR-1 & 3B
          </span>
          <h3 className="font-bold text-slate-950 text-base">Foreman Fee & GST Reconciliation</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            18% GST statement on 5% foreman commission and processing fees for monthly tax return filings.
          </p>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400">Status: Reconciled</span>
            <button className="text-blue-600 font-bold hover:underline flex items-center space-x-1">
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


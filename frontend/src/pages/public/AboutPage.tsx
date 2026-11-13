import React from 'react';
import { Building2, ShieldCheck, Award, Landmark, CheckCircle2, FileText } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="bg-slate-50 min-h-screen py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-1.5 bg-amber-100 text-amber-900 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
            <Building2 className="w-3.5 h-3.5 text-amber-700" />
            <span>Corporate Background & Statutory Credentials</span>
          </div>
          <h1 className="text-4xl font-black text-slate-950 tracking-tight">
            About Sowbhagya Chits & FinServe
          </h1>
          <p className="text-slate-600 text-sm mt-3 leading-relaxed">
            Incorporated in Bengaluru, Karnataka, Sowbhagya is committed to building India's most transparent, reliable, and technology-empowered chit fund and micro-lending enterprise.
          </p>
        </div>

        {/* Corporate Profile Card */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-fintech space-y-6">
          <h2 className="text-xl font-black text-slate-900 border-b border-slate-100 pb-3">
            Statutory Registration & Licenses
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Corporate Identity (CIN)</span>
              <strong className="text-slate-950 text-sm">U65992KA2018PTC112345</strong>
              <span className="text-[10px] text-slate-400 block mt-1">Registrar of Companies, Karnataka</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Chit Registrar License</span>
              <strong className="text-amber-700 text-sm">KA/BLR/CHIT/2019/882</strong>
              <span className="text-[10px] text-slate-400 block mt-1">Govt. of Karnataka Chit Authority</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Money Lending License</span>
              <strong className="text-blue-700 text-sm">KA/BLR/MLL/2021/409</strong>
              <span className="text-[10px] text-slate-400 block mt-1">Karnataka Money Lenders Act, 1961</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">GSTIN Number</span>
              <strong className="text-slate-950 text-sm">29ABCDE1234F1Z5</strong>
              <span className="text-[10px] text-slate-400 block mt-1">Central Board of Indirect Taxes</span>
            </div>
          </div>
        </div>

        {/* Board & Governance */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-fintech space-y-6">
          <h2 className="text-xl font-black text-slate-900 border-b border-slate-100 pb-3">
            Board of Directors & Senior Management
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-center">
              <div className="w-16 h-16 rounded-full bg-amber-500 text-slate-950 font-black text-xl flex items-center justify-center mx-auto mb-3">
                RR
              </div>
              <h3 className="font-bold text-sm text-slate-950">Rajeshwar Rao</h3>
              <p className="text-amber-700 font-semibold mt-0.5">Managing Director & Foreman</p>
              <p className="text-slate-500 text-[11px] mt-2">
                25+ years in Indian retail banking and chit fund administration across Karnataka.
              </p>
            </div>
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-center">
              <div className="w-16 h-16 rounded-full bg-blue-600 text-white font-black text-xl flex items-center justify-center mx-auto mb-3">
                AS
              </div>
              <h3 className="font-bold text-sm text-slate-950">Ananya Sharma</h3>
              <p className="text-blue-700 font-semibold mt-0.5">Head of Credit & Operations</p>
              <p className="text-slate-500 text-[11px] mt-2">
                Former underwriting lead at leading micro-finance institutions; specialist in UIDAI e-KYC compliance.
              </p>
            </div>
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-600 text-white font-black text-xl flex items-center justify-center mx-auto mb-3">
                KN
              </div>
              <h3 className="font-bold text-sm text-slate-950">K. N. Venkatesh</h3>
              <p className="text-emerald-700 font-semibold mt-0.5">Chief Legal & Compliance Officer</p>
              <p className="text-slate-500 text-[11px] mt-2">
                High Court Advocate; expert in Chit Funds Act 1982 litigation and statutory audits.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


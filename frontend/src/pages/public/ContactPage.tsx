import React from 'react';
import { MapPin, Phone, Mail, Clock, ShieldCheck, Send } from 'lucide-react';

export const ContactPage: React.FC = () => {
  return (
    <div className="bg-slate-50 min-h-screen py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-1.5 bg-amber-100 text-amber-900 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
            <MapPin className="w-3.5 h-3.5 text-amber-700" />
            <span>Karnataka Branch Offices & Grievance Redressal</span>
          </div>
          <h1 className="text-4xl font-black text-slate-950 tracking-tight">
            Contact & Support
          </h1>
          <p className="text-slate-600 text-sm mt-3 leading-relaxed">
            Our certified relationship managers and compliance officers are available across our branches in Bengaluru, Mangaluru, and Mysuru.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <span className="text-xs font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded">
              HEADQUARTERS
            </span>
            <h3 className="font-bold text-slate-900 text-base">Bengaluru Corporate Office</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              #42, 3rd Floor, FinTech Towers, MG Road, Bengaluru, Karnataka 560001
            </p>
            <div className="text-xs text-slate-700 space-y-1 pt-2 border-t border-slate-100">
              <p>Phone: <strong>+91 80 4912 8800</strong></p>
              <p>Email: <strong>support@sowbhagyachits.in</strong></p>
              <p>Hours: Mon - Sat: 9:30 AM - 6:00 PM</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <span className="text-xs font-mono font-bold bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded">
              COASTAL BRANCH
            </span>
            <h3 className="font-bold text-slate-900 text-base">Mangaluru Zonal Office</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              #18, Empire Arcade, K.S. Rao Road, Mangaluru, Karnataka 575001
            </p>
            <div className="text-xs text-slate-700 space-y-1 pt-2 border-t border-slate-100">
              <p>Phone: <strong>+91 824 249 5500</strong></p>
              <p>Email: <strong>mangaluru@sowbhagyachits.in</strong></p>
              <p>Hours: Mon - Sat: 9:30 AM - 6:00 PM</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <span className="text-xs font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded">
              HERITAGE BRANCH
            </span>
            <h3 className="font-bold text-slate-900 text-base">Mysuru Branch Office</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              #88, Devaraj Urs Road, Mysuru, Karnataka 570001
            </p>
            <div className="text-xs text-slate-700 space-y-1 pt-2 border-t border-slate-100">
              <p>Phone: <strong>+91 821 242 1100</strong></p>
              <p>Email: <strong>mysuru@sowbhagyachits.in</strong></p>
              <p>Hours: Mon - Sat: 9:30 AM - 6:00 PM</p>
            </div>
          </div>
        </div>

        {/* Nodal Officer Contact */}
        <div className="bg-amber-50/80 border border-amber-200 rounded-3xl p-8 text-xs text-amber-950 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="font-bold text-sm text-amber-900 flex items-center">
              <ShieldCheck className="w-5 h-5 mr-2 text-amber-700" />
              Statutory Grievance Redressal & Nodal Officer
            </span>
            <p className="mt-1 text-amber-800 leading-relaxed max-w-2xl">
              Under the Chit Funds Act, 1982 and RBI digital lending framework, subscribers with unresolved complaints may escalate to our Principal Nodal Officer: <strong>grievance@sowbhagyachits.in</strong> (Response within 24 working hours).
            </p>
          </div>
          <button className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl whitespace-nowrap shadow-sm">
            Contact Grievance Desk
          </button>
        </div>
      </div>
    </div>
  );
};


import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { 
  ShieldCheck, FileText, CheckSquare, CreditCard, 
  Users, AlertCircle, ArrowRight, CheckCircle2, Clock 
} from 'lucide-react';

export const StaffDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    pending_kyc: 2,
    pending_chit_apps: 1,
    pending_loan_apps: 1,
    today_collections: 42000,
  });

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-fintech border border-blue-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-blue-300 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Branch Operations & Underwriting Desk</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Staff Operations Portal: {user?.full_name || 'Officer'}
          </h1>
          <p className="text-blue-200 text-xs mt-1">
            Designation: Senior Branch Officer • Bengaluru Central Branch • Restricted Staff Clearance
          </p>
        </div>

        <div className="bg-blue-800/60 border border-blue-700 p-3.5 rounded-2xl text-xs text-blue-100 flex items-center space-x-3">
          <Clock className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <div>
            <p className="font-bold">Active Branch Hours</p>
            <p className="text-[11px] text-blue-300">Underwriting SLA: &lt; 2 Hours</p>
          </div>
        </div>
      </div>

      {/* Operational Queues Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Link
          to="/staff/kyc"
          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-fintech hover:border-amber-400 transition flex items-center justify-between group"
        >
          <div>
            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">KYC Review Queue</span>
            <div className="text-2xl font-black text-slate-950 mt-1">{stats.pending_kyc} Pending</div>
            <span className="text-[11px] text-amber-600 font-bold group-hover:underline mt-1 inline-block">
              Verify Documents →
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </Link>

        <Link
          to="/staff/chit-applications"
          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-fintech hover:border-blue-400 transition flex items-center justify-between group"
        >
          <div>
            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Chit Applications</span>
            <div className="text-2xl font-black text-slate-950 mt-1">{stats.pending_chit_apps} New</div>
            <span className="text-[11px] text-blue-600 font-bold group-hover:underline mt-1 inline-block">
              Review & Enroll →
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <FileText className="w-6 h-6" />
          </div>
        </Link>

        <Link
          to="/staff/loan-applications"
          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-fintech hover:border-emerald-400 transition flex items-center justify-between group"
        >
          <div>
            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Loan Underwriting</span>
            <div className="text-2xl font-black text-slate-950 mt-1">{stats.pending_loan_apps} Pending</div>
            <span className="text-[11px] text-emerald-600 font-bold group-hover:underline mt-1 inline-block">
              Credit Appraisal →
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckSquare className="w-6 h-6" />
          </div>
        </Link>

        <Link
          to="/staff/collections"
          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-fintech hover:border-indigo-400 transition flex items-center justify-between group"
        >
          <div>
            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Today's Collections</span>
            <div className="text-2xl font-black text-slate-950 mt-1">₹{stats.today_collections.toLocaleString('en-IN')}</div>
            <span className="text-[11px] text-indigo-600 font-bold group-hover:underline mt-1 inline-block">
              Record Collection →
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <CreditCard className="w-6 h-6" />
          </div>
        </Link>
      </div>

      {/* Task Priority Center */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-fintech space-y-4">
        <h3 className="font-black text-base text-slate-950 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-amber-600" />
          <span>Priority Action Tasks for Current Shift</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
            <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">High Priority</span>
            <h4 className="font-bold text-slate-900">Review Priya Nair KYC Submission</h4>
            <p className="text-slate-600">
              Aadhaar demographic token submitted with Voter ID and Bengaluru rent agreement.
            </p>
            <Link to="/staff/kyc" className="text-blue-600 font-bold hover:underline inline-block pt-1">
              Open Verification Desk →
            </Link>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
            <span className="text-[10px] font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded">Underwriting</span>
            <h4 className="font-bold text-slate-900">Appraise Arun Kumar ₹80,000 Loan</h4>
            <p className="text-slate-600">
              Retail business working capital loan. CIBIL score estimated at 742.
            </p>
            <Link to="/staff/loan-applications" className="text-blue-600 font-bold hover:underline inline-block pt-1">
              Review Capacity & Bank Data →
            </Link>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">Group Allocation</span>
            <h4 className="font-bold text-slate-900">Allot Chit Ticket for Vikramaditya Hegde</h4>
            <p className="text-slate-600">
              Approved subscriber for ₹1,00,000 Group Series 01. Assigned Ticket #1.
            </p>
            <Link to="/staff/chit-applications" className="text-blue-600 font-bold hover:underline inline-block pt-1">
              Verify Group Bylaws →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};


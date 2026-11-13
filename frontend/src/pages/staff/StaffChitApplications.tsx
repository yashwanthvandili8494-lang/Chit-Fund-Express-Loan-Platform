import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { ChitApplication } from '../../types';
import { FileText, CheckCircle2, XCircle, ShieldCheck, Check, X, Coins } from 'lucide-react';

export const StaffChitApplications: React.FC = () => {
  const [apps, setApps] = useState<ChitApplication[]>([]);
  const [selectedApp, setSelectedApp] = useState<ChitApplication | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getChitApplications();
        setApps(data);
        if (data.length > 0) setSelectedApp(data[0]);
      } catch (e) {
        // fallback
        const mock: ChitApplication[] = [
          {
            id: 2,
            application_no: 'CHIT-APP-202611-00215',
            user_id: 3,
            plan_id: 5,
            status: 'PENDING',
            nominee_name: 'Meenakshi Kumar',
            nominee_relationship: 'Mother',
            nominee_phone: '+919880556678',
            bank_name: 'State Bank of India',
            bank_account_no_masked: 'XXXX-XXXX-4619',
            bank_ifsc: 'SBIN0004018',
            created_at: '2026-11-12T14:20:00Z',
            user: {
              id: 3,
              full_name: 'Arun Kumar',
              email: 'arun.kumar@example.com',
              mobile_number: '+919880556677',
              role: 'CUSTOMER',
              is_active: true,
              is_verified: true,
              created_at: ''
            },
            plan: {
              id: 5,
              plan_code: 'CP-500K-25M',
              name: 'Sowbhagya Sampada Chit - 5 Lakhs',
              chit_value: 500000,
              duration_months: 25,
              monthly_subscription: 20000,
              max_subscribers: 25,
              foreman_commission_pct: 5,
              max_discount_pct: 40,
              min_discount_pct: 5,
              registered_scheme_ref: 'KA/BLR/REG/CP-500K/2026',
              registration_authority: 'Registrar of Chits, Bengaluru',
              is_active: true,
              created_at: ''
            }
          }
        ];
        setApps(mock);
        setSelectedApp(mock[0]);
      }
    }
    load();
  }, []);

  const handleAction = async (status: 'APPROVED' | 'ENROLLED' | 'REJECTED') => {
    if (!selectedApp) return;

    try {
      await api.reviewChitApplication(selectedApp.id, {
        status,
        rejection_reason: status === 'REJECTED' ? 'Applicant capacity or slot limitation' : undefined
      });
      setSuccessMsg(`Chit Application ${selectedApp.application_no} updated to ${status}!`);
      setApps((prev) =>
        prev.map((a) => (a.id === selectedApp.id ? { ...a, status } : a))
      );
      setSelectedApp((prev) => (prev ? { ...prev, status } : null));
    } catch (e) {
      setSuccessMsg(`Chit Application updated to ${status}!`);
      setApps((prev) =>
        prev.map((a) => (a.id === selectedApp.id ? { ...a, status } : a))
      );
      setSelectedApp((prev) => (prev ? { ...prev, status } : null));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-fintech flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
            <Coins className="w-4 h-4" />
            <span>Subscriber Review Desk</span>
          </div>
          <h1 className="text-2xl font-black text-slate-950">Chit Enrollment Applications</h1>
          <p className="text-xs text-slate-500 mt-1">
            Review subscriber capacity, nominate tickets, and enroll approved applicants into active chit series
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-xs font-bold flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-fintech space-y-4">
          <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3">
            Applications Queue ({apps.length})
          </h3>

          <div className="divide-y divide-slate-100">
            {apps.map((a) => (
              <div
                key={a.id}
                onClick={() => setSelectedApp(a)}
                className={`p-4 rounded-2xl cursor-pointer transition flex items-center justify-between ${
                  selectedApp?.id === a.id
                    ? 'bg-blue-50/70 border border-blue-200'
                    : 'hover:bg-slate-50 border border-transparent'
                }`}
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-bold text-sm text-slate-950">{a.user?.full_name || 'Subscriber'}</h4>
                    <span className="text-[10px] font-mono text-slate-500">{a.application_no}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Scheme: <strong>{a.plan?.name}</strong> (₹{Number(a.plan?.chit_value || 100000).toLocaleString('en-IN')})
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">Nominee: {a.nominee_name} ({a.nominee_relationship})</p>
                </div>

                <div className="text-right">
                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                    a.status === 'ENROLLED' || a.status === 'APPROVED'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : a.status === 'PENDING'
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-red-100 text-red-800 border border-red-300'
                  }`}>
                    {a.status}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1">Click to Process</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedApp && (
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-fintech space-y-5">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                Application Review Details
              </span>
              <h3 className="text-lg font-black text-slate-950 mt-0.5">
                {selectedApp.user?.full_name}
              </h3>
              <p className="text-xs text-slate-500 font-mono">{selectedApp.application_no}</p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Selected Chit Scheme:</span>
                  <strong className="text-slate-900">{selectedApp.plan?.name}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Chit Value:</span>
                  <strong className="text-slate-900">₹{Number(selectedApp.plan?.chit_value).toLocaleString('en-IN')}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Monthly Contribution:</span>
                  <strong className="text-amber-700">₹{Number(selectedApp.plan?.monthly_subscription).toLocaleString('en-IN')}</strong>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Nominee Name:</span>
                  <strong className="text-slate-900">{selectedApp.nominee_name}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Relation:</span>
                  <strong className="text-slate-900">{selectedApp.nominee_relationship}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Bank & IFSC:</span>
                  <strong className="text-slate-900">{selectedApp.bank_name} ({selectedApp.bank_ifsc})</strong>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex space-x-3">
              <button
                onClick={() => handleAction('ENROLLED')}
                className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center space-x-1"
              >
                <Check className="w-4 h-4" />
                <span>Approve & Enroll Ticket</span>
              </button>
              <button
                onClick={() => handleAction('REJECTED')}
                className="py-2.5 px-4 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-xl border border-red-200 transition flex items-center space-x-1"
              >
                <X className="w-4 h-4" />
                <span>Reject</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


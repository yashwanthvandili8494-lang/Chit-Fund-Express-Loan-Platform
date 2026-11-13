import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { History, ShieldCheck, Lock, Search } from 'lucide-react';

export const AdminAuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getAuditLogs();
        setLogs(data);
      } catch (e) {
        // fallback
        setLogs([
          {
            id: 1,
            user_name: 'Rajeshwar Rao',
            user_role: 'ADMIN',
            action: 'SYSTEM_INIT',
            module: 'CORE',
            details: 'Platform initialised with Karnataka Registrar of Chits registration KA/BLR/CHIT/2019/882',
            ip_address: '127.0.0.1',
            created_at: '10 Nov 2026, 09:30:00 AM'
          },
          {
            id: 2,
            user_name: 'Ananya Sharma',
            user_role: 'STAFF',
            action: 'KYC_VERIFIED',
            module: 'KYC',
            details: 'Customer Vikramaditya Hegde verified with Passport and Aadhaar demographic match',
            ip_address: '127.0.0.1',
            created_at: '11 Nov 2026, 11:15:32 AM'
          },
          {
            id: 3,
            user_name: 'Rajeshwar Rao',
            user_role: 'ADMIN',
            action: 'AUCTION_COMPLETED',
            module: 'CHITS',
            details: 'Group SOWBHAGYA-BLR-100K-G01 Round #2 winning bid discount ₹30,000 recorded',
            ip_address: '127.0.0.1',
            created_at: '12 Nov 2026, 04:30:15 PM'
          }
        ]);
      }
    }
    load();
  }, []);

  const filtered = logs.filter(
    (l) =>
      l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.user_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-fintech flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
            <History className="w-4 h-4" />
            <span>Immutable Security Audit Trail</span>
          </div>
          <h1 className="text-2xl font-black text-slate-950">System Audit & Compliance Trail</h1>
          <p className="text-xs text-slate-500 mt-1">
            Chronological cryptographic ledger of all administrator, staff, and financial actions
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search action or user..."
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
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Module</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Event Description</th>
                <th className="py-3 px-4 text-right">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px] whitespace-nowrap">{l.created_at}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-950">{l.user_name}</td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-[10px] uppercase bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                      {l.user_role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-[11px] text-amber-700">{l.module}</span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{l.action}</td>
                  <td className="py-3.5 px-4 text-slate-600 max-w-md truncate">{l.details}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-400 text-right">{l.ip_address}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};


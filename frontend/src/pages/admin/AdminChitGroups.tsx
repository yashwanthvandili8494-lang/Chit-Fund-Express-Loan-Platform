import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { ChitGroup } from '../../types';
import { Landmark, ShieldCheck, CheckCircle2, Users, Calendar, Coins } from 'lucide-react';

export const AdminChitGroups: React.FC = () => {
  const [groups, setGroups] = useState<ChitGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<ChitGroup | null>(null);
  const [members, setMembers] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getChitGroups();
        setGroups(data);
        if (data.length > 0) {
          setSelectedGroup(data[0]);
          loadMembers(data[0].id);
        }
      } catch (e) {
        // fallback
        const mock: ChitGroup[] = [
          {
            id: 1,
            group_code: 'SOWBHAGYA-BLR-100K-G01',
            group_name: 'Sowbhagya Bengaluru 1L Series 01',
            plan_id: 2,
            current_installment: 3,
            status: 'ACTIVE',
            pso_order_number: 'PSO/BLR/2026/8912',
            commencement_cert_no: 'CC/BLR/2026/4102',
            bank_fd_ref: 'CANARA-FD-8891002341',
            bank_fd_amount: 100000,
            start_date: '2026-08-15',
            end_date: '2028-09-15',
            next_auction_date: '2026-12-15T16:00:00Z'
          },
          {
            id: 2,
            group_code: 'SOWBHAGYA-BLR-500K-G04',
            group_name: 'Sowbhagya Bengaluru 5L Series 04',
            plan_id: 5,
            current_installment: 1,
            status: 'ACTIVE',
            pso_order_number: 'PSO/BLR/2026/9044',
            commencement_cert_no: 'CC/BLR/2026/4890',
            bank_fd_ref: 'SBI-FD-994810231',
            bank_fd_amount: 500000,
            start_date: '2026-11-01',
            end_date: '2028-12-01',
            next_auction_date: '2026-12-01T16:00:00Z'
          }
        ];
        setGroups(mock);
        setSelectedGroup(mock[0]);
        loadMembers(mock[0].id);
      }
    }
    load();
  }, []);

  const loadMembers = async (gid: number) => {
    try {
      const data = await api.getGroupMembers(gid);
      setMembers(data);
    } catch (e) {
      setMembers([
        { id: 1, ticket_number: 1, full_name: 'Vikramaditya Hegde', mobile: '+919880334455', is_prized: false, prized_amount: 0, status: 'ACTIVE' },
        { id: 2, ticket_number: 2, full_name: 'Rajeshwar Rao (Foreman)', mobile: '+919880112233', is_prized: true, prized_amount: 100000, status: 'ACTIVE' },
        { id: 3, ticket_number: 3, full_name: 'Arun Kumar', mobile: '+919880556677', is_prized: true, prized_amount: 70000, status: 'ACTIVE' }
      ]);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-fintech flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
            <Landmark className="w-4 h-4" />
            <span>Statutory Group Registrations</span>
          </div>
          <h1 className="text-2xl font-black text-slate-950">Chit Groups & Member Registry</h1>
          <p className="text-xs text-slate-500 mt-1">
            Prior Sanction Orders (PSO), 100% Security FD refs, and ticket allocations under the Chit Funds Act, 1982
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Active Groups */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="font-bold text-sm text-slate-900">Registered Chit Groups ({groups.length})</h3>
          {groups.map((g) => (
            <div
              key={g.id}
              onClick={() => { setSelectedGroup(g); loadMembers(g.id); }}
              className={`p-6 rounded-3xl border transition cursor-pointer ${
                selectedGroup?.id === g.id
                  ? 'bg-amber-50/70 border-amber-300 shadow-md'
                  : 'bg-white border-slate-200 hover:bg-slate-50 shadow-sm'
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-mono font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
                  {g.group_code}
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full">
                  {g.status}
                </span>
              </div>

              <h4 className="font-black text-base text-slate-950">{g.group_name}</h4>

              <div className="space-y-1 text-xs text-slate-600 mt-3 font-mono">
                <p>PSO Order: <strong>{g.pso_order_number}</strong></p>
                <p>Commencement: <strong>{g.commencement_cert_no}</strong></p>
                <p>Bank 100% FD: <strong className="text-emerald-700">{g.bank_fd_ref} (₹{Number(g.bank_fd_amount).toLocaleString('en-IN')})</strong></p>
                <p>Progress: <strong>Round {g.current_installment} in progress</strong></p>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Member Ticket Roster for Selected Group */}
        {selectedGroup && (
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-fintech space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
                  Subscribers Ticket Registry
                </span>
                <h3 className="font-black text-base text-slate-950 mt-0.5">
                  {selectedGroup.group_name}
                </h3>
              </div>
              <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                {members.length} Enrolled Subscribers
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold">
                    <th className="py-2.5 px-3">Ticket #</th>
                    <th className="py-2.5 px-3">Subscriber Name</th>
                    <th className="py-2.5 px-3">Contact</th>
                    <th className="py-2.5 px-3 text-center">Prize Status</th>
                    <th className="py-2.5 px-3 text-right">Prized Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {members.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-mono font-bold text-amber-700">Ticket #{m.ticket_number}</td>
                      <td className="py-3 px-3 font-bold text-slate-900">{m.full_name}</td>
                      <td className="py-3 px-3 text-slate-500">{m.mobile}</td>
                      <td className="py-3 px-3 text-center">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          m.is_prized ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {m.is_prized ? 'Prized' : 'Non-Prized'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-black text-slate-950">
                        {m.is_prized ? `₹${Number(m.prized_amount).toLocaleString('en-IN')}` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


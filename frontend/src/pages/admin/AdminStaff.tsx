import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { UserCheck, ShieldCheck, CheckSquare, Plus, Lock, Check, X } from 'lucide-react';

export const AdminStaff: React.FC = () => {
  const [staffList, setStaffList] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [designation, setDesignation] = useState('Senior Operations Officer');
  const [branch, setBranch] = useState('Bengaluru Main Branch');
  const [canKyc, setCanKyc] = useState(true);
  const [canCollect, setCanCollect] = useState(true);
  const [canReview, setCanReview] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getStaffMembers();
        setStaffList(data);
      } catch (e) {
        // fallback
        setStaffList([
          {
            id: 2,
            full_name: 'Ananya Sharma',
            email: 'staff@sowbhagyachits.in',
            mobile_number: '+919880223344',
            employee_code: 'SO-BLR-0042',
            department: 'Credit & Chit Operations',
            designation: 'Senior Branch Officer',
            branch: 'Bengaluru Central Branch',
            is_active: true,
            can_verify_kyc: true,
            can_collect_payments: true,
            can_review_applications: true
          }
        ]);
      }
    }
    load();
  }, []);

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    const newStaff = {
      id: staffList.length + 10,
      full_name: fullName,
      email,
      mobile_number: mobile,
      employee_code: `SO-BLR-${Math.floor(1000 + Math.random() * 9000)}`,
      department: 'Operations',
      designation,
      branch,
      is_active: true,
      can_verify_kyc: canKyc,
      can_collect_payments: canCollect,
      can_review_applications: canReview
    };
    setStaffList([newStaff, ...staffList]);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-fintech flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
            <UserCheck className="w-4 h-4" />
            <span>Staff Roles & Delegated Clearance</span>
          </div>
          <h1 className="text-2xl font-black text-slate-950">Staff & Operations Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Assign branch permissions for KYC review, collections, and underwriting without exposing financial owner controls
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add Staff Member</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-fintech overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold">
                <th className="py-3 px-4">Emp Code</th>
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Branch & Designation</th>
                <th className="py-3 px-4 text-center">KYC Clearance</th>
                <th className="py-3 px-4 text-center">Collection Desk</th>
                <th className="py-3 px-4 text-center">Underwriting</th>
                <th className="py-3 px-4 text-right">Account Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {staffList.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-4 px-4 font-mono font-bold text-slate-900">{s.employee_code}</td>
                  <td className="py-4 px-4">
                    <span className="font-bold text-slate-950 block">{s.full_name}</span>
                    <span className="text-[11px] text-slate-400">{s.email} • {s.mobile_number}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-semibold text-slate-800 block">{s.designation}</span>
                    <span className="text-[10px] text-slate-500">{s.branch}</span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    {s.can_verify_kyc ? (
                      <span className="inline-flex items-center text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold text-[10px]">
                        <Check className="w-3 h-3 mr-1" /> Allowed
                      </span>
                    ) : (
                      <span className="text-slate-400 font-bold text-[10px]">Restricted</span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-center">
                    {s.can_collect_payments ? (
                      <span className="inline-flex items-center text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold text-[10px]">
                        <Check className="w-3 h-3 mr-1" /> Allowed
                      </span>
                    ) : (
                      <span className="text-slate-400 font-bold text-[10px]">Restricted</span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-center">
                    {s.can_review_applications ? (
                      <span className="inline-flex items-center text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold text-[10px]">
                        <Check className="w-3 h-3 mr-1" /> Allowed
                      </span>
                    ) : (
                      <span className="text-slate-400 font-bold text-[10px]">Restricted</span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="bg-emerald-100 text-emerald-800 font-black text-[10px] px-2.5 py-0.5 rounded-full">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="bg-[#0B192C] text-white p-6 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-white">Create Staff Member Account</h3>
                <p className="text-xs text-slate-400">Configure delegated branch permissions</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStaff} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-bold uppercase tracking-wider text-slate-700 block mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold uppercase tracking-wider text-slate-700 block mb-1">Official Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold uppercase tracking-wider text-slate-700 block mb-1">Mobile (+91)</label>
                <input
                  type="tel"
                  required
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold uppercase tracking-wider text-slate-700 block mb-1">Designation</label>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold uppercase tracking-wider text-slate-700 block mb-1">Branch</label>
                  <input
                    type="text"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-2 border-t border-slate-200 pt-3">
                <span className="font-bold text-slate-800 block">Restricted Permission Toggles:</span>
                <label className="flex items-center space-x-2 text-slate-700">
                  <input type="checkbox" checked={canKyc} onChange={(e) => setCanKyc(e.target.checked)} className="rounded" />
                  <span>Can review & verify Customer KYC records</span>
                </label>
                <label className="flex items-center space-x-2 text-slate-700">
                  <input type="checkbox" checked={canCollect} onChange={(e) => setCanCollect(e.target.checked)} className="rounded" />
                  <span>Can accept cash/NEFT counter payments</span>
                </label>
                <label className="flex items-center space-x-2 text-slate-700">
                  <input type="checkbox" checked={canReview} onChange={(e) => setCanReview(e.target.checked)} className="rounded" />
                  <span>Can review Chit & Loan applications</span>
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-sm transition"
                >
                  Save Staff Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


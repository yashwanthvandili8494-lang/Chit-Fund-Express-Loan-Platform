import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Users, Search, ShieldCheck, CheckCircle2, AlertTriangle, Plus, X } from 'lucide-react';

export const AdminCustomers: React.FC = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // New Customer Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('Password@123');

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getAllCustomers();
        setCustomers(data);
      } catch (e) {
        // fallback
        setCustomers([
          { id: 1, full_name: 'Vikramaditya Hegde', email: 'customer@sowbhagyachits.in', mobile_number: '+919880334455', kyc_status: 'VERIFIED', aadhaar_masked: 'XXXX-XXXX-1234', pan_masked: 'ABXXXXX34F', is_active: true, is_verified: true, joined_date: '10 Sep 2026' },
          { id: 2, full_name: 'Priya Nair', email: 'priya.nair@example.com', mobile_number: '+919880445566', kyc_status: 'SUBMITTED', aadhaar_masked: 'XXXX-XXXX-1199', pan_masked: 'BKXXXXX88K', is_active: true, is_verified: false, joined_date: '12 Nov 2026' },
          { id: 3, full_name: 'Arun Kumar', email: 'arun.kumar@example.com', mobile_number: '+919880556677', kyc_status: 'VERIFIED', aadhaar_masked: 'XXXX-XXXX-5566', pan_masked: 'CQXXXXX32N', is_active: true, is_verified: true, joined_date: '15 Oct 2026' }
        ]);
      }
    }
    load();
  }, []);

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.register({
        full_name: fullName,
        email,
        mobile_number: mobile,
        password,
        role: 'CUSTOMER'
      });
      setCustomers([
        {
          id: customers.length + 1,
          full_name: fullName,
          email,
          mobile_number: mobile,
          kyc_status: 'NOT_SUBMITTED',
          aadhaar_masked: 'Pending',
          pan_masked: 'Pending',
          is_active: true,
          is_verified: false,
          joined_date: 'Today'
        },
        ...customers
      ]);
      setShowAddModal(false);
      setFullName('');
      setEmail('');
      setMobile('');
    } catch (err) {
      setShowAddModal(false);
    }
  };

  const filtered = customers.filter(
    (c) =>
      c.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.mobile_number.includes(searchTerm)
  );

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-fintech flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            <span>Subscriber Directory & KYC Management</span>
          </div>
          <h1 className="text-2xl font-black text-slate-950">Customer Directory</h1>
          <p className="text-xs text-slate-500 mt-1">
            All registered Indian subscribers across Karnataka branches with masked statutory KYC identifiers
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by Name, Mobile..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center space-x-1.5 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-fintech overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold">
                <th className="py-3 px-4">UID</th>
                <th className="py-3 px-4">Customer Legal Name</th>
                <th className="py-3 px-4">Contact Info</th>
                <th className="py-3 px-4">Aadhaar (Masked)</th>
                <th className="py-3 px-4">PAN (Masked)</th>
                <th className="py-3 px-4 text-center">KYC Status</th>
                <th className="py-3 px-4 text-right">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-4 px-4 font-mono font-bold text-slate-900">CUST-{String(c.id).padStart(4, '0')}</td>
                  <td className="py-4 px-4">
                    <span className="font-bold text-slate-950 block">{c.full_name}</span>
                    <span className="text-[10px] text-slate-400 font-medium">Active Member</span>
                  </td>
                  <td className="py-4 px-4 text-slate-600">
                    <div>{c.mobile_number}</div>
                    <div className="text-[11px] text-slate-400">{c.email}</div>
                  </td>
                  <td className="py-4 px-4 font-mono text-slate-700">{c.aadhaar_masked}</td>
                  <td className="py-4 px-4 font-mono text-slate-700">{c.pan_masked}</td>
                  <td className="py-4 px-4 text-center">
                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                      c.kyc_status === 'VERIFIED'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : c.kyc_status === 'SUBMITTED'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-slate-100 text-slate-700 border border-slate-300'
                    }`}>
                      {c.kyc_status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right text-slate-500 font-medium">{c.joined_date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="bg-[#0B192C] text-white p-6 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-white">Enroll New Customer Account</h3>
                <p className="text-xs text-slate-400">Assisted registration by Branch Admin</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCustomer} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-bold uppercase tracking-wider text-slate-700 block mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="As per PAN card"
                  className="w-full font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold uppercase tracking-wider text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="customer@domain.com"
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
                  placeholder="+91 98800 12345"
                  className="w-full font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold uppercase tracking-wider text-slate-700 block mb-1">Default Password</label>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full font-mono bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                />
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
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl shadow-sm transition"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


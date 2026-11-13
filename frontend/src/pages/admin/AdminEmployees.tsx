import React, { useState, useEffect } from 'react';
import { Users, PlusCircle, Building2, MapPin, Search, Filter, ShieldCheck, Mail, Phone, Calendar } from 'lucide-react';
import { api } from '../../services/api';
import { Employee, Branch } from '../../types';

export const AdminEmployees: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    department: 'Branch Operations',
    designation: 'Operations Officer',
    branch_id: 1,
    date_of_joining: new Date().toISOString().split('T')[0],
    basic_salary: 28000,
    hra: 11200,
    special_allowances: 5800,
    password: 'Password@123',
    bank_name: 'HDFC Bank',
    bank_ifsc: 'HDFC0001234',
    bank_account_masked: '••••••••5512',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [empData, branchData] = await Promise.all([
        api.getEmployees(),
        api.getBranches(),
      ]);
      setEmployees(empData);
      setBranches(branchData);
    } catch (err: any) {
      console.error('Failed to load employees:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setMessage(null);
      await api.addEmployee(formData);
      setMessage({ type: 'success', text: `Employee ${formData.full_name} onboarded successfully with configured salary structure!` });
      setShowAddModal(false);
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        department: 'Branch Operations',
        designation: 'Operations Officer',
        branch_id: 1,
        date_of_joining: new Date().toISOString().split('T')[0],
        basic_salary: 28000,
        hra: 11200,
        special_allowances: 5800,
        password: 'Password@123',
        bank_name: 'HDFC Bank',
        bank_ifsc: 'HDFC0001234',
        bank_account_masked: '••••••••5512',
      });
      await loadData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to add employee' });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.full_name.toLowerCase().includes(search.toLowerCase()) ||
                          emp.employee_id.toLowerCase().includes(search.toLowerCase()) ||
                          emp.email.toLowerCase().includes(search.toLowerCase());
    const matchesBranch = selectedBranch === 'ALL' || String(emp.branch_id) === selectedBranch;
    return matchesSearch && matchesBranch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Employee Directory & Staff Master</h1>
          <p className="text-sm text-slate-500 mt-1">Manage physical branches, departmental staff, compensation structures, and access credentials</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-navy-900 hover:bg-navy-800 text-white rounded-xl text-sm font-semibold shadow-sm transition-all active:scale-95"
        >
          <PlusCircle className="w-4 h-4 text-gold-400" />
          <span>Onboard New Employee</span>
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-xl text-sm flex items-center space-x-2 ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          <span>{message.text}</span>
        </div>
      )}

      {/* Branches Info Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {branches.map(b => (
          <div key={b.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-start space-x-3">
            <div className="p-2.5 bg-navy-50 text-navy-900 rounded-xl">
              <Building2 className="w-5 h-5 text-gold-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-mono font-bold text-slate-400">{b.branch_code}</p>
              <h4 className="font-bold text-sm text-slate-900 truncate">{b.branch_name}</h4>
              <p className="text-xs text-slate-500 truncate mt-0.5">{b.address}</p>
              <p className="text-[11px] text-slate-400 mt-1">Mgr: {b.manager_name || 'Rajeshwar Rao'}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, ID (e.g. EMP001), or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-navy-600 outline-none"
          />
        </div>
        <select
          value={selectedBranch}
          onChange={(e) => setSelectedBranch(e.target.value)}
          className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none"
        >
          <option value="ALL">All Branches</option>
          {branches.map(b => (
            <option key={b.id} value={String(b.id)}>{b.branch_name}</option>
          ))}
        </select>
      </div>

      {/* Employee Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-900 text-base">Active Roster ({filteredEmployees.length} Members)</h3>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Loading staff members...</div>
        ) : filteredEmployees.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">No employees found matching filter.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-6">Emp Code</th>
                  <th className="py-3 px-6">Full Name</th>
                  <th className="py-3 px-6">Department</th>
                  <th className="py-3 px-6">Designation</th>
                  <th className="py-3 px-6">Contact Info</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-6 font-mono font-bold text-navy-900 text-xs">
                      {emp.employee_id}
                    </td>
                    <td className="py-3.5 px-6">
                      <div className="font-semibold text-slate-900">{emp.full_name}</div>
                      <div className="text-xs text-slate-400 font-mono">{emp.bank_name} • {emp.bank_account_masked}</div>
                    </td>
                    <td className="py-3.5 px-6 text-slate-700">
                      {emp.department}
                    </td>
                    <td className="py-3.5 px-6 font-medium text-slate-800">
                      {emp.designation}
                    </td>
                    <td className="py-3.5 px-6 text-xs text-slate-600 space-y-0.5">
                      <div className="flex items-center space-x-1">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>{emp.email}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{emp.phone}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                        {emp.employment_status}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-xs text-slate-500">
                      {new Date(emp.date_of_joining).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-lg text-slate-900">Onboard New Employee</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleAddEmployee} className="space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Anand Kulkarni"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-navy-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Official Email</label>
                  <input
                    type="email"
                    required
                    placeholder="anand@sowbhagyachits.in"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-navy-600 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98450 12345"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-navy-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Branch</label>
                  <select
                    value={formData.branch_id}
                    onChange={(e) => setFormData({ ...formData, branch_id: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-navy-600 outline-none"
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.branch_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-navy-600 outline-none"
                  >
                    <option value="Branch Operations">Branch Operations</option>
                    <option value="Credit & Underwriting">Credit & Underwriting</option>
                    <option value="Collections & Recovery">Collections & Recovery</option>
                    <option value="Accounts & Finance">Accounts & Finance</option>
                    <option value="Customer Support">Customer Support</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Designation</label>
                  <input
                    type="text"
                    required
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-navy-600 outline-none"
                  />
                </div>
              </div>

              {/* Compensation Structure Setup */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-700">Monthly Compensation Structure (₹)</p>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Basic Salary</label>
                    <input
                      type="number"
                      required
                      value={formData.basic_salary}
                      onChange={(e) => setFormData({ ...formData, basic_salary: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">HRA (40%)</label>
                    <input
                      type="number"
                      required
                      value={formData.hra}
                      onChange={(e) => setFormData({ ...formData, hra: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Allowances</label>
                    <input
                      type="number"
                      required
                      value={formData.special_allowances}
                      onChange={(e) => setFormData({ ...formData, special_allowances: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                </div>
                <p className="text-xs text-slate-500">
                  Gross: ₹{(formData.basic_salary + formData.hra + formData.special_allowances).toLocaleString('en-IN')} | EPF (12%) & PT (₹200) computed automatically.
                </p>
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-navy-900 hover:bg-navy-800 text-white rounded-xl font-semibold transition-all shadow-sm"
                >
                  {submitting ? 'Onboarding...' : 'Confirm Onboarding'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

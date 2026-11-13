import React, { useState, useEffect } from 'react';
import { Receipt, PlusCircle, Building2, TrendingDown, DollarSign, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import { Expense, Branch } from '../../types';

export const AdminExpenses: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState({
    branch_id: 1,
    category: 'Rent & Maintenance',
    amount: 15000,
    expense_date: new Date().toISOString().split('T')[0],
    description: '',
    vendor_name: '',
    payment_mode: 'BANK_TRANSFER',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [expData, branchData] = await Promise.all([
        api.getExpenses(),
        api.getBranches(),
      ]);
      setExpenses(expData);
      setBranches(branchData);
    } catch (err: any) {
      console.error('Failed to load expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || formData.amount <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid description and positive amount.' });
      return;
    }

    try {
      setSubmitting(true);
      setMessage(null);
      await api.recordExpense(formData);
      setMessage({ type: 'success', text: `Expense voucher recorded successfully!` });
      setShowAddModal(false);
      setFormData({
        branch_id: 1,
        category: 'Rent & Maintenance',
        amount: 15000,
        expense_date: new Date().toISOString().split('T')[0],
        description: '',
        vendor_name: '',
        payment_mode: 'BANK_TRANSFER',
      });
      await loadData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to record expense.' });
    } finally {
      setSubmitting(false);
    }
  };

  const totalExpenseAmount = expenses.reduce((acc, e) => acc + Number(e.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Branch Office Expenses & Accounts</h1>
          <p className="text-sm text-slate-500 mt-1">Record institutional operating expenses, track vendor disbursements, and manage cost centers</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-navy-900 hover:bg-navy-800 text-white rounded-xl text-sm font-semibold shadow-sm transition-all active:scale-95"
        >
          <PlusCircle className="w-4 h-4 text-gold-400" />
          <span>Record Expense Voucher</span>
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-xl text-sm flex items-center space-x-2 ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-medium">Total Operating Outflow</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">₹{totalExpenseAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
          <p className="text-xs text-slate-400 mt-1">Across all registered physical branches</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-medium">Vouchers Logged</p>
          <h3 className="text-2xl font-bold text-navy-900 mt-1">{expenses.length} Vouchers</h3>
          <p className="text-xs text-slate-400 mt-1">100% tax invoice compliant</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-medium">Primary Expense Head</p>
          <h3 className="text-2xl font-bold text-amber-600 mt-1">Rent & Compliance</h3>
          <p className="text-xs text-slate-400 mt-1">Prestige Commercial lease</p>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-900 text-base">Expense Vouchers Ledger</h3>
          <span className="text-xs text-slate-500">Chronological transaction record</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Loading expenses...</div>
        ) : expenses.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">No expenses recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-6">Voucher No</th>
                  <th className="py-3 px-6">Date</th>
                  <th className="py-3 px-6">Category</th>
                  <th className="py-3 px-6">Description</th>
                  <th className="py-3 px-6">Vendor Name</th>
                  <th className="py-3 px-6">Amount</th>
                  <th className="py-3 px-6">Payment Mode</th>
                  <th className="py-3 px-6">Approved By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-6 font-mono font-bold text-navy-900 text-xs">
                      {exp.voucher_no}
                    </td>
                    <td className="py-3.5 px-6 font-medium text-slate-900 text-xs">
                      {new Date(exp.expense_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-xs text-slate-600 max-w-xs truncate">
                      {exp.description}
                    </td>
                    <td className="py-3.5 px-6 text-xs text-slate-800 font-medium">
                      {exp.vendor_name || 'Direct Billing'}
                    </td>
                    <td className="py-3.5 px-6 font-bold text-rose-700">
                      ₹{Number(exp.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-6 font-mono text-xs text-slate-500">
                      {exp.payment_mode}
                    </td>
                    <td className="py-3.5 px-6 text-xs text-slate-600">
                      {exp.approved_by}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-lg text-slate-900">Record Expense Voucher</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-4 text-sm">
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Expense Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-navy-600 outline-none"
                  >
                    <option value="Rent & Maintenance">Rent & Maintenance</option>
                    <option value="IT & Cloud Services">IT & Cloud Services</option>
                    <option value="Legal & Compliance">Legal & Compliance</option>
                    <option value="Office Supplies">Office Supplies</option>
                    <option value="Electricity & Utilities">Electricity & Utilities</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-navy-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Monthly internet leased line bill..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-navy-600 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Vendor / Payee Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Tata Tele Services"
                    value={formData.vendor_name}
                    onChange={(e) => setFormData({ ...formData, vendor_name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-navy-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Expense Date</label>
                  <input
                    type="date"
                    required
                    value={formData.expense_date}
                    onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-navy-600 outline-none"
                  />
                </div>
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
                  {submitting ? 'Saving...' : 'Record Voucher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

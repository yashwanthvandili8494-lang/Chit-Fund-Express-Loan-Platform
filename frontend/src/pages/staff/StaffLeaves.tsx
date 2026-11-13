import React, { useState, useEffect } from 'react';
import { Calendar, PlusCircle, CheckCircle2, AlertCircle, Clock, FileText } from 'lucide-react';
import { api } from '../../services/api';
import { LeaveApplication } from '../../types';

export const StaffLeaves: React.FC = () => {
  const [leaves, setLeaves] = useState<LeaveApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [formData, setFormData] = useState({
    leave_type: 'CASUAL',
    start_date: '',
    end_date: '',
    reason: '',
  });
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const data = await api.getMyLeaves();
      setLeaves(data);
    } catch (err: any) {
      console.error('Failed to load leaves:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.start_date || !formData.end_date || !formData.reason) {
      setAlert({ type: 'error', text: 'Please fill in all required leave details' });
      return;
    }

    try {
      setSubmitting(true);
      setAlert(null);
      await api.applyLeave(formData);
      setAlert({ type: 'success', text: 'Leave application submitted for Admin approval!' });
      setShowApplyModal(false);
      setFormData({ leave_type: 'CASUAL', start_date: '', end_date: '', reason: '' });
      await fetchLeaves();
    } catch (err: any) {
      setAlert({ type: 'error', text: err.message || 'Failed to submit leave' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Leave Management & Balance</h1>
          <p className="text-sm text-slate-500 mt-1">Track leave entitlements, request planned absences, and monitor review status</p>
        </div>
        <button
          onClick={() => setShowApplyModal(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-navy-900 hover:bg-navy-800 text-white rounded-xl text-sm font-semibold shadow-sm transition-all active:scale-95"
        >
          <PlusCircle className="w-4 h-4 text-gold-400" />
          <span>Apply for Leave</span>
        </button>
      </div>

      {alert && (
        <div className={`p-4 rounded-xl text-sm flex items-center space-x-2 ${
          alert.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          {alert.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
          <span>{alert.text}</span>
        </div>
      )}

      {/* Leave Balances Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Casual Leave (CL)</span>
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><Calendar className="w-4 h-4" /></span>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mt-2">8 Days Left</h3>
          <p className="text-xs text-slate-400 mt-1">Out of 12 annual allowance</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sick Leave (SL)</span>
            <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg"><Clock className="w-4 h-4" /></span>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mt-2">6 Days Left</h3>
          <p className="text-xs text-slate-400 mt-1">Out of 8 annual allowance</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Earned / Privilege Leave</span>
            <span className="p-1.5 bg-purple-50 text-purple-600 rounded-lg"><FileText className="w-4 h-4" /></span>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mt-2">12 Days Left</h3>
          <p className="text-xs text-slate-400 mt-1">Carry-forward eligible</p>
        </div>
      </div>

      {/* Leave Requests Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-900 text-base">My Leave History</h3>
          <span className="text-xs text-slate-500">Official leave ledger</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Loading leave applications...</div>
        ) : leaves.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">No leave applications found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-6">Leave Type</th>
                  <th className="py-3 px-6">Start Date</th>
                  <th className="py-3 px-6">End Date</th>
                  <th className="py-3 px-6">Days</th>
                  <th className="py-3 px-6">Reason</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6">Reviewer Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leaves.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-6 font-semibold text-slate-900">
                      {l.leave_type} LEAVE
                    </td>
                    <td className="py-3.5 px-6">
                      {new Date(l.start_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3.5 px-6">
                      {new Date(l.end_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3.5 px-6 font-semibold text-slate-800">
                      {l.total_days} {l.total_days === 1 ? 'day' : 'days'}
                    </td>
                    <td className="py-3.5 px-6 text-xs text-slate-600 max-w-xs truncate">
                      {l.reason}
                    </td>
                    <td className="py-3.5 px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        l.status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : l.status === 'REJECTED'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {l.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-xs text-slate-500">
                      {l.review_notes || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Apply Leave Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-lg text-slate-900">Apply for Leave</h3>
              <button onClick={() => setShowApplyModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleApply} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Leave Category</label>
                <select
                  value={formData.leave_type}
                  onChange={(e) => setFormData({ ...formData, leave_type: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-navy-600 outline-none"
                >
                  <option value="CASUAL">Casual Leave (CL)</option>
                  <option value="SICK">Sick Leave (SL)</option>
                  <option value="PAID">Earned / Paid Leave (PL)</option>
                  <option value="UNPAID">Loss of Pay / Unpaid</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-navy-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-navy-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Absence</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe the reason for leave..."
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-navy-600 outline-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-navy-900 hover:bg-navy-800 text-white rounded-xl font-semibold transition-all shadow-sm"
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle2, XCircle, Clock, AlertCircle, FileText, Check, X } from 'lucide-react';
import { api } from '../../services/api';
import { LeaveApplication } from '../../types';

export const AdminLeaves: React.FC = () => {
  const [leaves, setLeaves] = useState<LeaveApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<LeaveApplication | null>(null);
  const [reviewAction, setReviewAction] = useState<'APPROVED' | 'REJECTED' | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadLeaves();
  }, []);

  const loadLeaves = async () => {
    try {
      setLoading(true);
      const data = await api.getAllLeaves();
      setLeaves(data);
    } catch (err: any) {
      console.error('Failed to load leaves:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async () => {
    if (!selectedLeave || !reviewAction) return;

    try {
      setActionLoading(true);
      setMessage(null);
      await api.reviewLeave(selectedLeave.id, {
        status: reviewAction,
        review_notes: reviewNotes || `Decision recorded as ${reviewAction} by Administrator`,
      });
      setMessage({ type: 'success', text: `Leave application #${selectedLeave.id} has been ${reviewAction.toLowerCase()} successfully!` });
      setSelectedLeave(null);
      setReviewAction(null);
      setReviewNotes('');
      await loadLeaves();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Review action failed.' });
    } finally {
      setActionLoading(false);
    }
  };

  const pendingLeaves = leaves.filter(l => l.status === 'PENDING');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Staff Leave Approvals & Absence Desk</h1>
          <p className="text-sm text-slate-500 mt-1">Review leave requests, manage branch coverage, and grant authorized absences</p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-semibold px-3.5 py-2 bg-amber-50 text-amber-800 rounded-xl border border-amber-200">
          <Clock className="w-4 h-4 text-amber-600" />
          <span>{pendingLeaves.length} Pending Approval</span>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl text-sm flex items-center space-x-2 ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Leaves Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-900 text-base">All Staff Leave Applications ({leaves.length})</h3>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Loading leave applications...</div>
        ) : leaves.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">No leave applications on file.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-6">Emp Code</th>
                  <th className="py-3 px-6">Leave Type</th>
                  <th className="py-3 px-6">Period</th>
                  <th className="py-3 px-6">Days</th>
                  <th className="py-3 px-6">Reason</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Review Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leaves.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-6 font-mono font-bold text-navy-900 text-xs">
                      EMP00{l.employee_id}
                    </td>
                    <td className="py-3.5 px-6 font-semibold text-slate-900">
                      {l.leave_type}
                    </td>
                    <td className="py-3.5 px-6 text-xs text-slate-700">
                      {new Date(l.start_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} — {new Date(l.end_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
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
                    <td className="py-3.5 px-6 text-right">
                      {l.status === 'PENDING' ? (
                        <div className="inline-flex space-x-2">
                          <button
                            onClick={() => { setSelectedLeave(l); setReviewAction('APPROVED'); }}
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white rounded-lg transition-colors text-xs font-semibold flex items-center space-x-1"
                            title="Approve Leave"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => { setSelectedLeave(l); setReviewAction('REJECTED'); }}
                            className="p-1.5 bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white rounded-lg transition-colors text-xs font-semibold flex items-center space-x-1"
                            title="Reject Leave"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Decided</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Confirmation Modal */}
      {selectedLeave && reviewAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <h3 className="font-bold text-lg text-slate-900">
              Confirm {reviewAction === 'APPROVED' ? 'Approval' : 'Rejection'}
            </h3>
            <p className="text-sm text-slate-600">
              Employee ID: <strong className="text-navy-900">EMP00{selectedLeave.employee_id}</strong><br />
              Requested: {selectedLeave.total_days} days ({selectedLeave.leave_type})<br />
              Reason: <em>"{selectedLeave.reason}"</em>
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Administrative Notes (Optional)</label>
              <textarea
                rows={3}
                placeholder="Enter justification or instructions..."
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-navy-600 outline-none"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => { setSelectedLeave(null); setReviewAction(null); }}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReview}
                disabled={actionLoading}
                className={`px-5 py-2 text-white rounded-xl text-sm font-semibold transition-all ${
                  reviewAction === 'APPROVED' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {actionLoading ? 'Saving...' : `Confirm ${reviewAction}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

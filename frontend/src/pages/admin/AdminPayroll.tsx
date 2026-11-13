import React, { useState, useEffect } from 'react';
import { DollarSign, Play, CheckCircle2, AlertCircle, FileText, Download, ShieldCheck, Building2 } from 'lucide-react';
import { api } from '../../services/api';
import { Payroll, SalarySlip } from '../../types';
import { PayslipModal } from '../../components/common/PayslipModal';

export const AdminPayroll: React.FC = () => {
  const [payrollList, setPayrollList] = useState<Payroll[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [selectedSlip, setSelectedSlip] = useState<SalarySlip | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [runMonth, setRunMonth] = useState(11); // November
  const [runYear, setRunYear] = useState(2026);
  const [bonusAmount, setBonusAmount] = useState(0);

  useEffect(() => {
    loadPayroll();
  }, []);

  const loadPayroll = async () => {
    try {
      setLoading(true);
      const data = await api.getAllPayroll();
      setPayrollList(data);
    } catch (err: any) {
      console.error('Failed to load payroll:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunPayroll = async () => {
    try {
      setRunning(true);
      setMessage(null);
      const res = await api.executePayrollRun(runMonth, runYear, bonusAmount);
      setMessage({ type: 'success', text: `Monthly Payroll for ${runMonth}/${runYear} executed successfully for ${res.length} staff members!` });
      await loadPayroll();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Payroll execution failed.' });
    } finally {
      setRunning(false);
    }
  };

  const totalNetDisbursed = payrollList.reduce((acc, p) => acc + Number(p.net_pay || 0), 0);
  const totalDeductions = payrollList.reduce((acc, p) => acc + Number(p.total_deductions || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Salary, Payroll & Statutory Deductions</h1>
          <p className="text-sm text-slate-500 mt-1">Execute monthly employee payroll, compute EPF/ESI/TDS, and issue computerized salary slips</p>
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

      {/* Payroll Execution Control Panel */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-navy-800 space-y-4">
        <div className="flex items-center space-x-2 text-gold-400 text-xs font-bold uppercase tracking-wider">
          <Play className="w-4 h-4" />
          <span>Execute Monthly Payroll Batch</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Target Month</label>
            <select
              value={runMonth}
              onChange={(e) => setRunMonth(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm outline-none focus:ring-2 focus:ring-gold-500"
            >
              <option value={10}>October 2026</option>
              <option value={11}>November 2026</option>
              <option value={12}>December 2026</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Calendar Year</label>
            <input
              type="number"
              value={runYear}
              onChange={(e) => setRunYear(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm outline-none focus:ring-2 focus:ring-gold-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Optional Bonus (₹ / Staff)</label>
            <input
              type="number"
              value={bonusAmount}
              onChange={(e) => setBonusAmount(Number(e.target.value))}
              placeholder="e.g. 2000"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm outline-none focus:ring-2 focus:ring-gold-500"
            />
          </div>

          <button
            onClick={handleRunPayroll}
            disabled={running}
            className="w-full py-2.5 bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold rounded-xl text-sm transition-all shadow-md active:scale-95 flex items-center justify-center space-x-2"
          >
            <Play className="w-4 h-4 fill-navy-950" />
            <span>{running ? 'Processing Payroll...' : 'Run Monthly Payroll'}</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-medium">Total Processed Records</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{payrollList.length} Payrolls</h3>
          <p className="text-xs text-slate-400 mt-1">Across all active branches</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-medium">Net Salary Disbursed</p>
          <h3 className="text-2xl font-bold text-emerald-600 mt-1">₹{totalNetDisbursed.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
          <p className="text-xs text-emerald-700 mt-1">✓ Directly to employee bank accounts</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-medium">Total Statutory Deductions</p>
          <h3 className="text-2xl font-bold text-rose-600 mt-1">₹{totalDeductions.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
          <p className="text-xs text-slate-400 mt-1">EPFO, ESI & PT remittances</p>
        </div>
      </div>

      {/* Payroll Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-900 text-base">Monthly Salary Vouchers</h3>
          <span className="text-xs text-slate-500">Statutory payroll log</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Loading payroll records...</div>
        ) : payrollList.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">No payroll executed yet. Click "Run Monthly Payroll" above.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-6">Batch No</th>
                  <th className="py-3 px-6">Emp Code</th>
                  <th className="py-3 px-6">Month / Year</th>
                  <th className="py-3 px-6">Present Days</th>
                  <th className="py-3 px-6">Gross Pay</th>
                  <th className="py-3 px-6">Deductions</th>
                  <th className="py-3 px-6">Net Take-Home</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Voucher</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payrollList.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-6 font-mono text-xs text-slate-500 font-semibold">
                      {p.payroll_batch_no}
                    </td>
                    <td className="py-3.5 px-6 font-mono font-bold text-navy-900 text-xs">
                      EMP00{p.employee_id}
                    </td>
                    <td className="py-3.5 px-6 font-medium text-slate-900">
                      {p.month}/{p.year}
                    </td>
                    <td className="py-3.5 px-6 font-semibold text-slate-800">
                      {p.days_present} / {p.total_working_days}
                    </td>
                    <td className="py-3.5 px-6 font-medium text-slate-800">
                      ₹{Number(p.gross_earned).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-6 font-medium text-rose-600">
                      ₹{Number(p.total_deductions).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-6 font-bold text-emerald-700">
                      ₹{Number(p.net_pay).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                        {p.payment_status}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      {p.salary_slip ? (
                        <button
                          onClick={() => setSelectedSlip(p.salary_slip!)}
                          className="inline-flex items-center space-x-1 px-2.5 py-1.5 bg-slate-100 hover:bg-navy-900 hover:text-white text-slate-800 rounded-lg text-xs font-semibold transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Slip</span>
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">Processed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payslip Modal */}
      <PayslipModal
        payslip={selectedSlip}
        isOpen={Boolean(selectedSlip)}
        onClose={() => setSelectedSlip(null)}
      />
    </div>
  );
};

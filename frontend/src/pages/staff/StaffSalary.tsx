import React, { useState, useEffect } from 'react';
import { DollarSign, ShieldCheck, Download, FileText, CheckCircle2, Lock, Building2 } from 'lucide-react';
import { api } from '../../services/api';
import { SalarySlip } from '../../types';
import { PayslipModal } from '../../components/common/PayslipModal';

export const StaffSalary: React.FC = () => {
  const [slips, setSlips] = useState<SalarySlip[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlip, setSelectedSlip] = useState<SalarySlip | null>(null);

  useEffect(() => {
    fetchSalarySlips();
  }, []);

  const fetchSalarySlips = async () => {
    try {
      setLoading(true);
      const data = await api.getMySalarySlips();
      setSlips(data);
    } catch (err: any) {
      console.error('Failed to load salary slips:', err);
    } finally {
      setLoading(false);
    }
  };

  const latestSlip = slips[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Salary & Monthly Payslips</h1>
          <p className="text-sm text-slate-500 mt-1">Review compensation structure, statutory deductions, and official monthly vouchers</p>
        </div>
        <div className="flex items-center space-x-2 text-xs text-emerald-700 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200">
          <Lock className="w-4 h-4 text-emerald-600" />
          <span>Strict Employee Privacy: Only your own salary is visible</span>
        </div>
      </div>

      {/* Salary Overview Card */}
      {latestSlip && (
        <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-navy-800">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <span className="inline-block px-3 py-1 bg-gold-500/20 text-gold-400 rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
                Latest Processed Payroll • {latestSlip.month_year}
              </span>
              <p className="text-xs text-slate-300">Net Take-Home Transferred to {latestSlip.bank_account_masked}</p>
              <h2 className="text-3xl font-extrabold text-white tracking-tight mt-1">
                ₹{Number(latestSlip.net_pay).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </h2>
              <p className="text-xs text-gold-300 italic mt-1">{latestSlip.net_pay_in_words}</p>
            </div>

            <button
              onClick={() => setSelectedSlip(latestSlip)}
              className="inline-flex items-center space-x-2 px-5 py-3 bg-gold-500 hover:bg-gold-400 text-navy-950 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95"
            >
              <FileText className="w-4 h-4" />
              <span>View Latest Payslip</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-navy-800/80 text-xs">
            <div>
              <p className="text-slate-400">Gross Earnings</p>
              <p className="text-base font-bold text-white mt-0.5">₹{Number(latestSlip.gross_earnings).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
            </div>
            <div>
              <p className="text-slate-400">Total Deductions</p>
              <p className="text-base font-bold text-rose-400 mt-0.5">₹{Number(latestSlip.total_deductions).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
            </div>
            <div>
              <p className="text-slate-400">EPF UAN Number</p>
              <p className="text-base font-mono font-medium text-slate-200 mt-0.5">{latestSlip.uan_epfo || '1012****9988'}</p>
            </div>
            <div>
              <p className="text-slate-400">Income Tax PAN</p>
              <p className="text-base font-mono font-medium text-slate-200 mt-0.5">{latestSlip.pan_masked || 'ABCDE****F'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Salary Slips Archive Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-900 text-base">Monthly Payslip Archive</h3>
          <span className="text-xs text-slate-500">Official tax & statutory records</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Loading payslips...</div>
        ) : slips.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">No salary slips generated yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-6">Month / Year</th>
                  <th className="py-3 px-6">Voucher Number</th>
                  <th className="py-3 px-6">Gross Pay</th>
                  <th className="py-3 px-6">Total Deductions</th>
                  <th className="py-3 px-6">Net Take-Home</th>
                  <th className="py-3 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {slips.map((slip) => (
                  <tr key={slip.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-6 font-bold text-slate-900">
                      {slip.month_year}
                    </td>
                    <td className="py-3.5 px-6 font-mono text-xs text-slate-600">
                      {slip.payslip_number}
                    </td>
                    <td className="py-3.5 px-6 font-medium text-slate-800">
                      ₹{Number(slip.gross_earnings).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-6 font-medium text-rose-600">
                      ₹{Number(slip.total_deductions).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-6 font-bold text-emerald-700">
                      ₹{Number(slip.net_pay).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <button
                        onClick={() => setSelectedSlip(slip)}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 bg-slate-100 hover:bg-navy-900 hover:text-white text-slate-800 rounded-lg text-xs font-semibold transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View / Print</span>
                      </button>
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

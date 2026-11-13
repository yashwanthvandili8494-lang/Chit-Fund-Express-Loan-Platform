import React from 'react';
import { X, Printer, Building2, CheckCircle2, ShieldCheck, Download } from 'lucide-react';
import { SalarySlip } from '../../types';

interface PayslipModalProps {
  payslip: SalarySlip | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PayslipModal: React.FC<PayslipModalProps> = ({ payslip, isOpen, onClose }) => {
  if (!isOpen || !payslip) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 max-h-[95vh] flex flex-col">
        {/* Modal Top Bar (Hidden in Print) */}
        <div className="print:hidden flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-gold-400" />
            <h3 className="font-semibold text-lg">Official Salary Slip Voucher</h3>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-gold-500 hover:bg-gold-600 text-slate-950 rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Payslip Body */}
        <div className="p-8 overflow-y-auto space-y-6 text-slate-800 printable-area">
          {/* Header */}
          <div className="text-center border-b border-slate-200 pb-5">
            <div className="inline-flex items-center space-x-2 text-navy-900 font-bold text-xl tracking-tight">
              <Building2 className="w-6 h-6 text-gold-500" />
              <span>SOWBHAGYA CHITS & FINSERVE PRIVATE LIMITED</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              CIN: U65992KA2018PTC112345 | Regd. Office: #42 FinTech Towers, MG Road, Bengaluru 560001
            </p>
            <div className="mt-3 inline-block px-3 py-1 bg-slate-100 rounded-full text-xs font-semibold uppercase tracking-wider text-slate-700">
              Salary Slip for the month of {payslip.month_year}
            </div>
          </div>

          {/* Employee & Bank Info Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div>
              <p className="text-slate-500">Employee Name:</p>
              <p className="font-bold text-slate-900 text-sm">{payslip.employee_name}</p>
            </div>
            <div>
              <p className="text-slate-500">Employee ID / Code:</p>
              <p className="font-semibold text-slate-900">{payslip.employee_code}</p>
            </div>
            <div>
              <p className="text-slate-500">Department:</p>
              <p className="font-semibold text-slate-900">{payslip.department}</p>
            </div>
            <div>
              <p className="text-slate-500">Designation:</p>
              <p className="font-semibold text-slate-900">{payslip.designation}</p>
            </div>
            <div>
              <p className="text-slate-500">Bank Account No:</p>
              <p className="font-mono text-slate-900">{payslip.bank_account_masked}</p>
            </div>
            <div>
              <p className="text-slate-500">UAN / EPFO No:</p>
              <p className="font-mono text-slate-900">{payslip.uan_epfo || '1012****9988'}</p>
            </div>
            <div>
              <p className="text-slate-500">Income Tax PAN:</p>
              <p className="font-mono text-slate-900">{payslip.pan_masked || 'ABCDE****F'}</p>
            </div>
            <div>
              <p className="text-slate-500">Payslip Voucher Ref:</p>
              <p className="font-mono font-medium text-navy-800">{payslip.payslip_number}</p>
            </div>
          </div>

          {/* Earnings & Deductions Tables */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            {/* Earnings */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-emerald-50 px-4 py-2 font-semibold text-emerald-900 border-b border-emerald-100 flex justify-between">
                <span>Earnings Component</span>
                <span>Amount (₹)</span>
              </div>
              <div className="divide-y divide-slate-100 p-2">
                {Object.entries(payslip.earnings_breakdown || {}).map(([key, val]) => (
                  <div key={key} className="flex justify-between py-1.5 px-2 text-xs">
                    <span className="text-slate-600">{key}</span>
                    <span className="font-semibold text-slate-800">₹{Number(val).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                ))}
              </div>
              <div className="bg-slate-50 px-4 py-2.5 font-bold text-slate-900 border-t border-slate-200 flex justify-between text-xs">
                <span>Total Gross Earnings</span>
                <span className="text-emerald-700">₹{Number(payslip.gross_earnings).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Deductions */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-rose-50 px-4 py-2 font-semibold text-rose-900 border-b border-rose-100 flex justify-between">
                <span>Statutory Deductions</span>
                <span>Amount (₹)</span>
              </div>
              <div className="divide-y divide-slate-100 p-2">
                {Object.entries(payslip.deductions_breakdown || {}).map(([key, val]) => (
                  <div key={key} className="flex justify-between py-1.5 px-2 text-xs">
                    <span className="text-slate-600">{key}</span>
                    <span className="font-semibold text-slate-800">₹{Number(val).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                ))}
              </div>
              <div className="bg-slate-50 px-4 py-2.5 font-bold text-slate-900 border-t border-slate-200 flex justify-between text-xs">
                <span>Total Deductions</span>
                <span className="text-rose-700">₹{Number(payslip.total_deductions).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Net Pay Callout */}
          <div className="bg-navy-900 text-white p-5 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-xs text-gold-400 uppercase tracking-wider font-semibold">Net Salary Transferred</p>
              <h2 className="text-2xl font-bold tracking-tight">₹{Number(payslip.net_pay).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h2>
              <p className="text-xs text-slate-300 mt-1 italic">In Words: {payslip.net_pay_in_words}</p>
            </div>
            <div className="flex items-center space-x-2 text-xs bg-navy-800/80 px-3 py-2 rounded-lg border border-navy-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Direct Bank Deposit Confirmed</span>
            </div>
          </div>

          {/* Signatures & Disclaimers */}
          <div className="pt-6 border-t border-slate-200 flex justify-between items-end text-xs text-slate-500">
            <div>
              <p>Generated on: {new Date(payslip.generated_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
              <p>This is a computer-generated document and requires no physical signature.</p>
            </div>
            <div className="text-right">
              <div className="h-10 border-b border-slate-400 w-40 mb-1"></div>
              <p className="font-semibold text-slate-800">Authorized Signatory</p>
              <p className="text-[10px]">Head of Payroll & HR</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

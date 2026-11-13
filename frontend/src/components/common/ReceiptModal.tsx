import React from 'react';
import { PaymentReceipt } from '../../types';
import { ShieldCheck, Printer, Download, X, CheckCircle2 } from 'lucide-react';

interface ReceiptModalProps {
  receipt: PaymentReceipt | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ receipt, onClose }) => {
  if (!receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white text-slate-900 rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden">
        {/* Modal Top Actions */}
        <div className="bg-slate-900 px-6 py-3 text-white flex items-center justify-between no-print">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <span className="font-bold text-sm tracking-wide">OFFICIAL FINANCIAL PAYMENT RECEIPT</span>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="flex items-center text-xs bg-slate-800 hover:bg-slate-700 px-2.5 py-1.5 rounded-lg text-slate-200 transition"
            >
              <Printer className="w-3.5 h-3.5 mr-1" />
              Print Receipt
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Body */}
        <div id="printable-receipt" className="p-8 bg-white">
          {/* Header */}
          <div className="border-b-2 border-slate-800 pb-5">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-black tracking-tight text-slate-950">
                  {receipt.company.name}
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">{receipt.company.address}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[11px] text-slate-700 font-medium">
                  <span>CIN: <strong>{receipt.company.cin}</strong></span>
                  <span>GSTIN: <strong>{receipt.company.gstin}</strong></span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-0.5 text-[11px] text-slate-700 font-medium">
                  <span>Chit Reg: <strong>{receipt.company.registrar_chit_no}</strong></span>
                  <span>Money Lending Lic: <strong>{receipt.company.money_lending_license}</strong></span>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-block bg-emerald-50 text-emerald-700 border border-emerald-300 font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider">
                  Payment Verified
                </span>
                <p className="text-xs font-bold text-slate-900 mt-2">Receipt No:</p>
                <p className="text-sm font-mono font-black text-amber-600">{receipt.receipt_number}</p>
              </div>
            </div>
          </div>

          {/* Receipt Info Grid */}
          <div className="grid grid-cols-2 gap-4 py-5 border-b border-slate-200 text-xs">
            <div>
              <p className="text-slate-500 uppercase text-[10px] font-bold tracking-wider">Customer Particulars</p>
              <p className="font-bold text-sm text-slate-900 mt-1">{receipt.customer_name}</p>
              <p className="text-slate-600">{receipt.customer_mobile}</p>
              <p className="text-slate-600">{receipt.customer_email}</p>
            </div>
            <div>
              <p className="text-slate-500 uppercase text-[10px] font-bold tracking-wider">Transaction Details</p>
              <p className="mt-1">Txn Ref: <strong className="font-mono">{receipt.transaction_ref}</strong></p>
              <p>Gateway ID: <strong className="font-mono">{receipt.gateway_ref || 'INTERNAL_SETTLEMENT'}</strong></p>
              <p>Date & Time: <strong>{receipt.payment_date}</strong></p>
              <p>Mode: <strong className="uppercase">{receipt.payment_mode}</strong></p>
            </div>
          </div>

          {/* Table of Payment Item */}
          <table className="w-full my-5 text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-300 bg-slate-50 text-slate-700 font-bold">
                <th className="py-2.5 px-3">Description / Particulars</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3 text-right">Amount (INR)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-200">
                <td className="py-3 px-3 font-medium text-slate-900">
                  {receipt.payment_type.replace('_', ' ')} Settlement
                  <div className="text-[10px] text-slate-500">{receipt.notes || 'Full Authorized Digital Payment'}</div>
                </td>
                <td className="py-3 px-3 text-slate-600">{receipt.payment_type}</td>
                <td className="py-3 px-3 text-right font-bold text-slate-900 text-sm">
                  ₹{receipt.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 text-slate-900 font-black">
                <td colSpan={2} className="py-3 px-3 text-right uppercase text-xs">Total Amount Paid:</td>
                <td className="py-3 px-3 text-right text-base text-emerald-700">
                  ₹{receipt.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tfoot>
          </table>

          {/* Footer Seals & Compliance */}
          <div className="mt-6 pt-4 border-t border-slate-200 flex justify-between items-end text-[11px] text-slate-600">
            <div>
              <p className="font-semibold text-slate-800">Statutory Notice:</p>
              <p className="text-[10px] leading-tight max-w-sm text-slate-500 mt-0.5">
                This is a computer-generated immutable financial receipt issued under the Chit Funds Act, 1982 and Section 65B of the Indian Evidence Act.
              </p>
            </div>
            <div className="text-center">
              <div className="w-24 h-12 border border-dashed border-amber-600 rounded flex items-center justify-center text-[10px] text-amber-700 font-bold uppercase tracking-wider mb-1">
                Authorized Signatory
              </div>
              <p className="text-[10px] font-bold text-slate-800">Sowbhagya FinServe</p>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end no-print">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition"
          >
            Close Receipt
          </button>
        </div>
      </div>
    </div>
  );
};


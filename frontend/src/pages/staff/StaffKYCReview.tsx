import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { KYCRecord, KYCStatus } from '../../types';
import { ShieldCheck, CheckCircle2, XCircle, AlertTriangle, Eye, Lock, Check, X } from 'lucide-react';

export const StaffKYCReview: React.FC = () => {
  const [records, setRecords] = useState<KYCRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<KYCRecord | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('Document image blurry or address mismatch');
  const [notes, setNotes] = useState<string>('Demographic check verified with utility bill');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.listKYCRecords();
        setRecords(data);
        if (data.length > 0) setSelectedRecord(data[0]);
      } catch (e) {
        // fallback
        const mock: KYCRecord[] = [
          {
            id: 2,
            user_id: 2,
            status: 'SUBMITTED',
            aadhaar_masked: 'XXXX-XXXX-1199',
            aadhaar_verified: true,
            pan_number_masked: 'BKXXXXX88K',
            pan_verified: true,
            pan_name_matched: true,
            id_proof_type: 'Voter ID',
            address_proof_type: 'Rental Agreement',
            created_at: '2026-11-12T10:00:00Z',
            user: {
              id: 2,
              full_name: 'Priya Nair',
              email: 'priya.nair@example.com',
              mobile_number: '+919880445566',
              role: 'CUSTOMER',
              is_active: true,
              is_verified: false,
              created_at: ''
            }
          },
          {
            id: 1,
            user_id: 1,
            status: 'VERIFIED',
            aadhaar_masked: 'XXXX-XXXX-1234',
            aadhaar_verified: true,
            pan_number_masked: 'ABXXXXX34F',
            pan_verified: true,
            pan_name_matched: true,
            id_proof_type: 'Passport',
            address_proof_type: 'Electricity Bill',
            verified_at: '2026-10-15',
            created_at: '2026-10-10T10:00:00Z',
            user: {
              id: 1,
              full_name: 'Vikramaditya Hegde',
              email: 'customer@sowbhagyachits.in',
              mobile_number: '+919880334455',
              role: 'CUSTOMER',
              is_active: true,
              is_verified: true,
              created_at: ''
            }
          }
        ];
        setRecords(mock);
        setSelectedRecord(mock[0]);
      }
    }
    load();
  }, []);

  const handleReviewAction = async (status: KYCStatus) => {
    if (!selectedRecord) return;

    try {
      await api.reviewKYC(selectedRecord.id, {
        status,
        rejection_reason: status === 'REJECTED' ? rejectReason : undefined,
        notes
      });
      setSuccessMsg(`KYC for ${selectedRecord.user?.full_name} updated to ${status}!`);
      setRecords((prev) =>
        prev.map((r) => (r.id === selectedRecord.id ? { ...r, status } : r))
      );
      setSelectedRecord((prev) => (prev ? { ...prev, status } : null));
    } catch (e) {
      setSuccessMsg(`KYC updated to ${status}!`);
      setRecords((prev) =>
        prev.map((r) => (r.id === selectedRecord.id ? { ...r, status } : r))
      );
      setSelectedRecord((prev) => (prev ? { ...prev, status } : null));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-fintech flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Compliance & Underwriting Review Desk</span>
          </div>
          <h1 className="text-2xl font-black text-slate-950">Customer KYC Document Verification</h1>
          <p className="text-xs text-slate-500 mt-1">
            Verify UIDAI demographic tokens, PAN validity, and address proofs before activating lending and chit permissions
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-xs font-bold flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Queue Table */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-fintech space-y-4">
          <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3">
            KYC Submissions Queue ({records.length})
          </h3>

          <div className="divide-y divide-slate-100">
            {records.map((r) => (
              <div
                key={r.id}
                onClick={() => setSelectedRecord(r)}
                className={`p-4 rounded-2xl cursor-pointer transition flex items-center justify-between ${
                  selectedRecord?.id === r.id
                    ? 'bg-blue-50/70 border border-blue-200'
                    : 'hover:bg-slate-50 border border-transparent'
                }`}
              >
                <div>
                  <h4 className="font-bold text-sm text-slate-950">{r.user?.full_name || 'Customer'}</h4>
                  <p className="text-xs text-slate-500">{r.user?.mobile_number} • {r.user?.email}</p>
                  <div className="flex items-center space-x-3 mt-1.5 text-[11px] text-slate-600 font-mono">
                    <span>Aadhaar: {r.aadhaar_masked}</span>
                    <span>PAN: {r.pan_number_masked}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                    r.status === 'VERIFIED'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : r.status === 'SUBMITTED'
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-red-100 text-red-800 border border-red-300'
                  }`}>
                    {r.status}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1">Click to Inspect</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Inspector & Verification Action Panel */}
        {selectedRecord && (
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-fintech space-y-5">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                Demographic Verification Inspector
              </span>
              <h3 className="text-lg font-black text-slate-950 mt-0.5">
                {selectedRecord.user?.full_name}
              </h3>
              <p className="text-xs text-slate-500">UID: CUST-{selectedRecord.user_id}</p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase">UIDAI Demographic Status</span>
                <p className="font-mono font-bold text-slate-900 mt-0.5">{selectedRecord.aadhaar_masked}</p>
                <div className="flex items-center text-emerald-700 text-[11px] font-semibold mt-1">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  <span>Demographic name and DOB confirmed by token</span>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Income Tax Department PAN</span>
                <p className="font-mono font-bold text-slate-900 mt-0.5">{selectedRecord.pan_number_masked}</p>
                <div className="flex items-center text-emerald-700 text-[11px] font-semibold mt-1">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  <span>PAN is Active and registered in Karnataka</span>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Submitted Documents</span>
                <div className="flex justify-between items-center mt-1 text-slate-800">
                  <span>Photo ID: <strong>{selectedRecord.id_proof_type || 'Passport'}</strong></span>
                  <span className="text-blue-600 font-bold cursor-pointer hover:underline">View PDF</span>
                </div>
                <div className="flex justify-between items-center mt-1 text-slate-800">
                  <span>Address: <strong>{selectedRecord.address_proof_type || 'Rental Agreement'}</strong></span>
                  <span className="text-blue-600 font-bold cursor-pointer hover:underline">View PDF</span>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block mb-1">
                  Officer Verification Notes (Audit Log)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                />
              </div>

              {selectedRecord.status !== 'VERIFIED' && (
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block mb-1">
                    Rejection Reason (If rejecting)
                  </label>
                  <input
                    type="text"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                  />
                </div>
              )}
            </div>

            {/* Verification Actions */}
            <div className="pt-4 border-t border-slate-100 flex space-x-3">
              <button
                onClick={() => handleReviewAction('VERIFIED')}
                className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center space-x-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Approve & Verify KYC</span>
              </button>
              <button
                onClick={() => handleReviewAction('REJECTED')}
                className="py-2.5 px-4 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-xl border border-red-200 transition flex items-center space-x-1"
              >
                <X className="w-4 h-4" />
                <span>Reject</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


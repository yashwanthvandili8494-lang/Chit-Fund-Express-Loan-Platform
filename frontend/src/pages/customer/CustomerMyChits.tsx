import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { ChitMember } from '../../types';
import { ChitAuctionSimulator } from '../../components/common/ChitAuctionSimulator';
import { 
  Coins, Gavel, Calendar, Award, CheckCircle2, 
  ArrowRight, ShieldCheck, ChevronRight 
} from 'lucide-react';

export const CustomerMyChits: React.FC = () => {
  const [memberships, setMemberships] = useState<ChitMember[]>([]);
  const [activeAuctionGroup, setActiveAuctionGroup] = useState<ChitMember | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getMyChitMemberships();
        setMemberships(data);
        if (data.length > 0) setActiveAuctionGroup(data[0]);
      } catch (e) {
        const fallback: ChitMember[] = [
          {
            id: 1,
            group_id: 1,
            group_code: 'SOWBHAGYA-BLR-100K-G01',
            group_name: 'Sowbhagya Bengaluru 1L Series 01',
            ticket_number: 1,
            user_id: 1,
            chit_value: 100000,
            monthly_subscription: 4000,
            duration_months: 25,
            current_installment: 3,
            is_prized: false,
            prized_amount: 0,
            total_paid: 10800,
            total_dividend_earned: 1200,
            next_auction_date: '2026-12-15T16:00:00Z',
            status: 'ACTIVE'
          }
        ];
        setMemberships(fallback);
        setActiveAuctionGroup(fallback[0]);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-fintech flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
            <Coins className="w-4 h-4" />
            <span>Active Chit Accounts</span>
          </div>
          <h1 className="text-2xl font-black text-slate-950">My Enrolled Chit Groups</h1>
          <p className="text-xs text-slate-500 mt-1">
            Monitor your ticket numbers, accumulated dividends, and bid in monthly reverse auctions
          </p>
        </div>
      </div>

      {/* Memberships Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {memberships.map((m) => (
          <div
            key={m.id}
            className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-fintech space-y-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-full">
                  {m.group_code}
                </span>
                <span className="text-xs font-black bg-blue-50 text-blue-800 border border-blue-200 px-3 py-1 rounded-full">
                  Ticket #{m.ticket_number}
                </span>
              </div>

              <h3 className="text-lg font-black text-slate-950">{m.group_name}</h3>

              <div className="my-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Chit Value</span>
                  <div className="text-xl font-black text-slate-950">
                    ₹{Number(m.chit_value || 100000).toLocaleString('en-IN')}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Prize Status</span>
                  <div className="text-sm font-black text-slate-800 mt-0.5">
                    {m.is_prized ? (
                      <span className="text-emerald-700">Prized (₹{Number(m.prized_amount).toLocaleString('en-IN')})</span>
                    ) : (
                      <span className="text-amber-700">Non-Prized (Eligible to Bid)</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl">
                  <span className="text-slate-500 text-[10px] font-semibold uppercase">Total Paid Till Date</span>
                  <p className="font-bold text-slate-900 mt-0.5">₹{Number(m.total_paid).toLocaleString('en-IN')}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <span className="text-slate-500 text-[10px] font-semibold uppercase">Total Dividend Earned</span>
                  <p className="font-bold text-emerald-700 mt-0.5">₹{Number(m.total_dividend_earned).toLocaleString('en-IN')}</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="text-xs text-slate-500">
                Current Round: <strong className="text-slate-900">{m.current_installment} / {m.duration_months}</strong>
              </div>
              <button
                onClick={() => setActiveAuctionGroup(m)}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-sm transition flex items-center space-x-1.5"
              >
                <Gavel className="w-3.5 h-3.5" />
                <span>Enter Auction Room</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Live Auction Room for Selected Group */}
      {activeAuctionGroup && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-950 flex items-center space-x-2">
              <Gavel className="w-5 h-5 text-amber-600" />
              <span>Participate in Monthly Reverse Auction: {activeAuctionGroup.group_code}</span>
            </h2>
          </div>

          <ChitAuctionSimulator
            chitValue={activeAuctionGroup.chit_value}
            subscribersCount={activeAuctionGroup.duration_months || 25}
            groupCode={activeAuctionGroup.group_code}
          />
        </div>
      )}
    </div>
  );
};


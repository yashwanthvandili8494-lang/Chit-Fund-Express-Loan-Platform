import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { ChitAuction, ChitMember } from '../../types';
import { ChitAuctionSimulator } from '../../components/common/ChitAuctionSimulator';
import { Gavel, Trophy, Coins, ShieldCheck, CheckCircle2, Calendar, AlertCircle } from 'lucide-react';

export const AdminAuctionManager: React.FC = () => {
  const [auctions, setAuctions] = useState<ChitAuction[]>([]);
  const [selectedAuction, setSelectedAuction] = useState<ChitAuction | null>(null);
  const [activeTab, setActiveTab] = useState<'SIMULATOR' | 'HISTORY'>('SIMULATOR');

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getAuctions();
        setAuctions(data);
        if (data.length > 0) setSelectedAuction(data[0]);
      } catch (e) {
        // fallback
        const mock: ChitAuction[] = [
          {
            id: 1,
            group_id: 1,
            auction_no: 2,
            auction_date: '2026-10-15T16:00:00Z',
            chit_value: 100000,
            min_bid: 5000,
            max_bid: 40000,
            winning_bid_discount: 30000,
            winning_member_id: 3,
            foreman_commission: 5000,
            total_dividend: 25000,
            dividend_per_member: 1000,
            net_prize_amount: 70000,
            status: 'COMPLETED',
            completed_at: '2026-10-15T16:45:00Z'
          }
        ];
        setAuctions(mock);
        setSelectedAuction(mock[0]);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-fintech flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
            <Gavel className="w-4 h-4" />
            <span>Auction Administration & Dividend Engine</span>
          </div>
          <h1 className="text-2xl font-black text-slate-950">Chit Reverse Auction Manager</h1>
          <p className="text-xs text-slate-500 mt-1">
            Conduct monthly reverse auctions, enforce 5% foreman statutory fee and 40% discount cap, and distribute member dividends
          </p>
        </div>

        <div className="flex space-x-2 text-xs">
          <button
            onClick={() => setActiveTab('SIMULATOR')}
            className={`px-4 py-2 rounded-xl font-bold transition ${
              activeTab === 'SIMULATOR'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Conduct Live Auction
          </button>
          <button
            onClick={() => setActiveTab('HISTORY')}
            className={`px-4 py-2 rounded-xl font-bold transition ${
              activeTab === 'HISTORY'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Auction History & Ledgers
          </button>
        </div>
      </div>

      {activeTab === 'SIMULATOR' ? (
        <div className="space-y-6">
          <ChitAuctionSimulator
            chitValue={100000}
            subscribersCount={25}
            groupCode="SOWBHAGYA-BLR-100K-G01"
            onAuctionComplete={(res) => {
              const newAuction: ChitAuction = {
                id: auctions.length + 1,
                group_id: 1,
                auction_no: 3,
                auction_date: new Date().toISOString(),
                chit_value: res.chitValue,
                min_bid: res.foremanCommission,
                max_bid: res.chitValue * 0.4,
                winning_bid_discount: res.bidDiscount,
                foreman_commission: res.foremanCommission,
                total_dividend: res.totalDividend,
                dividend_per_member: res.dividendPerMember,
                net_prize_amount: res.netPrizeAmount,
                status: 'COMPLETED',
                completed_at: new Date().toISOString()
              };
              setAuctions([newAuction, ...auctions]);
            }}
          />
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-fintech overflow-hidden">
          <h3 className="font-bold text-sm text-slate-900 mb-4">Completed Auction Sessions & Dividend Records</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold">
                  <th className="py-3 px-4">Auction #</th>
                  <th className="py-3 px-4">Chit Value (₹)</th>
                  <th className="py-3 px-4 text-right">Winning Discount</th>
                  <th className="py-3 px-4 text-right">Net Prize Money</th>
                  <th className="py-3 px-4 text-right">Foreman 5% Fee</th>
                  <th className="py-3 px-4 text-right">Dividend / Member</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Completed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auctions.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-700">Round #{a.auction_no}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">₹{Number(a.chit_value).toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-4 text-right font-semibold text-slate-700">₹{Number(a.winning_bid_discount).toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-4 text-right font-black text-emerald-700">₹{Number(a.net_prize_amount).toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-800">₹{Number(a.foreman_commission).toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-amber-600">₹{Number(a.dividend_per_member).toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full text-[10px]">
                        {a.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-500">
                      {a.completed_at ? new Date(a.completed_at).toLocaleDateString() : 'Active'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};


import React, { useState } from 'react';
import { Bell, ShieldCheck, Coins, Wallet, CheckCircle2, Clock } from 'lucide-react';

export const CustomerNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Chit Auction Round #3 Scheduled',
      message: 'Auction #3 for Group SOWBHAGYA-BLR-100K-G01 is scheduled for 15-Dec-2026 at 4:00 PM IST. Non-prized members may bid online.',
      category: 'CHIT',
      time: '10 mins ago',
      read: false
    },
    {
      id: 2,
      title: 'Upcoming Loan EMI Due Notice',
      message: 'Monthly EMI #3 of ₹5,401.35 for Loan Account LN-ACC-202610-0045 is due on 15-Dec-2026.',
      category: 'LOAN',
      time: '1 hour ago',
      read: false
    },
    {
      id: 3,
      title: 'Aadhaar e-KYC Verification Completed',
      message: 'Your demographic e-KYC profile has been verified by the Compliance Officer. You can now participate in all chit groups and loan products.',
      category: 'KYC',
      time: 'Yesterday',
      read: true
    },
    {
      id: 4,
      title: 'Payment Confirmation: ₹5,402 Received',
      message: 'Received payment for EMI #2 via HDFC NetBanking. Official receipt RCPT-202611-05218 generated.',
      category: 'PAYMENT',
      time: '3 days ago',
      read: true
    }
  ]);

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  return (
    <div className="space-y-8 animate-in fade-in max-w-4xl mx-auto">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-fintech flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
            <Bell className="w-4 h-4" />
            <span>Alerts & Communications</span>
          </div>
          <h1 className="text-2xl font-black text-slate-950">Notification Center</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time updates regarding your chit auctions, dividend allocations, and loan schedules
          </p>
        </div>
        <button
          onClick={markAllRead}
          className="text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition"
        >
          Mark All as Read
        </button>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-fintech divide-y divide-slate-100">
        {notifications.map((n) => (
          <div key={n.id} className={`py-4 flex items-start space-x-4 ${!n.read ? 'bg-amber-50/30 px-3 rounded-2xl' : ''}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold flex-shrink-0 ${
              n.category === 'CHIT'
                ? 'bg-amber-100 text-amber-800'
                : n.category === 'LOAN'
                ? 'bg-blue-100 text-blue-800'
                : n.category === 'KYC'
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-slate-100 text-slate-800'
            }`}>
              {n.category === 'CHIT' ? <Coins className="w-5 h-5" /> : n.category === 'LOAN' ? <Wallet className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-sm text-slate-900">{n.title}</h4>
                <span className="text-[10px] text-slate-400 font-medium">{n.time}</span>
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


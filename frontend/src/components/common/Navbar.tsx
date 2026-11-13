import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Building2, ShieldCheck, Bell, User as UserIcon, LogOut, 
  ChevronDown, Sparkles, CheckCircle2, Award, ArrowRight,
  TrendingUp, Wallet, Landmark
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, role, activePortal, setActivePortal, quickLoginAs, logout, unreadCount } = useAuth();
  const navigate = useNavigate();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const notifications = [
    { title: "Chit Auction #3 Scheduled", time: "10 mins ago", type: "chit" },
    { title: "EMI Due: ₹5,402.00 Due Soon", time: "1 hour ago", type: "loan" },
    { title: "Aadhaar e-KYC Verified Successfully", time: "Yesterday", type: "kyc" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0B192C] text-white border-b border-slate-800 shadow-md">
      {/* Top Statutory & Compliance Announcement Bar */}
      <div className="bg-[#070F2B] px-4 py-1.5 text-xs border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center space-x-3 text-slate-300">
          <span className="flex items-center text-amber-400 font-semibold tracking-wide">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" />
            CHIT FUNDS ACT, 1982 COMPLIANT
          </span>
          <span className="hidden md:inline text-slate-500">|</span>
          <span className="hidden md:inline text-slate-400">
            Regd. by Govt. of Karnataka: <strong className="text-slate-200">KA/BLR/CHIT/2019/882</strong>
          </span>
          <span className="hidden lg:inline text-slate-500">|</span>
          <span className="hidden lg:inline text-slate-400">
            Money Lending Lic: <strong className="text-slate-200">KA/BLR/MLL/2021/409</strong>
          </span>
        </div>

        {/* Quick Portal Switcher */}
        <div className="flex items-center space-x-1">
          <span className="text-[11px] text-slate-400 mr-2 hidden sm:inline">Active Portal:</span>
          <button
            onClick={() => { setActivePortal('OWNER'); quickLoginAs('ADMIN'); navigate('/admin'); }}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
              activePortal === 'OWNER'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            Owner / Admin
          </button>
          <button
            onClick={() => { setActivePortal('STAFF'); quickLoginAs('STAFF'); navigate('/staff'); }}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
              activePortal === 'STAFF'
                ? 'bg-blue-500 text-white font-bold shadow-sm'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            Staff Desk
          </button>
          <button
            onClick={() => { setActivePortal('CUSTOMER'); quickLoginAs('CUSTOMER'); navigate('/customer'); }}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
              activePortal === 'CUSTOMER'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            Customer
          </button>
          <button
            onClick={() => { setActivePortal('PUBLIC'); navigate('/'); }}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
              activePortal === 'PUBLIC'
                ? 'bg-slate-700 text-white font-bold'
                : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            Public Site
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-200 flex items-center justify-center text-slate-950 shadow-fintech-gold font-black text-xl">
            S
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-lg tracking-tight text-white group-hover:text-amber-400 transition">
                SOWBHAGYA
              </span>
              <span className="text-xs bg-amber-400/20 text-amber-400 px-1.5 py-0.5 rounded font-semibold border border-amber-400/30">
                FINSERVE
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">
              Chit Fund & Express Loan Platform
            </p>
          </div>
        </Link>

        {/* Center Nav Links (Public or Portal contextual) */}
        <nav className="hidden lg:flex items-center space-x-6 text-sm font-medium">
          <Link to="/" className="text-slate-300 hover:text-amber-400 transition">Home</Link>
          <Link to="/chits" className="text-slate-300 hover:text-amber-400 transition flex items-center">
            <CoinsIcon className="w-4 h-4 mr-1 text-amber-400" />
            Chit Schemes
          </Link>
          <Link to="/loans" className="text-slate-300 hover:text-amber-400 transition flex items-center">
            <Wallet className="w-4 h-4 mr-1 text-blue-400" />
            Loan Products
          </Link>
          <Link to="/calculator" className="text-slate-300 hover:text-amber-400 transition">Calculators</Link>
          <Link to="/about" className="text-slate-300 hover:text-amber-400 transition">About & Licenses</Link>
          <Link to="/contact" className="text-slate-300 hover:text-amber-400 transition">Contact</Link>
        </nav>

        {/* Right Action & User Profile */}
        <div className="flex items-center space-x-4">
          {/* Notifications dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              className="p-2 text-slate-300 hover:text-amber-400 hover:bg-slate-800 rounded-lg relative transition"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-amber-400 rounded-full animate-pulse" />
              )}
            </button>

            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h4 className="font-semibold text-sm text-white">Notifications</h4>
                  <span className="text-[11px] text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full font-medium">
                    {unreadCount} new
                  </span>
                </div>
                <div className="divide-y divide-slate-800 mt-2">
                  {notifications.map((n, i) => (
                    <div key={i} className="py-2.5 hover:bg-slate-800/50 px-2 rounded cursor-pointer transition">
                      <p className="text-xs font-medium text-slate-200">{n.title}</p>
                      <span className="text-[10px] text-slate-500">{n.time}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => { setShowNotifMenu(false); navigate('/customer/notifications'); }}
                  className="w-full mt-3 py-1.5 text-center text-xs text-amber-400 hover:underline font-medium"
                >
                  View All Notifications
                </button>
              </div>
            )}
          </div>

          {/* User Profile / Portal Jump */}
          {user ? (
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center space-x-2 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg text-sm transition"
              >
                <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs border border-amber-500/30">
                  {user.full_name.charAt(0)}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="font-semibold text-xs text-white leading-tight truncate max-w-[120px]">
                    {user.full_name}
                  </div>
                  <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                    {user.role}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showRoleMenu && (
                <div className="absolute right-4 top-16 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-800">
                    <p className="text-xs text-slate-400">Signed in as</p>
                    <p className="text-xs font-bold text-white truncate">{user.email}</p>
                  </div>
                  <div className="py-1">
                    <Link
                      to={user.role === 'ADMIN' ? '/admin' : user.role === 'STAFF' ? '/staff' : '/customer'}
                      onClick={() => setShowRoleMenu(false)}
                      className="flex items-center px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-amber-400"
                    >
                      <Sparkles className="w-3.5 h-3.5 mr-2 text-amber-400" />
                      Go to {user.role === 'ADMIN' ? 'Owner Portal' : user.role === 'STAFF' ? 'Staff Portal' : 'Customer Portal'}
                    </Link>
                    <Link
                      to="/customer/profile"
                      onClick={() => setShowRoleMenu(false)}
                      className="flex items-center px-4 py-2 text-xs text-slate-300 hover:bg-slate-800"
                    >
                      <UserIcon className="w-3.5 h-3.5 mr-2" />
                      My Profile & KYC
                    </Link>
                  </div>
                  <div className="pt-1 border-t border-slate-800">
                    <button
                      onClick={() => { setShowRoleMenu(false); logout(); navigate('/'); }}
                      className="flex items-center w-full px-4 py-2 text-xs text-red-400 hover:bg-slate-800"
                    >
                      <LogOut className="w-3.5 h-3.5 mr-2" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="text-xs text-slate-300 hover:text-white px-3 py-1.5 font-medium transition"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs px-3.5 py-1.5 rounded-lg shadow-sm transition"
              >
                Open Account
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

function CoinsIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="8" cy="8" r="6"/>
      <path d="M18.09 10.37A6 6 0 1 1 10.34 18"/>
      <path d="M7 6h1v4"/>
      <path d="m16.71 13.88.7.71-2.82 2.82"/>
    </svg>
  );
}


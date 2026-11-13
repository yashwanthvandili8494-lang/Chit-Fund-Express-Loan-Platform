import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { 
  Lock, Mail, Phone, User as UserIcon, ShieldCheck, 
  ArrowRight, Sparkles, CheckCircle2, AlertCircle, Loader2
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, quickLoginAs, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isRegister, setIsRegister] = useState<boolean>(false);
  const [emailOrPhone, setEmailOrPhone] = useState<string>('customer@sowbhagyachits.in');
  const [password, setPassword] = useState<string>('Password@123');
  const [fullName, setFullName] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regPhone, setRegPhone] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('Password@123');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(emailOrPhone, password);
      // Context sets activePortal and user
      const stored = localStorage.getItem('fintech_token');
      navigate('/customer');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.register({
        full_name: fullName,
        email: regEmail,
        mobile_number: regPhone,
        password: regPassword,
        role: 'CUSTOMER'
      });
      await login(regEmail, regPassword);
      navigate('/customer');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Email or phone may already exist.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuick = async (role: 'ADMIN' | 'STAFF' | 'CUSTOMER') => {
    setLoading(true);
    await quickLoginAs(role);
    setLoading(false);
    if (role === 'ADMIN') navigate('/admin');
    else if (role === 'STAFF') navigate('/staff');
    else navigate('/customer');
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-slate-100 flex items-center justify-center p-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-fintech border border-slate-200/80 overflow-hidden">
        {/* Top Header */}
        <div className="bg-[#0B192C] text-white p-6 text-center relative">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 font-black text-xl flex items-center justify-center mx-auto mb-3 shadow-fintech-gold">
            S
          </div>
          <h2 className="text-xl font-black text-white">Sowbhagya FinServe</h2>
          <p className="text-xs text-slate-400 mt-1">
            Access Owner, Staff, or Customer Financial Portal
          </p>

          <div className="flex border-b border-slate-700 mt-6">
            <button
              onClick={() => { setIsRegister(false); setError(null); }}
              className={`flex-1 pb-3 text-xs font-bold transition border-b-2 ${
                !isRegister ? 'border-amber-400 text-amber-400' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In to Account
            </button>
            <button
              onClick={() => { setIsRegister(true); setError(null); }}
              className={`flex-1 pb-3 text-xs font-bold transition border-b-2 ${
                isRegister ? 'border-amber-400 text-amber-400' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Register as New Customer
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs font-semibold flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!isRegister ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">
                  Email or Registered Mobile Number
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    placeholder="e.g. customer@sowbhagyachits.in"
                    className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black py-3 rounded-xl shadow-fintech-gold transition text-xs flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Secure Sign In</span>}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">
                  Full Legal Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="As per PAN card"
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="your.email@domain.com"
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">
                  Mobile Number (India +91)
                </label>
                <input
                  type="tel"
                  required
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="+91 98800 12345"
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">
                  Set Password
                </label>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black py-3 rounded-xl shadow-fintech-gold transition text-xs flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Complete Registration</span>}
              </button>
            </form>
          )}

          {/* Quick Evaluator Role Switcher */}
          <div className="pt-4 border-t border-slate-200">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block text-center mb-3">
              ⚡ Instant 1-Click Demo Evaluation Logins:
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuick('ADMIN')}
                className="py-2.5 px-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition text-center"
              >
                Owner / Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuick('STAFF')}
                className="py-2.5 px-2 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-300 rounded-xl text-xs font-bold transition text-center"
              >
                Staff Desk
              </button>
              <button
                type="button"
                onClick={() => handleQuick('CUSTOMER')}
                className="py-2.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-bold transition text-center"
              >
                Customer
              </button>
            </div>
            <p className="text-[10px] text-center text-slate-400 mt-2">
              Pre-seeded with realistic Indian financial data, chit groups, and loans.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};


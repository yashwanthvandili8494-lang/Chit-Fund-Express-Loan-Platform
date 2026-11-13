import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Settings, ShieldCheck, CheckCircle2, Lock, Save, Loader2 } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<any>({
    company_name: 'Sowbhagya Chits & FinServe Private Limited',
    cin_number: 'U65992KA2018PTC112345',
    chit_registrar_license_no: 'KA/BLR/CHIT/2019/882',
    money_lending_license_no: 'KA/BLR/MLL/2021/409',
    registered_office_address: '#42, 3rd Floor, FinTech Towers, MG Road, Bengaluru, Karnataka 560001',
    support_email: 'support@sowbhagyachits.in',
    support_phone: '+91 80 4912 8800',
    gstin: '29ABCDE1234F1Z5',
    foreman_commission_standard_pct: 5.0,
    max_chit_discount_pct: 40.0,
    default_loan_apr_pct: 14.5
  });

  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getCompanySettings();
        setSettings(data);
      } catch (e) {
        // fallback
      }
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg(null);
    try {
      await api.updateCompanySettings(settings);
      setIsSaving(false);
      setSuccessMsg('Statutory regulatory settings saved successfully!');
    } catch (e) {
      setIsSaving(false);
      setSuccessMsg('Settings updated locally!');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in max-w-4xl mx-auto">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-fintech flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
            <Settings className="w-4 h-4" />
            <span>Statutory & Corporate Architecture</span>
          </div>
          <h1 className="text-2xl font-black text-slate-950">Company Regulatory Settings</h1>
          <p className="text-xs text-slate-500 mt-1">
            Maintain official Karnataka Registrar of Chits registration, Money Lending license, and statutory commission ceilings
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-xs font-bold flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-fintech">
        <form onSubmit={handleSave} className="space-y-6 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="font-bold uppercase tracking-wider text-slate-700 block mb-1">Company Legal Entity Name</label>
              <input
                type="text"
                required
                value={settings.company_name}
                onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
                className="w-full font-bold bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900"
              />
            </div>

            <div>
              <label className="font-bold uppercase tracking-wider text-slate-700 block mb-1">Corporate Identity Number (CIN)</label>
              <input
                type="text"
                required
                value={settings.cin_number}
                onChange={(e) => setSettings({ ...settings, cin_number: e.target.value })}
                className="w-full font-mono font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900"
              />
            </div>

            <div>
              <label className="font-bold uppercase tracking-wider text-slate-700 block mb-1">GSTIN Number</label>
              <input
                type="text"
                required
                value={settings.gstin}
                onChange={(e) => setSettings({ ...settings, gstin: e.target.value })}
                className="w-full font-mono font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900"
              />
            </div>

            <div>
              <label className="font-bold uppercase tracking-wider text-slate-700 block mb-1">Karnataka Chit Registrar License</label>
              <input
                type="text"
                required
                value={settings.chit_registrar_license_no}
                onChange={(e) => setSettings({ ...settings, chit_registrar_license_no: e.target.value })}
                className="w-full font-mono font-bold text-amber-700 bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5"
              />
            </div>

            <div>
              <label className="font-bold uppercase tracking-wider text-slate-700 block mb-1">Money Lending License Number</label>
              <input
                type="text"
                required
                value={settings.money_lending_license_no}
                onChange={(e) => setSettings({ ...settings, money_lending_license_no: e.target.value })}
                className="w-full font-mono font-bold text-blue-700 bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5"
              />
            </div>

            <div className="md:col-span-2">
              <label className="font-bold uppercase tracking-wider text-slate-700 block mb-1">Registered Corporate Address</label>
              <input
                type="text"
                required
                value={settings.registered_office_address}
                onChange={(e) => setSettings({ ...settings, registered_office_address: e.target.value })}
                className="w-full font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900"
              />
            </div>

            <div>
              <label className="font-bold uppercase tracking-wider text-slate-700 block mb-1">Support Email</label>
              <input
                type="email"
                required
                value={settings.support_email}
                onChange={(e) => setSettings({ ...settings, support_email: e.target.value })}
                className="w-full font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900"
              />
            </div>

            <div>
              <label className="font-bold uppercase tracking-wider text-slate-700 block mb-1">Support Telephone</label>
              <input
                type="text"
                required
                value={settings.support_phone}
                onChange={(e) => setSettings({ ...settings, support_phone: e.target.value })}
                className="w-full font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900"
              />
            </div>

            <div className="md:col-span-2 pt-4 border-t border-slate-200">
              <span className="font-bold text-slate-900 block mb-3 text-sm">
                Financial Ceilings & Statutory Caps
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Foreman Commission Fee</span>
                  <div className="text-sm font-black text-slate-900 mt-1">5.0% Fixed</div>
                  <span className="text-[10px] text-slate-400">Statutory cap under Chit Funds Act</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Max Reverse Auction Discount</span>
                  <div className="text-sm font-black text-slate-900 mt-1">40.0% Cap</div>
                  <span className="text-[10px] text-slate-400">Karnataka Chit Rules ceiling</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Standard Lending APR</span>
                  <div className="text-sm font-black text-blue-700 mt-1">14.50% p.a.</div>
                  <span className="text-[10px] text-slate-400">Reducing balance rate</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-fintech-gold transition flex items-center space-x-2"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Statutory Configuration</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


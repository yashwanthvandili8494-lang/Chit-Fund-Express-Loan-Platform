import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Users, UserCheck, ShieldCheck, Coins,
  FileText, Landmark, Gavel, Wallet, CheckSquare, Clock,
  CreditCard, BarChart3, History, Settings, FileBadge,
  HelpCircle, AlertCircle, ArrowUpRight
} from 'lucide-react';

interface SidebarProps {
  portal: 'OWNER' | 'STAFF' | 'CUSTOMER';
}

interface NavItem {
  to: string;
  label: string;
  icon: any;
  exact?: boolean;
  badge?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ portal }) => {
  const { user } = useAuth();

  const ownerLinks: NavItem[] = [
    { to: '/admin', label: 'Dashboard Overview', icon: LayoutDashboard, exact: true },
    { to: '/admin/customers', label: 'Customer Directory', icon: Users },
    { to: '/admin/staff', label: 'Staff Management', icon: UserCheck },
    { to: '/admin/kyc', label: 'KYC Verification', icon: ShieldCheck, badge: 'Review' },
    { to: '/admin/chit-schemes', label: 'Chit Scheme Builder', icon: Coins },
    { to: '/admin/chit-applications', label: 'Chit Applications', icon: FileText, badge: 'New' },
    { to: '/admin/chit-groups', label: 'Chit Groups & Registry', icon: Landmark },
    { to: '/admin/auctions', label: 'Live Auction Manager', icon: Gavel },
    { to: '/admin/loan-products', label: 'Loan Products (APR)', icon: Wallet },
    { to: '/admin/loan-applications', label: 'Loan Underwriting', icon: CheckSquare, badge: 'Pending' },
    { to: '/admin/active-loans', label: 'Active Loans & EMIs', icon: Clock },
    { to: '/admin/payments', label: 'Payment Ledger', icon: CreditCard },
    { to: '/admin/reports', label: 'Financial Accounting', icon: BarChart3 },
    { to: '/admin/audit-logs', label: 'Security Audit Trail', icon: History },
    { to: '/admin/settings', label: 'Statutory Settings', icon: Settings },
  ];

  const staffLinks: NavItem[] = [
    { to: '/staff', label: 'Operations Desk', icon: LayoutDashboard, exact: true },
    { to: '/staff/kyc', label: 'KYC Document Review', icon: ShieldCheck, badge: 'Action' },
    { to: '/staff/chit-applications', label: 'Chit Review Desk', icon: FileText },
    { to: '/staff/loan-applications', label: 'Loan Underwriting Desk', icon: CheckSquare },
    { to: '/staff/collections', label: 'Payment Collections', icon: CreditCard },
  ];

  const customerLinks: NavItem[] = [
    { to: '/customer', label: 'My Dashboard', icon: LayoutDashboard, exact: true },
    { to: '/customer/kyc', label: 'My KYC Profile', icon: ShieldCheck },
    { to: '/customer/available-chits', label: 'Available Chit Schemes', icon: Coins },
    { to: '/customer/chit-applications', label: 'My Chit Applications', icon: FileText },
    { to: '/customer/my-chits', label: 'My Chit Account & Auctions', icon: Gavel },
    { to: '/customer/available-loans', label: 'Express Loans (Apply)', icon: Wallet },
    { to: '/customer/loan-applications', label: 'My Loan Applications', icon: CheckSquare },
    { to: '/customer/my-loans', label: 'My Loans & EMI Schedule', icon: Clock },
    { to: '/customer/payments', label: 'Payment Receipts', icon: CreditCard },
    { to: '/customer/notifications', label: 'Notification Center', icon: AlertCircle },
  ];

  const links = portal === 'OWNER' ? ownerLinks : portal === 'STAFF' ? staffLinks : customerLinks;

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 min-h-[calc(100vh-4rem)] flex flex-col justify-between py-6 px-4">
      <div>
        {/* Portal Header Badge */}
        <div className="mb-6 px-3 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Active Environment
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              portal === 'OWNER'
                ? 'bg-amber-400/20 text-amber-400 border border-amber-400/30'
                : portal === 'STAFF'
                ? 'bg-blue-400/20 text-blue-400 border border-blue-400/30'
                : 'bg-emerald-400/20 text-emerald-400 border border-emerald-400/30'
            }`}>
              {portal === 'OWNER' ? 'OWNER / ADMIN' : portal === 'STAFF' ? 'STAFF DESK' : 'SUBSCRIBER'}
            </span>
          </div>
          <div className="text-sm font-bold text-white mt-1 truncate">
            {user?.full_name || 'Authorized User'}
          </div>
          <div className="text-[11px] text-slate-400 truncate">
            {user?.email}
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="space-y-1">
          {links.map((item, idx) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={idx}
                to={item.to}
                end={item.exact}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-500/20 to-amber-500/10 text-amber-400 border border-amber-500/30 font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                  }`
                }
              >
                <div className="flex items-center space-x-3 truncate">
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] bg-amber-400/20 text-amber-300 font-bold px-1.5 py-0.2 rounded border border-amber-400/30">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Compliance Info */}
      <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400">
        <div className="flex items-center space-x-1.5 text-amber-400 font-semibold mb-1">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Statutory Protection</span>
        </div>
        <p className="text-[10px] leading-relaxed text-slate-400">
          Chit Funds Act 1982 & Karnataka Money Lenders Act compliant ledger.
        </p>
      </div>
    </aside>
  );
};

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Layouts
import { PublicLayout } from './layouts/PublicLayout';
import { CustomerLayout } from './layouts/CustomerLayout';
import { StaffLayout } from './layouts/StaffLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { ChitsPage } from './pages/public/ChitsPage';
import { LoansPage } from './pages/public/LoansPage';
import { CalculatorPage } from './pages/public/CalculatorPage';
import { AboutPage } from './pages/public/AboutPage';
import { ContactPage } from './pages/public/ContactPage';
import { LoginPage } from './pages/public/LoginPage';

// Customer Pages
import { CustomerDashboard } from './pages/customer/CustomerDashboard';
import { CustomerKYC } from './pages/customer/CustomerKYC';
import { CustomerAvailableChits } from './pages/customer/CustomerAvailableChits';
import { CustomerChitApplications } from './pages/customer/CustomerChitApplications';
import { CustomerMyChits } from './pages/customer/CustomerMyChits';
import { CustomerAvailableLoans } from './pages/customer/CustomerAvailableLoans';
import { CustomerLoanApplications } from './pages/customer/CustomerLoanApplications';
import { CustomerMyLoans } from './pages/customer/CustomerMyLoans';
import { CustomerPayments } from './pages/customer/CustomerPayments';
import { CustomerNotifications } from './pages/customer/CustomerNotifications';

// Staff Pages
import { StaffDashboard } from './pages/staff/StaffDashboard';
import { StaffKYCReview } from './pages/staff/StaffKYCReview';
import { StaffChitApplications } from './pages/staff/StaffChitApplications';
import { StaffLoanApplications } from './pages/staff/StaffLoanApplications';
import { StaffCollections } from './pages/staff/StaffCollections';

// Owner / Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminCustomers } from './pages/admin/AdminCustomers';
import { AdminStaff } from './pages/admin/AdminStaff';
import { AdminKYCVerification } from './pages/admin/AdminKYCVerification';
import { AdminChitSchemes } from './pages/admin/AdminChitSchemes';
import { AdminChitApplications } from './pages/admin/AdminChitApplications';
import { AdminChitGroups } from './pages/admin/AdminChitGroups';
import { AdminAuctionManager } from './pages/admin/AdminAuctionManager';
import { AdminLoanProducts } from './pages/admin/AdminLoanProducts';
import { AdminLoanApplications } from './pages/admin/AdminLoanApplications';
import { AdminActiveLoans } from './pages/admin/AdminActiveLoans';
import { AdminPayments } from './pages/admin/AdminPayments';
import { AdminReports } from './pages/admin/AdminReports';
import { AdminAuditLogs } from './pages/admin/AdminAuditLogs';
import { AdminSettings } from './pages/admin/AdminSettings';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* 1. PUBLIC ROUTES */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/chits" element={<ChitsPage />} />
            <Route path="/loans" element={<LoansPage />} />
            <Route path="/calculator" element={<CalculatorPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<LoginPage />} />
          </Route>

          {/* 2. CUSTOMER PORTAL */}
          <Route path="/customer" element={<CustomerLayout />}>
            <Route index element={<CustomerDashboard />} />
            <Route path="kyc" element={<CustomerKYC />} />
            <Route path="profile" element={<CustomerKYC />} />
            <Route path="available-chits" element={<CustomerAvailableChits />} />
            <Route path="chit-applications" element={<CustomerChitApplications />} />
            <Route path="my-chits" element={<CustomerMyChits />} />
            <Route path="available-loans" element={<CustomerAvailableLoans />} />
            <Route path="loan-applications" element={<CustomerLoanApplications />} />
            <Route path="my-loans" element={<CustomerMyLoans />} />
            <Route path="payments" element={<CustomerPayments />} />
            <Route path="notifications" element={<CustomerNotifications />} />
          </Route>

          {/* 3. STAFF PORTAL */}
          <Route path="/staff" element={<StaffLayout />}>
            <Route index element={<StaffDashboard />} />
            <Route path="kyc" element={<StaffKYCReview />} />
            <Route path="chit-applications" element={<StaffChitApplications />} />
            <Route path="loan-applications" element={<StaffLoanApplications />} />
            <Route path="collections" element={<StaffCollections />} />
          </Route>

          {/* 4. OWNER / ADMIN PORTAL */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="staff" element={<AdminStaff />} />
            <Route path="kyc" element={<AdminKYCVerification />} />
            <Route path="chit-schemes" element={<AdminChitSchemes />} />
            <Route path="chit-applications" element={<AdminChitApplications />} />
            <Route path="chit-groups" element={<AdminChitGroups />} />
            <Route path="auctions" element={<AdminAuctionManager />} />
            <Route path="loan-products" element={<AdminLoanProducts />} />
            <Route path="loan-applications" element={<AdminLoanApplications />} />
            <Route path="active-loans" element={<AdminActiveLoans />} />
            <Route path="payments" element={<AdminPayments />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="audit-logs" element={<AdminAuditLogs />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};


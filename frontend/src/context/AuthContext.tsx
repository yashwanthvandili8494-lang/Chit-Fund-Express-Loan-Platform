import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: UserRole | null;
  activePortal: 'OWNER' | 'STAFF' | 'CUSTOMER' | 'PUBLIC';
  setActivePortal: (portal: 'OWNER' | 'STAFF' | 'CUSTOMER' | 'PUBLIC') => void;
  login: (emailOrPhone: string, pass: string) => Promise<void>;
  quickLoginAs: (role: UserRole) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  unreadCount: number;
  decrementUnread: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('fintech_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [unreadCount, setUnreadCount] = useState<number>(3);
  const [activePortal, setActivePortal] = useState<'OWNER' | 'STAFF' | 'CUSTOMER' | 'PUBLIC'>('PUBLIC');

  useEffect(() => {
    async function loadUser() {
      const storedToken = localStorage.getItem('fintech_token');
      if (storedToken) {
        try {
          const me = await api.getMe();
          setUser(me);
          if (me.role === 'ADMIN') setActivePortal('OWNER');
          else if (me.role === 'STAFF') setActivePortal('STAFF');
          else setActivePortal('CUSTOMER');
        } catch (e) {
          console.warn('Token expired or invalid');
          localStorage.removeItem('fintech_token');
          setToken(null);
          setUser(null);
          setActivePortal('PUBLIC');
        }
      }
      setIsLoading(false);
    }
    loadUser();
  }, []);

  const login = async (email_or_phone: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.login({ email_or_phone, password });
      localStorage.setItem('fintech_token', res.access_token);
      setToken(res.access_token);
      setUser(res.user);
      if (res.user.role === 'ADMIN') setActivePortal('OWNER');
      else if (res.user.role === 'STAFF') setActivePortal('STAFF');
      else setActivePortal('CUSTOMER');
    } finally {
      setIsLoading(false);
    }
  };

  const quickLoginAs = async (targetRole: UserRole) => {
    setIsLoading(true);
    try {
      let email = 'customer@sowbhagyachits.in';
      if (targetRole === 'ADMIN') email = 'owner@sowbhagyachits.in';
      if (targetRole === 'STAFF') email = 'staff@sowbhagyachits.in';
      
      const res = await api.login({ email_or_phone: email, password: 'Password@123' });
      localStorage.setItem('fintech_token', res.access_token);
      setToken(res.access_token);
      setUser(res.user);
      if (targetRole === 'ADMIN') setActivePortal('OWNER');
      else if (targetRole === 'STAFF') setActivePortal('STAFF');
      else setActivePortal('CUSTOMER');
    } catch (err: any) {
      console.error('Quick login failed:', err);
      // Fallback demo user if backend offline
      const mockUser: User = {
        id: targetRole === 'ADMIN' ? 1 : targetRole === 'STAFF' ? 2 : 3,
        email: targetRole === 'ADMIN' ? 'owner@sowbhagyachits.in' : targetRole === 'STAFF' ? 'staff@sowbhagyachits.in' : 'customer@sowbhagyachits.in',
        mobile_number: '+919880112233',
        full_name: targetRole === 'ADMIN' ? 'Rajeshwar Rao (Director)' : targetRole === 'STAFF' ? 'Ananya Sharma (Operations)' : 'Vikramaditya Hegde',
        role: targetRole,
        is_active: true,
        is_verified: true,
        created_at: new Date().toISOString()
      };
      setUser(mockUser);
      if (targetRole === 'ADMIN') setActivePortal('OWNER');
      else if (targetRole === 'STAFF') setActivePortal('STAFF');
      else setActivePortal('CUSTOMER');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('fintech_token');
    setToken(null);
    setUser(null);
    setActivePortal('PUBLIC');
  };

  const decrementUnread = () => {
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user ? user.role : null,
        activePortal,
        setActivePortal,
        login,
        quickLoginAs,
        logout,
        isLoading,
        unreadCount,
        decrementUnread,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


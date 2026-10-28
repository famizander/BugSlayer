import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  resetPassword: (email: string) => Promise<{ success: boolean; message: string }>;
}

interface StoredAccount {
  user: User;
  passwordHash: string; // Base64 / salt simulation
}

const DEFAULT_USERS: StoredAccount[] = [
  {
    user: {
      id: 'user-demo-1',
      username: 'Alex Programmer',
      email: 'student@bugslayer.dev',
      createdAt: '2026-09-15T10:00:00Z',
      plan: 'free',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    },
    passwordHash: 'c3R1ZGVudDEyMw==', // base64 of 'student123'
  },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize and load accounts from storage
  useEffect(() => {
    try {
      // Check stored accounts pool
      const accountsRaw = localStorage.getItem('bugslayer_accounts');
      if (!accountsRaw) {
        localStorage.setItem('bugslayer_accounts', JSON.stringify(DEFAULT_USERS));
      }

      // Check current session
      const sessionRaw = localStorage.getItem('bugslayer_current_user');
      if (sessionRaw) {
        const parsed = JSON.parse(sessionRaw);
        setUser(parsed);
      }
    } catch (e) {
      console.error('Failed to restore auth session', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getAccounts = (): StoredAccount[] => {
    try {
      const raw = localStorage.getItem('bugslayer_accounts');
      return raw ? JSON.parse(raw) : DEFAULT_USERS;
    } catch {
      return DEFAULT_USERS;
    }
  };

  const saveAccounts = (accounts: StoredAccount[]) => {
    try {
      localStorage.setItem('bugslayer_accounts', JSON.stringify(accounts));
    } catch (e) {
      console.error('Failed to save accounts', e);
    }
  };

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    // Simulate brief network authentication response
    await new Promise((r) => setTimeout(r, 450));

    const accounts = getAccounts();
    const normalizedEmail = email.trim().toLowerCase();
    const account = accounts.find((a) => a.user.email.toLowerCase() === normalizedEmail);

    if (!account) {
      setIsLoading(false);
      return { success: false, error: 'No account found with this email address.' };
    }

    const inputHash = btoa(password);
    if (account.passwordHash !== inputHash) {
      setIsLoading(false);
      return { success: false, error: 'Incorrect password. Please verify and try again.' };
    }

    setUser(account.user);
    try {
      localStorage.setItem('bugslayer_current_user', JSON.stringify(account.user));
    } catch (e) {
      console.warn('Failed to persist session', e);
    }
    setIsLoading(false);
    return { success: true };
  };

  const register = async (
    username: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 500));

    const accounts = getAccounts();
    const normalizedEmail = email.trim().toLowerCase();

    if (accounts.some((a) => a.user.email.toLowerCase() === normalizedEmail)) {
      setIsLoading(false);
      return { success: false, error: 'An account with this email already exists.' };
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      username: username.trim(),
      email: normalizedEmail,
      createdAt: new Date().toISOString(),
      plan: 'free',
    };

    const newAccount: StoredAccount = {
      user: newUser,
      passwordHash: btoa(password),
    };

    accounts.push(newAccount);
    saveAccounts(accounts);

    setUser(newUser);
    try {
      localStorage.setItem('bugslayer_current_user', JSON.stringify(newUser));
    } catch (e) {
      console.warn('Failed to persist session', e);
    }
    setIsLoading(false);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem('bugslayer_current_user');
    } catch (e) {
      console.warn('Failed to clear session', e);
    }
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; message: string }> => {
    await new Promise((r) => setTimeout(r, 400));
    const accounts = getAccounts();
    const exists = accounts.some((a) => a.user.email.toLowerCase() === email.trim().toLowerCase());
    if (!exists) {
      return {
        success: false,
        message: 'No account matches that email. Please check the spelling or sign up.',
      };
    }
    return {
      success: true,
      message: `A password reset link has been dispatched to ${email}. Check your inbox.`,
    };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

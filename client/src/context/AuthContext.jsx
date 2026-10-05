import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('earnflow_token'));
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUser = useCallback(async () => {
    const storedToken = localStorage.getItem('earnflow_token');
    if (!storedToken) {
      setUser(null);
      setWallet(null);
      setLoading(false);
      return;
    }

    try {
      const data = await api.getMe();
      setUser(data.user);
      setWallet(data.wallet);
      setUnreadCount(data.unreadNotificationsCount || 0);
    } catch (err) {
      console.warn('Failed to restore session:', err.message);
      localStorage.removeItem('earnflow_token');
      setUser(null);
      setWallet(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();

    const handleUnauthorized = () => {
      setUser(null);
      setWallet(null);
      setToken(null);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [refreshUser]);

  const login = async (credentials) => {
    const res = await api.login(credentials);
    localStorage.setItem('earnflow_token', res.token);
    setToken(res.token);
    setUser(res.user);
    // Fetch live wallet
    await refreshUser();
    return res.user;
  };

  const register = async (userData) => {
    const res = await api.register(userData);
    localStorage.setItem('earnflow_token', res.token);
    setToken(res.token);
    setUser(res.user);
    await refreshUser();
    return res.user;
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (e) {
      // ignore
    }
    localStorage.removeItem('earnflow_token');
    setToken(null);
    setUser(null);
    setWallet(null);
  };

  const isAuthenticated = Boolean(user && token);
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        wallet,
        token,
        loading,
        unreadCount,
        isAuthenticated,
        isAdmin,
        login,
        register,
        logout,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

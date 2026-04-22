import React, { createContext, useContext, useState, useEffect } from 'react';
import * as api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('gh_token');
    if (token) {
      api.getMe()
        .then(res => setUser(res.data.user))
        .catch(() => localStorage.removeItem('gh_token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    localStorage.setItem('gh_token', res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const register = async (name, email, password) => {
    const res = await api.register({ name, email, password });
    localStorage.setItem('gh_token', res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = () => {
    localStorage.removeItem('gh_token');
    setUser(null);
  };

  const refreshUser = async () => {
    const res = await api.getMe();
    setUser(res.data.user);
    return res.data.user;
  };

  /**
   * True if:
   *   1. A user is logged in
   *   2. subscriptionStatus === 'active'
   *   3. subscriptionEndDate is in the future
   *
   * Mirrors the hasActiveSubscription() method on the User model.
   */
  const isSubscribed = () => {
    if (!user) return false;
    return (
      (user.subscriptionStatus === 'active' || user.subscriptionStatus === 'cancelled') &&
      user.subscriptionEndDate &&
      new Date(user.subscriptionEndDate) > new Date()
    );
  };

  const isFreeUser = () => !user || !isSubscribed();

  const isAdmin = () => user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser, isSubscribed, isFreeUser, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

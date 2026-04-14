import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { setAccessToken, clearAccessToken } from '../services/api';
import { setSocketToken } from './SocketContext';
import * as authService from '../services/auth.service';

const storeToken = (token) => {
  setAccessToken(token);
  setSocketToken(token);
};

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, attempt a silent refresh to restore session
  useEffect(() => {
    authService.refresh()
      .then((res) => {
        storeToken(res.data.accessToken);
        // Decode user info from token payload
        const payload = JSON.parse(atob(res.data.accessToken.split('.')[1]));
        setUser({ id: payload.userId, role: payload.role, isEmailVerified: payload.isEmailVerified });
      })
      .catch(() => {}) // Not logged in — that's fine
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authService.login({ email, password });
    setAccessToken(res.data.accessToken);
    setUser(res.data.user);
    return res.data;
  }, []);

  const register = useCallback(async (data) => {
    const res = await authService.register(data);
    setAccessToken(res.data.accessToken);
    setUser(res.data.user);
    return res.data;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout().catch(() => {});
    clearAccessToken();
    setUser(null);
  }, []);

  const updateUser = useCallback((updates) => {
    setUser((prev) => ({ ...prev, ...updates }));
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

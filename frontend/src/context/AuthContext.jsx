import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('deployx_access_token');
      if (token) {
        try {
          const res = await api.get('/auth/profile/');
          setUser(res.data);
        } catch (err) {
          console.error('Failed to restore the current session:', err.message);
          localStorage.removeItem('deployx_access_token');
          localStorage.removeItem('deployx_refresh_token');
          setUser(null);
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const login = async (username, password) => {
    const res = await api.post('/auth/login/', { username, password });
    localStorage.setItem('deployx_access_token', res.data.access);
    localStorage.setItem('deployx_refresh_token', res.data.refresh);
    const profileRes = await api.get('/auth/profile/');
    setUser(profileRes.data);
    return profileRes.data;
  };

  const register = async (username, email, password) => {
    const res = await api.post('/auth/register/', { username, email, password });
    if (res.data.tokens) {
      localStorage.setItem('deployx_access_token', res.data.tokens.access);
      localStorage.setItem('deployx_refresh_token', res.data.tokens.refresh);
      setUser(res.data.user);
    }
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('deployx_access_token');
    localStorage.removeItem('deployx_refresh_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

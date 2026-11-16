import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  setAuthToken,
  setOnUnauthorized,
  loginUser,
  registerUser,
  getMe
} from '../api/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuthToken(null);
    navigate('/login');
  }, [navigate]);

  useEffect(() => {
    // Register 401 callback with api layer
    setOnUnauthorized(() => {
      logout();
    });
  }, [logout]);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        setAuthToken(savedToken);
        try {
          const res = await getMe();
          setUser(res.user);
          localStorage.setItem('user', JSON.stringify(res.user));
        } catch (err) {
          console.warn('Session expired or invalid:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [logout]);

  const login = async (email, password) => {
    const res = await loginUser({ email, password });
    setToken(res.token);
    setUser(res.user);
    localStorage.setItem('token', res.token);
    localStorage.setItem('user', JSON.stringify(res.user));
    setAuthToken(res.token);
    return res;
  };

  const register = async (email, password) => {
    const res = await registerUser({ email, password });
    return res;
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        isAuthenticated: Boolean(token),
        login,
        register,
        logout
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

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

const USER_KEY = 'guidespend_user';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY)) || {};
    } catch {
      return {};
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      // Verify token then immediately fetch the real profile from DB
      authApi
        .verifyToken()
        .then(() => authApi.getProfile())
        .then((profile) => {
          const userInfo = { email: profile.email, username: profile.username };
          localStorage.setItem(USER_KEY, JSON.stringify(userInfo));
          setUser(userInfo);
          setIsLoading(false);
        })
        .catch(() => {
          localStorage.removeItem('token');
          localStorage.removeItem(USER_KEY);
          setToken(null);
          setUser({});
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = useCallback(async (email, password) => {
    const data = await authApi.login(email, password);
    localStorage.setItem('token', data.access_token);
    setToken(data.access_token);
    // Store email immediately; profile fetch on next mount will fill username
    const userInfo = { email };
    localStorage.setItem(USER_KEY, JSON.stringify(userInfo));
    setUser(userInfo);
    // Fetch real profile right after login so username is available instantly
    authApi.getProfile().then((profile) => {
      const fullInfo = { email: profile.email, username: profile.username };
      localStorage.setItem(USER_KEY, JSON.stringify(fullInfo));
      setUser(fullInfo);
    }).catch(() => {});
    navigate('/dashboard');
    return data;
  }, [navigate]);

  const register = useCallback(async (username, email, password) => {
    await authApi.register(username, email, password);
    const data = await authApi.login(email, password);
    localStorage.setItem('token', data.access_token);
    setToken(data.access_token);
    const userInfo = { email, username };
    localStorage.setItem(USER_KEY, JSON.stringify(userInfo));
    setUser(userInfo);
    navigate('/dashboard');
    return data;
  }, [navigate]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser({});
    navigate('/login');
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ token, user, login, register, logout, isAuthenticated: !!token, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

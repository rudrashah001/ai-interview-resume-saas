import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import api, { clearStoredAuth, getStoredAuth, setStoredAuth } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshMe = useCallback(async () => {
    if (!token) return;
    const { data } = await api.get('/auth/me');
    const nextUser = {
      _id: data._id,
      name: data.name,
      email: data.email,
      role: data.role,
      subscription: data.subscription,
      isPremium: data.isPremium,
      hasFullAccess: data.hasFullAccess ?? data.isPremium,
    };
    setUser(nextUser);
    setStoredAuth({ token, user: nextUser });
  }, [token]);

  useEffect(() => {
    const s = getStoredAuth();
    if (s?.token && s.user) {
      setToken(s.token);
      setUser(s.user);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const sync = async () => {
      if (!token) return;
      try {
        await refreshMe();
      } catch {
        /* keep cached user */
      }
    };
    sync();
  }, [token, refreshMe]);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    const payload = {
      token: data.token,
      user: {
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
        subscription: data.subscription,
        isPremium: data.isPremium,
        hasFullAccess: data.hasFullAccess ?? data.isPremium,
      },
    };
    setStoredAuth(payload);
    setToken(data.token);
    setUser(payload.user);
    return payload.user;
  };

  const register = async (body) => {
    const { data } = await api.post('/auth/register', body);
    const payload = {
      token: data.token,
      user: {
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
        subscription: data.subscription,
        isPremium: data.isPremium,
        hasFullAccess: data.hasFullAccess ?? data.isPremium,
      },
    };
    setStoredAuth(payload);
    setToken(data.token);
    setUser(payload.user);
    return payload.user;
  };

  const logout = () => {
    clearStoredAuth();
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      register,
      logout,
      refreshMe,
      isAuthenticated: Boolean(token && user),
      isPremium: Boolean(user?.isPremium),
      hasFullAccess: Boolean(
        user?.hasFullAccess ?? user?.isPremium ?? user?.role === 'admin'
      ),
    }),
    [user, token, loading, refreshMe]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

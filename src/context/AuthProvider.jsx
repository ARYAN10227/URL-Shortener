import { useState, useEffect, useCallback } from 'react';
import { AuthContext } from './AuthContext';
import apiService, { getToken, setStoredToken } from '../services/api';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => getToken());
  const [loading, setLoading] = useState(true);

  // Initialize auth state by fetching current user if token exists
  useEffect(() => {
    let isMounted = true;

    async function loadUser() {
      const storedToken = getToken();
      if (!storedToken) {
        if (isMounted) {
          setUser(null);
          setToken(null);
          setLoading(false);
        }
        return;
      }

      try {
        const data = await apiService.getMe();
        if (isMounted) {
          setUser(data.user);
          setToken(storedToken);
        }
      } catch (err) {
        console.warn('Failed to restore auth session:', err.message);
        setStoredToken(null);
        if (isMounted) {
          setUser(null);
          setToken(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadUser();

    // Listen for global 401 unauthorized events from Axios interceptor
    const handleUnauthorized = () => {
      if (isMounted) {
        setUser(null);
        setToken(null);
      }
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);

    return () => {
      isMounted = false;
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await apiService.login({ email, password });
    if (data.token && data.user) {
      setStoredToken(data.token);
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const data = await apiService.register({ name, email, password });
    if (data.token && data.user) {
      setStoredToken(data.token);
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  }, []);

  const logout = useCallback(() => {
    setStoredToken(null);
    setToken(null);
    setUser(null);
  }, []);

  const value = {
    user,
    token,
    loading,
    isAuthenticated: Boolean(user && token),
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;

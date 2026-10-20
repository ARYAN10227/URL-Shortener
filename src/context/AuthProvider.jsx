import { useState, useEffect, useCallback } from 'react';
import { AuthContext } from './AuthContext';
import apiService, { getToken, setStoredToken } from '../services/api';

const USER_KEY = 'url_shortener_user';

function storeSession(data, setToken, setUser) {
  if (data.token && data.user) {
    setStoredToken(data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  }
}

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
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        if (isMounted) {
          setUser(data.user);
          setToken(storedToken);
        }
      } catch (err) {
        console.warn('Failed to restore auth session:', err.message);
        // Only a 401 means the token is bad. A network error or timeout (e.g. the free
        // server is still waking up) must not log the user out.
        if (err.response?.status === 401) {
          setStoredToken(null);
          if (isMounted) {
            setUser(null);
            setToken(null);
          }
        } else if (isMounted) {
          const cached = localStorage.getItem(USER_KEY);
          if (cached) {
            try {
              setUser(JSON.parse(cached));
              setToken(storedToken);
            } catch {
              /* ignore a corrupt cache */
            }
          }
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
    storeSession(data, setToken, setUser);
    return data;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const data = await apiService.register({ name, email, password });
    storeSession(data, setToken, setUser);
    return data;
  }, []);

  const loginDemo = useCallback(async () => {
    const data = await apiService.demoLogin();
    storeSession(data, setToken, setUser);
    return data;
  }, []);

  const logout = useCallback(() => {
    setStoredToken(null);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const value = {
    user,
    token,
    loading,
    isAuthenticated: Boolean(user && token),
    login,
    loginDemo,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;

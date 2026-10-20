import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Link2, LayoutDashboard, FileText, Activity, LogIn, UserPlus, LogOut, User } from 'lucide-react';
import apiService from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import DemoLoginButton from './DemoLoginButton';

function GithubIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </svg>
  );
}

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [apiOnline, setApiOnline] = useState(null);

  // The API client fires this when a saved session is rejected (expired or invalid token).
  useEffect(() => {
    const onUnauthorized = () => {
      addToast('Your session has expired. Please log in again or use the demo.', 'error');
      navigate('/login', { replace: true });
    };
    window.addEventListener('auth:unauthorized', onUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', onUnauthorized);
  }, [addToast, navigate]);

  useEffect(() => {
    let isMounted = true;
    apiService.getHealth()
      .then((data) => {
        if (isMounted && data?.status === 'ok') {
          setApiOnline(true);
        }
      })
      .catch(() => {
        if (isMounted) {
          setApiOnline(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = () => {
    logout();
    addToast('You have been logged out.', 'success');
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand-logo">
          <div className="brand-icon-wrapper">
            <Link2 size={20} strokeWidth={2.5} />
          </div>
          <span>Shortly</span>
        </Link>

        <div className="nav-links">
          {apiOnline !== null && (
            <div
              className={`badge ${apiOnline ? 'badge-emerald' : 'badge-amber'}`}
              title={apiOnline ? 'Live Backend Connected' : 'Connecting to Backend / Render Cold Start'}
              style={{ display: 'inline-flex', fontSize: '0.75rem', padding: '0.2rem 0.55rem' }}
            >
              <Activity size={12} className={apiOnline ? '' : 'spin'} />
              <span>{apiOnline ? 'API Online' : 'Connecting...'}</span>
            </div>
          )}

          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            end
          >
            Home
          </NavLink>

          {isAuthenticated && (
            <NavLink
              to="/dashboard"
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              <LayoutDashboard size={16} />
              <span>Dashboard</span>
            </NavLink>
          )}

          <a
            href="https://url-shortener-api-h1dj.onrender.com/api-docs"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-link"
          >
            <FileText size={16} />
            <span>API Docs</span>
          </a>

          <a
            href="https://github.com/ARYAN10227/url-shortener-api"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-icon-link"
            title="GitHub Repository"
            aria-label="GitHub Repository"
          >
            <GithubIcon size={19} />
          </a>

          {/* Authentication Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginLeft: '0.5rem' }}>
            {isAuthenticated ? (
              <>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    padding: '0.35rem 0.75rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.85rem',
                    color: 'var(--text-main)',
                  }}
                  title={user?.email}
                >
                  <User size={14} style={{ color: 'var(--primary)' }} />
                  <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>
                    {user?.name || user?.email}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                  title="Sign out of account"
                >
                  <LogOut size={14} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="btn btn-ghost btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <LogIn size={14} />
                  <span>Log in</span>
                </Link>

                <Link
                  to="/register"
                  className="btn btn-ghost btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <UserPlus size={14} />
                  <span>Sign up</span>
                </Link>

                <div style={{ minWidth: '140px' }}>
                  <DemoLoginButton label="Try Demo" size="sm" variant="primary" />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

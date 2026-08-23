import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Link2, LayoutDashboard, FileText, Activity } from 'lucide-react';
import apiService from '../services/api';

function GithubIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </svg>
  );
}

export default function Navbar() {
  const [apiOnline, setApiOnline] = useState(null);

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

          <NavLink
            to="/dashboard"
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            <LayoutDashboard size={16} />
            <span>Dashboard</span>
          </NavLink>

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
        </div>
      </div>
    </nav>
  );
}

import { Link2, FileText, Activity } from 'lucide-react';

function GithubIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '6px',
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
            }}
          >
            <Link2 size={14} />
          </div>
          <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Shortly</span>
          <span>&copy; {new Date().getFullYear()} — Production Ready URL Shortener</span>
        </div>

        <div className="footer-links">
          <a
            href="https://url-shortener-api-h1dj.onrender.com/health"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <Activity size={14} />
            Health Check
          </a>
          <a
            href="https://url-shortener-api-h1dj.onrender.com/api-docs"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <FileText size={14} />
            OpenAPI Specs
          </a>
          <a
            href="https://github.com/ARYAN10227/url-shortener-api"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <GithubIcon size={14} />
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}

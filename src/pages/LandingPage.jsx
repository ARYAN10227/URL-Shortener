import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Link2,
  Sparkles,
  ArrowRight,
  Copy,
  Check,
  ExternalLink,
  Zap,
  BarChart3,
  ShieldCheck,
  Loader2,
  AlertCircle,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import apiService, { getErrorMessage, buildShortUrl } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import DemoLoginButton from '../components/DemoLoginButton';

export default function LandingPage() {
  const { isAuthenticated, loginDemo } = useAuth();
  const { addToast } = useToast();

  const [originalUrl, setOriginalUrl] = useState('');
  const [shortCode, setShortCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    const trimmedUrl = originalUrl.trim();
    if (!trimmedUrl) {
      setError('Please enter a destination URL.');
      return;
    }

    setLoading(true);
    try {
      // No account needed: visitors are signed in to the public demo account on the fly.
      if (!isAuthenticated) {
        await loginDemo();
      }
      const data = await apiService.shortenUrl({
        originalUrl: trimmedUrl,
        shortCode: shortCode.trim() || undefined,
      });

      setResult(data);
      addToast('Short URL generated successfully!', 'success');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    const urlToCopy = result.shortUrl || buildShortUrl(result.shortCode);
    try {
      await navigator.clipboard.writeText(urlToCopy);
      setCopied(true);
      addToast('Copied short URL to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      addToast('Failed to copy to clipboard', 'error');
    }
  };

  const handleReset = () => {
    setOriginalUrl('');
    setShortCode('');
    setError(null);
    setResult(null);
  };

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-pill">
          <Sparkles size={14} />
          <span>Smart & Scalable Link Management</span>
        </div>

        <h1 className="hero-title">
          Shorten your links. <br />
          <span className="hero-title-highlight">Track every click.</span>
        </h1>

        <p className="hero-subtitle">
          Create clean, shareable URLs in milliseconds and monitor their performance with real-time click tracking and user analytics.
        </p>

        {/* Shortener Box */}
        <div className="shortener-box">
          {!result ? (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="destination-url">
                  <span>Destination URL <span style={{ color: 'var(--rose)' }}>*</span></span>
                </label>
                <div className="input-with-icon">
                  <Link2 size={18} className="input-icon" />
                  <input
                    id="destination-url"
                    type="text"
                    className="form-input"
                    placeholder="https://example.com/your-super-long-campaign-link..."
                    value={originalUrl}
                    onChange={(e) => setOriginalUrl(e.target.value)}
                    required
                    disabled={loading}
                    autoComplete="off"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="custom-code">
                  <span>Custom Short Code <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>(optional)</span></span>
                </label>
                <div className="input-with-icon">
                  <span className="input-prefix">shortly/</span>
                  <input
                    id="custom-code"
                    type="text"
                    className="form-input"
                    placeholder="e.g. launch2026, my-promo"
                    value={shortCode}
                    onChange={(e) => setShortCode(e.target.value)}
                    disabled={loading}
                    autoComplete="off"
                  />
                </div>
              </div>

              {error && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    background: 'var(--rose-light)',
                    border: '1px solid rgba(244, 63, 94, 0.35)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.85rem 1.15rem',
                    marginBottom: '1.25rem',
                    color: '#fda4af',
                    fontSize: '0.875rem',
                    textAlign: 'left',
                  }}
                >
                  <AlertCircle size={18} style={{ flexShrink: 0 }} />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                style={{ width: '100%' }}
                disabled={loading || !originalUrl.trim()}
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="spin" />
                    <span>Shortening link...</span>
                  </>
                ) : !isAuthenticated ? (
                  <>
                    <span>Shorten URL</span>
                    <ArrowRight size={18} />
                  </>
                ) : (
                  <>
                    <span>Shorten URL</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
              {!isAuthenticated && (
                <>
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', margin: '0.85rem 0' }}>
                    no sign-up needed · or jump straight in
                  </div>
                  <DemoLoginButton label="Open the dashboard (demo)" />
                </>
              )}
            </form>
          ) : (
            <div className="result-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6ee7b7', fontWeight: 600 }}>
                  <CheckCircle2 size={18} />
                  <span>Your link is ready!</span>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="btn btn-ghost btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <RotateCcw size={14} />
                  <span>Shorten another</span>
                </button>
              </div>

              <div className="result-url-display">
                <span style={{ fontWeight: 600 }}>
                  {result.shortUrl || buildShortUrl(result.shortCode)}
                </span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className={`btn btn-sm ${copied ? 'btn-secondary' : 'btn-primary'}`}
                    style={{ minWidth: '85px' }}
                  >
                    {copied ? (
                      <>
                        <Check size={14} color="#10b981" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                  <a
                    href={result.shortUrl || buildShortUrl(result.shortCode)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary btn-sm"
                    title="Open link in new tab"
                  >
                    <ExternalLink size={14} />
                    <span>Open</span>
                  </a>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '0.85rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '350px' }}>
                  Target: <span style={{ color: 'var(--text-main)' }}>{result.originalUrl}</span>
                </div>
                <Link
                  to={`/analytics/${result.shortCode}`}
                  className="btn btn-ghost btn-sm"
                  style={{ color: '#818cf8', padding: '0.2rem 0.5rem' }}
                >
                  View Analytics &rarr;
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
        <div className="badge badge-primary" style={{ marginBottom: '1rem' }}>
          Engineered for Performance
        </div>
        <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
          Everything you need for link tracking
        </h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: '580px', margin: '0 auto 2.5rem' }}>
          Robust infrastructure with low-latency redirection, comprehensive analytics, and multi-user link isolation.
        </p>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon-wrapper" style={{ background: 'var(--cyan-light)', color: 'var(--cyan)' }}>
              <Zap size={22} />
            </div>
            <h3 className="feature-title">Lightning Fast</h3>
            <p className="feature-desc">
              Indexed MongoDB queries and optimized Express routing deliver instantaneous 302 redirects with sub-millisecond overhead.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
              <BarChart3 size={22} />
            </div>
            <h3 className="feature-title">Real-Time Analytics</h3>
            <p className="feature-desc">
              Track total clicks, filtered date ranges, and timestamped event logs for every generated short URL in real time.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper" style={{ background: 'var(--emerald-light)', color: 'var(--emerald)' }}>
              <ShieldCheck size={22} />
            </div>
            <h3 className="feature-title">Multi-User Security</h3>
            <p className="feature-desc">
              Protected by JWT Bearer authentication, bcrypt hashing, rate limiting, and strict per-user URL ownership isolation.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section style={{ maxWidth: '900px', margin: '4rem auto 2rem' }}>
        <div
          className="card"
          style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.08) 100%)',
            borderColor: 'rgba(99, 102, 241, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.5rem',
            padding: '2.25rem',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              Manage all your links in one dashboard
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Search, filter, paginate, edit aliases, and review aggregated click metrics.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to={isAuthenticated ? "/dashboard" : "/register"} className="btn btn-primary btn-lg">
              <span>{isAuthenticated ? "Go to Dashboard" : "Get Started Free"}</span>
              <ArrowRight size={18} />
            </Link>
            {!isAuthenticated && <div style={{ minWidth: '220px' }}><DemoLoginButton /></div>}
          </div>
        </div>
      </section>
    </div>
  );
}

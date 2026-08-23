import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, ArrowRight, Loader2, AlertCircle, Link2, Sparkles, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../services/api';

export default function RegisterPage() {
  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setError('Please enter your full name.');
      return;
    }

    if (!trimmedEmail) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      await register(trimmedName, trimmedEmail, password);
      addToast('Account created successfully! Welcome to Shortly.', 'success');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '440px', margin: '3rem auto', padding: '0 1rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: 'var(--radius-lg)',
            background: 'linear-gradient(135deg, var(--primary) 0%, #4f46e5 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
            boxShadow: 'var(--shadow-glow)',
            color: 'white',
          }}
        >
          <Link2 size={24} strokeWidth={2.5} />
        </div>
        <div className="hero-pill" style={{ marginBottom: '0.75rem', display: 'inline-flex' }}>
          <Sparkles size={13} />
          <span>Get Started Free</span>
        </div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
          Create your account
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem' }}>
          Start creating and tracking branded short links in seconds
        </p>
      </div>

      <div className="card" style={{ padding: '2rem' }}>
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
              marginBottom: '1.5rem',
              color: '#fda4af',
              fontSize: '0.875rem',
              textAlign: 'left',
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="register-name">
              <span>Full Name <span style={{ color: 'var(--rose)' }}>*</span></span>
            </label>
            <div className="input-with-icon">
              <User size={18} className="input-icon" />
              <input
                id="register-name"
                type="text"
                className="form-input"
                placeholder="Aryan Raj"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
                autoComplete="name"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-email">
              <span>Email Address <span style={{ color: 'var(--rose)' }}>*</span></span>
            </label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                id="register-email"
                type="email"
                className="form-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-password">
              <span>Password (min. 6 characters) <span style={{ color: 'var(--rose)' }}>*</span></span>
            </label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                id="register-password"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                autoComplete="new-password"
                minLength={6}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            <ShieldCheck size={15} color="#10b981" />
            <span>Passwords are salted & hashed with bcrypt.</span>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="spin" />
                <span>Creating account...</span>
              </>
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div
          style={{
            marginTop: '1.5rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--border-subtle)',
            textAlign: 'center',
            fontSize: '0.875rem',
            color: 'var(--text-muted)',
          }}
        >
          Already have an account?{' '}
          <Link
            to="/login"
            style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}
          >
            Log in here &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}

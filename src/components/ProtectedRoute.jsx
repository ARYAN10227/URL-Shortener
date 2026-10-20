import { useEffect, useRef, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/**
 * Guards private pages. Visitors who aren't signed in are signed in to the public
 * demo account automatically, so recruiters never have to fill in a login form.
 * Only if the demo login fails do we fall back to the login page.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, loginDemo } = useAuth();
  const location = useLocation();
  const [demoState, setDemoState] = useState('idle'); // idle | pending | failed
  const [slow, setSlow] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    if (loading || isAuthenticated || started.current) return;
    started.current = true;
    setDemoState('pending');
    const timer = setTimeout(() => setSlow(true), 4000);
    loginDemo()
      .catch(() => setDemoState('failed'))
      .finally(() => clearTimeout(timer));
    return () => clearTimeout(timer);
  }, [loading, isAuthenticated, loginDemo]);

  if (isAuthenticated) return children;

  if (demoState === 'failed') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: '1rem', textAlign: 'center', padding: '0 1rem' }}>
      <Loader2 size={36} className="spin" style={{ color: 'var(--primary)' }} />
      <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
        {loading ? 'Checking your session…' : 'Opening the demo account…'}
      </p>
      {slow && (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: 420 }}>
          Waking up the free backend server — the first visit can take up to a minute.
        </p>
      )}
    </div>
  );
}

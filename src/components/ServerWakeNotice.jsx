import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import apiService from '../services/api';

/**
 * The API runs on a free host that sleeps when idle. On page load we ping /health;
 * if it hasn't answered within 3 s, show a small banner until it wakes up.
 */
export default function ServerWakeNotice() {
  const [status, setStatus] = useState('checking'); // checking | waking | ready | down

  useEffect(() => {
    let active = true;
    const slowTimer = setTimeout(() => active && setStatus((s) => (s === 'checking' ? 'waking' : s)), 3000);
    apiService
      .getHealth()
      .then(() => active && setStatus('ready'))
      .catch(() => active && setStatus('down'))
      .finally(() => clearTimeout(slowTimer));
    return () => {
      active = false;
      clearTimeout(slowTimer);
    };
  }, []);

  if (status !== 'waking' && status !== 'down') return null;

  const waking = status === 'waking';
  return (
    <div
      role="status"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.6rem',
        padding: '0.6rem 1rem',
        fontSize: '0.85rem',
        background: waking ? 'rgba(99, 102, 241, 0.12)' : 'rgba(244, 63, 94, 0.12)',
        borderBottom: `1px solid ${waking ? 'rgba(99, 102, 241, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
        color: 'var(--text-muted)',
        textAlign: 'center',
      }}
    >
      {waking && <Loader2 size={16} className="spin" />}
      <span>
        {waking
          ? 'Waking up the free backend server — the first load can take up to a minute. Thanks for your patience!'
          : 'The backend server is not responding right now. Please refresh in a minute.'}
      </span>
    </div>
  );
}

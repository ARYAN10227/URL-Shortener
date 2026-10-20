import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, PlayCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../services/api';

/**
 * One-click login to the public demo account, so recruiters can try the app
 * without signing up. Shows a "waking up" hint if the free server is cold.
 */
export default function DemoLoginButton({ label = 'Try the live demo', size = 'lg', style }) {
  const { loginDemo } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [slow, setSlow] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const handleClick = async () => {
    setLoading(true);
    setSlow(false);
    timer.current = setTimeout(() => setSlow(true), 4000);
    try {
      await loginDemo();
      addToast('Logged in to the demo account. Explore away!', 'success');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      addToast(getErrorMessage(err), 'error');
    } finally {
      clearTimeout(timer.current);
      setLoading(false);
      setSlow(false);
    }
  };

  return (
    <div style={{ width: '100%', ...style }}>
      <button
        type="button"
        className={`btn btn-secondary btn-${size}`}
        style={{ width: '100%' }}
        onClick={handleClick}
        disabled={loading}
      >
        {loading ? <Loader2 size={18} className="spin" /> : <PlayCircle size={18} />}
        <span>{loading ? 'Opening demo…' : label}</span>
      </button>
      {slow && (
        <p style={{ marginTop: '0.6rem', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
          Waking up the free server — this first request can take up to a minute.
        </p>
      )}
    </div>
  );
}

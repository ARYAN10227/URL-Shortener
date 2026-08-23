import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function ToastContainer({ toasts, onRemove }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast toast-${toast.type}`}
          role="alert"
        >
          {toast.type === 'success' ? (
            <CheckCircle2 size={18} color="#10b981" />
          ) : (
            <AlertCircle size={18} color="#f43f5e" />
          )}
          <span style={{ flex: 1 }}>{toast.message}</span>
          <button
            onClick={() => onRemove(toast.id)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-dim)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '2px',
            }}
            aria-label="Close notification"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

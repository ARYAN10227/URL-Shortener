import { useState } from 'react';
import { Trash2, AlertTriangle, Loader2, X } from 'lucide-react';
import apiService, { getErrorMessage } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function DeleteConfirmModal({ urlItem, isOpen, onClose, onSuccess }) {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !urlItem) return null;

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      await apiService.deleteUrl(urlItem.shortCode);
      addToast(`Link "${urlItem.shortCode}" deleted successfully`, 'success');
      onSuccess(urlItem.shortCode);
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'var(--rose-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--rose)',
              }}
            >
              <Trash2 size={18} />
            </div>
            <h3 className="modal-title">Delete Short URL</h3>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>

        {error && (
          <div
            style={{
              background: 'var(--rose-light)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              marginBottom: '1rem',
              color: '#fda4af',
              fontSize: '0.875rem',
            }}
          >
            {error}
          </div>
        )}

        <div style={{ marginBottom: '1.5rem', color: 'var(--text-muted)', fontSize: '0.925rem', lineHeight: '1.6' }}>
          <p style={{ marginBottom: '0.75rem' }}>
            Are you sure you want to permanently delete <strong style={{ color: '#818cf8', fontFamily: 'var(--font-mono)' }}>/{urlItem.shortCode}</strong>?
          </p>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.6rem',
              background: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              color: '#fcd34d',
              fontSize: '0.825rem',
            }}
          >
            <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>
              This will also purge all associated click analytics ({urlItem.clicks || 0} clicks tracked). This action cannot be undone.
            </span>
          </div>
        </div>

        <div className="modal-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="spin" />
                Deleting...
              </>
            ) : (
              'Delete URL'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

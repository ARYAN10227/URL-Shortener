import { useState } from 'react';
import { X, Link as LinkIcon, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import apiService, { getErrorMessage } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function EditUrlModal({ urlItem, isOpen, onClose, onSuccess }) {
  const { addToast } = useToast();
  const [originalUrl, setOriginalUrl] = useState(urlItem?.originalUrl || '');
  const [shortCode, setShortCode] = useState(urlItem?.shortCode || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !urlItem) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const trimmedUrl = originalUrl.trim();
    const trimmedCode = shortCode.trim();

    if (!trimmedUrl && !trimmedCode) {
      setError('Please provide at least one field to update.');
      return;
    }

    const payload = {};
    if (trimmedUrl && trimmedUrl !== urlItem.originalUrl) {
      payload.originalUrl = trimmedUrl;
    }
    if (trimmedCode && trimmedCode !== urlItem.shortCode) {
      payload.shortCode = trimmedCode;
    }

    if (Object.keys(payload).length === 0) {
      onClose();
      return;
    }

    setLoading(true);
    try {
      const updated = await apiService.updateUrl(urlItem.shortCode, payload);
      addToast('URL updated successfully!', 'success');
      onSuccess(updated);
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
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'var(--primary-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)',
              }}
            >
              <LinkIcon size={16} />
            </div>
            <h3 className="modal-title">Edit Short Link</h3>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>

        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              background: 'var(--rose-light)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              marginBottom: '1.25rem',
              color: '#fda4af',
              fontSize: '0.875rem',
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="edit-original-url">
              Original Destination URL
            </label>
            <input
              id="edit-original-url"
              type="text"
              className="form-input"
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              placeholder="https://example.com/very-long-url"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="edit-short-code">
              <span>Custom Short Code</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                3-30 alphanumeric characters
              </span>
            </label>
            <div className="input-with-icon">
              <Sparkles size={16} className="input-icon" />
              <input
                id="edit-short-code"
                type="text"
                className="form-input"
                value={shortCode}
                onChange={(e) => setShortCode(e.target.value)}
                placeholder="custom-alias"
                disabled={loading}
              />
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
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

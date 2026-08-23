import { useState, useEffect, useMemo } from 'react';
import {
  X,
  MousePointerClick,
  Calendar,
  Clock,
  Link2,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  AlertCircle,
  Activity,
  Filter,
} from 'lucide-react';
import apiService, { getErrorMessage, buildShortUrl } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function AnalyticsModal({ shortCode, isOpen, onClose }) {
  const { addToast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Filters
  const [limit, setLimit] = useState(50);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useEffect(() => {
    let ignore = false;
    if (!shortCode || !isOpen) return;

    async function loadAnalytics() {
      setLoading(true);
      setError(null);

      try {
        const params = { limit };
        if (fromDate) params.from = new Date(fromDate).toISOString();
        if (toDate) params.to = new Date(toDate).toISOString();

        const result = await apiService.getUrlAnalytics(shortCode, params);
        if (!ignore) {
          setData(result);
        }
      } catch (err) {
        if (!ignore) {
          setError(getErrorMessage(err));
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadAnalytics();

    return () => {
      ignore = true;
    };
  }, [shortCode, isOpen, limit, fromDate, toDate, refreshTrigger]);

  const handleCopy = async () => {
    if (!shortCode) return;
    const urlToCopy = buildShortUrl(shortCode);
    try {
      await navigator.clipboard.writeText(urlToCopy);
      setCopied(true);
      addToast('Short link copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      addToast('Failed to copy to clipboard', 'error');
    }
  };

  const clicksByDay = useMemo(() => {
    if (!data?.clickHistory || data.clickHistory.length === 0) return [];

    const map = {};
    data.clickHistory.forEach((item) => {
      const day = new Date(item.clickedAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      });
      map[day] = (map[day] || 0) + 1;
    });

    const entries = Object.entries(map);
    const maxVal = Math.max(...entries.map(([, count]) => count), 1);

    return entries.map(([day, count]) => ({
      day,
      count,
      percentage: Math.round((count / maxVal) * 100),
    }));
  }, [data]);

  if (!isOpen || !shortCode) return null;

  const shortUrl = buildShortUrl(shortCode);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'var(--cyan-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--cyan)',
              }}
            >
              <Activity size={16} />
            </div>
            <div>
              <h3 className="modal-title" style={{ fontSize: '1.15rem' }}>URL Analytics</h3>
              <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                /{shortCode}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={() => setRefreshTrigger((prev) => prev + 1)}
              className="btn btn-secondary btn-sm"
              disabled={loading}
              title="Refresh"
            >
              <RefreshCw size={13} className={loading ? 'spin' : ''} />
            </button>
            <button className="modal-close" onClick={onClose} aria-label="Close dialog">
              <X size={18} />
            </button>
          </div>
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
              fontSize: '0.85rem',
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {loading && !data ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="skeleton" style={{ height: '60px', width: '100%' }}></div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
              <div className="skeleton" style={{ height: '70px' }}></div>
              <div className="skeleton" style={{ height: '70px' }}></div>
              <div className="skeleton" style={{ height: '70px' }}></div>
            </div>
            <div className="skeleton" style={{ height: '180px', width: '100%' }}></div>
          </div>
        ) : data ? (
          <div>
            {/* Header URL Details */}
            <div
              style={{
                background: 'var(--bg-input)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem 1rem',
                marginBottom: '1.25rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#38bdf8', fontSize: '0.925rem' }}>
                  {shortUrl}
                </span>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <button
                    onClick={handleCopy}
                    className={`btn btn-sm ${copied ? 'btn-secondary' : 'btn-primary'}`}
                    style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem' }}
                  >
                    {copied ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                  <a
                    href={shortUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem' }}
                  >
                    <ExternalLink size={12} />
                    <span>Open</span>
                  </a>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                <Link2 size={13} style={{ flexShrink: 0 }} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{data.originalUrl}</span>
              </div>
            </div>

            {/* Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '0.75rem', textAlign: 'center' }}>
                <div style={{ color: 'var(--primary)', marginBottom: '0.2rem', display: 'flex', justifyContent: 'center' }}>
                  <MousePointerClick size={18} />
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{data.clicks}</div>
                <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Total Clicks</div>
              </div>

              <div style={{ background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '0.75rem', textAlign: 'center' }}>
                <div style={{ color: 'var(--cyan)', marginBottom: '0.2rem', display: 'flex', justifyContent: 'center' }}>
                  <Activity size={18} />
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{data.filteredClicks ?? data.clicks}</div>
                <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Filtered Period</div>
              </div>

              <div style={{ background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '0.75rem', textAlign: 'center' }}>
                <div style={{ color: 'var(--emerald)', marginBottom: '0.2rem', display: 'flex', justifyContent: 'center' }}>
                  <Calendar size={18} />
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{data.clickHistory?.length || 0}</div>
                <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Events Logged</div>
              </div>
            </div>

            {/* Filter */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem', padding: '0.65rem 0.85rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
                <Filter size={13} color="var(--primary)" />
                <span>Filters:</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                <input
                  type="date"
                  className="form-input"
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', width: 'auto' }}
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
                <span style={{ color: 'var(--text-dim)' }}>to</span>
                <input
                  type="date"
                  className="form-input"
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', width: 'auto' }}
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
                <select
                  className="form-input"
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', width: 'auto' }}
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                >
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>

            {/* Visual Breakdown */}
            {clicksByDay.length > 0 && (
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Click Distribution</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                  {clicksByDay.slice(0, 5).map(({ day, count, percentage }) => (
                    <div key={day}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.775rem', marginBottom: '0.2rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>{day}</span>
                        <span style={{ fontWeight: 600 }}>{count} {count === 1 ? 'click' : 'clicks'}</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', background: 'var(--bg-input)', borderRadius: '9999px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${percentage}%`,
                            height: '100%',
                            background: 'linear-gradient(90deg, var(--primary), var(--secondary))',
                            borderRadius: '9999px',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Click Event Log */}
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Recent Click Events</div>
              {!data.clickHistory || data.clickHistory.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-dim)', fontSize: '0.825rem' }}>
                  <Clock size={20} style={{ margin: '0 auto 0.35rem', opacity: 0.5 }} />
                  <div>No clicks recorded in this period</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '200px', overflowY: 'auto' }}>
                  {data.clickHistory.map((item, idx) => {
                    const clickDate = new Date(item.clickedAt);
                    return (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          background: 'var(--bg-input)',
                          padding: '0.45rem 0.75rem',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.8rem',
                          border: '1px solid var(--border-subtle)',
                        }}
                      >
                        <span style={{ fontFamily: 'var(--font-mono)', color: '#818cf8' }}>
                          {clickDate.toLocaleTimeString()}
                        </span>
                        <span style={{ color: 'var(--text-dim)' }}>
                          {clickDate.toLocaleDateString()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

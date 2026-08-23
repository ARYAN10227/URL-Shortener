import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
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
  Edit,
  Trash2,
  Filter,
} from 'lucide-react';
import apiService, { getErrorMessage, buildShortUrl } from '../services/api';
import { useToast } from '../context/ToastContext';
import EditUrlModal from '../components/EditUrlModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

export default function AnalyticsPage() {
  const { shortCode } = useParams();
  const navigate = useNavigate();
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

  // Modals
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);

  useEffect(() => {
    let ignore = false;
    if (!shortCode) return;

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
  }, [shortCode, limit, fromDate, toDate, refreshTrigger]);

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

  // Group clicks by day for visual CSS bar chart
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

  const shortUrl = buildShortUrl(shortCode);

  return (
    <div className="analytics-page">
      {/* Top Nav Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <Link
          to="/dashboard"
          className="btn btn-secondary btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => setRefreshTrigger((prev) => prev + 1)}
            className="btn btn-secondary btn-sm"
            disabled={loading}
            title="Refresh analytics data"
          >
            <RefreshCw size={15} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>

          {data && (
            <>
              <button
                onClick={() => setEditItem(data)}
                className="btn btn-secondary btn-sm"
              >
                <Edit size={15} />
                <span>Edit</span>
              </button>
              <button
                onClick={() => setDeleteItem(data)}
                className="btn btn-danger btn-sm"
              >
                <Trash2 size={15} />
                <span>Delete</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div
          className="card"
          style={{
            background: 'var(--rose-light)',
            borderColor: 'rgba(244, 63, 94, 0.3)',
            color: '#fda4af',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertCircle size={22} style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 600, fontSize: '1rem' }}>Failed to load analytics</div>
              <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>{error}</div>
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => setRefreshTrigger((prev) => prev + 1)}>
            Retry
          </button>
        </div>
      )}

      {loading && !data ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="skeleton" style={{ height: '140px', width: '100%' }}></div>
          <div className="stats-grid">
            <div className="skeleton" style={{ height: '100px' }}></div>
            <div className="skeleton" style={{ height: '100px' }}></div>
            <div className="skeleton" style={{ height: '100px' }}></div>
          </div>
          <div className="skeleton" style={{ height: '300px', width: '100%' }}></div>
        </div>
      ) : data ? (
        <>
          {/* Header Card with Short Link & Destination */}
          <div className="card" style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
                  <span className="badge badge-primary" style={{ fontSize: '0.85rem' }}>
                    /{data.shortCode}
                  </span>
                  <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                    Created on {new Date(data.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>

                <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-main)', wordBreak: 'break-all', marginBottom: '0.5rem' }}>
                  {shortUrl}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  <Link2 size={15} />
                  <span>Destination:</span>
                  <a
                    href={data.originalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#38bdf8', textDecoration: 'none', wordBreak: 'break-all' }}
                  >
                    {data.originalUrl}
                  </a>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <button
                  onClick={handleCopy}
                  className={`btn btn-sm ${copied ? 'btn-secondary' : 'btn-primary'}`}
                  style={{ minWidth: '95px' }}
                >
                  {copied ? (
                    <>
                      <Check size={14} color="#10b981" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
                <a
                  href={shortUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm"
                >
                  <ExternalLink size={14} />
                  <span>Visit Link</span>
                </a>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                <MousePointerClick size={24} />
              </div>
              <div>
                <div className="stat-val">{data.clicks}</div>
                <div className="stat-label">Total Lifetime Clicks</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'var(--cyan-light)', color: 'var(--cyan)' }}>
                <Activity size={24} />
              </div>
              <div>
                <div className="stat-val">{data.filteredClicks ?? data.clicks}</div>
                <div className="stat-label">Filtered Period Clicks</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'var(--emerald-light)', color: 'var(--emerald)' }}>
                <Calendar size={24} />
              </div>
              <div>
                <div className="stat-val">
                  {data.clickHistory?.length || 0}
                </div>
                <div className="stat-label">Logs Retrieved</div>
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="card" style={{ padding: '1.25rem 1.5rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
                <Filter size={16} color="var(--primary)" />
                <span>Date Range Filter</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <label htmlFor="analytics-from" style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>From:</label>
                  <input
                    id="analytics-from"
                    type="date"
                    className="form-input"
                    style={{ padding: '0.4rem 0.65rem', fontSize: '0.85rem' }}
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <label htmlFor="analytics-to" style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>To:</label>
                  <input
                    id="analytics-to"
                    type="date"
                    className="form-input"
                    style={{ padding: '0.4rem 0.65rem', fontSize: '0.85rem' }}
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <label htmlFor="analytics-limit" style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>Limit:</label>
                  <select
                    id="analytics-limit"
                    className="form-input"
                    style={{ padding: '0.4rem 0.65rem', fontSize: '0.85rem', width: 'auto' }}
                    value={limit}
                    onChange={(e) => setLimit(Number(e.target.value))}
                  >
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>

                {(fromDate || toDate) && (
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => {
                      setFromDate('');
                      setToDate('');
                    }}
                  >
                    Clear Filter
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Activity Breakdown & Click History */}
          <div style={{ display: 'grid', gridTemplateColumns: clicksByDay.length > 0 ? 'repeat(auto-fit, minmax(340px, 1fr))' : '1fr', gap: '1.5rem', marginBottom: '2rem' }}>
            {/* Visual Bar Distribution */}
            {clicksByDay.length > 0 && (
              <div className="card">
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>
                  Activity Breakdown
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {clicksByDay.map(({ day, count, percentage }) => (
                    <div key={day}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>{day}</span>
                        <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{count} {count === 1 ? 'click' : 'clicks'}</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', background: 'var(--bg-input)', borderRadius: '9999px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${percentage}%`,
                            height: '100%',
                            background: 'linear-gradient(90deg, var(--primary), var(--secondary))',
                            borderRadius: '9999px',
                            transition: 'width 0.4s ease-out',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Click History Log */}
            <div className="card">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Click Event Log</span>
                <span className="badge badge-primary">
                  {data.clickHistory?.length || 0} Recent Events
                </span>
              </h3>

              {!data.clickHistory || data.clickHistory.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-dim)' }}>
                  <Clock size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.6 }} />
                  <p style={{ fontSize: '0.9rem', fontWeight: 500 }}>No click events logged yet</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Share your short link to start seeing live analytics events.
                  </p>
                </div>
              ) : (
                <div className="timeline-list">
                  {data.clickHistory.map((item, idx) => {
                    const clickDate = new Date(item.clickedAt);
                    return (
                      <div key={idx} className="timeline-item">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <div
                            style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              background: 'var(--primary)',
                            }}
                          />
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                            {clickDate.toLocaleTimeString()}
                          </span>
                        </div>
                        <span style={{ color: 'var(--text-dim)', fontSize: '0.825rem' }}>
                          {clickDate.toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      ) : null}

      {/* Edit Modal */}
      {editItem && (
        <EditUrlModal
          urlItem={editItem}
          isOpen={Boolean(editItem)}
          onClose={() => setEditItem(null)}
          onSuccess={(updated) => {
            setData((prev) => ({
              ...prev,
              ...updated,
            }));
            if (updated.shortCode !== shortCode) {
              navigate(`/analytics/${updated.shortCode}`, { replace: true });
            } else {
              setRefreshTrigger((prev) => prev + 1);
            }
          }}
        />
      )}

      {/* Delete Modal */}
      {deleteItem && (
        <DeleteConfirmModal
          urlItem={deleteItem}
          isOpen={Boolean(deleteItem)}
          onClose={() => setDeleteItem(null)}
          onSuccess={() => {
            navigate('/dashboard');
          }}
        />
      )}
    </div>
  );
}

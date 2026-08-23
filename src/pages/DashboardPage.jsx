import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Link2,
  MousePointerClick,
  Plus,
  Search,
  RefreshCw,
  ExternalLink,
  Copy,
  BarChart2,
  Edit,
  Trash2,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Inbox,
  AlertCircle,
  Clock,
  Check,
  Sparkles,
  ArrowRight,
  Loader2,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';
import apiService, { getErrorMessage, buildShortUrl } from '../services/api';
import { useToast } from '../context/ToastContext';
import EditUrlModal from '../components/EditUrlModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import AnalyticsModal from '../components/AnalyticsModal';

export default function DashboardPage() {
  const { addToast } = useToast();

  // Create Form State
  const [originalUrl, setOriginalUrl] = useState('');
  const [shortCode, setShortCode] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [createResult, setCreateResult] = useState(null);
  const [copiedCreateUrl, setCopiedCreateUrl] = useState(false);

  // Table & Data State
  const [urls, setUrls] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  const [minClicks, setMinClicks] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Modals state
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [analyticsCode, setAnalyticsCode] = useState(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Load URLs
  useEffect(() => {
    let ignore = false;

    async function loadUrls() {
      setLoading(true);
      setError(null);

      try {
        const params = {
          page: pagination.page,
          limit: pagination.limit,
          sortBy,
          order,
        };

        if (debouncedSearch.trim()) {
          params.search = debouncedSearch.trim();
        }

        if (minClicks !== '' && !isNaN(Number(minClicks))) {
          params.minClicks = Number(minClicks);
        }

        const data = await apiService.getUrls(params);
        if (!ignore) {
          setUrls(data.urls || []);
          if (data.pagination) {
            setPagination((prev) => ({
              ...prev,
              ...data.pagination,
            }));
          }
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

    loadUrls();

    return () => {
      ignore = true;
    };
  }, [pagination.page, pagination.limit, sortBy, order, debouncedSearch, minClicks, refreshTrigger]);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateError(null);
    setCreateResult(null);

    const trimmedUrl = originalUrl.trim();
    if (!trimmedUrl) {
      setCreateError('Please enter a valid destination URL.');
      return;
    }

    setCreateLoading(true);
    try {
      const data = await apiService.shortenUrl({
        originalUrl: trimmedUrl,
        shortCode: shortCode.trim() || undefined,
      });

      setCreateResult(data);
      addToast('Short URL created successfully!', 'success');
      // Refresh list to include new URL
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      setCreateError(getErrorMessage(err));
    } finally {
      setCreateLoading(false);
    }
  };

  const handleCopyCreated = async () => {
    if (!createResult) return;
    const urlToCopy = createResult.shortUrl || buildShortUrl(createResult.shortCode);
    try {
      await navigator.clipboard.writeText(urlToCopy);
      setCopiedCreateUrl(true);
      addToast('Copied short URL to clipboard!', 'success');
      setTimeout(() => setCopiedCreateUrl(false), 2500);
    } catch {
      addToast('Failed to copy to clipboard', 'error');
    }
  };

  const handleResetCreate = () => {
    setOriginalUrl('');
    setShortCode('');
    setCreateError(null);
    setCreateResult(null);
  };

  const handleCopy = async (code, fullUrl) => {
    const textToCopy = fullUrl || buildShortUrl(code);
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedCode(code);
      addToast(`Copied /${code} to clipboard!`, 'success');
      setTimeout(() => setCopiedCode(null), 2500);
    } catch {
      addToast('Failed to copy to clipboard', 'error');
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  const totalClicksCount = urls.reduce((acc, curr) => acc + (curr.clicks || 0), 0);

  return (
    <div className="dashboard-page">
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <div className="badge badge-primary" style={{ marginBottom: '0.4rem' }}>
            URL Shortener Dashboard
          </div>
          <h1 style={{ fontSize: '1.95rem', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 0.35rem' }}>
            Link Management & Analytics
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem' }}>
            Generate short URLs, track real-time click volume, and manage redirection aliases.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => setRefreshTrigger((prev) => prev + 1)}
            className="btn btn-secondary btn-sm"
            disabled={loading}
            title="Refresh URL list"
          >
            <RefreshCw size={15} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* URL Shortener Creation Box on Dashboard */}
      <div className="card" style={{ marginBottom: '2.5rem', background: 'linear-gradient(135deg, rgba(17, 22, 34, 0.95) 0%, rgba(30, 41, 59, 0.4) 100%)', borderColor: 'rgba(99, 102, 241, 0.25)' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={18} color="var(--primary)" />
          <span>Create Short URL</span>
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
          Paste your target destination URL below to generate a trackable short link.
        </p>

        {!createResult ? (
          <form onSubmit={handleCreateSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="dash-orig-url">
                  <span>Destination URL <span style={{ color: 'var(--rose)' }}>*</span></span>
                </label>
                <div className="input-with-icon">
                  <Link2 size={16} className="input-icon" />
                  <input
                    id="dash-orig-url"
                    type="text"
                    className="form-input"
                    placeholder="https://example.com/very-long-url-path..."
                    value={originalUrl}
                    onChange={(e) => setOriginalUrl(e.target.value)}
                    required
                    disabled={createLoading}
                    autoComplete="off"
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="dash-short-code">
                  <span>Custom Short Code (Optional)</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>3-30 chars</span>
                </label>
                <div className="input-with-icon">
                  <Sparkles size={16} className="input-icon" />
                  <input
                    id="dash-short-code"
                    type="text"
                    className="form-input"
                    placeholder="e.g. promo2026"
                    value={shortCode}
                    onChange={(e) => setShortCode(e.target.value)}
                    disabled={createLoading}
                    autoComplete="off"
                  />
                </div>
              </div>
            </div>

            {createError && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  background: 'var(--rose-light)',
                  border: '1px solid rgba(244, 63, 94, 0.35)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.75rem 1rem',
                  marginBottom: '1rem',
                  color: '#fda4af',
                  fontSize: '0.85rem',
                }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{createError}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={createLoading || !originalUrl.trim()}
              >
                {createLoading ? (
                  <>
                    <Loader2 size={16} className="spin" />
                    <span>Creating Short URL...</span>
                  </>
                ) : (
                  <>
                    <span>Create Short URL</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="result-card" style={{ marginTop: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6ee7b7', fontWeight: 600, fontSize: '0.9rem' }}>
                <CheckCircle2 size={17} />
                <span>Short URL generated successfully!</span>
              </div>
              <button
                type="button"
                onClick={handleResetCreate}
                className="btn btn-ghost btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem' }}
              >
                <RotateCcw size={13} />
                <span>Create another</span>
              </button>
            </div>

            <div className="result-url-display">
              <span style={{ fontWeight: 600 }}>
                {createResult.shortUrl || buildShortUrl(createResult.shortCode)}
              </span>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button
                  type="button"
                  onClick={handleCopyCreated}
                  className={`btn btn-sm ${copiedCreateUrl ? 'btn-secondary' : 'btn-primary'}`}
                  style={{ minWidth: '80px', padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
                >
                  {copiedCreateUrl ? (
                    <>
                      <Check size={13} color="#10b981" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
                <a
                  href={createResult.shortUrl || buildShortUrl(createResult.shortCode)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
                >
                  <ExternalLink size={13} />
                  <span>Open</span>
                </a>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '400px' }}>
                Original: <span style={{ color: 'var(--text-main)' }}>{createResult.originalUrl}</span>
              </div>
              <Link
                to={`/analytics/${createResult.shortCode}`}
                className="btn btn-ghost btn-sm"
                style={{ color: '#818cf8', padding: '0.2rem 0.4rem', textDecoration: 'none' }}
              >
                View Analytics &rarr;
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Summary Stat Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
            <Link2 size={24} />
          </div>
          <div>
            <div className="stat-val">{pagination.total}</div>
            <div className="stat-label">Total Short URLs</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--cyan-light)', color: 'var(--cyan)' }}>
            <MousePointerClick size={24} />
          </div>
          <div>
            <div className="stat-val">{totalClicksCount}</div>
            <div className="stat-label">Clicks in Current View</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--emerald-light)', color: 'var(--emerald)' }}>
            <BarChart2 size={24} />
          </div>
          <div>
            <div className="stat-val">
              {urls.length > 0 ? (totalClicksCount / urls.length).toFixed(1) : '0'}
            </div>
            <div className="stat-label">Avg Clicks / Link</div>
          </div>
        </div>
      </div>

      {/* Table Toolbar (Search, Filter, Sort) */}
      <div className="table-toolbar">
        <div style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
          <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.5rem', fontSize: '0.875rem' }}
            placeholder="Search by code or original URL..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="table-toolbar-right">
          {/* Min Clicks Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>Min Clicks:</span>
            <input
              type="number"
              min="0"
              placeholder="0"
              className="form-input"
              style={{ width: '75px', padding: '0.45rem 0.65rem', fontSize: '0.85rem' }}
              value={minClicks}
              onChange={(e) => {
                setMinClicks(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
            />
          </div>

          {/* Sort By */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>Sort by:</span>
            <select
              className="form-input"
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem', width: 'auto', cursor: 'pointer' }}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="createdAt">Date Created</option>
              <option value="clicks">Click Count</option>
              <option value="shortCode">Short Code</option>
              <option value="originalUrl">Original URL</option>
            </select>
          </div>

          {/* Order */}
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setOrder(order === 'asc' ? 'desc' : 'asc')}
            title={`Sort Order: ${order.toUpperCase()}`}
          >
            <ArrowUpDown size={14} />
            <span>{order.toUpperCase()}</span>
          </button>
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
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.25rem 1.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertCircle size={20} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => setRefreshTrigger((prev) => prev + 1)}>
            Retry
          </button>
        </div>
      )}

      {/* Main Table Content */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Short Code</th>
              <th>Original URL</th>
              <th>Clicks</th>
              <th>Created</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              // Skeleton rows
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  <td><div className="skeleton" style={{ height: '20px', width: '90px' }}></div></td>
                  <td><div className="skeleton" style={{ height: '20px', width: '240px' }}></div></td>
                  <td><div className="skeleton" style={{ height: '20px', width: '40px' }}></div></td>
                  <td><div className="skeleton" style={{ height: '20px', width: '80px' }}></div></td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="skeleton" style={{ height: '24px', width: '120px', marginLeft: 'auto' }}></div>
                  </td>
                </tr>
              ))
            ) : urls.length === 0 ? (
              <tr>
                <td colSpan="5">
                  <div className="empty-state">
                    <div className="empty-icon-wrapper">
                      <Inbox size={28} />
                    </div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-main)' }}>
                      No short URLs found
                    </h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                      {debouncedSearch || minClicks
                        ? 'Try clearing your search query or click filter.'
                        : 'Create your first short URL using the form above to start tracking clicks.'}
                    </p>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        document.getElementById('dash-orig-url')?.focus();
                      }}
                    >
                      <Plus size={15} />
                      <span>Create Short URL</span>
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              urls.map((item) => {
                const shortUrl = buildShortUrl(item.shortCode);
                const isCopied = copiedCode === item.shortCode;

                return (
                  <tr key={item._id || item.shortCode}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className="url-code-cell">/{item.shortCode}</span>
                      </div>
                    </td>

                    <td>
                      <div className="original-url-cell" title={item.originalUrl}>
                        {item.originalUrl}
                      </div>
                    </td>

                    <td>
                      <span className={`badge ${item.clicks > 0 ? 'badge-primary' : 'badge-amber'}`}>
                        {item.clicks} {item.clicks === 1 ? 'click' : 'clicks'}
                      </span>
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.825rem' }}>
                        <Clock size={13} />
                        <span>
                          {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </td>

                    <td>
                      <div className="action-buttons" style={{ justifyContent: 'flex-end' }}>
                        <button
                          className="btn-table-action"
                          onClick={() => handleCopy(item.shortCode, shortUrl)}
                          title="Copy short link"
                          aria-label="Copy short link"
                        >
                          {isCopied ? <Check size={15} color="#10b981" /> : <Copy size={15} />}
                        </button>

                        <a
                          href={shortUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-table-action"
                          title="Open short link in new tab"
                          aria-label="Open short link"
                        >
                          <ExternalLink size={15} />
                        </a>

                        <Link
                          to={`/analytics/${item.shortCode}`}
                          className="btn-table-action"
                          title="View detailed analytics"
                          aria-label="View detailed analytics"
                        >
                          <BarChart2 size={15} />
                        </Link>

                        <button
                          className="btn-table-action"
                          onClick={() => setEditItem(item)}
                          title="Edit URL destination or code"
                          aria-label="Edit URL"
                        >
                          <Edit size={15} />
                        </button>

                        <button
                          className="btn-table-action delete"
                          onClick={() => setDeleteItem(item)}
                          title="Delete short link"
                          aria-label="Delete short link"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Pagination Footer */}
        {pagination.totalPages > 1 && (
          <div className="pagination-container">
            <div>
              Showing page <strong style={{ color: 'var(--text-main)' }}>{pagination.page}</strong> of{' '}
              <strong style={{ color: 'var(--text-main)' }}>{pagination.totalPages}</strong> ({pagination.total} total links)
            </div>

            <div className="pagination-controls">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1 || loading}
              >
                <ChevronLeft size={16} />
                <span>Prev</span>
              </button>

              <button
                className="btn btn-secondary btn-sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages || loading}
              >
                <span>Next</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quick Analytics Modal */}
      {analyticsCode && (
        <AnalyticsModal
          shortCode={analyticsCode}
          isOpen={Boolean(analyticsCode)}
          onClose={() => setAnalyticsCode(null)}
        />
      )}

      {/* Edit Modal */}
      {editItem && (
        <EditUrlModal
          urlItem={editItem}
          isOpen={Boolean(editItem)}
          onClose={() => setEditItem(null)}
          onSuccess={() => setRefreshTrigger((prev) => prev + 1)}
        />
      )}

      {/* Delete Modal */}
      {deleteItem && (
        <DeleteConfirmModal
          urlItem={deleteItem}
          isOpen={Boolean(deleteItem)}
          onClose={() => setDeleteItem(null)}
          onSuccess={() => setRefreshTrigger((prev) => prev + 1)}
        />
      )}
    </div>
  );
}

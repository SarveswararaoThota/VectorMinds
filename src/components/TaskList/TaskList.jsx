import React, { useState, useEffect, useCallback } from 'react';
import { customerAPI, approvalAPI } from '../../api';
import ApprovedCustomerScreen from './ApprovedCustomerScreen';
import RejectedCustomerScreen from './RejectedCustomerScreen';
import './TaskList.css';

/* ════════════════════════════════════════
   CONSTANTS
   ════════════════════════════════════════ */
const S3_API_URL = 'https://2ry5cdvd77.execute-api.ap-south-1.amazonaws.com/Prod/api';

/* ════════════════════════════════════════
   STATUS NORMALIZER
   ════════════════════════════════════════ */
function normalizeStatus(raw) {
  if (!raw) return 'PENDING';
  const s = String(raw).toUpperCase().trim();
  if (s === 'APPROVED') return 'Approved';
  if (s === 'REJECTED') return 'Rejected';
  return 'PENDING';
}

/* ════════════════════════════════════════
   ICONS
   ════════════════════════════════════════ */
const Icons = {
  ArrowLeft: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>
    </svg>
  ),
  RefreshCw: ({ spin }) => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ animation: spin ? 'tl-spin 0.8s linear infinite' : 'none' }}>
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
      <path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
      <path d="M8 16H3v5"/>
    </svg>
  ),
  Search: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
    </svg>
  ),
  X: ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  Check: ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  CheckCircle: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>
    </svg>
  ),
  XCircle: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
    </svg>
  ),
  Clock: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  Users: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  User: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
    </svg>
  ),
  AlertCircle: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
  FileText: () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  ),
  MessageSquare: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  ThumbsUp: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/>
      <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
    </svg>
  ),
  ThumbsDown: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z"/>
      <path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/>
    </svg>
  ),
  ShieldCheck: () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/>
    </svg>
  ),
  ShieldX: () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      <line x1="9.5" y1="9.5" x2="14.5" y2="14.5"/><line x1="14.5" y1="9.5" x2="9.5" y2="14.5"/>
    </svg>
  ),
  ClipboardList: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
      <line x1="12" y1="11" x2="16" y2="11"/><line x1="12" y1="16" x2="16" y2="16"/>
      <line x1="8" y1="11" x2="8.01" y2="11"/><line x1="8" y1="16" x2="8.01" y2="16"/>
    </svg>
  ),
};

/* ════════════════════════════════════════
   PHOTO URL RESOLVER
   ════════════════════════════════════════ */
function resolveCustomerPhotoUrl(customer, type = 'PHOTO') {
  const attachments = customer.attachments || customer.documents || [];
  if (!Array.isArray(attachments) || attachments.length === 0) return null;
  const photo = attachments.find(a => {
    const docType = (a.documentType || a.document_type || '').toUpperCase();
    return docType === type;
  });
  if (!photo) return null;
  const filename = photo.filePath || photo.file_path || photo.fileName || photo.file_name || null;
  if (!filename) return null;
  const cleanFilename = filename.includes('/') ? filename.split('/').pop() : filename;
  return `${S3_API_URL}/getFileS3/${customer.id}/${cleanFilename}`;
}

/* ════════════════════════════════════════
   SAFE IMAGE
   ════════════════════════════════════════ */
function SafeImage({ src, alt, className, style, onError }) {
  const [retryCount, setRetryCount] = useState(0);
  const [failed, setFailed] = useState(false);

  const handleError = (e) => {
    if (retryCount < 2) {
      setRetryCount(c => c + 1);
      e.target.src = `${src}?retry=${retryCount}&t=${Date.now()}`;
    } else {
      setFailed(true);
      if (onError) onError(e);
    }
  };

  if (failed || !src) return null;
  return (
    <img src={src} alt={alt} className={className} style={style}
      onError={handleError} crossOrigin="anonymous" loading="lazy" />
  );
}

/* ════════════════════════════════════════
   AVATAR
   ════════════════════════════════════════ */
function Avatar({ firstName, lastName, photoUrl, size = 36, onError }) {
  const initials = `${(firstName || '?').charAt(0)}${(lastName || '').charAt(0)}`.toUpperCase();
  const colors = ['#6366f1','#8b5cf6','#ec4899','#f59e0b','#10b981','#3b82f6','#ef4444','#14b8a6'];
  const colorIdx = (firstName?.charCodeAt(0) || 0) % colors.length;
  const bg = colors[colorIdx];

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <SafeImage
        src={photoUrl}
        alt={`${firstName} ${lastName}`}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }}
        onError={onError}
      />
      <div style={{
        width: size, height: size, borderRadius: '50%', background: bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.35, fontWeight: 600, color: '#fff', letterSpacing: 0.5,
      }}>
        {initials}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   STATUS BADGE
   ════════════════════════════════════════ */
function StatusBadge({ status }) {
  const cfg = {
    Approved: { bg: '#dcfce7', color: '#15803d', dot: '#22c55e', icon: <Icons.CheckCircle /> },
    Rejected: { bg: '#fee2e2', color: '#b91c1c', dot: '#ef4444', icon: <Icons.XCircle /> },
    PENDING:  { bg: '#fef9c3', color: '#a16207', dot: '#eab308', icon: <Icons.Clock /> },
  }[status] || { bg: '#fef9c3', color: '#a16207', dot: '#eab308', icon: <Icons.Clock /> };

  return (
    <span className="tl-badge" style={{ background: cfg.bg, color: cfg.color }}>
      <span className="tl-badge-dot" style={{ background: cfg.dot }} />
      {status === 'PENDING' ? 'Pending' : status}
    </span>
  );
}

/* ════════════════════════════════════════
   CONFIRM MODAL
   ════════════════════════════════════════ */
function ConfirmModal({ type, member, onConfirm, onCancel, loading, photoUrl }) {
  const [comment, setComment] = useState('');
  const [commentError, setCommentError] = useState('');
  const isApprove = type === 'approve';

  const firstName = member?.first_name || member?.firstName || '';
  const lastName  = member?.last_name  || member?.lastName  || '';
  const fullName  = [firstName, lastName].filter(Boolean).join(' ') || `Customer ${member?.id}`;

  return (
    <div className="tl-overlay" onClick={onCancel}>
      <div className="tl-modal" onClick={e => e.stopPropagation()}>
        <div className={`tl-modal-header ${isApprove ? 'tl-modal-header-approve' : 'tl-modal-header-reject'}`}>
          <div className="tl-modal-icon-wrap">
            {isApprove ? <Icons.ShieldCheck /> : <Icons.ShieldX />}
          </div>
          <h2 className="tl-modal-title">{isApprove ? 'Approve Member' : 'Reject Member'}</h2>
          <p className="tl-modal-subtitle">
            {isApprove ? 'This will activate the membership account.' : 'This action requires a reason.'}
          </p>
        </div>

        <div className="tl-modal-body">
          <div className="tl-modal-member">
            <Avatar firstName={firstName} lastName={lastName} photoUrl={photoUrl} size={48} />
            <div className="tl-modal-member-info">
              <span className="tl-modal-member-name">{fullName}</span>
              <span className="tl-modal-member-id">ID: {member?.id}</span>
            </div>
          </div>

          {!isApprove && (
            <div className="tl-modal-field">
              <label className="tl-modal-label">
                Reason for rejection <span className="tl-req">*</span>
              </label>
              <textarea
                className={`tl-modal-textarea${commentError ? ' tl-textarea-err' : ''}`}
                placeholder="Describe why this application is being rejected…"
                rows={3}
                value={comment}
                onChange={e => { setComment(e.target.value); setCommentError(''); }}
              />
              {commentError && (
                <span className="tl-field-err">
                  <Icons.AlertCircle /> {commentError}
                </span>
              )}
            </div>
          )}

          <div className="tl-modal-actions">
            <button className="tl-btn tl-btn-ghost" onClick={onCancel} disabled={loading}>
              Cancel
            </button>
            <button
              className={`tl-btn ${isApprove ? 'tl-btn-approve' : 'tl-btn-reject'}`}
              onClick={() => {
                if (!isApprove && !comment.trim()) {
                  setCommentError('A reason is required to reject.');
                  return;
                }
                onConfirm(comment.trim());
              }}
              disabled={loading}
            >
              {loading ? (
                <><span className="tl-spinner-sm" />{isApprove ? 'Approving…' : 'Rejecting…'}</>
              ) : isApprove ? (
                <><Icons.Check size={14} /> Yes, Approve</>
              ) : (
                <><Icons.X size={14} /> Yes, Reject</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   STAT CARD
   ════════════════════════════════════════ */
function StatCard({ label, count, active, onClick, accent, Icon }) {
  return (
    <button className={`tl-stat${active ? ' tl-stat-active' : ''}`} onClick={onClick}
      style={{ '--accent': accent }}>
      <div className="tl-stat-icon" style={{ background: accent + '18', color: accent }}>
        <Icon />
      </div>
      <div className="tl-stat-body">
        <span className="tl-stat-count" style={{ color: accent }}>{count}</span>
        <span className="tl-stat-label">{label}</span>
      </div>
      {active && <div className="tl-stat-bar" style={{ background: accent }} />}
    </button>
  );
}

/* ════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════ */
export default function TaskList({ onBack, currentUser, onActionComplete }) {
  const [data,             setData]             = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [fetchError,       setFetchError]       = useState('');
  const [search,           setSearch]           = useState('');
  const [filterStatus,     setFilterStatus]     = useState('All');
  const [modal,            setModal]            = useState(null);
  const [actionLoading,    setActionLoading]    = useState(false);
  const [toast,            setToast]            = useState(null);
  const [photoUrls,        setPhotoUrls]        = useState({});
  const [signatureUrls,    setSignatureUrls]    = useState({});
  const [failedImages,     setFailedImages]     = useState({});
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showPhoto,        setShowPhoto]        = useState({}); // NEW
  const [showSignature,    setShowSignature]    = useState({}); // NEW

  /* ── fetch ── */
  const fetchData = useCallback(async () => {
    setLoading(true);
    setFetchError('');
    try {
      const userId = currentUser?.id ?? currentUser?.userId ?? 1;
      const res    = await customerAPI.getAll(userId);
      const list   = Array.isArray(res?.result) ? res.result
                   : Array.isArray(res)         ? res
                   : Array.isArray(res?.data)   ? res.data
                   : [];
      setData(list);

      const photoMap = {};
      const signatureMap = {};
      list.forEach(c => {
        const photo = resolveCustomerPhotoUrl(c, 'PHOTO');
        if (photo) photoMap[c.id] = photo;
        const signature = resolveCustomerPhotoUrl(c, 'SIGNATURE');
        if (signature) signatureMap[c.id] = signature;
      });
      setPhotoUrls(photoMap);
      setSignatureUrls(signatureMap);
      setFailedImages({});
    } catch (err) {
      console.error('Fetch error:', err);
      setFetchError('Failed to load applications. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => { fetchData(); }, [fetchData]);

  /* ── toast ── */
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  /* ── local update ── */
  const updateLocal = (id, status, comment = null) => {
    setData(prev => prev.map(c => c.id === id
      ? { ...c, approval_status: status, ...(comment ? { comments: comment } : {}) }
      : c
    ));
  };

  /* ── confirm action ── */
  const handleConfirm = async (comment) => {
    const { type, member } = modal;
    const userId   = currentUser?.id ?? currentUser?.userId ?? 1;
    const branchId = currentUser?.branchId ?? currentUser?.branch_id ?? null;
    setActionLoading(true);

    try {
      const fn   = member?.first_name || member?.firstName || '';
      const ln   = member?.last_name  || member?.lastName  || '';
      const name = [fn, ln].filter(Boolean).join(' ') || `Customer ${member.id}`;

      if (type === 'approve') {
        await approvalAPI.approve(member.id, userId);
        updateLocal(member.id, 'Approved');
        showToast(`${name} approved successfully`, 'success');
      } else {
        await approvalAPI.reject(member.id, userId, comment);
        updateLocal(member.id, 'Rejected', comment);
        showToast(`${name} rejected`, 'error');
      }

      setModal(null);
      if (onActionComplete) onActionComplete();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Action failed. Please try again.';
      showToast(msg, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  /* ── derived ── */
  const fmt = d => d
    ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

  const counts = {
    All:      data.length,
    Pending:  data.filter(r => normalizeStatus(r.approval_status) === 'PENDING').length,
    Approved: data.filter(r => normalizeStatus(r.approval_status) === 'Approved').length,
    Rejected: data.filter(r => normalizeStatus(r.approval_status) === 'Rejected').length,
  };

  const filtered = data.filter(row => {
    const fn   = row.first_name  || row.firstName  || '';
    const mn   = row.middle_name || row.middleName  || '';
    const ln   = row.last_name   || row.lastName   || '';
    const name = `${fn} ${mn} ${ln}`.toLowerCase();
    const q    = search.toLowerCase();
    const matchSearch = !q || name.includes(q) || String(row.id).includes(q);
    const st   = normalizeStatus(row.approval_status);
    const matchStatus =
      filterStatus === 'All' ||
      (filterStatus === 'Pending'  && st === 'PENDING')  ||
      (filterStatus === 'Approved' && st === 'Approved') ||
      (filterStatus === 'Rejected' && st === 'Rejected');
    return matchSearch && matchStatus;
  });

  /* ── toggle photo/signature ── */
  const togglePhoto = (id) => {
    setShowPhoto(prev => ({ ...prev, [id]: !prev[id] }));
    setShowSignature(prev => ({ ...prev, [id]: false }));
  };

  const toggleSignature = (id) => {
    setShowSignature(prev => ({ ...prev, [id]: !prev[id] }));
    setShowPhoto(prev => ({ ...prev, [id]: false }));
  };

  /* ════════════════════════════════════════
     DETAIL SCREEN ROUTING
     ════════════════════════════════════════ */
  if (selectedCustomer) {
    const status = normalizeStatus(selectedCustomer.approval_status);
    const photo = resolveCustomerPhotoUrl(selectedCustomer, 'PHOTO');
    const signature = resolveCustomerPhotoUrl(selectedCustomer, 'SIGNATURE');
    if (status === 'Approved') {
      return (
        <ApprovedCustomerScreen
          customer={selectedCustomer}
          photoUrl={photo}
          signatureUrl={signature}
          onBack={() => setSelectedCustomer(null)}
        />
      );
    }
    if (status === 'Rejected') {
      return (
        <RejectedCustomerScreen
          customer={selectedCustomer}
          photoUrl={photo}
          signatureUrl={signature}
          onBack={() => setSelectedCustomer(null)}
        />
      );
    }
  }

  /* ════════════════════════════════════════
     RENDER
     ════════════════════════════════════════ */
  return (
    <div className="tl-page">

      {/* ── Toast ── */}
      {toast && (
        <div className={`tl-toast tl-toast-${toast.type}`}>
          {toast.type === 'success' ? <Icons.CheckCircle /> : <Icons.XCircle />}
          <span>{toast.msg}</span>
          <button className="tl-toast-close" onClick={() => setToast(null)}>
            <Icons.X size={13} />
          </button>
        </div>
      )}

      {/* ── Header ── */}
      <div className="tl-header">
        <div className="tl-header-left">
          <button className="tl-back" onClick={onBack} title="Go back">
            <Icons.ArrowLeft />
          </button>
          <div className="tl-header-title-block">
            <div className="tl-header-eyebrow">
              <Icons.ClipboardList />
              Membership Review
            </div>
            <h1 className="tl-page-title">Task List</h1>
          </div>
        </div>
        <button className="tl-refresh" onClick={fetchData} disabled={loading}>
          <Icons.RefreshCw spin={loading} />
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </div>

      {/* ── Stat cards ── */}
      <div className="tl-stats">
        <StatCard label="Total"    count={counts.All}      active={filterStatus==='All'}
          onClick={() => setFilterStatus('All')}      accent="#6366f1" Icon={Icons.Users} />
        <StatCard label="Pending"  count={counts.Pending}  active={filterStatus==='Pending'}
          onClick={() => setFilterStatus('Pending')}  accent="#f59e0b" Icon={Icons.Clock} />
        <StatCard label="Approved" count={counts.Approved} active={filterStatus==='Approved'}
          onClick={() => setFilterStatus('Approved')} accent="#22c55e" Icon={Icons.CheckCircle} />
        <StatCard label="Rejected" count={counts.Rejected} active={filterStatus==='Rejected'}
          onClick={() => setFilterStatus('Rejected')} accent="#ef4444" Icon={Icons.XCircle} />
      </div>

      {/* ── Toolbar ── */}
      <div className="tl-toolbar">
        <div className="tl-tabs">
          {['All','Pending','Approved','Rejected'].map(tab => (
            <button key={tab}
              className={`tl-tab${filterStatus === tab ? ' tl-tab-active' : ''}`}
              onClick={() => setFilterStatus(tab)}>
              {tab}
              <span className="tl-tab-chip">{counts[tab]}</span>
            </button>
          ))}
        </div>
        <div className="tl-search">
          <Icons.Search />
          <input
            className="tl-search-input"
            placeholder="Search by name or ID…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="tl-search-clear" onClick={() => setSearch('')}>
              <Icons.X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* ── Error ── */}
      {fetchError && (
        <div className="tl-error-bar">
          <Icons.AlertCircle />
          <span>{fetchError}</span>
          <button className="tl-btn tl-btn-sm tl-btn-ghost" onClick={fetchData}>Retry</button>
        </div>
      )}

      {/* ── Table ── */}
      <div className="tl-card">
        {loading ? (
          <div className="tl-state-center">
            <div className="tl-spinner-lg" />
            <p className="tl-state-text">Loading applications…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="tl-state-center">
            <div className="tl-empty-icon"><Icons.FileText /></div>
            <p className="tl-state-text">No applications found</p>
            {search && (
              <button className="tl-btn tl-btn-ghost tl-btn-sm" onClick={() => setSearch('')}>
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="tl-table-scroll">
            <table className="tl-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Member</th>
                  <th>Photo</th>
                  <th>Gender</th>
                  <th>DOB</th>
                  <th>Age</th>
                  <th>Marital</th>
                  <th>City</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th>Comments</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, idx) => {
                  const status    = normalizeStatus(row.approval_status);
                  const isPending = status === 'PENDING';
                  const fn        = row.first_name  || row.firstName  || '';
                  const mn        = row.middle_name || row.middleName  || '';
                  const ln        = row.last_name   || row.lastName   || '';
                  const fullName  = [fn, mn, ln].filter(Boolean).join(' ') || `Customer ${row.id}`;
                  const city      = row.perm_city || row.temp_city || '—';
                  const photoUrl  = failedImages[row.id] ? null : photoUrls[row.id];
                  const signatureUrl = failedImages[row.id] ? null : signatureUrls[row.id];
                  
                  // Determine which image to show
                  const showPhotoImg = showPhoto[row.id];
                  const showSignatureImg = showSignature[row.id];
                  let displayImage = null;
                  if (showPhotoImg && photoUrl) displayImage = photoUrl;
                  else if (showSignatureImg && signatureUrl) displayImage = signatureUrl;

                  return (
                    <tr
                      key={row.id ?? idx}
                      className={isPending ? 'tl-tr-pending' : ''}
                      style={{ cursor: isPending ? 'default' : 'pointer' }}
                      onClick={() => {
                        if (!isPending) setSelectedCustomer(row);
                      }}
                    >
                      <td className="tl-td-num">{idx + 1}</td>

                      {/* Member */}
                      <td className="tl-td-member">
                        <div className="tl-member-cell">
                          <Avatar
                            firstName={fn} lastName={ln}
                            photoUrl={photoUrl} size={34}
                            onError={() => setFailedImages(p => ({ ...p, [row.id]: true }))}
                          />
                          <div className="tl-member-info">
                            <span className="tl-member-name">{fullName}</span>
                            <span className="tl-member-id">#{row.id}</span>
                          </div>
                        </div>
                      </td>

                      {/* Photo with buttons */}
                      <td className="tl-td-photo">
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                          {(photoUrl || signatureUrl) && (
                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'center' }}>
                              {photoUrl && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); togglePhoto(row.id); }}
                                  style={{
                                    padding: '2px 6px',
                                    fontSize: '9px',
                                    borderRadius: '4px',
                                    border: showPhoto[row.id] ? '2px solid #3b82f6' : '1px solid #d1d5db',
                                    background: showPhoto[row.id] ? '#eff6ff' : '#fff',
                                    color: showPhoto[row.id] ? '#2563eb' : '#6b7280',
                                    cursor: 'pointer',
                                    fontWeight: 500
                                  }}
                                >
                                  📷 Photo
                                </button>
                              )}
                              {signatureUrl && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); toggleSignature(row.id); }}
                                  style={{
                                    padding: '2px 6px',
                                    fontSize: '9px',
                                    borderRadius: '4px',
                                    border: showSignature[row.id] ? '2px solid #8b5cf6' : '1px solid #d1d5db',
                                    background: showSignature[row.id] ? '#f5f3ff' : '#fff',
                                    color: showSignature[row.id] ? '#7c3aed' : '#6b7280',
                                    cursor: 'pointer',
                                    fontWeight: 500
                                  }}
                                >
                                  ✍️ Signature
                                </button>
                              )}
                            </div>
                          )}
                          {displayImage ? (
                            <div className="tl-photo-thumb-wrap">
                              <SafeImage
                                src={displayImage}
                                alt={fullName}
                                style={{ width: 60, height: 60, borderRadius: 6, objectFit: 'cover', display: 'block' }}
                                onError={() => setFailedImages(p => ({ ...p, [row.id]: true }))}
                              />
                            </div>
                          ) : (
                            <span className="tl-no-photo" style={{ fontSize: '11px' }}>
                              {!photoUrl && !signatureUrl ? 'No docs' : 'Click button'}
                            </span>
                          )}
                        </div>
                      </td>

                      <td><span className="tl-pill">{row.gender || '—'}</span></td>
                      <td className="tl-td-date">{fmt(row.dob)}</td>
                      <td className="tl-td-age">{row.age ?? '—'}</td>
                      <td>{row.marital_status || '—'}</td>
                      <td className="tl-td-city">{city}</td>
                      <td className="tl-td-date">{fmt(row.date_of_joining)}</td>
                      <td><StatusBadge status={status} /></td>

                      {/* Comments */}
                      <td className="tl-td-comment">
                        {row.comments ? (
                          <span className="tl-comment" title={row.comments}>
                            <Icons.MessageSquare />
                            {row.comments.length > 22 ? row.comments.slice(0, 22) + '…' : row.comments}
                          </span>
                        ) : <span className="tl-na">—</span>}
                      </td>

                      {/* Actions */}
                      <td
                        className="tl-td-actions"
                        onClick={e => e.stopPropagation()}
                      >
                        {isPending ? (
                          <div className="tl-action-pair">
                            <button
                              className="tl-action-icon-btn tl-action-approve"
                              title="Approve"
                              onClick={() => setModal({
                                type: 'approve',
                                member: { id: row.id, first_name: fn, last_name: ln, email: row.email, ...row },
                                photoUrl,
                              })}
                            >
                              <Icons.ThumbsUp />
                            </button>
                            <button
                              className="tl-action-icon-btn tl-action-reject"
                              title="Reject"
                              onClick={() => setModal({
                                type: 'reject',
                                member: { id: row.id, first_name: fn, last_name: ln, email: row.email, ...row },
                                photoUrl,
                              })}
                            >
                              <Icons.ThumbsDown />
                            </button>
                          </div>
                        ) : (
                          <span
                            className={`tl-done-icon ${status === 'Approved' ? 'tl-done-approve' : 'tl-done-reject'}`}
                            title={status}
                          >
                            {status === 'Approved' ? <Icons.CheckCircle /> : <Icons.XCircle />}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer row count */}
        {!loading && filtered.length > 0 && (
          <div className="tl-table-footer">
            Showing <strong>{filtered.length}</strong> of <strong>{data.length}</strong> applications
            {filterStatus !== 'All' && (
              <span style={{ marginLeft: 8, color: '#6b7280' }}>
                · filtered by <strong>{filterStatus}</strong>
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Modal ── */}
      {modal && (
        <ConfirmModal
          type={modal.type}
          member={modal.member}
          photoUrl={modal.photoUrl}
          onConfirm={handleConfirm}
          onCancel={() => !actionLoading && setModal(null)}
          loading={actionLoading}
        />
      )}
    </div>
  );
}
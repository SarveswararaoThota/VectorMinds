import React, { useState, useEffect } from 'react';
import '../Users/Users.css';
import './BranchScreen.css';
import { branchAPI, tenantAPI } from '../../api.js';

const EMPTY = {
  name: '', code: '', tenantId: '',
  agreementFrom: '', agreementTo: '', isActive: 1,
};

const fmt = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export default function BranchScreen({ initialMode = 'create', branch: initialBranch = null, onBack, onSave, currentUser }) {
  const userId = currentUser?.id || currentUser?.userId || 1;

  const [mode, setMode]       = useState(initialMode);
  const [branch, setBranch]   = useState(initialBranch);
  const [tenants, setTenants] = useState([]);

  const [form, setForm]         = useState(EMPTY);
  const [errors, setErrors]     = useState({});
  const [saving, setSaving]     = useState(false);
  const [saved,  setSaved]      = useState(false);
  const [apiError, setApiError] = useState('');

  /* Load tenants for dropdown */
  useEffect(() => {
    tenantAPI.getAll(userId)
      .then(res => {
        const raw = res.result || res.data || res || [];
        setTenants(Array.isArray(raw) ? raw : []);
      })
      .catch(() => {});
  }, []);

  /* Sync form when branch or mode changes */
  useEffect(() => {
    setErrors({});
    setApiError('');
    setSaved(false);

    if (mode === 'create') {
      setForm(EMPTY);
    } else if ((mode === 'view' || mode === 'edit') && branch) {
      setForm({
        name:          branch.name          || '',
        code:          branch.code          || '',
        tenantId:      branch.tenantId      || '',
        agreementFrom: branch.agreementFrom ? branch.agreementFrom.split('T')[0] : '',
        agreementTo:   branch.agreementTo   ? branch.agreementTo.split('T')[0]   : '',
        isActive:      branch.isActive      ?? 1,
      });
    }
  }, [mode, branch]);

  const set = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name     = 'Branch name is required';
    if (!form.code.trim()) e.code     = 'Branch code is required';
    if (!form.tenantId)    e.tenantId = 'Tenant is required';
    if (form.agreementFrom && form.agreementTo && form.agreementFrom > form.agreementTo)
      e.agreementTo = 'Agreement To must be after Agreement From';
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    setSaving(true);
    setApiError('');
    try {
      if (mode === 'edit' && branch) {
        await branchAPI.update({ id: branch.id, ...form }, userId);
      } else {
        await branchAPI.insert({ id: 0, ...form }, userId);
      }
      setSaved(true);
      setTimeout(() => { onSave && onSave(); }, 1000);
    } catch {
      setApiError('Failed to save branch. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getTenantName = (id) => tenants.find(t => t.id == id)?.name || id || '—';

  const TABS = [
    {
      key: 'create', label: 'Create',
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    },
    {
      key: 'view', label: 'View', disabled: !branch,
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    },
    {
      key: 'edit', label: 'Edit', disabled: !branch,
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    },
  ];

  const pageSubtitle = {
    create: 'Register a new branch in the system',
    view:   branch ? `Viewing — ${branch.name}` : '',
    edit:   branch ? `Editing — ${branch.name}`  : '',
  }[mode];

  return (
    <div className="users-page">

      {/* ── Page Header ── */}
      <div className="page-header">
        <div className="header-left">
          <button className="back-btn" onClick={onBack}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <div>
            <h1 className="page-title">Branch Management</h1>
            <p className="page-sub">{pageSubtitle}</p>
          </div>
        </div>
      </div>

      {/* ── Tab Bar ── */}
      <div className="ts-tabbar">
        {TABS.map(tab => (
          <button
            key={tab.key}
            className={`ts-tab ${mode === tab.key ? 'ts-tab-active' : ''} ${tab.disabled ? 'ts-tab-disabled' : ''}`}
            onClick={() => !tab.disabled && setMode(tab.key)}
            disabled={tab.disabled}
            title={tab.disabled ? 'Select a branch first' : ''}
          >
            <span className="ts-tab-icon">{tab.icon}</span>
            {tab.label}
            {mode === tab.key && <span className="ts-tab-indicator" />}
          </button>
        ))}
      </div>

      {apiError && <div className="api-error">{apiError}</div>}

      {/* ════════ VIEW MODE ════════ */}
      {mode === 'view' && branch && (
        <div className="view-layout">
          <div className="profile-card">
            <div className="profile-avatar-lg">
              {(branch.name || '').slice(0, 2).toUpperCase()}
            </div>
            <div className="profile-name">{branch.name}</div>
            <span className={`status-badge mt-12 ${(branch.isActive === 1 || branch.isActive === true) ? 'status-active' : 'status-inactive'}`}>
              <span className="status-dot" />
              {(branch.isActive === 1 || branch.isActive === true) ? 'Active' : 'Inactive'}
            </span>
            <div className="profile-dept" style={{ marginTop: 12 }}>
              Code: <strong>{branch.code}</strong>
            </div>
            <button className="btn-primary" style={{ marginTop: 24, width: '100%', justifyContent: 'center' }} onClick={() => setMode('edit')}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Edit Branch
            </button>
          </div>

          <div className="details-card">
            <div className="section-title" style={{ marginBottom: 4 }}>
              <div className="section-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </div>
              Branch Details
            </div>
            <div className="detail-fields">
              {[
                { label: 'Branch Name',    value: branch.name                    || '—' },
                { label: 'Branch Code',    value: branch.code                    || '—' },
                { label: 'Tenant',         value: getTenantName(branch.tenantId)        },
                { label: 'Agreement From', value: fmt(branch.agreementFrom)             },
                { label: 'Agreement To',   value: fmt(branch.agreementTo)               },
              ].map(f => (
                <div className="detail-field" key={f.label}>
                  <div className="detail-content">
                    <span className="detail-label">{f.label}</span>
                    <span className="detail-value">{f.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ════════ CREATE / EDIT MODE ════════ */}
      {(mode === 'create' || mode === 'edit') && (
        <div className="form-card">

          {/* ── Branch Info ── */}
          <div className="form-section">
            <div className="section-title">
              <div className="section-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
              </div>
              Branch Information
            </div>
            <div className="form-grid form-grid-3">

              <div className="form-field">
                <label className="form-label">Branch Name <span className="req">*</span></label>
                <input
                  className={`form-input ${errors.name ? 'input-error' : ''}`}
                  placeholder="e.g. Head Office"
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                />
                {errors.name && <span className="error-msg">{errors.name}</span>}
              </div>

              <div className="form-field">
                <label className="form-label">Branch Code <span className="req">*</span></label>
                <input
                  className={`form-input ${errors.code ? 'input-error' : ''}`}
                  placeholder="e.g. HO001"
                  value={form.code}
                  onChange={e => set('code', e.target.value.toUpperCase())}
                />
                {errors.code && <span className="error-msg">{errors.code}</span>}
              </div>

              <div className="form-field">
                <label className="form-label">Status</label>
                <div className="toggle-row">
                  <span className={`toggle-label ${form.isActive ? 'tl-active' : 'tl-inactive'}`}>
                    {form.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <button
                    type="button"
                    className={`toggle-switch ${form.isActive ? 'ts-on' : 'ts-off'}`}
                    onClick={() => set('isActive', form.isActive ? 0 : 1)}
                  >
                    <span className="ts-thumb" />
                  </button>
                </div>
              </div>

            </div>
          </div>

          <div className="form-divider" />

          {/* ── Tenant ── */}
          <div className="form-section">
            <div className="section-title">
              <div className="section-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="7" width="20" height="14" rx="2"/>
                  <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
                </svg>
              </div>
              Tenant Association
            </div>
            <div className="form-grid">
              <div className="form-field">
                <label className="form-label">Tenant <span className="req">*</span></label>
                <select
                  className={`form-input form-select ${errors.tenantId ? 'input-error' : ''}`}
                  value={form.tenantId}
                  onChange={e => set('tenantId', e.target.value)}
                >
                  <option value="">Select tenant...</option>
                  {tenants.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                {errors.tenantId && <span className="error-msg">{errors.tenantId}</span>}
              </div>
            </div>
          </div>

          <div className="form-divider" />

          {/* ── Agreement Period ── */}
          <div className="form-section">
            <div className="section-title">
              <div className="section-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8"  y1="2" x2="8"  y2="6"/>
                  <line x1="3"  y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              Agreement Period
            </div>
            <div className="form-grid">

              <div className="form-field">
                <label className="form-label">Agreement From</label>
                <input
                  className="form-input"
                  type="date"
                  value={form.agreementFrom}
                  onChange={e => set('agreementFrom', e.target.value)}
                />
              </div>

              <div className="form-field">
                <label className="form-label">Agreement To</label>
                <input
                  className={`form-input ${errors.agreementTo ? 'input-error' : ''}`}
                  type="date"
                  value={form.agreementTo}
                  onChange={e => set('agreementTo', e.target.value)}
                />
                {errors.agreementTo && <span className="error-msg">{errors.agreementTo}</span>}
              </div>

            </div>
          </div>

          {/* ── Footer ── */}
          <div className="form-footer">
            <button className="btn-ghost" onClick={onBack}>Cancel</button>

            {mode === 'edit' && (
              <button className="btn-ghost" onClick={() => setMode('view')}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                View
              </button>
            )}

            <button
              className={`btn-primary ${saved ? 'btn-saved' : ''}`}
              onClick={handleSave}
              disabled={saving}
            >
              {saved ? (
                <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Saved!</>
              ) : saving ? (
                <><div className="spinner-sm" />Saving...</>
              ) : (
                <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>{mode === 'edit' ? 'Update Branch' : 'Create Branch'}</>
              )}
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
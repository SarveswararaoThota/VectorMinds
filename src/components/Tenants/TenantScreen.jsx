import React, { useState, useEffect } from 'react';
import '../Users/Users.css';
import './TenantScreen.css';
import { tenantAPI } from '../../api.js';

/* ─────────────────────────────────────────────────────────
   MODE CONSTANTS
   'create'  →  blank form  → INSERT
   'view'    →  read-only   → no API call
   'edit'    →  pre-filled  → UPDATE
───────────────────────────────────────────────────────── */

const EMPTY = {
  name: '', code: '', email: '',
  mobileNo: '', expiryFrom: '', expiryTo: '', isActive: 1,
};

const fmt = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export default function TenantScreen({ initialMode = 'create', tenant: initialTenant = null, onBack, onSave, currentUser }) {
  const userId = currentUser?.id || currentUser?.userId || 1;

  /* active mode tab */
  const [mode, setMode] = useState(initialMode); // 'create' | 'view' | 'edit'

  /* the tenant being viewed / edited (null when creating fresh) */
  const [tenant, setTenant] = useState(initialTenant);

  /* form state */
  const [form, setForm]       = useState(EMPTY);
  const [errors, setErrors]   = useState({});
  const [saving, setSaving]   = useState(false);
  const [saved,  setSaved]    = useState(false);
  const [apiError, setApiError] = useState('');

  /* ── sync form when tenant or mode changes ── */
  useEffect(() => {
    setErrors({});
    setApiError('');
    setSaved(false);

    if (mode === 'create') {
      setForm(EMPTY);
    } else if ((mode === 'view' || mode === 'edit') && tenant) {
      setForm({
        name:       tenant.name       || '',
        code:       tenant.code       || '',
        email:      tenant.email      || '',
        mobileNo:   tenant.mobileNo   || '',
        expiryFrom: tenant.expiryFrom ? tenant.expiryFrom.split('T')[0] : '',
        expiryTo:   tenant.expiryTo   ? tenant.expiryTo.split('T')[0]   : '',
        isActive:   tenant.isActive   ?? 1,
      });
    }
  }, [mode, tenant]);

  /* ── helpers ── */
  const set = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Tenant name is required';
    if (!form.code.trim()) e.code = 'Tenant code is required';
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (form.expiryFrom && form.expiryTo && form.expiryFrom > form.expiryTo)
      e.expiryTo = 'Expiry To must be after Expiry From';
    return e;
  };

  /* ── save handler ── */
  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    setSaving(true);
    setApiError('');
    try {
      if (mode === 'edit' && tenant) {
        /* UPDATE  →  { id: tenant.id, crudType:'UPDATE', ...fields, userId } */
        await tenantAPI.update({ id: tenant.id, ...form }, userId);
      } else {
        /* INSERT  →  { id: 0, crudType:'INSERT', ...fields, userId } */
        await tenantAPI.insert({ id: 0, ...form }, userId);
      }
      setSaved(true);
      setTimeout(() => { onSave && onSave(); }, 1000);
    } catch {
      setApiError('Failed to save tenant. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  /* ── tab config ── */
  const TABS = [
    {
      key: 'create',
      label: 'Create',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      ),
    },
    {
      key: 'view',
      label: 'View',
      disabled: !tenant,
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      ),
    },
    {
      key: 'edit',
      label: 'Edit',
      disabled: !tenant,
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
      ),
    },
  ];

  const isReadOnly = mode === 'view';
  const pageSubtitle = {
    create: 'Register a new tenant in the system',
    view:   tenant ? `Viewing — ${tenant.name}` : '',
    edit:   tenant ? `Editing — ${tenant.name}`  : '',
  }[mode];

  /* ════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════ */
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
            <h1 className="page-title">Tenant Management</h1>
            <p className="page-sub">{pageSubtitle}</p>
          </div>
        </div>
      </div>

      {/* ── Mode Tab Bar ── */}
      <div className="ts-tabbar">
        {TABS.map(tab => (
          <button
            key={tab.key}
            className={`ts-tab ${mode === tab.key ? 'ts-tab-active' : ''} ${tab.disabled ? 'ts-tab-disabled' : ''}`}
            onClick={() => !tab.disabled && setMode(tab.key)}
            disabled={tab.disabled}
            title={tab.disabled ? 'Select a tenant first' : ''}
          >
            <span className="ts-tab-icon">{tab.icon}</span>
            {tab.label}
            {mode === tab.key && <span className="ts-tab-indicator" />}
          </button>
        ))}
      </div>

      {apiError && <div className="api-error">{apiError}</div>}

      {/* ════════ VIEW MODE ════════ */}
      {mode === 'view' && tenant && (
        <div className="view-layout">
          {/* Profile card */}
          <div className="profile-card">
            <div className="profile-avatar-lg">
              {(tenant.name || '').slice(0, 2).toUpperCase()}
            </div>
            <div className="profile-name">{tenant.name}</div>
            <span className={`status-badge mt-12 ${(tenant.isActive === 1 || tenant.isActive === true) ? 'status-active' : 'status-inactive'}`}>
              <span className="status-dot" />
              {(tenant.isActive === 1 || tenant.isActive === true) ? 'Active' : 'Inactive'}
            </span>
            <div className="profile-dept" style={{ marginTop: 12 }}>
              Code: <strong>{tenant.code}</strong>
            </div>
            <button className="btn-primary" style={{ marginTop: 24, width: '100%', justifyContent: 'center' }} onClick={() => setMode('edit')}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Edit Tenant
            </button>
          </div>

          {/* Detail fields */}
          <div className="details-card">
            <div className="section-title" style={{ marginBottom: 4 }}>
              <div className="section-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </div>
              Tenant Details
            </div>
            <div className="detail-fields">
              {[
                { label: 'Tenant Name',  value: tenant.name       || '—' },
                { label: 'Tenant Code',  value: tenant.code       || '—' },
                { label: 'Email',        value: tenant.email      || '—' },
                { label: 'Mobile No',    value: tenant.mobileNo   || '—' },
                { label: 'Expiry From',  value: fmt(tenant.expiryFrom) },
                { label: 'Expiry To',    value: fmt(tenant.expiryTo)   },
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

          {/* ── Tenant Info ── */}
          <div className="form-section">
            <div className="section-title">
              <div className="section-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
              </div>
              Tenant Information
            </div>
            <div className="form-grid form-grid-3">

              <div className="form-field">
                <label className="form-label">Tenant Name <span className="req">*</span></label>
                <input
                  className={`form-input ${errors.name ? 'input-error' : ''}`}
                  placeholder="e.g. Vasudeva Society"
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                />
                {errors.name && <span className="error-msg">{errors.name}</span>}
              </div>

              <div className="form-field">
                <label className="form-label">Tenant Code <span className="req">*</span></label>
                <input
                  className={`form-input ${errors.code ? 'input-error' : ''}`}
                  placeholder="e.g. A01"
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

          {/* ── Contact ── */}
          <div className="form-section">
            <div className="section-title">
              <div className="section-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
              Contact Details
            </div>
            <div className="form-grid">

              <div className="form-field">
                <label className="form-label">Email Address</label>
                <input
                  className={`form-input ${errors.email ? 'input-error' : ''}`}
                  type="email"
                  placeholder="e.g. admin@tenant.com"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                />
                {errors.email && <span className="error-msg">{errors.email}</span>}
              </div>

              <div className="form-field">
                <label className="form-label">Mobile Number</label>
                <input
                  className="form-input"
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={form.mobileNo}
                  onChange={e => set('mobileNo', e.target.value)}
                />
              </div>

            </div>
          </div>

          <div className="form-divider" />

          {/* ── Validity ── */}
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
              Validity Period
            </div>
            <div className="form-grid">

              <div className="form-field">
                <label className="form-label">Expiry From</label>
                <input
                  className="form-input"
                  type="date"
                  value={form.expiryFrom}
                  onChange={e => set('expiryFrom', e.target.value)}
                />
              </div>

              <div className="form-field">
                <label className="form-label">Expiry To</label>
                <input
                  className={`form-input ${errors.expiryTo ? 'input-error' : ''}`}
                  type="date"
                  value={form.expiryTo}
                  onChange={e => set('expiryTo', e.target.value)}
                />
                {errors.expiryTo && <span className="error-msg">{errors.expiryTo}</span>}
              </div>

            </div>
          </div>

          {/* ── Footer ── */}
          <div className="form-footer">
            <button className="btn-ghost" onClick={onBack}>Cancel</button>

            {/* Edit mode: also allow switching to View */}
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
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Saved!
                </>
              ) : saving ? (
                <><div className="spinner-sm" />Saving...</>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                    <polyline points="17 21 17 13 7 13 7 21"/>
                    <polyline points="7 3 7 8 15 8"/>
                  </svg>
                  {mode === 'edit' ? 'Update Tenant' : 'Create Tenant'}
                </>
              )}
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
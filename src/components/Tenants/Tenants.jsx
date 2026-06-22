import React, { useState, useEffect } from 'react';
import TenantScreen from './TenantScreen.jsx';
import '../Users/Users.css';
import { tenantAPI } from '../../api.js';

export default function Tenants({ currentUser }) {
  const userId = currentUser?.id || currentUser?.userId || 1;

  const [screen, setScreen]         = useState('list');
  const [mode, setMode]             = useState('create');
  const [selectedTenant, setSelected] = useState(null);

  const [tenants,  setTenants]  = useState([]);
  const [search,   setSearch]   = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  const fetchTenants = async () => {
    setLoading(true); setError('');
    try {
      const res = await tenantAPI.getAll(userId);
      // Transform API response to match UI expected field names
      const formattedTenants = (res.result || []).map(tenant => ({
        ...tenant,
        isActive: tenant.is_active === 1 || tenant.is_active === true,
        mobileNo: tenant.mobile_no,
        expiryFrom: tenant.expiry_from,
        expiryTo: tenant.expiry_to
      }));
      setTenants(formattedTenants);
    } catch {
      setError('Failed to load tenants. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTenants(); }, []);

  const filtered = tenants.filter(t =>
    (t.name  || '').toLowerCase().includes(search.toLowerCase()) ||
    (t.code  || '').toLowerCase().includes(search.toLowerCase()) ||
    (t.email || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async () => {
    try {
      await tenantAPI.delete(deleteId, userId);
      setDeleteId(null);
      fetchTenants();
    } catch {
      alert('Failed to delete tenant.');
      setDeleteId(null);
    }
  };

  const goList     = () => { setScreen('list'); setSelected(null); fetchTenants(); };
  const openCreate = () => { setMode('create'); setSelected(null); setScreen('form'); };
  const openView   = (t) => { setMode('view');  setSelected(t);    setScreen('form'); };
  const openEdit   = (t) => { setMode('edit');  setSelected(t);    setScreen('form'); };

  if (screen === 'form') {
    return (
      <TenantScreen
        initialMode={mode}
        tenant={selectedTenant}
        currentUser={currentUser}
        onBack={goList}
        onSave={goList}
      />
    );
  }

  return (
    <div className="users-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Tenant Management</h1>
          <p className="page-sub">Manage all registered tenants and their status</p>
        </div>
        <button className="btn-primary" onClick={openCreate}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Tenant
        </button>
      </div>

      <div className="stats-row">
        <div className="stat-card"><span className="stat-num">{tenants.length}</span><span className="stat-label">Total Tenants</span></div>
        <div className="stat-card"><span className="stat-num">{tenants.filter(t => t.isActive === 1 || t.isActive === true).length}</span><span className="stat-label">Active</span></div>
        <div className="stat-card"><span className="stat-num">{tenants.filter(t => !t.isActive).length}</span><span className="stat-label">Inactive</span></div>
        <div className="stat-card"><span className="stat-num">{tenants.filter(t => t.expiryTo && new Date(t.expiryTo) >= new Date()).length}</span><span className="stat-label">Valid</span></div>
      </div>

      {error && <div className="api-error">{error} <button onClick={fetchTenants}>Retry</button></div>}

      <div className="table-card">
        <div className="table-toolbar">
          <div className="search-wrap">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input className="search-input" placeholder="Search tenants..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <span className="result-count">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        <div className="table-wrap">
          {loading ? (
            <div className="table-loading"><div className="spinner" />Loading tenants...</div>
          ) : (
            <table className="users-table">
              <thead>
                <tr>
                  <th>#</th><th>Tenant Name</th><th>Code</th><th>Email</th>
                  <th>Mobile</th><th>Expiry From</th><th>Expiry To</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan="9" className="empty-row">No tenants found</td></tr>
                ) : filtered.map((t, i) => (
                  <tr key={t.id} className="table-row" style={{ animationDelay: `${i * 0.05}s` }}>
                    <td className="td-num">{i + 1}</td>
                    <td>
                      <div className="user-cell">
                        <div className="avatar">{(t.name || '').slice(0, 2).toUpperCase()}</div>
                        <span className="user-name">{t.name}</span>
                      </div>
                    </td>
                    <td className="td-user">{t.code}</td>
                    <td className="td-email">{t.email || '—'}</td>
                    <td className="td-dept">{t.mobileNo || '—'}</td>
                    <td className="td-dept">{t.expiryFrom ? new Date(t.expiryFrom).toLocaleDateString('en-IN') : '—'}</td>
                    <td className="td-dept">{t.expiryTo   ? new Date(t.expiryTo).toLocaleDateString('en-IN')   : '—'}</td>
                    <td>
                      <span className={`status-badge ${(t.isActive === 1 || t.isActive === true) ? 'status-active' : 'status-inactive'}`}>
                        <span className="status-dot" />{(t.isActive === 1 || t.isActive === true) ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="action-btns">
                        <button className="action-btn view-btn" title="View" onClick={() => openView(t)}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        </button>
                        <button className="action-btn edit-btn" title="Edit" onClick={() => openEdit(t)}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button className="action-btn delete-btn" title="Delete" onClick={() => setDeleteId(t.id)}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-icon danger">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
            </div>
            <h3 className="modal-title">Delete Tenant?</h3>
            <p className="modal-desc">This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn-ghost" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="btn-danger" onClick={handleDelete}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
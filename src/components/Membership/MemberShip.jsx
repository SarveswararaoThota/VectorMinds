import React, { useState, useEffect, useCallback } from 'react';
import MembershipScreen from './MembershipScreen.jsx';
import TaskList from '../TaskList/TaskList.jsx';
import { customerAPI } from '../../api';

export default function Membership({ currentUser }) {
  const [screen,         setScreen]         = useState('list');  // 'list' | 'form' | 'tasklist'
  const [mode,           setMode]           = useState('create');
  const [selectedMember, setSelected]       = useState(null);
  const [members,        setMembers]        = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [fetchError,     setFetchError]     = useState('');
  const [search,         setSearch]         = useState('');

  /* ── Fetch all members from API ── */
  const fetchMembers = useCallback(async () => {
    setLoading(true); setFetchError('');
    try {
      const userId = currentUser?.id ?? currentUser?.userId ?? 1;
      const res = await customerAPI.getAll(userId);
      const list = Array.isArray(res?.result) ? res.result
                 : Array.isArray(res)          ? res
                 : Array.isArray(res?.data)    ? res.data
                 : [];
      setMembers(list);
    } catch (err) {
      setFetchError('Failed to load members. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  /* ── Navigation helpers ── */
  const goList     = ()  => { setScreen('list'); setSelected(null); fetchMembers(); };
  const openCreate = ()  => { setMode('create'); setSelected(null); setScreen('form'); };
  const openView   = (m) => { setMode('view');   setSelected(m);    setScreen('form'); };
  const openEdit   = (m) => { setMode('edit');   setSelected(m);    setScreen('form'); };

  /* ── Called by MembershipScreen after successful save ── */
  const handleSaveMember = () => {
    // Go to task list after save (as per existing flow)
    setScreen('tasklist');
  };

  /* ── Called by "Go to Task List" button in MembershipScreen ── */
  const handleTaskListSave = () => {
    setScreen('tasklist');
  };

  /* ── Filter members by name / aadhar / phone ── */
  const filtered = members.filter(m => {
    const q = search.toLowerCase();
    if (!q) return true;
    const name = [m.first_name, m.middle_name, m.last_name, m.name, m.lastName]
      .filter(Boolean).join(' ').toLowerCase();
    return (
      name.includes(q) ||
      (m.aadhar_number || m.aadhar || '').toLowerCase().includes(q) ||
      (m.phone1 || '').includes(q) ||
      (m.pan_number || m.pan || '').toLowerCase().includes(q)
    );
  });

  const fmtDate = d => d
    ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

  const getStatus = m => {
    const s = m.approval_status || m.status || 'Pending';
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  };

  const STATUS_STYLE = {
    Pending:  { background: '#fff3cd', color: '#856404' },
    Approved: { background: '#d4edda', color: '#155724' },
    Rejected: { background: '#f8d7da', color: '#721c24' },
  };

  /* ── Render: Task List screen ── */
  if (screen === 'tasklist') {
    return <TaskList onBack={goList} currentUser={currentUser} />;
  }

  /* ── Render: Membership Form ── */
  if (screen === 'form') {
    return (
      <MembershipScreen
        initialMode={mode}
        member={selectedMember}
        currentUser={currentUser}
        onBack={goList}
        onSave={handleSaveMember}
        onTaskListSave={handleTaskListSave}
      />
    );
  }

  /* ── Render: Member List ── */
  return (
    <div className="users-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Membership</h1>
          <p className="page-sub">All registered members</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-ghost" onClick={() => setScreen('tasklist')}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
              <line x1="8" y1="18" x2="21" y2="18"/>
              <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/>
              <line x1="3" y1="18" x2="3.01" y2="18"/>
            </svg>
            Task List
          </button>
          <button className="btn-primary" onClick={openCreate}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New Member
          </button>
        </div>
      </div>

      <div className="table-card">
        <div className="table-toolbar">
          <div className="search-wrap">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              className="search-input"
              placeholder="Search by name, aadhar, phone, PAN…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button
            className="btn-ghost"
            onClick={fetchMembers}
            disabled={loading}
            style={{ marginLeft: 'auto' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }}>
              <polyline points="1 4 1 10 7 10"/>
              <path d="M3.51 15a9 9 0 1 0 .49-3.74"/>
            </svg>
            {loading ? 'Loading…' : 'Refresh'}
          </button>
        </div>

        {fetchError && (
          <div style={{
            padding: '12px 20px', margin: '0 0 12px',
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: 8, color: '#dc2626', fontSize: 13,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            {fetchError}
            <button
              onClick={fetchMembers}
              style={{ marginLeft: 'auto', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', fontSize: 12 }}
            >
              Retry
            </button>
          </div>
        )}

        <div className="table-wrap">
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '40px 20px', color: '#64748b' }}>
              <div className="spinner-sm" style={{ width: 24, height: 24, borderWidth: 3 }} />
              Loading members…
            </div>
          ) : (
            <table className="users-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Aadhar</th>
                  <th>PAN</th>
                  <th>Gender</th>
                  <th>Joined</th>
                  <th>City</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="empty-row">
                      {members.length === 0
                        ? 'No members yet. Click "New Member" to add.'
                        : 'No results match your search.'}
                    </td>
                  </tr>
                ) : (
                  filtered.map((m, index) => {
                    const fullName = [m.first_name, m.middle_name, m.last_name, m.name, m.lastName]
                      .filter(Boolean).join(' ') || '—';
                    const status = getStatus(m);
                    const styleBadge = STATUS_STYLE[status] || STATUS_STYLE.Pending;
                    return (
                      <tr key={m.id ?? index}>
                        <td>{index + 1}</td>
                        <td><strong>{fullName}</strong></td>
                        <td>{m.phone1 || '—'}</td>
                        <td>{m.aadhar_number || m.aadhar || '—'}</td>
                        <td>{m.pan_number || m.pan || '—'}</td>
                        <td>{m.gender || '—'}</td>
                        <td>{fmtDate(m.date_of_joining || m.doj)}</td>
                        <td>{m.perm_city || m.permCity || '—'}</td>
                        <td>
                          <span style={{
                            ...styleBadge,
                            padding: '4px 10px', borderRadius: 20,
                            fontSize: '0.78rem', fontWeight: 600,
                          }}>
                            {status}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button className="btn-small btn-view" onClick={() => openView(m)}>View</button>
                            <button className="btn-small" style={{ background: '#e8eaf6', color: '#3949ab' }} onClick={() => openEdit(m)}>Edit</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
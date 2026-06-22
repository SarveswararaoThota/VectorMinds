import React, { useState, useEffect } from 'react';
import './Users.css';
import { userAPI } from '../../api.js';

export default function UserList({ onCreateUser, onEditUser, onViewUser, currentUser }) {
  const [users, setUsers]       = useState([]);
  const [search, setSearch]     = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  const userId = currentUser?.id || currentUser?.userId || 1;

  const fetchUsers = async () => {
  setLoading(true);
  setError('');
  try {
    const res = await userAPI.getAll(userId);
    const raw = res?.result || res?.data || (Array.isArray(res) ? res : []);
    const formatted = raw.map(u => ({
      id:         u.id,
      firstName:  u.first_name,
      lastName:   u.last_name,
      surName:    u.surname,
      username:   u.user_name,
      department: u.Department,
      mobileNo:   u.phone_no,
      email:      u.email,
      tenantId:   u.tenant_id,
      branchId:   u.branch_id,
      userTypeId: u.role_id,
      isActive:   u.is_active,
    }));
    setUsers(formatted);
  } catch (err) {
    setError('Failed to load users. Please try again.');
  } finally {
    setLoading(false);
  }
};
  useEffect(() => { fetchUsers(); }, []);

  const filtered = users.filter(u =>
    (u.firstName + ' ' + u.lastName).toLowerCase().includes(search.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.username || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async () => {
    try {
      await userAPI.delete(deleteId, userId);
      setDeleteId(null);
      fetchUsers();
    } catch (err) {
      alert('Failed to delete user.');
      setDeleteId(null);
    }
  };

  return (
    <div className="users-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-sub">Manage all system users and their access</p>
        </div>
        <button className="btn-primary" onClick={onCreateUser}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add User
        </button>
      </div>

      <div className="stats-row">
        <div className="stat-card"><span className="stat-num">{users.length}</span><span className="stat-label">Total Users</span></div>
        <div className="stat-card"><span className="stat-num">{users.filter(u => u.isActive === 1 || u.isActive === true).length}</span><span className="stat-label">Active</span></div>
        <div className="stat-card"><span className="stat-num">{users.filter(u => !u.isActive).length}</span><span className="stat-label">Inactive</span></div>
        <div className="stat-card"><span className="stat-num">{[...new Set(users.map(u => u.userTypeId))].filter(Boolean).length}</span><span className="stat-label">Roles</span></div>
      </div>

      {error && <div className="api-error">{error} <button onClick={fetchUsers}>Retry</button></div>}

      <div className="table-card">
        <div className="table-toolbar">
          <div className="search-wrap">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input className="search-input" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <span className="result-count">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        <div className="table-wrap">
          {loading ? (
            <div className="table-loading"><div className="spinner" />Loading users...</div>
          ) : (
            <table className="users-table">
              <thead>
                <tr>
                  <th>#</th><th>Name</th><th>Email</th><th>Username</th>
                  <th>Mobile</th><th>Department</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan="8" className="empty-row">No users found</td></tr>
                ) : filtered.map((user, i) => (
                  <tr key={user.id} className="table-row" style={{ animationDelay: `${i * 0.05}s` }}>
                    <td className="td-num">{i + 1}</td>
                    <td>
                      <div className="user-cell">
                        <div className="avatar">{((user.firstName||'')[0]||'')}{((user.lastName||'')[0]||'')}</div>
                        <span className="user-name">{user.firstName} {user.lastName}</span>
                      </div>
                    </td>
                    <td className="td-email">{user.email}</td>
                    <td className="td-user">{user.username}</td>
                    <td className="td-dept">{user.mobileNo}</td>
                    <td className="td-dept">{user.department}</td>
                    <td>
                      <span className={`status-badge ${(user.isActive===1||user.isActive===true)?'status-active':'status-inactive'}`}>
                        <span className="status-dot" />{(user.isActive===1||user.isActive===true)?'Active':'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="action-btns">
                        <button className="action-btn view-btn" title="View" onClick={() => onViewUser(user)}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        </button>
                        <button className="action-btn edit-btn" title="Edit" onClick={() => onEditUser(user)}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button className="action-btn delete-btn" title="Delete" onClick={() => setDeleteId(user.id)}>
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
            <h3 className="modal-title">Delete User?</h3>
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
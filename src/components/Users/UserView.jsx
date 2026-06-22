import React from 'react';
import './Users.css';

const USER_TYPES = {
  1: 'Admin', 2: 'Manager', 3: 'Teller', 4: 'Auditor', 5: 'Clerk'
};

export default function UserView({ user, onBack, onEdit }) {
  if (!user) return null;

  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
  const initials = ((user.firstName || '')[0] || '') + ((user.lastName || '')[0] || '');
  const roleLabel = USER_TYPES[user.userTypeId] || user.userTypeId || '—';
  const isActive = user.isActive === 1 || user.isActive === true;

  const fields = [
    {
      label: 'First Name',
      value: user.firstName || '—',
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
    },
    {
      label: 'Last Name',
      value: user.lastName || '—',
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
    },
    {
      label: 'Sur Name',
      value: user.surName || '—',
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
    },
    {
      label: 'Email',
      value: user.email || '—',
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
    },
    {
      label: 'Mobile No',
      value: user.mobileNo || '—',
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
    },
    {
      label: 'Username',
      value: user.username || '—',
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
    },
    {
      label: 'Department',
      value: user.department || '—',
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
    },
    {
      label: 'Person Type',
      value: roleLabel,
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
    },
  ];

  return (
    <div className="users-page">
      <div className="page-header">
        <div className="header-left">
          <button className="back-btn" onClick={onBack}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <div>
            <h1 className="page-title">User Details</h1>
            <p className="page-sub">Viewing profile information</p>
          </div>
        </div>
        <button className="btn-primary" onClick={() => onEdit(user)}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          Edit User
        </button>
      </div>

      <div className="view-layout">
        <div className="profile-card">
          <div className="profile-avatar-lg">{initials.toUpperCase()}</div>
          <h2 className="profile-name">{fullName}</h2>
          <span className="role-badge">{roleLabel}</span>
          <div className="profile-dept">{user.department}</div>
          <div className={`status-badge mt-12 ${isActive ? 'status-active' : 'status-inactive'}`}>
            <span className="status-dot" />
            {isActive ? 'Active' : 'Inactive'}
          </div>
        </div>

        <div className="details-card">
          <div className="section-title" style={{ marginBottom: '20px' }}>
            <div className="section-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            Account Information
          </div>

          <div className="detail-fields">
            {fields.map(f => (
              <div className="detail-field" key={f.label}>
                <div className="detail-icon">{f.icon}</div>
                <div className="detail-content">
                  <span className="detail-label">{f.label}</span>
                  <span className="detail-value">{f.value}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="view-footer">
            <button className="btn-ghost" onClick={onBack}>← Back to List</button>
            <button className="btn-primary" onClick={() => onEdit(user)}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Edit This User
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
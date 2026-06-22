import React, { useState } from 'react';
import SBAccountScreen from './SBAccountScreen.jsx';
import '../Users/Users.css';

export default function SBAccount({ currentUser }) {
  const [screen, setScreen]       = useState('list');
  const [mode,   setMode]         = useState('create');
  const [selected, setSelected]   = useState(null);

  const goList     = () => { setScreen('list'); setSelected(null); };
  const openCreate = () => { setMode('create'); setSelected(null); setScreen('form'); };
  const openView   = (r) => { setMode('view');  setSelected(r);    setScreen('form'); };
  const openEdit   = (r) => { setMode('edit');  setSelected(r);    setScreen('form'); };

  if (screen === 'form') {
    return (
      <SBAccountScreen
        initialMode={mode}
        account={selected}
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
          <h1 className="page-title">SB Account</h1>
          <p className="page-sub">Manage savings bank accounts</p>
        </div>
        <button className="btn-primary" onClick={openCreate}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Account
        </button>
      </div>

      <div className="table-card">
        <div className="table-wrap">
          <table className="users-table">
            <thead>
              <tr>
                <th>#</th><th>Cust Id</th><th>Name</th><th>Scheme</th>
                <th>Account Type</th><th>Created Date</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr><td colSpan="8" className="empty-row">No accounts found. Click "New Account" to create.</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
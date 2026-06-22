import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import Login from './components/Login.jsx';
import Users from './components/Users/Users.jsx';
import Tenants from './components/Tenants/Tenants.jsx';
import Branches from './components/Branches/Branches.jsx';
import Membership from './components/Membership/Membership.jsx';
import QRCollection from './components/QRCollection/QRCollection.jsx';
import SBAccount from './components/SavingsAccount/Sbaccount.jsx';
import FDAccount from './components/FDAccount/FDAccountScreen.jsx';
import TaskList from './components/TaskList/TaskList.jsx';
import SideNav from './components/Sidenav.jsx';
import SessionTimeout from './components/Session/SessionTimeout.jsx';
import { customerAPI } from './api.js';
import './App.css';
import CAAccount from './components/CurrentAccount/CAAccountScreen.jsx';
import RDAccount from './components/RDAccount/RDAccountScreen.jsx';
import DDAccount from './components/DDAccount/DDAccountScreen.jsx';
import SDAccount from './components/SDAccount/SDAccountScreen.jsx';
import ShareTransaction from './components/ShareTransaction/ShareTransaction.jsx';

function AppRouter() {
  const [currentUser, setCurrentUser] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Check for existing session on load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      setCurrentUser(JSON.parse(user));
    }
    setLoading(false);
  }, []);

  const refreshPendingCount = useCallback(async () => {
    if (!currentUser) return;
    try {
      const userId = currentUser?.id ?? currentUser?.userId ?? 1;
      const res = await customerAPI.getAll(userId);
      const list = Array.isArray(res) ? res
        : Array.isArray(res?.data) ? res.data
        : Array.isArray(res?.customers) ? res.customers
        : Array.isArray(res?.result) ? res.result
        : Object.values(res ?? {}).find(v => Array.isArray(v)) ?? [];
      const pending = list.filter(r => r.approval_status === 'PENDING' || (!r.approval_status && r.status !== 'Approved')).length;
      setPendingCount(pending);
    } catch {
      // silently ignore
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      refreshPendingCount();
      const timer = setInterval(refreshPendingCount, 60000);
      return () => clearInterval(timer);
    }
  }, [currentUser, refreshPendingCount]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
  };

  const handleLogin = (user) => {
    setCurrentUser(user);
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Login Route */}
        <Route path="/login" element={
          currentUser ? <Navigate to="/membership" replace /> : <Login onLogin={handleLogin} />
        } />
        
        {/* Protected Routes - Only accessible when logged in */}
        <Route path="/*" element={
          currentUser ? (
            <div className="app-layout">
              <SessionTimeout onLogout={handleLogout} />
              <SideNav 
                pendingCount={pendingCount}
              />
              <main className="app-main">
                <Routes>
                  <Route path="/" element={<Navigate to="/membership" replace />} />
                  <Route path="/membership" element={<Membership currentUser={currentUser} />} />
                  <Route path="/users" element={<Users currentUser={currentUser} />} />
                  <Route path="/tenants" element={<Tenants currentUser={currentUser} />} />
                  <Route path="/branches" element={<Branches currentUser={currentUser} />} />
                  <Route path="/tasklist" element={<TaskList currentUser={currentUser} onActionComplete={refreshPendingCount} />} />
                  <Route path="/qr-collection" element={<QRCollection currentUser={currentUser} />} />
                  <Route path="/sb-account" element={<SBAccount currentUser={currentUser} />} />
                  <Route path="/fd-account" element={<FDAccount currentUser={currentUser} />} />
                  <Route path="/ca-account" element={<CAAccount currentUser={currentUser} />} />
                  <Route path="/rd-account" element={<RDAccount currentUser={currentUser} />} />
                  <Route path="/dd-account" element={<DDAccount currentUser={currentUser} />} />
                  <Route path="/accounts" element={<AccountsPlaceholder />} />
                  <Route path="/transactions" element={<PlaceholderPage title="Transactions" />} />
                  <Route path="/loans" element={<PlaceholderPage title="Loans" />} />
                  <Route path="/reports" element={<PlaceholderPage title="Reports" />} />
                  <Route path="/audit-log" element={<PlaceholderPage title="Audit Log" />} />
                  <Route path="/settings" element={<PlaceholderPage title="Settings" />} />
                  <Route path="/sd-account" element={<SDAccount currentUser={currentUser} />} />
                  <Route path="/share-transaction" element={<ShareTransaction currentUser={currentUser} />} />
                </Routes>
              </main>
            </div>
          ) : (
            <Navigate to="/login" replace />
          )
        } />
      </Routes>
    </Router>
  );
}

// Simple placeholder for Accounts page
function AccountsPlaceholder() {
  return (
    <div className="placeholder-page">
      <div className="placeholder-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="5" width="20" height="14" rx="2"/>
          <line x1="2" y1="10" x2="22" y2="10"/>
        </svg>
      </div>
      <h2>Accounts</h2>
      <p>Select SB Account or FD Account from the sidebar menu.</p>
    </div>
  );
}

// Placeholder Page Component
function PlaceholderPage({ title }) {
  return (
    <div className="placeholder-page">
      <div className="placeholder-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="3" width="7" height="7" rx="1"/>
          <rect x="14" y="3" width="7" height="7" rx="1"/>
          <rect x="3" y="14" width="7" height="7" rx="1"/>
          <rect x="14" y="14" width="7" height="7" rx="1"/>
        </svg>
      </div>
      <h2>{title}</h2>
      <p>This page is coming soon.</p>
    </div>
  );
}

export default AppRouter;
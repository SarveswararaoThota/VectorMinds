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
import { customerAPI } from './api';
import './App.css';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activePage, setActivePage]   = useState('User Management');
  const [pendingCount, setPendingCount] = useState(0);
  const [accountToEdit, setAccountToEdit] = useState(null); // For editing accounts

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
  };

  /* ── Fetch pending count to show badge on Task List nav item ── */
  const refreshPendingCount = useCallback(async () => {
    if (!currentUser) return;
    try {
      const userId = currentUser?.id ?? currentUser?.userId ?? 1;
      const res = await customerAPI.getAll(userId);
      const list = Array.isArray(res) ? res
        : Array.isArray(res?.data)      ? res.data
        : Array.isArray(res?.customers) ? res.customers
        : Array.isArray(res?.result)    ? res.result
        : Object.values(res ?? {}).find(v => Array.isArray(v)) ?? [];
      const pending = list.filter(r => !r.status || r.status === 'Pending').length;
      setPendingCount(pending);
    } catch {
      // silently ignore — badge is cosmetic
    }
  }, [currentUser]);

  /* Refresh count on login and every 60 seconds */
  useEffect(() => {
    refreshPendingCount();
    const timer = setInterval(refreshPendingCount, 60000);
    return () => clearInterval(timer);
  }, [refreshPendingCount]);

  /* Also refresh count whenever user navigates away from Task List
     (they may have just approved/rejected something) */
  const handleNavigate = (page) => {
    if (activePage === 'Task List' && page !== 'Task List') {
      refreshPendingCount();
    }
    setActivePage(page);
    // Reset account edit when navigating
    if (page !== 'SB Account' && page !== 'FD Account') {
      setAccountToEdit(null);
    }
  };

  const handleSBAccountSave = () => {
    console.log('SB Account saved');
    // You can add additional logic here like showing success message
  };

  const handleFDAccountSave = () => {
    console.log('FD Account saved');
    // You can add additional logic here like showing success message
  };

  const renderPage = () => {
    switch (activePage) {
      case 'User Management':
        return <Users currentUser={currentUser} />;
      
      case 'Tenant Management':
        return <Tenants currentUser={currentUser} />;
      
      case 'Branches Management':
        return <Branches currentUser={currentUser} />;
      
      case 'Membership':
        return (
          <Membership
            currentUser={currentUser}
            onTaskListSave={() => {
              refreshPendingCount();
              setActivePage('Task List');
            }}
          />
        );
      
      case 'Task List':
        return (
          <TaskList
            currentUser={currentUser}
            onBack={() => setActivePage('Membership')}
            onActionComplete={refreshPendingCount}
          />
        );
      
      case 'QR Collection':
        return <QRCollection currentUser={currentUser} />;
      
      case 'SB Account':
        return (
          <SBAccount
            currentUser={currentUser}
            onBack={() => setActivePage('Accounts')}
            onSave={handleSBAccountSave}
          />
        );
      
      case 'FD Account':
        return (
          <FDAccount
            currentUser={currentUser}
            initialMode="create"
            account={accountToEdit}
            onBack={() => setActivePage('Accounts')}
            onSave={handleFDAccountSave}
          />
        );
      
      case 'Dashboard':
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
            <h2>Dashboard</h2>
            <p>Welcome to Vaasudev Banking System</p>
            <div style={{ marginTop: '20px', display: 'flex', gap: '20px', justifyContent: 'center' }}>
              <div className="dashboard-card">
                <h3>Total Customers</h3>
                <p className="dashboard-number">1,234</p>
              </div>
              <div className="dashboard-card">
                <h3>Active Accounts</h3>
                <p className="dashboard-number">567</p>
              </div>
              <div className="dashboard-card">
                <h3>Pending Approvals</h3>
                <p className="dashboard-number">{pendingCount}</p>
              </div>
            </div>
          </div>
        );
      
      case 'Transactions':
        return (
          <div className="placeholder-page">
            <div className="placeholder-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <polyline points="17 1 21 5 17 9"/>
                <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
                <polyline points="7 23 3 19 7 15"/>
                <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
              </svg>
            </div>
            <h2>Transactions</h2>
            <p>Transaction management coming soon.</p>
          </div>
        );
      
      case 'Loans':
        return (
          <div className="placeholder-page">
            <div className="placeholder-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <line x1="12" y1="1" x2="12" y2="23"/>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
            <h2>Loans</h2>
            <p>Loan management coming soon.</p>
          </div>
        );
      
      case 'Reports':
        return (
          <div className="placeholder-page">
            <div className="placeholder-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
            </div>
            <h2>Reports</h2>
            <p>Reports and analytics coming soon.</p>
          </div>
        );
      
      case 'Audit Log':
        return (
          <div className="placeholder-page">
            <div className="placeholder-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <h2>Audit Log</h2>
            <p>Audit trail coming soon.</p>
          </div>
        );
      
      case 'Settings':
        return (
          <div className="placeholder-page">
            <div className="placeholder-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
            </div>
            <h2>Settings</h2>
            <p>System settings coming soon.</p>
          </div>
        );
      
      default:
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
            <h2>{activePage}</h2>
            <p>This page is coming soon.</p>
          </div>
        );
    }
  };

  return (
    <div className="app-layout">
      <SessionTimeout onLogout={handleLogout} />
      <SideNav
        activePage={activePage}
        onNavigate={handleNavigate}
        pendingCount={pendingCount}
      />
      <main className="app-main">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
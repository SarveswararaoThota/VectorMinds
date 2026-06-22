import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './SideNav.css';
import VassudevImg from './Images/Vassudev.png';

const NAV_ITEMS = [
  { label: 'Membership', path: '/membership', icon: '📝' },
  { label: 'User Management', path: '/users', icon: '👥' },
  { label: 'Tenant Management', path: '/tenants', icon: '🏢' },
  { label: 'Branches Management', path: '/branches', icon: '🏛️' },
  { label: 'Task List', path: '/tasklist', icon: '✅', badge: true },
{ label: 'Share Transaction', path: '/share-transaction', icon: '📊' },
  { 
    label: 'Accounts', 
    path: '/accounts', 
    icon: '🏦',
    subItems: [
      { label: 'SB Account', path: '/sb-account', icon: '💰' },
      { label: 'FD Account', path: '/fd-account', icon: '📈' },
      { label: 'CA Account', path: '/ca-account', icon: '💳' }, 
      { label: 'RD Account', path: '/rd-account', icon: '📊' },
      { label: 'DD Account', path: '/dd-account', icon: '📜' },
      { label: 'SD Account', path: '/sd-account', icon: '⭐' },
    ]
  },
  { label: 'QR Collection', path: '/qr-collection', icon: '📱' },
  { label: 'Transactions', path: '/transactions', icon: '💸' },
  { label: 'Loans', path: '/loans', icon: '💳' },
  { label: 'Reports', path: '/reports', icon: '📊' },
  { label: 'Audit Log', path: '/audit-log', icon: '🔍' },
  { label: 'Settings', path: '/settings', icon: '⚙️' },
];

export default function SideNav({ pendingCount = 0 }) {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({});
  const navigate = useNavigate();
  const location = useLocation();

  const toggleSubmenu = (label) => {
    setExpandedMenus(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const handleNavigate = (path) => {
    navigate(path);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const isSubItemActive = (item) => {
    if (item.subItems) {
      return item.subItems.some(sub => location.pathname === sub.path);
    }
    return false;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <aside className={`sidenav ${collapsed ? 'sidenav-collapsed' : ''}`}>
      {/* Logo area */}
      <div className="sidenav-logo">
        <div className="nav-logo-icon">
          <img src={VassudevImg} alt="Vaasudev Logo" className="nav-logo-img" />
        </div>
        {!collapsed && <span className="nav-logo-text">Vaasudev</span>}
      </div>

      {/* Toggle button */}
      <button
        className="sidenav-toggle"
        onClick={() => setCollapsed(!collapsed)}
        title={collapsed ? 'Expand' : 'Collapse'}
      >
        {collapsed ? '→' : '←'}
      </button>

      {/* Nav items */}
      <nav className="sidenav-nav">
        {!collapsed && <span className="nav-section-label">MAIN MENU</span>}
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.path) || isSubItemActive(item);
          const hasSubItems = item.subItems && item.subItems.length > 0;
          const isExpanded = expandedMenus[item.label];
          const showBadge = item.badge && pendingCount > 0;
          
          return (
            <div key={item.label}>
              <button
                className={`nav-item ${active ? 'nav-item-active' : ''}`}
                onClick={() => {
                  if (hasSubItems && !collapsed) {
                    toggleSubmenu(item.label);
                  } else {
                    handleNavigate(item.path);
                  }
                }}
                title={collapsed ? item.label : ''}
              >
                <span className="nav-icon" style={{ position: 'relative' }}>
                  {item.icon}
                  {showBadge && (
                    <span className="nav-pending-dot">
                      {pendingCount > 99 ? '99+' : pendingCount}
                    </span>
                  )}
                </span>
                {!collapsed && <span className="nav-label">{item.label}</span>}
                {!collapsed && hasSubItems && (
                  <span className={`nav-chevron ${isExpanded ? 'nav-chevron-expanded' : ''}`}>
                    ▼
                  </span>
                )}
                {!collapsed && showBadge && (
                  <span className="nav-badge">{pendingCount > 99 ? '99+' : pendingCount}</span>
                )}
              </button>
              
              {/* Submenu items */}
              {hasSubItems && !collapsed && isExpanded && (
                <div className="nav-submenu">
                  {item.subItems.map((subItem) => {
                    const isSubActive = location.pathname === subItem.path;
                    return (
                      <button
                        key={subItem.label}
                        className={`nav-item nav-subitem ${isSubActive ? 'nav-item-active' : ''}`}
                        onClick={() => handleNavigate(subItem.path)}
                      >
                        <span className="nav-icon">{subItem.icon}</span>
                        <span className="nav-label">{subItem.label}</span>
                        {isSubActive && <span className="nav-active-dot" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom: logout */}
      <div className="sidenav-bottom">
        <div className="nav-divider" />
        <button className="nav-item nav-logout" onClick={handleLogout} title={collapsed ? 'Logout' : ''}>
          <span className="nav-icon">🚪</span>
          {!collapsed && <span className="nav-label">Logout</span>}
        </button>

        {!collapsed && (
          <div className="sidenav-footer">
            <p>&copy; {new Date().getFullYear()} All Rights Reserved.</p>
            <p>Vaasudev Mutually Aided Cooperative Thrift and Credit Society Limited</p>
          </div>
        )}
      </div>
    </aside>
  );
}
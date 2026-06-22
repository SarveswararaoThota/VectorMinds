import React, { useState } from 'react';
import './Login.css';
import VassudevImg from './Images/Vassudev.png';
import { authAPI } from '../api.js';

// Auto-calculate financial year (April to March)
function getFinancialYear() {
  const now = new Date();
  const month = now.getMonth(); // 0=Jan, 3=April
  const year = now.getFullYear();
  if (month >= 3) {
    return `${year}-${year + 1}`;
  } else {
    return `${year - 1}-${year}`;
  }
}

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const financialYear = getFinancialYear();

  const handleSubmit = async () => {
    if (!username || !password) {
      setError('Please enter username and password');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await authAPI.login(username, password);
      if (res?.success) {
        if (remember) {
          localStorage.setItem('rememberedUser', username);
        }
        onLogin(res?.result || res?.user || res);
      } else {
        setError('Invalid username or password');
      }
    } catch (err) {
      setError('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  // Load remembered username on mount
  React.useEffect(() => {
    const rememberedUser = localStorage.getItem('rememberedUser');
    if (rememberedUser) {
      setUsername(rememberedUser);
      setRemember(true);
    }
  }, []);

  return (
    <div className="login-page">

      {/* ── Bank-themed SVG background icons ── */}
      <div className="bg-icons" aria-hidden="true">
        <svg className="bg-icon bi-1" viewBox="0 0 64 64" fill="none">
          <ellipse cx="32" cy="52" rx="20" ry="6" fill="currentColor"/>
          <ellipse cx="32" cy="44" rx="20" ry="6" fill="currentColor"/>
          <ellipse cx="32" cy="36" rx="20" ry="6" fill="currentColor"/>
          <path d="M12 36v16c0 3.31 8.95 6 20 6s20-2.69 20-6V36" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M12 44c0 3.31 8.95 6 20 6s20-2.69 20-6" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
        <svg className="bg-icon bi-2" viewBox="0 0 64 64" fill="none">
          <rect x="8" y="28" width="48" height="28" rx="2" fill="currentColor" opacity=".6"/>
          <rect x="14" y="32" width="8" height="18" fill="currentColor"/>
          <rect x="28" y="32" width="8" height="18" fill="currentColor"/>
          <rect x="42" y="32" width="8" height="18" fill="currentColor"/>
          <polygon points="4,28 32,8 60,28" fill="currentColor"/>
          <rect x="6" y="54" width="52" height="4" rx="1" fill="currentColor"/>
        </svg>
        <svg className="bg-icon bi-3" viewBox="0 0 64 64" fill="none">
          <rect x="4" y="14" width="56" height="36" rx="5" fill="currentColor" opacity=".6"/>
          <rect x="4" y="22" width="56" height="10" fill="currentColor"/>
          <rect x="10" y="40" width="16" height="4" rx="2" fill="currentColor" opacity=".8"/>
          <rect x="32" y="40" width="8" height="4" rx="2" fill="currentColor" opacity=".8"/>
        </svg>
        <svg className="bg-icon bi-4" viewBox="0 0 64 64" fill="none">
          <rect x="8" y="8" width="48" height="48" rx="4" fill="currentColor" opacity=".5"/>
          <circle cx="32" cy="32" r="12" stroke="currentColor" strokeWidth="2" fill="none"/>
          <circle cx="32" cy="32" r="5" fill="currentColor"/>
          <line x1="32" y1="20" x2="32" y2="24" stroke="currentColor" strokeWidth="2"/>
          <line x1="32" y1="40" x2="32" y2="44" stroke="currentColor" strokeWidth="2"/>
          <line x1="20" y1="32" x2="24" y2="32" stroke="currentColor" strokeWidth="2"/>
          <line x1="40" y1="32" x2="44" y2="32" stroke="currentColor" strokeWidth="2"/>
          <rect x="48" y="28" width="8" height="8" rx="2" fill="currentColor" opacity=".7"/>
        </svg>
        <svg className="bg-icon bi-5" viewBox="0 0 64 64" fill="none">
          <ellipse cx="30" cy="36" rx="22" ry="18" fill="currentColor" opacity=".5"/>
          <circle cx="48" cy="30" r="6" fill="currentColor" opacity=".5"/>
          <circle cx="22" cy="30" r="3" fill="currentColor" opacity=".8"/>
          <rect x="26" y="14" width="12" height="6" rx="3" fill="currentColor" opacity=".7"/>
          <rect x="16" y="50" width="6" height="8" rx="2" fill="currentColor" opacity=".6"/>
          <rect x="36" y="50" width="6" height="8" rx="2" fill="currentColor" opacity=".6"/>
        </svg>
        <svg className="bg-icon bi-6" viewBox="0 0 64 64" fill="none">
          <polyline points="8,52 20,36 32,42 44,24 56,12" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          <polyline points="44,12 56,12 56,24" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round"/>
          <line x1="8" y1="56" x2="56" y2="56" stroke="currentColor" strokeWidth="2"/>
          <line x1="8" y1="8" x2="8" y2="56" stroke="currentColor" strokeWidth="2"/>
        </svg>
        <svg className="bg-icon bi-7" viewBox="0 0 64 64" fill="none">
          <path d="M32 6L10 14V30C10 43.25 19.6 55.5 32 58C44.4 55.5 54 43.25 54 30V14L32 6Z" fill="currentColor" opacity=".5"/>
          <polyline points="22,32 28,38 42,24" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <svg className="bg-icon bi-8" viewBox="0 0 64 64" fill="none">
          <circle cx="24" cy="28" r="16" fill="currentColor" opacity=".5"/>
          <circle cx="24" cy="28" r="10" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          <text x="19" y="33" fontSize="13" fill="currentColor" fontWeight="bold">₹</text>
          <circle cx="44" cy="42" r="12" fill="currentColor" opacity=".4"/>
        </svg>
        <svg className="bg-icon bi-9" viewBox="0 0 64 64" fill="none">
          <path d="M4 36l12-12h10l8 8h10l16-12" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M34 32l-6 6-4-4" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="12" cy="48" r="4" fill="currentColor" opacity=".6"/>
          <circle cx="52" cy="20" r="4" fill="currentColor" opacity=".6"/>
        </svg>
      </div>

      {/* Blobs */}
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      <div className="login-card">
        {/* Logo */}
        <div className="logo-wrap">
          <div className="logo-shield">
            <img src={VassudevImg} alt="Vaasudev Logo" className="logo-img" />
          </div>
        </div>

        {/* Title */}
        <div className="login-header">
          <h1 className="login-title">Vaasudev</h1>
          <p className="login-subtitle">Welcome back — please sign in to continue</p>
        </div>

        {/* Form */}
        <div className="login-form">
          <div className="field-group">
            <label className="field-label">Username</label>
            <div className="input-wrap">
              <span className="input-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </span>
              <input
                type="text"
                className="login-input"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
            </div>
          </div>

          <div className="field-group">
            <label className="field-label">Password</label>
            <div className="input-wrap">
              <span className="input-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                className="login-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="login-options">
            <label className="remember-label">
              <input
                type="checkbox"
                className="remember-check"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <span className="custom-check" />
              Remember username
            </label>
            <a href="#" className="forgot-link">Forgot password?</a>
          </div>

          {error && <p className="login-error">{error}</p>}
          <button type="button" className="signin-btn" onClick={handleSubmit} disabled={loading}>
            <span>{loading ? 'Signing in...' : 'Sign In'}</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>

        {/* Footer */}
        <p className="login-footer">
          &copy; {new Date().getFullYear()} All Rights Reserved.
          <br />
          Vaasudev Mutually Aided Cooperative Thrift and Credit Society Limited
        </p>
      </div>
    </div>
  );
}

export default Login;
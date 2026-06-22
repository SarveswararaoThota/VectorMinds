import React, { useState, useEffect, useCallback, useRef } from 'react';
import './SessionTimeout.css';

const TIMEOUT_DURATION = 30 * 60 * 1000; // 30 minutes

export default function SessionTimeout({ onLogout }) {
  const [showPopup, setShowPopup] = useState(false);
  const timerRef = useRef(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setShowPopup(true);
    }, TIMEOUT_DURATION);
  }, []);

  useEffect(() => {
    const events = ['mousemove', 'mousedown', 'keypress', 'touchstart', 'scroll', 'click'];
    events.forEach(e => window.addEventListener(e, resetTimer));
    resetTimer(); // start timer on mount

    return () => {
      events.forEach(e => window.removeEventListener(e, resetTimer));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [resetTimer]);

  const handleCancel = () => {
    setShowPopup(false);
    resetTimer(); // restart timer
  };

  const handleSignIn = () => {
    setShowPopup(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    onLogout && onLogout();
  };

  if (!showPopup) return null;

  return (
    <div className="st-overlay">
      <div className="st-modal">
        {/* Close button */}
        <button className="st-close" onClick={handleCancel}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6"  y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        {/* Message */}
        <div className="st-body">
          <p className="st-message">Your session has ended</p>
        </div>

        {/* Actions */}
        <div className="st-footer">
          <button className="st-cancel" onClick={handleCancel}>Cancel</button>
          <button className="st-signin" onClick={handleSignIn}>Sign In Again</button>
        </div>
      </div>
    </div>
  );
}
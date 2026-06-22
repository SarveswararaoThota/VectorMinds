import React, { useState, useEffect, useRef } from 'react';
import '../Users/Users.css';
import './QRCollection.css';
import { collectionAPI, branchAPI } from '../../api.js';

const LOAN_TYPES    = ['Savings Account', 'Group Loan', 'Vehicle Loan', 'Personal Loan'];
const AREAS         = ['Kukatpally', 'Jeedimetla', 'Uppal', 'Shamshabad', 'Rampally'];
const PAYMENT_TYPES = ['UPI / QR', 'Savings Account'];

const PAYMENT_COLORS = {
  'UPI / QR':        'pay-upi',
  'Savings Account': 'pay-cash',
};

const LOAN_COLORS = {
  'Savings Account': 'loan-home',
  'Group Loan':      'loan-group',
  'Vehicle Loan':    'loan-vehicle',
  'Personal Loan':   'loan-personal',
};

const EMPTY_FORM = {
  branch_name: '', branch_code: '', loan_type: '', borrower_name: '',
  area_name: '', transaction_number: '', amount: '', payment_type: '', remarks: '',
};

/* ── helper: format Date → "YYYY-MM-DD" ── */
const toDateStr = (d) => {
  const date = d ? new Date(d) : new Date();
  return date.toISOString().slice(0, 10);
};

/* ── helper: format "YYYY-MM-DD" → "DD MMM YYYY" for display ── */
const formatDisplay = (str) => {
  if (!str) return '';
  const [y, m, d] = str.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${d} ${months[Number(m) - 1]} ${y}`;
};

export default function QRCollection({ currentUser }) {
  const userId = currentUser?.id || currentUser?.userId || 1;

  const [form,      setForm]      = useState({ ...EMPTY_FORM });
  const [records,   setRecords]   = useState([]);
  const [branches,  setBranches]  = useState([]);
  const [errors,    setErrors]    = useState({});
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [apiError,  setApiError]  = useState('');
  const [editingId, setEditingId] = useState(null);
  const [activeTab, setActiveTab] = useState('All');
  const [selectedDate, setSelectedDate] = useState(toDateStr()); // default = today
  const txnRef = useRef(null);

  /* ── fetch branches & records on mount ── */
  useEffect(() => {
    fetchAll();
    fetchBranches();
  }, []);

  const fetchAll = async () => {
    setLoading(true); setApiError('');
    try {
      const res = await collectionAPI.getAll(userId);
      setRecords(Array.isArray(res) ? res : res.result || []);
    } catch {
      setApiError('Failed to load collection records.');
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const res = await branchAPI.getAll(userId);
      setBranches(Array.isArray(res) ? res : res.result || []);
    } catch {
      // silently fallback to empty
    }
  };

  /* ── field setter ── */
  const set = (field, value) => {
    setForm(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'branch_name') {
        const found = branches.find(b => (b.name || b.branch_name) === value);
        updated.branch_code = found ? (found.code || found.branch_code || '') : '';
      }
      return updated;
    });
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  /* ── validation ── */
  const validate = () => {
    const e = {};
    if (!form.branch_name)               e.branch_name        = 'Required';
    if (!form.loan_type)                 e.loan_type          = 'Required';
    if (!form.borrower_name.trim())      e.borrower_name      = 'Required';
    if (!form.transaction_number.trim()) e.transaction_number = 'Required';
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) e.amount = 'Valid amount required';
    if (!form.payment_type)              e.payment_type       = 'Required';
    return e;
  };

  /* ── add record ── */
  const handleAdd = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true); setApiError('');
    try {
      await collectionAPI.insert(form, userId);
      setForm({ ...EMPTY_FORM });
      setErrors({});
      setEditingId(null);
      await fetchAll();
      txnRef.current?.focus();
    } catch {
      setApiError('Failed to save record. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  /* ── update record ── */
  const handleUpdate = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true); setApiError('');
    try {
      await collectionAPI.update(editingId, form, userId);
      setForm({ ...EMPTY_FORM });
      setErrors({});
      setEditingId(null);
      await fetchAll();
      txnRef.current?.focus();
    } catch {
      setApiError('Failed to update record. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  /* ── edit record ── */
  const handleEdit = (record) => {
    setEditingId(record.id);
    setForm({
      branch_name:        record.branch_name        || '',
      branch_code:        record.branch_code        || '',
      loan_type:          record.loan_type          || '',
      borrower_name:      record.borrower_name      || '',
      area_name:          record.area_name          || '',
      transaction_number: record.transaction_number || '',
      amount:             record.amount             || '',
      payment_type:       record.payment_type       || '',
      remarks:            record.remarks            || '',
    });
    setErrors({});
    document.querySelector('.qrc-form-card')?.scrollIntoView({ behavior: 'smooth' });
  };

  /* ── delete record ── */
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this record?')) return;
    try {
      await collectionAPI.delete(id, userId);
      await fetchAll();
    } catch {
      setApiError('Failed to delete record.');
    }
  };

  /* ── clear form ── */
  const handleClear = () => {
    setForm({ ...EMPTY_FORM });
    setErrors({});
    setEditingId(null);
  };

  /* ── date navigation ── */
  const goToPrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(toDateStr(d));
  };
  const goToNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(toDateStr(d));
  };
  const goToToday = () => setSelectedDate(toDateStr());
  const isToday = selectedDate === toDateStr();

  /* ── filter by date first, then by branch tab ── */
  const dateFiltered = records.filter(r => {
    if (!r.created_at && !r.date) return false;
    const recDate = toDateStr(r.created_at || r.date);
    return recDate === selectedDate;
  });

  const branchTabs      = ['All', ...Array.from(new Set(dateFiltered.map(r => r.branch_name).filter(Boolean)))];
  const filteredRecords = activeTab === 'All' ? dateFiltered : dateFiltered.filter(r => r.branch_name === activeTab);
  const filteredTotal   = filteredRecords.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);

  /* ── export CSV (exports current filtered view) ── */
  const exportExcel = () => {
    const headers = ['#','Branch','Code','Loan Type','Borrower Name','Amount (₹)','Area/Center','TXN Number','Payment Type','Remarks'];
    const rows = filteredRecords.map((r, i) =>
      [i+1, r.branch_name, r.branch_code, r.loan_type, r.borrower_name,
       r.amount, r.area_name, r.transaction_number, r.payment_type, r.remarks].join(',')
    );
    const csv  = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a'); a.href = url; a.download = `qr_collection_${selectedDate}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => window.print();

  /* branch options — from API */
  const branchOptions = branches.map(b => ({
    label: b.name || '',
    code:  b.code || '',
  }));

  return (
    <div className="users-page qrc-page">

      {/* ── Page Header ── */}
      <div className="qrc-header">
        <div>
          <div className="qrc-title-row">
            <span className="qrc-emoji">📶</span>
            <h1 className="page-title">QR Collection</h1>
            <span className="qrc-live-badge">LIVE</span>
          </div>
          <p className="page-sub">Record and manage QR-based loan collections</p>
        </div>
      </div>

      {apiError && <div className="api-error">{apiError} <button onClick={fetchAll}>Retry</button></div>}

      {/* ══ COLLECTION ENTRY FORM ══ */}
      <div className="qrc-form-card">
        <h2 className="qrc-section-title">
          {editingId ? 'EDIT COLLECTION' : 'COLLECTION ENTRY'}
          {editingId && <span className="edit-badge">Editing Record #{editingId}</span>}
        </h2>

        {/* Row 1 */}
        <div className="qrc-grid-4">

          <div className="qrc-field">
            <label className="qrc-label">BRANCH <span className="req">*</span></label>
            <select
              className={`qrc-select ${errors.branch_name ? 'input-error' : ''}`}
              value={form.branch_name}
              onChange={e => set('branch_name', e.target.value)}
            >
              <option value="">Select Branch</option>
              {branchOptions.map(b => <option key={b.label} value={b.label}>{b.label}</option>)}
            </select>
            {errors.branch_name && <span className="error-msg">{errors.branch_name}</span>}
          </div>

          <div className="qrc-field">
            <label className="qrc-label">BRANCH CODE</label>
            <input className="qrc-input qrc-autofill" value={form.branch_code} readOnly placeholder="Auto-filled" />
          </div>

          <div className="qrc-field">
            <label className="qrc-label">TYPE OF LOAN <span className="req">*</span></label>
            <select
              className={`qrc-select ${errors.loan_type ? 'input-error' : ''}`}
              value={form.loan_type}
              onChange={e => set('loan_type', e.target.value)}
            >
              <option value="">Select Loan Type</option>
              {LOAN_TYPES.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            {errors.loan_type && <span className="error-msg">{errors.loan_type}</span>}
          </div>

          <div className="qrc-field">
            <label className="qrc-label">BORROWER NAME <span className="req">*</span></label>
            <input
              className={`qrc-input ${errors.borrower_name ? 'input-error' : ''}`}
              placeholder="Full name"
              value={form.borrower_name}
              onChange={e => set('borrower_name', e.target.value)}
            />
            {errors.borrower_name && <span className="error-msg">{errors.borrower_name}</span>}
          </div>

        </div>

        {/* Row 2 */}
        <div className="qrc-grid-4">

          <div className="qrc-field">
            <label className="qrc-label">AREA NAME / CENTER</label>
            <select className="qrc-select" value={form.area_name} onChange={e => set('area_name', e.target.value)}>
              <option value="">Select Area/Center</option>
              {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          <div className="qrc-field">
            <label className="qrc-label">TRANSACTION NUMBER <span className="req">*</span></label>
            <input
              ref={txnRef}
              className={`qrc-input ${errors.transaction_number ? 'input-error' : ''}`}
              placeholder="e.g. TXN20240501"
              value={form.transaction_number}
              onChange={e => set('transaction_number', e.target.value)}
            />
            {errors.transaction_number && <span className="error-msg">{errors.transaction_number}</span>}
          </div>

          <div className="qrc-field">
            <label className="qrc-label">AMOUNT (₹) <span className="req">*</span></label>
            <input
              className={`qrc-input qrc-amount ${errors.amount ? 'input-error' : ''}`}
              placeholder="0.00"
              type="number"
              min="0"
              value={form.amount}
              onChange={e => set('amount', e.target.value)}
            />
            {errors.amount && <span className="error-msg">{errors.amount}</span>}
          </div>

          <div className="qrc-field">
            <label className="qrc-label">PAYMENT TYPE <span className="req">*</span></label>
            <select
              className={`qrc-select ${errors.payment_type ? 'input-error' : ''}`}
              value={form.payment_type}
              onChange={e => set('payment_type', e.target.value)}
            >
              <option value="">Select Payment Type</option>
              {PAYMENT_TYPES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            {errors.payment_type && <span className="error-msg">{errors.payment_type}</span>}
          </div>

        </div>

        {/* Remarks */}
        <div className="qrc-field qrc-remarks-field">
          <label className="qrc-label">REMARKS</label>
          <input
            className="qrc-input"
            placeholder="Optional notes..."
            value={form.remarks}
            onChange={e => set('remarks', e.target.value)}
          />
        </div>

        {/* Buttons */}
        <div className="qrc-form-actions">
          {editingId ? (
            <>
              <button className="qrc-btn-update" onClick={handleUpdate} disabled={saving}>
                {saving ? (
                  <><div className="spinner-sm" />Updating...</>
                ) : (
                  <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34"/><polygon points="18 2 22 6 12 16 8 16 8 12 18 2"/></svg>Update Record</>
                )}
              </button>
              <button className="qrc-btn-cancel" onClick={handleClear}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                Cancel
              </button>
            </>
          ) : (
            <>
              <button className="qrc-btn-add" onClick={handleAdd} disabled={saving}>
                {saving ? (
                  <><div className="spinner-sm" />Saving...</>
                ) : (
                  <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>Add Record</>
                )}
              </button>
              <button className="qrc-btn-clear" onClick={handleClear}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                Clear
              </button>
            </>
          )}
        </div>
      </div>

      {/* ══ COLLECTION RECORDS TABLE ══ */}
      <div className="qrc-table-card">

        {/* Table Header */}
        <div className="qrc-table-header">
          <div>
            <h2 className="qrc-records-title">Collection Records</h2>
            <p className="qrc-records-sub">
              {filteredRecords.length} {filteredRecords.length === 1 ? 'entry' : 'entries'}
              {activeTab !== 'All' && ` · ${activeTab}`}
            </p>
          </div>
          <div className="qrc-export-btns">
            <button className="qrc-btn-excel" onClick={exportExcel}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>
              Export Excel
            </button>
            <button className="qrc-btn-pdf" onClick={exportPDF}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              Export PDF
            </button>
          </div>
        </div>

        {/* ── Date Navigator ── */}
        <div className="qrc-date-nav">
          <button className="qrc-date-arrow" onClick={goToPrevDay} title="Previous day">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          </button>

          <div className="qrc-date-center">
            <input
              type="date"
              className="qrc-date-input"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
            />
            <span className="qrc-date-display">{formatDisplay(selectedDate)}</span>
            {!isToday && (
              <button className="qrc-today-btn" onClick={goToToday}>Today</button>
            )}
            {isToday && <span className="qrc-today-badge">Today</span>}
          </div>

          <button
            className="qrc-date-arrow"
            onClick={goToNextDay}
            disabled={isToday}
            title="Next day"
            style={{ opacity: isToday ? 0.35 : 1 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>

        {/* ── Branch Tabs ── */}
        <div className="qrc-branch-tabs">
          {branchTabs.map(tab => (
            <button
              key={tab}
              className={`qrc-tab-btn ${activeTab === tab ? 'qrc-tab-active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
              <span className="qrc-tab-count">
                {tab === 'All' ? dateFiltered.length : dateFiltered.filter(r => r.branch_name === tab).length}
              </span>
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="table-wrap">
          {loading ? (
            <div className="table-loading"><div className="spinner" />Loading records...</div>
          ) : (
            <table className="users-table qrc-table">
              <thead>
                <tr>
                  <th>#</th><th>BRANCH</th><th>CODE</th><th>LOAN TYPE</th>
                  <th>BORROWER NAME</th><th>AMOUNT (₹)</th><th>AREA / CENTER</th>
                  <th>TXN NUMBER</th><th>PAYMENT TYPE</th><th>REMARKS</th><th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.length === 0 ? (
                  <tr><td colSpan="11" className="empty-row">
                    {activeTab === 'All'
                      ? `No records for ${formatDisplay(selectedDate)}.`
                      : `No records for ${activeTab} on ${formatDisplay(selectedDate)}.`}
                  </td></tr>
                ) : (
                  <>
                    {filteredRecords.map((r, i) => (
                      <tr key={r.id || i} className={`table-row ${editingId === r.id ? 'row-editing' : ''}`} style={{ animationDelay: `${i * 0.04}s` }}>
                        <td className="td-num">{i + 1}</td>
                        <td className="qrc-td-branch">{r.branch_name}</td>
                        <td><span className="qrc-code">{r.branch_code}</span></td>
                        <td><span className={`qrc-loan-badge ${LOAN_COLORS[r.loan_type] || ''}`}>{r.loan_type}</span></td>
                        <td className="qrc-td-name">{r.borrower_name}</td>
                        <td className="qrc-td-amount">₹{Number(r.amount).toLocaleString('en-IN')}</td>
                        <td className="td-dept">{r.area_name || '—'}</td>
                        <td><span className="qrc-txn">{r.transaction_number}</span></td>
                        <td><span className={`qrc-pay-badge ${PAYMENT_COLORS[r.payment_type] || ''}`}>{r.payment_type}</span></td>
                        <td className="qrc-td-remarks">{r.remarks || '—'}</td>
                        <td className="action-cell">
                          <button className="action-btn edit-btn" title="Edit" onClick={() => handleEdit(r)}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34"/><polygon points="18 2 22 6 12 16 8 16 8 12 18 2"/></svg>
                          </button>
                          <button className="action-btn delete-btn" title="Delete" onClick={() => handleDelete(r.id)}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                    <tr className="qrc-total-row">
                      <td colSpan="5" className="qrc-total-label">Total</td>
                      <td className="qrc-total-amount">₹{filteredTotal.toLocaleString('en-IN')}</td>
                      <td colSpan="5"></td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import './Users.css';
// import { userAPI, tenantAPI, branchAPI } from '../../api.js';
import { userAPI, tenantAPI, branchAPI, roleAPI } from '../../api.js';

const DEPARTMENTS = ['IT', 'Finance', 'Operations', 'Audit', 'HR', 'Compliance', 'Loans', 'Investment Department', 'Accounts', 'Head Office'];

export default function UserForm({ user, onBack, onSave, currentUser }) {
  const isEdit = !!user;
  const userId = currentUser?.id || currentUser?.userId || 1;

  const [form, setForm] = useState({
    tenantId: '', branchId: '', userTypeId: '',
    firstName: '', lastName: '', surName: '',
    email: '', phone: '', department: '',
    username: '', password: '', confirmPassword: '',
    isActive: 1,
  });

  const [tenants, setTenants]   = useState([]);
  const [branches, setBranches] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [errors, setErrors]     = useState({});
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [apiError, setApiError] = useState('');
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    // Load tenants and branches for dropdowns
    tenantAPI.getAll(userId).then(res => {
      const tenantsData = res?.result || res?.data || (Array.isArray(res) ? res : []);
      setTenants(tenantsData);
    }).catch(() => {});
    
    branchAPI.getAll(userId).then(res => {
      const branchesData = res?.result || res?.data || (Array.isArray(res) ? res : []);
      setBranches(branchesData);
    }).catch(() => {});

    roleAPI.getAll(userId).then(res => {
  const rolesData = res?.result || res?.data || (Array.isArray(res) ? res : []);
  setRoles(rolesData);
}).catch(() => {});

    if (isEdit) {
      setForm({
        ...user,
        tenantId:   user.tenantId   || '',
        branchId:   user.branchId   || '',
        userTypeId: user.userTypeId || '',
        phone:      user.mobileNo   || '',
        password: '', confirmPassword: '',
      });
    }
  }, [user]);

  const set = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.tenantId)          e.tenantId   = 'Tenant is required';
    if (!form.branchId)          e.branchId   = 'Branch is required';
    if (!form.userTypeId)        e.userTypeId = 'Person type is required';
    if (!form.firstName.trim())  e.firstName  = 'First name is required';
    if (!form.lastName.trim())   e.lastName   = 'Last name is required';
    if (!form.email.trim())      e.email      = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.phone.trim())      e.phone      = 'Phone number is required';
    if (!form.department)        e.department = 'Department is required';
    if (!form.username.trim())   e.username   = 'Username is required';
    if (!isEdit) {
      if (!form.password)        e.password = 'Password is required';
      else if (form.password.length < 6) e.password = 'Min 6 characters';
      if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    }
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    setSaving(true);
    setApiError('');
    try {
      const payload = {
        ...form,
        mobileNo: form.phone,
      };
      if (isEdit) {
        await userAPI.update(payload, userId);
      } else {
        await userAPI.insert(payload, userId);
      }
      setSaved(true);
      setTimeout(() => { onSave && onSave(); }, 1000);
    } catch (err) {
      setApiError('Failed to save user. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="users-page">
      <div className="page-header">
        <div className="header-left">
          <button className="back-btn" onClick={onBack}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <div>
            <h1 className="page-title">{isEdit ? 'Edit User' : 'Create User'}</h1>
            <p className="page-sub">{isEdit ? `Editing — ${user.firstName} ${user.lastName}` : 'Add a new user to the system'}</p>
          </div>
        </div>
      </div>

      {apiError && <div className="api-error">{apiError}</div>}

      <div className="form-card">
        {/* Personal Info */}
        <div className="form-section">
          <div className="section-title">
            <div className="section-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            Personal Information
          </div>
          <div className="form-grid form-grid-3">

            <div className="form-field">
              <label className="form-label">Tenant <span className="req">*</span></label>
              <select className={`form-input form-select ${errors.tenantId ? 'input-error' : ''}`} value={form.tenantId} onChange={e => set('tenantId', e.target.value)}>
                <option value="">Select tenant...</option>
                {tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              {errors.tenantId && <span className="error-msg">{errors.tenantId}</span>}
            </div>

            <div className="form-field">
              <label className="form-label">Branch <span className="req">*</span></label>
              <select className={`form-input form-select ${errors.branchId ? 'input-error' : ''}`} value={form.branchId} onChange={e => set('branchId', e.target.value)}>
                <option value="">Select branch...</option>
                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
              {errors.branchId && <span className="error-msg">{errors.branchId}</span>}
            </div>

            <div className="form-field">
              <label className="form-label">Person Type <span className="req">*</span></label>
              <select className={`form-input form-select ${errors.userTypeId ? 'input-error' : ''}`} value={form.userTypeId} onChange={e => set('userTypeId', e.target.value)}>
              <option value="">Select type...</option>
                {roles.map(r => (
                  <option key={r.id} value={r.id}>{r.name || r.role_name || r.roleName}</option>
                ))}
              </select>
              {errors.userTypeId && <span className="error-msg">{errors.userTypeId}</span>}
            </div>

            <div className="form-field">
              <label className="form-label">First Name <span className="req">*</span></label>
              <input className={`form-input ${errors.firstName ? 'input-error' : ''}`} placeholder="e.g. Arjun" value={form.firstName} onChange={e => set('firstName', e.target.value)} />
              {errors.firstName && <span className="error-msg">{errors.firstName}</span>}
            </div>

            <div className="form-field">
              <label className="form-label">Last Name <span className="req">*</span></label>
              <input className={`form-input ${errors.lastName ? 'input-error' : ''}`} placeholder="e.g. Sharma" value={form.lastName} onChange={e => set('lastName', e.target.value)} />
              {errors.lastName && <span className="error-msg">{errors.lastName}</span>}
            </div>

            <div className="form-field">
              <label className="form-label">Sur Name</label>
              <input className="form-input" placeholder="e.g. Kumar" value={form.surName || ''} onChange={e => set('surName', e.target.value)} />
            </div>

            <div className="form-field">
              <label className="form-label">Email Address <span className="req">*</span></label>
              <input className={`form-input ${errors.email ? 'input-error' : ''}`} type="email" placeholder="e.g. arjun@nrcbs.com" value={form.email} onChange={e => set('email', e.target.value)} />
              {errors.email && <span className="error-msg">{errors.email}</span>}
            </div>

            <div className="form-field">
              <label className="form-label">Phone Number <span className="req">*</span></label>
              <input className={`form-input ${errors.phone ? 'input-error' : ''}`} type="tel" placeholder="e.g. 9876543210" value={form.phone} onChange={e => set('phone', e.target.value)} />
              {errors.phone && <span className="error-msg">{errors.phone}</span>}
            </div>

            <div className="form-field">
              <label className="form-label">Department <span className="req">*</span></label>
              <select className={`form-input form-select ${errors.department ? 'input-error' : ''}`} value={form.department} onChange={e => set('department', e.target.value)}>
                <option value="">Select department...</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              {errors.department && <span className="error-msg">{errors.department}</span>}
            </div>

          </div>
        </div>

        <div className="form-divider" />

        {/* Account Credentials */}
        <div className="form-section">
          <div className="section-title">
            <div className="section-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            Account Credentials
          </div>
          <div className="form-grid">

            <div className="form-field">
              <label className="form-label">Username <span className="req">*</span></label>
              <input className={`form-input ${errors.username ? 'input-error' : ''}`} placeholder="e.g. arjun.sharma" value={form.username} onChange={e => set('username', e.target.value)} />
              {errors.username && <span className="error-msg">{errors.username}</span>}
            </div>

            <div className="form-field">
              <label className="form-label">Status</label>
              <div className="toggle-row">
                <span className={`toggle-label ${form.isActive ? 'tl-active' : 'tl-inactive'}`}>
                  {form.isActive ? 'Active' : 'Inactive'}
                </span>
                <button type="button" className={`toggle-switch ${form.isActive ? 'ts-on' : 'ts-off'}`} onClick={() => set('isActive', form.isActive ? 0 : 1)}>
                  <span className="ts-thumb" />
                </button>
              </div>
            </div>

            {!isEdit && (
              <>
                <div className="form-field">
                  <label className="form-label">Password <span className="req">*</span></label>
                  <div className="pw-wrap">
                    <input className={`form-input ${errors.password ? 'input-error' : ''}`} type={showPassword ? 'text' : 'password'} placeholder="Min 6 characters" value={form.password} onChange={e => set('password', e.target.value)} />
                    <button type="button" className="pw-toggle" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword
                        ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
                    </button>
                  </div>
                  {errors.password && <span className="error-msg">{errors.password}</span>}
                </div>

                <div className="form-field">
                  <label className="form-label">Confirm Password <span className="req">*</span></label>
                  <div className="pw-wrap">
                    <input className={`form-input ${errors.confirmPassword ? 'input-error' : ''}`} type={showConfirm ? 'text' : 'password'} placeholder="Re-enter password" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} />
                    <button type="button" className="pw-toggle" onClick={() => setShowConfirm(!showConfirm)}>
                      {showConfirm
                        ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
                    </button>
                  </div>
                  {errors.confirmPassword && <span className="error-msg">{errors.confirmPassword}</span>}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="form-footer">
          <button className="btn-ghost" onClick={onBack}>Cancel</button>
          <button className={`btn-primary ${saved ? 'btn-saved' : ''}`} onClick={handleSave} disabled={saving}>
            {saved ? (
              <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Saved!</>
            ) : saving ? (
              <><div className="spinner-sm" />Saving...</>
            ) : (
              <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>{isEdit ? 'Update User' : 'Create User'}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
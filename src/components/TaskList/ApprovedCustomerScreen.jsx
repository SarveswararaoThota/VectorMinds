import React, { useState } from 'react';

const S3_API_URL = 'https://2ry5cdvd77.execute-api.ap-south-1.amazonaws.com/Prod/api';

/* ── icons ── */
const Icons = {
  ArrowLeft: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>
    </svg>
  ),
  CheckCircle: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>
    </svg>
  ),
  User: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
    </svg>
  ),
  MapPin: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  FileText: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  ),
  Users: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  Calendar: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokelinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  Phone: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.36 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6.07 6.07l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  ),
  Mail: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
  ),
  Shield: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
};

function SafeImage({ src, alt, style }) {
  const [failed, setFailed] = useState(false);
  if (failed || !src) return null;
  return <img src={src} alt={alt} style={style} onError={() => setFailed(true)} crossOrigin="anonymous" />;
}

function InfoRow({ label, value }) {
  if (!value || value === '—') return null;
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '10px 0', borderBottom: '1px solid #f0fdf4' }}>
      <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 500, minWidth: 140 }}>{label}</span>
      <span style={{ fontSize: 13, color: '#111827', fontWeight: 500, textAlign: 'right', maxWidth: 220, wordBreak: 'break-word' }}>{value}</span>
    </div>
  );
}

function Section({ title, icon, children }) {
  return (
    <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #dcfce7', marginBottom: 16, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 20px', background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', borderBottom: '1px solid #dcfce7' }}>
        <span style={{ color: '#15803d' }}>{icon}</span>
        <span style={{ fontWeight: 700, fontSize: 14, color: '#15803d', letterSpacing: 0.3 }}>{title}</span>
      </div>
      <div style={{ padding: '4px 20px 8px' }}>{children}</div>
    </div>
  );
}

function fmt(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function ApprovedCustomerScreen({ customer, onBack, photoUrl, signatureUrl }) {
  const fn = customer.first_name || customer.firstName || '';
  const mn = customer.middle_name || customer.middleName || '';
  const ln = customer.last_name || customer.lastName || '';
  const fullName = [fn, mn, ln].filter(Boolean).join(' ') || `Customer ${customer.id}`;
  
  const [showPhoto, setShowPhoto] = useState(false);
  const [showSignature, setShowSignature] = useState(false);

  const permAddr = [
    customer.perm_flat_hno, customer.perm_street, customer.perm_landmark,
    customer.perm_village, customer.perm_mandal, customer.perm_district,
    customer.perm_city, customer.perm_state, customer.perm_country,
    customer.perm_pin
  ].filter(Boolean).join(', ') || '—';

  const tempAddr = [
    customer.temp_flat_hno, customer.temp_street, customer.temp_landmark,
    customer.temp_village, customer.temp_mandal, customer.temp_district,
    customer.temp_city, customer.temp_state, customer.temp_country,
    customer.temp_pin
  ].filter(Boolean).join(', ') || '—';

  const nominees = customer.nominees || [];
  const attachments = customer.attachments || customer.documents || [];

  // Determine which image to display
  const displayImage = showPhoto ? photoUrl : (showSignature ? signatureUrl : null);

  return (
    <div style={{ minHeight: '100vh', background: '#f0fdf4', fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#15803d,#16a34a)', padding: '16px 20px', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, maxWidth: 720, margin: '0 auto' }}>
          <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 10, padding: '8px 10px', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center' }}>
            <Icons.ArrowLeft />
          </button>
          <div>
            <div style={{ fontSize: 11, color: '#bbf7d0', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>Approved Member</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>{fullName}</div>
          </div>
          <div style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: '4px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icons.CheckCircle />
            <span style={{ fontSize: 12, color: '#fff', fontWeight: 600 }}>Approved</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '20px 16px 40px' }}>

        {/* Profile card */}
        <div style={{ background: '#fff', borderRadius: 16, border: '2px solid #86efac', marginBottom: 16, overflow: 'hidden' }}>
          <div style={{ background: 'linear-gradient(135deg,#15803d,#16a34a)', height: 80 }} />
          <div style={{ padding: '0 24px 24px', marginTop: -40 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', border: '3px solid #fff', background: '#dcfce7', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, color: '#15803d' }}>
                {displayImage
                  ? <SafeImage src={displayImage} alt={fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : fn.charAt(0).toUpperCase()
                }
              </div>
              <div style={{ paddingBottom: 4, flex: 1 }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}>{fullName}</div>
                <div style={{ fontSize: 13, color: '#6b7280' }}>ID: #{customer.id}</div>
                <div style={{ marginTop: 6, display: 'inline-flex', alignItems: 'center', gap: 5, background: '#dcfce7', borderRadius: 20, padding: '3px 10px' }}>
                  <Icons.CheckCircle />
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#15803d' }}>Active Member</span>
                </div>
              </div>
            </div>

            {/* Photo/Signature buttons */}
            {(photoUrl || signatureUrl) && (
              <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {photoUrl && (
                  <button
                    onClick={() => setShowPhoto(!showPhoto)}
                    style={{
                      padding: '6px 14px',
                      fontSize: '12px',
                      borderRadius: '6px',
                      border: showPhoto ? '2px solid #3b82f6' : '1px solid #d1d5db',
                      background: showPhoto ? '#eff6ff' : '#fff',
                      color: showPhoto ? '#2563eb' : '#6b7280',
                      cursor: 'pointer',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    📷 {showPhoto ? 'Hide Photo' : 'Show Photo'}
                  </button>
                )}
                {signatureUrl && (
                  <button
                    onClick={() => setShowSignature(!showSignature)}
                    style={{
                      padding: '6px 14px',
                      fontSize: '12px',
                      borderRadius: '6px',
                      border: showSignature ? '2px solid #8b5cf6' : '1px solid #d1d5db',
                      background: showSignature ? '#f5f3ff' : '#fff',
                      color: showSignature ? '#7c3aed' : '#6b7280',
                      cursor: 'pointer',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    ✍️ {showSignature ? 'Hide Signature' : 'Show Signature'}
                  </button>
                )}
              </div>
            )}

            {/* Quick stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 16 }}>
              {[
                { label: 'Joined', value: fmt(customer.date_of_joining) },
                { label: 'DOB', value: fmt(customer.dob) },
                { label: 'Age', value: customer.age ? `${customer.age} yrs` : '—' },
              ].map(s => (
                <div key={s.label} style={{ background: '#f0fdf4', borderRadius: 10, padding: '10px 12px', textAlign: 'center' }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#15803d' }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Personal Info */}
        <Section title="Personal Information" icon={<Icons.User />}>
          <InfoRow label="Gender" value={customer.gender} />
          <InfoRow label="Marital Status" value={customer.marital_status} />
          <InfoRow label="Religion" value={customer.religion} />
          <InfoRow label="Caste" value={customer.caste} />
          <InfoRow label="Occupation" value={customer.occupation} />
          <InfoRow label="Father / Husband" value={customer.father_husband_name} />
          <InfoRow label="Relation" value={customer.relation_type} />
          <InfoRow label="Mother Maiden Name" value={customer.mother_maiden_name} />
        </Section>

        {/* Contact */}
        <Section title="Contact Details" icon={<Icons.Phone />}>
          <InfoRow label="Phone 1" value={customer.phone1} />
          <InfoRow label="Phone 2" value={customer.phone2} />
          <InfoRow label="Email" value={customer.email} />
        </Section>

        {/* Identity */}
        <Section title="Identity Documents" icon={<Icons.Shield />}>
          <InfoRow label="Aadhar Number" value={customer.aadhar_number} />
          <InfoRow label="PAN Number" value={customer.pan_number} />
          <InfoRow label="Voter ID" value={customer.voter_id} />
          <InfoRow label="Passport" value={customer.passport_number} />
          <InfoRow label="Driving License" value={customer.driving_license} />
        </Section>

        {/* Address */}
        <Section title="Address" icon={<Icons.MapPin />}>
          <div style={{ padding: '10px 0', borderBottom: '1px solid #f0fdf4' }}>
            <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 600, marginBottom: 4 }}>PERMANENT</div>
            <div style={{ fontSize: 13, color: '#111827', lineHeight: 1.6 }}>{permAddr}</div>
          </div>
          {!customer.same_as_permanent && (
            <div style={{ padding: '10px 0' }}>
              <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 600, marginBottom: 4 }}>TEMPORARY</div>
              <div style={{ fontSize: 13, color: '#111827', lineHeight: 1.6 }}>{tempAddr}</div>
            </div>
          )}
        </Section>

        {/* Nominees */}
        {nominees.length > 0 && (
          <Section title={`Nominees (${nominees.length})`} icon={<Icons.Users />}>
            {nominees.map((n, i) => (
              <div key={i} style={{ padding: '12px 0', borderBottom: i < nominees.length - 1 ? '1px solid #f0fdf4' : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>{n.nomineeName || n.nominee_name || '—'}</div>
                    <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                      {n.relationType || n.relation_type} · {n.age ? `${n.age} yrs` : ''} · {n.phoneNo || n.phone_no || ''}
                    </div>
                  </div>
                  {n.percentageShare != null && (
                    <div style={{ background: '#dcfce7', borderRadius: 20, padding: '4px 12px', fontSize: 13, fontWeight: 700, color: '#15803d' }}>
                      {n.percentageShare}%
                    </div>
                  )}
                </div>
              </div>
            ))}
          </Section>
        )}

        {/* Attachments */}
        {attachments.length > 0 && (
          <Section title={`Documents (${attachments.length})`} icon={<Icons.FileText />}>
            {attachments.map((a, i) => {
              const docType = a.documentType || a.document_type || 'Document';
              const fname = a.fileName || a.file_name || a.filePath || '—';
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < attachments.length - 1 ? '1px solid #f0fdf4' : 'none' }}>
                  <div style={{ background: '#dcfce7', borderRadius: 8, padding: 8, color: '#15803d' }}>
                    <Icons.FileText />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{docType.replace(/_/g, ' ')}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af' }}>{fname.split('/').pop()}</div>
                  </div>
                </div>
              );
            })}
          </Section>
        )}
      </div>
    </div>
  );
}
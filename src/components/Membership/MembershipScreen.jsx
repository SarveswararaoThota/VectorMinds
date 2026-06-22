import React, { useState, useEffect } from 'react';
import '../Users/Users.css';
import './Membership.css';
import '../TaskList/TaskList.css';
import { customerAPI, s3API } from '../../api';
import TaskList from '../TaskList/TaskList';

/* ── default form state ── */
const EMPTY = {
  name: '', lastName: '', surname: '',
  fatherHusbandName: '', fhRelation: '', religion: '',
  motherMaidenName: '',
  gender: '', dob: '', age: '',
  doj: new Date().toISOString().split('T')[0],
  doa: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase(),
  aadhar: '', pan: '', phone1: '', phone2: '',
  email: '', occupation: '', maritalStatus: '',
  drivingLicense: '', passport: '', voterId: '', caste: '',
  permFlatHno: '', permStreet: '', permLandMark: '',
  permCity: '', permVillage: '', permMandal: '', permDistrict: '',
  permState: '', permCountry: 'INDIA', permPin: '',
  tempFlatHno: '', tempStreet: '', tempLandMark: '',
  tempCity: '', tempVillage: '', tempMandal: '', tempDistrict: '',
  tempState: '', tempCountry: 'INDIA', tempPin: '',
  sameAsPermanent: false,
  photo: null, signature: null,
};

const EMPTY_NOMINEE = {
  nomineeName: '', nomineePhone: '', nomineeDob: '',
  nomineeAge: '', nomineeRelation: '', nomineePercentage: '',
};

const EMPTY_ATTACHMENTS = {
  aadharCard: null, panCard: null,
  addressProof1: null, addressProof2: null, addressProof3: null,
};

const EMPTY_PREVIEWS = {
  aadharCard: null, panCard: null,
  addressProof1: null, addressProof2: null, addressProof3: null,
};

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal', 'Delhi', 'Other',
];

const ATTACHMENT_TYPES = [
  { key: 'aadharCard', label: 'Aadhar Card', accept: 'image/*,.pdf' },
  { key: 'panCard',    label: 'PAN Card',    accept: 'image/*,.pdf' },
];

// ── Derive a stable customer-id for S3 folder (digits of aadhar, or fallback)
const getS3CustomerId = (form, memberId) =>
  (form?.aadhar || '').replace(/\D/g, '')   // digits of Aadhar, e.g. "123456789012"
  || String(memberId || '')                  // member DB id
  || 'TEMP';                                 // last resort

/* ══════════════════════════════════════════
   REUSABLE COMPONENTS
   ══════════════════════════════════════════ */

const Field = ({ label, req, children, error }) => (
  <div className="ms-field">
    <label className="ms-label">{req && <span className="req">* </span>}{label}</label>
    {children}
    {error && <span className="error-msg">{error}</span>}
  </div>
);

const Input = React.memo(({ field, type = 'text', placeholder, disabled, value, onChange, isReadOnly, hasError }) => (
  <input
    className={`form-input ms-input ${hasError ? 'input-error' : ''} ${(isReadOnly || disabled) ? 'ms-readonly' : ''}`}
    type={type}
    placeholder={placeholder}
    value={value ?? ''}
    onChange={e => onChange(field, e.target.value)}
    readOnly={isReadOnly || disabled}
  />
));

const Select = React.memo(({ field, options, placeholder, value, onChange, isReadOnly, hasError }) => (
  <select
    className={`form-input form-select ms-input ${hasError ? 'input-error' : ''} ${isReadOnly ? 'ms-readonly' : ''}`}
    value={value || ''}
    onChange={e => onChange(field, e.target.value)}
    disabled={isReadOnly}
  >
    <option value="">{placeholder || '-- SELECT --'}</option>
    {options.map(o => <option key={o} value={o}>{o}</option>)}
  </select>
));

const NomineeInput = React.memo(({ idx, field, type = 'text', placeholder, disabled, value, onChange, isReadOnly, hasError }) => (
  <input
    className={`form-input ms-input ${hasError ? 'input-error' : ''} ${(isReadOnly || disabled) ? 'ms-readonly' : ''}`}
    type={type}
    placeholder={placeholder}
    value={value || ''}
    onChange={e => onChange(idx, field, e.target.value)}
    readOnly={isReadOnly || disabled}
  />
));

const NomineeSelect = React.memo(({ idx, field, options, value, onChange, isReadOnly }) => (
  <select
    className={`form-input form-select ms-input ${isReadOnly ? 'ms-readonly' : ''}`}
    value={value || ''}
    onChange={e => onChange(idx, field, e.target.value)}
    disabled={isReadOnly}
  >
    <option value="">-- SELECT --</option>
    {options.map(o => <option key={o} value={o}>{o}</option>)}
  </select>
));

/* ── AttachSlot — supports S3 preview in view/edit mode ── */
const AttachSlot = ({
  slotKey, label, accept,
  attachments, attachPreviews,
  isReadOnly, isUploading,
  handleAttachment, removeAttachment,
  s3CustomerId,
}) => {
  // Determine what to display:
  // 1. Local preview (blob URL from FileReader) — set immediately on file pick
  // 2. S3 URL built from stored s3Key — used in view/edit mode
  const localPreview = attachPreviews[slotKey];
  const s3Key = attachments[slotKey]?.s3Key || null;
  const isPdf = attachments[slotKey]?.file?.type === 'application/pdf'
    || (typeof s3Key === 'string' && s3Key.toLowerCase().endsWith('.pdf'));

  const displaySrc = localPreview
    || (s3Key && s3CustomerId
        ? `https://2ry5cdvd77.execute-api.ap-south-1.amazonaws.com/Prod/getFileS3/${s3CustomerId}/${s3Key}`
        : null);

  const fileName = attachments[slotKey]?.file?.name
    || (typeof s3Key === 'string' ? s3Key.split('/').pop() : null);

  return (
    <div className="ms-attach-box">
      <div className="ms-attach-header">
        <span className="ms-attach-label">{label}</span>
        {isUploading && (
          <span className="ms-attach-uploading">
            <span className="ms-attach-spinner" />
            Uploading…
          </span>
        )}
      </div>

      {displaySrc ? (
        <div className="ms-attach-preview-wrap">
          {isPdf ? (
            <div className="ms-attach-pdf-preview">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
              <span className="ms-attach-filename">{fileName}</span>
            </div>
          ) : (
            <img src={displaySrc} alt={label} className="ms-attach-img" />
          )}
          {!isReadOnly && (
            <button className="ms-attach-remove" onClick={() => removeAttachment(slotKey)}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>
      ) : (
        <label className={`ms-attach-upload ${isReadOnly ? 'ms-readonly' : ''} ${isUploading ? 'ms-attach-uploading-border' : ''}`}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          <span className="ms-attach-upload-text">{isUploading ? 'Uploading…' : 'Click to upload'}</span>
          <span className="ms-attach-upload-sub">Image or PDF</span>
          {!isReadOnly && !isUploading && (
            <input
              type="file"
              accept={accept}
              style={{ display: 'none' }}
              onChange={e => handleAttachment(slotKey, e.target.files[0])}
            />
          )}
        </label>
      )}
    </div>
  );
};

/* ── ADDRESS FIELDS ── */
const AddressFields = ({
  prefix, isTemp,
  form, errors, isReadOnly,
  pinLoading, pinPostOffices,
  onFieldChange, onSameAsPermanent,
  onPinChange, onPinFetch, onPostOfficeSelect,
}) => {
  const f = name => `${prefix}${name.charAt(0).toUpperCase() + name.slice(1)}`;
  const locked = isReadOnly || (isTemp && form.sameAsPermanent);
  const pinKey = prefix;
  const postOffices = pinPostOffices[pinKey] || [];

  const AddrInput = ({ name, placeholder }) => (
    <input
      className={`form-input ms-input ${locked ? 'ms-readonly' : ''}`}
      placeholder={placeholder}
      value={form[f(name)] || ''}
      onChange={e => onFieldChange(f(name), e.target.value)}
      readOnly={locked}
    />
  );

  return (
    <div className="ms-section-body">
      {isTemp && !isReadOnly && (
        <label className="ms-checkbox-row">
          <input
            type="checkbox"
            checked={form.sameAsPermanent || false}
            onChange={e => onSameAsPermanent(e.target.checked)}
            className="ms-checkbox"
          />
          <span className="ms-checkbox-label">Same as Permanent Address</span>
        </label>
      )}
      <div className="ms-grid-3">
        <Field label="Flat / H.No"><AddrInput name="flatHno" placeholder="Flat/House No" /></Field>
        <Field label="Street"><AddrInput name="street" placeholder="Street" /></Field>
        <Field label="Landmark"><AddrInput name="landMark" placeholder="Landmark" /></Field>
      </div>
      <div className="ms-grid-3">
        <Field label="PIN Code" error={!isTemp ? errors.permPin : undefined}>
          <div className="ms-pin-wrap">
            <input
              className={`form-input ms-input ${locked ? 'ms-readonly' : ''}`}
              placeholder="6-digit PIN"
              maxLength={6}
              value={form[f('pin')] || ''}
              onChange={e => {
                const val = e.target.value.replace(/\D/g, '');
                onPinChange(f('pin'), val, pinKey);
              }}
              readOnly={locked}
            />
            {!locked && (
              <button
                type="button"
                className="ms-pin-fetch-btn"
                onClick={() => onPinFetch(form[f('pin')], pinKey)}
                disabled={pinLoading[pinKey] || (form[f('pin')] || '').length !== 6}
              >
                {pinLoading[pinKey]
                  ? <><div className="ms-pin-spinner" />Fetching...</>
                  : <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>Fetch</>
                }
              </button>
            )}
          </div>
          {!locked && postOffices.length > 1 && (
            <div className="ms-po-dropdown-wrap">
              <label className="ms-po-dropdown-label">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                {postOffices.length} locations found — select one:
              </label>
              <select
                className="form-input form-select ms-input ms-po-select"
                onChange={e => {
                  const idx = parseInt(e.target.value, 10);
                  if (!isNaN(idx)) onPostOfficeSelect(pinKey, postOffices[idx]);
                }}
                defaultValue=""
              >
                <option value="">-- Select your locality --</option>
                {postOffices.map((po, i) => (
                  <option key={i} value={i}>{po.Name} — {po.Block}, {po.District}</option>
                ))}
              </select>
            </div>
          )}
        </Field>
        <Field label="City / Town"><AddrInput name="city" placeholder="City / Town" /></Field>
        <Field label="Village / Locality"><AddrInput name="village" placeholder="Village / Locality" /></Field>
      </div>
      <div className="ms-grid-3">
        <Field label="Mandal / Taluk"><AddrInput name="mandal" placeholder="Mandal / Taluk" /></Field>
        <Field label="District"><AddrInput name="district" placeholder="District" /></Field>
        <Field label="State">
          {locked
            ? <AddrInput name="state" placeholder="State" />
            : (
              <select
                className="form-input form-select ms-input"
                value={form[f('state')] || ''}
                onChange={e => onFieldChange(f('state'), e.target.value)}
              >
                <option value="">-- SELECT --</option>
                {INDIAN_STATES.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            )}
        </Field>
      </div>
      <div className="ms-grid-3">
        <Field label="Country" req={!isTemp} error={!isTemp ? errors.permCountry : undefined}>
          <AddrInput name="country" placeholder="Country" />
        </Field>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════ */
export default function MembershipScreen({
  initialMode = 'create',
  member: initialMember = null,
  onBack, onSave, onTaskListSave,
  currentUser,
}) {
  const [mode,       setMode]       = useState(initialMode);
  const [member,     setMember]     = useState(initialMember);
  const [form,       setForm]       = useState({ ...EMPTY });
  const [nominees,   setNominees]   = useState([{ ...EMPTY_NOMINEE }]);

  // attachments[key] = { file: File, s3Key: string | null } | null
  const [attachments,    setAttachments]    = useState({ ...EMPTY_ATTACHMENTS });
  const [attachPreviews, setAttachPreviews] = useState({ ...EMPTY_PREVIEWS });
  // uploadingKeys[key] = true while S3 upload is in progress
  const [uploadingKeys,  setUploadingKeys]  = useState({});

  const [errors,    setErrors]    = useState({});
  const [saving,    setSaving]    = useState(false);
  const [saved,     setSaved]     = useState(false);
  const [apiError,  setApiError]  = useState('');

  const [photoPreview,   setPhotoPreview]   = useState(null);
  const [sigPreview,     setSigPreview]     = useState(null);
  // photoFile / signatureFile = { file: File, s3Key: string | null } | null
  const [photoFile,      setPhotoFile]      = useState(null);
  const [signatureFile,  setSignatureFile]  = useState(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [sigUploading,   setSigUploading]   = useState(false);

  const [pinLoading,     setPinLoading]     = useState({ perm: false, temp: false });
  const [pinPostOffices, setPinPostOffices] = useState({ perm: [], temp: [] });
  const [openSection,    setOpenSection]    = useState('basicDetails');
  const [showMoreProof,  setShowMoreProof]  = useState(false);
  const [showTaskList,   setShowTaskList]   = useState(false);

  // ── Render TaskList if requested ──
  if (showTaskList) {
    return <TaskList onBack={() => setShowTaskList(false)} currentUser={currentUser} />;
  }

  /* ── Sync form when mode / member changes ── */
  useEffect(() => {
    setErrors({}); setApiError(''); setSaved(false);
    if (mode === 'create') {
      setForm({ ...EMPTY });
      setNominees([{ ...EMPTY_NOMINEE }]);
      setAttachments({ ...EMPTY_ATTACHMENTS });
      setAttachPreviews({ ...EMPTY_PREVIEWS });
      setUploadingKeys({});
      setPhotoPreview(null); setSigPreview(null);
      setPhotoFile(null);    setSignatureFile(null);
      setPinPostOffices({ perm: [], temp: [] });
    } else if (member) {
      // Map API snake_case fields back to form camelCase
      const m = member;
      setForm({
        ...EMPTY,
        name:             m.first_name        || m.name        || '',
        lastName:         m.middle_name       || m.lastName    || '',
        surname:          m.last_name         || m.surname     || '',
        fatherHusbandName: m.father_husband_name || m.fatherHusbandName || '',
        fhRelation:       m.relation_type     || m.fhRelation  || '',
        motherMaidenName: m.mother_maiden_name|| m.motherMaidenName || '',
        religion:         m.religion          || '',
        gender:           m.gender            || '',
        dob:              m.dob               || '',
        age:              m.age ? String(m.age) : '',
        doj:              m.date_of_joining   || m.doj         || EMPTY.doj,
        doa:              m.date_of_application || m.doa       || EMPTY.doa,
        aadhar:           m.aadhar_number     || m.aadhar      || '',
        pan:              m.pan_number        || m.pan         || '',
        phone1:           m.phone1            || '',
        phone2:           m.phone2            || '',
        email:            m.email             || '',
        occupation:       m.occupation        || '',
        maritalStatus:    m.marital_status    || m.maritalStatus || '',
        drivingLicense:   m.driving_license   || m.drivingLicense || '',
        passport:         m.passport_number   || m.passport    || '',
        voterId:          m.voter_id          || m.voterId     || '',
        caste:            m.caste             || '',
        // Permanent address
        permFlatHno:  m.permanentAddress?.flatNo  || m.perm_flat_hno   || '',
        permStreet:   m.permanentAddress?.street  || m.perm_street     || '',
        permLandMark: m.permanentAddress?.landmark|| m.perm_landmark   || '',
        permPin:      m.permanentAddress?.pincode || m.perm_pin        || '',
        permCity:     m.permanentAddress?.city    || m.perm_city       || '',
        permVillage:  m.permanentAddress?.village || m.perm_village    || '',
        permMandal:   m.permanentAddress?.mandal  || m.perm_mandal     || '',
        permDistrict: m.permanentAddress?.district|| m.perm_district   || '',
        permState:    m.permanentAddress?.state   || m.perm_state      || '',
        permCountry:  m.permanentAddress?.country || m.perm_country    || 'INDIA',
        // Temporary address
        sameAsPermanent: !!(m.temporaryAddress?.sameAsPermanent || m.same_as_permanent),
        tempFlatHno:  m.temporaryAddress?.flatNo  || m.temp_flat_hno   || '',
        tempStreet:   m.temporaryAddress?.street  || m.temp_street     || '',
        tempLandMark: m.temporaryAddress?.landmark|| m.temp_landmark   || '',
        tempPin:      m.temporaryAddress?.pincode || m.temp_pin        || '',
        tempCity:     m.temporaryAddress?.city    || m.temp_city       || '',
        tempVillage:  m.temporaryAddress?.village || m.temp_village    || '',
        tempMandal:   m.temporaryAddress?.mandal  || m.temp_mandal     || '',
        tempDistrict: m.temporaryAddress?.district|| m.temp_district   || '',
        tempState:    m.temporaryAddress?.state   || m.temp_state      || '',
        tempCountry:  m.temporaryAddress?.country || m.temp_country    || 'INDIA',
      });

      // Map nominees
      const rawNominees = m.nominees || [];
      setNominees(
        rawNominees.length > 0
          ? rawNominees.map(n => ({
              nomineeName:       n.nomineeName    || n.nominee_name    || '',
              nomineePhone:      n.phoneNo        || n.phone_no        || '',
              nomineeDob:        n.dob            || '',
              nomineeAge:        n.age != null    ? String(n.age)      : '',
              nomineeRelation:   n.relationType   || n.relation_type   || '',
              nomineePercentage: n.percentageShare!= null ? String(n.percentageShare) : '',
            }))
          : [{ ...EMPTY_NOMINEE }]
      );

      // Map existing attachments from API — store as { file: null, s3Key }
      // so AttachSlot can build the S3 preview URL
      const existingAttachments = { ...EMPTY_ATTACHMENTS };
      const existingPreviews    = { ...EMPTY_PREVIEWS };

      if (Array.isArray(m.attachments)) {
        const docTypeToKey = {
          AADHAR_CARD:   'aadharCard',
          PAN_CARD:      'panCard',
          ADDRESS_PROOF: null, // handled separately below
          PHOTO:         null,
          SIGNATURE:     null,
        };
        let addressProofCount = 1;

        m.attachments.forEach(a => {
          const docType = a.documentType || a.document_type || '';
          const filePath = a.filePath || a.file_path || a.url || a.fileName || a.file_name || null;

          if (docType === 'AADHAR_CARD') {
            existingAttachments.aadharCard = { file: null, s3Key: filePath };
          } else if (docType === 'PAN_CARD') {
            existingAttachments.panCard = { file: null, s3Key: filePath };
          } else if (docType === 'ADDRESS_PROOF' && addressProofCount <= 3) {
            existingAttachments[`addressProof${addressProofCount}`] = { file: null, s3Key: filePath };
            addressProofCount++;
          } else if (docType === 'PHOTO' && filePath) {
            setPhotoFile({ file: null, s3Key: filePath });
            // Build S3 URL as preview
            const custId = (m.aadhar_number || '').replace(/\D/g, '') || String(m.id || 'TEMP');
            setPhotoPreview(`https://2ry5cdvd77.execute-api.ap-south-1.amazonaws.com/Prod/getFileS3/${custId}/${filePath}`);
          } else if (docType === 'SIGNATURE' && filePath) {
            setSignatureFile({ file: null, s3Key: filePath });
            const custId = (m.aadhar_number || '').replace(/\D/g, '') || String(m.id || 'TEMP');
            setSigPreview(`https://2ry5cdvd77.execute-api.ap-south-1.amazonaws.com/Prod/getFileS3/${custId}/${filePath}`);
          }
        });
      }

      setAttachments(existingAttachments);
      setAttachPreviews(existingPreviews);
      setUploadingKeys({});
    }
  }, [mode, member]);

  /* ── Age auto-calc ── */
  useEffect(() => {
    if (form.dob) {
      const age = Math.floor((new Date() - new Date(form.dob)) / (365.25 * 24 * 3600 * 1000));
      setForm(prev => ({ ...prev, age: age > 0 ? String(age) : '' }));
    }
  }, [form.dob]);

  const set = React.useCallback((field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  }, []);

  const handlePinChange = React.useCallback((fieldName, val, pinKey) => {
    set(fieldName, val);
    setPinPostOffices(prev => ({ ...prev, [pinKey]: [] }));
  }, [set]);

  const fetchPinData = React.useCallback(async (pin, prefix) => {
    if (!pin || pin.length !== 6) return;
    setPinLoading(prev => ({ ...prev, [prefix]: true }));
    setPinPostOffices(prev => ({ ...prev, [prefix]: [] }));

    const TARGET = 'https://api.postalpincode.in/pincode/' + pin;
    const STRATEGIES = [
      [TARGET, d => d],
      ['https://api.allorigins.win/get?url=' + encodeURIComponent(TARGET), d => JSON.parse(d.contents)],
      ['https://corsproxy.io/?url=' + encodeURIComponent(TARGET), d => d],
      ['https://thingproxy.freeboard.io/fetch/' + TARGET, d => d],
    ];

    let offices = null;
    for (const [url, transform] of STRATEGIES) {
      try {
        const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
        if (!res.ok) continue;
        const raw = await res.json();
        const data = transform(raw);
        if (Array.isArray(data) && data[0]?.Status === 'Success') {
          offices = data[0].PostOffice || [];
          break;
        } else if (Array.isArray(data) && (data[0]?.Status === 'Error' || data[0]?.PostOffice === null)) {
          setPinLoading(prev => ({ ...prev, [prefix]: false }));
          alert('No locality found for PIN ' + pin + '. Please enter the address manually.');
          return;
        }
      } catch (err) {
        console.warn('[PIN fetch] failed:', url, err?.message);
      }
    }

    setPinLoading(prev => ({ ...prev, [prefix]: false }));
    if (!offices) { alert('Could not fetch PIN data. Please enter the address manually.'); return; }
    if (offices.length === 0) { alert('No post offices found for PIN ' + pin + '.'); return; }

    const applyOffice = po => {
      setForm(prev => ({
        ...prev,
        [prefix + 'City']:     po.District || prev[prefix + 'City'],
        [prefix + 'Village']:  po.Name     || prev[prefix + 'Village'],
        [prefix + 'Mandal']:   po.Block    || prev[prefix + 'Mandal'],
        [prefix + 'District']: po.District || prev[prefix + 'District'],
        [prefix + 'State']:    po.State    || prev[prefix + 'State'],
      }));
    };

    if (offices.length === 1) {
      applyOffice(offices[0]);
    } else {
      setPinPostOffices(prev => ({ ...prev, [prefix]: offices }));
    }
  }, []);

  const handlePostOfficeSelect = React.useCallback((prefix, po) => {
    setForm(prev => ({
      ...prev,
      [`${prefix}City`]:     po.District || prev[`${prefix}City`],
      [`${prefix}Village`]:  po.Name     || prev[`${prefix}Village`],
      [`${prefix}Mandal`]:   po.Block    || prev[`${prefix}Mandal`],
      [`${prefix}District`]: po.District || prev[`${prefix}District`],
      [`${prefix}State`]:    po.State    || prev[`${prefix}State`],
    }));
    setPinPostOffices(prev => ({ ...prev, [prefix]: [] }));
  }, []);

  /* ── S3 upload helper ── */
const uploadToS3 = async (file, customerId) => {
  try {
    const formData = new FormData();
    formData.append('files', file);

    const response = await fetch(
      `https://2ry5cdvd77.execute-api.ap-south-1.amazonaws.com/Prod/api/uploadS3/${customerId}`,
      { method: 'POST', body: formData }
    );

    const data = await response.json();
    return data.status
      ? (data.files?.[0]?.key || data.files?.[0]?.filename || data.files?.[0]?.url || null)
      : null;
  } catch (err) {
    console.error('[S3] Upload error:', err);
    return null;
  }
};

  /* ── Attachment handler: preview immediately, upload to S3 async ── */
  const handleAttachment = async (key, file) => {
    if (!file) return;

    // 1. Immediate local preview
    const reader = new FileReader();
    reader.onload = e => setAttachPreviews(prev => ({ ...prev, [key]: e.target.result }));
    reader.readAsDataURL(file);

    // 2. Store file optimistically (s3Key null until upload completes)
    setAttachments(prev => ({ ...prev, [key]: { file, s3Key: null } }));
    setUploadingKeys(prev => ({ ...prev, [key]: true }));

    // 3. Upload to S3
    const customerId = getS3CustomerId(form, member?.id);
    const s3Key = await uploadToS3(file, customerId);

    setAttachments(prev => ({ ...prev, [key]: { file, s3Key } }));
    setUploadingKeys(prev => ({ ...prev, [key]: false }));
  };

  const removeAttachment = key => {
    setAttachments(prev => ({ ...prev, [key]: null }));
    setAttachPreviews(prev => ({ ...prev, [key]: null }));
  };

  /* ── Photo / Signature handler ── */
  const handleFile = async (field, file, setPreview, setFileState, setUploading) => {
    if (!file) return;

    // Immediate preview
    const reader = new FileReader();
    reader.onload = e => setPreview(e.target.result);
    reader.readAsDataURL(file);

    // Optimistic state
    setFileState({ file, s3Key: null });
    setUploading(true);

    // Upload
    const customerId = getS3CustomerId(form, member?.id);
    const s3Key = await uploadToS3(file, customerId);

    setFileState({ file, s3Key });
    setUploading(false);
  };

  /* ── Nominees ── */
  const updateNominee = (idx, field, value) => {
    setNominees(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      if (field === 'nomineeDob') {
        const age = Math.floor((new Date() - new Date(value)) / (365.25 * 24 * 3600 * 1000));
        updated[idx].nomineeAge = age > 0 ? String(age) : '';
      }
      return updated;
    });
    setErrors(prev => ({ ...prev, [`nominee_${idx}_${field}`]: '' }));
  };

  const addNominee = () => {
    if (nominees.length >= 3) return;
    setNominees(prev => [...prev, { ...EMPTY_NOMINEE }]);
  };

  const removeNominee = idx => {
    if (nominees.length <= 1) return;
    setNominees(prev => prev.filter((_, i) => i !== idx));
  };

  const totalNomineePercentage = nominees.reduce((sum, n) => sum + (parseFloat(n.nomineePercentage) || 0), 0);

  const handleSameAsPermanent = checked => {
    if (checked) {
      setForm(prev => ({
        ...prev,
        sameAsPermanent: true,
        tempFlatHno:  prev.permFlatHno,
        tempStreet:   prev.permStreet,
        tempLandMark: prev.permLandMark,
        tempCity:     prev.permCity,
        tempVillage:  prev.permVillage,
        tempMandal:   prev.permMandal,
        tempDistrict: prev.permDistrict,
        tempState:    prev.permState,
        tempCountry:  prev.permCountry,
        tempPin:      prev.permPin,
      }));
    } else {
      set('sameAsPermanent', false);
    }
  };

  /* ── Validation ── */
  const validate = () => {
    const e = {};
    if (!form.name.trim())        e.name         = 'Name is required';
    if (!form.gender)             e.gender        = 'Gender is required';
    if (!form.dob)                e.dob           = 'Date of birth is required';
    if (!form.age)                e.age           = 'Age is required';
    if (!form.maritalStatus)      e.maritalStatus = 'Marital status is required';
    if (!form.permCountry.trim()) e.permCountry   = 'Country is required';
    nominees.forEach((n, i) => {
      if (!n.nomineePercentage) e[`nominee_${i}_nomineePercentage`] = 'Required';
    });
    if (totalNomineePercentage > 100) e.nomineeTotal = 'Total percentage cannot exceed 100%';
    return e;
  };

  /* ── Save ── */
const handleSave = async () => {
  const e = validate();
  if (Object.keys(e).length) {
    setErrors(e);
    if (e.name || e.gender || e.dob || e.age)    setOpenSection('basicDetails');
    else if (e.maritalStatus)                     setOpenSection('additionalDetails');
    else if (e.permCountry)                       setOpenSection('permanentAddress');
    else                                          setOpenSection('nomineeDetails');
    return;
  }

  setSaving(true); setApiError('');

  try {
    const userId   = currentUser?.id       ?? currentUser?.userId   ?? 1;
    const tenantId = currentUser?.tenantId ?? currentUser?.tenant_id ?? null;
    const branchId = currentUser?.branchId ?? currentUser?.branch_id ?? null;

    // ── PHASE 1: Save customer (no file paths yet) ──────────────────
    // Build attachments list with fileName only, filePath null for now
    const pendingAttachments = [];

    if (attachments.aadharCard?.file) {
      pendingAttachments.push({ documentType: 'AADHAR_CARD',   fileName: attachments.aadharCard.file.name,  filePath: null });
    } else if (attachments.aadharCard?.s3Key) {
      pendingAttachments.push({ documentType: 'AADHAR_CARD',   fileName: attachments.aadharCard.s3Key.split('/').pop(), filePath: attachments.aadharCard.s3Key });
    }

    if (attachments.panCard?.file) {
      pendingAttachments.push({ documentType: 'PAN_CARD',      fileName: attachments.panCard.file.name,     filePath: null });
    } else if (attachments.panCard?.s3Key) {
      pendingAttachments.push({ documentType: 'PAN_CARD',      fileName: attachments.panCard.s3Key.split('/').pop(), filePath: attachments.panCard.s3Key });
    }

    ['addressProof1', 'addressProof2', 'addressProof3'].forEach(key => {
      if (attachments[key]?.file) {
        pendingAttachments.push({ documentType: 'ADDRESS_PROOF', fileName: attachments[key].file.name, filePath: null });
      } else if (attachments[key]?.s3Key) {
        pendingAttachments.push({ documentType: 'ADDRESS_PROOF', fileName: attachments[key].s3Key.split('/').pop(), filePath: attachments[key].s3Key });
      }
    });

    if (photoFile?.file) {
      pendingAttachments.push({ documentType: 'PHOTO',     fileName: photoFile.file.name,     filePath: null });
    } else if (photoFile?.s3Key) {
      pendingAttachments.push({ documentType: 'PHOTO',     fileName: photoFile.s3Key.split('/').pop(), filePath: photoFile.s3Key });
    }

    if (signatureFile?.file) {
      pendingAttachments.push({ documentType: 'SIGNATURE', fileName: signatureFile.file.name, filePath: null });
    } else if (signatureFile?.s3Key) {
      pendingAttachments.push({ documentType: 'SIGNATURE', fileName: signatureFile.s3Key.split('/').pop(), filePath: signatureFile.s3Key });
    }

    let response;
    if (mode === 'create') {
      response = await customerAPI.insert(
        { form, nominees, attachments: pendingAttachments, photoFile, signatureFile, useRawAttachments: true },
        userId, tenantId, branchId,
      );
    } else {
      response = await customerAPI.update(
        { form, nominees, attachments: pendingAttachments, photoFile, signatureFile, useRawAttachments: true, customerId: member?.id },
        userId, tenantId, branchId,
      );
    }

    // ── PHASE 2: Upload files to S3 using real customer_id ──────────
    const customerId = response?.result?.[0]?.customer_id
      ?? response?.customer_id
      ?? response?.id
      ?? member?.id;

    if (!customerId) {
      throw new Error('No customer_id returned from server');
    }

    // Upload all new files in parallel
    const uploadTasks = [];

    const buildUploadTask = async (file, docType) => {
      const s3Key = await uploadToS3(file, customerId);
      return { documentType: docType, fileName: file.name, filePath: s3Key };
    };

    if (attachments.aadharCard?.file)   uploadTasks.push(buildUploadTask(attachments.aadharCard.file,   'AADHAR_CARD'));
    if (attachments.panCard?.file)      uploadTasks.push(buildUploadTask(attachments.panCard.file,       'PAN_CARD'));
    if (attachments.addressProof1?.file) uploadTasks.push(buildUploadTask(attachments.addressProof1.file, 'ADDRESS_PROOF'));
    if (attachments.addressProof2?.file) uploadTasks.push(buildUploadTask(attachments.addressProof2.file, 'ADDRESS_PROOF'));
    if (attachments.addressProof3?.file) uploadTasks.push(buildUploadTask(attachments.addressProof3.file, 'ADDRESS_PROOF'));
    if (photoFile?.file)                uploadTasks.push(buildUploadTask(photoFile.file,                 'PHOTO'));
    if (signatureFile?.file)            uploadTasks.push(buildUploadTask(signatureFile.file,             'SIGNATURE'));

    if (uploadTasks.length > 0) {
      const uploadedAttachments = await Promise.all(uploadTasks);

      // ── PHASE 3: Update customer with real S3 file paths ────────────
      await customerAPI.update(
        {
          form, nominees,
          attachments: uploadedAttachments,
          useRawAttachments: true,
          customerId,
        },
        userId, tenantId, branchId,
      );
    }

    // ── Done ────────────────────────────────────────────────────────
    setSaved(true);
    setTimeout(() => {
      onSave && onSave({ ...form, nominees, id: customerId });
      if (onTaskListSave) {
        onTaskListSave();
      } else {
        setShowTaskList(true);
      }
    }, 900);

  } catch (err) {
    console.error('Save error:', err);
    setApiError(
      err?.message?.includes('No customer_id')
        ? 'Server did not return a customer ID. Please try again.'
        : err?.message?.includes('API error')
          ? `Server error: ${err.message}. Please try again.`
          : 'Failed to save member. Please check your connection and try again.',
    );
  } finally {
    setSaving(false);
  }
};

  const handleReset = () => {
    setForm({ ...EMPTY });
    setNominees([{ ...EMPTY_NOMINEE }]);
    setAttachments({ ...EMPTY_ATTACHMENTS });
    setAttachPreviews({ ...EMPTY_PREVIEWS });
    setUploadingKeys({});
    setErrors({});
    setPhotoPreview(null); setSigPreview(null);
    setPhotoFile(null);    setSignatureFile(null);
    setPhotoUploading(false); setSigUploading(false);
    setPinPostOffices({ perm: [], temp: [] });
  };

  const toggleSection = sec => setOpenSection(prev => prev === sec ? null : sec);
  const isReadOnly = mode === 'view';

  const s3CustomerId = getS3CustomerId(form, member?.id);

  const basicFilled      = form.name && form.gender && form.dob;
  const additionalFilled = form.maritalStatus || form.pan || form.occupation;
  const permFilled       = form.permCity || form.permStreet;
  const tempFilled       = form.tempCity || form.tempStreet;
  const nomineeFilled    = nominees[0]?.nomineeName;
  const attachFilled     = attachments.aadharCard || attachments.panCard
    || attachments.addressProof1 || attachments.addressProof2 || attachments.addressProof3;

  const TABS = [
    { key: 'create', label: 'New',  icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> },
    { key: 'view',   label: 'View', disabled: !member, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> },
    { key: 'edit',   label: 'Edit', disabled: !member, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> },
  ];

  const SectionHeader = ({ id, label, filled }) => (
    <button
      type="button"
      className={`ms-section-header ${openSection === id ? 'ms-section-open' : ''}`}
      onClick={() => toggleSection(id)}
    >
      <div className="ms-section-left">
        <div className={`ms-section-dot ${filled ? 'ms-dot-done' : 'ms-dot-empty'}`}>
          {filled && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
        </div>
        <span className="ms-section-label">{label}</span>
      </div>
      <svg className={`ms-chevron ${openSection === id ? 'ms-chevron-open' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <polyline points="6 9 12 15 18 9"/>
      </svg>
    </button>
  );

  const addrSharedProps = {
    form, errors, isReadOnly,
    pinLoading, pinPostOffices,
    onFieldChange: set,
    onSameAsPermanent: handleSameAsPermanent,
    onPinChange: handlePinChange,
    onPinFetch: fetchPinData,
    onPostOfficeSelect: handlePostOfficeSelect,
  };

  // Shared props for every AttachSlot
  const attachSlotProps = {
    attachments, attachPreviews,
    isReadOnly, handleAttachment, removeAttachment,
    s3CustomerId,
  };

  return (
    <div className="users-page ms-page">

      {/* ── Top Bar ── */}
      <div className="ms-topbar">
        <div className="header-left">
          <button className="back-btn" onClick={onBack}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <div>
            <h1 className="page-title">Membership</h1>
            <p className="page-sub">
              {mode === 'create'
                ? 'Register a new member'
                : mode === 'view'
                  ? `Viewing — ${member?.first_name || member?.name || ''}`
                  : `Editing — ${member?.first_name || member?.name || ''}`}
            </p>
          </div>
        </div>
        <div className="ms-tabbar">
          {TABS.map(tab => (
            <button
              key={tab.key}
              className={`ms-tab ${mode === tab.key ? 'ms-tab-active' : ''} ${tab.disabled ? 'ms-tab-disabled' : ''}`}
              onClick={() => !tab.disabled && setMode(tab.key)}
              disabled={tab.disabled}
            >
              {tab.icon}{tab.label}
            </button>
          ))}
        </div>
      </div>

      {apiError && <div className="api-error">{apiError}</div>}

      <div className="ms-body">

        {/* ── BASIC DETAILS ── */}
        <div className="ms-accordion">
          <SectionHeader id="basicDetails" label="Basic Details" filled={basicFilled} />
          {openSection === 'basicDetails' && (
            <div className="ms-section-body">
            <div className="ms-grid-3">
              <Field label="Name" req error={errors.name}>
                <Input field="name" placeholder="First name" value={form.name} onChange={set} isReadOnly={isReadOnly} hasError={!!errors.name} />
              </Field>
              <Field label="Middle Name">
                <Input field="lastName" placeholder="Middle name" value={form.lastName} onChange={set} isReadOnly={isReadOnly} hasError={false} />
              </Field>
              <Field label="Last Name">
                <Input field="surname" placeholder="Last name" value={form.surname} onChange={set} isReadOnly={isReadOnly} hasError={false} />
              </Field>
            </div>
              <div className="ms-grid-3">
                <Field label="Father/Husband Name">
                  <Input field="fatherHusbandName" placeholder="Father/Husband name" value={form.fatherHusbandName} onChange={set} isReadOnly={isReadOnly} hasError={false} />
                </Field>
                <Field label="Relation">
                  <Select field="fhRelation" options={['Father', 'Husband', 'Guardian']} value={form.fhRelation} onChange={set} isReadOnly={isReadOnly} hasError={false} />
                </Field>
                <Field label="Mother's Maiden Name">
                  <Input field="motherMaidenName" placeholder="Mother's maiden name" value={form.motherMaidenName} onChange={set} isReadOnly={isReadOnly} hasError={false} />
                </Field>
              </div>
              <div className="ms-grid-3">
                <Field label="Religion">
                  <Select field="religion" options={['Hindu', 'Muslim', 'Christian', 'Sikh', 'Buddhist', 'Jain', 'Other']} value={form.religion} onChange={set} isReadOnly={isReadOnly} hasError={false} />
                </Field>
                <Field label="Gender" req error={errors.gender}>
                  <Select field="gender" options={['Male', 'Female', 'Other']} value={form.gender} onChange={set} isReadOnly={isReadOnly} hasError={!!errors.gender} />
                </Field>
                <Field label="Date of Birth" req error={errors.dob}>
                  <Input field="dob" type="date" value={form.dob} onChange={set} isReadOnly={isReadOnly} hasError={!!errors.dob} />
                </Field>
              </div>
              <div className="ms-grid-3">
                <Field label="Age" req error={errors.age}>
                  <Input field="age" placeholder="Auto-calculated" disabled value={form.age} onChange={set} isReadOnly={isReadOnly} hasError={!!errors.age} />
                </Field>
                <Field label="Date of Joining">
                  <Input field="doj" type="date" value={form.doj} onChange={set} isReadOnly={isReadOnly} hasError={false} />
                </Field>
                <Field label="Date of Admission">
                  <div className="ms-doa">{form.doa}</div>
                </Field>
              </div>
              <div className="ms-grid-3">
                <Field label="Aadhar">
                  <Input field="aadhar" placeholder="Aadhar number" value={form.aadhar} onChange={set} isReadOnly={isReadOnly} hasError={false} />
                </Field>
                <Field label="Phone 1">
                  <Input field="phone1" type="tel" placeholder="Primary phone" value={form.phone1} onChange={set} isReadOnly={isReadOnly} hasError={false} />
                </Field>
                <Field label="Phone 2">
                  <Input field="phone2" type="tel" placeholder="Secondary phone" value={form.phone2} onChange={set} isReadOnly={isReadOnly} hasError={false} />
                </Field>
              </div>
            </div>
          )}
        </div>

        {/* ── ADDITIONAL DETAILS ── */}
        <div className="ms-accordion">
          <SectionHeader id="additionalDetails" label="Additional Details" filled={additionalFilled} />
          {openSection === 'additionalDetails' && (
            <div className="ms-section-body">
              <div className="ms-grid-3">
                <Field label="PAN">
                  <Input field="pan" placeholder="PAN number" value={form.pan} onChange={set} isReadOnly={isReadOnly} hasError={false} />
                </Field>
                <Field label="Email">
                  <Input field="email" type="email" placeholder="Email address" value={form.email} onChange={set} isReadOnly={isReadOnly} hasError={false} />
                </Field>
                <Field label="Occupation">
                  <Select field="occupation" options={['Salaried', 'Business', 'Farmer', 'Student', 'Homemaker', 'Retired', 'Other']} value={form.occupation} onChange={set} isReadOnly={isReadOnly} hasError={false} />
                </Field>
              </div>
              <div className="ms-grid-3">
                <Field label="Marital Status" req error={errors.maritalStatus}>
                  <Select field="maritalStatus" options={['Single', 'Married', 'Divorced', 'Widowed']} value={form.maritalStatus} onChange={set} isReadOnly={isReadOnly} hasError={!!errors.maritalStatus} />
                </Field>
                <Field label="Driving License">
                  <Input field="drivingLicense" placeholder="DL number" value={form.drivingLicense} onChange={set} isReadOnly={isReadOnly} hasError={false} />
                </Field>
                <Field label="Passport">
                  <Input field="passport" placeholder="Passport number" value={form.passport} onChange={set} isReadOnly={isReadOnly} hasError={false} />
                </Field>
              </div>
              <div className="ms-grid-3">
                <Field label="Voter ID">
                  <Input field="voterId" placeholder="Voter ID" value={form.voterId} onChange={set} isReadOnly={isReadOnly} hasError={false} />
                </Field>
                <Field label="Caste">
                  <Select field="caste" options={['General', 'OBC', 'SC', 'ST', 'Other']} value={form.caste} onChange={set} isReadOnly={isReadOnly} hasError={false} />
                </Field>
              </div>
            </div>
          )}
        </div>

        {/* ── PERMANENT ADDRESS ── */}
        <div className="ms-accordion">
          <SectionHeader id="permanentAddress" label="Permanent Address" filled={permFilled} />
          {openSection === 'permanentAddress' && (
            <AddressFields prefix="perm" isTemp={false} {...addrSharedProps} />
          )}
        </div>

        {/* ── TEMPORARY ADDRESS ── */}
        <div className="ms-accordion">
          <SectionHeader id="temporaryAddress" label="Temporary / Current Address" filled={tempFilled} />
          {openSection === 'temporaryAddress' && (
            <AddressFields prefix="temp" isTemp={true} {...addrSharedProps} />
          )}
        </div>

        {/* ── NOMINEE DETAILS ── */}
        <div className="ms-accordion">
          <SectionHeader id="nomineeDetails" label="Nominee Details" filled={nomineeFilled} />
          {openSection === 'nomineeDetails' && (
            <div className="ms-section-body">
              <div className="ms-nominee-total-bar">
                <span className="ms-nominee-total-label">Total Allocation</span>
                <div className="ms-nominee-progress-wrap">
                  <div
                    className="ms-nominee-progress-fill"
                    style={{
                      width: `${Math.min(totalNomineePercentage, 100)}%`,
                      background: totalNomineePercentage > 100 ? '#ef4444' : totalNomineePercentage === 100 ? '#22c55e' : 'var(--blue)',
                    }}
                  />
                </div>
                <span className={`ms-nominee-total-pct ${totalNomineePercentage > 100 ? 'ms-pct-over' : totalNomineePercentage === 100 ? 'ms-pct-done' : ''}`}>
                  {totalNomineePercentage}%
                </span>
              </div>
              {errors.nomineeTotal && <span className="error-msg" style={{ marginTop: -8 }}>{errors.nomineeTotal}</span>}

              {nominees.map((n, idx) => (
                <div key={idx} className="ms-nominee-card">
                  <div className="ms-nominee-card-header">
                    <span className="ms-nominee-card-title">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                      Nominee {idx + 1}
                    </span>
                    {!isReadOnly && nominees.length > 1 && (
                      <button className="ms-nominee-remove" onClick={() => removeNominee(idx)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    )}
                  </div>
                  <div className="ms-grid-3">
                    <Field label="Nominee Name">
                      <NomineeInput idx={idx} field="nomineeName" placeholder="Full name" value={n.nomineeName} onChange={updateNominee} isReadOnly={isReadOnly} hasError={!!errors[`nominee_${idx}_nomineeName`]} />
                    </Field>
                    <Field label="Phone No">
                      <NomineeInput idx={idx} field="nomineePhone" type="tel" placeholder="Phone number" value={n.nomineePhone} onChange={updateNominee} isReadOnly={isReadOnly} hasError={false} />
                    </Field>
                    <Field label="Date of Birth">
                      <NomineeInput idx={idx} field="nomineeDob" type="date" value={n.nomineeDob} onChange={updateNominee} isReadOnly={isReadOnly} hasError={false} />
                    </Field>
                  </div>
                  <div className="ms-grid-3">
                    <Field label="Age">
                      <NomineeInput idx={idx} field="nomineeAge" placeholder="Auto-calculated" disabled value={n.nomineeAge} onChange={updateNominee} isReadOnly={isReadOnly} hasError={false} />
                    </Field>
                    <Field label="Relation">
                      <NomineeSelect idx={idx} field="nomineeRelation" options={['Spouse', 'Son', 'Daughter', 'Father', 'Mother', 'Brother', 'Sister', 'Other']} value={n.nomineeRelation} onChange={updateNominee} isReadOnly={isReadOnly} />
                    </Field>
                    <Field label="Percentage %" req error={errors[`nominee_${idx}_nomineePercentage`]}>
                      <NomineeInput idx={idx} field="nomineePercentage" placeholder="e.g. 50" value={n.nomineePercentage} onChange={updateNominee} isReadOnly={isReadOnly} hasError={!!errors[`nominee_${idx}_nomineePercentage`]} />
                    </Field>
                  </div>
                </div>
              ))}

              {!isReadOnly && nominees.length < 3 && totalNomineePercentage < 100 && (
                <button className="ms-add-nominee-btn" onClick={addNominee}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Add Nominee ({3 - nominees.length} more allowed)
                </button>
              )}
              {!isReadOnly && (nominees.length >= 3 || totalNomineePercentage >= 100) && (
                <p className="ms-nominee-max-note">
                  {totalNomineePercentage >= 100
                    ? '100% allocated — no more nominees can be added.'
                    : 'Maximum 3 nominees allowed.'}
                </p>
              )}
            </div>
          )}
        </div>

        {/* ── ATTACHMENTS ── */}
        <div className="ms-accordion">
          <SectionHeader id="attachments" label="Attachments" filled={attachFilled} />
          {openSection === 'attachments' && (
            <div className="ms-section-body">
              <div className="ms-attachments-grid">
                {ATTACHMENT_TYPES.map(({ key, label, accept }) => (
                  <AttachSlot
                    key={key} slotKey={key} label={label} accept={accept}
                    isUploading={!!uploadingKeys[key]}
                    {...attachSlotProps}
                  />
                ))}
                <AttachSlot
                  slotKey="addressProof1" label="Electricity Bill" accept="image/*,.pdf"
                  isUploading={!!uploadingKeys.addressProof1}
                  {...attachSlotProps}
                />
              </div>

              {!isReadOnly && (
                <button type="button" className="ms-more-proof-btn" onClick={() => setShowMoreProof(p => !p)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                  {showMoreProof ? 'Hide' : 'Add'} More Address Proof
                  <svg className={`ms-more-proof-chevron ${showMoreProof ? 'ms-more-proof-chevron-open' : ''}`}
                    width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>
              )}

              {showMoreProof && (
                <div className="ms-attachments-grid ms-more-proof-row">
                  <AttachSlot
                    slotKey="addressProof2" label="Water Bill" accept="image/*,.pdf"
                    isUploading={!!uploadingKeys.addressProof2}
                    {...attachSlotProps}
                  />
                  <AttachSlot
                    slotKey="addressProof3" label="Ration Card" accept="image/*,.pdf"
                    isUploading={!!uploadingKeys.addressProof3}
                    {...attachSlotProps}
                  />
                  <div />
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── PHOTO & SIGNATURE ── */}
        <div className="ms-photo-row">
          {/* Photo */}
          <div className="ms-upload-box">
            <p className="ms-upload-label">
              Photo
              {photoUploading && <span className="ms-photo-uploading"> — Uploading…</span>}
            </p>
            <label className={`ms-upload-area ${isReadOnly ? 'ms-readonly' : ''}`}>
              {photoPreview
                ? <img src={photoPreview} alt="Photo" className="ms-preview-img" />
                : <div className="ms-upload-placeholder">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                  </div>}
              {!isReadOnly && (
                <input
                  type="file" accept="image/*" style={{ display: 'none' }}
                  onChange={e => handleFile('photo', e.target.files[0], setPhotoPreview, setPhotoFile, setPhotoUploading)}
                />
              )}
            </label>
          </div>

          {/* Signature */}
          <div className="ms-upload-box">
            <p className="ms-upload-label">
              Signature
              {sigUploading && <span className="ms-photo-uploading"> — Uploading…</span>}
            </p>
            <label className={`ms-upload-area ${isReadOnly ? 'ms-readonly' : ''}`}>
              {sigPreview
                ? <img src={sigPreview} alt="Signature" className="ms-preview-img" />
                : <div className="ms-upload-placeholder">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                  </div>}
              {!isReadOnly && (
                <input
                  type="file" accept="image/*" style={{ display: 'none' }}
                  onChange={e => handleFile('signature', e.target.files[0], setSigPreview, setSignatureFile, setSigUploading)}
                />
              )}
            </label>
          </div>
        </div>

        {/* ── FOOTER ── */}
        {!isReadOnly && (
          <div className="ms-footer">
            <button className="btn-ghost" onClick={onBack}>Cancel</button>
            {mode === 'create' && (
              <button className="btn-ghost" onClick={handleReset}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.74"/></svg>
                Reset
              </button>
            )}
            {mode === 'edit' && (
              <button className="btn-ghost" onClick={() => setMode('view')}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                View
              </button>
            )}
            <button
              className={`btn-primary ${saved ? 'btn-saved' : ''}`}
              onClick={handleSave}
              disabled={saving || Object.values(uploadingKeys).some(Boolean) || photoUploading || sigUploading}
            >
              {saved ? (
                <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Saved!</>
              ) : saving ? (
                <><div className="spinner-sm" />Saving...</>
              ) : (Object.values(uploadingKeys).some(Boolean) || photoUploading || sigUploading) ? (
                <><div className="spinner-sm" />Uploading files…</>
              ) : (
                <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>{mode === 'edit' ? 'Update' : 'Save'}</>
              )}
            </button>
            <button
              className="btn-primary"
              style={{ background: 'linear-gradient(135deg,#37474f,#263238)' }}
              onClick={() => onTaskListSave ? onTaskListSave() : setShowTaskList(true)}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
                <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
                <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
              </svg>
              Go To Task List
            </button>
          </div>
        )}

        {isReadOnly && (
          <div className="ms-footer">
            <button className="btn-ghost" onClick={onBack}>Back</button>
            <button className="btn-primary" onClick={() => setMode('edit')}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Edit Member
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
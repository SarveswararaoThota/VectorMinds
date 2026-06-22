// ─── Base URLs ───────────────────────────────────────────
const BASE_URL = 'https://2ry5cdvd77.execute-api.ap-south-1.amazonaws.com/Prod/api';
const S3_BASE_URL = 'https://2ry5cdvd77.execute-api.ap-south-1.amazonaws.com/Prod/api';

// ─── JSON POST Helper ────────────────────────────────────
async function post(endpoint, body) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

/**
 * Some endpoints (e.g. /GetApproveCustomers) return:
 *   { success, result: [ [ ...rows ], { mysql OkPacket metadata } ] }
 * i.e. result is a 2-element array where only result[0] is real data
 * and result[1] is raw MySQL driver metadata to be ignored.
 * Other endpoints return result as a plain array of rows directly.
 * This helper handles both shapes safely.
 */
function unwrapRows(res) {
  const result = res?.result ?? res?.data;
  if (!Array.isArray(result)) return [];
  // Nested shape: [ [rows...], {metadata} ]
  if (result.length && Array.isArray(result[0])) return result[0];
  // Plain array of rows
  return result;
}

// ════════════════════════════════════════════════════════
// S3 FILE UPLOAD / DOWNLOAD
// ════════════════════════════════════════════════════════
export const s3API = {
  /**
   * Upload one or more files for a customer.
   * customerId  — use customer's aadhar number (digits only) or DB id
   * files       — single File or array of File objects
   * Returns array of uploaded file info from your backend.
   *
   * Expected backend response shape:
   *   { status: true, files: [{ filename, originalname, key, url, ... }] }
   */
  upload: async (customerId, files) => {
    const formData = new FormData();
    const fileArray = Array.isArray(files) ? files : [files];
    fileArray.forEach(f => formData.append('files', f));

    const res = await fetch(`${S3_BASE_URL}/uploadS3/${customerId}`, {
      method: 'POST',
      body: formData,
      // NOTE: Do NOT set Content-Type header — browser sets multipart boundary automatically
    });
    if (!res.ok) throw new Error(`S3 upload error: ${res.status}`);
    const data = await res.json();
    if (!data.status) throw new Error(data.message || 'S3 upload failed');
    return data.files; // array
  },

  /**
   * Returns the URL to display/download a file.
   * Pass the filename/key returned by upload().
   */
  getFileUrl: (customerId, filename) =>
    `${S3_BASE_URL}/getFileS3/${customerId}/${filename}`,

  /**
   * Download a file programmatically (triggers browser Save dialog).
   */
  download: async (customerId, filename) => {
    const res = await fetch(`${S3_BASE_URL}/getFileS3/${customerId}/${filename}`);
    if (!res.ok) throw new Error(`Download failed: ${res.status}`);
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },
};

export { unwrapRows };

// ════════════════════════════════════════════════════════
// AUTH
// ════════════════════════════════════════════════════════
export const authAPI = {
  login: (userName, password) =>
    post('/authenticate', { userName, password }),
};

// ════════════════════════════════════════════════════════
// USERS
// ════════════════════════════════════════════════════════
export const userAPI = {
  getAll: (userId) =>
    post('/users', { crudType: 'GET', userId }),

  getById: (id, userId) =>
    post('/users', { crudType: 'GET', id, userId }),

  insert: (data, userId) =>
    post('/users', {
      crudType:   'INSERT',
      firstName:  data.firstName,
      lastName:   data.lastName,
      surName:    data.surName   || null,
      department: data.department,
      username:   data.username,
      mobileNo:   data.mobileNo  || null,
      email:      data.email,
      password:   data.password,
      tenantId:   data.tenantId,
      branchId:   data.branchId,
      userTypeId: data.userTypeId,
      isActive:   data.isActive  ?? 1,
      userId,
    }),

  update: (data, userId) =>
    post('/users', {
      crudType:   'UPDATE',
      id:         data.id,
      firstName:  data.firstName,
      lastName:   data.lastName,
      surName:    data.surName   || null,
      department: data.department,
      username:   data.username,
      mobileNo:   data.mobileNo  || null,
      email:      data.email,
      password:   data.password  || null,
      tenantId:   data.tenantId,
      branchId:   data.branchId,
      userTypeId: data.userTypeId,
      isActive:   data.isActive  ?? 1,
      userId,
    }),

  delete: (id, userId) =>
    post('/users', { crudType: 'DELETE', id, userId }),
};

// ════════════════════════════════════════════════════════
// TENANTS
// ════════════════════════════════════════════════════════
export const tenantAPI = {
  getAll: (userId) =>
    post('/tenants', { crudType: 'GET', userId }),

  getById: (id, userId) =>
    post('/tenants', { crudType: 'GET', id, userId }),

  insert: (data, userId) =>
    post('/tenants', {
      crudType:    'INSERT',
      name:        data.name,
      code:        data.code,
      email:       data.email       || null,
      mobileNo:    data.mobileNo    || null,
      expiryFrom:  data.expiryFrom  || null,
      expiryTo:    data.expiryTo    || null,
      isActive:    data.isActive    ?? 1,
      userId,
    }),

  update: (data, userId) =>
    post('/tenants', {
      crudType:    'UPDATE',
      id:          data.id,
      name:        data.name,
      code:        data.code,
      email:       data.email       || null,
      mobileNo:    data.mobileNo    || null,
      expiryFrom:  data.expiryFrom  || null,
      expiryTo:    data.expiryTo    || null,
      isActive:    data.isActive    ?? 1,
      userId,
    }),

  delete: (id, userId) =>
    post('/tenants', { crudType: 'DELETE', id, userId }),
};

// ════════════════════════════════════════════════════════
// BRANCHES
// ════════════════════════════════════════════════════════
export const branchAPI = {
  getAll: (userId) =>
    post('/branch', { crudType: 'GET', userId }),

  getById: (id, userId) =>
    post('/branch', { crudType: 'GET', id, userId }),

  insert: (data, userId) =>
    post('/branch', {
      crudType:      'INSERT',
      name:          data.name,
      code:          data.code,
      tenantId:      data.tenantId,
      agreementFrom: data.agreementFrom || null,
      agreementTo:   data.agreementTo   || null,
      isActive:      data.isActive      ?? 1,
      userId,
    }),

  update: (data, userId) =>
    post('/branch', {
      crudType:      'UPDATE',
      id:            data.id,
      name:          data.name,
      code:          data.code,
      tenantId:      data.tenantId,
      agreementFrom: data.agreementFrom || null,
      agreementTo:   data.agreementTo   || null,
      isActive:      data.isActive      ?? 1,
      userId,
    }),

  delete: (id, userId) =>
    post('/branch', { crudType: 'DELETE', id, userId }),
};

// ════════════════════════════════════════════════════════
// ROLES
// ════════════════════════════════════════════════════════
export const roleAPI = {
  getAll: (userId) =>
    post('/getUserRoles', { crudType: 'GET', userId }),

  getById: (id, userId) =>
    post('/roles', { crudType: 'GET', id, userId }),

  insert: (data, userId) =>
    post('/roles', {
      crudType:  'INSERT',
      name:      data.name,
      isActive:  data.isActive ?? 1,
      userId,
    }),

  update: (data, userId) =>
    post('/roles', {
      crudType:  'UPDATE',
      id:        data.id,
      name:      data.name,
      isActive:  data.isActive ?? 1,
      userId,
    }),

  delete: (id, userId) =>
    post('/roles', { crudType: 'DELETE', id, userId }),
};

// ════════════════════════════════════════════════════════
// COLLECTIONS
// ════════════════════════════════════════════════════════
export const collectionAPI = {
  getAll: (userId) =>
    post('/collections', { action: 'GET', userId }),

  insert: (data, userId) =>
    post('/collections', {
      action:             'INSERT',
      id:                 0,
      branch_name:        data.branch_name        || null,
      branch_code:        data.branch_code        || null,
      loan_type:          data.loan_type          || null,
      borrower_name:      data.borrower_name      || null,
      area_name:          data.area_name          || null,
      transaction_number: data.transaction_number || null,
      amount:             data.amount             || null,
      payment_type:       data.payment_type       || null,
      remarks:            data.remarks            || null,
      userId,
    }),

  update: (data, userId) =>
    post('/collections', {
      action:             'UPDATE',
      id:                 data.id,
      branch_name:        data.branch_name        || null,
      branch_code:        data.branch_code        || null,
      loan_type:          data.loan_type          || null,
      borrower_name:      data.borrower_name      || null,
      area_name:          data.area_name          || null,
      transaction_number: data.transaction_number || null,
      amount:             data.amount             || null,
      payment_type:       data.payment_type       || null,
      remarks:            data.remarks            || null,
      userId,
    }),

  delete: (id, userId) =>
    post('/collections', { action: 'DELETE', id, userId }),
};

// ════════════════════════════════════════════════════════
// CUSTOMER (MEMBERSHIP)
// ════════════════════════════════════════════════════════

/**
 * Attachment state shape (used in MembershipScreen):
 *   attachments[key] = { file: File, s3Key: string } | null
 *
 * photoFile / signatureFile:
 *   { file: File, s3Key: string } | null
 *
 * s3Key is whatever your backend returns — we try .key, .filename, .url in that order.
 */
function extractS3Key(uploadedFileInfo) {
  // Adjust field priority here once you know your backend's exact response shape.
  // Common shapes: { key: "uploads/123/abc.pdf" } or { filename: "abc.pdf" } or { url: "https://..." }
  return uploadedFileInfo?.key
    || uploadedFileInfo?.filename
    || uploadedFileInfo?.url
    || null;
}

function buildCustomerPayload({
  crudType,
  form,
  nominees = [],
  attachments = {},
  photoFile = null,
  signatureFile = null,
  userId,
  customerId,
  tenantId,
  branchId,
}) {
  // ── Attachments array ───────────────────────────────────
  const attachmentList = [];

  // attachment value is { file: File, s3Key: string } or a plain File (fallback)
  const pushAttachment = (attachVal, documentType) => {
    if (!attachVal) return;
    const isEnriched = attachVal?.file instanceof File;
    const file    = isEnriched ? attachVal.file    : attachVal;
    const s3Key   = isEnriched ? attachVal.s3Key   : null;
    attachmentList.push({
      documentType,
      fileName: file?.name || null,
      filePath: s3Key,        // ← S3 key/path stored here; null if upload failed
    });
  };

  pushAttachment(attachments.aadharCard,   'AADHAR_CARD');
  pushAttachment(attachments.panCard,       'PAN_CARD');
  pushAttachment(attachments.addressProof1, 'ADDRESS_PROOF');
  pushAttachment(attachments.addressProof2, 'ADDRESS_PROOF');
  pushAttachment(attachments.addressProof3, 'ADDRESS_PROOF');
  pushAttachment(photoFile,                 'PHOTO');
  pushAttachment(signatureFile,             'SIGNATURE');

  // ── Nominees array ──────────────────────────────────────
  const nomineeList = nominees
    .filter(n => n.nomineeName?.trim())
    .map(n => ({
      nomineeName:     n.nomineeName     || null,
      phoneNo:         n.nomineePhone    || null,
      dob:             n.nomineeDob      || null,
      age:             n.nomineeAge ? parseInt(n.nomineeAge, 10) : null,
      relationType:    n.nomineeRelation || null,
      percentageShare: n.nomineePercentage ? parseFloat(n.nomineePercentage) : null,
      aadharNumber:    n.nomineeAadhar   || null,
    }));

  // ── Core payload ────────────────────────────────────────
  const payload = {
    crudType,
    tenantId: tenantId ?? null,
    branchId: branchId ?? null,
    firstName:         form.name              || null,
    middleName:        form.lastName          || null,
    lastName:          form.surname           || null,
    fatherHusbandName: form.fatherHusbandName || null,
    relationType:      form.fhRelation        || null,
    motherMaidenName:  form.motherMaidenName  || null,
    religion:          form.religion          || null,
    gender:            form.gender            || null,
    dob:               form.dob               || null,
    age:               form.age ? parseInt(form.age, 10) : null,
    dateOfJoining:     form.doj               || null,
    dateOfApplication: form.doa               || null,
    aadharNumber:      form.aadhar            || null,
    panNumber:         form.pan               || null,
    phone1:            form.phone1            || null,
    phone2:            form.phone2            || null,
    email:             form.email             || null,
    occupation:        form.occupation        || null,
    maritalStatus:     form.maritalStatus     || null,
    drivingLicense:    form.drivingLicense    || null,
    passportNumber:    form.passport          || null,
    voterId:           form.voterId           || null,
    caste:             form.caste             || null,
    permanentAddress: {
      flatNo:   form.permFlatHno  || null,
      street:   form.permStreet   || null,
      landmark: form.permLandMark || null,
      pincode:  form.permPin      || null,
      city:     form.permCity     || null,
      village:  form.permVillage  || null,
      mandal:   form.permMandal   || null,
      district: form.permDistrict || null,
      state:    form.permState    || null,
      country:  form.permCountry  || null,
    },
    temporaryAddress: {
      sameAsPermanent: form.sameAsPermanent ? 1 : 0,
      flatNo:   form.tempFlatHno  || null,
      street:   form.tempStreet   || null,
      landmark: form.tempLandMark || null,
      pincode:  form.tempPin      || null,
      city:     form.tempCity     || null,
      village:  form.tempVillage  || null,
      mandal:   form.tempMandal   || null,
      district: form.tempDistrict || null,
      state:    form.tempState    || null,
      country:  form.tempCountry  || null,
    },
    nominees:    nomineeList,
    attachments: attachmentList,
    userId,
  };

  if ((crudType === 'UPDATE' || crudType === 'DELETE') && customerId) {
    payload.id = customerId;
  }

  return payload;
}

export const customerAPI = {
  getAll: (userId) =>
    post('/customer', { crudType: 'GET', userId }),

  getById: (id, userId) =>
    post('/customer', { crudType: 'GET', id, userId }),

  /**
   * Approved customers only (used to populate dropdowns for SB Account
   * creation etc). Response shape from backend is unusual:
   *   { success, result: [ [ ...customerRows ], { mysql metadata } ] }
   * Pass id to fetch a single approved customer's full record instead
   * of the full list (e.g. to prefill an existing account's details).
   */
  getApproved: (branchId, id = null) =>
    post('/GetApproveCustomers', { id, branch_id: branchId }),

  insert: ({ form, nominees, attachments, photoFile, signatureFile }, userId, tenantId, branchId) =>
    post('/customer', buildCustomerPayload({
      crudType: 'INSERT',
      form, nominees, attachments, photoFile, signatureFile,
      userId, tenantId, branchId,
    })),

  update: ({ form, nominees, attachments, photoFile, signatureFile, customerId }, userId, tenantId, branchId) =>
    post('/customer', buildCustomerPayload({
      crudType: 'UPDATE',
      form, nominees, attachments, photoFile, signatureFile,
      userId, customerId, tenantId, branchId,
    })),

  delete: (id, userId) =>
    post('/customer', { crudType: 'DELETE', id, userId }),
};

// ════════════════════════════════════════════════════════
// CUSTOMER APPROVAL / REJECTION (membership-level)
// ════════════════════════════════════════════════════════
// export const approvalAPI = {
//   approve: (id, userId, branchId) =>
//     post('/GetApproveCustomers', { id, branch_id: branchId }),
export const approvalAPI = {
  approve: (id, userId) =>
    post('/approveCustomer', { id }),

  reject: (id, userId, comments) =>
    post('/rejectCustomer', { id, user_id: userId, comments }),
};

// ════════════════════════════════════════════════════════
// NOMINEE (standalone — used by SB Account screen to attach
// a nominee to a customer independent of the membership form)
// ════════════════════════════════════════════════════════
export const nomineeAPI = {
  /**
   * Fetch nominees.
   * Pass customerId to get all nominees for a customer,
   * or id to get a single nominee record.
   */
  getAll: (customerId, userId) =>
    post('/addNominee', { actionType: 'GET', customerId: customerId ?? null, id: null, userId }),

  getById: (id, userId) =>
    post('/addNominee', { actionType: 'GET', customerId: null, id, userId }),

  insert: (data, userId) =>
    post('/addNominee', {
      actionType:      'INSERT',
      customerId:      data.customerId,
      nomineeName:     data.nomineeName,
      phoneNo:         data.phoneNo         || null,
      dob:             data.dob             || null,
      age:             data.age ? parseInt(data.age, 10) : null,
      relationType:    data.relationType,
      percentageShare: data.percentageShare ? parseFloat(data.percentageShare) : null,
      aadharNumber:    data.aadharNumber    || null,
      hno:             data.hno             || null,
      street:          data.street          || null,
      city:            data.city            || null,
      state:           data.state           || null,
      country:         data.country         || null,
      pincode:         data.pincode         || null,
      userId,
    }),

  update: (data, userId) =>
    post('/addNominee', {
      actionType:      'UPDATE',
      id:              data.id,
      customerId:      data.customerId,
      nomineeName:     data.nomineeName,
      phoneNo:         data.phoneNo         || null,
      dob:             data.dob             || null,
      age:             data.age ? parseInt(data.age, 10) : null,
      relationType:    data.relationType,
      percentageShare: data.percentageShare ? parseFloat(data.percentageShare) : null,
      aadharNumber:    data.aadharNumber    || null,
      hno:             data.hno             || null,
      street:          data.street          || null,
      city:            data.city            || null,
      state:           data.state           || null,
      country:         data.country         || null,
      pincode:         data.pincode         || null,
      userId,
    }),

  delete: (id, userId) =>
    post('/addNominee', { actionType: 'DELETE', id, userId }),
};

// ════════════════════════════════════════════════════════
// SCHEME
// ════════════════════════════════════════════════════════
export const schemeAPI = {
  getAll: (userId) =>
    post('/manageScheme', { actionType: 'GET', id: null, userId }),

  getById: (id, userId) =>
    post('/manageScheme', { actionType: 'GET', id, userId }),

  insert: (data, userId) =>
    post('/manageScheme', {
      actionType: 'INSERT',
      name:       data.name,
      minBalance: data.minBalance ? parseFloat(data.minBalance) : null,
      roi:        data.roi        ? parseFloat(data.roi)        : null,
      userId,
    }),

  update: (data, userId) =>
    post('/manageScheme', {
      actionType: 'UPDATE',
      id:         data.id,
      name:       data.name,
      minBalance: data.minBalance ? parseFloat(data.minBalance) : null,
      roi:        data.roi        ? parseFloat(data.roi)        : null,
      userId,
    }),

  delete: (id, userId) =>
    post('/manageScheme', { actionType: 'DELETE', id, userId }),
};

// ════════════════════════════════════════════════════════
// SB / DEPOSIT ACCOUNT  (manageCustomerAccount)
// depositType for SB accounts = 'SAVINGS_DEPOSITE'
// ════════════════════════════════════════════════════════
export const accountAPI = {
  getAll: (userId) =>
    post('/manageCustomerAccount', { actionType: 'GET', id: null, userId }),

  getById: (id, userId) =>
    post('/manageCustomerAccount', { actionType: 'GET', id, userId }),

  insert: (data, userId) =>
    post('/manageCustomerAccount', {
      actionType:  'INSERT',
      customerId:  data.customerId,
      accountType: data.accountType,
      schemeId:    data.schemeId,
      agentId:     data.agentId   || null,
      agentName:   data.agentName || null,
      nomineeId:   data.nomineeId || null, // comma-separated string e.g. "1,2"
      depositType: data.depositType || 'SAVINGS_DEPOSITE',
      userId,
    }),

  update: (data, userId) =>
    post('/manageCustomerAccount', {
      actionType:  'UPDATE',
      id:          data.id,
      customerId:  data.customerId,
      accountType: data.accountType,
      schemeId:    data.schemeId,
      agentId:     data.agentId   || null,
      agentName:   data.agentName || null,
      nomineeId:   data.nomineeId || null,
      depositType: data.depositType || 'SAVINGS_DEPOSITE',
      userId,
    }),

  delete: (id, userId) =>
    post('/manageCustomerAccount', { actionType: 'DELETE', id, userId }),

  // Convenience helper — account-level reject uses the same endpoint
  reject: (id, userId) =>
    post('/manageCustomerAccount', { actionType: 'REJECT', id, userId }),
};

// ════════════════════════════════════════════════════════
// DEPOSIT ACCOUNT APPROVAL (account-level — separate from
// membership approval in approvalAPI above)
// ════════════════════════════════════════════════════════
export const depositeApprovalAPI = {
  getApprovalList: (id, branchId, userId) =>
    post('/getApproveDepositeAccount', { id: id ?? null, branchId, userId }),

 approve: (id, userId, branchId) =>
  post('/GetApproveCustomers', { id, branch_id: branchId }),
};
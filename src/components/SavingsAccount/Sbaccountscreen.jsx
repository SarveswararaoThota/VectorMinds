import { useState, useEffect } from "react";
import "./SBAccountScreen.css";
import { customerAPI, schemeAPI, nomineeAPI, accountAPI, unwrapRows } from "../../api";

/* ─────────────────────────────────────────────────────────
   Nominee Modal  (3-col grid · max 3 nominees · total % ≤ 100)
───────────────────────────────────────────────────────── */
function NomineeModal({ onClose, onAdd, custId, currentUser, existingNominees = [] }) {
  const [form, setForm] = useState({
    name: "",
    relation: "",
    percentage: "",
    dob: "",
    phone: "",
    aadhar: "",
    hno: "",
    street: "",
    city: "",
    state: "",
    country: "INDIA",
    pin: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  /* Derived totals from already-added nominees */
  const usedCount = existingNominees.length;
  const usedPct = existingNominees.reduce(
    (sum, n) => sum + Number(n.percentageShare ?? n.percentage ?? 0),
    0
  );
  const remainingPct = 100 - usedPct;

  const age = (() => {
    if (!form.dob) return "";
    const d = new Date(form.dob);
    if (isNaN(d)) return "";
    return Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
  })();

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleAdd = async () => {
    if (!form.name || !form.relation || !form.percentage) {
      setError("Please fill all required fields (Name, Relation, Percentage).");
      return;
    }
    if (!custId) {
      setError("Select a customer before adding a nominee.");
      return;
    }
    if (usedCount >= 3) {
      setError("Maximum 3 nominees are allowed per account.");
      return;
    }
    const pctNum = Number(form.percentage);
    if (pctNum <= 0 || pctNum > 100) {
      setError("Percentage must be between 1 and 100.");
      return;
    }
    if (usedPct + pctNum > 100) {
      setError(
        `Total nominee percentage cannot exceed 100%. Already used: ${usedPct}%. Available: ${remainingPct}%.`
      );
      return;
    }
    setError("");
    setSaving(true);
    try {
      const userId = currentUser?.id;
      const res = await nomineeAPI.insert(
        {
          customerId: custId,
          nomineeName: form.name,
          phoneNo: form.phone,
          dob: form.dob,
          age,
          relationType: form.relation,
          percentageShare: form.percentage,
          aadharNumber: form.aadhar,
          hno: form.hno,
          street: form.street,
          city: form.city,
          state: form.state,
          country: form.country,
          pincode: form.pin,
        },
        userId
      );

      const saved = res?.result || res?.data || {
        id: res?.id,
        name: form.name,
        relation: form.relation,
        percentage: form.percentage,
        dob: form.dob,
        age,
        acNo: "",
        hno: form.hno,
        address1: "",
        street: form.street,
        city: form.city,
        district: "",
        state: form.state,
        country: form.country,
        pin: form.pin,
      };

      onAdd(saved);
      onClose();
    } catch (err) {
      console.error("Failed to add nominee:", err);
      setError("Failed to save nominee. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const CalIcon = () => (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );

  /* Percentage indicator bar */
  const pctPreview = Math.min(usedPct + Number(form.percentage || 0), 100);
  const barColor =
    pctPreview > 100 ? "#ef4444" : pctPreview === 100 ? "#1b7a3e" : "#1557a0";

  return (
    <div
      className="sba-modal-overlay"
      onClick={(e) => {
        if (e.target.classList.contains("sba-modal-overlay")) onClose();
      }}
    >
      <div className="sba-modal-box sba-modal-wide">
        <div className="sba-modal-header">
          <h3>Add Nominee</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* Slot & percentage summary chips */}
            <span style={{
              fontSize: 12, fontWeight: 600, color: usedCount >= 3 ? "#fca5a5" : "#bfdbfe",
              background: "rgba(255,255,255,0.12)", padding: "2px 10px", borderRadius: 12,
            }}>
              {usedCount}/3 nominees
            </span>
            <span style={{
              fontSize: 12, fontWeight: 600, color: usedPct >= 100 ? "#fca5a5" : "#bfdbfe",
              background: "rgba(255,255,255,0.12)", padding: "2px 10px", borderRadius: 12,
            }}>
              {usedPct}% used · {remainingPct}% left
            </span>
            <button className="sba-modal-close" onClick={onClose}>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        <div className="sba-modal-body">
          {error && <div className="sba-error-banner" style={{ marginBottom: 14 }}>{error}</div>}

          {/* Percentage progress bar */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 11, color: "#4a5568", fontWeight: 600 }}>
                Percentage allocation
              </span>
              <span style={{ fontSize: 11, color: barColor, fontWeight: 700 }}>
                {Math.min(pctPreview, 100)}% / 100%
              </span>
            </div>
            <div style={{ height: 6, background: "#e2e8f0", borderRadius: 4, overflow: "hidden" }}>
              <div style={{
                height: "100%", width: `${Math.min(pctPreview, 100)}%`,
                background: barColor, borderRadius: 4,
                transition: "width 0.2s, background 0.2s",
              }} />
            </div>
            {/* Existing nominee segments legend */}
            {existingNominees.length > 0 && (
              <div style={{ display: "flex", gap: 12, marginTop: 6, flexWrap: "wrap" }}>
                {existingNominees.map((n, i) => (
                  <span key={i} style={{ fontSize: 11, color: "#4a5568" }}>
                    {n.nomineeName || n.name}: {n.percentageShare ?? n.percentage}%
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Basic Information — 3 columns */}
          <div className="sba-section-title">Basic Information</div>
          <div className="sba-mf-grid-3">
            <div className="sba-mf-field">
              <label className="sba-mf-label required">Nominee Name</label>
              <input
                className="sba-mf-input"
                value={form.name}
                onChange={set("name")}
                placeholder="Enter nominee name"
              />
            </div>
            <div className="sba-mf-field">
              <label className="sba-mf-label required">Relationship</label>
              <select className="sba-mf-select" value={form.relation} onChange={set("relation")}>
                <option value=""></option>
                {["Father", "Mother", "Spouse", "Son", "Daughter", "Brother", "Sister", "Other"].map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </div>
            <div className="sba-mf-field">
              <label className="sba-mf-label required">
                Percentage (%) {remainingPct < 100 && (
                  <span style={{ color: "#1557a0", fontWeight: 700 }}>max {remainingPct}%</span>
                )}
              </label>
              <input
                className="sba-mf-input"
                type="number"
                min="1"
                max={remainingPct}
                value={form.percentage}
                onChange={set("percentage")}
                placeholder={`e.g. ${remainingPct}`}
              />
            </div>
          </div>

          <div className="sba-mf-grid-3">
            <div className="sba-mf-field">
              <label className="sba-mf-label">Date of Birth</label>
              <div className="sba-date-wrap">
                <input className="sba-date-input" type="date" value={form.dob} onChange={set("dob")} />
                <button className="sba-cal-btn" type="button">
                  <CalIcon />
                </button>
              </div>
            </div>
            <div className="sba-mf-field">
              <label className="sba-mf-label">Age</label>
              <div className="sba-readonly">{age !== "" ? `${age} years` : ""}</div>
            </div>
            <div className="sba-mf-field">
              <label className="sba-mf-label">Phone No</label>
              <input
                className="sba-mf-input"
                value={form.phone}
                onChange={set("phone")}
                placeholder="Phone Number"
                maxLength={10}
              />
            </div>
          </div>

          <div className="sba-mf-grid-3">
            <div className="sba-mf-field">
              <label className="sba-mf-label">Aadhar Number</label>
              <input
                className="sba-mf-input"
                value={form.aadhar}
                onChange={set("aadhar")}
                placeholder="Aadhar Number"
                maxLength={12}
              />
            </div>
            <div className="sba-mf-field" />
            <div className="sba-mf-field" />
          </div>

          {/* Address Details — 3 columns */}
          <div className="sba-section-title">Address Details</div>
          <div className="sba-mf-grid-3">
            <div className="sba-mf-field">
              <label className="sba-mf-label">H.No / Flat No</label>
              <input
                className="sba-mf-input"
                value={form.hno}
                onChange={set("hno")}
                placeholder="House / Flat No"
              />
            </div>
            <div className="sba-mf-field">
              <label className="sba-mf-label">Street</label>
              <input
                className="sba-mf-input"
                value={form.street}
                onChange={set("street")}
                placeholder="Street / Area"
              />
            </div>
            <div className="sba-mf-field">
              <label className="sba-mf-label">City</label>
              <input className="sba-mf-input" value={form.city} onChange={set("city")} placeholder="City" />
            </div>
          </div>

          <div className="sba-mf-grid-3">
            <div className="sba-mf-field">
              <label className="sba-mf-label">State</label>
              <select className="sba-mf-select" value={form.state} onChange={set("state")}>
                <option value=""></option>
                {[
                  "Andhra Pradesh", "Telangana", "Karnataka", "Tamil Nadu",
                  "Maharashtra", "Gujarat", "Rajasthan", "Uttar Pradesh",
                  "West Bengal", "Delhi",
                ].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="sba-mf-field">
              <label className="sba-mf-label">Country</label>
              <select className="sba-mf-select" value={form.country} onChange={set("country")}>
                <option>INDIA</option>
                <option>OTHER</option>
              </select>
            </div>
            <div className="sba-mf-field">
              <label className="sba-mf-label">PIN Code</label>
              <input
                className="sba-mf-input"
                value={form.pin}
                onChange={set("pin")}
                placeholder="PIN code"
                maxLength={6}
              />
            </div>
          </div>
        </div>

        <div className="sba-modal-footer">
          <button
            className="sba-btn sba-btn-primary"
            onClick={handleAdd}
            disabled={saving || usedCount >= 3 || usedPct >= 100}
          >
            {saving ? "Saving..." : "Add Nominee"}
          </button>
          <button className="sba-btn sba-btn-secondary" onClick={onClose} disabled={saving}>
            Close
          </button>
          {(usedCount >= 3 || usedPct >= 100) && (
            <span style={{ fontSize: 12, color: "#b91c1c", fontWeight: 500, alignSelf: "center", marginLeft: 4 }}>
              {usedCount >= 3
                ? "Maximum 3 nominees reached."
                : "100% already allocated — no further nominees allowed."}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Main Screen
───────────────────────────────────────────────────────── */
export default function SBAccountScreen({
  initialMode = "create",
  account = null,
  onBack,
  onSave,
  currentUser,
}) {
  const [mode, setMode] = useState(initialMode);

  /* Customers */
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [custId, setCustId] = useState("");
  const [custName, setCustName] = useState("");
  const [custPhoto, setCustPhoto] = useState("");
  const [custDetails, setCustDetails] = useState(null);

  /* Schemes */
  const [schemes, setSchemes] = useState([]);
  const [loadingSchemes, setLoadingSchemes] = useState(false);
  const [schemeId, setSchemeId] = useState("");
  const [minBalance, setMinBalance] = useState("");
  const [roi, setRoi] = useState("");

  const [accountType, setAccountType] = useState("");
  const [createdDate, setCreatedDate] = useState(
    new Date()
      .toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
      .toUpperCase()
  );
  const [agentId, setAgentId] = useState("");
  const [agentName, setAgentName] = useState("");

  /* Nominees */
  const [nominees, setNominees] = useState([]);
  const [membershipNominees, setMembershipNominees] = useState([]);
  const [loadingNominees, setLoadingNominees] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");

  const isReadOnly = mode === "view";
  const userId = currentUser?.id;
 const branchId = currentUser?.branchId ?? currentUser?.branch_id ?? currentUser?.BranchId;

  const S3_API_URL = "https://2ry5cdvd77.execute-api.ap-south-1.amazonaws.com/Prod";

  /* ── Load customers ── */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingCustomers(true);
      try {
        const res = await customerAPI.getApproved(branchId);
        const list = unwrapRows(res);
        if (!cancelled) setCustomers(list);
      } catch (err) {
        console.error("Failed to load customers:", err);
        if (!cancelled) setCustomers([]);
      } finally {
        if (!cancelled) setLoadingCustomers(false);
      }
    })();
    return () => { cancelled = true; };
  }, [branchId]);

  /* ── Load schemes ── */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingSchemes(true);
      try {
        const res = await schemeAPI.getAll(userId);
        const list = unwrapRows(res);
        if (!cancelled) setSchemes(list);
      } catch (err) {
        console.error("Failed to load schemes:", err);
        if (!cancelled) setSchemes([]);
      } finally {
        if (!cancelled) setLoadingSchemes(false);
      }
    })();
    return () => { cancelled = true; };
  }, [userId]);

  /* ── Derive photo URL from customer attachment record ── */
  const getPhotoUrl = (customer, customerId) => {
    if (!customer?.attachments || !Array.isArray(customer.attachments)) return null;
    const photoAttachment = customer.attachments.find(
      (a) => (a.document_type || a.documentType) === "PHOTO"
    );
    if (!photoAttachment) return null;
    const filename =
      photoAttachment.file_path ||
      photoAttachment.filePath ||
      photoAttachment.file_name ||
      photoAttachment.fileName;
    if (!filename) return null;
    return `${S3_API_URL}/getFileS3/${customerId}/${filename}`;
  };

  /* ── Fetch membership nominees for a customer ── */
  const loadMembershipNominees = async (customerId) => {
    if (!customerId) {
      setMembershipNominees([]);
      return;
    }
    setLoadingNominees(true);
    try {
      const res = await nomineeAPI.getAll(customerId, userId);
      const list = unwrapRows(res);
      setMembershipNominees(list);
    } catch (err) {
      console.error("Failed to load nominees:", err);
      setMembershipNominees([]);
    } finally {
      setLoadingNominees(false);
    }
  };

  /* ── When customer selection changes ── */
  useEffect(() => {
    if (!custId) {
      setCustName("");
      setCustPhoto("");
      setCustDetails(null);
      setMembershipNominees([]);
      return;
    }
    if (mode === "create" || mode === "edit") {
      const customer = customers.find((c) => String(c.id) === String(custId));
      if (customer) {
        setCustName(
          `${customer.firstName || customer.first_name || ""} ${customer.middleName || customer.middle_name || ""} ${customer.lastName || customer.last_name || ""}`.trim() ||
            String(custId)
        );
        setCustDetails(customer);
        setCustPhoto(getPhotoUrl(customer, custId) || "");
      }
      loadMembershipNominees(custId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [custId, mode, customers]);

  /* ── Prefill for edit / view modes ── */
  useEffect(() => {
    setSaved(false);
    setSaveError("");
    if ((mode === "edit" || mode === "view") && account) {
      setCustId(account.customerId ?? account.custId ?? "");
      setCustName(account.custName || "");
      setCustPhoto(account.custPhoto || "");
      setSchemeId(account.schemeId ?? "");
      setAccountType(account.accountType || "");
      setCreatedDate(account.createdDate || "");
      setAgentId(account.agentId || "");
      setAgentName(account.agentName || "");

      const ids = (account.nomineeId || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      if (account.nominees && Array.isArray(account.nominees)) {
        setNominees(account.nominees);
      } else if (ids.length) {
        setNominees(ids.map((id) => ({ id })));
      } else {
        setNominees([]);
      }

      if (account.customerId || account.custId) {
        loadMembershipNominees(account.customerId ?? account.custId);
      }
    } else if (mode === "create") {
      setCustId("");
      setCustName("");
      setCustPhoto("");
      setCustDetails(null);
      setSchemeId("");
      setAccountType("");
      setAgentId("");
      setAgentName("");
      setNominees([]);
      setMembershipNominees([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, account]);

  /* ── Hydrate placeholder nominee stubs from membership list ── */
  useEffect(() => {
    if (!membershipNominees.length || !nominees.length) return;
    const needsHydration = nominees.some((n) => !n.name && n.id);
    if (!needsHydration) return;
    setNominees((prev) =>
      prev.map((n) => {
        if (n.name) return n;
        const full = membershipNominees.find((m) => String(m.id) === String(n.id));
        return full || n;
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [membershipNominees]);

  /* ── Scheme auto-fill ── */
  useEffect(() => {
    const scheme = schemes.find((s) => String(s.id) === String(schemeId));
    if (scheme) {
      setMinBalance(scheme.minBalance ?? scheme.min_balance ?? "");
      setRoi(scheme.roi ?? "");
    } else {
      setMinBalance("");
      setRoi("");
    }
  }, [schemeId, schemes]);

  /* ── Agent name auto-fill ── */
  useEffect(() => {
    if (agentId === "A001") setAgentName("Ramesh Kumar");
    else if (agentId === "A002") setAgentName("Priya Nair");
    else if (!isReadOnly) setAgentName("");
  }, [agentId, isReadOnly]);

  const handleReset = () => {
    setCustId("");
    setCustName("");
    setCustPhoto("");
    setCustDetails(null);
    setSchemeId("");
    setAccountType("");
    setAgentId("");
    setAgentName("");
    setNominees([]);
    setMembershipNominees([]);
    setSaveError("");
  };

  const handleSave = async () => {
    setSaveError("");
    if (!custId || !schemeId || !accountType) {
      setSaveError("Please fill Cust Id, Scheme Name and Account Type before saving.");
      return;
    }
    setSaving(true);
    try {
      const nomineeIdStr = nominees
        .map((n) => n.id)
        .filter((id) => id !== undefined && id !== null && id !== "")
        .join(",");

      const payload = {
        customerId: custId,
        accountType,
        schemeId,
        agentId: agentId || null,
        agentName: agentName || null,
        nomineeId: nomineeIdStr || null,
        depositType: "SAVINGS_DEPOSITE",
      };

      if (mode === "edit" && account?.id) {
        await accountAPI.update({ ...payload, id: account.id }, userId);
      } else {
        await accountAPI.insert(payload, userId);
      }

      setSaved(true);
      setTimeout(() => {
        onSave && onSave();
      }, 900);
    } catch (err) {
      console.error("Failed to save account:", err);
      setSaveError("Failed to save account. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const CalIcon = () => (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );

  /* ── Tabs ── */
  const TABS = [
    {
      key: "create",
      label: "New",
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      ),
    },
    {
      key: "view",
      label: "View",
      disabled: !account,
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      ),
    },
    {
      key: "edit",
      label: "Edit",
      disabled: !account,
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      ),
    },
  ];

  /* ────────────────────────────────────────────────────────
     Render
  ──────────────────────────────────────────────────────── */
  return (
    <div className="sba-root">

      {/* Top bar */}
      <div className="sba-topbar">
        <div className="sba-topbar-left">
          <button className="sba-back-btn" onClick={onBack}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="sba-page-title">SB Account Creation</div>
        </div>

        {/* Tab bar */}
        <div className="sba-tabbar">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={[
                "sba-tab",
                mode === tab.key ? "sba-tab-active" : "",
                tab.disabled ? "sba-tab-disabled" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => !tab.disabled && setMode(tab.key)}
              disabled={tab.disabled}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {saveError && (
        <div className="sba-error-banner" style={{ marginBottom: 16 }}>
          {saveError}
        </div>
      )}

      {/* Primary Customer Search */}
      <div className="sba-card">
        <div className="sba-card-header">Primary Customer Search</div>
        <div className="sba-card-body">
          <div className="sba-info-grid">
            <div>
              <div className="sba-row">
                <label className="sba-label required">Cust Id</label>
                <div style={{ marginLeft: 12, display: "flex", gap: 10, alignItems: "center" }}>
                  <select
                    className="sba-select"
                    value={custId}
                    onChange={(e) => setCustId(e.target.value)}
                    disabled={isReadOnly || loadingCustomers}
                  >
                    <option value="">
                      {loadingCustomers ? "Loading customers..." : "Select Cust ID"}
                    </option>
                    {customers.map((c) => {
                      const id = c.id ?? c.customerId;
                      const uniqueId = c.customer_unique_id || c.customerUniqueId || id;
                      const name = `${c.firstName || c.first_name || ""} ${c.lastName || c.last_name || ""}`.trim();
                      return (
                        <option key={id} value={id}>
                          {uniqueId} - {name || "Unnamed"}
                        </option>
                      );
                    })}
                  </select>
                  {!isReadOnly && (
                    <button className="sba-btn sba-btn-primary" onClick={handleReset}>
                      Reset
                    </button>
                  )}
                </div>
              </div>

              <div className="sba-row">
                <span className="sba-label">Name</span>
                <span className="sba-value-plain" style={{ marginLeft: 12 }}>
                  {custName || "—"}
                </span>
              </div>

              {custDetails && (
                <>
                  <div className="sba-row">
                    <span className="sba-label">Customer Id</span>
                    <span className="sba-value-plain" style={{ marginLeft: 12 }}>
                      {custDetails.customer_unique_id || custDetails.customerUniqueId || "—"}
                    </span>
                  </div>
                  <div className="sba-row">
                    <span className="sba-label">Gender</span>
                    <span className="sba-value-plain" style={{ marginLeft: 12 }}>
                      {custDetails.gender || "—"}
                    </span>
                  </div>
                  <div className="sba-row">
                    <span className="sba-label">DOB</span>
                    <span className="sba-value-plain" style={{ marginLeft: 12 }}>
                      {custDetails.dob
                        ? new Date(custDetails.dob).toLocaleDateString("en-IN")
                        : "—"}
                    </span>
                  </div>
                  <div className="sba-row">
                    <span className="sba-label">Age</span>
                    <span className="sba-value-plain" style={{ marginLeft: 12 }}>
                      {custDetails.age || "—"}
                    </span>
                  </div>
                  <div className="sba-row">
                    <span className="sba-label">Mobile</span>
                    <span className="sba-value-plain" style={{ marginLeft: 12 }}>
                      {custDetails.phone1 || "—"}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Customer photo */}
            <div style={{ paddingTop: 4, textAlign: "center" }}>
              <div className="sba-row" style={{ justifyContent: "center" }}>
                {custPhoto ? (
                  <div className="sba-customer-photo">
                    <img
                      src={custPhoto}
                      alt="Customer"
                      className="sba-photo-img"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                    <a
                      href={custPhoto}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="sba-photo-link"
                    >
                      View Full Photo
                    </a>
                  </div>
                ) : custId ? (
                  <div className="sba-no-photo">No photo available</div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scheme Details */}
      <div className="sba-card">
        <div className="sba-card-header">Scheme Details</div>
        <div className="sba-card-body">
          <div className="sba-scheme-grid">
            <div className="sba-info-item">
              <span className="sba-label required">Scheme Name</span>
              <select
                className="sba-select"
                style={{ marginLeft: 12 }}
                value={schemeId}
                onChange={(e) => setSchemeId(e.target.value)}
                disabled={isReadOnly || loadingSchemes}
              >
                <option value="">
                  {loadingSchemes ? "Loading schemes..." : ""}
                </option>
                {schemes.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="sba-info-item" style={{ justifyContent: "center" }}>
              <span className="sba-label" style={{ minWidth: 90 }}>Min Balance</span>
              <span className="sba-value-mono" style={{ marginLeft: 12 }}>
                {minBalance}
              </span>
            </div>
            <div className="sba-info-item" style={{ justifyContent: "flex-end" }}>
              <span className="sba-label" style={{ minWidth: 40 }}>ROI</span>
              <span className="sba-value-mono" style={{ marginLeft: 12 }}>
                {roi}
              </span>
            </div>
          </div>

          <div className="sba-scheme-grid" style={{ marginTop: 16 }}>
            <div className="sba-info-item">
              <span className="sba-label required">Account Type</span>
              <select
                className="sba-select"
                style={{ marginLeft: 12 }}
                value={accountType}
                onChange={(e) => setAccountType(e.target.value)}
                disabled={isReadOnly}
              >
                <option value=""></option>
                <option value="SINGLE">Single</option>
                <option value="JOINT">Joint</option>
              </select>
            </div>
            <div className="sba-info-item" style={{ justifyContent: "center" }}>
              <span className="sba-label required" style={{ minWidth: 100 }}>Created Date</span>
              <div className="sba-date-wrap" style={{ marginLeft: 12 }}>
                <input
                  className="sba-date-input"
                  type="text"
                  value={createdDate}
                  onChange={(e) => setCreatedDate(e.target.value)}
                  readOnly={isReadOnly}
                />
                <button className="sba-cal-btn">
                  <CalIcon />
                </button>
              </div>
            </div>
            <div />
          </div>
        </div>
      </div>

      {/* Agent Details */}
      <div className="sba-card">
        <div className="sba-card-header">Agent Details</div>
        <div className="sba-card-body">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", alignItems: "center" }}>
            <div className="sba-info-item">
              <span className="sba-label">Agent Id</span>
              <select
                className="sba-select"
                style={{ marginLeft: 12 }}
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
                disabled={isReadOnly}
              >
                <option value=""></option>
                <option value="A001">A001</option>
                <option value="A002">A002</option>
              </select>
            </div>
            <div className="sba-info-item">
              <span className="sba-label" style={{ minWidth: 90 }}>Agent Name</span>
              <span className="sba-value-plain" style={{ marginLeft: 12 }}>
                {agentName}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Add Nominee button */}
      {!isReadOnly && (
        <div style={{ marginBottom: 16 }}>
          <button
            className="sba-btn sba-btn-primary"
            onClick={() => setShowModal(true)}
            disabled={!custId}
            title={!custId ? "Select a customer first" : ""}
          >
            + Add Nominee for This Account
          </button>
        </div>
      )}

      {/* Nominee Details List From Membership */}
      <div className="sba-card">
        <div className="sba-card-header">Nominee Details List From Membership</div>
        <div className="sba-card-body">
          {loadingNominees ? (
            <div className="sba-nominee-empty">Loading nominees...</div>
          ) : membershipNominees.length === 0 ? (
            <div className="sba-nominee-empty">
              No nominee records found from membership.
            </div>
          ) : (
            <div className="sba-table-responsive">
              <table className="sba-nominee-table">
                <thead>
                  <tr>
                    <th>Add</th>
                    <th>Id</th>
                    <th>Nominee Name</th>
                    <th>Relationship</th>
                    <th>Age</th>
                    <th>Phone</th>
                    <th>H.No</th>
                    <th>Street</th>
                    <th>City</th>
                    <th>State</th>
                    <th>Country</th>
                    <th>Percentage</th>
                    <th>PIN</th>
                    <th>Date of Birth</th>
                    <th>Aadhar</th>
                  </tr>
                </thead>
                <tbody>
                  {membershipNominees.map((nominee, idx) => {
                    const alreadyAdded = nominees.some(
                      (n) => String(n.id) === String(nominee.id)
                    );
                    return (
                      <tr key={nominee.id ?? idx}>
                        <td>
                          <button
                            className="sba-add-btn"
                            disabled={alreadyAdded || isReadOnly}
                            onClick={() =>
                              setNominees((prev) => [...prev, nominee])
                            }
                          >
                            {alreadyAdded ? "Added" : "Add"}
                          </button>
                        </td>
                        <td>{nominee.id ?? "—"}</td>
                        <td>{nominee.nomineeName || nominee.name}</td>
                        <td>{nominee.relationType || nominee.relation}</td>
                        <td>{nominee.age ?? "—"}</td>
                        <td>{nominee.phoneNo || nominee.phone || "—"}</td>
                        <td>{nominee.hno || "—"}</td>
                        <td>{nominee.street || "—"}</td>
                        <td>{nominee.city || "—"}</td>
                        <td>{nominee.state || "—"}</td>
                        <td>{nominee.country || "—"}</td>
                        <td>{nominee.percentageShare ?? nominee.percentage}%</td>
                        <td>{nominee.pincode || nominee.pin || "—"}</td>
                        <td>
                          {nominee.dob
                            ? new Date(nominee.dob).toLocaleDateString("en-IN")
                            : "—"}
                        </td>
                        <td>{nominee.aadharNumber || "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Nominee Details For This Account */}
      <div className="sba-card">
        <div className="sba-card-header">Nominee Details For This Account</div>
        <div className="sba-card-body">
          {nominees.length === 0 ? (
            <div className="sba-nominee-empty">
              No nominees added for this account yet.
            </div>
          ) : (
            <div className="sba-table-responsive">
              <table className="sba-nominee-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Nominee Name</th>
                    <th>Relationship</th>
                    <th>Percentage</th>
                    <th>DOB</th>
                    <th>Age</th>
                    <th>Phone</th>
                    <th>City</th>
                    <th>State</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {nominees.map((n, i) => (
                    <tr key={n.id ?? i}>
                      <td>{i + 1}</td>
                      <td>{n.nomineeName || n.name}</td>
                      <td>{n.relationType || n.relation}</td>
                      <td>{n.percentageShare ?? n.percentage}%</td>
                      <td>{n.dob || "—"}</td>
                      <td>
                        {n.age !== "" && n.age != null ? `${n.age} yrs` : "—"}
                      </td>
                      <td>{n.phoneNo || n.phone || "—"}</td>
                      <td>{n.city || "—"}</td>
                      <td>{n.state || "—"}</td>
                      <td>
                        {!isReadOnly && (
                          <button
                            className="sba-remove-btn"
                            onClick={() =>
                              setNominees((prev) =>
                                prev.filter((_, idx) => idx !== i)
                              )
                            }
                          >
                            Remove
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="sba-footer">
        {!isReadOnly ? (
          <>
            <button
              className={`sba-btn sba-btn-primary ${saved ? "sba-btn-saved" : ""}`}
              onClick={handleSave}
              disabled={saving}
            >
              {saved ? "Saved!" : saving ? "Saving..." : "Save"}
            </button>
            <button className="sba-btn sba-btn-secondary" onClick={handleReset}>
              Reset
            </button>
            {mode === "edit" && (
              <button
                className="sba-btn sba-btn-secondary"
                onClick={() => setMode("view")}
              >
                View
              </button>
            )}
            <button className="sba-btn sba-btn-outline" onClick={onBack}>
              Go To Task List
            </button>
          </>
        ) : (
          <>
            <button
              className="sba-btn sba-btn-primary"
              onClick={() => setMode("edit")}
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                style={{ marginRight: 6 }}
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Edit Account
            </button>
            <button className="sba-btn sba-btn-outline" onClick={onBack}>
              Back
            </button>
          </>
        )}
      </div>

      {/* Nominee Modal */}
      {showModal && (
        <NomineeModal
          onClose={() => setShowModal(false)}
          onAdd={(nominee) => setNominees((prev) => [...prev, nominee])}
          custId={custId}
          currentUser={currentUser}
          existingNominees={nominees}
        />
      )}
    </div>
  );
}
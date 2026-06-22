import { useState, useEffect } from "react";
import "./CAAccountScreen.css";

/* ── Nominee Modal for CA ─────────────────────────────────────────── */
function CANomineeModal({ onClose, onAdd }) {
  const [form, setForm] = useState({
    name: "",
    relation: "",
    age: "",
    percentage: "",
    dob: "",
    hno: "",
    address1: "",
    street: "",
    city: "",
    district: "",
    state: "",
    pin: "",
    country: "INDIA"
  });

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleAdd = () => {
    if (!form.name || !form.relation || !form.percentage) {
      alert("Please fill all required fields (Name, Relation, Percentage).");
      return;
    }
    onAdd(form);
    onClose();
  };

  return (
    <div className="ca-modal-overlay" onClick={(e) => { if (e.target.classList.contains("ca-modal-overlay")) onClose(); }}>
      <div className="ca-modal-box">
        <div className="ca-modal-header">
          <h3>Add Nominee</h3>
          <button className="ca-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="ca-modal-body">
          <div className="ca-form-grid">
            <div className="ca-form-field">
              <label className="ca-label required">Name</label>
              <input className="ca-input" value={form.name} onChange={set("name")} />
            </div>
            <div className="ca-form-field">
              <label className="ca-label required">Relation</label>
              <select className="ca-select" value={form.relation} onChange={set("relation")}>
                <option value=""></option>
                {["Father", "Mother", "Spouse", "Son", "Daughter", "Brother", "Sister", "Other"].map(r =>
                  <option key={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <div className="ca-form-grid">
            <div className="ca-form-field">
              <label className="ca-label required">Percentage (%)</label>
              <input className="ca-input" type="number" value={form.percentage} onChange={set("percentage")} />
            </div>
            <div className="ca-form-field">
              <label className="ca-label">DOB</label>
              <input className="ca-input" type="date" value={form.dob} onChange={set("dob")} />
            </div>
          </div>
          <div className="ca-form-grid">
            <div className="ca-form-field">
              <label className="ca-label">Age</label>
              <input className="ca-input" value={form.age} onChange={set("age")} />
            </div>
            <div className="ca-form-field">
              <label className="ca-label">H.No</label>
              <input className="ca-input" value={form.hno} onChange={set("hno")} />
            </div>
          </div>
          <div className="ca-form-grid">
            <div className="ca-form-field">
              <label className="ca-label">Address1</label>
              <input className="ca-input" value={form.address1} onChange={set("address1")} />
            </div>
            <div className="ca-form-field">
              <label className="ca-label">Street</label>
              <input className="ca-input" value={form.street} onChange={set("street")} />
            </div>
          </div>
          <div className="ca-form-grid">
            <div className="ca-form-field">
              <label className="ca-label">City</label>
              <input className="ca-input" value={form.city} onChange={set("city")} />
            </div>
            <div className="ca-form-field">
              <label className="ca-label">District</label>
              <input className="ca-input" value={form.district} onChange={set("district")} />
            </div>
          </div>
          <div className="ca-form-grid">
            <div className="ca-form-field">
              <label className="ca-label">State</label>
              <select className="ca-select" value={form.state} onChange={set("state")}>
                <option value=""></option>
                {["Andhra Pradesh", "Telangana", "Karnataka", "Tamil Nadu", "Maharashtra",
                  "Gujarat", "Rajasthan", "Uttar Pradesh", "West Bengal", "Delhi"].map(s =>
                  <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="ca-form-field">
              <label className="ca-label">Country</label>
              <select className="ca-select" value={form.country} onChange={set("country")}>
                <option>INDIA</option><option>OTHER</option>
              </select>
            </div>
          </div>
          <div className="ca-form-grid">
            <div className="ca-form-field">
              <label className="ca-label">Pin</label>
              <input className="ca-input" value={form.pin} onChange={set("pin")} maxLength={6} />
            </div>
          </div>
        </div>
        <div className="ca-modal-footer">
          <button className="ca-btn ca-btn-primary" onClick={handleAdd}>Add Nominee</button>
          <button className="ca-btn ca-btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

/* ── Main CAAccountScreen ───────────────────────────────────────────── */
export default function CAAccountScreen({ initialMode = "create", account = null, onBack, onSave, currentUser }) {
  const [mode, setMode] = useState(initialMode);
  const isReadOnly = mode === "view";

  // CA Account No & Status
  const [caAccNo, setCaAccNo] = useState("");
  const [accountStatus, setAccountStatus] = useState("Active");

  // Member Details
  const [custId, setCustId] = useState("");
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [aadhar, setAadhar] = useState("");
  const [phone, setPhone] = useState("");
  const [admission, setAdmission] = useState("");
  const [memberStatus, setMemberStatus] = useState("");
  const [closeDate, setCloseDate] = useState("");
  const [branch, setBranch] = useState("");

  // Scheme Details
  const [schemeName, setSchemeName] = useState("");
  const [minBalance, setMinBalance] = useState("");

  // Account Details
  const [createdDate, setCreatedDate] = useState(new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase());
  const [accountBranch, setAccountBranch] = useState("");
  const [depositType, setDepositType] = useState("");
  const [accType, setAccType] = useState("");
  const [closedDate, setClosedDate] = useState("");
  const [createdBy, setCreatedBy] = useState("");
  const [approvedBy, setApprovedBy] = useState("");

  // Nominee Details
  const [nominees, setNominees] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // Transaction
  const [transactions, setTransactions] = useState([]);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Auto-fill min balance based on scheme
  useEffect(() => {
    if (schemeName === "CA_BASIC") {
      setMinBalance("10,000");
    } else if (schemeName === "CA_PREMIUM") {
      setMinBalance("25,000");
    } else if (schemeName === "CA_CORPORATE") {
      setMinBalance("50,000");
    } else {
      setMinBalance("");
    }
  }, [schemeName]);

  // Fetch customer details when custId changes
  useEffect(() => {
    if (custId) {
      const customerData = {
        "01000001": { name: "RAJESH KUMAR", lastName: "KUMAR", aadhar: "1234-5678-9012", phone: "9876543210", admission: "2020-01-01", branch: "Main Branch", status: "Active" },
        "01000002": { name: "PRIYA REDDY", lastName: "REDDY", aadhar: "2345-6789-0123", phone: "9876543211", admission: "2020-02-01", branch: "City Branch", status: "Active" },
        "01000003": { name: "SURESH BABU", lastName: "BABU", aadhar: "3456-7890-1234", phone: "9876543212", admission: "2020-03-01", branch: "Town Branch", status: "Active" },
        "01000004": { name: "SULOCHANA", lastName: "DEVI", aadhar: "4567-8901-2345", phone: "9876543213", admission: "2020-04-01", branch: "Suburban Branch", status: "Active" },
        "01000005": { name: "NAGARJUNA", lastName: "RAO", aadhar: "5678-9012-3456", phone: "9876543214", admission: "2020-05-01", branch: "Rural Branch", status: "Active" }
      };
      const data = customerData[custId];
      if (data) {
        setName(data.name);
        setLastName(data.lastName);
        setAadhar(data.aadhar);
        setPhone(data.phone);
        setAdmission(data.admission);
        setBranch(data.branch);
        setMemberStatus(data.status);
      }
    } else {
      setName("");
      setLastName("");
      setAadhar("");
      setPhone("");
      setAdmission("");
      setBranch("");
      setMemberStatus("");
    }
  }, [custId]);

  const handleReset = () => {
    setCaAccNo("");
    setAccountStatus("Active");
    setCustId("");
    setName("");
    setLastName("");
    setAadhar("");
    setPhone("");
    setAdmission("");
    setMemberStatus("");
    setCloseDate("");
    setBranch("");
    setSchemeName("");
    setMinBalance("");
    setCreatedDate(new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase());
    setAccountBranch("");
    setDepositType("");
    setAccType("");
    setClosedDate("");
    setCreatedBy("");
    setApprovedBy("");
    setNominees([]);
    setTransactions([]);
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
    setSaved(true);
    setTimeout(() => { onSave && onSave(); }, 900);
  };

  return (
    <div className="ca-root">
      {/* Top Bar */}
      <div className="ca-topbar">
        <div className="ca-topbar-left">
          <button className="ca-back-btn" onClick={onBack}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <div className="ca-page-title">Current Account</div>
        </div>
        <div className="ca-tabbar">
          <button className={`ca-tab ${mode === "create" ? "ca-tab-active" : ""}`} onClick={() => setMode("create")}>New</button>
          <button className={`ca-tab ${mode === "view" ? "ca-tab-active" : ""}`} onClick={() => setMode("view")} disabled={!account}>View</button>
          <button className={`ca-tab ${mode === "edit" ? "ca-tab-active" : ""}`} onClick={() => setMode("edit")} disabled={!account}>Edit</button>
        </div>
      </div>

      {/* CA Account No & Status */}
      <div className="ca-card">
        <div className="ca-card-header">CA Acc No</div>
        <div className="ca-card-body">
          <div className="ca-row">
            <div className="ca-field-group">
              <label className="ca-label">CA Acc No</label>
              <input className="ca-input" value={caAccNo} onChange={e => setCaAccNo(e.target.value)} readOnly={isReadOnly} placeholder="Auto generated" />
            </div>
            <div className="ca-field-group">
              <label className="ca-label">Account Status</label>
              <select className="ca-select" value={accountStatus} onChange={e => setAccountStatus(e.target.value)} disabled={isReadOnly}>
                <option value="Active">Active</option>
                <option value="Closed">Closed</option>
                <option value="Dormant">Dormant</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
            {!isReadOnly && (
              <div className="ca-field-group">
                <button className="ca-btn ca-btn-secondary" onClick={handleReset} style={{ marginTop: 24 }}>Reset</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Member Details */}
      <div className="ca-card">
        <div className="ca-card-header">Member Details</div>
        <div className="ca-card-body">
          <div className="ca-form-grid-3">
            <div className="ca-field-group">
              <label className="ca-label required">Cust Id</label>
              <select className="ca-select" value={custId} onChange={e => setCustId(e.target.value)} disabled={isReadOnly}>
                <option value="">Select Cust ID</option>
                <option value="01000001">01000001 - RAJESH KUMAR</option>
                <option value="01000002">01000002 - PRIYA REDDY</option>
                <option value="01000003">01000003 - SURESH BABU</option>
                <option value="01000004">01000004 - SULOCHANA</option>
                <option value="01000005">01000005 - NAGARJUNA</option>
              </select>
            </div>
            <div className="ca-field-group">
              <label className="ca-label">Name</label>
              <input className="ca-input" value={name} readOnly />
            </div>
            <div className="ca-field-group">
              <label className="ca-label">Last Name</label>
              <input className="ca-input" value={lastName} readOnly />
            </div>
            <div className="ca-field-group">
              <label className="ca-label">Aadhar</label>
              <input className="ca-input" value={aadhar} readOnly />
            </div>
            <div className="ca-field-group">
              <label className="ca-label">Phone</label>
              <input className="ca-input" value={phone} readOnly />
            </div>
            <div className="ca-field-group">
              <label className="ca-label">Admission</label>
              <input className="ca-input" type="date" value={admission} readOnly />
            </div>
            <div className="ca-field-group">
              <label className="ca-label">Status</label>
              <input className="ca-input" value={memberStatus} readOnly />
            </div>
            <div className="ca-field-group">
              <label className="ca-label">Close Date</label>
              <input className="ca-input" type="date" value={closeDate} onChange={e => setCloseDate(e.target.value)} readOnly={isReadOnly} />
            </div>
            <div className="ca-field-group">
              <label className="ca-label">Branch</label>
              <input className="ca-input" value={branch} readOnly />
            </div>
          </div>
        </div>
      </div>

      {/* Scheme Details */}
      <div className="ca-card">
        <div className="ca-card-header">Scheme Details</div>
        <div className="ca-card-body">
          <div className="ca-form-grid-2">
            <div className="ca-field-group">
              <label className="ca-label required">Scheme Name</label>
              <select className="ca-select" value={schemeName} onChange={e => setSchemeName(e.target.value)} disabled={isReadOnly}>
                <option value="">Select Scheme</option>
                <option value="CA_BASIC">CA Basic</option>
                <option value="CA_PREMIUM">CA Premium</option>
                <option value="CA_CORPORATE">CA Corporate</option>
              </select>
            </div>
            <div className="ca-field-group">
              <label className="ca-label">Min Balance</label>
              <input className="ca-input" value={minBalance} readOnly disabled />
            </div>
          </div>
        </div>
      </div>

      {/* Account Details */}
      <div className="ca-card">
        <div className="ca-card-header">Account Details</div>
        <div className="ca-card-body">
          <div className="ca-form-grid-2">
            <div className="ca-field-group">
              <label className="ca-label required">Created Date</label>
              <input className="ca-input" value={createdDate} readOnly />
            </div>
            <div className="ca-field-group">
              <label className="ca-label required">Branch</label>
              <select className="ca-select" value={accountBranch} onChange={e => setAccountBranch(e.target.value)} disabled={isReadOnly}>
                <option value="">Select Branch</option>
                <option value="Main Branch">Main Branch</option>
                <option value="City Branch">City Branch</option>
                <option value="Town Branch">Town Branch</option>
              </select>
            </div>
            <div className="ca-field-group">
              <label className="ca-label required">Deposit Type</label>
              <select className="ca-select" value={depositType} onChange={e => setDepositType(e.target.value)} disabled={isReadOnly}>
                <option value="">Select Type</option>
                <option value="CASH">Cash</option>
                <option value="CHEQUE">Cheque</option>
                <option value="TRANSFER">Transfer</option>
              </select>
            </div>
            <div className="ca-field-group">
              <label className="ca-label required">Acc Type</label>
              <select className="ca-select" value={accType} onChange={e => setAccType(e.target.value)} disabled={isReadOnly}>
                <option value="">Select Type</option>
                <option value="SINGLE">Single</option>
                <option value="JOINT">Joint</option>
                <option value="CORPORATE">Corporate</option>
              </select>
            </div>
            <div className="ca-field-group">
              <label className="ca-label">Closed Date</label>
              <input className="ca-input" type="date" value={closedDate} onChange={e => setClosedDate(e.target.value)} readOnly={isReadOnly} />
            </div>
            <div className="ca-field-group">
              <label className="ca-label">Created By</label>
              <input className="ca-input" value={createdBy} onChange={e => setCreatedBy(e.target.value)} readOnly={isReadOnly} placeholder="Auto filled" />
            </div>
            <div className="ca-field-group">
              <label className="ca-label">Approved By</label>
              <input className="ca-input" value={approvedBy} onChange={e => setApprovedBy(e.target.value)} readOnly={isReadOnly} placeholder="Auto filled" />
            </div>
          </div>
        </div>
      </div>

      {/* Nominee Details */}
      <div className="ca-card">
        <div className="ca-card-header">Nominee Details</div>
        <div className="ca-card-body">
          {!isReadOnly && (
            <div style={{ marginBottom: 16 }}>
              <button className="ca-btn ca-btn-primary" onClick={() => setShowModal(true)}>+ Add Nominee</button>
            </div>
          )}
          {nominees.length === 0 ? (
            <div className="ca-no-data">No Data Found</div>
          ) : (
            <div className="ca-table-responsive">
              <table className="ca-table">
                <thead>
                  <tr>
                    <th>Name</th><th>Relation</th><th>Age</th><th>Percentage</th>
                    <th>DOB</th><th>H.No</th><th>Address</th><th>City</th>
                    <th>District</th><th>State</th><th>Pin</th>
                    {!isReadOnly && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {nominees.map((n, i) => (
                    <tr key={i}>
                      <td>{n.name}</td>
                      <td>{n.relation}</td>
                      <td>{n.age}</td>
                      <td>{n.percentage}%</td>
                      <td>{n.dob}</td>
                      <td>{n.hno}</td>
                      <td>{n.address1}</td>
                      <td>{n.city}</td>
                      <td>{n.district}</td>
                      <td>{n.state}</td>
                      <td>{n.pin}</td>
                      {!isReadOnly && (
                        <td>
                          <button className="ca-remove-btn" onClick={() => setNominees(prev => prev.filter((_, idx) => idx !== i))}>Remove</button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Transaction */}
      <div className="ca-card">
        <div className="ca-card-header">Transaction</div>
        <div className="ca-card-body">
          {transactions.length === 0 ? (
            <div className="ca-no-data">No transactions found</div>
          ) : (
            <div className="ca-table-responsive">
              <table className="ca-table">
                <thead>
                  <tr>
                    <th>Date</th><th>Transaction ID</th><th>Type</th>
                    <th>Amount</th><th>Balance</th><th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t, i) => (
                    <tr key={i}>
                      <td>{t.date}</td>
                      <td>{t.id}</td>
                      <td>{t.type}</td>
                      <td>{t.amount}</td>
                      <td>{t.balance}</td>
                      <td>{t.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="ca-footer">
        {!isReadOnly ? (
          <>
            <button className={`ca-btn ca-btn-primary ${saved ? "ca-btn-saved" : ""}`} onClick={handleSave} disabled={saving}>
              {saved ? "✓ Saved!" : saving ? "Saving..." : "Save"}
            </button>
            <button className="ca-btn ca-btn-secondary" onClick={handleReset}>Reset</button>
            {mode === "edit" && <button className="ca-btn ca-btn-secondary" onClick={() => setMode("view")}>View</button>}
            <button className="ca-btn ca-btn-outline" onClick={onBack}>Back</button>
          </>
        ) : (
          <>
            <button className="ca-btn ca-btn-primary" onClick={() => setMode("edit")}>Edit Account</button>
            <button className="ca-btn ca-btn-outline" onClick={onBack}>Back</button>
          </>
        )}
      </div>

      {/* Nominee Modal */}
      {showModal && <CANomineeModal onClose={() => setShowModal(false)} onAdd={(nominee) => setNominees(prev => [...prev, nominee])} />}
    </div>
  );
}
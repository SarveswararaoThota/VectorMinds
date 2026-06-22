import { useState, useEffect } from "react";
import "./FDAccountScreen.css";

/* ── Nominee Modal for FD ─────────────────────────────────────────── */
function FDNomineeModal({ onClose, onAdd }) {
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
    pin: "",
    sysId: ""
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
    <div className="fd-modal-overlay" onClick={(e) => { if (e.target.classList.contains("fd-modal-overlay")) onClose(); }}>
      <div className="fd-modal-box">
        <div className="fd-modal-header">
          <h3>Add Nominee</h3>
          <button className="fd-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="fd-modal-body">
          <div className="fd-form-grid">
            <div className="fd-form-field">
              <label className="fd-label required">Name</label>
              <input className="fd-input" value={form.name} onChange={set("name")} />
            </div>
            <div className="fd-form-field">
              <label className="fd-label required">Relation</label>
              <select className="fd-select" value={form.relation} onChange={set("relation")}>
                <option value=""></option>
                {["Father", "Mother", "Spouse", "Son", "Daughter", "Brother", "Sister", "Other"].map(r =>
                  <option key={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <div className="fd-form-grid">
            <div className="fd-form-field">
              <label className="fd-label required">Percentage (%)</label>
              <input className="fd-input" type="number" value={form.percentage} onChange={set("percentage")} />
            </div>
            <div className="fd-form-field">
              <label className="fd-label">DOB</label>
              <input className="fd-input" type="date" value={form.dob} onChange={set("dob")} />
            </div>
          </div>
          <div className="fd-form-grid">
            <div className="fd-form-field">
              <label className="fd-label">Age</label>
              <input className="fd-input" value={form.age} onChange={set("age")} />
            </div>
            <div className="fd-form-field">
              <label className="fd-label">Hno</label>
              <input className="fd-input" value={form.hno} onChange={set("hno")} />
            </div>
          </div>
          <div className="fd-form-grid">
            <div className="fd-form-field">
              <label className="fd-label">Address1</label>
              <input className="fd-input" value={form.address1} onChange={set("address1")} />
            </div>
            <div className="fd-form-field">
              <label className="fd-label">Street</label>
              <input className="fd-input" value={form.street} onChange={set("street")} />
            </div>
          </div>
          <div className="fd-form-grid">
            <div className="fd-form-field">
              <label className="fd-label">City</label>
              <input className="fd-input" value={form.city} onChange={set("city")} />
            </div>
            <div className="fd-form-field">
              <label className="fd-label">District</label>
              <input className="fd-input" value={form.district} onChange={set("district")} />
            </div>
          </div>
          <div className="fd-form-grid">
            <div className="fd-form-field">
              <label className="fd-label">Pin</label>
              <input className="fd-input" value={form.pin} onChange={set("pin")} />
            </div>
            <div className="fd-form-field">
              <label className="fd-label">Sys Id</label>
              <input className="fd-input" value={form.sysId} onChange={set("sysId")} />
            </div>
          </div>
        </div>
        <div className="fd-modal-footer">
          <button className="fd-btn fd-btn-primary" onClick={handleAdd}>Add Nominee</button>
          <button className="fd-btn fd-btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

/* ── Main FDAccountScreen ───────────────────────────────────────────── */
export default function FDAccountScreen({ initialMode = "create", account = null, onBack, onSave, currentUser }) {
  const [mode, setMode] = useState(initialMode);
  const isReadOnly = mode === "view";

  // FD Account No & Status
  const [fdAccNo, setFdAccNo] = useState("");
  const [status, setStatus] = useState("Active");

  // Member Details
  const [custId, setCustId] = useState("");
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [surname, setSurname] = useState("");
  const [aadhar, setAadhar] = useState("");
  const [phone, setPhone] = useState("");
  const [admission, setAdmission] = useState("");
  const [branch, setBranch] = useState("");
  const [closeDate, setCloseDate] = useState("");
  const [memberStatus, setMemberStatus] = useState("");

  // FD Account Details
  const [scheme, setScheme] = useState("");
  const [depositType, setDepositType] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [tenure, setTenure] = useState("");
  const [roi, setRoi] = useState("");
  const [bondType, setBondType] = useState("");
  const [effectiveDate, setEffectiveDate] = useState("");
  const [specialRoi, setSpecialRoi] = useState("");
  const [days, setDays] = useState("");
  const [maturityDate, setMaturityDate] = useState("");
  const [accountType, setAccountType] = useState("");
  const [createdDate, setCreatedDate] = useState(new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase());
  const [autoRenew, setAutoRenew] = useState("NO");
  const [trfAcnoType, setTrfAcnoType] = useState("");
  const [maturityAmount, setMaturityAmount] = useState("");

  // Nominee Details
  const [nominees, setNominees] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // Closing Details
  const [closedDate, setClosedDate] = useState("");
  const [effectiveRoi, setEffectiveRoi] = useState("");
  const [particulers, setParticulers] = useState("");
  const [completedDays, setCompletedDays] = useState("");
  const [effectiveNetAmount, setEffectiveNetAmount] = useState("");
  const [earnedInterest, setEarnedInterest] = useState("");
  const [paymentMode, setPaymentMode] = useState("");

  // FD Ledger
  const [ledgerEntries, setLedgerEntries] = useState([]);

  // Bond
  const [bondFound, setBondFound] = useState(false);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Calculate maturity amount when deposit amount and ROI change
  useEffect(() => {
    if (depositAmount && roi && days) {
      const principal = parseFloat(depositAmount);
      const rate = parseFloat(roi) / 100;
      const timeInYears = parseInt(days) / 365;
      const calculatedAmount = principal * (1 + rate * timeInYears);
      setMaturityAmount(calculatedAmount.toFixed(2));
    }
  }, [depositAmount, roi, days]);

  // Calculate maturity date
  useEffect(() => {
    if (effectiveDate && days) {
      const startDate = new Date(effectiveDate);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + parseInt(days));
      setMaturityDate(endDate.toISOString().split('T')[0]);
    }
  }, [effectiveDate, days]);

  // Calculate completed days and earned interest when closed
  useEffect(() => {
    if (closedDate && effectiveDate && depositAmount && effectiveRoi) {
      const start = new Date(effectiveDate);
      const end = new Date(closedDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setCompletedDays(diffDays.toString());
      
      const principal = parseFloat(depositAmount);
      const rate = parseFloat(effectiveRoi) / 100;
      const timeInYears = diffDays / 365;
      const interest = principal * rate * timeInYears;
      setEarnedInterest(interest.toFixed(2));
      setEffectiveNetAmount((principal + interest).toFixed(2));
    }
  }, [closedDate, effectiveDate, depositAmount, effectiveRoi]);

  const handleReset = () => {
    setFdAccNo("");
    setStatus("Active");
    setCustId("");
    setName("");
    setLastName("");
    setSurname("");
    setAadhar("");
    setPhone("");
    setAdmission("");
    setBranch("");
    setCloseDate("");
    setMemberStatus("");
    setScheme("");
    setDepositType("");
    setDepositAmount("");
    setTenure("");
    setRoi("");
    setBondType("");
    setEffectiveDate("");
    setSpecialRoi("");
    setDays("");
    setMaturityDate("");
    setAccountType("");
    setCreatedDate(new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase());
    setAutoRenew("NO");
    setTrfAcnoType("");
    setMaturityAmount("");
    setNominees([]);
    setClosedDate("");
    setEffectiveRoi("");
    setParticulers("");
    setCompletedDays("");
    setEffectiveNetAmount("");
    setEarnedInterest("");
    setPaymentMode("");
    setLedgerEntries([]);
    setBondFound(false);
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
    setSaved(true);
    setTimeout(() => { onSave && onSave(); }, 900);
  };

  const handlePrintBond = () => {
    alert("Printing FD Bond...");
  };

  // Fetch customer details when custId changes
  useEffect(() => {
    if (custId) {
      const customerData = {
        "01000001": { name: "RAJESH KUMAR", lastName: "KUMAR", surname: "RAJESH", aadhar: "1234-5678-9012", phone: "9876543210", admission: "2020-01-01", branch: "Main Branch", status: "Active" },
        "01000002": { name: "PRIYA REDDY", lastName: "REDDY", surname: "PRIYA", aadhar: "2345-6789-0123", phone: "9876543211", admission: "2020-02-01", branch: "City Branch", status: "Active" },
        "01000003": { name: "SURESH BABU", lastName: "BABU", surname: "SURESH", aadhar: "3456-7890-1234", phone: "9876543212", admission: "2020-03-01", branch: "Town Branch", status: "Active" },
      };
      const data = customerData[custId];
      if (data) {
        setName(data.name);
        setLastName(data.lastName);
        setSurname(data.surname);
        setAadhar(data.aadhar);
        setPhone(data.phone);
        setAdmission(data.admission);
        setBranch(data.branch);
        setMemberStatus(data.status);
      }
    } else {
      setName("");
      setLastName("");
      setSurname("");
      setAadhar("");
      setPhone("");
      setAdmission("");
      setBranch("");
      setMemberStatus("");
    }
  }, [custId]);

  return (
    <div className="fd-root">
      {/* Top Bar */}
      <div className="fd-topbar">
        <div className="fd-topbar-left">
          <button className="fd-back-btn" onClick={onBack}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <div className="fd-page-title">Fixed Deposit Account</div>
        </div>
        <div className="fd-tabbar">
          <button className={`fd-tab ${mode === "create" ? "fd-tab-active" : ""}`} onClick={() => setMode("create")}>New</button>
          <button className={`fd-tab ${mode === "view" ? "fd-tab-active" : ""}`} onClick={() => setMode("view")} disabled={!account}>View</button>
          <button className={`fd-tab ${mode === "edit" ? "fd-tab-active" : ""}`} onClick={() => setMode("edit")} disabled={!account}>Edit</button>
        </div>
      </div>

      {/* FD Acc No & Status */}
      <div className="fd-card">
        <div className="fd-card-header">FD Acc No</div>
        <div className="fd-card-body">
          <div className="fd-row">
            <div className="fd-field-group">
              <label className="fd-label">FD Acc No</label>
              <input className="fd-input" value={fdAccNo} onChange={e => setFdAccNo(e.target.value)} readOnly={isReadOnly} placeholder="Auto generated" />
            </div>
            <div className="fd-field-group">
              <label className="fd-label">Status</label>
              <select className="fd-select" value={status} onChange={e => setStatus(e.target.value)} disabled={isReadOnly}>
                <option value="Active">Active</option>
                <option value="Closed">Closed</option>
                <option value="Matured">Matured</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Member Details */}
      <div className="fd-card">
        <div className="fd-card-header">Member Details</div>
        <div className="fd-card-body">
          <div className="fd-form-grid-3">
            <div className="fd-field-group">
              <label className="fd-label required">Cust Id</label>
              <select className="fd-select" value={custId} onChange={e => setCustId(e.target.value)} disabled={isReadOnly}>
                <option value="">Select Cust ID</option>
                <option value="01000001">01000001</option>
                <option value="01000002">01000002</option>
                <option value="01000003">01000003</option>
                <option value="01000004">01000004</option>
                <option value="01000005">01000005</option>
              </select>
            </div>
            <div className="fd-field-group">
              <label className="fd-label">Name</label>
              <input className="fd-input" value={name} readOnly />
            </div>
            <div className="fd-field-group">
              <label className="fd-label">Aadhar</label>
              <input className="fd-input" value={aadhar} readOnly />
            </div>
            <div className="fd-field-group">
              <label className="fd-label">Status</label>
              <input className="fd-input" value={memberStatus} readOnly />
            </div>
            <div className="fd-field-group">
              <label className="fd-label">Last Name</label>
              <input className="fd-input" value={lastName} readOnly />
            </div>
            <div className="fd-field-group">
              <label className="fd-label">Phone</label>
              <input className="fd-input" value={phone} readOnly />
            </div>
            <div className="fd-field-group">
              <label className="fd-label">Close Date</label>
              <input className="fd-input" type="date" value={closeDate} onChange={e => setCloseDate(e.target.value)} readOnly={isReadOnly} />
            </div>
            <div className="fd-field-group">
              <label className="fd-label">Surname</label>
              <input className="fd-input" value={surname} readOnly />
            </div>
            <div className="fd-field-group">
              <label className="fd-label">Admission</label>
              <input className="fd-input" type="date" value={admission} readOnly />
            </div>
            <div className="fd-field-group">
              <label className="fd-label">Branch</label>
              <input className="fd-input" value={branch} readOnly />
            </div>
          </div>
        </div>
      </div>

      {/* FD Account Details */}
      <div className="fd-card">
        <div className="fd-card-header">FD Account Details</div>
        <div className="fd-card-body">
          <div className="fd-form-grid-3">
            <div className="fd-field-group">
              <label className="fd-label required">Scheme</label>
              <select className="fd-select" value={scheme} onChange={e => setScheme(e.target.value)} disabled={isReadOnly}>
                <option value="">Select Scheme</option>
                <option value="FD_STANDARD">FD Standard</option>
                <option value="FD_SENIOR">FD Senior Citizen</option>
                <option value="FD_CORPORATE">FD Corporate</option>
              </select>
            </div>
            <div className="fd-field-group">
              <label className="fd-label required">Deposit Type</label>
              <select className="fd-select" value={depositType} onChange={e => setDepositType(e.target.value)} disabled={isReadOnly}>
                <option value="">Select Type</option>
                <option value="CUMULATIVE">Cumulative</option>
                <option value="NON_CUMULATIVE">Non-Cumulative</option>
              </select>
            </div>
            <div className="fd-field-group">
              <label className="fd-label required">Deposit Amount</label>
              <input className="fd-input" type="number" value={depositAmount} onChange={e => setDepositAmount(e.target.value)} readOnly={isReadOnly} />
            </div>
            <div className="fd-field-group">
              <label className="fd-label">Tenure</label>
              <input className="fd-input" value={tenure} onChange={e => setTenure(e.target.value)} readOnly={isReadOnly} placeholder="e.g., 1 Year" />
            </div>
            <div className="fd-field-group">
              <label className="fd-label required">ROI</label>
              <input className="fd-input" type="number" step="0.1" value={roi} onChange={e => setRoi(e.target.value)} readOnly={isReadOnly} />
            </div>
            <div className="fd-field-group">
              <label className="fd-label">Bond Type</label>
              <select className="fd-select" value={bondType} onChange={e => setBondType(e.target.value)} disabled={isReadOnly}>
                <option value="">Select Bond Type</option>
                <option value="CERTIFICATE">Certificate</option>
                <option value="DEMATERIALIZED">Dematerialized</option>
              </select>
            </div>
            <div className="fd-field-group">
              <label className="fd-label required">Effective Date</label>
              <input className="fd-input" type="date" value={effectiveDate} onChange={e => setEffectiveDate(e.target.value)} readOnly={isReadOnly} />
            </div>
            <div className="fd-field-group">
              <label className="fd-label">Special Roi</label>
              <input className="fd-input" type="number" step="0.1" value={specialRoi} onChange={e => setSpecialRoi(e.target.value)} readOnly={isReadOnly} />
            </div>
            <div className="fd-field-group">
              <label className="fd-label">Days</label>
              <input className="fd-input" type="number" value={days} onChange={e => setDays(e.target.value)} readOnly={isReadOnly} />
            </div>
            <div className="fd-field-group">
              <label className="fd-label">Maturity Date</label>
              <input className="fd-input" type="date" value={maturityDate} readOnly disabled />
            </div>
            <div className="fd-field-group">
              <label className="fd-label">Account Type</label>
              <select className="fd-select" value={accountType} onChange={e => setAccountType(e.target.value)} disabled={isReadOnly}>
                <option value="">Select Type</option>
                <option value="SINGLE">Single</option>
                <option value="JOINT">Joint</option>
              </select>
            </div>
            <div className="fd-field-group">
              <label className="fd-label">Created Date</label>
              <input className="fd-input" value={createdDate} readOnly />
            </div>
            <div className="fd-field-group">
              <label className="fd-label">Auto Renew</label>
              <select className="fd-select" value={autoRenew} onChange={e => setAutoRenew(e.target.value)} disabled={isReadOnly}>
                <option value="YES">YES</option>
                <option value="NO">NO</option>
              </select>
            </div>
            <div className="fd-field-group">
              <label className="fd-label">Trf Acno Type</label>
              <input className="fd-input" value={trfAcnoType} onChange={e => setTrfAcnoType(e.target.value)} readOnly={isReadOnly} />
            </div>
            <div className="fd-field-group">
              <label className="fd-label">Maturity Amount</label>
              <input className="fd-input" type="number" value={maturityAmount} readOnly disabled />
            </div>
          </div>
        </div>
      </div>

      {/* Nominee Details */}
      <div className="fd-card">
        <div className="fd-card-header">Nominee Details</div>
        <div className="fd-card-body">
          {!isReadOnly && (
            <div style={{ marginBottom: 16 }}>
              <button className="fd-btn fd-btn-primary" onClick={() => setShowModal(true)}>+ Add Nominee</button>
            </div>
          )}
          {nominees.length === 0 ? (
            <div className="fd-no-data">No data found</div>
          ) : (
            <div className="fd-table-responsive">
              <table className="fd-table">
                <thead>
                  <tr>
                    <th>Name</th><th>Relation</th><th>AGE</th><th>Percentage</th>
                    <th>DOB</th><th>Hno</th><th>Address1</th><th>Street</th>
                    <th>City</th><th>District</th><th>Pin</th><th>Sys Id</th>
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
                      <td>{n.street}</td>
                      <td>{n.city}</td>
                      <td>{n.district}</td>
                      <td>{n.pin}</td>
                      <td>{n.sysId}</td>
                      {!isReadOnly && (
                        <td>
                          <button className="fd-remove-btn" onClick={() => setNominees(prev => prev.filter((_, idx) => idx !== i))}>Remove</button>
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

      {/* Closing Details */}
      <div className="fd-card">
        <div className="fd-card-header">Closing Details</div>
        <div className="fd-card-body">
          <div className="fd-form-grid-3">
            <div className="fd-field-group">
              <label className="fd-label">Closed Date</label>
              <input className="fd-input" type="date" value={closedDate} onChange={e => setClosedDate(e.target.value)} readOnly={isReadOnly} />
            </div>
            <div className="fd-field-group">
              <label className="fd-label">Effective Roi</label>
              <input className="fd-input" type="number" step="0.1" value={effectiveRoi} onChange={e => setEffectiveRoi(e.target.value)} readOnly={isReadOnly} />
            </div>
            <div className="fd-field-group">
              <label className="fd-label">Particulers</label>
              <input className="fd-input" value={particulers} onChange={e => setParticulers(e.target.value)} readOnly={isReadOnly} />
            </div>
            <div className="fd-field-group">
              <label className="fd-label">Completed Days</label>
              <input className="fd-input" value={completedDays} readOnly disabled />
            </div>
            <div className="fd-field-group">
              <label className="fd-label">Effective Net Amount</label>
              <input className="fd-input" value={effectiveNetAmount} readOnly disabled />
            </div>
            <div className="fd-field-group">
              <label className="fd-label">Earned Interest</label>
              <input className="fd-input" value={earnedInterest} readOnly disabled />
            </div>
            <div className="fd-field-group">
              <label className="fd-label">Payment Mode</label>
              <select className="fd-select" value={paymentMode} onChange={e => setPaymentMode(e.target.value)} disabled={isReadOnly}>
                <option value="">Select Mode</option>
                <option value="CASH">Cash</option>
                <option value="CHEQUE">Cheque</option>
                <option value="TRANSFER">Transfer</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* FD Ledger */}
      <div className="fd-card">
        <div className="fd-card-header">FD Ledger</div>
        <div className="fd-card-body">
          {ledgerEntries.length === 0 ? (
            <div className="fd-no-data">No Data Found</div>
          ) : (
            <div className="fd-table-responsive">
              <table className="fd-table">
                <thead>
                  <tr><th>Date</th><th>Description</th><th>Debit</th><th>Credit</th><th>Balance</th></tr>
                </thead>
                <tbody>
                  {ledgerEntries.map((entry, i) => (
                    <tr key={i}>
                      <td>{entry.date}</td><td>{entry.description}</td>
                      <td>{entry.debit}</td>
                      <td>{entry.credit}</td>
                      <td>{entry.balance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* FD Bond */}
      <div className="fd-card">
        <div className="fd-card-header">FD Bond</div>
        <div className="fd-card-body">
          {!bondFound ? (
            <div className="fd-no-data">FD Bond Not Found.</div>
          ) : (
            <div>Bond details here</div>
          )}
          <div style={{ marginTop: 12 }}>
            <button className="fd-btn fd-btn-outline" onClick={handlePrintBond}>Print Bond</button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="fd-footer">
        {!isReadOnly ? (
          <>
            <button className={`fd-btn fd-btn-primary ${saved ? "fd-btn-saved" : ""}`} onClick={handleSave} disabled={saving}>
              {saved ? "✓ Saved!" : saving ? "Saving..." : "Save"}
            </button>
            <button className="fd-btn fd-btn-secondary" onClick={handleReset}>Reset</button>
            {mode === "edit" && <button className="fd-btn fd-btn-secondary" onClick={() => setMode("view")}>View</button>}
            <button className="fd-btn fd-btn-outline" onClick={onBack}>Back</button>
          </>
        ) : (
          <>
            <button className="fd-btn fd-btn-primary" onClick={() => setMode("edit")}>Edit Account</button>
            <button className="fd-btn fd-btn-outline" onClick={onBack}>Back</button>
          </>
        )}
      </div>

      {/* Nominee Modal */}
      {showModal && <FDNomineeModal onClose={() => setShowModal(false)} onAdd={(nominee) => setNominees(prev => [...prev, nominee])} />}
    </div>
  );
}
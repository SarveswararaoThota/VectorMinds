import { useState, useEffect } from "react";
import "./DDAccountScreen.css";

/* ── Nominee Modal for DD ─────────────────────────────────────────── */
function DDNomineeModal({ onClose, onAdd }) {
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
    <div className="dd-modal-overlay" onClick={(e) => { if (e.target.classList.contains("dd-modal-overlay")) onClose(); }}>
      <div className="dd-modal-box">
        <div className="dd-modal-header">
          <h3>Add Nominee</h3>
          <button className="dd-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="dd-modal-body">
          <div className="dd-form-grid">
            <div className="dd-form-field">
              <label className="dd-label required">Name</label>
              <input className="dd-input" value={form.name} onChange={set("name")} />
            </div>
            <div className="dd-form-field">
              <label className="dd-label required">Relation</label>
              <select className="dd-select" value={form.relation} onChange={set("relation")}>
                <option value=""></option>
                {["Father", "Mother", "Spouse", "Son", "Daughter", "Brother", "Sister", "Other"].map(r =>
                  <option key={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <div className="dd-form-grid">
            <div className="dd-form-field">
              <label className="dd-label required">Percentage (%)</label>
              <input className="dd-input" type="number" min="1" max="100" value={form.percentage} onChange={set("percentage")} />
            </div>
            <div className="dd-form-field">
              <label className="dd-label">DOB</label>
              <input className="dd-input" type="date" value={form.dob} onChange={set("dob")} />
            </div>
          </div>
          <div className="dd-form-grid">
            <div className="dd-form-field">
              <label className="dd-label">Age</label>
              <input className="dd-input" value={form.age} onChange={set("age")} />
            </div>
            <div className="dd-form-field">
              <label className="dd-label">H.No</label>
              <input className="dd-input" value={form.hno} onChange={set("hno")} />
            </div>
          </div>
          <div className="dd-form-grid">
            <div className="dd-form-field">
              <label className="dd-label">Address1</label>
              <input className="dd-input" value={form.address1} onChange={set("address1")} />
            </div>
            <div className="dd-form-field">
              <label className="dd-label">Street</label>
              <input className="dd-input" value={form.street} onChange={set("street")} />
            </div>
          </div>
          <div className="dd-form-grid">
            <div className="dd-form-field">
              <label className="dd-label">City</label>
              <input className="dd-input" value={form.city} onChange={set("city")} />
            </div>
            <div className="dd-form-field">
              <label className="dd-label">District</label>
              <input className="dd-input" value={form.district} onChange={set("district")} />
            </div>
          </div>
          <div className="dd-form-grid">
            <div className="dd-form-field">
              <label className="dd-label">State</label>
              <select className="dd-select" value={form.state} onChange={set("state")}>
                <option value=""></option>
                {["Andhra Pradesh", "Telangana", "Karnataka", "Tamil Nadu", "Maharashtra",
                  "Gujarat", "Rajasthan", "Uttar Pradesh", "West Bengal", "Delhi"].map(s =>
                  <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="dd-form-field">
              <label className="dd-label">Country</label>
              <select className="dd-select" value={form.country} onChange={set("country")}>
                <option>INDIA</option><option>OTHER</option>
              </select>
            </div>
          </div>
          <div className="dd-form-grid">
            <div className="dd-form-field">
              <label className="dd-label">Pin</label>
              <input className="dd-input" value={form.pin} onChange={set("pin")} maxLength={6} />
            </div>
          </div>
        </div>
        <div className="dd-modal-footer">
          <button className="dd-btn dd-btn-primary" onClick={handleAdd}>Add Nominee</button>
          <button className="dd-btn dd-btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

/* ── Main DDAccountScreen ───────────────────────────────────────────── */
export default function DDAccountScreen({ initialMode = "create", account = null, onBack, onSave, currentUser }) {
  const [mode, setMode] = useState(initialMode);
  const isReadOnly = mode === "view";

  // Member Details
  const [custId, setCustId] = useState("");
  const [name, setName] = useState("");
  const [aadhar, setAadhar] = useState("");
  const [memberStatus, setMemberStatus] = useState("");
  const [dob, setDob] = useState("");

  // DD Account Details
  const [bondType, setBondType] = useState("");
  const [accountType, setAccountType] = useState("");
  const [depositDate, setDepositDate] = useState(new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase());

  // Agent Details
  const [agentId, setAgentId] = useState("");
  const [agentName, setAgentName] = useState("");
  const [agentCustId, setAgentCustId] = useState("");

  // Deposit Details
  const [scheme, setScheme] = useState("");
  const [installmentAmount, setInstallmentAmount] = useState("");
  const [amountInWords, setAmountInWords] = useState("");
  const [specialRoi, setSpecialRoi] = useState("");
  const [autoDebit, setAutoDebit] = useState("NO");
  const [tenure, setTenure] = useState("");
  const [days, setDays] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [maturityAmount, setMaturityAmount] = useState("");
  const [maturityDate, setMaturityDate] = useState("");

  // Payment Mode
  const [paymentMode, setPaymentMode] = useState("");

  // Nominee Details
  const [membershipNominees, setMembershipNominees] = useState([]);
  const [accountNominees, setAccountNominees] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Convert amount to words
  const convertToWords = (amount) => {
    if (!amount) return "";
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
      'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    const num = parseInt(amount);
    if (num < 20) return ones[num];
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? " " + ones[num % 10] : "");
    if (num < 1000) return ones[Math.floor(num / 100)] + " Hundred" + (num % 100 ? " " + convertToWords(num % 100) : "");
    if (num < 100000) return convertToWords(Math.floor(num / 1000)) + " Thousand" + (num % 1000 ? " " + convertToWords(num % 1000) : "");
    return convertToWords(Math.floor(num / 100000)) + " Lakh" + (num % 100000 ? " " + convertToWords(num % 100000) : "");
  };

  // Update amount in words
  useEffect(() => {
    if (installmentAmount) {
      setAmountInWords(convertToWords(installmentAmount) + " Rupees Only");
    } else {
      setAmountInWords("");
    }
  }, [installmentAmount]);

  // Calculate maturity amount
  useEffect(() => {
    if (installmentAmount && interestRate && days) {
      const principal = parseFloat(installmentAmount);
      const rate = parseFloat(interestRate) / 100;
      const timeInYears = parseInt(days) / 365;
      const maturity = principal * (1 + rate * timeInYears);
      setMaturityAmount(maturity.toFixed(2));
    }
  }, [installmentAmount, interestRate, days]);

  // Calculate maturity date
  useEffect(() => {
    if (depositDate && days) {
      const parts = depositDate.split("-");
      if (parts.length === 3) {
        let day, month, year;
        if (parts[0].length === 2 && parts[1].length === 3) {
          day = parseInt(parts[0]);
          const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
          month = monthNames.indexOf(parts[1].toUpperCase());
          year = parseInt(parts[2]);
        } else {
          year = parseInt(parts[0]);
          month = parseInt(parts[1]) - 1;
          day = parseInt(parts[2]);
        }
        const startDate = new Date(year, month, day);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + parseInt(days));
        setMaturityDate(endDate.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase());
      }
    }
  }, [depositDate, days]);

  // Set tenure when days change
  useEffect(() => {
    if (days) {
      const d = parseInt(days);
      if (d === 365) setTenure("1 Year");
      else if (d === 730) setTenure("2 Years");
      else if (d === 1095) setTenure("3 Years");
      else if (d > 0) setTenure(`${d} Days`);
      else setTenure("");
    } else {
      setTenure("");
    }
  }, [days]);

  // Fetch customer details when custId changes
  useEffect(() => {
    if (custId) {
      const customerData = {
        "01000001": { name: "RAJESH KUMAR", aadhar: "1234-5678-9012", status: "Active", dob: "1990-01-15" },
        "01000002": { name: "PRIYA REDDY", aadhar: "2345-6789-0123", status: "Active", dob: "1988-05-20" },
        "01000003": { name: "SURESH BABU", aadhar: "3456-7890-1234", status: "Active", dob: "1985-12-10" },
        "01000004": { name: "SULOCHANA", aadhar: "4567-8901-2345", status: "Active", dob: "1975-08-25" },
        "01000005": { name: "NAGARJUNA", aadhar: "5678-9012-3456", status: "Active", dob: "1980-03-18" }
      };
      const data = customerData[custId];
      if (data) {
        setName(data.name);
        setAadhar(data.aadhar);
        setMemberStatus(data.status);
        setDob(data.dob);
      }
    } else {
      setName("");
      setAadhar("");
      setMemberStatus("");
      setDob("");
    }
  }, [custId]);

  // Fetch agent details when agentId changes
  useEffect(() => {
    if (agentId) {
      const agentData = {
        "A001": { name: "Ramesh Kumar", custId: "AG001" },
        "A002": { name: "Priya Nair", custId: "AG002" },
        "A003": { name: "Suresh Reddy", custId: "AG003" }
      };
      const data = agentData[agentId];
      if (data) {
        setAgentName(data.name);
        setAgentCustId(data.custId);
      }
    } else {
      setAgentName("");
      setAgentCustId("");
    }
  }, [agentId]);

  const handleReset = () => {
    setCustId("");
    setName("");
    setAadhar("");
    setMemberStatus("");
    setDob("");
    setBondType("");
    setAccountType("");
    setDepositDate(new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase());
    setAgentId("");
    setAgentName("");
    setAgentCustId("");
    setScheme("");
    setInstallmentAmount("");
    setAmountInWords("");
    setSpecialRoi("");
    setAutoDebit("NO");
    setTenure("");
    setDays("");
    setInterestRate("");
    setMaturityAmount("");
    setMaturityDate("");
    setPaymentMode("");
    setMembershipNominees([]);
    setAccountNominees([]);
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
    setSaved(true);
    setTimeout(() => { onSave && onSave(); }, 900);
  };

  return (
    <div className="dd-root">
      {/* Top Bar */}
      <div className="dd-topbar">
        <div className="dd-topbar-left">
          <button className="dd-back-btn" onClick={onBack}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <div className="dd-page-title">Demand Draft Account</div>
        </div>
        <div className="dd-tabbar">
          <button className={`dd-tab ${mode === "create" ? "dd-tab-active" : ""}`} onClick={() => setMode("create")}>New</button>
          <button className={`dd-tab ${mode === "view" ? "dd-tab-active" : ""}`} onClick={() => setMode("view")} disabled={!account}>View</button>
          <button className={`dd-tab ${mode === "edit" ? "dd-tab-active" : ""}`} onClick={() => setMode("edit")} disabled={!account}>Edit</button>
        </div>
      </div>

      {/* Member Details */}
      <div className="dd-card">
        <div className="dd-card-header">Member Details</div>
        <div className="dd-card-body">
          <div className="dd-form-grid-2">
            <div className="dd-field-group">
              <label className="dd-label required">Cust Id</label>
              <select className="dd-select" value={custId} onChange={e => setCustId(e.target.value)} disabled={isReadOnly}>
                <option value="">Select Cust ID</option>
                <option value="01000001">01000001 - RAJESH KUMAR</option>
                <option value="01000002">01000002 - PRIYA REDDY</option>
                <option value="01000003">01000003 - SURESH BABU</option>
                <option value="01000004">01000004 - SULOCHANA</option>
                <option value="01000005">01000005 - NAGARJUNA</option>
              </select>
            </div>
            <div className="dd-field-group">
              <label className="dd-label">Name</label>
              <input className="dd-input" value={name} readOnly />
            </div>
            <div className="dd-field-group">
              <label className="dd-label">Aadhar</label>
              <input className="dd-input" value={aadhar} readOnly />
            </div>
            <div className="dd-field-group">
              <label className="dd-label">Status</label>
              <input className="dd-input" value={memberStatus} readOnly />
            </div>
            <div className="dd-field-group">
              <label className="dd-label">Dob</label>
              <input className="dd-input" type="date" value={dob} readOnly />
            </div>
          </div>
        </div>
      </div>

      {/* DD Account Details */}
      <div className="dd-card">
        <div className="dd-card-header">DD Account Details</div>
        <div className="dd-card-body">
          <div className="dd-form-grid-3">
            <div className="dd-field-group">
              <label className="dd-label">Bond Type</label>
              <select className="dd-select" value={bondType} onChange={e => setBondType(e.target.value)} disabled={isReadOnly}>
                <option value="">-- SELECT --</option>
                <option value="CERTIFICATE">Certificate</option>
                <option value="DEMATERIALIZED">Dematerialized</option>
              </select>
            </div>
            <div className="dd-field-group">
              <label className="dd-label">Account Type</label>
              <select className="dd-select" value={accountType} onChange={e => setAccountType(e.target.value)} disabled={isReadOnly}>
                <option value="">-- SELECT --</option>
                <option value="SINGLE">Single</option>
                <option value="JOINT">Joint</option>
              </select>
            </div>
            <div className="dd-field-group">
              <label className="dd-label">Deposit Date</label>
              <input className="dd-input" value={depositDate} onChange={e => setDepositDate(e.target.value)} readOnly={isReadOnly} />
            </div>
          </div>
        </div>
      </div>

      {/* Agent Details */}
      <div className="dd-card">
        <div className="dd-card-header">Agent Details</div>
        <div className="dd-card-body">
          <div className="dd-form-grid-3">
            <div className="dd-field-group">
              <label className="dd-label">Agent Id</label>
              <select className="dd-select" value={agentId} onChange={e => setAgentId(e.target.value)} disabled={isReadOnly}>
                <option value="">Select Agent</option>
                <option value="A001">A001 - Ramesh Kumar</option>
                <option value="A002">A002 - Priya Nair</option>
                <option value="A003">A003 - Suresh Reddy</option>
              </select>
            </div>
            <div className="dd-field-group">
              <label className="dd-label">Agent Name</label>
              <input className="dd-input" value={agentName} readOnly />
            </div>
            <div className="dd-field-group">
              <label className="dd-label">Agent Cust Id</label>
              <input className="dd-input" value={agentCustId} readOnly />
            </div>
          </div>
        </div>
      </div>

      {/* Deposit Details */}
      <div className="dd-card">
        <div className="dd-card-header">Deposit Details</div>
        <div className="dd-card-body">
          <div className="dd-form-grid-3">
            <div className="dd-field-group">
              <label className="dd-label required">Scheme</label>
              <select className="dd-select" value={scheme} onChange={e => setScheme(e.target.value)} disabled={isReadOnly}>
                <option value="">Select Scheme</option>
                <option value="DD_STANDARD">DD Standard</option>
                <option value="DD_PREMIUM">DD Premium</option>
                <option value="DD_CORPORATE">DD Corporate</option>
              </select>
            </div>
            <div className="dd-field-group">
              <label className="dd-label required">Installment Amount</label>
              <input className="dd-input" type="number" value={installmentAmount} onChange={e => setInstallmentAmount(e.target.value)} readOnly={isReadOnly} />
            </div>
            <div className="dd-field-group">
              <label className="dd-label">Amount In Words</label>
              <textarea className="dd-textarea" value={amountInWords} readOnly rows={2} />
            </div>
            <div className="dd-field-group">
              <label className="dd-label">Special ROI</label>
              <input className="dd-input" type="number" step="0.1" value={specialRoi} onChange={e => setSpecialRoi(e.target.value)} readOnly={isReadOnly} />
            </div>
            <div className="dd-field-group">
              <label className="dd-label">Auto Debit</label>
              <select className="dd-select" value={autoDebit} onChange={e => setAutoDebit(e.target.value)} disabled={isReadOnly}>
                <option value="YES">YES</option>
                <option value="NO">NO</option>
              </select>
            </div>
            <div className="dd-field-group">
              <label className="dd-label">Tenure</label>
              <input className="dd-input" value={tenure} readOnly />
            </div>
            <div className="dd-field-group">
              <label className="dd-label">Days</label>
              <input className="dd-input" type="number" value={days} onChange={e => setDays(e.target.value)} readOnly={isReadOnly} />
            </div>
            <div className="dd-field-group">
              <label className="dd-label required">Interest Rate</label>
              <input className="dd-input" type="number" step="0.1" value={interestRate} onChange={e => setInterestRate(e.target.value)} readOnly={isReadOnly} />
            </div>
            <div className="dd-field-group">
              <label className="dd-label">Maturity Amount</label>
              <input className="dd-input" value={maturityAmount} readOnly disabled />
            </div>
            <div className="dd-field-group">
              <label className="dd-label">Maturity Date</label>
              <input className="dd-input" value={maturityDate} readOnly disabled />
            </div>
          </div>
        </div>
      </div>

      {/* Payment Mode */}
      <div className="dd-card">
        <div className="dd-card-header">Payment Mode</div>
        <div className="dd-card-body">
          <div className="dd-form-grid-2">
            <div className="dd-field-group">
              <label className="dd-label">Payment Mode</label>
              <select className="dd-select" value={paymentMode} onChange={e => setPaymentMode(e.target.value)} disabled={isReadOnly}>
                <option value="">-- SELECT --</option>
                <option value="CASH">Cash</option>
                <option value="CHEQUE">Cheque</option>
                <option value="TRANSFER">Transfer</option>
                <option value="SB_ACCOUNT">SB Account</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Nominee Details */}
      <div className="dd-card">
        <div className="dd-card-header">Nominee Details List From Membership</div>
        <div className="dd-card-body">
          {membershipNominees.length === 0 ? (
            <div className="dd-no-data">No nominee records found from membership.</div>
          ) : (
            <div className="dd-table-responsive">
              <table className="dd-table">
                <thead>
                  <tr>
                    <th>Add</th><th>Name</th><th>Relation</th><th>Percentage</th>
                    <th>DOB</th><th>Age</th><th>Address</th><th>City</th>
                  </tr>
                </thead>
                <tbody>
                  {membershipNominees.map((n, i) => (
                    <tr key={i}>
                      <td><button className="dd-add-btn" onClick={() => setAccountNominees(prev => [...prev, n])}>Add</button></td>
                      <td>{n.name}</td>
                      <td>{n.relation}</td>
                      <td>{n.percentage}%</td>
                      <td>{n.dob}</td>
                      <td>{n.age}</td>
                      <td>{n.address1}</td>
                      <td>{n.city}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="dd-card">
        <div className="dd-card-header">Nominee Details For This Account</div>
        <div className="dd-card-body">
          {!isReadOnly && (
            <div style={{ marginBottom: 16 }}>
              <button className="dd-btn dd-btn-primary" onClick={() => setShowModal(true)}>+ Add Nominee</button>
            </div>
          )}
          {accountNominees.length === 0 ? (
            <div className="dd-no-data">No nominees added for this account yet.</div>
          ) : (
            <div className="dd-table-responsive">
              <table className="dd-table">
                <thead>
                  <tr>
                    <th>#</th><th>Name</th><th>Relation</th><th>Percentage</th>
                    <th>DOB</th><th>Age</th><th>Address</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {accountNominees.map((n, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td>{n.name}</td>
                      <td>{n.relation}</td>
                      <td>{n.percentage}%</td>
                      <td>{n.dob}</td>
                      <td>{n.age}</td>
                      <td>{n.address1}</td>
                      <td>
                        <button className="dd-remove-btn" onClick={() => setAccountNominees(prev => prev.filter((_, idx) => idx !== i))}>Remove</button>
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
      <div className="dd-footer">
        {!isReadOnly ? (
          <>
            <button className={`dd-btn dd-btn-primary ${saved ? "dd-btn-saved" : ""}`} onClick={handleSave} disabled={saving}>
              {saved ? "✓ Saved!" : saving ? "Saving..." : "Save"}
            </button>
            <button className="dd-btn dd-btn-secondary" onClick={handleReset}>Reset</button>
            {mode === "edit" && <button className="dd-btn dd-btn-secondary" onClick={() => setMode("view")}>View</button>}
            <button className="dd-btn dd-btn-outline" onClick={onBack}>Task List</button>
          </>
        ) : (
          <>
            <button className="dd-btn dd-btn-primary" onClick={() => setMode("edit")}>Edit Account</button>
            <button className="dd-btn dd-btn-outline" onClick={onBack}>Back</button>
          </>
        )}
      </div>

      {/* Nominee Modal */}
      {showModal && <DDNomineeModal onClose={() => setShowModal(false)} onAdd={(nominee) => setAccountNominees(prev => [...prev, nominee])} />}
    </div>
  );
}
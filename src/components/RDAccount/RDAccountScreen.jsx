import { useState, useEffect } from "react";
import "./RDAccountScreen.css";

/* ── Nominee Modal for RD ─────────────────────────────────────────── */
function RDNomineeModal({ onClose, onAdd }) {
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
    <div className="rd-modal-overlay" onClick={(e) => { if (e.target.classList.contains("rd-modal-overlay")) onClose(); }}>
      <div className="rd-modal-box">
        <div className="rd-modal-header">
          <h3>Add Nominee</h3>
          <button className="rd-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="rd-modal-body">
          <div className="rd-form-grid">
            <div className="rd-form-field">
              <label className="rd-label required">Name</label>
              <input className="rd-input" value={form.name} onChange={set("name")} />
            </div>
            <div className="rd-form-field">
              <label className="rd-label required">Relation</label>
              <select className="rd-select" value={form.relation} onChange={set("relation")}>
                <option value=""></option>
                {["Father", "Mother", "Spouse", "Son", "Daughter", "Brother", "Sister", "Other"].map(r =>
                  <option key={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <div className="rd-form-grid">
            <div className="rd-form-field">
              <label className="rd-label required">Percentage (%)</label>
              <input className="rd-input" type="number" min="1" max="100" value={form.percentage} onChange={set("percentage")} />
            </div>
            <div className="rd-form-field">
              <label className="rd-label">DOB</label>
              <input className="rd-input" type="date" value={form.dob} onChange={set("dob")} />
            </div>
          </div>
          <div className="rd-form-grid">
            <div className="rd-form-field">
              <label className="rd-label">Age</label>
              <input className="rd-input" value={form.age} onChange={set("age")} />
            </div>
            <div className="rd-form-field">
              <label className="rd-label">H.No</label>
              <input className="rd-input" value={form.hno} onChange={set("hno")} />
            </div>
          </div>
          <div className="rd-form-grid">
            <div className="rd-form-field">
              <label className="rd-label">Address1</label>
              <input className="rd-input" value={form.address1} onChange={set("address1")} />
            </div>
            <div className="rd-form-field">
              <label className="rd-label">Street</label>
              <input className="rd-input" value={form.street} onChange={set("street")} />
            </div>
          </div>
          <div className="rd-form-grid">
            <div className="rd-form-field">
              <label className="rd-label">City</label>
              <input className="rd-input" value={form.city} onChange={set("city")} />
            </div>
            <div className="rd-form-field">
              <label className="rd-label">District</label>
              <input className="rd-input" value={form.district} onChange={set("district")} />
            </div>
          </div>
          <div className="rd-form-grid">
            <div className="rd-form-field">
              <label className="rd-label">State</label>
              <select className="rd-select" value={form.state} onChange={set("state")}>
                <option value=""></option>
                {["Andhra Pradesh", "Telangana", "Karnataka", "Tamil Nadu", "Maharashtra",
                  "Gujarat", "Rajasthan", "Uttar Pradesh", "West Bengal", "Delhi"].map(s =>
                  <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="rd-form-field">
              <label className="rd-label">Country</label>
              <select className="rd-select" value={form.country} onChange={set("country")}>
                <option>INDIA</option><option>OTHER</option>
              </select>
            </div>
          </div>
          <div className="rd-form-grid">
            <div className="rd-form-field">
              <label className="rd-label">Pin</label>
              <input className="rd-input" value={form.pin} onChange={set("pin")} maxLength={6} />
            </div>
          </div>
        </div>
        <div className="rd-modal-footer">
          <button className="rd-btn rd-btn-primary" onClick={handleAdd}>Add Nominee</button>
          <button className="rd-btn rd-btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

/* ── Main RDAccountScreen ───────────────────────────────────────────── */
export default function RDAccountScreen({ initialMode = "create", account = null, onBack, onSave, currentUser }) {
  const [mode, setMode] = useState(initialMode);
  const isReadOnly = mode === "view";

  // Member Details
  const [taskId, setTaskId] = useState("");
  const [custId, setCustId] = useState("");
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [surname, setSurname] = useState("");
  const [aadhar, setAadhar] = useState("");
  const [phone, setPhone] = useState("");
  const [admission, setAdmission] = useState("");
  const [memberStatus, setMemberStatus] = useState("");
  const [closeDate, setCloseDate] = useState("");
  const [branch, setBranch] = useState("");
  const [dob, setDob] = useState("");
  const [nomineeName, setNomineeName] = useState("");
  const [nomineeRelation, setNomineeRelation] = useState("");

  // RD Account Details
  const [bondType, setBondType] = useState("");
  const [accountType, setAccountType] = useState("");
  const [depositDate, setDepositDate] = useState(new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase());

  // Deposit Details
  const [scheme, setScheme] = useState("");
  const [installmentAmount, setInstallmentAmount] = useState("");
  const [amountInWords, setAmountInWords] = useState("");
  const [specialRoi, setSpecialRoi] = useState("0");
  const [autoDebit, setAutoDebit] = useState("NO");
  const [tenure, setTenure] = useState("");
  const [years, setYears] = useState("");
  const [months, setMonths] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [maturityAmount, setMaturityAmount] = useState("");
  const [maturityDate, setMaturityDate] = useState("");

  // Agent Details
  const [agentId, setAgentId] = useState("");
  const [agentName, setAgentName] = useState("");
  const [agentCustId, setAgentCustId] = useState("");

  // Payment Mode
  const [paymentMode, setPaymentMode] = useState("");
  const [sbAcno, setSbAcno] = useState("");
  const [particulers, setParticulers] = useState("");
  const [currentBalance, setCurrentBalance] = useState("");

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
    if (installmentAmount && interestRate && months) {
      const P = parseFloat(installmentAmount);
      const r = parseFloat(interestRate) / (12 * 100);
      const n = parseInt(months);
      const maturity = P * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
      setMaturityAmount(maturity.toFixed(2));
    }
  }, [installmentAmount, interestRate, months]);

  // Calculate maturity date
  useEffect(() => {
    if (depositDate && months) {
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
        endDate.setMonth(startDate.getMonth() + parseInt(months));
        setMaturityDate(endDate.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase());
      }
    }
  }, [depositDate, months]);

  // Auto-fill tenure
  useEffect(() => {
    if (years || months) {
      const y = parseInt(years) || 0;
      const m = parseInt(months) || 0;
      if (y > 0 && m > 0) {
        setTenure(`${y} Year${y > 1 ? 's' : ''} ${m} Month${m > 1 ? 's' : ''}`);
      } else if (y > 0) {
        setTenure(`${y} Year${y > 1 ? 's' : ''}`);
      } else if (m > 0) {
        setTenure(`${m} Month${m > 1 ? 's' : ''}`);
      } else {
        setTenure("");
      }
    }
  }, [years, months]);

  // Fetch customer details
  useEffect(() => {
    if (custId) {
      const customerData = {
        "01000001": { name: "RAJESH KUMAR", lastName: "KUMAR", surname: "RAJESH", aadhar: "1234-5678-9012", phone: "9876543210", admission: "2020-01-01", branch: "Main Branch", status: "Active", dob: "1990-01-15" },
        "01000002": { name: "PRIYA REDDY", lastName: "REDDY", surname: "PRIYA", aadhar: "2345-6789-0123", phone: "9876543211", admission: "2020-02-01", branch: "City Branch", status: "Active", dob: "1988-05-20" },
        "01000003": { name: "SURESH BABU", lastName: "BABU", surname: "SURESH", aadhar: "3456-7890-1234", phone: "9876543212", admission: "2020-03-01", branch: "Town Branch", status: "Active", dob: "1985-12-10" }
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
        setDob(data.dob);
      }
    }
  }, [custId]);

  // Fetch agent details
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
    }
  }, [agentId]);

  const handleReset = () => {
    setTaskId("");
    setCustId("");
    setName("");
    setLastName("");
    setSurname("");
    setAadhar("");
    setPhone("");
    setAdmission("");
    setMemberStatus("");
    setCloseDate("");
    setBranch("");
    setDob("");
    setNomineeName("");
    setNomineeRelation("");
    setBondType("");
    setAccountType("");
    setDepositDate(new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase());
    setScheme("");
    setInstallmentAmount("");
    setAmountInWords("");
    setSpecialRoi("0");
    setAutoDebit("NO");
    setTenure("");
    setYears("");
    setMonths("");
    setInterestRate("");
    setMaturityAmount("");
    setMaturityDate("");
    setAgentId("");
    setAgentName("");
    setAgentCustId("");
    setPaymentMode("");
    setSbAcno("");
    setParticulers("");
    setCurrentBalance("");
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
    <div className="rd-root">
      {/* Top Bar */}
      <div className="rd-topbar">
        <div className="rd-topbar-left">
          <button className="rd-back-btn" onClick={onBack}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <div className="rd-page-title">NEW RD</div>
        </div>
        <div className="rd-tabbar">
          <button className={`rd-tab ${mode === "create" ? "rd-tab-active" : ""}`} onClick={() => setMode("create")}>New</button>
          <button className={`rd-tab ${mode === "view" ? "rd-tab-active" : ""}`} onClick={() => setMode("view")} disabled={!account}>View</button>
          <button className={`rd-tab ${mode === "edit" ? "rd-tab-active" : ""}`} onClick={() => setMode("edit")} disabled={!account}>Edit</button>
        </div>
      </div>

      {/* Member Details */}
      <div className="rd-card">
        <div className="rd-card-header">Member Details</div>
        <div className="rd-card-body">
          <div className="rd-form-grid-4">
            <div className="rd-field-group">
              <label className="rd-label">Task Id</label>
              <input className="rd-input" value={taskId} onChange={e => setTaskId(e.target.value)} readOnly={isReadOnly} placeholder="Auto generated" />
            </div>
            <div className="rd-field-group">
              <label className="rd-label required">Cust Id</label>
              <select className="rd-select" value={custId} onChange={e => setCustId(e.target.value)} disabled={isReadOnly}>
                <option value="">Select Cust ID</option>
                <option value="01000001">01000001 - RAJESH KUMAR</option>
                <option value="01000002">01000002 - PRIYA REDDY</option>
                <option value="01000003">01000003 - SURESH BABU</option>
              </select>
            </div>
            <div className="rd-field-group">
              <label className="rd-label">Name</label>
              <input className="rd-input" value={name} readOnly />
            </div>
            <div className="rd-field-group">
              <label className="rd-label">Last Name</label>
              <input className="rd-input" value={lastName} readOnly />
            </div>
            <div className="rd-field-group">
              <label className="rd-label">Surname</label>
              <input className="rd-input" value={surname} readOnly />
            </div>
            <div className="rd-field-group">
              <label className="rd-label">Aadhar</label>
              <input className="rd-input" value={aadhar} readOnly />
            </div>
            <div className="rd-field-group">
              <label className="rd-label">Phone</label>
              <input className="rd-input" value={phone} readOnly />
            </div>
            <div className="rd-field-group">
              <label className="rd-label">Admission</label>
              <input className="rd-input" type="date" value={admission} readOnly />
            </div>
            <div className="rd-field-group">
              <label className="rd-label">Status</label>
              <input className="rd-input" value={memberStatus} readOnly />
            </div>
            <div className="rd-field-group">
              <label className="rd-label">Close Date</label>
              <input className="rd-input" type="date" value={closeDate} onChange={e => setCloseDate(e.target.value)} readOnly={isReadOnly} />
            </div>
            <div className="rd-field-group">
              <label className="rd-label">Branch</label>
              <input className="rd-input" value={branch} readOnly />
            </div>
            <div className="rd-field-group">
              <label className="rd-label">DOB</label>
              <input className="rd-input" type="date" value={dob} readOnly />
            </div>
            <div className="rd-field-group">
              <label className="rd-label">Nominee Name</label>
              <input className="rd-input" value={nomineeName} onChange={e => setNomineeName(e.target.value)} readOnly={isReadOnly} />
            </div>
            <div className="rd-field-group">
              <label className="rd-label">Nominee Relation</label>
              <input className="rd-input" value={nomineeRelation} onChange={e => setNomineeRelation(e.target.value)} readOnly={isReadOnly} />
            </div>
          </div>
        </div>
      </div>

      {/* RD Account Details */}
      <div className="rd-card">
        <div className="rd-card-header">RD Account Details</div>
        <div className="rd-card-body">
          <div className="rd-form-grid-3">
            <div className="rd-field-group">
              <label className="rd-label">Bond Type</label>
              <select className="rd-select" value={bondType} onChange={e => setBondType(e.target.value)} disabled={isReadOnly}>
                <option value="">-- SELECT --</option>
                <option value="CERTIFICATE">Certificate</option>
                <option value="DEMATERIALIZED">Dematerialized</option>
              </select>
            </div>
            <div className="rd-field-group">
              <label className="rd-label">Account Type</label>
              <select className="rd-select" value={accountType} onChange={e => setAccountType(e.target.value)} disabled={isReadOnly}>
                <option value="">-- SELECT --</option>
                <option value="SINGLE">Single</option>
                <option value="JOINT">Joint</option>
              </select>
            </div>
            <div className="rd-field-group">
              <label className="rd-label">Deposit Date</label>
              <input className="rd-input" value={depositDate} onChange={e => setDepositDate(e.target.value)} readOnly={isReadOnly} />
            </div>
          </div>
        </div>
      </div>

      {/* Deposit Details */}
      <div className="rd-card">
        <div className="rd-card-header">Deposit Details</div>
        <div className="rd-card-body">
          <div className="rd-form-grid-3">
            <div className="rd-field-group">
              <label className="rd-label required">Scheme</label>
              <select className="rd-select" value={scheme} onChange={e => setScheme(e.target.value)} disabled={isReadOnly}>
                <option value="">Select Scheme</option>
                <option value="RD_STANDARD">RD Standard</option>
                <option value="RD_PREMIUM">RD Premium</option>
                <option value="RD_SENIOR">RD Senior Citizen</option>
              </select>
            </div>
            <div className="rd-field-group">
              <label className="rd-label required">Installment Amount</label>
              <input className="rd-input" type="number" value={installmentAmount} onChange={e => setInstallmentAmount(e.target.value)} readOnly={isReadOnly} />
            </div>
            <div className="rd-field-group">
              <label className="rd-label">Amount In Words</label>
              <textarea className="rd-textarea" value={amountInWords} readOnly rows={2} />
            </div>
            <div className="rd-field-group">
              <label className="rd-label">Special ROI</label>
              <input className="rd-input" type="number" value={specialRoi} onChange={e => setSpecialRoi(e.target.value)} readOnly={isReadOnly} />
            </div>
            <div className="rd-field-group">
              <label className="rd-label">Auto Debit</label>
              <select className="rd-select" value={autoDebit} onChange={e => setAutoDebit(e.target.value)} disabled={isReadOnly}>
                <option value="YES">YES</option>
                <option value="NO">NO</option>
              </select>
            </div>
            <div className="rd-field-group">
              <label className="rd-label">Tenure</label>
              <input className="rd-input" value={tenure} readOnly />
            </div>
            <div className="rd-field-group">
              <label className="rd-label">Years</label>
              <input className="rd-input" type="number" value={years} onChange={e => setYears(e.target.value)} readOnly={isReadOnly} />
            </div>
            <div className="rd-field-group">
              <label className="rd-label">Months</label>
              <input className="rd-input" type="number" value={months} onChange={e => setMonths(e.target.value)} readOnly={isReadOnly} />
            </div>
            <div className="rd-field-group">
              <label className="rd-label required">Interest Rate</label>
              <input className="rd-input" type="number" step="0.1" value={interestRate} onChange={e => setInterestRate(e.target.value)} readOnly={isReadOnly} />
            </div>
            <div className="rd-field-group">
              <label className="rd-label">Maturity Amount</label>
              <input className="rd-input" value={maturityAmount} readOnly disabled />
            </div>
            <div className="rd-field-group">
              <label className="rd-label">Maturity Date</label>
              <input className="rd-input" value={maturityDate} readOnly disabled />
            </div>
          </div>
        </div>
      </div>

      {/* Agent Details */}
      <div className="rd-card">
        <div className="rd-card-header">Agent Details</div>
        <div className="rd-card-body">
          <div className="rd-form-grid-3">
            <div className="rd-field-group">
              <label className="rd-label">Agent Id</label>
              <select className="rd-select" value={agentId} onChange={e => setAgentId(e.target.value)} disabled={isReadOnly}>
                <option value="">Select Agent</option>
                <option value="A001">A001 - Ramesh Kumar</option>
                <option value="A002">A002 - Priya Nair</option>
                <option value="A003">A003 - Suresh Reddy</option>
              </select>
            </div>
            <div className="rd-field-group">
              <label className="rd-label">Agent Name</label>
              <input className="rd-input" value={agentName} readOnly />
            </div>
            <div className="rd-field-group">
              <label className="rd-label">Agent Cust Id</label>
              <input className="rd-input" value={agentCustId} readOnly />
            </div>
          </div>
        </div>
      </div>

      {/* Payment Mode */}
      <div className="rd-card">
        <div className="rd-card-header">Payment Mode</div>
        <div className="rd-card-body">
          <div className="rd-form-grid-3">
            <div className="rd-field-group">
              <label className="rd-label">Payment Mode</label>
              <select className="rd-select" value={paymentMode} onChange={e => setPaymentMode(e.target.value)} disabled={isReadOnly}>
                <option value="">-- SELECT --</option>
                <option value="CASH">Cash</option>
                <option value="CHEQUE">Cheque</option>
                <option value="TRANSFER">Transfer</option>
                <option value="SB_ACCOUNT">SB Account</option>
              </select>
            </div>
            <div className="rd-field-group">
              <label className="rd-label">SB A/c No</label>
              <input className="rd-input" value={sbAcno} onChange={e => setSbAcno(e.target.value)} readOnly={isReadOnly} />
            </div>
            <div className="rd-field-group">
              <label className="rd-label">Particulers</label>
              <input className="rd-input" value={particulers} onChange={e => setParticulers(e.target.value)} readOnly={isReadOnly} />
            </div>
            <div className="rd-field-group">
              <label className="rd-label">Current Balance</label>
              <input className="rd-input" value={currentBalance} readOnly disabled />
            </div>
          </div>
        </div>
      </div>

      {/* Nominee Details */}
      <div className="rd-card">
        <div className="rd-card-header">Nominee Details List From Membership</div>
        <div className="rd-card-body">
          {membershipNominees.length === 0 ? (
            <div className="rd-no-data">No nominee records found from membership.</div>
          ) : (
            <div className="rd-table-responsive">
              <table className="rd-table">
                <thead>
                  <tr>
                    <th>Add</th><th>Name</th><th>Relation</th><th>Percentage</th>
                    <th>DOB</th><th>Age</th><th>Address</th><th>City</th>
                  </tr>
                </thead>
                <tbody>
                  {membershipNominees.map((n, i) => (
                    <tr key={i}>
                      <td><button className="rd-add-btn" onClick={() => setAccountNominees(prev => [...prev, n])}>Add</button></td>
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

      <div className="rd-card">
        <div className="rd-card-header">Nominee Details For This Account</div>
        <div className="rd-card-body">
          {!isReadOnly && (
            <div style={{ marginBottom: 16 }}>
              <button className="rd-btn rd-btn-primary" onClick={() => setShowModal(true)}>+ Add Nominee</button>
            </div>
          )}
          {accountNominees.length === 0 ? (
            <div className="rd-no-data">No nominees added for this account yet.</div>
          ) : (
            <div className="rd-table-responsive">
              <table className="rd-table">
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
                        <button className="rd-remove-btn" onClick={() => setAccountNominees(prev => prev.filter((_, idx) => idx !== i))}>Remove</button>
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
      <div className="rd-footer">
        {!isReadOnly ? (
          <>
            <button className={`rd-btn rd-btn-primary ${saved ? "rd-btn-saved" : ""}`} onClick={handleSave} disabled={saving}>
              {saved ? "✓ Saved!" : saving ? "Saving..." : "Save"}
            </button>
            <button className="rd-btn rd-btn-secondary" onClick={handleReset}>Reset</button>
            {mode === "edit" && <button className="rd-btn rd-btn-secondary" onClick={() => setMode("view")}>View</button>}
            <button className="rd-btn rd-btn-outline" onClick={onBack}>Task List</button>
          </>
        ) : (
          <>
            <button className="rd-btn rd-btn-primary" onClick={() => setMode("edit")}>Edit Account</button>
            <button className="rd-btn rd-btn-outline" onClick={onBack}>Back</button>
          </>
        )}
      </div>

      {/* Nominee Modal */}
      {showModal && <RDNomineeModal onClose={() => setShowModal(false)} onAdd={(nominee) => setAccountNominees(prev => [...prev, nominee])} />}
    </div>
  );
}
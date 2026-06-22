import { useState, useEffect } from "react";
import "./SDAccountScreen.css";

/* ── Nominee Modal for SD ─────────────────────────────────────────── */
function SDNomineeModal({ onClose, onAdd }) {
  const [form, setForm] = useState({
    name: "",
    relation: "",
    age: "",
    percentage: "",
    dob: "",
    hno: "",
    street: "",
    city: "",
    state: "",
    country: "INDIA",
    pin: ""
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
    <div className="sd-modal-overlay" onClick={(e) => { if (e.target.classList.contains("sd-modal-overlay")) onClose(); }}>
      <div className="sd-modal-box">
        <div className="sd-modal-header">
          <h3>Add Nominee</h3>
          <button className="sd-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="sd-modal-body">
          <div className="sd-form-grid">
            <div className="sd-form-field">
              <label className="sd-label required">Nominee Name</label>
              <input className="sd-input" value={form.name} onChange={set("name")} />
            </div>
            <div className="sd-form-field">
              <label className="sd-label required">Percentage (%)</label>
              <input className="sd-input" type="number" min="1" max="100" value={form.percentage} onChange={set("percentage")} />
            </div>
          </div>
          <div className="sd-form-grid">
            <div className="sd-form-field">
              <label className="sd-label required">Relation</label>
              <select className="sd-select" value={form.relation} onChange={set("relation")}>
                <option value=""></option>
                {["Father", "Mother", "Spouse", "Son", "Daughter", "Brother", "Sister", "Other"].map(r =>
                  <option key={r}>{r}</option>)}
              </select>
            </div>
            <div className="sd-form-field">
              <label className="sd-label">Nominee Age</label>
              <input className="sd-input" value={form.age} onChange={set("age")} />
            </div>
          </div>
          <div className="sd-form-grid">
            <div className="sd-form-field">
              <label className="sd-label">Date Of Birth</label>
              <input className="sd-input" type="date" value={form.dob} onChange={set("dob")} />
            </div>
            <div className="sd-form-field">
              <label className="sd-label">H-No</label>
              <input className="sd-input" value={form.hno} onChange={set("hno")} />
            </div>
          </div>
          <div className="sd-form-grid">
            <div className="sd-form-field">
              <label className="sd-label">Street</label>
              <input className="sd-input" value={form.street} onChange={set("street")} />
            </div>
            <div className="sd-form-field">
              <label className="sd-label">City</label>
              <input className="sd-input" value={form.city} onChange={set("city")} />
            </div>
          </div>
          <div className="sd-form-grid">
            <div className="sd-form-field">
              <label className="sd-label">State</label>
              <select className="sd-select" value={form.state} onChange={set("state")}>
                <option value=""></option>
                {["Andhra Pradesh", "Telangana", "Karnataka", "Tamil Nadu", "Maharashtra",
                  "Gujarat", "Rajasthan", "Uttar Pradesh", "West Bengal", "Delhi"].map(s =>
                  <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="sd-form-field">
              <label className="sd-label">Country</label>
              <select className="sd-select" value={form.country} onChange={set("country")}>
                <option>INDIA</option><option>OTHER</option>
              </select>
            </div>
          </div>
          <div className="sd-form-grid">
            <div className="sd-form-field">
              <label className="sd-label">Pin</label>
              <input className="sd-input" value={form.pin} onChange={set("pin")} maxLength={6} />
            </div>
          </div>
        </div>
        <div className="sd-modal-footer">
          <button className="sd-btn sd-btn-primary" onClick={handleAdd}>Add Nominee</button>
          <button className="sd-btn sd-btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

/* ── Main SDAccountScreen ───────────────────────────────────────────── */
export default function SDAccountScreen({ initialMode = "create", account = null, onBack, onSave, currentUser }) {
  const [mode, setMode] = useState(initialMode);
  const isReadOnly = mode === "view";

  // Basic Info
  const [sysId, setSysId] = useState("ID-002770");
  const [nomineeTotal, setNomineeTotal] = useState(0);

  // Selection Change
  const [selectedId, setSelectedId] = useState("");
  const [taskId, setTaskId] = useState("");

  // Member Details
  const [custId, setCustId] = useState("");
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [surname, setSurname] = useState("");
  const [aadhar, setAadhar] = useState("");
  const [phone, setPhone] = useState("");
  const [admission, setAdmission] = useState("");
  const [memberStatus, setMemberStatus] = useState("");
  const [branch, setBranch] = useState("");
  const [dob, setDob] = useState("");
  const [nomineeName, setNomineeName] = useState("");
  const [nomineeRelation, setNomineeRelation] = useState("");

  // SD Account Details
  const [scheme, setScheme] = useState("");
  const [bondType, setBondType] = useState("");
  const [accountType, setAccountType] = useState("");
  const [depositType, setDepositType] = useState("CUML");
  const [effectiveDate, setEffectiveDate] = useState("");
  const [createdDate, setCreatedDate] = useState(new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase());
  const [depositAmount, setDepositAmount] = useState("");
  const [amountInWords, setAmountInWords] = useState("");
  const [specialRoi, setSpecialRoi] = useState("");
  const [autoRenew, setAutoRenew] = useState("NO");
  const [tenureYears, setTenureYears] = useState("");
  const [tenureMonths, setTenureMonths] = useState("");
  const [tenureDays, setTenureDays] = useState("");
  const [locking, setLocking] = useState("");
  const [roi, setRoi] = useState("");
  const [maturityDate, setMaturityDate] = useState("");
  const [maturityAmount, setMaturityAmount] = useState("");

  // SD Bonds
  const [noOfBonds, setNoOfBonds] = useState("");
  const [bondDistribution, setBondDistribution] = useState([]);

  // Nominee Details List
  const [nominees, setNominees] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // Agent Details
  const [agentId, setAgentId] = useState("");
  const [agentName, setAgentName] = useState("");

  // Payment Mode
  const [paymentMode, setPaymentMode] = useState("");

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
    if (depositAmount) {
      setAmountInWords(convertToWords(depositAmount) + " Rupees Only");
    } else {
      setAmountInWords("");
    }
  }, [depositAmount]);

  // Calculate maturity amount
  const calculateMaturity = () => {
    if (depositAmount && roi && (tenureYears || tenureMonths || tenureDays)) {
      const principal = parseFloat(depositAmount);
      const rate = parseFloat(roi) / 100;
      let totalDays = (parseInt(tenureYears) || 0) * 365;
      totalDays += (parseInt(tenureMonths) || 0) * 30;
      totalDays += parseInt(tenureDays) || 0;
      const timeInYears = totalDays / 365;
      const maturity = principal * (1 + rate * timeInYears);
      setMaturityAmount(maturity.toFixed(2));
    }
  };

  // Calculate maturity date
  const calculateMaturityDate = () => {
    if (effectiveDate && (tenureYears || tenureMonths || tenureDays)) {
      const startDate = new Date(effectiveDate);
      let totalMonths = (parseInt(tenureYears) || 0) * 12;
      totalMonths += parseInt(tenureMonths) || 0;
      const endDate = new Date(startDate);
      endDate.setMonth(startDate.getMonth() + totalMonths);
      endDate.setDate(endDate.getDate() + (parseInt(tenureDays) || 0));
      setMaturityDate(endDate.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase());
    }
  };

  // Handle calculate button click
  const handleCalculate = () => {
    calculateMaturity();
    calculateMaturityDate();
  };

  // Auto-calculate when values change
  useEffect(() => {
    if (depositAmount && roi && (tenureYears || tenureMonths || tenureDays)) {
      calculateMaturity();
      calculateMaturityDate();
    }
  }, [depositAmount, roi, tenureYears, tenureMonths, tenureDays, effectiveDate]);

  // Calculate bond distribution
  useEffect(() => {
    if (depositAmount && noOfBonds && noOfBonds > 0) {
      const amountPerBond = parseFloat(depositAmount) / parseInt(noOfBonds);
      const bonds = [];
      for (let i = 1; i <= parseInt(noOfBonds); i++) {
        bonds.push({ bondNo: i, amount: amountPerBond.toFixed(2) });
      }
      setBondDistribution(bonds);
    } else {
      setBondDistribution([]);
    }
  }, [depositAmount, noOfBonds]);

  // Update nominee total
  useEffect(() => {
    setNomineeTotal(nominees.length);
  }, [nominees]);

  // Fetch customer details when custId changes
  useEffect(() => {
    if (custId) {
      const customerData = {
        "01000001": { 
          name: "RAJESH KUMAR", lastName: "KUMAR", surname: "RAJESH", 
          aadhar: "1234-5678-9012", phone: "9876543210", admission: "2020-01-01",
          branch: "Main Branch", status: "Active", dob: "1990-01-15"
        },
        "01000002": { 
          name: "PRIYA REDDY", lastName: "REDDY", surname: "PRIYA",
          aadhar: "2345-6789-0123", phone: "9876543211", admission: "2020-02-01",
          branch: "City Branch", status: "Active", dob: "1988-05-20"
        },
        "01000003": { 
          name: "SURESH BABU", lastName: "BABU", surname: "SURESH",
          aadhar: "3456-7890-1234", phone: "9876543212", admission: "2020-03-01",
          branch: "Town Branch", status: "Active", dob: "1985-12-10"
        }
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
        "A001": "Ramesh Kumar",
        "A002": "Priya Nair",
        "A003": "Suresh Reddy"
      };
      setAgentName(agentData[agentId] || "");
    } else {
      setAgentName("");
    }
  }, [agentId]);

  const handleReset = () => {
    setSysId("ID-002770");
    setSelectedId("");
    setTaskId("");
    setCustId("");
    setName("");
    setLastName("");
    setSurname("");
    setAadhar("");
    setPhone("");
    setAdmission("");
    setMemberStatus("");
    setBranch("");
    setDob("");
    setNomineeName("");
    setNomineeRelation("");
    setScheme("");
    setBondType("");
    setAccountType("");
    setDepositType("CUML");
    setEffectiveDate("");
    setCreatedDate(new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase());
    setDepositAmount("");
    setAmountInWords("");
    setSpecialRoi("");
    setAutoRenew("NO");
    setTenureYears("");
    setTenureMonths("");
    setTenureDays("");
    setLocking("");
    setRoi("");
    setMaturityDate("");
    setMaturityAmount("");
    setNoOfBonds("");
    setBondDistribution([]);
    setNominees([]);
    setNomineeTotal(0);
    setAgentId("");
    setAgentName("");
    setPaymentMode("");
  };

  const handleSubmit = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
    setSaved(true);
    setTimeout(() => { onSave && onSave(); }, 900);
  };

  const handleDeleteNominee = (index) => {
    const newNominees = nominees.filter((_, i) => i !== index);
    setNominees(newNominees);
  };

  return (
    <div className="sd-root">
      {/* Top Bar */}
      <div className="sd-topbar">
        <div className="sd-topbar-left">
          <button className="sd-back-btn" onClick={onBack}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <div className="sd-page-title">SD-New Account Creation</div>
        </div>
        <div className="sd-tabbar">
          <button className={`sd-tab ${mode === "create" ? "sd-tab-active" : ""}`} onClick={() => setMode("create")}>New</button>
          <button className={`sd-tab ${mode === "view" ? "sd-tab-active" : ""}`} onClick={() => setMode("view")} disabled={!account}>View</button>
          <button className={`sd-tab ${mode === "edit" ? "sd-tab-active" : ""}`} onClick={() => setMode("edit")} disabled={!account}>Edit</button>
        </div>
      </div>

      {/* Sys Id and Nominee Total */}
      <div className="sd-info-bar">
        <div className="sd-info-item">
          <span className="sd-info-label">Sys Id</span>
          <span className="sd-info-value">{sysId}</span>
        </div>
        <div className="sd-info-item">
          <span className="sd-info-label">Nominee Total</span>
          <span className="sd-info-value">{nomineeTotal}</span>
        </div>
      </div>

      {/* Selection Change */}
      <div className="sd-card">
        <div className="sd-card-header">Selection Change</div>
        <div className="sd-card-body">
          <div className="sd-form-grid-2">
            <div className="sd-field-group">
              <label className="sd-label">Id</label>
              <select className="sd-select" value={selectedId} onChange={e => setSelectedId(e.target.value)} disabled={isReadOnly}>
                <option value="">Select ID</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
              </select>
            </div>
            <div className="sd-field-group">
              <label className="sd-label">Task Id</label>
              <input className="sd-input" value={taskId} onChange={e => setTaskId(e.target.value)} readOnly={isReadOnly} placeholder="Auto generated" />
            </div>
          </div>
        </div>
      </div>

      {/* Member Details */}
      <div className="sd-card">
        <div className="sd-card-header">Member Details</div>
        <div className="sd-card-body">
          <div className="sd-form-grid-4">
            <div className="sd-field-group">
              <label className="sd-label required">Cust Id</label>
              <select className="sd-select" value={custId} onChange={e => setCustId(e.target.value)} disabled={isReadOnly}>
                <option value="">Select Cust ID</option>
                <option value="01000001">01000001 - RAJESH KUMAR</option>
                <option value="01000002">01000002 - PRIYA REDDY</option>
                <option value="01000003">01000003 - SURESH BABU</option>
              </select>
            </div>
            <div className="sd-field-group">
              <label className="sd-label">Name</label>
              <input className="sd-input" value={name} readOnly />
            </div>
            <div className="sd-field-group">
              <label className="sd-label">Last Name</label>
              <input className="sd-input" value={lastName} readOnly />
            </div>
            <div className="sd-field-group">
              <label className="sd-label">Surname</label>
              <input className="sd-input" value={surname} readOnly />
            </div>
            <div className="sd-field-group">
              <label className="sd-label">Aadhar</label>
              <input className="sd-input" value={aadhar} readOnly />
            </div>
            <div className="sd-field-group">
              <label className="sd-label">Phone</label>
              <input className="sd-input" value={phone} readOnly />
            </div>
            <div className="sd-field-group">
              <label className="sd-label">Admission</label>
              <input className="sd-input" type="date" value={admission} readOnly />
            </div>
            <div className="sd-field-group">
              <label className="sd-label">Status</label>
              <input className="sd-input" value={memberStatus} readOnly />
            </div>
            <div className="sd-field-group">
              <label className="sd-label">Branch</label>
              <input className="sd-input" value={branch} readOnly />
            </div>
            <div className="sd-field-group">
              <label className="sd-label">Dob</label>
              <input className="sd-input" type="date" value={dob} readOnly />
            </div>
            <div className="sd-field-group">
              <label className="sd-label">Nominee Name</label>
              <input className="sd-input" value={nomineeName} onChange={e => setNomineeName(e.target.value)} readOnly={isReadOnly} />
            </div>
            <div className="sd-field-group">
              <label className="sd-label">Nominee Relation</label>
              <input className="sd-input" value={nomineeRelation} onChange={e => setNomineeRelation(e.target.value)} readOnly={isReadOnly} />
            </div>
          </div>
        </div>
      </div>

      {/* SD Account Details */}
      <div className="sd-card">
        <div className="sd-card-header">SD Account Details</div>
        <div className="sd-card-body">
          <div className="sd-form-grid-3">
            <div className="sd-field-group">
              <label className="sd-label required">Scheme</label>
              <select className="sd-select" value={scheme} onChange={e => setScheme(e.target.value)} disabled={isReadOnly}>
                <option value="">--SELECT--</option>
                <option value="SD_STANDARD">SD Standard</option>
                <option value="SD_PREMIUM">SD Premium</option>
                <option value="SD_CORPORATE">SD Corporate</option>
              </select>
            </div>
            <div className="sd-field-group">
              <label className="sd-label">Bond Type</label>
              <select className="sd-select" value={bondType} onChange={e => setBondType(e.target.value)} disabled={isReadOnly}>
                <option value="">--SELECT--</option>
                <option value="CERTIFICATE">Certificate</option>
                <option value="DEMATERIALIZED">Dematerialized</option>
              </select>
            </div>
            <div className="sd-field-group">
              <label className="sd-label">Account Type</label>
              <select className="sd-select" value={accountType} onChange={e => setAccountType(e.target.value)} disabled={isReadOnly}>
                <option value="">--SELECT--</option>
                <option value="SINGLE">Single</option>
                <option value="JOINT">Joint</option>
              </select>
            </div>
            <div className="sd-field-group">
              <label className="sd-label">Deposit Type</label>
              <select className="sd-select" value={depositType} onChange={e => setDepositType(e.target.value)} disabled={isReadOnly}>
                <option value="CUML">CUML</option>
                <option value="NON_CUML">NON-CUML</option>
              </select>
            </div>
            <div className="sd-field-group">
              <label className="sd-label">Effective Date</label>
              <input className="sd-input" type="date" value={effectiveDate} onChange={e => setEffectiveDate(e.target.value)} readOnly={isReadOnly} />
            </div>
            <div className="sd-field-group">
              <label className="sd-label">Created Date</label>
              <input className="sd-input" value={createdDate} readOnly />
            </div>
            <div className="sd-field-group">
              <label className="sd-label required">Deposit Amount</label>
              <input className="sd-input" type="number" value={depositAmount} onChange={e => setDepositAmount(e.target.value)} readOnly={isReadOnly} />
            </div>
            <div className="sd-field-group sd-full-width">
              <label className="sd-label">Amount In Words</label>
              <textarea className="sd-textarea" value={amountInWords} readOnly rows={2} />
            </div>
            <div className="sd-field-group">
              <label className="sd-label">Special Roi</label>
              <input className="sd-input" type="number" step="0.1" value={specialRoi} onChange={e => setSpecialRoi(e.target.value)} readOnly={isReadOnly} />
            </div>
            <div className="sd-field-group">
              <label className="sd-label">Auto Renew</label>
              <select className="sd-select" value={autoRenew} onChange={e => setAutoRenew(e.target.value)} disabled={isReadOnly}>
                <option value="YES">YES</option>
                <option value="NO">NO</option>
              </select>
            </div>
            <div className="sd-field-group">
              <label className="sd-label">Tenure</label>
              <div className="sd-tenure-group">
                <input className="sd-tenure-input" type="number" placeholder="Years" value={tenureYears} onChange={e => setTenureYears(e.target.value)} readOnly={isReadOnly} />
                <input className="sd-tenure-input" type="number" placeholder="Months" value={tenureMonths} onChange={e => setTenureMonths(e.target.value)} readOnly={isReadOnly} />
                <input className="sd-tenure-input" type="number" placeholder="Days" value={tenureDays} onChange={e => setTenureDays(e.target.value)} readOnly={isReadOnly} />
                <button className="sd-calc-btn" onClick={handleCalculate} disabled={isReadOnly}>Calculate</button>
              </div>
            </div>
            <div className="sd-field-group">
              <label className="sd-label">Locking</label>
              <select className="sd-select" value={locking} onChange={e => setLocking(e.target.value)} disabled={isReadOnly}>
                <option value="">--SELECT--</option>
                <option value="NO_LOCK">No Lock</option>
                <option value="PARTIAL">Partial Lock</option>
                <option value="FULL">Full Lock</option>
              </select>
            </div>
            <div className="sd-field-group">
              <label className="sd-label required">ROI</label>
              <input className="sd-input" type="number" step="0.1" value={roi} onChange={e => setRoi(e.target.value)} readOnly={isReadOnly} />
            </div>
            <div className="sd-field-group">
              <label className="sd-label">Maturity Date</label>
              <input className="sd-input" value={maturityDate} readOnly disabled />
            </div>
            <div className="sd-field-group">
              <label className="sd-label">Maturity Amount</label>
              <input className="sd-input" value={maturityAmount} readOnly disabled />
            </div>
          </div>
        </div>
      </div>

      {/* SD Bonds */}
      <div className="sd-card">
        <div className="sd-card-header">SD Bonds</div>
        <div className="sd-card-body">
          <div className="sd-form-grid-2">
            <div className="sd-field-group">
              <label className="sd-label">No Of Bonds</label>
              <input className="sd-input" type="number" value={noOfBonds} onChange={e => setNoOfBonds(e.target.value)} readOnly={isReadOnly} />
            </div>
          </div>
          {noOfBonds && bondDistribution.length > 0 && (
            <div className="sd-bond-info">
              <p className="sd-bond-instruction">
                Instructions: Enter your deposit amount and number of bonds. The system will automatically distribute the amount equally across all bonds.
              </p>
              <div className="sd-table-responsive">
                <table className="sd-table sd-bond-table">
                  <thead>
                    <tr><th>Bond No</th><th>Amount</th></tr>
                  </thead>
                  <tbody>
                    {bondDistribution.map((bond, idx) => (
                      <tr key={idx}>
                        <td>{bond.bondNo}</td>
                        <td>₹{bond.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Nominee Section */}
      <div className="sd-card">
        <div className="sd-card-header">Nominee</div>
        <div className="sd-card-body">
          <div className="sd-nominee-form">
            <div className="sd-form-grid-4">
              <div className="sd-field-group">
                <label className="sd-label">Nominee Name</label>
                <input className="sd-input" value={nominees.length > 0 ? nominees[0]?.name || "" : ""} onChange={e => {}} readOnly={isReadOnly} />
              </div>
              <div className="sd-field-group">
                <label className="sd-label">Percentage</label>
                <input className="sd-input" value={nominees.length > 0 ? nominees[0]?.percentage || "" : ""} onChange={e => {}} readOnly={isReadOnly} />
              </div>
              <div className="sd-field-group">
                <label className="sd-label">Nominee Age</label>
                <input className="sd-input" value={nominees.length > 0 ? nominees[0]?.age || "" : ""} onChange={e => {}} readOnly={isReadOnly} />
              </div>
              <div className="sd-field-group">
                <label className="sd-label">Hno</label>
                <input className="sd-input" value={nominees.length > 0 ? nominees[0]?.hno || "" : ""} onChange={e => {}} readOnly={isReadOnly} />
              </div>
              <div className="sd-field-group">
                <label className="sd-label">City</label>
                <input className="sd-input" value={nominees.length > 0 ? nominees[0]?.city || "" : ""} onChange={e => {}} readOnly={isReadOnly} />
              </div>
              <div className="sd-field-group">
                <label className="sd-label">Country</label>
                <select className="sd-select" value={nominees.length > 0 ? nominees[0]?.country || "INDIA" : "INDIA"} disabled>
                  <option>INDIA</option>
                  <option>OTHER</option>
                </select>
              </div>
            </div>
            <div className="sd-nominee-actions">
              <button className="sd-btn sd-btn-primary" onClick={() => setShowModal(true)} disabled={isReadOnly}>Add Nominee</button>
              <button className="sd-btn sd-btn-danger" onClick={() => handleDeleteNominee(nominees.length - 1)} disabled={isReadOnly || nominees.length === 0}>Delete Nominee</button>
            </div>
          </div>
        </div>
      </div>

      {/* Nominee Details List */}
      <div className="sd-card">
        <div className="sd-card-header">Nominee Details List</div>
        <div className="sd-card-body">
          {nominees.length === 0 ? (
            <div className="sd-no-data">No nominee records found.</div>
          ) : (
            <div className="sd-table-responsive">
              <table className="sd-table">
                <thead>
                  <tr>
                    <th>Seq Id</th><th>Nominee Nam</th><th>Relation</th><th>Percentage</th>
                    <th>Date Of Birth</th><th>Age</th><th>H-No</th><th>Street</th>
                    <th>City</th><th>State</th><th>Country</th><th>Pin</th>
                    {!isReadOnly && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {nominees.map((n, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td>{n.name}</td>
                      <td>{n.relation}</td>
                      <td>{n.percentage}%</td>
                      <td>{n.dob || "—"}</td>
                      <td>{n.age || "—"}</td>
                      <td>{n.hno || "—"}</td>
                      <td>{n.street || "—"}</td>
                      <td>{n.city || "—"}</td>
                      <td>{n.state || "—"}</td>
                      <td>{n.country || "INDIA"}</td>
                      <td>{n.pin || "—"}</td>
                      {!isReadOnly && (
                        <td>
                          <button className="sd-remove-btn" onClick={() => handleDeleteNominee(i)}>Delete</button>
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

      {/* Agent Details */}
      <div className="sd-card">
        <div className="sd-card-header">Agent Details</div>
        <div className="sd-card-body">
          <div className="sd-form-grid-2">
            <div className="sd-field-group">
              <label className="sd-label">Agent Id</label>
              <select className="sd-select" value={agentId} onChange={e => setAgentId(e.target.value)} disabled={isReadOnly}>
                <option value="">Select Agent</option>
                <option value="A001">A001 - Ramesh Kumar</option>
                <option value="A002">A002 - Priya Nair</option>
                <option value="A003">A003 - Suresh Reddy</option>
              </select>
            </div>
            <div className="sd-field-group">
              <label className="sd-label">Agent Name</label>
              <input className="sd-input" value={agentName} readOnly />
            </div>
          </div>
        </div>
      </div>

      {/* Payment Mode */}
      <div className="sd-card">
        <div className="sd-card-header">Payment Mode</div>
        <div className="sd-card-body">
          <div className="sd-form-grid-2">
            <div className="sd-field-group">
              <label className="sd-label">Payment Mode</label>
              <select className="sd-select" value={paymentMode} onChange={e => setPaymentMode(e.target.value)} disabled={isReadOnly}>
                <option value="">--SELECT--</option>
                <option value="CASH">Cash</option>
                <option value="CHEQUE">Cheque</option>
                <option value="TRANSFER">Transfer</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="sd-footer">
        {!isReadOnly ? (
          <>
            <button className={`sd-btn sd-btn-primary ${saved ? "sd-btn-saved" : ""}`} onClick={handleSubmit} disabled={saving}>
              {saved ? "✓ Submitted!" : saving ? "Submitting..." : "Submit"}
            </button>
            <button className="sd-btn sd-btn-secondary" onClick={handleReset}>Reset</button>
            {mode === "edit" && <button className="sd-btn sd-btn-secondary" onClick={() => setMode("view")}>View</button>}
            <button className="sd-btn sd-btn-outline" onClick={onBack}>Task list</button>
          </>
        ) : (
          <>
            <button className="sd-btn sd-btn-primary" onClick={() => setMode("edit")}>Edit Account</button>
            <button className="sd-btn sd-btn-outline" onClick={onBack}>Back</button>
          </>
        )}
      </div>

      {/* Release */}
      <div className="sd-release">Release 1.0</div>

      {/* Nominee Modal */}
      {showModal && <SDNomineeModal onClose={() => setShowModal(false)} onAdd={(nominee) => setNominees(prev => [...prev, nominee])} />}
    </div>
  );
}
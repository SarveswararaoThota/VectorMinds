import { useState, useEffect } from "react";
import "./ShareTransaction.css";

export default function ShareTransaction({ initialMode = "create", transaction = null, onBack, onSave, currentUser }) {
  const [mode, setMode] = useState(initialMode);
  const isReadOnly = mode === "view";

  // Task Id
  const [taskId, setTaskId] = useState("");

  // Member Details
  const [custId, setCustId] = useState("");
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [surname, setSurname] = useState("");
  const [aadhar, setAadhar] = useState("");
  const [phone, setPhone] = useState("");
  const [admission, setAdmission] = useState("");
  const [status, setStatus] = useState("");
  const [closeDate, setCloseDate] = useState("");
  const [branch, setBranch] = useState("");
  const [dob, setDob] = useState("");
  const [nomineeName, setNomineeName] = useState("");
  const [nomineeRelation, setNomineeRelation] = useState("");

  // Transaction Details
  const [transactionType, setTransactionType] = useState("Deposit");
  const [sharePrice, setSharePrice] = useState(100);
  const [numberOfShares, setNumberOfShares] = useState("");
  const [shareCapital, setShareCapital] = useState("");
  const [entranceFee, setEntranceFee] = useState(50);
  const [gstPercent, setGstPercent] = useState(0);
  const [gstAmount, setGstAmount] = useState(0);
  const [transactionAmount, setTransactionAmount] = useState("");
  const [remarks, setRemarks] = useState("");

  // Payment Mode
  const [paymentMode, setPaymentMode] = useState("");

  // Share Transactions Summary
  const [transactions, setTransactions] = useState([]);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Format date to DD-MMM-YYYY
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
  };

  // Calculate Share Capital
  useEffect(() => {
    if (numberOfShares && sharePrice) {
      const capital = parseInt(numberOfShares) * parseFloat(sharePrice);
      setShareCapital(capital.toFixed(2));
    } else {
      setShareCapital("");
    }
  }, [numberOfShares, sharePrice]);

  // Calculate GST Amount
  useEffect(() => {
    const gst = (parseFloat(entranceFee) * parseFloat(gstPercent)) / 100;
    setGstAmount(gst.toFixed(2));
  }, [entranceFee, gstPercent]);

  // Calculate Transaction Amount
  useEffect(() => {
    let amount = 0;
    if (shareCapital) {
      amount += parseFloat(shareCapital);
    }
    if (entranceFee) {
      amount += parseFloat(entranceFee);
    }
    if (gstAmount) {
      amount += parseFloat(gstAmount);
    }
    setTransactionAmount(amount.toFixed(2));
  }, [shareCapital, entranceFee, gstAmount]);

  // Fetch member details when custId changes
  useEffect(() => {
    if (custId) {
      const memberData = {
        "01000001": {
          name: "RAJESH KUMAR", lastName: "KUMAR", surname: "RAJESH",
          aadhar: "1234-5678-9012", phone: "9876543210",
          admission: "2024-01-15", status: "Approved", branch: "Main Branch",
          dob: "1990-01-15", nomineeName: "SITA KUMARI", nomineeRelation: "Spouse"
        },
        "01000002": {
          name: "PRIYA REDDY", lastName: "REDDY", surname: "PRIYA",
          aadhar: "2345-6789-0123", phone: "9876543211",
          admission: "2024-02-01", status: "Approved", branch: "City Branch",
          dob: "1988-05-20", nomineeName: "RAJESH REDDY", nomineeRelation: "Father"
        },
        "01000003": {
          name: "ANUSHA", lastName: "", surname: "",
          aadhar: "796926637935", phone: "8121372204",
          admission: "2024-07-08", status: "Approved", branch: "Town Branch",
          dob: "1991-03-14", nomineeName: "MOTHUKURU KRISHNA", nomineeRelation: "Father"
        }
      };
      const data = memberData[custId];
      if (data) {
        setName(data.name);
        setLastName(data.lastName || "");
        setSurname(data.surname || "");
        setAadhar(data.aadhar);
        setPhone(data.phone);
        setAdmission(formatDate(data.admission));
        setStatus(data.status);
        setBranch(data.branch);
        setDob(formatDate(data.dob));
        setNomineeName(data.nomineeName);
        setNomineeRelation(data.nomineeRelation);
      }
    }
  }, [custId]);

  const handleReset = () => {
    setTaskId("");
    setCustId("");
    setName("");
    setLastName("");
    setSurname("");
    setAadhar("");
    setPhone("");
    setAdmission("");
    setStatus("");
    setCloseDate("");
    setBranch("");
    setDob("");
    setNomineeName("");
    setNomineeRelation("");
    setTransactionType("Deposit");
    setSharePrice(100);
    setNumberOfShares("");
    setShareCapital("");
    setEntranceFee(50);
    setGstPercent(0);
    setGstAmount(0);
    setTransactionAmount("");
    setRemarks("");
    setPaymentMode("");
  };

  const handleSubmit = async () => {
    if (!custId) {
      alert("Please select a customer");
      return;
    }
    if (!numberOfShares || parseInt(numberOfShares) <= 0) {
      alert("Please enter number of shares");
      return;
    }
    
    setSaving(true);
    
    // Create transaction record
    const newTransaction = {
      id: Date.now(),
      date: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase(),
      taskId: taskId || `TASK-${Date.now()}`,
      custId,
      name,
      transactionType,
      numberOfShares: parseInt(numberOfShares),
      sharePrice: parseFloat(sharePrice),
      shareCapital: parseFloat(shareCapital),
      entranceFee: parseFloat(entranceFee),
      gstPercent: parseFloat(gstPercent),
      gstAmount: parseFloat(gstAmount),
      transactionAmount: parseFloat(transactionAmount),
      paymentMode,
      remarks,
      status: "Completed"
    };
    
    setTransactions(prev => [newTransaction, ...prev]);
    
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      handleReset();
      onSave && onSave(newTransaction);
    }, 900);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="st-root">
      {/* Top Bar */}
      <div className="st-topbar">
        <div className="st-topbar-left">
          <button className="st-back-btn" onClick={onBack}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <div className="st-page-title">Share - Transaction</div>
        </div>
        <div className="st-tabbar">
          <button className={`st-tab ${mode === "create" ? "st-tab-active" : ""}`} onClick={() => setMode("create")}>New</button>
          <button className={`st-tab ${mode === "view" ? "st-tab-active" : ""}`} onClick={() => setMode("view")} disabled={!transaction}>View</button>
          <button className={`st-tab ${mode === "edit" ? "st-tab-active" : ""}`} onClick={() => setMode("edit")} disabled={!transaction}>Edit</button>
        </div>
      </div>

      {/* Task Id */}
      <div className="st-card">
        <div className="st-card-header">Task Id</div>
        <div className="st-card-body">
          <div className="st-form-grid-2">
            <div className="st-field-group">
              <input 
                className="st-input" 
                value={taskId} 
                onChange={e => setTaskId(e.target.value)} 
                readOnly={isReadOnly} 
                placeholder="Auto generated"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Member Details */}
      <div className="st-card">
        <div className="st-card-header">Member Details</div>
        <div className="st-card-body">
          <div className="st-form-grid-3">
            <div className="st-field-group">
              <label className="st-label required">Cust Id</label>
              <select className="st-select" value={custId} onChange={e => setCustId(e.target.value)} disabled={isReadOnly}>
                <option value="">Select Cust ID</option>
                <option value="01000001">01000001 - RAJESH KUMAR</option>
                <option value="01000002">01000002 - PRIYA REDDY</option>
                <option value="01000003">01000003 - ANUSHA</option>
              </select>
            </div>
            <div className="st-field-group">
              <label className="st-label">Name</label>
              <input className="st-input" value={name} readOnly />
            </div>
            <div className="st-field-group">
              <label className="st-label">Last Name</label>
              <input className="st-input" value={lastName} readOnly />
            </div>
            <div className="st-field-group">
              <label className="st-label">Surname</label>
              <input className="st-input" value={surname} readOnly />
            </div>
            <div className="st-field-group">
              <label className="st-label">Aadhar</label>
              <input className="st-input" value={aadhar} readOnly />
            </div>
            <div className="st-field-group">
              <label className="st-label">Phone</label>
              <input className="st-input" value={phone} readOnly />
            </div>
            <div className="st-field-group">
              <label className="st-label">Admission</label>
              <input className="st-input" value={admission} readOnly />
            </div>
            <div className="st-field-group">
              <label className="st-label">Status</label>
              <input className="st-input" value={status} readOnly />
            </div>
            <div className="st-field-group">
              <label className="st-label">Close Date</label>
              <input className="st-input" value={closeDate} onChange={e => setCloseDate(e.target.value)} readOnly={isReadOnly} />
            </div>
            <div className="st-field-group">
              <label className="st-label">Branch</label>
              <input className="st-input" value={branch} readOnly />
            </div>
            <div className="st-field-group">
              <label className="st-label">Dobs</label>
              <input className="st-input" value={dob} readOnly />
            </div>
            <div className="st-field-group">
              <label className="st-label">Nominee Name</label>
              <input className="st-input" value={nomineeName} readOnly />
            </div>
            <div className="st-field-group">
              <label className="st-label">Nominee Relation</label>
              <input className="st-input" value={nomineeRelation} readOnly />
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Details */}
      <div className="st-card">
        <div className="st-card-header">Transaction Details</div>
        <div className="st-card-body">
          <div className="st-form-grid-3">
            <div className="st-field-group">
              <label className="st-label required">Transaction Type</label>
              <select className="st-select" value={transactionType} onChange={e => setTransactionType(e.target.value)} disabled={isReadOnly}>
                <option value="Deposit">Deposit</option>
                <option value="Withdrawal">Withdrawal</option>
                <option value="Transfer">Transfer</option>
              </select>
            </div>
            <div className="st-field-group">
              <label className="st-label">Share Price</label>
              <input className="st-input" type="number" value={sharePrice} onChange={e => setSharePrice(e.target.value)} readOnly={isReadOnly} />
            </div>
            <div className="st-field-group">
              <label className="st-label required">Number of Shares</label>
              <input className="st-input" type="number" value={numberOfShares} onChange={e => setNumberOfShares(e.target.value)} readOnly={isReadOnly} />
            </div>
            <div className="st-field-group">
              <label className="st-label">Share Capital</label>
              <input className="st-input" value={shareCapital} readOnly disabled />
            </div>
            <div className="st-field-group">
              <label className="st-label">Entrance Fee</label>
              <input className="st-input" type="number" value={entranceFee} onChange={e => setEntranceFee(e.target.value)} readOnly={isReadOnly} />
            </div>
            <div className="st-field-group">
              <label className="st-label">GST%</label>
              <input className="st-input" type="number" step="0.1" value={gstPercent} onChange={e => setGstPercent(e.target.value)} readOnly={isReadOnly} />
            </div>
            <div className="st-field-group">
              <label className="st-label">GST</label>
              <input className="st-input" value={gstAmount} readOnly disabled />
            </div>
            <div className="st-field-group">
              <label className="st-label">Transaction Amount</label>
              <input className="st-input st-amount" value={transactionAmount} readOnly disabled />
            </div>
            <div className="st-field-group st-full-width">
              <label className="st-label">Remarks</label>
              <textarea className="st-textarea" rows="2" value={remarks} onChange={e => setRemarks(e.target.value)} readOnly={isReadOnly} placeholder="Enter remarks if any" />
            </div>
          </div>
        </div>
      </div>

      {/* Payment Mode */}
      <div className="st-card">
        <div className="st-card-header">Payment Mode</div>
        <div className="st-card-body">
          <div className="st-form-grid-2">
            <div className="st-field-group">
              <label className="st-label required">Payment Mode</label>
              <select className="st-select" value={paymentMode} onChange={e => setPaymentMode(e.target.value)} disabled={isReadOnly}>
                <option value="">-- SELECT --</option>
                <option value="CASH">Cash</option>
                <option value="CHEQUE">Cheque</option>
                <option value="TRANSFER">Bank Transfer</option>
                <option value="ONLINE">Online Payment</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Share Transactions Summary */}
      <div className="st-card">
        <div className="st-card-header">Share Transactions Summary</div>
        <div className="st-card-body">
          {transactions.length === 0 ? (
            <div className="st-no-data">No transactions found</div>
          ) : (
            <div className="st-table-responsive">
              <table className="st-table">
                <thead>
                  <tr>
                    <th>Date</th><th>Task ID</th><th>Cust ID</th><th>Name</th>
                    <th>Type</th><th>Shares</th><th>Share Price</th>
                    <th>Share Capital</th><th>Entrance Fee</th><th>GST</th>
                    <th>Total Amount</th><th>Payment Mode</th><th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t, i) => (
                    <tr key={i}>
                      <td>{t.date}</td>
                      <td>{t.taskId}</td>
                      <td>{t.custId}</td>
                      <td>{t.name}</td>
                      <td>{t.transactionType}</td>
                      <td>{t.numberOfShares}</td>
                      <td>₹{t.sharePrice}</td>
                      <td>₹{t.shareCapital}</td>
                      <td>₹{t.entranceFee}</td>
                      <td>₹{t.gstAmount}</td>
                      <td>₹{t.transactionAmount}</td>
                      <td>{t.paymentMode}</td>
                      <td><span className="st-status-completed">{t.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {transactions.length > 0 && (
            <div className="st-print-section">
              <button className="st-print-btn" onClick={handlePrint}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9V3h12v6"/>
                  <path d="M6 21H4a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2"/>
                  <path d="M6 15h12v6H6z"/>
                  <path d="M16 3H8v6h8z"/>
                </svg>
                Print
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="st-footer">
        {!isReadOnly ? (
          <>
            <button className={`st-btn st-btn-primary ${saved ? "st-btn-saved" : ""}`} onClick={handleSubmit} disabled={saving}>
              {saved ? "✓ Submitted!" : saving ? "Submitting..." : "Submit"}
            </button>
            <button className="st-btn st-btn-secondary" onClick={handleReset}>Reset</button>
            <button className="st-btn st-btn-outline" onClick={onBack}>Back</button>
          </>
        ) : (
          <>
            <button className="st-btn st-btn-primary" onClick={() => setMode("edit")}>Edit Transaction</button>
            <button className="st-btn st-btn-outline" onClick={onBack}>Back</button>
          </>
        )}
      </div>
    </div>
  );
}
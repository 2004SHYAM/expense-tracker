import React, { useEffect, useState } from "react";

/**
 * AddExpense.jsx
 *
 * - Custom Split (auto equal when amount typed) + editable custom values
 * - Split Among All Members
 * - When totals mismatch -> show a centered glass modal (SweetAlert-style)
 *   that contains:
 *     - the uploaded image as an icon (local path)
 *     - a warning symbol
 *     - friendly message
 *     - Proceed / Re-enter buttons
 * - Modal is theme-agnostic and responsive
 *
 * NOTE: The uploaded image path is referenced directly:
 *   /mnt/data/43aa56dc-e99c-43bf-9984-d75a5c2c72b2.png
 * Your environment will transform that path to an accessible URL automatically.
 */

export default function AddExpense() {
  const userId = localStorage.getItem("userId");

  const [teams, setTeams] = useState([]);
  const [teamId, setTeamId] = useState("");

  const [members, setMembers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const [splitType, setSplitType] = useState("custom"); // 'custom' | 'all'
  const [customShares, setCustomShares] = useState({});
  const [manualEdit, setManualEdit] = useState(false);

  // modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalInfo, setModalInfo] = useState({
    totalShares: 0,
    originalAmount: 0,
    sharesArray: null,
  });

  // success toast
  const [successVisible, setSuccessVisible] = useState(false);

  const [message, setMessage] = useState(""); // server response message

  // uploaded image path (will be converted by environment to URL)
  const uploadedImage = "/mnt/data/43aa56dc-e99c-43bf-9984-d75a5c2c72b2.png";

  // ----------------- load teams -----------------
  useEffect(() => {
    fetch(`http://localhost:8080/api/team/my-teams/${userId}`)
      .then((r) => r.json())
      .then((d) => setTeams(d || []))
      .catch(() => setTeams([]));
  }, [userId]);

  // ----------------- load members when team selected -----------------
  useEffect(() => {
    if (!teamId) return;

    fetch(`http://localhost:8080/api/team/members/${teamId}`)
      .then((r) => r.json())
      .then((data) => {
        setMembers(data || []);
        const ids = (data || []).map((m) => m.id);
        setSelectedUsers(ids);

        const init = {};
        (data || []).forEach((m) => (init[m.id] = 0));
        setCustomShares(init);
        setManualEdit(false);
      })
      .catch(() => {
        setMembers([]);
        setCustomShares({});
      });
  }, [teamId]);

  // ----------------- auto-fill equal custom shares when amount changes (if not manual) -----------------
  useEffect(() => {
    if (
      splitType === "custom" &&
      amount &&
      selectedUsers.length > 0 &&
      !manualEdit
    ) {
      const each = Number(amount) / selectedUsers.length;
      const updated = {};
      selectedUsers.forEach((id) => (updated[id] = Number(each.toFixed(2))));
      setCustomShares(updated);
    }
  }, [amount, splitType, selectedUsers, manualEdit]);

  // ----------------- update custom amount and mark manual -----------------
  const updateCustomAmount = (userId, value) => {
    setManualEdit(true);
    setCustomShares((prev) => ({ ...prev, [userId]: Number(value) }));
  };

  // ----------------- build final shares object/array -----------------
  const getFinalSharesObj = () => {
    if (splitType === "custom") return customShares;

    // split among all equally
    const each = members.length ? Number(amount) / members.length : 0;
    const res = {};
    members.forEach((m) => (res[m.id] = Number(each.toFixed(2))));
    return res;
  };

  const buildSharesArray = () => {
    const obj = getFinalSharesObj();
    return Object.entries(obj).map(([uid, amt]) => ({
      userId: uid,
      amount: Number(amt),
    }));
  };

  // ----------------- actual submit function -----------------
  const doSubmit = async (sharesArray) => {
    const payload = {
      teamId,
      paidByUserId: userId,
      amount: Number(amount),
      description,
      shares: sharesArray,
    };

    try {
      const res = await fetch("http://localhost:8080/api/expenses/custom-add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const text = await res.text();
      setMessage(text);

      // show success toast
      setSuccessVisible(true);
      setTimeout(() => setSuccessVisible(false), 3000);

      // close modal if open
      setModalOpen(false);
    } catch (err) {
      setMessage("Submission failed: " + err.message);
    }
  };

  // ----------------- handle Add button (open modal if mismatch) -----------------
  const handleAdd = () => {
  let errorMsg = "";

  // 1. Team required
  if (!teamId) {
    errorMsg = "Please select a team before adding an expense.";
  }
  // 2. Amount required
  else if (!amount || Number(amount) <= 0) {
    errorMsg = "Please enter a valid amount.";
  }
  // 3. Description required
  else if (!description.trim()) {
    errorMsg = "Please enter a description for the expense.";
  }
  // 4. Custom split → each user must have a number
  else if (splitType === "custom") {
    let invalid = false;

    members.forEach((m) => {
      if (
        customShares[m.id] === "" ||
        customShares[m.id] == null ||
        Number.isNaN(Number(customShares[m.id]))
      ) {
        invalid = true;
      }
    });

    if (invalid) {
      errorMsg = "Please enter a valid split amount for each member.";
    }
  }

  // if error → show inline message and stop
  if (errorMsg) {
    setMessage(errorMsg);
    return;
  }

  // build shares
  const sharesArray = buildSharesArray();
  const totalShares = sharesArray.reduce((a, b) => a + b.amount, 0);
  const orig = Number(amount);

  // mismatch → open modal
  if (Math.round(totalShares * 100) / 100 !== Math.round(orig * 100) / 100) {
    setModalInfo({ totalShares, originalAmount: orig, sharesArray });
    setModalOpen(true);
    return;
  }

  // submit normally
  doSubmit(sharesArray);
};


  // ----------------- modal actions -----------------
  const onProceed = () => {
    if (!modalInfo.sharesArray) return;
    doSubmit(modalInfo.sharesArray);
  };

  const onReenter = () => {
    setModalOpen(false);
    // allow user to re-edit; do not alter customShares
  };

  // formatting helper
  const fmt = (n) => {
    if (n == null || Number.isNaN(Number(n))) return "0.00";
    return Number(n).toFixed(2);
  };

  // ----------------- render -----------------
  return (
    <div style={{ padding: 20, maxWidth: 920, margin: "0 auto" }}>
      {/* inline style tag for keyframes and modal/backdrop CSS */}
      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: translateY(-8px) scale(.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .ae-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(6,10,20,0.32);
          backdrop-filter: blur(6px);
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .ae-modal {
          width: 100%;
          max-width: 520px;
          border-radius: 14px;
          background: rgba(255,255,255,0.92);
          border: 1px solid rgba(255,255,255,0.6);
          box-shadow: 0 20px 50px rgba(6,14,30,0.18);
          padding: 20px;
          animation: fadeInScale 180ms ease;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .ae-modal.dark {
          background: rgba(12,16,24,0.56);
          color: #eaf2ff;
          border: 1px solid rgba(255,255,255,0.06);
        }
        .ae-modal-header {
          display:flex; gap:12px; align-items:center;
        }
        .ae-modal-icon {
          width:56px; height:56px; border-radius:10px; overflow:hidden; flex:0 0 56px;
          display:flex; align-items:center; justify-content:center;
          background: linear-gradient(180deg, rgba(0,0,0,0.04), rgba(255,255,255,0.06));
          border: 1px solid rgba(0,0,0,0.06);
        }
        .ae-modal-title { font-weight:700; font-size:18px; }
        .ae-modal-body { font-size:14px; color: rgba(10,20,40,0.9); }
        .ae-modal-footer { display:flex; gap:10px; justify-content:flex-end; margin-top:6px; }
        .ae-btn { padding:10px 14px; border-radius:10px; cursor:pointer; border:none; font-weight:700; }
        .ae-btn.ghost { background:transparent; border:1px solid rgba(0,0,0,0.08); color:inherit; }
        .ae-btn.primary { background: linear-gradient(90deg,#4b9bff,#0062ff); color: #fff; box-shadow: 0 8px 20px rgba(6,14,30,0.12); }
        .ae-toast {
          position: fixed;
          right: 18px;
          bottom: 18px;
          background: rgba(30,200,120,0.96);
          color: white;
          padding: 10px 14px;
          border-radius: 10px;
          box-shadow: 0 14px 40px rgba(6,14,30,0.18);
          z-index: 2500;
          animation: toastIn 220ms ease;
        }

        /* mobile adjustments */
        @media (max-width: 520px) {
          .ae-modal { padding: 16px; border-radius: 12px; }
          .ae-modal-icon { width:46px; height:46px; }
        }
      `}</style>

      <h2 style={{ marginTop: 6 }}>Add Expense</h2>

      <select
        style={styles.input}
        onChange={(e) => setTeamId(e.target.value)}
        value={teamId}
      >
        <option value="">Select Team</option>
        {teams.map((t) => (
          <option key={t.id} value={t.id}>
            {t.teamName}
          </option>
        ))}
      </select>

      {teamId && (
        <div style={{ marginBottom: 12 }}>
          <label style={{ marginRight: 14 }}>
            <input
              type="radio"
              checked={splitType === "custom"}
              onChange={() => {
                setSplitType("custom");
                setManualEdit(false);
              }}
            />{" "}
            Custom Split
          </label>

          <label>
            <input
              type="radio"
              checked={splitType === "all"}
              onChange={() => {
                setSplitType("all");
                setManualEdit(false);
              }}
            />{" "}
            Split Among All Members
          </label>
        </div>
      )}

      <input
        style={styles.input}
        type="number"
        placeholder="Total Amount"
        value={amount}
        onChange={(e) => {
          setAmount(e.target.value);
          setManualEdit(false);
        }}
      />

      <input
        style={styles.input}
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      {/* rows */}
      {splitType === "custom" && (
        <>
          <h4 style={{ marginTop: 6, marginBottom: 8 }}>Custom Split (editable)</h4>
          <div style={{ marginBottom: 12 }}>
            {members.map((m) => (
              <div key={m.id} style={styles.row}>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <img
                    src={uploadedImage}
                    alt="avatar"
                    style={{ width: 28, height: 28, borderRadius: 6, objectFit: "cover" }}
                  />
                  <div style={{ fontSize: 14 }}>{m.firstName} {m.lastName}</div>
                </div>

                <input
                  type="number"
                  step="0.01"
                  style={styles.smallInput}
                  value={customShares[m.id] != null ? customShares[m.id] : ""}
                  onChange={(e) => updateCustomAmount(m.id, e.target.value)}
                />
              </div>
            ))}
          </div>
        </>
      )}

      {splitType === "all" && (
        <>
          <h4 style={{ marginTop: 6, marginBottom: 8 }}>Split Among All Members (equal)</h4>
          <div style={{ marginBottom: 12 }}>
            {members.map((m) => {
              const each = members.length ? Number(amount) / members.length : 0;
              return (
                <div key={m.id} style={styles.row}>
                  <div style={{ fontSize: 14 }}>{m.firstName} {m.lastName}</div>
                  <div style={{ minWidth: 90, textAlign: "right", fontWeight: 600 }}>{fmt(each)}</div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Add button */}
      <div style={{ marginTop: 6 }}>
        <button style={styles.addBtn} onClick={handleAdd}>
          Add Expense
        </button>
      </div>

      {/* server message */}
      {message && <div style={{ marginTop: 14, fontWeight: 600 }}>{message}</div>}

      {/* Success toast */}
      {successVisible && <div className="ae-toast">Expense added successfully</div>}

      {/* ---------------- Modal (SweetAlert-like) ---------------- */}
      {modalOpen && (
        <div className="ae-modal-backdrop" role="dialog" aria-modal="true">
          <div className={`ae-modal`} role="document" aria-labelledby="ae-modal-title">
            <div className="ae-modal-header">
              <div className="ae-modal-icon">
                {/* show both the uploaded image and a big warning emoji */}
                <div style={{ textAlign: "center" }}>
                  <img
                    src={uploadedImage}
                    alt="icon"
                    style={{ width: 44, height: 44, borderRadius: 8, objectFit: "cover", display: "block", margin: "0 auto" }}
                  />
                  <div style={{ marginTop: 6, fontSize: 20 }}>⚠️</div>
                </div>
              </div>

              <div style={{ flex: 1 }}>
                <div id="ae-modal-title" className="ae-modal-title">Split total doesn't match</div>
                <div className="ae-modal-body">
                  The sum of the split amounts ({fmt(modalInfo.totalShares)}) does not equal the entered amount ({fmt(modalInfo.originalAmount)}).
                  You can either proceed and save the expense with the current split, or re-enter the split values.
                </div>
              </div>
            </div>

            <div style={{ marginTop: 6 }}>
              <div className="ae-modal-footer">
                <button className="ae-btn ghost" onClick={onReenter}>Re-enter</button>
                <button className="ae-btn primary" onClick={onProceed}>Proceed</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- inline styles ---------------- */
const styles = {
  input: {
    width: "100%",
    padding: 12,
    marginBottom: 12,
    borderRadius: 10,
    border: "1px solid rgba(0,0,0,0.08)",
    fontSize: 15,
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  smallInput: {
    width: 110,
    padding: 8,
    borderRadius: 10,
    border: "1px solid rgba(0,0,0,0.08)",
    textAlign: "right",
  },
  addBtn: {
    padding: "10px 18px",
    borderRadius: 12,
    border: "none",
    background: "linear-gradient(90deg,#4b9bff,#0062ff)",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
  },
};

function fmt(n) {
  if (n == null || Number.isNaN(Number(n))) return "0.00";
  return Number(n).toFixed(2);
}

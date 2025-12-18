// AddExpense.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AddExpense() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId") || ""; // safe fallback

  // state
  const [teams, setTeams] = useState([]);
  const [teamId, setTeamId] = useState("");

  const [members, setMembers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const [splitType, setSplitType] = useState("custom"); // 'custom' | 'all'
  const [customShares, setCustomShares] = useState({});
  const [manualEdit, setManualEdit] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalInfo, setModalInfo] = useState({ totalShares: 0, originalAmount: 0, sharesArray: null });

  const [successVisible, setSuccessVisible] = useState(false);
  const [message, setMessage] = useState("");

  // sample avatar used in UI - keep or replace
  const avatarImg = "/mnt/data/43aa56dc-e99c-43bf-9984-d75a5c2c72b2.png";

  // load teams
  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        const r = await fetch(`http://localhost:8080/api/team/my-teams/${userId}`);
        // handle non-json
        const data = await (r.ok ? r.json() : Promise.resolve([]));
        setTeams(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Load teams failed", err);
        setTeams([]);
      }
    })();
  }, [userId]);

  // load members for selected team
  useEffect(() => {
    if (!teamId) {
      setMembers([]);
      setSelectedUsers([]);
      setCustomShares({});
      return;
    }

    (async () => {
      try {
        const r = await fetch(`http://localhost:8080/api/team/members/${teamId}`);
        const data = await (r.ok ? r.json() : Promise.resolve([]));
        const arr = Array.isArray(data) ? data : [];
        setMembers(arr);
        const ids = arr.map((m) => m.id || m.userId || m._id); // accept common id variants
        setSelectedUsers(ids);

        // init custom shares
        const init = {};
        ids.forEach((id) => (init[id] = 0));
        setCustomShares(init);
        setManualEdit(false);
      } catch (err) {
        console.error("Load members failed", err);
        setMembers([]);
        setSelectedUsers([]);
        setCustomShares({});
      }
    })();
  }, [teamId]);

  // auto equal split when amount changes (unless manual edit)
  useEffect(() => {
    if (splitType !== "custom") return;
    if (!amount) return;
    if (!selectedUsers || selectedUsers.length === 0) return;
    if (manualEdit) return;

    // compute equal share and fill customShares
    const each = Number(amount) / selectedUsers.length;
    const updated = {};
    selectedUsers.forEach((id) => {
      // fix to 2 decimals but keep number
      updated[id] = Number(each.toFixed(2));
    });
    setCustomShares(updated);
  }, [amount, splitType, selectedUsers, manualEdit]);

  // update single user share (mark manual)
  const updateCustomAmount = (uid, value) => {
    setManualEdit(true);
    // allow empty to let user clear and retype
    const v = value === "" ? "" : Number(value);
    setCustomShares((prev) => ({ ...prev, [uid]: v }));
  };

  // build final shares object (userId -> amount)
  const getFinalSharesObj = () => {
    if (splitType === "custom") return customShares;

    // split among all equally
    const each = members.length ? Number(amount) / members.length : 0;
    const res = {};
    members.forEach((m) => {
      const id = m.id || m.userId || m._id;
      res[id] = Number(each.toFixed(2));
    });
    return res;
  };

  const buildSharesArray = () =>
    Object.entries(getFinalSharesObj()).map(([uid, amt]) => ({ userId: uid, amount: Number(amt || 0) }));

  // submit to backend
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

      // prefer text for flexibility
      const text = await res.text();
      setMessage(text || (res.ok ? "Expense added" : "Server error"));
      setSuccessVisible(true);

      setTimeout(() => {
        setSuccessVisible(false);
        // redirect back to home (as requested)
        navigate("/home");
      }, 1200);
    } catch (err) {
      setMessage("Submission failed: " + err.message);
    }
  };

  // validate and handle add
  const handleAdd = () => {
    setMessage("");

    if (!teamId) {
      setMessage("Please select a team.");
      return;
    }
    if (!amount || Number(amount) <= 0) {
      setMessage("Please enter a valid amount.");
      return;
    }
    if (!description || !description.trim()) {
      setMessage("Please enter description.");
      return;
    }

    if (splitType === "custom") {
      for (const m of members) {
        const id = m.id || m.userId || m._id;
        const val = customShares[id];
        if (val === "" || val == null || isNaN(Number(val))) {
          setMessage("Please fill all custom split values.");
          return;
        }
      }
    }

    const shares = buildSharesArray();
    const total = shares.reduce((s, it) => s + Number(it.amount || 0), 0);
    const orig = Number(amount);

    // mismatch -> open modal
    if (Math.round(total * 100) / 100 !== Math.round(orig * 100) / 100) {
      setModalInfo({ totalShares: total, originalAmount: orig, sharesArray: shares });
      setModalOpen(true);
      return;
    }

    // submit
    doSubmit(shares);
  };

  const fmt = (n) => {
    if (n == null || isNaN(Number(n))) return "0.00";
    return Number(n).toFixed(2);
  };

  return (
    <div className="add-expense-wrapper">
      {/* ----- styles included inline so component is self-contained ----- */}
      <style>{`
  :root {
    --glass: rgba(255,255,255,0.20);
    --glass-border: rgba(255,255,255,0.32);
    --text: #07122a;
  }

  .add-expense-wrapper {
    min-height: 100vh;
    padding: 40px 18px;
    background: linear-gradient(135deg, #ff7ce0, #7ea2ff, #5cf3ff);
    background-size: 300% 300%;
    animation: bgMove 14s ease infinite;
  }

  @keyframes bgMove {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  .page-title {
    text-align: center;
    font-size: 28px;
    font-weight: 700;
    margin-bottom: 18px;
    color: var(--text);
  }

  .glass-panel {
    max-width: 850px;
    margin: auto;
    padding: 25px;
    border-radius: 22px;
    background: var(--glass);
    backdrop-filter: blur(25px) saturate(180%);
    border: 1px solid var(--glass-border);
    box-shadow: 0 20px 50px rgba(0,0,0,0.25);
  }

  .text-input, .select {
    width: 100%;
    padding: 14px;
    border-radius: 14px;
    border: 1px solid rgba(255,255,255,0.4);
    background: rgba(255,255,255,0.35);
    margin-bottom: 14px;
    backdrop-filter: blur(20px);
  }

  .controls {
    display: flex;
    gap: 12px;
    margin-bottom: 14px;
  }

  .radio-wrap {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 14px;
    background: rgba(255,255,255,0.14);
    border-radius: 14px;
    border: 1px solid rgba(255,255,255,0.4);
  }

  .member-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }

  .member-left {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .avatar {
    width: 34px;
    height: 34px;
    border-radius: 8px;
    object-fit: cover;
  }

  .amount-input {
    width: 110px;
    padding: 10px;
    border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.4);
    background: rgba(255,255,255,0.5);
  }

  .add-btn {
    width: 100%;
    padding: 12px 18px;
    background: linear-gradient(90deg, #4b9bff, #0062ff);
    color: #fff;
    border-radius: 12px;
    border: none;
    font-size: 16px;
    font-weight: 700;
    margin-top: 10px;
  }

  .message {
    margin-top: 10px;
    color: #b02e2e;
    font-weight: 600;
  }
`}</style>


      <div className="page-title">Add Expense</div>

      <div className="glass-panel" role="region" aria-label="Add expense panel">
        <div style={{ marginBottom: 12 }}>
          <select
            className="select"
            value={teamId}
            onChange={(e) => setTeamId(e.target.value)}
            aria-label="Select team"
          >
            <option value="">Select Team</option>
            {teams.map((t) => {
              const id = t.id || t._id || t.teamId;
              return (
                <option key={id} value={id}>
                  {t.teamName || t.name || t.team_name}
                </option>
              );
            })}
          </select>
        </div>

        {teamId ? (
          <>
            <div className="controls" role="tablist" aria-label="Split options">
              <label className="radio-wrap">
                <input
                  type="radio"
                  name="split"
                  checked={splitType === "custom"}
                  onChange={() => {
                    setSplitType("custom");
                    setManualEdit(false);
                    setMessage("");
                  }}
                />
                <span>Custom Split</span>
              </label>

              <label className="radio-wrap">
                <input
                  type="radio"
                  name="split"
                  checked={splitType === "all"}
                  onChange={() => {
                    setSplitType("all");
                    setManualEdit(false);
                    setMessage("");
                  }}
                />
                <span>Split Among All</span>
              </label>
            </div>

            <div className="row">
              <div className="col">
                <input
                  className="text-input"
                  type="number"
                  step="0.01"
                  placeholder="Total Amount"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setManualEdit(false);
                    setMessage("");
                  }}
                />
              </div>
              <div style={{ width: 16 }} />
              <div className="col">
                <input
                  className="text-input"
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            <div className="members" aria-live="polite">
              {splitType === "custom" && (
                <>
                  <h4 style={{ margin: "8px 0 6px 0" }}>Custom Split</h4>
                  {members.length === 0 && <div style={{ padding: 8 }}>No members found in this team.</div>}
                  {members.map((m) => {
                    const id = m.id || m._id || m.userId;
                    const displayName = (m.firstName || m.fullName || m.name || "") + (m.lastName ? ` ${m.lastName}` : "");
                    return (
                      <div className="member-row" key={id}>
                        <div className="member-left">
                          <img className="avatar" src={avatarImg} alt="" />
                          <div className="member-name">{displayName || "Unknown"}</div>
                        </div>

                        <div className="split-amount">
                          <input
                            className="amount-input"
                            type="number"
                            step="0.01"
                            value={customShares[id] == null ? "" : customShares[id]}
                            onChange={(e) => updateCustomAmount(id, e.target.value)}
                          />
                        </div>
                      </div>
                    );
                  })}
                </>
              )}

              {splitType === "all" && (
                <>
                  <h4 style={{ margin: "8px 0 6px 0" }}>Split Among All</h4>
                  {members.map((m) => {
                    const id = m.id || m._id || m.userId;
                    const each = members.length ? Number(amount || 0) / members.length : 0;
                    const displayName = (m.firstName || m.fullName || m.name || "") + (m.lastName ? ` ${m.lastName}` : "");
                    return (
                      <div className="member-row" key={id}>
                        <div className="member-left">
                          <img className="avatar" src={avatarImg} alt="" />
                          <div className="member-name">{displayName || "Unknown"}</div>
                        </div>
                        <div style={{ minWidth: 110, textAlign: "right", fontWeight: 700 }}>{fmt(each)}</div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>

            <button className="add-btn" onClick={handleAdd}>
              Add Expense
            </button>

            {message && <div className="message" role="status">{message}</div>}
          </>
        ) : (
          <div style={{ color: "#555", padding: 8 }}>Choose a team to continue</div>
        )}
      </div>

      {successVisible && <div className="ae-toast">Expense added</div>}

      {/* modal for mismatch */}
      {modalOpen && (
        <div className="ae-modal-backdrop" role="dialog" aria-modal="true">
          <div className="ae-modal">
            <h3>Split mismatch</h3>
            <p>
              Entered amount: <strong>{fmt(modalInfo.originalAmount)}</strong>
              <br />
              Split sum: <strong>{fmt(modalInfo.totalShares)}</strong>
            </p>

            <div className="ae-footer">
              <button
                className="btn-ghost"
                onClick={() => {
                  setModalOpen(false);
                }}
              >
                Re-enter
              </button>
              <button
                className="btn-primary"
                onClick={() => {
                  // proceed with existing split array
                  if (modalInfo.sharesArray) doSubmit(modalInfo.sharesArray);
                }}
              >
                Proceed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useEffect, useState } from "react";

export default function Approvals() {
  const [teams, setTeams] = useState([]);
  const [pending, setPending] = useState([]);
  const [members, setMembers] = useState({});
  const [teamId, setTeamId] = useState("");

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    const res = await fetch(`http://localhost:8080/api/team/my-teams/${userId}`);
    setTeams(await res.json());
  };

 const loadMembers = async (tid) => {
  try {
    const res = await fetch(`http://localhost:8080/api/team/${tid}`);
    const team = await res.json();

    // SAME LOGIC AS APPROVALS.jsx
    const map = {};
    for (let id of team.memberIds) {
      try {
        const u = await fetch(`http://localhost:8080/api/auth/user/${id}`);
        const uData = await u.json();
        map[id] = uData.fullName || `${uData.firstName} ${uData.lastName}` || "User";
      } catch (e) {
        map[id] = "Unknown";
      }
    }

    setMembers(map);
  } catch (e) {
    console.error("Error loading members", e);
  }
};



  // -----------------------------
  // Load pending approvals
  // -----------------------------
  const loadPendingApprovals = async (tid) => {
    const res = await fetch(
      `http://localhost:8080/api/expenses/pending-approvals/${tid}/${userId}`
    );

    const data = await res.json();

    // Backend already returns: shares = only pending shares
    // So we rename 'shares' → 'pendingShares' for UI readability
    const formatted = data.map((ex) => ({
      ...ex,
      pendingShares: ex.shares || [],
    }));

    setPending(formatted);
  };

  const handleAction = async (expenseId, memberId, action) => {
    const res = await fetch(
      `http://localhost:8080/api/expenses/approve-payment/${expenseId}/${memberId}?action=${action}`,
      { method: "POST" }
    );

    alert(await res.text());

    await loadPendingApprovals(teamId);

    document.dispatchEvent(new Event("expenses-updated"));
  };

  return (
  <div className="ap-root">
    <style>{`
      /* Animated Gradient Background */
      .ap-root {
        min-height: 100vh;
        padding: 120px 20px 160px;
        background: linear-gradient(135deg, #ff7ce0, #7ea2ff, #5cf3ff);
        background-size: 300% 300%;
        animation: apMove 12s ease infinite;
        font-family: "Inter", sans-serif;
        color: #0b1220;
      }

      @keyframes apMove {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }

      /* Frosted Glass Panel */
      .ap-box {
        backdrop-filter: blur(20px) saturate(160%);
        background: rgba(255,255,255,0.25);
        border: 1px solid rgba(255,255,255,0.4);
        border-radius: 20px;
        padding: 20px;
        margin-bottom: 20px;
        box-shadow: 0 20px 40px rgba(0,0,0,0.18);
      }

      /* Smooth Glass Dropdown */
      .ap-input {
        width: 100%;
        max-width: 320px;
        padding: 12px;
        border-radius: 14px;
        border: 1px solid rgba(255,255,255,0.4);
        background: rgba(255,255,255,0.35);
        backdrop-filter: blur(16px);
        margin-bottom: 20px;
        font-size: 15px;
      }

      /* "Pending Approval" Expense Card */
      .ap-exp {
        background: rgba(255,255,255,0.4);
        backdrop-filter: blur(12px);
        border-radius: 18px;
        padding: 20px;
        margin-bottom: 18px;
        border: 1px solid rgba(255,255,255,0.35);
      }

      /* Member Approval Row */
      .ap-card {
        background: rgba(255,255,255,0.6);
        backdrop-filter: blur(12px);
        border-radius: 14px;
        padding: 15px;
        margin-top: 10px;
        border: 1px solid rgba(255,255,255,0.35);
      }

      /* Buttons */
      .ap-btn-approve {
        background: linear-gradient(90deg, #34d058, #00b82c);
        color: white;
        padding: 10px 16px;
        border-radius: 12px;
        border: none;
        cursor: pointer;
        font-weight: 700;
        margin-right: 10px;
        box-shadow: 0 4px 12px rgba(0,255,100,0.3);
      }

      .ap-btn-reject {
        background: linear-gradient(90deg, #ff4d4d, #d60000);
        color: white;
        padding: 10px 16px;
        border-radius: 12px;
        border: none;
        cursor: pointer;
        font-weight: 700;
        box-shadow: 0 4px 12px rgba(255,0,0,0.3);
      }

      .ap-title {
        color: white;
        text-shadow: 0 4px 12px rgba(0,0,0,0.3);
        margin-bottom: 20px;
      }
    `}</style>

    <h1 className="ap-title">Approve Payments</h1>

    <select
      className="ap-input"
      onChange={(e) => {
        setTeamId(e.target.value);
        loadMembers(e.target.value);
        loadPendingApprovals(e.target.value);
      }}
    >
      <option value="">Select Team</option>
      {teams.map((t) => (
        <option key={t.id} value={t.id}>
          {t.teamName}
        </option>
      ))}
    </select>

    {pending.length === 0 && teamId && (
      <p style={{ fontSize: 18, color: "#fff" }}>No pending approvals.</p>
    )}

    {pending.map((ex) => (
      <div key={ex.id} className="ap-exp">
        <h3>{ex.description} — ₹{ex.amount}</h3>

        {ex.pendingShares.map((sh, i) => (
          <div key={i} className="ap-card">
            <p>
              <b>{members[sh.userId] || "Loading..."}</b> needs approval
            </p>

            <p>Amount: ₹{sh.amount}</p>
            <p>Method: {sh.paymentMethod}</p>

            <button
              className="ap-btn-approve"
              onClick={() => handleAction(ex.id, sh.userId, "APPROVE")}
            >
              Approve
            </button>

            <button
              className="ap-btn-reject"
              onClick={() => handleAction(ex.id, sh.userId, "REJECT")}
            >
              Reject
            </button>
          </div>
        ))}
      </div>
    ))}
  </div>
)};

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
    const res = await fetch(`http://localhost:8080/api/team/${tid}`);
    const team = await res.json();

    const map = {};
    for (let id of team.memberIds) {
      const u = await fetch(`http://localhost:8080/api/auth/user/${id}`);
      const uData = await u.json();
      map[id] = uData.fullName;
    }
    setMembers(map);
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
    <div style={{ padding: 40 }}>
      <h1>Approve Payments</h1>

      <select
        style={styles.input}
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
        <p style={{ marginTop: 20, fontSize: 18 }}>No pending approvals.</p>
      )}

      {pending.map((ex) => (
        <div key={ex.id} style={styles.expBox}>
          <h3>
            {ex.description} — ₹{ex.amount}
          </h3>

          {ex.pendingShares.map((sh, i) => (
            <div key={i} style={styles.card}>
              <p>
                <b>{members[sh.userId] || "Loading..."}</b> needs approval
              </p>

              <p>Amount: ₹{sh.amount}</p>
              <p>Method: {sh.paymentMethod}</p>

              <button
                style={styles.approveBtn}
                onClick={() => handleAction(ex.id, sh.userId, "APPROVE")}
              >
                Approve
              </button>

              <button
                style={styles.rejectBtn}
                onClick={() => handleAction(ex.id, sh.userId, "REJECT")}
              >
                Reject
              </button>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

const styles = {
  input: {
    width: "300px",
    padding: "10px",
    marginBottom: "20px",
    borderRadius: "6px",
  },
  expBox: {
    background: "#f8f8f8",
    padding: "20px",
    borderRadius: "12px",
    marginBottom: "20px",
  },
  card: {
    background: "white",
    padding: "15px",
    marginTop: "10px",
    borderRadius: "10px",
    boxShadow: "0 0 6px rgba(0,0,0,0.1)",
  },
  approveBtn: {
    padding: "8px 12px",
    background: "green",
    color: "white",
    border: "none",
    borderRadius: "6px",
    marginRight: "10px",
    cursor: "pointer",
  },
  rejectBtn: {
    padding: "8px 12px",
    background: "red",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
};

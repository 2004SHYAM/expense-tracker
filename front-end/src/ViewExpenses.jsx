import React, { useEffect, useState } from "react";

export default function ViewExpenses() {
  const [teamId, setTeamId] = useState("");
  const [teams, setTeams] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [users, setUsers] = useState({});

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    const res = await fetch(`http://localhost:8080/api/team/my-teams/${userId}`);
    const data = await res.json();
    setTeams(data);
  };

  const loadExpenses = async (id) => {
    setTeamId(id);
    setExpenses([]);

    const res = await fetch(`http://localhost:8080/api/expenses/team/${id}`);
    const data = await res.json();
    setExpenses(data);

    // collect unique user ids
    const uniqueIds = new Set();
    data.forEach((ex) => {
      uniqueIds.add(ex.paidByUserId);
      ex.shares.forEach((s) => uniqueIds.add(s.userId));
    });

    for (const uid of uniqueIds) {
      if (users[uid]) continue;

      try {
        const r = await fetch(`http://localhost:8080/api/auth/user/${uid}`);

        if (r.ok) {
          const u = await r.json();
          const name = u.fullName || u.firstName || u.email || "User";
          setUsers((prev) => ({ ...prev, [uid]: name }));
        } else {
          setUsers((prev) => ({ ...prev, [uid]: "Unknown User" }));
        }
      } catch {
        setUsers((prev) => ({ ...prev, [uid]: "Error Loading" }));
      }
    }
  };

  return (
    <div className="ve-root">
      <style>{`
        :root {
          --glass: rgba(255,255,255,0.25);
          --glass-border: rgba(255,255,255,0.35);
          --text: #0b1220;
        }

        .dark-theme {
          --glass: rgba(18,22,30,0.35);
          --glass-border: rgba(255,255,255,0.1);
          --text: #f5f8ff;
        }

        .ve-root {
          min-height: 100vh;
          padding: 120px 20px 160px;
          background: linear-gradient(135deg, #ff7ce0, #7ea2ff, #5cf3ff);
          background-size: 300% 300%;
          animation: veAnim 12s ease infinite;
          font-family: Inter, sans-serif;
          color: var(--text);
        }

        @keyframes veAnim {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .ve-container {
          max-width: 900px;
          margin: auto;
          background: var(--glass);
          backdrop-filter: blur(20px) saturate(180%);
          border: 1px solid var(--glass-border);
          border-radius: 22px;
          padding: 30px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.25);
        }

        .ve-input {
          width: 100%;
          padding: 12px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.5);
          background: rgba(255,255,255,0.28);
          backdrop-filter: blur(12px);
          margin-bottom: 18px;
          font-size: 16px;
        }

        .expense-card {
          background: var(--glass);
          border: 1px solid var(--glass-border);
          backdrop-filter: blur(18px);
          padding: 18px;
          border-radius: 16px;
          margin-bottom: 18px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        }

        .share-item {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid rgba(255,255,255,0.3);
        }

        .status-paid { color: #00c853; font-weight: 700; }
        .status-await { color: #ff9800; font-weight: 700; }
        .status-pending { color: #ff1744; font-weight: 700; }

        @media(max-width:480px){
          .ve-container { padding: 20px; }
        }
      `}</style>

      <div className="ve-container">
        <h1 style={{ marginBottom: 20 }}>View Expenses</h1>

        <select
          className="ve-input"
          onChange={(e) => loadExpenses(e.target.value)}
        >
          <option value="">Select Team</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.teamName}
            </option>
          ))}
        </select>

        {expenses.map((ex) => (
          <div key={ex.id} className="expense-card">
            <h3>{ex.description}</h3>
            <p><b>Total:</b> ₹{ex.amount}</p>
            <p><b>Paid By:</b> {users[ex.paidByUserId] || "Loading..."}</p>
            <p><b>Date:</b> {new Date(ex.date).toLocaleString()}</p>

            <div style={{ marginTop: 10 }}>
              <b>Split Details:</b>
              {ex.shares.map((s, i) => (
                <div key={i} className="share-item">
                  <span>{users[s.userId] || "Loading..."}</span>
                  <span>₹{s.amount}</span>

                  {/* Correct Working Status Logic */}
                  <span
                    className={
                      s.status === "APPROVED"
                        ? "status-paid"
                        : s.status === "PENDING_UPI_APPROVAL" ||
                          s.status === "PENDING_CASH_APPROVAL"
                        ? "status-await"
                        : "status-pending"
                    }
                  >
                    {s.status === "APPROVED"
                      ? "Paid"
                      : s.status === "PENDING_UPI_APPROVAL" ||
                        s.status === "PENDING_CASH_APPROVAL"
                      ? "Awaiting Approval"
                      : "Pending"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

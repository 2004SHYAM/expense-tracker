import React, { useEffect, useState } from "react";

export default function ViewExpenses() {
  const [teamId, setTeamId] = useState("");
  const [teams, setTeams] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [users, setUsers] = useState({}); // Stores ID -> Name mapping

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/team/my-teams/${userId}`);
      const data = await res.json();
      setTeams(data);
    } catch (e) {
      console.error("Error loading teams", e);
    }
  };

  const loadExpenses = async (id) => {
    setTeamId(id);
    setExpenses([]); // Clear list momentarily

    try {
      const res = await fetch(`http://localhost:8080/api/expenses/team/${id}`);
      const data = await res.json();
      setExpenses(data);

      // 1. Collect all unique User IDs from these expenses
      const uniqueIds = new Set();
      data.forEach((ex) => {
        uniqueIds.add(ex.paidByUserId); // The Payer
        ex.shares.forEach((s) => uniqueIds.add(s.userId)); // The Splitters
      });

      // 2. Fetch details for each ID safely
      for (const uid of uniqueIds) {
        // If we already have this user in our list, skip fetching
        if (users[uid]) continue;

        try {
          const uRes = await fetch(`http://localhost:8080/api/auth/user/${uid}`);
          
          if (uRes.ok) {
            const user = await uRes.json();
            
            // Determine the best name to show
            const name = user.fullName || user.firstName || user.email || "Unknown";

            // Update state IMMEDIATELY for this user (Functional Update)
            setUsers((prev) => ({ ...prev, [uid]: name }));
          } else {
             // If API returns 404, mark as Unknown so it stops showing "Loading..."
             setUsers((prev) => ({ ...prev, [uid]: "Unknown User" }));
          }
        } catch (err) {
          console.error(`Failed to load user ${uid}`, err);
          setUsers((prev) => ({ ...prev, [uid]: "Error Loading" }));
        }
      }

    } catch (e) {
      console.error("Error loading expenses", e);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.box}>
        <h1>View Expenses</h1>

        {/* Team selection */}
        <select style={styles.input} onChange={(e) => loadExpenses(e.target.value)}>
          <option value="">Select Team</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.teamName}
            </option>
          ))}
        </select>

        {/* Expense list */}
        <div style={{ marginTop: "20px" }}>
          {expenses.map((ex) => (
            <div key={ex.id} style={styles.expenseCard}>
              <h3>{ex.description}</h3>
              <p><b>Total:</b> ₹{ex.amount}</p>
              
              {/* Show Payer Name */}
              <p>
                <b>Paid By: </b> 
                {users[ex.paidByUserId] || "Loading..."}
              </p>
              
              <p><b>Date:</b> {new Date(ex.date).toLocaleString()}</p>

              <div style={styles.sharesBox}>
                <b style={{display:'block', marginBottom: '5px'}}>Split Details:</b>
                {ex.shares.map((s, i) => (
                  <div key={i} style={styles.shareItem}>
                    {/* Show Member Name */}
                    <span style={{fontWeight: '500'}}>
                        {users[s.userId] || "Loading..."}
                    </span>
                    
                    <span>₹{s.amount}</span>
                    
                    <span style={{ color: s.paid ? "green" : "red", fontWeight: 'bold' }}>
                      {s.paid ? "Paid" : "Pending"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

const styles = {
  page: { padding: "40px", display: "flex", justifyContent: "center" },
  box: {
    width: "600px",
    background: "#f9f9f9",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 0 12px rgba(0,0,0,0.1)",
  },
  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "15px",
    borderRadius: "8px",
    border: "1px solid #ccc",
  },
  expenseCard: {
    background: "white",
    padding: "15px",
    borderRadius: "10px",
    marginBottom: "15px",
    boxShadow: "0 0 8px rgba(0,0,0,0.1)",
  },
  sharesBox: { 
    marginTop: "15px", 
    paddingTop: "10px",
    borderTop: "1px solid #eee"
  },
  shareItem: {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px 0",
    borderBottom: "1px solid #f0f0f0",
    fontSize: "14px"
  },
};
import React, { useEffect, useState } from "react";

export default function TeamSummary() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/team/my-teams/${userId}`);
      const data = await res.json();

      const fullData = [];

      for (const team of data) {
        // 1. Get Expense Summary
        const summaryRes = await fetch(
          `http://localhost:8080/api/expenses/summary/${team.id}`
        );
        const summaryRaw = await summaryRes.json();

        // 2. Get Members
        const memberArr = [];
        for (const m of team.memberIds) {
          const uRes = await fetch(`http://localhost:8080/api/auth/user/${m}`);
          const user = await uRes.json();

          // --- INTELLIGENT MATCHING LOGIC ---
          let amount = 0;
          
          // Prepare the user's data for matching
          const userEmail = user.email ? user.email.toLowerCase() : "";
          const userNameClean = user.fullName ? user.fullName.toLowerCase().replace(/\s+/g, '') : ""; 
          // ^ Converts "Jai Krishna" to "jaikrishna"

          // Iterate over every key in the summary to find a match
          const summaryKeys = Object.keys(summaryRaw);
          
          for (const key of summaryKeys) {
            const keyLower = key.toLowerCase();
            const amountVal = summaryRaw[key];

            // CHECK 1: Exact Email Match
            if (keyLower === userEmail) {
              amount = amountVal;
              break;
            }

            // CHECK 2: Name inside Email (Fuzzy Match)
            // Example: Matches member "Jai Krishna" to key "jaikrishna@gmail.com"
            if (userNameClean.length > 3 && keyLower.includes(userNameClean)) {
              amount = amountVal;
              break;
            }
            
            // CHECK 3: If the summary key IS the name (Exact name match ignoring spaces)
            // Example: Matches member "Rahul" to key "Rahul"
            if (keyLower.replace(/\s+/g, '') === userNameClean) {
              amount = amountVal;
              break;
            }
          }

          memberArr.push({
            name: user.fullName,
            amount: amount,
          });
        }

        fullData.push({
          ...team,
          members: memberArr,
        });
      }

      setTeams(fullData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <h2 style={{ padding: 20 }}>Loading…</h2>;

  return (
    <div style={{ padding: "40px" }}>
      <h1 style={{ fontSize: "36px", marginBottom: "20px" }}>My Team Summary</h1>

      {teams.map((team) => (
        <div key={team.id} style={styles.card}>
          <h2>{team.teamName}</h2>
          
          <h3 style={{ marginTop: "20px" }}>Members Status</h3>
          
          {team.members.map((member, i) => (
            <div key={i} style={styles.memberBox}>
              {/* Name */}
              <span style={{ fontWeight: "500" }}>{member.name}</span>

              {/* Amount */}
              <span
                style={{
                  fontWeight: "bold",
                  color: member.amount < 0 ? "red" : member.amount > 0 ? "green" : "black",
                }}
              >
                ₹{member.amount}
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

const styles = {
  card: {
    background: "#f6f6f6",
    padding: "25px",
    borderRadius: "12px",
    marginBottom: "30px",
    width: "600px",
    boxShadow: "0 0 10px rgba(0,0,0,0.15)",
  },
  memberBox: {
    padding: "15px",
    background: "white",
    borderRadius: "8px",
    marginBottom: "10px",
    fontSize: "18px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
};
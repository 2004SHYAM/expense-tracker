import React, { useEffect, useState } from "react";

export default function TeamSummary() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    loadTeams();

    // inject CSS only once
    const styleTag = document.getElementById("team-summary-style");
    if (!styleTag) {
      const tag = document.createElement("style");
      tag.id = "team-summary-style";
      tag.innerHTML = cssStyles;
      document.head.appendChild(tag);
    }
  }, []);

  // ============================================
  // LOAD ALL TEAMS + MEMBERS + SUMMARY
  // ============================================
  const loadTeams = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/team/my-teams/${userId}`);
      const data = await res.json();

      const fullData = [];

      for (const team of data) {
        // 1) Expense summary
        const summaryRes = await fetch(
          `http://localhost:8080/api/expenses/summary/${team.id}`
        );
        const summaryRaw = await summaryRes.json();

        // 2) Fetch all members using the correct API
        const memRes = await fetch(
          `http://localhost:8080/api/team/members/${team.id}`
        );
        const members = await memRes.json();

        // 3) Build final member array
        const memberArr = members.map((user) => {
          let amount = 0;

          const email = user.email?.toLowerCase() || "";
          const nameClean =
            user.fullName?.toLowerCase().replace(/\s+/g, "") || "";

          for (const key of Object.keys(summaryRaw)) {
            const low = key.toLowerCase();

            if (low === email) amount = summaryRaw[key];
            else if (nameClean.length > 3 && low.includes(nameClean))
              amount = summaryRaw[key];
            else if (low.replace(/\s+/g, "") === nameClean)
              amount = summaryRaw[key];
          }

          return {
            name: user.fullName || user.name || "Unknown User",
            amount,
          };
        });

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

  if (loading)
    return (
      <div className="home-root">
        <h2>Loading…</h2>
      </div>
    );

  return (
    <div className="home-root">
      <h1 className="page-title">My Team Summary</h1>

      <div className="summary-grid">
        {teams.map((team) => (
          <div key={team.id} className="glass-box team-card">
            <h2 className="team-title">{team.teamName}</h2>

            <h3 className="sub-title">Members Status</h3>

            {team.members.map((member, index) => (
              <div key={index} className="glass-box member-box">
                <span className="member-name">{member.name}</span>

                <span
                  className="member-amount"
                  style={{
                    color:
                      member.amount < 0
                        ? "#ff3b30"
                        : member.amount > 0
                        ? "#2ecc71"
                        : "var(--text)",
                  }}
                >
                  ₹{member.amount}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ==========================================================
   FULL CSS (HOME PAGE THEME) — AUTOMATICALLY INJECTED
   ========================================================== */
const cssStyles = `
:root {
  --glass: rgba(255,255,255,0.25);
  --glass-border: rgba(255,255,255,0.35);
  --text: #0b1220;
  --muted: rgba(0,0,0,0.55);
}

.home-root {
  min-height: 100vh;
  width: 100%;
  padding: 24px;
  padding-top: 110px;
  padding-bottom: 140px;

  background: linear-gradient(135deg, #ff7ce0, #7ea2ff, #5cf3ff);
  background-size: 300% 300%;
  animation: moveBg 12s ease infinite;

  font-family: "Inter", sans-serif;
  color: var(--text);
}

@keyframes moveBg {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.page-title {
  font-size: 34px;
  font-weight: 700;
  margin-bottom: 20px;
}

.summary-grid {
  display: grid;
  gap: 22px;
}

.glass-box {
  background: var(--glass);
  backdrop-filter: blur(20px) saturate(160%);
  border: 1px solid var(--glass-border);
  border-radius: 22px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.25);
  padding: 22px;
}

.team-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.team-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text);
}

.sub-title {
  margin-top: 8px;
  margin-bottom: 4px;
  font-size: 17px;
  font-weight: 600;
  color: var(--muted);
}

/* FIX FOR NAMES NOT SHOWING */
.member-box {
  padding: 14px 16px;
  border-radius: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--text) !important;
}

.member-name {
  font-weight: 600;
  color: var(--text) !important;
}

.member-amount {
  font-weight: 700;
}
`;

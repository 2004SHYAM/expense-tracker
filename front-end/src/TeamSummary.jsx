import React, { useEffect, useState } from "react";

export default function TeamSummary() {
  const [summary, setSummary] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    try {
      // ---------- 1. Fetch Team Summary ----------
      const sumRes = await fetch(
        `http://localhost:8080/api/team/user/${userId}/expenses`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const sumData = await sumRes.json();
      if (!sumData || sumData.length === 0) return;

      setSummary(sumData[0]);

      // ---------- 2. Fetch Team Members ----------
      const teamId = sumData[0].id;
      const teamRes = await fetch(`http://localhost:8080/api/team/${teamId}`);
      const teamData = await teamRes.json();

      const membersDetailed = [];

      for (const memberId of teamData.memberIds) {
        const userRes = await fetch(
          `http://localhost:8080/api/auth/user/${memberId}`
        );
        const userDetails = await userRes.json();
        membersDetailed.push(userDetails.fullName);
      }

      setMembers(membersDetailed);
    } catch (e) {
      console.error("Error loading summary:", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !summary) {
    return <h2 style={{ padding: 30 }}>Loading Summary...</h2>;
  }

  return (
    <div style={styles.page}>
      <div style={styles.mainBox}>
        <h1 style={styles.title}>My Team Summary</h1>

        {/* Unified Box */}
        <div style={styles.summaryBox}>
          <p><b>Team:</b> {summary.teamName}</p>
          <p><b>User:</b> {summary.userName}</p>

          <p style={{ fontWeight: "bold", color: "red" }}>
            Need To Pay: ₹{summary.needToPay}
          </p>

          <p style={{ fontWeight: "bold", color: "green" }}>
            Need To Get: ₹{summary.needToGet}
          </p>

          {/* Team Members Section */}
          <h2 style={styles.subHeading}>Team Members</h2>

          <div style={styles.membersRow}>
            {members.map((m, idx) => (
              <div key={idx} style={styles.memberCard}>
                {m}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    padding: "40px",
    display: "flex",
    justifyContent: "center",
  },

  mainBox: {
    width: "90%",
    maxWidth: "900px",
  },

  title: {
    fontSize: "36px",
    fontWeight: "bold",
    marginBottom: "20px",
  },

  summaryBox: {
    background: "#f5f5f5",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 0 12px rgba(0,0,0,0.1)",
  },

  subHeading: {
    fontSize: "22px",
    marginTop: "25px",
    marginBottom: "15px",
  },

  membersRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "20px",
  },

  memberCard: {
    background: "white",
    padding: "15px",
    width: "200px",
    borderRadius: "10px",
    boxShadow: "0 0 5px rgba(0,0,0,0.1)",
    fontWeight: "bold",
    textAlign: "center",
  },
};

import React, { useEffect, useState } from "react";

export default function Teams() {
  const [teams, setTeams] = useState([]);
  const [qrTeam, setQrTeam] = useState(null); // Holds selected team data
  const [loading, setLoading] = useState(true);

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/team/my-teams/${userId}`);
      const data = await res.json();

      if (Array.isArray(data)) setTeams(data);
    } catch (err) {
      console.log("Error loading teams", err);
    } finally {
      setLoading(false);
    }
  };

  // Open QR drawer + load members
  const openQR = async (team) => {
    try {
      // FETCH MEMBERS
      const mRes = await fetch(`http://localhost:8080/api/team/members/${team.id}`);
      const users = await mRes.json();

      setQrTeam({
        teamName: team.teamName,
        teamId: team.id,
        qrUrl: `http://localhost:8080/api/team/team/${team.id}/qr`,
        members: Array.isArray(users) ? users.map((u) => u.fullName || u.email) : []
      });
    } catch (err) {
      console.log("Error loading team members", err);
    }
  };

  const closeQR = () => setQrTeam(null);

  if (loading) return <h2 style={{ padding: 20 }}>Loading teams…</h2>;

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>My Teams</h1>

      <div style={styles.list}>
        {teams.map((team) => (
          <div key={team.id} style={styles.teamBox}>
            <p style={styles.teamName}>{team.teamName}</p>

            <button style={styles.qrButton} onClick={() => openQR(team)}>
              View QR Code
            </button>
          </div>
        ))}
      </div>

      {/* ===== QR Drawer + Members ===== */}
      {qrTeam && (
        <div style={styles.qrOverlay}>
          <div style={styles.qrPanel}>

            {/* HEADER */}
            <div style={styles.qrHeader}>
              <h3 style={{ margin: 0 }}>{qrTeam.teamName} — QR Code</h3>
              <button style={styles.closeX} onClick={closeQR}>✕</button>
            </div>

            {/* QR Image */}
            <img src={qrTeam.qrUrl} alt="QR Code" style={styles.qrImage} />

            <p style={{ textAlign: "center", marginTop: 10 }}>
              Scan to join this team
            </p>

            {/* MEMBERS */}
            <div style={styles.memberSection}>
              <h4 style={{ marginBottom: 10 }}>Members</h4>

              {qrTeam.members.length === 0 && (
                <p style={{ opacity: 0.6 }}>No members found</p>
              )}

              {qrTeam.members.map((name, i) => (
                <div key={i} style={styles.memberItem}>
                  <div style={styles.avatarCircle}>
                    {name.charAt(0).toUpperCase()}
                  </div>
                  <span>{name}</span>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

/* ====================== STYLES ====================== */

const styles = {
  page: {
    padding: "40px",
    minHeight: "100vh",
    background: "linear-gradient(135deg, #89f7fe, #66a6ff)",
  },

  title: {
    fontSize: "36px",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: "30px",
    color: "#0b1220",
  },

  list: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    width: "100%",
    maxWidth: "650px",
    margin: "0 auto",
  },

  teamBox: {
    background: "rgba(255,255,255,0.35)",
    backdropFilter: "blur(20px)",
    borderRadius: "20px",
    padding: "25px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  teamName: {
    fontSize: "22px",
    fontWeight: "700",
  },

  qrButton: {
    padding: "10px 18px",
    borderRadius: "10px",
    background: "#2d7dff",
    color: "white",
    border: "none",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "bold",
  },

  /* ===== QR Overlay Drawer ===== */

  qrOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.35)",
    backdropFilter: "blur(6px)",
    display: "flex",
    justifyContent: "flex-end",
    zIndex: 9999,
  },

  qrPanel: {
    width: "380px",
    height: "100vh",
    background: "white",
    padding: "25px",
    boxShadow: "-6px 0 20px rgba(0,0,0,0.2)",
    overflowY: "auto",
    animation: "slideIn 0.35s ease-out",
  },

  qrHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
  },

  closeX: {
    background: "transparent",
    border: "none",
    fontSize: "28px",
    cursor: "pointer",
  },

  qrImage: {
    width: "250px",
    height: "250px",
    border: "1px solid #eee",
    borderRadius: "12px",
    display: "block",
    margin: "0 auto",
  },

  memberSection: {
    marginTop: "25px",
    padding: "15px",
    background: "#f7f9ff",
    borderRadius: "12px",
    border: "1px solid #e2e4ff",
  },

  memberItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "12px",
  },

  avatarCircle: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    background: "#4a65ff",
    color: "white",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "16px",
    fontWeight: "bold",
  },
};

import React, { useEffect, useState } from "react";

export default function Teams() {
  const [teams, setTeams] = useState([]);
  const [hoverMembers, setHoverMembers] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(true);

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/team/my-teams/${userId}`);
      const data = await res.json();
      setTeams(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadMembers = async (teamId) => {
    try {
      const res = await fetch(`http://localhost:8080/api/team/${teamId}`);
      const team = await res.json();

      const members = [];
      for (const mId of team.memberIds) {
        const uRes = await fetch(`http://localhost:8080/api/auth/user/${mId}`);
        const user = await uRes.json();
        members.push(user.fullName);
      }

      setHoverMembers(members);
    } catch (err) {
      console.error(err);
    }
  };

  const showQR = (teamId) => {
    setQrCode(`http://localhost:8080/api/team/team/${teamId}/qr`);
  };

  const closeQR = () => setQrCode(null);

  if (loading) return <h2 style={{ padding: 20 }}>Loading Teams…</h2>;

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>My Teams</h1>

      <div style={styles.list}>
        {teams.map((team) => (
          <div
            key={team.joinCode}
            style={styles.teamBox}
            onMouseEnter={() => loadMembers(team.id)}
            onMouseLeave={() => setHoverMembers(null)}
          >
            <p style={styles.teamName}>{team.teamName}</p>

            <button style={styles.qrButton} onClick={() => showQR(team.joinCode)}>
              View QR Code
            </button>

            {hoverMembers && (
              <div style={styles.popup}>
                <b>Team Members</b>
                {hoverMembers.map((name, i) => (
                  <p key={i}>{name}</p>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal for QR Code */}
      {qrCode && (
  <div style={styles.qrPanel}>
    <div style={styles.qrHeader}>
      <h3 style={{ margin: 0 }}>Team QR Code</h3>
      <button style={styles.closeX} onClick={closeQR}>✕</button>
    </div>

    <img src={qrCode} alt="QR Code" style={styles.qrImage} />

    <p style={{ textAlign: "right", marginTop: "10px" }}>
      Scan to join this team
    </p>
  </div>
)}

    </div>
  );
}

const styles = {
  page: { padding: "40px" },
  title: { fontSize: "34px", fontWeight: "bold", marginBottom: "30px" },

  list: { display: "flex", flexDirection: "column", gap: "20px", width: "450px" },

  teamBox: {
    background: "#f5f5f5",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 0 8px rgba(0,0,0,0.1)",
    cursor: "pointer",
    position: "relative",
  },

  teamName: { fontSize: "22px", fontWeight: "bold", marginBottom: "10px" },

  qrButton: {
    padding: "8px 14px",
    borderRadius: "6px",
    background: "#007bff",
    color: "white",
    border: "none",
    cursor: "pointer",
    float: "right",
  },

  popup: {
    position: "absolute",
    top: "70px",
    left: "0",
    background: "white",
    padding: "15px",
    borderRadius: "8px",
    boxShadow: "0 0 12px rgba(0,0,0,0.2)",
    width: "220px",
    zIndex: 100,
  },

  modalOverlay: {
    position: "fixed",
    top: 0, left: 0, right: 0, bottom: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  modalBox: {
    background: "white",
    padding: "20px",
    borderRadius: "12px",
    textAlign: "center",
    width: "300px",
  },

  closeButton: {
    marginTop: "15px",
    padding: "8px 14px",
    borderRadius: "6px",
    background: "red",
    color: "white",
    border: "none",
    cursor: "pointer",
  },
  qrPanel: {
  position: "fixed",
  top: 0,
  right: 0,
  height: "100vh",
  width: "330px",
  background: "white",
  boxShadow: "-4px 0 12px rgba(0,0,0,0.2)",
  padding: "20px",
  zIndex: 9999,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  animation: "slideIn 0.3s ease-out",
},

qrHeader: {
  width: "100%",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "15px",
},

closeX: {
  background: "transparent",
  border: "none",
  fontSize: "24px",
  cursor: "pointer",
},

qrImage: {
  width: "260px",
  height: "260px",
  border: "1px solid #ddd",
  borderRadius: "10px",
}

};

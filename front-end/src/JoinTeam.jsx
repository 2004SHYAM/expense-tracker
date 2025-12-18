import React, { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function JoinTeam() {
  const [joinCode, setJoinCode] = useState("");
  const [message, setMessage] = useState("");
  const [showScanner, setShowScanner] = useState(false);

  const email = localStorage.getItem("email");

  const joinTeam = async (code) => {
    if (!code) {
      setMessage("Enter a valid join code");
      return;
    }

    const url = `http://localhost:8080/api/team/join?joinCode=${code}&email=${email}`;
    const res = await fetch(url, { method: "POST" });

    const data = await res.text();
    setMessage(res.ok ? "Joined Successfully!" : data);
  };

  useEffect(() => {
    if (!showScanner) return;

    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: 250 },
      false
    );

    scanner.render(
      (decodedText) => {
        const parts = decodedText.split("/").filter(x => x.trim() !== "");
        const scannedCode = parts[parts.length - 1];

        setShowScanner(false);
        joinTeam(scannedCode);

        scanner.clear();
      },
      () => {}
    );

    return () => scanner.clear();
  }, [showScanner]);

  return (
    <div style={styles.page}>
      <style>{`
        :root {
          --glass: rgba(255, 255, 255, 0.25);
          --glass-border: rgba(255, 255, 255, 0.35);
          --text: #0b1220;
        }

        .dark-theme {
          --glass: rgba(18, 22, 30, 0.35);
          --glass-border: rgba(255,255,255,0.1);
          --text: #f5f8ff;
        }
      `}</style>

      <div style={styles.box}>
        <h1 style={styles.title}>Join Team</h1>

        <input
          type="text"
          placeholder="Enter Join Code"
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value)}
          style={styles.input}
        />

        <button style={styles.btn} onClick={() => joinTeam(joinCode)}>
          Join Team
        </button>

        <button style={styles.camBtn} onClick={() => setShowScanner(true)}>
          Scan QR Code
        </button>

        {message && <p style={styles.msg}>{message}</p>}

        {showScanner && (
          <div style={styles.overlay}>
            <div style={styles.scannerBox}>
              <h2>Scan QR Code</h2>

              <div id="qr-reader" style={{ width: "260px", margin: "10px auto" }}></div>

              <button style={styles.closeBtn} onClick={() => setShowScanner(false)}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
    background:
      "linear-gradient(135deg, #7ea2ff, #ff7ce0, #5cf3ff, #9aff8a)",
    backgroundSize: "300% 300%",
    animation: "moveBg 10s ease infinite",
  },

  box: {
    width: "95%",
    maxWidth: "420px",
    padding: "28px",
    background: "var(--glass)",
    backdropFilter: "blur(20px) saturate(180%)",
    border: "1px solid var(--glass-border)",
    borderRadius: "18px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
    textAlign: "center",
    animation: "fadeIn 0.4s ease",
  },

  title: {
    fontSize: "26px",
    color: "var(--text)",
    marginBottom: "20px",
    fontWeight: 700,
  },

  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "15px",
    borderRadius: "12px",
    border: "1px solid var(--glass-border)",
    background: "rgba(255,255,255,0.3)",
    color: "var(--text)",
    fontSize: "16px",
  },

  btn: {
    width: "100%",
    padding: "12px",
    background: "#2563eb",
    color: "white",
    borderRadius: "12px",
    border: "none",
    marginBottom: "15px",
    fontSize: "16px",
    cursor: "pointer",
    transition: "0.2s",
  },

  camBtn: {
    width: "100%",
    padding: "12px",
    background: "#10b981",
    color: "white",
    borderRadius: "12px",
    border: "none",
    marginBottom: "10px",
    fontSize: "16px",
    cursor: "pointer",
  },

  msg: {
    marginTop: "15px",
    fontWeight: 600,
    color: "var(--text)",
  },

  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.55)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backdropFilter: "blur(4px)",
    zIndex: 999,
  },

  scannerBox: {
    background: "white",
    padding: "20px",
    borderRadius: "16px",
    width: "90%",
    maxWidth: "340px",
    textAlign: "center",
    boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
  },

  closeBtn: {
    marginTop: "12px",
    padding: "10px 20px",
    background: "crimson",
    color: "white",
    borderRadius: "10px",
    fontWeight: "600",
    cursor: "pointer",
  },
};

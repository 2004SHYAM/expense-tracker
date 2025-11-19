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


  // Initialize scanner only when showScanner = true
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

      console.log("JOIN CODE:", scannedCode);

      setShowScanner(false);
      joinTeam(scannedCode);

      scanner.clear();
    },
    (err) => {}
  );

  return () => {
    scanner.clear();
  };
}, [showScanner]);


  return (
    <div style={styles.page}>
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
          Open Camera & Scan QR
        </button>

        {message && <p style={styles.msg}>{message}</p>}

        {showScanner && (
          <div style={styles.overlay}>
            <div style={styles.scannerBox}>
              <h2>Scan QR Code</h2>

              <div
                id="qr-reader"
                style={{ width: "300px", margin: "10px auto" }}
              ></div>

              <button
                style={styles.closeBtn}
                onClick={() => setShowScanner(false)}
              >
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
  page: { padding: "40px", display: "flex", justifyContent: "center" },
  box: {
    width: "400px",
    background: "#f7f7f7",
    padding: "30px",
    borderRadius: "12px",
  },
  title: { fontSize: "28px", marginBottom: "20px" },
  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "15px",
    borderRadius: "8px",
    border: "1px solid #ccc",
  },
  btn: {
    width: "100%",
    padding: "12px",
    background: "#007bff",
    color: "#fff",
    borderRadius: "8px",
    marginBottom: "15px",
  },
  camBtn: {
    width: "100%",
    padding: "12px",
    background: "green",
    color: "white",
    borderRadius: "8px",
  },
  msg: { marginTop: "15px", fontWeight: "bold" },

  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  scannerBox: {
    background: "white",
    padding: "20px",
    borderRadius: "10px",
    textAlign: "center",
  },

  closeBtn: {
    marginTop: "10px",
    background: "red",
    padding: "10px 20px",
    color: "white",
    borderRadius: "6px",
  },
};

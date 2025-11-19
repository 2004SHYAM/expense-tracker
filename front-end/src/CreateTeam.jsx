import React, { useState } from "react";

export default function CreateTeam() {
  const [teamName, setTeamName] = useState("");
  const [result, setResult] = useState(null);

  const email = localStorage.getItem("email");

  const createTeam = async (e) => {
    e.preventDefault();

    const res = await fetch("http://localhost:8080/api/team/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamName, email })
    });

    const data = await res.text();
    console.log("Server Response:", data); 
    // Extract joinCode + base64 QR from returned text
    const joinCode = data.match(/Join Code: (\w+)/)?.[1];
    const base64 = data.match(/QR Base64: ([A-Za-z0-9+/=]+)/)?.[1];

    setResult({
      joinCode: joinCode || "",
      qr: base64 || "",
    });
  };

  return (
    <div style={styles.page}>
      <div style={styles.box}>
        <h1>Create Team</h1>

        <form onSubmit={createTeam} style={styles.form}>
          <input
            type="text"
            placeholder="Enter Team Name"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            style={styles.input}
            required
          />

          <button style={styles.btn}>Create Team</button>
        </form>

        {result && (
          <div style={styles.resultBox}>
            <h2>Team Created Successfully</h2>

            <p><b>Join Code:</b> {result.joinCode}</p>

            {result.qr && (
              <>
                <p><b>QR Code:</b></p>
                <img
                  src={`data:image/png;base64,${result.qr}`}
                  alt="QR Code"
                  style={{ width: "200px", marginTop: "10px" }}
                />
              </>
            )}
          </div>
        )}
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
  box: {
    width: "90%",
    maxWidth: "500px",
    background: "#f9f9f9",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 0 12px rgba(0,0,0,0.1)",
  },
  form: { marginTop: "20px" },
  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "15px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "16px",
  },
  btn: {
    width: "100%",
    padding: "12px",
    background: "#007bff",
    color: "white",
    borderRadius: "8px",
    border: "none",
    fontSize: "16px",
    cursor: "pointer",
  },
  resultBox: {
    marginTop: "25px",
    padding: "20px",
    background: "white",
    borderRadius: "10px",
    boxShadow: "0 0 8px rgba(0,0,0,0.1)",
  },
};

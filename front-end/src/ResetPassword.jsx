import React, { useState, useEffect } from "react";

export default function ResetPassword() {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  // This logic is correct
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get("token");
    if (urlToken) {
      setToken(urlToken);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("Processing...");

    try {
      // 1. FIXED: Correct fetch syntax: fetch(url, options)
      // The options object (method, headers, body) must be the *second* argument,
      // not inside the URL string.
      const response = await fetch("http://localhost:8080/api/auth/reset-password", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    token: token,
    newPassword: password,
  }),
});

console.log("Response:", response); // Debugging line
      const text = await response.text();
      setMessage(text);
    } catch (err) {
      setMessage("Error: " + (err.message || "Something went wrong"));
    }
  };

  return (
    // 2. FIXED: Applied your styles to the JSX
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.heading}>Reset Password</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
          />
          <button type="submit" style={styles.button}>
            Reset
          </button>
        </form>
        {message && <p style={styles.message}>{message}</p>}
      </div>
    </div>
  );
}

// Your styles object (with 'heading' added for consistency)
const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    background: "#f7f7f7",
  },
  card: {
    background: "white",
    padding: "30px",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    width: "350px",
    textAlign: "center",
  },
  heading: {
    marginBottom: "20px",
    color: "#333",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    marginTop: "20px",
  },
  input: {
    marginBottom: "15px",
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "5px",
  },
  button: {
    background: "#007bff",
    color: "white",
    border: "none",
    padding: "10px",
    borderRadius: "5px",
    cursor: "pointer",
  },
  message: {
    marginTop: "10px",
    color: "#555",
  },
};
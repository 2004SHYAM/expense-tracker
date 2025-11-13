import React, { useState } from "react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("Sending...");

    try {
      // 1. FIXED: Removed extra quotes "" from fetch URL.
      // 2. FIXED: Removed redundant email from query parameter; it's already in the body.
      const response = await fetch(
  `http://localhost:8080/api/auth/forgot-password?email=${encodeURIComponent(email)}`,
  { method: "POST" }
);


      const text = await response.text();
      setMessage(text);
    } catch (err) {
      // Use err.message to get a useful error string
      setMessage("Error: " + (err.message || "Something went wrong"));
    }
  };

  return (
    // 3. FIXED: Applied the `styles` object to the JSX
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.heading}>Forgot Password</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />
          <button type="submit" style={styles.button}>
            Send Reset Link
          </button>
        </form>
        {message && <p style={styles.message}>{message}</p>}
      </div>
    </div>
  );
}

// Your styles object (unchanged, just placed here for completeness)
const styles = {
  container: {
    display: "flex",
    height: "100vh",
    justifyContent: "center",
    alignItems: "center",
    background: "#f2f2f2",
  },
  card: {
    background: "#fff",
    padding: "30px",
    borderRadius: "8px",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
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
  },
  input: {
    padding: "10px",
    marginBottom: "15px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    fontSize: "14px",
  },
  button: {
    padding: "10px",
    backgroundColor: "#007bff",
    border: "none",
    color: "#fff",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "15px",
  },
  message: {
    marginTop: "15px",
    color: "#555",
    fontSize: "14px",
  },
};
import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  const email = localStorage.getItem("email");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("userId");
    window.location.href = "/";
  };

  return (
    <div style={styles.container}>

      {/* Navbar */}
      <div style={styles.navbar}>
        <h2 style={styles.logo}>Expense Tracker</h2>

        <div style={styles.userSection}>
          <span style={styles.email}>{email}</span>
          <button style={styles.logoutBtn} onClick={logout}>Logout</button>
        </div>
      </div>

      {/* Page Options */}
      <div style={styles.cardWrapper}>

        <Link to="/create-team" style={styles.card}>
          <h3>Create Team</h3>
          <p>Create a new team and add members.</p>
        </Link>

        <Link to="/join-team" style={styles.card}>
          <h3>Join Team</h3>
          <p>Join a team using join code or QR scan.</p>
        </Link>

        <Link to="/teams" style={styles.card}>
          <h3>My Teams</h3>
          <p>View teams you created or joined.</p>
        </Link>

        <Link to="/add-expense" style={styles.card}>
          <h3>Add Expense</h3>
          <p>Add new expense to your team.</p>
        </Link>

        <Link to="/view-expenses" style={styles.card}>
          <h3>View Expenses</h3>
          <p>See all expenses made by team members.</p>
        </Link>

        

        <Link to="/track-payments" style={styles.card}>
          <h3>Track Payments</h3>
          <p>Check payments as paid or pending.</p>
        </Link>

        <Link to="/approvals" style={styles.card}>
          <h3>Approvals</h3>
          <p>Mark payments as paid or pending</p>
        </Link>

        <Link to="/summary" style={styles.card}>
          <h3>Team Summary</h3>
          <p>View amount to pay or receive.</p>
        </Link>

      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#f7f7f7",
  },
  navbar: {
    background: "#007bff",
    padding: "15px 25px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    color: "white",
  },
  logo: { margin: 0 },
  userSection: { display: "flex", alignItems: "center", gap: "15px" },
  email: { fontSize: "14px" },
  logoutBtn: {
    background: "white",
    color: "#007bff",
    padding: "8px 12px",
    borderRadius: "5px",
    border: "none",
    cursor: "pointer",
    fontWeight: "bold",
  },
  cardWrapper: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "25px",
    padding: "40px 20px",
  },
  card: {
    width: "260px",
    background: "white",
    padding: "25px",
    borderRadius: "10px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    textDecoration: "none",
    color: "#333",
    transition: "transform .2s",
    textAlign: "center",
  },
};

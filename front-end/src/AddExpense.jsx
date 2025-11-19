import React, { useEffect, useState } from "react";

export default function AddExpense() {
  const [teamId, setTeamId] = useState("");
  const [teams, setTeams] = useState([]);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    const res = await fetch(`http://localhost:8080/api/team/my-teams/${userId}`);
    const data = await res.json();
    setTeams(data);
  };

  const addExpense = async () => {
    if (!teamId || !amount) {
      setMessage("Enter all fields");
      return;
    }

    const payload = {
      teamId,
      getPaidByUserId: userId,
      amount,
      description,
    };

    const res = await fetch("http://localhost:8080/api/expenses/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    setMessage(data.message);
  };

  return (
    <div style={styles.page}>
      <div style={styles.box}>
        <h1>Add Expense</h1>

        <select style={styles.input} onChange={(e) => setTeamId(e.target.value)}>
          <option>Select Team</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.teamName}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Amount"
          style={styles.input}
          onChange={(e) => setAmount(e.target.value)}
        />

        <input
          type="text"
          placeholder="Description"
          style={styles.input}
          onChange={(e) => setDescription(e.target.value)}
        />

        <button style={styles.btn} onClick={addExpense}>
          Add Expense
        </button>

        {message && <p style={styles.msg}>{message}</p>}
      </div>
    </div>
  );
}

const styles = {
  page: { padding: "40px", display: "flex", justifyContent: "center" },
  box: {
    width: "400px",
    background: "#f8f8f8",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
  },
  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "12px",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },
  btn: {
    width: "100%",
    padding: "12px",
    background: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "6px",
  },
  msg: { marginTop: "10px", fontWeight: "bold" },
};

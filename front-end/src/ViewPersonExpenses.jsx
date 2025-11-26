import React, { useEffect, useState } from "react";

export default function ViewPersonExpenses() {
  const [teams, setTeams] = useState([]);
  const [members, setMembers] = useState([]);
  const [expenses, setExpenses] = useState([]);

  const [selectedTeam, setSelectedTeam] = useState("");
  const [selectedUser, setSelectedUser] = useState("");

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    const res = await fetch(`http://localhost:8080/api/team/my-teams/${userId}`);
    const data = await res.json();
    setTeams(data);
  };

  const loadMembers = async (teamId) => {
    setMembers([]);
    setExpenses([]);

    const res = await fetch(`http://localhost:8080/api/team/${teamId}`);
    const teamData = await res.json();

    const list = [];

    for (const mId of teamData.memberIds) {
      const uRes = await fetch(`http://localhost:8080/api/auth/user/${mId}`);
      const userData = await uRes.json();

      if (userData && userData.firstName) {
        list.push({
          id: mId,
          fullName: `${userData.firstName} ${userData.lastName}`,
        });
      }
    }

    setMembers(list);
  };

  const loadUserExpenses = async (teamId, userId) => {
    if (!teamId || !userId) return;
    const res = await fetch(
      `http://localhost:8080/api/expenses/team/${teamId}/user/${userId}`
    );
    const data = await res.json();
    setExpenses(data);
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>View Person Wise Expenses</h1>

      {/* Team Dropdown */}
      <select
        style={styles.input}
        onChange={(e) => {
          setSelectedTeam(e.target.value);
          loadMembers(e.target.value);
        }}
      >
        <option value="">Select Team</option>
        {teams.map((t) => (
          <option key={t.id} value={t.id}>
            {t.teamName}
          </option>
        ))}
      </select>

      {/* Members Dropdown */}
      {members.length > 0 && (
        <select
          style={styles.input}
          onChange={(e) => {
            setSelectedUser(e.target.value);
            loadUserExpenses(selectedTeam, e.target.value);
          }}
        >
          <option value="">Select Person</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.fullName}
            </option>
          ))}
        </select>
      )}

      {/* Expenses List */}
      {expenses.length > 0 && (
        <table style={styles.table}>
          <thead>
            <tr>
              <th>Description</th>
              <th>Amount</th>
              <th>Date</th>
            </tr>
          </thead>

          <tbody>
            {expenses.map((ex) => (
              <tr key={ex.id}>
                <td>{ex.description}</td>
                <td>₹{ex.amount}</td>
                <td>{new Date(ex.date).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const styles = {
  input: {
    width: "300px",
    padding: "10px",
    marginBottom: "20px",
    borderRadius: "6px",
    border: "1px solid gray",
    display: "block",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "20px",
    background: "#fff",
  },
};

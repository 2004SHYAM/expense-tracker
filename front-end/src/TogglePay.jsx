import React, { useEffect, useState } from "react";

export default function TogglePay() {
  const [teams, setTeams] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [members, setMembers] = useState({});
  const [teamId, setTeamId] = useState("");
  const [selectedExpense, setSelectedExpense] = useState(null);

  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [uploadImage, setUploadImage] = useState(null);

  const userId = localStorage.getItem("userId");

  // -----------------------------------------
  // Load teams on mount
  // -----------------------------------------
  useEffect(() => {
    loadTeams();
  }, []);

  // -----------------------------------------
  // Listen for updates from approvals page
  // -----------------------------------------
  useEffect(() => {
    const handler = () => {
      if (teamId) loadExpenses(teamId);
    };

    document.addEventListener("expenses-updated", handler);
    return () => document.removeEventListener("expenses-updated", handler);
  }, [teamId]);

  // -----------------------------------------
  // Fetch teams
  // -----------------------------------------
  const loadTeams = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/team/my-teams/${userId}`);
      setTeams(await res.json());
    } catch (e) {
      console.error("Error loading teams", e);
    }
  };

  // -----------------------------------------
  // Fetch members
  // -----------------------------------------
  const loadMembers = async (tid) => {
    try {
      const res = await fetch(`http://localhost:8080/api/team/${tid}`);
      const team = await res.json();

      const map = {};
      for (let id of team.memberIds) {
        const u = await fetch(`http://localhost:8080/api/auth/user/${id}`);
        const user = await u.json();
        map[id] = user.fullName;
      }

      setMembers(map);
    } catch (e) {
      console.error("Error loading members", e);
    }
  };

  // -----------------------------------------
  // Fetch expenses
  // -----------------------------------------
  const loadExpenses = async (tid) => {
  try {
    const res = await fetch(`http://localhost:8080/api/expenses/team/${tid}`);
    const data = await res.json();
    console.log("Loaded expenses", data); // <-- add this temporarily
    setExpenses(data);
  } catch (e) { console.error(e); }
};


  // -----------------------------------------
  // SUBMIT PAYMENT
  // -----------------------------------------
  const handlePaySubmit = async () => {
    try {
      const body = {
        expenseId: selectedExpense.id,
        userId,
        paymentMethod,
      };

      if (paymentMethod === "UPI" && uploadImage) {
        const base64 = await toBase64(uploadImage);
        body.proofImage = base64;
      }

      await fetch("http://localhost:8080/api/expenses/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      setSelectedExpense(null);
      setUploadImage(null);

      await loadExpenses(teamId);
    } catch (e) {
      console.error("Payment error", e);
    }
  };

  // -----------------------------------------
  // Convert UPI screenshot to Base64
  // -----------------------------------------
  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  // -----------------------------------------
  // UI Rendering
  // -----------------------------------------
  return (
    <div style={{ padding: 40 }}>
      <h1>Toggle Payment</h1>

      {/* TEAM DROPDOWN */}
      <select
        style={{ padding: 10, width: 300 }}
        onChange={(e) => {
          const tid = e.target.value;
          setTeamId(tid);
          if (tid) {
            loadMembers(tid);
            loadExpenses(tid);
          }
        }}
      >
        <option>Select Team</option>
        {teams.map((t) => (
          <option key={t.id} value={t.id}>
            {t.teamName}
          </option>
        ))}
      </select>

      {/* EXPENSE CARDS */}
      {expenses.map((ex) => (
        <div key={ex.id} style={styles.expenseCard}>
          <h3>
            {ex.description} - ₹{ex.amount}
          </h3>

          {ex.shares.map((sh) => {
            const name = members[sh.userId] || "Loading...";
            const status = sh.status;

            return (
              <div key={sh.userId} style={styles.shareCard}>
                <p>
                  <b>{name}</b>
                </p>
                <p>Amount: ₹{sh.amount}</p>
                <p>Status: {status}</p>

                {/* Only show for current user */}
                {sh.userId === userId && (
                  <div style={{ marginTop: 10 }}>
                    {status === "UNPAID" && (
                      <button
                        style={styles.payBtn}
                        onClick={() => {
                          setSelectedExpense(ex);
                          setPaymentMethod("CASH");
                          setUploadImage(null);
                        }}
                      >
                        Pay
                      </button>
                    )}

                    {(status === "PENDING_CASH_APPROVAL" ||
                      status === "PENDING_UPI_APPROVAL") && (
                      <p style={{ color: "orange", fontWeight: "bold" }}>
                        Waiting for approval…
                      </p>
                    )}

                    {status === "APPROVED" && (
                      <p style={{ color: "green", fontWeight: "bold" }}>
                        Paid ✔
                      </p>
                    )}

                    {status === "REJECTED" && (
                      <p style={{ color: "red", fontWeight: "bold" }}>
                        Rejected ❌ — Resubmit payment
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}

      {/* PAYMENT MODAL */}
      {selectedExpense && (
        <div style={styles.modalBg}>
          <div style={styles.modal}>
            <h2>Submit Payment</h2>

            <select
              style={styles.input}
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="CASH">Cash</option>
              <option value="UPI">UPI</option>
            </select>

            {paymentMethod === "UPI" && (
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setUploadImage(e.target.files[0])}
              />
            )}

            <button style={styles.submit} onClick={handlePaySubmit}>
              Submit
            </button>

            <button
              style={styles.cancel}
              onClick={() => {
                setSelectedExpense(null);
                setUploadImage(null);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  expenseCard: {
    background: "#f0f0f0",
    padding: 20,
    marginBottom: 20,
    borderRadius: 10,
  },
  shareCard: {
    background: "white",
    padding: 15,
    marginTop: 10,
    borderRadius: 8,
  },
  payBtn: {
    background: "green",
    color: "white",
    padding: "8px 12px",
    borderRadius: 6,
    border: "none",
    marginTop: 5,
    cursor: "pointer",
  },
  modalBg: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    background: "white",
    padding: 30,
    width: 350,
    borderRadius: 10,
  },
  input: {
    width: "100%",
    padding: 10,
    marginBottom: 15,
  },
  submit: {
    background: "#007bff",
    color: "white",
    padding: 10,
    width: "100%",
    border: "none",
    borderRadius: 6,
    marginBottom: 10,
  },
  cancel: {
    background: "red",
    color: "white",
    padding: 10,
    width: "100%",
    border: "none",
    borderRadius: 6,
  },
};

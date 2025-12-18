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

  useEffect(() => { loadTeams(); }, []);
  useEffect(() => {
    const handler = () => teamId && loadExpenses(teamId);
    document.addEventListener("expenses-updated", handler);
    return () => document.removeEventListener("expenses-updated", handler);
  }, [teamId]);

  const loadTeams = async () => {
    const res = await fetch(`http://localhost:8080/api/team/my-teams/${userId}`);
    setTeams(await res.json());
  };

  const loadMembers = async (tid) => {
  try {
    const res = await fetch(`http://localhost:8080/api/team/members/${tid}`);
    const list = await res.json();

    const map = {};
    list.forEach((u) => {
      map[u.id] = u.fullName || `${u.firstName} ${u.lastName}` || "User";
    });

    setMembers(map);
  } catch (e) {
    console.error("Error loading members", e);
  }
};


  const loadExpenses = async (tid) => {
  const res = await fetch(`http://localhost:8080/api/expenses/team/${tid}`);
  const data = await res.json();
  setExpenses(data);

  // ensure members map is ready
  await loadMembers(tid);
};


  const handlePaySubmit = async () => {
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
  };

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = reject;
      r.readAsDataURL(file);
    });

  return (
    <div className="tp-root">
      <style>{`
        .tp-root {
          min-height: 100vh;
          padding: 120px 20px 160px;
          background: linear-gradient(135deg, #ff7ce0, #7ea2ff, #5cf3ff);
          background-size: 300% 300%;
          animation: tpayBg 12s ease infinite;
          font-family: Inter, sans-serif;
        }

        @keyframes tpayBg {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .glass-box {
          backdrop-filter: blur(20px) saturate(160%);
          background: rgba(255,255,255,0.25);
          border: 1px solid rgba(255,255,255,0.4);
          border-radius: 22px;
          padding: 20px;
          margin-bottom: 20px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.2);
        }

        .tp-input {
          width: 100%;
          padding: 12px;
          margin-bottom: 16px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.4);
          background: rgba(255,255,255,0.3);
          backdrop-filter: blur(14px);
        }

        .tp-share {
          background: rgba(255,255,255,0.35);
          backdrop-filter: blur(14px);
          border: 1px solid rgba(255,255,255,0.4);
          padding: 14px;
          border-radius: 14px;
          margin-top: 10px;
        }

        .tp-pay-btn {
          padding: 8px 12px;
          background: linear-gradient(90deg,#4bff8c,#00c853);
          color: white;
          border-radius: 10px;
          border: none;
          font-weight: 700;
          cursor: pointer;
        }

        .tp-modal-bg {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.35);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }

        .tp-modal {
          background: rgba(255,255,255,0.8);
          border: 1px solid rgba(255,255,255,0.5);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          padding: 25px;
          width: 340px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.3);
          animation: fadeUp 0.3s ease;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .tp-submit {
          width: 100%;
          padding: 10px;
          border-radius: 12px;
          border: none;
          background: linear-gradient(90deg,#0066ff,#00bbff);
          color: white;
          font-weight: 700;
          margin-top: 10px;
        }

        .tp-cancel {
          width: 100%;
          padding: 10px;
          border-radius: 12px;
          background: #ff4444;
          border: none;
          color: white;
          font-weight: 700;
          margin-top: 10px;
        }
      `}</style>

      <h1 style={{ color: "white", textShadow: "0 4px 10px rgba(0,0,0,0.3)" }}>Toggle Payment</h1>

      <select
        className="tp-input"
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

      {expenses.map((ex) => (
        <div key={ex.id} className="glass-box">
          <h3>{ex.description} - ₹{ex.amount}</h3>

          {ex.shares.map((sh) => (
            <div key={sh.userId} className="tp-share">
              <p><b>{members[sh.userId] || "Loading..."}</b></p>
              <p>Amount: ₹{sh.amount}</p>
              <p>Status: {sh.status}</p>

              {sh.userId === userId && (
                <>
                  {sh.status === "UNPAID" && (
                    <button
                      className="tp-pay-btn"
                      onClick={() => {
                        setSelectedExpense(ex);
                        setPaymentMethod("CASH");
                        setUploadImage(null);
                      }}
                    >
                      Pay
                    </button>
                  )}

                  {sh.status === "APPROVED" && (
                    <p style={{ color: "green", fontWeight: "bold" }}>Paid ✔</p>
                  )}

                  {(sh.status === "PENDING_CASH_APPROVAL" ||
                    sh.status === "PENDING_UPI_APPROVAL") && (
                    <p style={{ color: "orange", fontWeight: "bold" }}>
                      Waiting for approval…
                    </p>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      ))}

      {selectedExpense && (
        <div className="tp-modal-bg">
          <div className="tp-modal">
            <h2>Submit Payment</h2>

            <select
              className="tp-input"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="CASH">Cash</option>
              <option value="UPI">UPI</option>
            </select>

            {paymentMethod === "UPI" && (
              <input type="file" accept="image/*" onChange={(e) => setUploadImage(e.target.files[0])} />
            )}

            <button className="tp-submit" onClick={handlePaySubmit}>
              Submit
            </button>

            <button
              className="tp-cancel"
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

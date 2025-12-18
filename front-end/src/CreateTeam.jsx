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
    const joinCode = data.match(/Join Code: (\w+)/)?.[1];
    const base64 = data.match(/QR Base64: ([A-Za-z0-9+/=]+)/)?.[1];

    setResult({
      joinCode: joinCode || "",
      qr: base64 || "",
    });
  };

  return (
    <div className="ct-container">
      <style>{`
        :root {
          --glass: rgba(255,255,255,0.28);
          --glass-border: rgba(255,255,255,0.35);
          --text: #0b1220;
        }
        .dark-theme {
          --glass: rgba(20,24,30,0.45);
          --glass-border: rgba(255,255,255,0.15);
          --text: #f6f8ff;
        }

        .ct-container {
          min-height: 100vh;
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 120px 20px 140px; /* header + nav safety */

          background: linear-gradient(135deg, #ff7ce0, #7ea2ff, #5cf3ff);
          background-size: 300% 300%;
          animation: bgMove 12s ease infinite;
          font-family: Inter, sans-serif;
          color: var(--text);
        }

        @keyframes bgMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .ct-box {
          width: 100%;
          max-width: 450px;
          padding: 32px;
          border-radius: 24px;

          background: var(--glass);
          backdrop-filter: blur(22px) saturate(180%);
          border: 1px solid var(--glass-border);
          box-shadow: 0 22px 50px rgba(0,0,0,0.25);

          animation: fadeIn 0.5s ease forwards;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .ct-input {
          width: 100%;
          padding: 14px;
          border-radius: 14px;
          border: 1px solid var(--glass-border);
          background: rgba(255,255,255,0.25);
          backdrop-filter: blur(12px);
          color: var(--text);
          font-size: 16px;
          margin-bottom: 18px;
        }

        .ct-btn {
          width: 100%;
          padding: 14px;
          border-radius: 14px;
          border: none;
          cursor: pointer;
          font-size: 16px;

          background: rgba(255,255,255,0.32);
          border: 1px solid var(--glass-border);
          backdrop-filter: blur(18px);

          color: var(--text);
          transition: 0.25s;
        }

        .ct-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }

        .ct-result {
          margin-top: 25px;
          padding: 20px;
          border-radius: 18px;
          background: rgba(255,255,255,0.3);
          border: 1px solid var(--glass-border);
          backdrop-filter: blur(20px);
          text-align: center;
        }

        .ct-result img {
          width: 180px;
          margin-top: 10px;
          border-radius: 18px;
          box-shadow: 0 12px 25px rgba(0,0,0,0.3);
        }

        @media (max-width: 480px) {
          .ct-box {
            padding: 22px;
            border-radius: 18px;
          }
          .ct-input, .ct-btn {
            padding: 12px;
            font-size: 15px;
          }
          .ct-result img {
            width: 150px;
          }
        }

      `}</style>

      <div className="ct-box">
        <h1 style={{ textAlign: "center", marginBottom: "15px" }}>
          Create Team
        </h1>

        <form onSubmit={createTeam}>
          <input
            type="text"
            placeholder="Enter Team Name"
            required
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            className="ct-input"
          />

          <button className="ct-btn">Create Team</button>
        </form>

        {result && (
          <div className="ct-result">
            <h2>Team Created Successfully</h2>
            <p><b>Join Code:</b> {result.joinCode}</p>

            {result.qr && (
              <>
                <p><b>QR Code:</b></p>
                <img
                  src={`data:image/png;base64,${result.qr}`}
                  alt="QR Code"
                />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

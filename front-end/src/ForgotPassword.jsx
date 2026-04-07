import React, { useState } from "react";
import API_BASE from "./config.js";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  const submit = async () => {
    const res = await fetch(
      `${API_BASE}/api/auth/forgot-password?email=${email}`,
      {
        method: "POST", // IMPORTANT
      }
    );

    const data = await res.text();
    setMsg(data);
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>Forgot Password</h2>

      <input
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <button onClick={submit}>Submit</button>

      <p>{msg}</p>
    </div>
  );
}

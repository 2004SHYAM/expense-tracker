import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";

export default function ResetPassword() {
  const [query] = useSearchParams();
  const token = query.get("token");

  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const reset = async () => {
    const res = await fetch("http://localhost:8080/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword: password }),
    });

    const data = await res.text();
    setMsg(data);
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>Reset Password</h2>

      <input
        type="password"
        placeholder="New Password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={reset}>Reset</button>

      <p>{msg}</p>
    </div>
  );
}

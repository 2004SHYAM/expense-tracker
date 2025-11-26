import React, { useState } from "react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  const submit = async () => {
    const res = await fetch(
      "http://localhost:8080/api/auth/forgot-password?email=" + email,
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

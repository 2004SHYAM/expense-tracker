import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function Register() {
  const [msg, setMsg] = useState("");

  const register = async (e) => {
    e.preventDefault();

    const form = new FormData(e.target);
    const payload = Object.fromEntries(form);

    const res = await fetch("http://localhost:8080/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.text();
    setMsg(data);
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>Register</h2>

      <form onSubmit={register}>
        <input name="name" placeholder="Name" /><br />
        <input name="email" placeholder="Email" /><br />
        <input name="password" type="password" placeholder="Password" /><br />

        <button type="submit">Register</button>
      </form>

      <p>{msg}</p>

      <Link to="/">Login</Link>
    </div>
  );
}

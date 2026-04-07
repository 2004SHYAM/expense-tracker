import React, { useState } from "react";
import { Link } from "react-router-dom";
import API_BASE from "./config.js";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const login = async (e) => {
    e.preventDefault();

    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("email", email);
      localStorage.setItem("userId", data.userId);   

      window.location.href = "/home";
    } else {
      setMsg(data || "Invalid credentials");
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>Login</h2>

      <form onSubmit={login}>
        <input
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        /><br />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        /><br />

        <button type="submit">Login</button>
      </form>

      <p>{msg}</p>

      <Link to="/forgot-password">Forgot Password?</Link><br />
      <Link to="/register">Create Account</Link>
    </div>
  );
}

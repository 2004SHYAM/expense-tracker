import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();

  // Login State
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  // Register State
  const [registerData, setRegisterData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [msg, setMsg] = useState("");

  // Handle Login Input Change
  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  // Handle Register Input Change
  const handleRegisterChange = (e) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  };

  // ----------------------------
  // LOGIN HANDLER
  // ----------------------------
  const handleLogin = async (e) => {
    e.preventDefault();

    const { email, password } = loginData;

    try {
      const res = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMsg(data || "Invalid credentials");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("email", data.email);
      localStorage.setItem("userId", data.userId);

      navigate("/home");

    } catch (err) {
      setMsg("Something went wrong. Try again.");
    }
  };

  // ----------------------------
  // REGISTER HANDLER
  // ----------------------------
  const handleRegister = async (e) => {
    e.preventDefault();

    const payload = {
      firstName: registerData.firstName,
      lastName: registerData.lastName,
      email: registerData.email,
      password: registerData.password,
    };

    try {
      const res = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.text();
      setMsg(data);

      if (res.ok) {
        setIsSignUp(false); // slide back to login
      }

    } catch (err) {
      setMsg("Registration failed. Try again.");
    }
  };

  return (
    <div className="auth-wrapper">

      {/* Embedded CSS */}
      <style>{`
        @import url('https://fonts.googleapis.com/css?family=Montserrat:400,800');

        .auth-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;
          font-family: 'Montserrat', sans-serif;
          height: 100vh;
          background: #f6f5f7;
          padding: 10px;
        }

        .container {
          background-color: #fff;
          border-radius: 10px;
          box-shadow: 0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22);
          position: relative;
          overflow: hidden;
          width: 850px;
          max-width: 100%;
          min-height: 500px;
          transition: 0.4s ease;
        }

        .form-container {
          position: absolute;
          top: 0;
          height: 100%;
          transition: all 0.6s ease-in-out;
        }

        .sign-in-container {
          left: 0;
          width: 50%;
          z-index: 2;
        }

        .sign-up-container {
          left: 0;
          width: 50%;
          opacity: 0;
          z-index: 1;
        }

        .container.right-panel-active .sign-in-container {
          transform: translateX(100%);
        }

        .container.right-panel-active .sign-up-container {
          transform: translateX(100%);
          opacity: 1;
          z-index: 5;
        }

        form {
          background-color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          padding: 0 40px;
          height: 100%;
          text-align: center;
        }

        input {
          background-color: #eee;
          border: none;
          padding: 12px 15px;
          margin: 8px 0;
          width: 100%;
          border-radius: 5px;
        }

        button {
          border-radius: 20px;
          border: 1px solid #FF4B2B;
          background-color: #FF4B2B;
          color: #fff;
          padding: 12px 45px;
          text-transform: uppercase;
          font-weight: bold;
          cursor: pointer;
          margin-top: 10px;
        }

        button.ghost {
          background: transparent;
          border: 2px solid white;
        }

        .overlay-container {
          position: absolute;
          top: 0;
          left: 50%;
          width: 50%;
          height: 100%;
          overflow: hidden;
          transition: transform 0.6s ease-in-out;
          z-index: 100;
        }

        .container.right-panel-active .overlay-container {
          transform: translateX(-100%);
        }

        .overlay {
          background: linear-gradient(to right, #FF4B2B, #FF416C);
          background-size: cover;
          color: #fff;
          position: relative;
          left: -100%;
          width: 200%;
          height: 100%;
          transform: translateX(0);
          transition: transform 0.6s ease-in-out;
        }

        .container.right-panel-active .overlay {
          transform: translateX(50%);
        }

        .overlay-panel {
          position: absolute;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          padding: 0 40px;
          text-align: center;
          top: 0;
          height: 100%;
          width: 50%;
          transition: 0.6s ease-in-out;
        }

        .overlay-left {
          transform: translateX(-20%);
        }

        .container.right-panel-active .overlay-left {
          transform: translateX(0);
        }

        .overlay-right {
          right: 0;
          transform: translateX(0);
        }

        .container.right-panel-active .overlay-right {
          transform: translateX(20%);
        }

        @media (max-width: 768px) {
          .container {
            width: 100%;
            min-height: 600px;
          }
        }
      `}</style>

      {/* MAIN AUTH COMPONENT */}
      <div className={`container ${isSignUp ? "right-panel-active" : ""}`}>

        {/* SIGN UP FORM */}
        <div className="form-container sign-up-container">
          <form onSubmit={handleRegister}>
            <h1>Create Account</h1>
            <input name="firstName" placeholder="First Name" onChange={handleRegisterChange} />
            <input name="lastName" placeholder="Last Name" onChange={handleRegisterChange} />
            <input name="email" placeholder="Email" onChange={handleRegisterChange} />
            <input name="password" placeholder="Password" type="password" onChange={handleRegisterChange} />
            <button>Sign Up</button>
          </form>
        </div>

        {/* SIGN IN FORM */}
        <div className="form-container sign-in-container">
          <form onSubmit={handleLogin}>
            <h1>Sign In</h1>
            <input name="email" placeholder="Email" onChange={handleLoginChange} />
            <input name="password" placeholder="Password" type="password" onChange={handleLoginChange} />
            <a href="/forgot-password" style={{ fontSize: "12px", margin: "10px" }}>
              Forgot your password?
            </a>
            <button>Sign In</button>
            <p style={{ color: "red", marginTop: "10px" }}>{msg}</p>
          </form>
        </div>

        {/* OVERLAY (RED PANEL) */}
        <div className="overlay-container">
          <div className="overlay">

            <div className="overlay-panel overlay-left">
              <h1>Welcome Back!</h1>
              <p>To keep connected with us please login with your personal info</p>
              <button className="ghost" onClick={() => setIsSignUp(false)}>
                Sign In
              </button>
            </div>

            <div className="overlay-panel overlay-right">
              <h1>Hello, Friend!</h1>
              <p>Enter your personal details and start your journey with us</p>
              <button className="ghost" onClick={() => setIsSignUp(true)}>
                Sign Up
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

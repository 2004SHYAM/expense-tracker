import React, { useState, useEffect } from "react";
import { FiSun, FiMoon, FiCamera, FiSave, FiUser } from "react-icons/fi";

export default function Profile() {
  const userId = localStorage.getItem("userId");

  const [dark, setDark] = useState(localStorage.getItem("theme") === "dark");
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    profileImage: "",
  });

  // Apply theme
  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark-theme");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark-theme");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  // Load user details from backend
  useEffect(() => {
    async function loadUser() {
      const res = await fetch(`http://localhost:8080/api/auth/user/${userId}`);
      const data = await res.json();

      setForm({
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        email: data.email || "",
        phone: data.phone || "",
        profileImage: data.profileImage || "",
      });

      setLoading(false);
    }

    loadUser();
  }, [userId]);

  const updateForm = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Convert uploaded image to base64
  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setForm({ ...form, profileImage: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const saveProfile = async () => {
    const res = await fetch(`http://localhost:8080/api/auth/user/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    alert(await res.text());
  };

  if (loading) return <div>Loading...</div>;
<div className={`theme-fade ${dark ? "fade-dark" : "fade-light"}`}></div>

  return (
    <div className="profile-page">
      {/* ------------ STYLES ------------- */}
      <style>{`
        :root {
          --glass-bg: rgba(255, 255, 255, 0.25);
          --glass-border: rgba(255, 255, 255, 0.4);
          --text: #111;
          --label: #555;
        }

        
        .dark-theme {
          --glass-bg: rgba(20, 20, 30, 0.4);
          --glass-border: rgba(255, 255, 255, 0.12);
          --text: #f4f4f4;
          --label: #b5b5b5;
        }

        /* Vibrant gradient background */
        .profile-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #ff7ce0, #7ea2ff, #5cf3ff);
          background-size: 300% 300%;
          animation: gradientMove 12s ease infinite;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 40px 20px;
          color: var(--text);
          font-family: -apple-system, BlinkMacSystemFont, "Inter", sans-serif;
        }

        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        /* Glass card */
        .profile-card {
          width: 420px;
          background: var(--glass-bg);
          backdrop-filter: blur(20px);
          border-radius: 22px;
          padding: 30px;
          border: 1px solid var(--glass-border);
          box-shadow: 0 20px 50px rgba(0,0,0,0.2);
          animation: fadeIn 0.8s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .profile-title {
          font-size: 26px;
          font-weight: 700;
          margin-bottom: 20px;
          text-align: center;
        }

        /* Profile image */
        .profile-image-container {
          display: flex;
          justify-content: center;
          margin-bottom: 18px;
          position: relative;
        }

        .profile-image {
          width: 110px;
          height: 110px;
          border-radius: 50%;
          object-fit: cover;
          border: 4px solid rgba(255,255,255,0.6);
          box-shadow: 0 8px 24px rgba(0,0,0,0.2);
        }

        .upload-btn {
          position: absolute;
          bottom: 0;
          right: 36%;
          background: rgba(0,0,0,0.6);
          color: white;
          padding: 10px;
          border-radius: 50%;
          cursor: pointer;
          backdrop-filter: blur(10px);
        }

        /* Form */
        .form-field {
          margin-bottom: 15px;
          display: flex;
          flex-direction: column;
        }

        .form-field label {
          font-size: 13px;
          margin-bottom: 5px;
          color: var(--label);
        }

        .form-field input {
          padding: 12px;
          border-radius: 12px;
          border: none;
          background: rgba(255,255,255,0.55);
          color: var(--text);
          backdrop-filter: blur(10px);
        }

        input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Theme Switch */
        .theme-toggle {
          display: flex;
          justify-content: center;
          margin-bottom: 20px;
        }

        .theme-pill {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 18px;
          border-radius: 30px;
          border: 1px solid rgba(255,255,255,0.4);
          background: rgba(255,255,255,0.25);
          backdrop-filter: blur(12px);
          cursor: pointer;
          color: var(--text);
          font-weight: 500;
        }

        /* Save btn */
        .save-btn {
          width: 100%;
          background: #000;
          color: #fff;
          padding: 14px;
          margin-top: 15px;
          border-radius: 14px;
          font-size: 15px;
          letter-spacing: 0.3px;
          cursor: pointer;
          border: none;
          transition: 0.2s;
        }

        .save-btn:hover {
          background: #333;
        }

        /* Smooth transition for theme switching */
* {
  transition: 
    background 0.45s ease,
    background-color 0.45s ease,
    color 0.45s ease,
    border-color 0.45s ease,
    opacity 0.45s ease,
    backdrop-filter 0.45s ease;
}

      `}</style>

      {/* ------------ ACTUAL UI CONTENT ------------- */}

      <div className="profile-card">
        {/* THEME SWITCH */}
        <div className="theme-toggle">
          <div className="theme-pill" onClick={() => setDark(!dark)}>
            {dark ? <FiMoon /> : <FiSun />}
            {dark ? "Dark Mode" : "Light Mode"}
          </div>
        </div>

        <div className="profile-title">My Profile</div>

        {/* PROFILE PICTURE */}
        <div className="profile-image-container">
          <img
            src={
              form.profileImage ||
              "https://cdn-icons-png.flaticon.com/512/149/149071.png"
            }
            className="profile-image"
          />
          <label className="upload-btn">
            <FiCamera />
            <input type="file" hidden onChange={handleImage} />
          </label>
        </div>

        {/* FORM FIELDS */}
        <div className="form-field">
          <label>First Name</label>
          <input name="firstName" value={form.firstName} onChange={updateForm} />
        </div>

        <div className="form-field">
          <label>Last Name</label>
          <input name="lastName" value={form.lastName} onChange={updateForm} />
        </div>

        <div className="form-field">
          <label>Email (not editable)</label>
          <input value={form.email} disabled />
        </div>

        <div className="form-field">
          <label>Phone</label>
          <input name="phone" value={form.phone} onChange={updateForm} />
        </div>

        <button className="save-btn" onClick={saveProfile}>
          <FiSave /> Save Profile
        </button>
      </div>
    </div>
  );
}

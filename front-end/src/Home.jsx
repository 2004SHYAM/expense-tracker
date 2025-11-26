import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Users,
  UserPlus,
  List,
  PlusCircle,
  FileText,
  CreditCard,
  CheckCircle,
  BarChart2,
  LogOut,
  Sun,
  Moon,
  ChevronDown,
  Home as HomeIcon,
  Settings,
} from "lucide-react";

export default function Home() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const [dark, setDark] = useState(localStorage.getItem("theme") === "dark");
  const [fullName, setFullName] = useState("");
  const [teams, setTeams] = useState([]);
  const [profileOpen, setProfileOpen] = useState(false);

  const [stats, setStats] = useState({
    teamsCount: 0,
    totalExpenses: 0,
    pendingApprovals: 0,
  });

  // ------------ LOAD USER -------------
  useEffect(() => {
    if (!userId) return;
    fetch(`http://localhost:8080/api/auth/user/${userId}`)
      .then((r) => r.json())
      .then((d) => setFullName(d.fullName || "User"));
  }, [userId]);

  // ------------ LOAD TEAMS + STATS -------------
  useEffect(() => {
    if (!userId) return;
    async function load() {
      const tRes = await fetch(
        `http://localhost:8080/api/team/my-teams/${userId}`
      );
      const tData = await tRes.json();
      const list = Array.isArray(tData) ? tData : [];
      setTeams(list);

      let total = 0;
      let pending = 0;
      await Promise.all(
        list.map(async (team) => {
          const exRes = await fetch(
            `http://localhost:8080/api/expenses/team/${team.id}`
          );
          const exData = await exRes.json();
          if (Array.isArray(exData)) {
            total += exData.reduce((a, b) => a + (Number(b.amount) || 0), 0);
          }
          const pRes = await fetch(
            `http://localhost:8080/api/expenses/pending-approvals/${team.id}/${userId}`
          );
          const pData = await pRes.json();
          if (Array.isArray(pData)) pending += pData.length;
        })
      );
      setStats({
        teamsCount: list.length,
        totalExpenses: total,
        pendingApprovals: pending,
      });
    }
    load();
  }, [userId]);

  // ------------ THEME -------------
  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark-theme");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark-theme");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="home-root">
      <style>{`
        :root {
          --glass: rgba(255,255,255,0.25);
          --glass-border: rgba(255,255,255,0.35);
          --text: #0b1220;
          --muted: rgba(0,0,0,0.55);
          --ios-ease: cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .dark-theme {
          --glass: rgba(18,22,30,0.35);
          --glass-border: rgba(255,255,255,0.1);
          --text: #f5f8ff;
          --muted: rgba(255,255,255,0.65);
        }

        .home-root {
          min-height: 100vh;
          width: 100%;
          padding: 24px;
          
          /* SPACE FOR FIXED ELEMENTS */
          padding-top: 110px; /* Pushes content below Fixed Header */
          padding-bottom: 140px; /* Pushes content above Fixed Bottom Nav */
          
          background: linear-gradient(135deg, #ff7ce0, #7ea2ff, #5cf3ff);
          background-size: 300% 300%;
          animation: moveBg 12s ease infinite;
          font-family: "Inter", sans-serif;
          color: var(--text);
        }
        
        @keyframes moveBg {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .glass-box {
          background: var(--glass);
          backdrop-filter: blur(20px) saturate(160%);
          border: 1px solid var(--glass-border);
          border-radius: 22px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.25);
        }

        /* --- FIXED HEADER --- */
        .header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 80px;
          z-index: 1000; /* Highest priority */
          
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 24px;
          
          background: var(--glass);
          backdrop-filter: blur(20px) saturate(180%);
          border-bottom: 1px solid var(--glass-border);
          border-radius: 0 0 24px 24px; /* Rounded bottom corners */
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }

        .profile-wrapper { position: relative; }
        .profile-btn {
          padding: 8px 12px;
          display:flex; align-items:center; gap:12px;
          background: rgba(255,255,255,0.15); /* Distinct button bg */
          border-radius: 12px;
          cursor:pointer; transition: transform 0.1s;
        }
        .profile-btn:active { transform: scale(0.95); }
        .avatar {
          width: 36px; height: 36px; border-radius: 10px;
          background: rgba(255,255,255,0.2); 
          display:flex; align-items:center; justify-content:center;
          font-weight:700;
        }
        .theme-btn {
           padding: 8px 12px; cursor:pointer; 
           display:flex; align-items:center; gap: 8px;
           background: rgba(255,255,255,0.15);
           border-radius: 12px;
        }

        /* DROPDOWN */
        .dropdown-menu {
          position: absolute; top: 140%; right: 0; width: 260px;
          background: #1e293b; color: #f8fafc;
          backdrop-filter: blur(40px); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 24px; box-shadow: 0 30px 60px rgba(0,0,0,0.5);
          padding: 12px 0; z-index: 1001; transform-origin: top right;
          animation: springOpen 0.5s var(--ios-ease) forwards;
        }
        @keyframes springOpen {
          0% { opacity: 0; transform: scale(0.5) translateY(-20px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .dropdown-menu a, .dropdown-menu .link {
          display:flex; align-items:center; gap:12px; padding:12px 18px;
          text-decoration:none; color: #f8fafc; cursor:pointer;
        }
        .dropdown-menu a:hover, .dropdown-menu .link:hover { background: rgba(255,255,255,0.1); }
        
        .click-outside { position: fixed; inset: 0; z-index: 999; cursor: default; }

        /* CONTENT */
        .banner {
          margin-top: 10px; padding: 22px; display:flex; justify-content:space-between;
          align-items:center; flex-wrap:wrap; gap: 20px; position: relative; z-index: 1; 
        }
        .grid {
          margin-top: 25px; display:grid;
          grid-template-columns: repeat(auto-fit, minmax(240px,1fr));
          gap: 22px; position: relative; z-index: 1;
        }
        .card {
          padding: 22px; display:flex; gap:16px; text-decoration:none;
          color: var(--text); transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        .card:hover { transform: translateY(-6px); }
        .card:active { transform: scale(0.97); }

        /* BOTTOM NAV */
        .bottom {
          position: fixed; left: 0; right: 0; bottom: 24px;
          display:flex; justify-content:center; z-index: 99990; pointer-events: none;
        }
        .bottom-inner {
          pointer-events: auto; width: auto; min-width: 320px;
          padding: 12px 24px; border-radius: 50px;
          background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.15);
          box-shadow: 0 10px 40px rgba(0,0,0,0.3);
          animation: slideUp 0.6s var(--ios-ease) forwards;
        }
        @keyframes slideUp { from { transform: translateY(100px); } to { transform: translateY(0); } }
        .bn-row { display:flex; gap: 30px; justify-content:center; }
        .bn-item { 
          display:flex; flex-direction:column; align-items:center; gap:6px; 
          font-size:11px; cursor:pointer; color: rgba(255,255,255,0.7);
        }
        .bn-item:hover { color: #fff; transform: translateY(-3px); }

        /* --- MOBILE FIXES --- */
        @media (max-width: 480px) {
          .home-root { 
            padding: 12px !important; 
            padding-top: 100px !important; /* Mobile Header Space */
            padding-bottom: 140px !important; /* Mobile Nav Space */
          }
          
          .header { 
            padding: 0 16px;
            height: 70px;
            border-radius: 0 0 20px 20px;
          }
          
          .profile-btn { padding: 6px 10px; font-size: 13px; }
          .theme-btn { padding: 6px 10px; font-size: 13px; }
          .avatar { width: 32px; height: 32px; }
          
          .banner { flex-direction: column; align-items: flex-start !important; }
          .banner > div:last-child { width: 100%; justify-content: space-between !important; }
          .grid { grid-template-columns: 1fr !important; }
          
          .bottom { bottom: 16px !important; }
          .bottom-inner { width: 90%; padding: 14px; }
          .bn-row { justify-content: space-around; gap: 0; }
        }
      `}</style>

      {/* ---------- INVISIBLE CLICK CATCHER ---------- */}
      {profileOpen && (
        <div className="click-outside" onClick={() => setProfileOpen(false)} />
      )}

      {/* ---------- FIXED HEADER (Now sticks to top) ---------- */}
      <div className="header">
        <div>
          <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Expense Tracker</h2>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <div
            className="theme-btn"
            onClick={() => setDark(!dark)}
          >
            {dark ? <Moon /> : <Sun />}
            {dark ? "Dark" : "Light"}
          </div>

          <div className="profile-wrapper">
            <div className="profile-btn" onClick={() => setProfileOpen(!profileOpen)}>
              <div className="avatar">{fullName.charAt(0)}</div>
              <div style={{ display: 'flex', flexDirection:'column', lineHeight:1 }}>
                 <span style={{ fontWeight: 600 }}>{fullName.split(' ')[0]}</span>
              </div>
              <ChevronDown />
            </div>

            {profileOpen && (
              <div className="dropdown-menu">
                <Link to="/profile" onClick={() => setProfileOpen(false)}>
                  <Settings /> Profile
                </Link>
                <Link to="/summary" onClick={() => setProfileOpen(false)}>
                  <BarChart2 /> Team Summary
                </Link>
                <Link to="/teams" onClick={() => setProfileOpen(false)}>
                  <List /> My Teams
                </Link>
                <Link to="/create-team" onClick={() => setProfileOpen(false)}>
                  <PlusCircle /> Create Team
                </Link>
                <div className="link" onClick={logout}>
                  <LogOut /> Logout
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ---------- BANNER ---------- */}
      <div className="glass-box banner">
        <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: "rgba(255,255,255,0.25)", display: "flex", justifyContent: "center", alignItems: "center", fontSize: 24 }}>
            📊
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>Quick Summary</div>
            <div style={{ opacity: 0.8 }}>Overview of teams & pending items</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 28 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{stats.teamsCount}</div>
            <div>Teams</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 700 }}>₹ {stats.totalExpenses}</div>
            <div>Total</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{stats.pendingApprovals}</div>
            <div>Pending</div>
          </div>
        </div>
      </div>

      {/* ---------- GRID ---------- */}
      <div className="grid">
        {[
          { to: "/create-team", name: "Create Team", icon: <Users /> },
          { to: "/join-team", name: "Join Team", icon: <UserPlus /> },
          { to: "/teams", name: "My Teams", icon: <List /> },
          { to: "/add-expense", name: "Add Expense", icon: <PlusCircle /> },
          { to: "/view-expenses", name: "View Expenses", icon: <FileText /> },
          { to: "/track-payments", name: "Track Payments", icon: <CreditCard /> },
          { to: "/approvals", name: "Approvals", icon: <CheckCircle /> },
          { to: "/summary", name: "Team Summary", icon: <BarChart2 /> },
        ].map((c) => (
          <Link key={c.to} to={c.to} className="glass-box card">
            <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(255,255,255,0.25)", display: "flex", justifyContent: "center", alignItems: "center", fontSize: 22 }}>
              {c.icon}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{c.name}</div>
              <div style={{ opacity: 0.7 }}>Open {c.name}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* ---------- BOTTOM NAV ---------- */}
      <div className="bottom">
        <div className="bottom-inner">
          <div className="bn-row">
            <div className="bn-item" onClick={() => navigate("/home")}><HomeIcon /> Home</div>
            <div className="bn-item" onClick={() => navigate("/teams")}><Users /> Teams</div>
            <div className="bn-item" onClick={() => navigate("/add-expense")}><PlusCircle /> Add</div>
            <div className="bn-item" onClick={() => navigate("/approvals")}><CheckCircle /> Approvals</div>
            <div className="bn-item" onClick={() => navigate("/profile")}><Settings /> Menu</div>
          </div>
        </div>
      </div>

    </div>
  );
}
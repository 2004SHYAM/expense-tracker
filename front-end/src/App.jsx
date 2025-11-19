import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React from "react";
import Login from "./Login";
import Register from "./Register";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";
import CreateTeam from "./CreateTeam.jsx";
import Home from "./Home";
import Teams from "./Teams.jsx";
import TeamSummary from "./TeamSummary.jsx";
import JoinTeam from "./JoinTeam.jsx";
import AddExpense from "./AddExpense.jsx";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/home" element={<Home />} />
        <Route path="/create-team" element={<CreateTeam />} />
        <Route path="/teams" element={<Teams />} />
        <Route path="/summary" element={<TeamSummary />} />
        <Route path="/join-team" element={<JoinTeam />} />
        <Route path="/add-expense" element={<AddExpense />} />

      </Routes>
    </Router>
  );
}

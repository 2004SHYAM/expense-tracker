import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React from "react";
import Auth from "./Auth";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";
import CreateTeam from "./CreateTeam.jsx";
import Home from "./Home";
import Teams from "./Teams.jsx";
import TeamSummary from "./TeamSummary.jsx";
import JoinTeam from "./JoinTeam.jsx";
import AddExpense from "./AddExpense.jsx";
import ViewExpenses from "./ViewExpenses.jsx";
import ViewPersonExpenses from "./ViewPersonExpenses.jsx";
import TogglePay from "./TogglePay.jsx";
import Approvals from "./Approvals.jsx";
import Profile from "./Profile.jsx";
import Login from "./Login";
import Register from "./Register";


export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/home" element={<Home />} />
        <Route path="/create-team" element={<CreateTeam />} />
        <Route path="/teams" element={<Teams />} />
        <Route path="/summary" element={<TeamSummary />} />
        <Route path="/join-team" element={<JoinTeam />} />
        <Route path="/add-expense" element={<AddExpense />} />
        <Route path="/view-expenses" element={<ViewExpenses />} />
        <Route path="/view-person-expenses" element={<ViewPersonExpenses />} />
        <Route path="/track-payments" element={<TogglePay />} />
        <Route path="/approvals" element={<Approvals />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}

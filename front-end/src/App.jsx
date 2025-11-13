import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </Router>
  );
}

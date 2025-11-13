import { API_BASE } from "./api";
await fetch(`${API_BASE}/forgot-password?email=${email}`, { method: "POST" });


const API_BASE = "http://localhost:8080/api/auth"; // Your Spring Boot backend URL

export async function getExpenses() {
  const res = await fetch(`${API_BASE}/expenses`);
  return res.json();
}

export async function addExpense(expense) {
  const res = await fetch(`${API_BASE}/expenses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(expense),
  });
  return res.json();
}

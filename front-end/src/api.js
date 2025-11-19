const API_BASE = "http://localhost:8080/api/"; // Your Spring Boot backend URL

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

export async function createTeam(teamName, email) {
  const response = await fetch(`${API_BASE}team/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ teamName, email }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.text();
}

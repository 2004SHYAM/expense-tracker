# 💸 Expense Tracker – Team-Based Expense Sharing

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![React](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react)
![Spring Boot](https://img.shields.io/badge/Backend-Spring%20Boot-6DB33F?logo=springboot)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb)

A full-stack group expense management application designed with a modern **iOS-style glassmorphism UI**. Effortlessly manage shared costs, split bills, and track payments within teams using real-time status updates and QR code integration.



---

## ✨ Features

### 👥 Team Management
* **Create & Join:** Create teams with unique join codes or shareable **QR codes** (via ZXing).
* **Member View:** Seamlessly track who is in your group and manage multiple teams simultaneously.

### 💸 Smart Expense Management
* **Flexible Splitting:** Support for **Equal Splits** or **Custom Splits** per member.
* **Validation:** Built-in logic to prevent incorrect split totals with real-time confirmation modals.
* **Payment Flow:** Users can pay via **Cash** or **UPI** (with screenshot upload support).

### ✅ Approval Workflow
* **Status Tracking:** Payments move through states: `UNPAID` ➔ `PENDING` ➔ `APPROVED/REJECTED`.
* **Creator Control:** Expense creators have a dedicated dashboard to verify and approve incoming payments.

### 📊 Insights & UI
* **Team Summary:** Intelligent "Who Owes Whom" calculation based on email/name matching.
* **Glassmorphism Design:** Vibrant animated gradients with `backdrop-filter` effects.
* **Fully Responsive:** Optimized for Mobile, Tablet, and Desktop.

---

## 🛠️ Tech Stack

**Frontend:**
* React.js & React Router
* Glassmorphism UI (CSS3)
* Fetch API for State Management

**Backend:**
* Java / Spring Boot
* JWT (JSON Web Tokens) for Security
* MongoDB (NoSQL Database)
* ZXing Library (QR Code Generation)

---

## 🔑 Key API Endpoints

### Teams
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/team/create` | Create a new group |
| `POST` | `/api/team/join` | Join team via code |
| `GET` | `/api/team/team/{id}/qr` | Generate team QR code |

### Expenses
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/expenses/custom-add` | Add expense with custom split |
| `POST` | `/api/expenses/pay` | Submit payment (Cash/UPI) |
| `POST` | `/api/expenses/approve-payment/` | Creator approval endpoint |

---

## 📂 Project Structure

```text
expense-tracker/
├── backend/
│   ├── src/main/java/com/tracker/     # Spring Boot Logic
│   └── src/main/resources/            # App Properties & Static Assets
├── frontend/
│   ├── src/components/                # Reusable Glassmorphism UI
│   ├── src/pages/                     # Team & Expense Views
│   └── src/assets/                    # Styles & Images
└── README.md


cd backend
mvn spring-boot:run


cd frontend
npm install
npm run dev

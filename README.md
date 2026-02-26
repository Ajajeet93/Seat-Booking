# 🪑 Seat Booking System

A modern, full-stack Hybrid Office Seat Booking System designed to manage employee seating efficiently. It features a React-based frontend and a robust Node.js/Express backend with PostgreSQL for data management.

## 🚀 Features

- **Weekly Rotation Logic**: Intelligently manages seat assignments based on ISO weeks.
- **Dynamic Booking Eligibility**: Enforces rules for batch-day vs. non-batch-day bookings.
- **Real-time Availability**: Shows live seat status (Available, Booked, Released, Designated).
- **Double Booking Prevention**: Uses database locks to ensure data integrity.
- **Admin Dashboard**: Overview of seating and system stats.

## 🛠 Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, Lucide React, Axios
- **Backend**: Node.js, Express, PostgreSQL, JWT Authentication
- **Database**: PostgreSQL

## 📂 Project Structure

```txt
Seat-booking-system/
├── client/          # Vite + React Frontend
├── server/          # Node.js + Express + PostgreSQL Backend
└── README.md        # Documentation
```

## ⚙️ Setup Instructions

### Prerequisites
- Node.js (v18+)
- PostgreSQL installed and running

### 1. Backend Setup
1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure Environment Variables:
   Create a `.env` file in the `server` directory and add your PostgreSQL credentials:
   ```env
   DB_USER=your_postgres_user
   DB_PASSWORD=your_postgres_password
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=seat_booking
   JWT_SECRET=your_super_secret_key
   ```
4. Create and Initialize Database:
   ```bash
   npm run create-db  # Creates the database
   npm run init-db    # Runs migrations and seeds sample data
   ```
5. Start the server:
   ```bash
   npm start
   ```
   The backend will be running at `http://localhost:5000`.

### 2. Frontend Setup
1. Navigate to the client directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

## 🔑 Sample Credentials

For demonstration and testing purposes, you can use the following seeded accounts:

| Role | Employee ID | Password |
| :--- | :--- | :--- |
| **Admin** | `ADMIN001` | `admin123` |
| **Employee (Batch 1)** | `EMP001` | `password123` |
| **Employee (Batch 2)** | `EMP041` | `password123` |

> [!NOTE]
> There are 80 seeded employees in total (`EMP001` to `EMP080`).

## 📜 Business Rules

- **Batch Rotation**:
  - Odd Weeks: Mon-Wed (Batch 1), Thu-Fri (Batch 2)
  - Even Weeks: Mon-Wed (Batch 2), Thu-Fri (Batch 1)
- **Booking Window**:
  - Batch users can book up to 14 days in advance.
  - Non-batch users can only book for the next working day after 3:00 PM.
- **Seat Types**:
  - **Designated**: Assigned to specific batches.
  - **Floating**: Available to everyone (subject to availability).

---
Developed with ❤️ by [Ajajeet93](https://github.com/Ajajeet93)


const pool = require("./db");
const bcrypt = require("bcrypt");

const createTables = async () => {
  try {
    await pool.query(`
      DROP TABLE IF EXISTS bookings;
      DROP TABLE IF EXISTS seats;
      DROP TABLE IF EXISTS employees;

      CREATE TABLE employees (
        id SERIAL PRIMARY KEY,
        employee_id VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        password TEXT NOT NULL,
        batch INT NOT NULL,
        role VARCHAR(20) DEFAULT 'EMPLOYEE'
      );

      CREATE TABLE seats (
        id SERIAL PRIMARY KEY,
        seat_number INT UNIQUE NOT NULL,
        seat_type VARCHAR(20) NOT NULL CHECK (seat_type IN ('DESIGNATED', 'FLOATING')),
        assigned_batch INT
      );

      CREATE TABLE bookings (
        id SERIAL PRIMARY KEY,
        employee_id INT NOT NULL REFERENCES employees(id),
        seat_id INT NOT NULL REFERENCES seats(id),
        booking_date DATE NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'BOOKED' CHECK (status IN ('BOOKED', 'RELEASED')),
        UNIQUE(employee_id, booking_date)
      );

      CREATE UNIQUE INDEX uniq_booked_seat_per_day
      ON bookings(seat_id, booking_date)
      WHERE status = 'BOOKED';

      CREATE INDEX idx_bookings_date_status ON bookings(booking_date, status);
      CREATE INDEX idx_bookings_employee_date ON bookings(employee_id, booking_date);
    `);

    console.log("Tables created successfully.");

    const employeePasswordHash = await bcrypt.hash("password123", 10);
    const adminPasswordHash = await bcrypt.hash("admin123", 10);

    await pool.query(
      "INSERT INTO employees (employee_id, name, password, batch, role) VALUES ($1, $2, $3, 0, 'ADMIN')",
      ["ADMIN001", "Admin", adminPasswordHash],
    );

    for (let i = 1; i <= 80; i += 1) {
      const batch = i <= 40 ? 1 : 2;
      const employeeId = `EMP${String(i).padStart(3, "0")}`;
      await pool.query(
        "INSERT INTO employees (employee_id, name, password, batch) VALUES ($1, $2, $3, $4)",
        [employeeId, `Employee ${i}`, employeePasswordHash, batch],
      );
    }

    console.log("Employees seeded.");

    let seatNumber = 1;
    for (let i = 1; i <= 40; i += 1) {
      const assignedBatch = i <= 20 ? 1 : 2;
      await pool.query(
        "INSERT INTO seats (seat_number, seat_type, assigned_batch) VALUES ($1, 'DESIGNATED', $2)",
        [seatNumber, assignedBatch],
      );
      seatNumber += 1;
    }

    for (let i = 1; i <= 10; i += 1) {
      await pool.query(
        "INSERT INTO seats (seat_number, seat_type, assigned_batch) VALUES ($1, 'FLOATING', NULL)",
        [seatNumber],
      );
      seatNumber += 1;
    }

    console.log("Seats seeded.");
    process.exit(0);
  } catch (err) {
    console.error("Error initializing DB:", err);
    process.exit(1);
  }
};

createTables();

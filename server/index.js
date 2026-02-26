const express = require("express");
const cors = require("cors");
require("dotenv").config();
const pool = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

const authRoutes = require("./routes/auth");
const bookingRoutes = require("./routes/booking");

app.use("/api/auth", authRoutes);
app.use("/api", bookingRoutes);

// Basic test route
app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

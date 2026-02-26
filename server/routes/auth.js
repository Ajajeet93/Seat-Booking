const express = require("express");
const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/login", async (req, res) => {
    try {
        const { employee_id, password } = req.body;
        const userResult = await pool.query("SELECT * FROM employees WHERE employee_id = $1", [employee_id]);

        if (userResult.rows.length === 0) {
            return res.status(400).json({ error: "Invalid Employee ID or password." });
        }

        const user = userResult.rows[0];
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(400).json({ error: "Invalid Employee ID or password." });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role, batch: user.batch },
            process.env.JWT_SECRET,
            { expiresIn: "10h" }
        );

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                batch: user.batch
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

router.get("/profile", authMiddleware, async (req, res) => {
    try {
        const userResult = await pool.query("SELECT id, name, employee_id, batch, role FROM employees WHERE id = $1", [req.user.id]);
        if (userResult.rows.length === 0) return res.status(404).json({ error: "User not found" });
        res.json(userResult.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;

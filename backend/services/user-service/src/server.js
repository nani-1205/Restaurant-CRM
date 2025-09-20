require('dotenv').config({ path: '../../.env' });
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');

const app = express();
app.use(express.json());

// Register a new employee
app.post('/register', async (req, res) => {
    const { first_name, last_name, email, password, role } = req.body;
    if (!email || !password || !first_name) {
        return res.status(400).json({ message: "Missing required fields." });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUserQuery = 'INSERT INTO employees(first_name, last_name, email, password_hash, role) VALUES($1, $2, $3, $4, $5) RETURNING employee_id, email, role';
        const { rows } = await db.query(newUserQuery, [first_name, last_name, email, hashedPassword, role || 'waiter']);
        res.status(201).json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error registering user. Email may already be in use." });
    }
});

// Login an employee
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const { rows } = await db.query('SELECT * FROM employees WHERE email = $1', [email]);
        if (rows.length === 0) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const payload = {
            id: user.employee_id,
            email: user.email,
            role: user.role
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, user: payload });

    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});


const PORT = 3001;
app.listen(PORT, () => {
    console.log(`User service running on port ${PORT}`);
});
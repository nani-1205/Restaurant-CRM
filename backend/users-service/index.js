const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// PostgreSQL Connection Pool
const pgPool = new Pool({
  user: process.env.POSTGRES_USER,
  host: 'postgres',
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: 5432,
});

// Get all employees
app.get('/', async (req, res) => {
    try {
        const result = await pgPool.query('SELECT employee_id, first_name, last_name, email, role_id, hire_date FROM employees WHERE is_active = TRUE');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Create a new employee
app.post('/', async (req, res) => {
    const { first_name, last_name, email, password, role_id } = req.body;
    if (!first_name || !last_name || !email || !password || !role_id) {
        return res.status(400).json({ msg: 'Please enter all fields' });
    }

    try {
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const newEmployee = await pgPool.query(
            'INSERT INTO employees (first_name, last_name, email, password_hash, role_id) VALUES ($1, $2, $3, $4, $5) RETURNING employee_id, email',
            [first_name, last_name, email, password_hash, role_id]
        );
        res.status(201).json(newEmployee.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Simple login endpoint (in a real app, you'd return a JWT)
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const userResult = await pgPool.query('SELECT * FROM employees WHERE email = $1', [email]);
        if (userResult.rows.length === 0) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }
        
        const user = userResult.rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }
        
        // On successful login, return user info (without password)
        res.json({
            employee_id: user.employee_id,
            first_name: user.first_name,
            email: user.email,
            role_id: user.role_id
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Users service running on port ${PORT}`);
});
require('dotenv').config({ path: '../../.env' });
const express = require('express');
const db = require('./db');

const app = express();
app.use(express.json());

// --- Product Routes ---
app.get('/', async (req, res) => { // Corresponds to /api/products
    try {
        const { rows } = await db.query('SELECT * FROM products ORDER BY name');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

// --- Order Routes ---
app.post('/orders', async (req, res) => {
    const { employee_id, table_number, total_amount, items } = req.body;
    if (!items || items.length === 0 || !total_amount) {
        return res.status(400).json({ message: "Order must contain items and a total amount." });
    }

    const client = await db.getClient();
    try {
        await client.query('BEGIN');

        // Insert into orders table
        const orderQuery = 'INSERT INTO orders(employee_id, table_number, total_amount, status) VALUES($1, $2, $3, $4) RETURNING order_id';
        const orderResult = await client.query(orderQuery, [employee_id, table_number, total_amount, 'pending']);
        const newOrderId = orderResult.rows[0].order_id;

        // Insert each item into order_items table
        for (const item of items) {
            const itemQuery = 'INSERT INTO order_items(order_id, product_id, quantity, price_per_item) VALUES($1, $2, $3, $4)';
            await client.query(itemQuery, [newOrderId, item.product_id, item.quantity, item.price]);
        }

        await client.query('COMMIT');
        res.status(201).json({ message: "Order created successfully", order_id: newOrderId });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).send("Server Error");
    } finally {
        client.release();
    }
});

app.get('/orders', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM orders ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

const PORT = 3002;
app.listen(PORT, () => {
    console.log(`Order service running on port ${PORT}`);
});
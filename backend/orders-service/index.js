const express = require('express');
const { Pool } = require('pg');
const redis = require('redis');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// PostgreSQL Connection
const pgPool = new Pool({
  user: process.env.POSTGRES_USER,
  host: 'postgres',
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: 5432,
});

// Redis Connection
const redisClient = redis.createClient({ url: process.env.REDIS_URL });
redisClient.on('error', (err) => console.log('Redis Client Error', err));
(async () => await redisClient.connect())();

// --- Orders Endpoints ---
app.get('/', async (req, res) => {
    try {
        const cacheKey = 'orders:today';
        const cachedOrders = await redisClient.get(cacheKey);
        if (cachedOrders) return res.json(JSON.parse(cachedOrders));

        const result = await pgPool.query("SELECT * FROM orders WHERE DATE(order_time) = CURRENT_DATE ORDER BY order_time DESC");
        await redisClient.setEx(cacheKey, 60, JSON.stringify(result.rows));
        res.json(result.rows);
    } catch (err) {
        console.error(err); res.status(500).send('Server Error');
    }
});

app.post('/', async (req, res) => {
    const { table_id, employee_id, items } = req.body;
    if (!table_id || !employee_id || !items || items.length === 0) {
        return res.status(400).send('Missing required fields.');
    }

    const client = await pgPool.connect();
    try {
        await client.query('BEGIN');
        const orderRes = await client.query('INSERT INTO orders (table_id, employee_id, status) VALUES ($1, $2, $3) RETURNING order_id', [table_id, employee_id, 'pending']);
        const orderId = orderRes.rows[0].order_id;

        let totalAmount = 0;
        for (const item of items) {
            const itemPriceRes = await client.query('SELECT price FROM menu_items WHERE item_id = $1', [item.item_id]);
            const price_at_time = itemPriceRes.rows[0].price;
            totalAmount += price_at_time * item.quantity;
            await client.query('INSERT INTO order_items (order_id, item_id, quantity, price_at_time) VALUES ($1, $2, $3, $4)', [orderId, item.item_id, item.quantity, price_at_time]);
        }
        await client.query('UPDATE orders SET total_amount = $1 WHERE order_id = $2', [totalAmount, orderId]);

        await client.query('COMMIT');
        await redisClient.del('orders:today');
        res.status(201).json({ order_id: orderId, status: 'created', total: totalAmount });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err); res.status(500).send('Failed to create order.');
    } finally {
        client.release();
    }
});

// --- Menu Endpoints ---
app.get('/menu', async (req, res) => {
    try {
        const result = await pgPool.query('SELECT * FROM menu_items ORDER BY category, name');
        res.json(result.rows);
    } catch (err) {
        console.error(err); res.status(500).send('Server Error');
    }
});

const PORT = 3002;
app.listen(PORT, () => {
    console.log(`Orders service running on port ${PORT}`);
});
const express = require('express');
const { Pool } = require('pg');
const redis = require('redis');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const pgPool = new Pool({
  user: process.env.POSTGRES_USER,
  host: 'postgres',
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: 5432,
});

const redisClient = redis.createClient({ url: process.env.REDIS_URL });
redisClient.on('error', (err) => console.log('Redis Client Error', err));
(async () => await redisClient.connect())();


// Get top-level summary KPIs for today
app.get('/summary/today', async (req, res) => {
    const cacheKey = 'analytics:summary:today';
    try {
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) return res.json(JSON.parse(cachedData));

        const query = `
            SELECT
                COALESCE(SUM(total_amount), 0) AS total_sales,
                COUNT(order_id) AS total_orders,
                COALESCE(AVG(total_amount), 0) AS average_check
            FROM orders
            WHERE DATE(order_time) = CURRENT_DATE;
        `;
        const result = await pgPool.query(query);
        // Cache for 5 minutes
        await redisClient.setEx(cacheKey, 300, JSON.stringify(result.rows[0]));
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err); res.status(500).send('Server Error');
    }
});

// Get best-selling menu items
app.get('/sales-by-item', async (req, res) => {
    const cacheKey = 'analytics:sales-by-item';
    try {
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) return res.json(JSON.parse(cachedData));

        const query = `
            SELECT
                mi.name,
                SUM(oi.quantity) as quantity_sold,
                SUM(oi.quantity * oi.price_at_time) as total_revenue
            FROM order_items oi
            JOIN menu_items mi ON oi.item_id = mi.item_id
            GROUP BY mi.name
            ORDER BY total_revenue DESC
            LIMIT 10;
        `;
        const result = await pgPool.query(query);
        // Cache for 15 minutes
        await redisClient.setEx(cacheKey, 900, JSON.stringify(result.rows));
        res.json(result.rows);
    } catch (err) {
        console.error(err); res.status(500).send('Server Error');
    }
});

// Get employee performance
app.get('/employee-performance', async (req, res) => {
    const cacheKey = 'analytics:employee-performance';
    try {
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) return res.json(JSON.parse(cachedData));

        const query = `
            SELECT
                e.first_name,
                e.last_name,
                COUNT(o.order_id) as orders_taken,
                SUM(o.total_amount) as total_sales
            FROM orders o
            JOIN employees e ON o.employee_id = e.employee_id
            GROUP BY e.first_name, e.last_name
            ORDER BY total_sales DESC;
        `;
        const result = await pgPool.query(query);
        await redisClient.setEx(cacheKey, 900, JSON.stringify(result.rows));
        res.json(result.rows);
    } catch (err) {
        console.error(err); res.status(500).send('Server Error');
    }
});


const PORT = 3003;
app.listen(PORT, () => {
    console.log(`Analytics service running on port ${PORT}`);
});
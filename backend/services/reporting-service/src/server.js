require('dotenv').config({ path: '../../.env' });
const express = require('express');
const db = require('./db');

const app = express();
app.use(express.json());

// Get high-level summary stats (KPIs)
app.get('/summary', async (req, res) => {
    try {
        const totalSalesQuery = "SELECT SUM(total_amount) AS total_revenue FROM orders WHERE status = 'completed'";
        const orderCountQuery = "SELECT COUNT(*) AS total_orders FROM orders";
        const totalCustomersQuery = "SELECT COUNT(DISTINCT table_number) AS unique_customers FROM orders WHERE created_at >= NOW() - INTERVAL '1 day'"; // Example: unique tables today

        const [salesResult, orderCountResult, customerResult] = await Promise.all([
            db.query(totalSalesQuery),
            db.query(orderCountQuery),
            db.query(totalCustomersQuery)
        ]);

        res.json({
            total_revenue: parseFloat(salesResult.rows[0].total_revenue) || 0,
            total_orders: parseInt(orderCountResult.rows[0].total_orders) || 0,
            unique_customers_today: parseInt(customerResult.rows[0].unique_customers) || 0,
        });

    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

// Get sales data for a chart (e.g., total sales per day for the last 30 days)
app.get('/sales/over-time', async (req, res) => {
    try {
        const query = `
            SELECT 
                DATE(created_at) AS sale_date,
                SUM(total_amount) AS daily_sales
            FROM orders
            WHERE created_at >= NOW() - INTERVAL '30 day' AND status = 'completed'
            GROUP BY sale_date
            ORDER BY sale_date;
        `;
        const { rows } = await db.query(query);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

// Get employee performance metrics
app.get('/employees/performance', async (req, res) => {
    try {
        const query = `
            SELECT
                e.employee_id,
                e.first_name,
                e.last_name,
                COUNT(o.order_id) AS orders_taken,
                SUM(o.total_amount) AS total_sales_generated
            FROM employees e
            LEFT JOIN orders o ON e.employee_id = o.employee_id
            WHERE o.status = 'completed'
            GROUP BY e.employee_id
            ORDER BY total_sales_generated DESC;
        `;
        const { rows } = await db.query(query);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

const PORT = 3003;
app.listen(PORT, () => {
    console.log(`Reporting service running on port ${PORT}`);
});
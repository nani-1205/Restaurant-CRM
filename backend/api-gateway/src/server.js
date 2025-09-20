require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');
const proxy = require('express-http-proxy');
const morgan = require('morgan');
const authenticateToken = require('./authMiddleware');

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// --- Public Routes ---
// User service login/register routes are public
app.use('/api/users', proxy(process.env.USER_SERVICE_URL));

// --- Protected Routes ---
// All other routes require a valid token
app.use('/api/orders', authenticateToken, proxy(process.env.ORDER_SERVICE_URL));
app.use('/api/products', authenticateToken, proxy(process.env.ORDER_SERVICE_URL));
app.use('/api/reports', authenticateToken, proxy(process.env.REPORTING_SERVICE_URL));

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`API Gateway running on port ${PORT}`);
});
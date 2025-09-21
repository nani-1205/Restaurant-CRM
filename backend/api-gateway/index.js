const express = require('express');
const cors = require('cors');
const proxy = require('express-http-proxy');
const morgan = require('morgan');

const app = express();

// Middleware
app.use(cors());
app.use(morgan('dev')); // Logger for incoming requests
app.use(express.json());

// --- Proxy Routes ---
// The service names ('users-service', 'orders-service') are resolvable
// by Docker Swarm's internal DNS.

// Route requests for /users to the Users service
app.use('/users', proxy('http://users-service:3001'));

// Route requests for /orders to the Orders service
app.use('/orders', proxy('http://orders-service:3002'));

// Route requests for /analytics to the Analytics service
app.use('/analytics', proxy('http://analytics-service:3003'));

// A simple health check endpoint for the gateway itself
app.get('/health', (req, res) => {
  res.status(200).send('API Gateway is running');
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`API Gateway is running on port ${PORT}`);
});
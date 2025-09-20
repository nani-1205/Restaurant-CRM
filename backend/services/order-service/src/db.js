const { Pool } = require('pg');

// Create a new pool instance.
// The pool will read the connection details from the environment variables automatically.
// These variables (PGUSER, PGHOST, PGDATABASE, PGPASSWORD, PGPORT) are standard
// and the 'pg' library knows to look for them.
// We are setting them explicitly here for clarity and to match our .env file.
const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: parseInt(process.env.POSTGRES_PORT, 10) || 5432,
});

// We export an object with two methods:
// 1. `query`: A simple wrapper around the pool's query method. This is used for
//            running single, standalone queries.
// 2. `getClient`: A method to check out a client from the pool. This is essential
//                for running database transactions, where multiple queries need to
//                be executed on the same connection.
module.exports = {
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect(),
};
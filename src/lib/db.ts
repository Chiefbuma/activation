import mysql from 'mysql2/promise';

/**
 * Production MySQL connection pool.
 * Optimized for standalone production builds on Node.js/cPanel environments.
 */
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: Number(process.env.DB_PORT || 3306),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export const db = pool;
export default pool;

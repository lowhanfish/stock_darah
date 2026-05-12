/**
 * ========================================================
 * DATABASE CONNECTION - MySQL
 * ========================================================
 * 
 * Sama seperti Express, kita tetap butuh koneksi MySQL
 * 
 * Express: var db = require('./db/MySql/umum');
 * Fastify:  import dari file ini
 */

const mysql = require('mysql');

const db = mysql.createPool({
  connectionLimit: process.env.LIMIT_DB_MYSQL || 10,
  host: process.env.HOST_DB_MYSQL || 'localhost',
  user: process.env.USER_DB_MYSQL || 'root',
  password: process.env.PASS_DB_MYSQL || '',
  database: process.env.MAIN_DB_MYSQL || 'stokdarah_konut'
});

// Helper untuk promise-based queries
const util = require('util');
const query = util.promisify(db.query).bind(db);

// Test koneksi
db.getConnection((err) => {
  if (err) {
    console.error('❌ Database connection error:', err);
  } else {
    console.log('✅ Database connected to MySQL!');
  }
});

module.exports = {
  db,
  query
};


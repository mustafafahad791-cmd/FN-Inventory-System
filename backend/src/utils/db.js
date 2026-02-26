const { Pool } = require('pg');
require('dotenv').config();

console.log('Database Config:');
console.log('Host:', process.env.DB_HOST || 'localhost');
console.log('Port:', process.env.DB_PORT || 5432);
console.log('Database:', process.env.DB_NAME || 'fn_furniture_inventory');
console.log('User:', process.env.DB_USER || 'postgres');
console.log('Password Length:', process.env.DB_PASSWORD ? process.env.DB_PASSWORD.length : 'NOT SET');
console.log('Password chars:', process.env.DB_PASSWORD ? Array.from(process.env.DB_PASSWORD).map(c => c.charCodeAt(0)).join(',') : 'NOT SET');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'fn_furniture_inventory',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

module.exports = pool;

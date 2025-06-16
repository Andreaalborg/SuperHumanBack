// Quick test for database connection
require('dotenv').config();

const { Client } = require('pg');

const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'superhuman_db',
});

async function testConnection() {
  try {
    console.log('Testing database connection...');
    console.log('Database:', process.env.DB_NAME || 'superhuman_db');
    console.log('User:', process.env.DB_USER || 'postgres');
    
    await client.connect();
    console.log('✅ Connected to PostgreSQL!');
    
    const result = await client.query('SELECT NOW()');
    console.log('Current time from database:', result.rows[0].now);
    
    await client.end();
    console.log('✅ Connection test successful!');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Make sure:');
    console.error('1. PostgreSQL is running');
    console.error('2. Database "superhuman_db" exists');
    console.error('3. Password in .env is correct');
  }
}

testConnection();

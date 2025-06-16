require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'superhuman_db',
});

async function checkAndFixSchema() {
  try {
    await client.connect();
    console.log('Connected to the database.');

    // 1. Check if 'users' table exists
    const res = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE  table_schema = 'public'
        AND    table_name   = 'users'
      );
    `);

    if (res.rows[0].exists) {
      console.log("'users' table already exists. Checking for 'password_hash' column...");
      
      const colRes = await client.query(`
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_name = 'users';
      `);
      
      console.log('Columns in "users" table:');
      console.table(colRes.rows);

      const hasPasswordHash = colRes.rows.some(row => row.column_name === 'password_hash');
      if (!hasPasswordHash) {
          console.log("Column 'password_hash' is missing! Adding it now...");
          await client.query('ALTER TABLE users ADD COLUMN password_hash VARCHAR(255);');
          console.log("Column 'password_hash' added successfully.");
      } else {
          console.log("Column 'password_hash' already exists.");
      }
    } else {
      // 2. If not, create it with the correct structure
      console.log("'users' table does not exist. Creating it now...");
      await client.query(`
        CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log("'users' table created successfully.");
    }
  } catch (err) {
    console.error('Database schema check failed:', err);
  } finally {
    await client.end();
    console.log('Database connection closed.');
  }
}

checkAndFixSchema();
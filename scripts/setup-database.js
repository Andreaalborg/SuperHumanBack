const { Client } = require('pg');
require('dotenv').config();

async function setupDatabase() {
  // Connect to postgres database to create superhuman_db
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: 'postgres', // Connect to default postgres database first
  });

  try {
    console.log('🔗 Connecting to PostgreSQL...');
    await client.connect();
    console.log('✅ Connected to PostgreSQL');

    // Check if database exists
    const checkDb = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = 'superhuman_db'"
    );

    if (checkDb.rows.length === 0) {
      console.log('📦 Creating database superhuman_db...');
      await client.query('CREATE DATABASE superhuman_db');
      console.log('✅ Database created successfully');
    } else {
      console.log('✅ Database superhuman_db already exists');
    }

    await client.end();

    // Now connect to the new database to create extensions
    const dbClient = new Client({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: 'superhuman_db',
    });

    await dbClient.connect();
    console.log('✅ Connected to superhuman_db');

    // Create UUID extension
    console.log('📦 Creating UUID extension...');
    await dbClient.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    console.log('✅ UUID extension created');

    await dbClient.end();
    console.log('✅ Database setup completed!');

  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    process.exit(1);
  }
}

// Run the setup
setupDatabase();
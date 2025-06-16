require('dotenv').config();
const { Client } = require('pg');
const bcrypt = require('bcryptjs');

async function resetDatabase() {
  // First connect to postgres database to drop/create superhuman_db
  const adminClient = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: 'postgres', // Connect to default postgres db
  });

  try {
    await adminClient.connect();
    console.log('Connected to postgres database');
    
    // Drop existing database
    console.log('Dropping existing database...');
    await adminClient.query(`DROP DATABASE IF EXISTS superhuman_db;`);
    
    // Create new database
    console.log('Creating new database...');
    await adminClient.query(`CREATE DATABASE superhuman_db;`);
    console.log('✅ Database created');
    
    await adminClient.end();
    
    // Now connect to the new database
    const client = new Client({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: 'superhuman_db',
    });
    
    await client.connect();
    console.log('Connected to superhuman_db');
    
    // Create tables
    console.log('Creating tables...');
    
    // Users table
    await client.query(`
      CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        metadata JSONB DEFAULT '{}'::jsonb
      );
    `);
    console.log('✅ Users table created');
    
    // Activities table
    await client.query(`
      CREATE TABLE activities (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        category_id VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        duration INTEGER,
        points INTEGER NOT NULL,
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        data JSONB DEFAULT '{}'::jsonb
      );
    `);
    console.log('✅ Activities table created');
    
    // User progress table
    await client.query(`
      CREATE TABLE user_progress (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        category_id VARCHAR(255) NOT NULL,
        total_points INTEGER DEFAULT 0,
        level INTEGER DEFAULT 1,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        stats JSONB DEFAULT '{}'::jsonb,
        UNIQUE(user_id, category_id)
      );
    `);
    console.log('✅ User_progress table created');
    
    // Create indexes
    await client.query('CREATE INDEX idx_activities_user_id ON activities(user_id);');
    await client.query('CREATE INDEX idx_activities_category_id ON activities(category_id);');
    await client.query('CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);');
    console.log('✅ Indexes created');
    
    // Create test user
    const hashedPassword = await bcrypt.hash('password123', 10);
    await client.query(`
      INSERT INTO users (email, password_hash, name, metadata)
      VALUES ($1, $2, $3, $4);
    `, ['test@example.com', hashedPassword, 'Test User', JSON.stringify({ onboardingCompleted: false })]);
    console.log('✅ Test user created (test@example.com / password123)');
    
    // Verify
    const result = await client.query('SELECT * FROM users;');
    console.log('\nUsers in database:', result.rows.length);
    console.log('First user:', result.rows[0]);
    
    await client.end();
    console.log('\n✅ Database reset complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

resetDatabase();
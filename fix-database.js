require('dotenv').config();
const { Client } = require('pg');
const bcrypt = require('bcryptjs');

const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'superhuman_db',
});

async function resetDatabase() {
  try {
    await client.connect();
    console.log('✅ Connected to database for reset.');

    // 1. Slett eksisterende tabeller
    console.log('🔄 Dropping existing tables (if they exist)...');
    await client.query('DROP TABLE IF EXISTS user_progress CASCADE;');
    await client.query('DROP TABLE IF EXISTS activities CASCADE;');
    await client.query('DROP TABLE IF EXISTS users CASCADE;');
    console.log('✅ Tables dropped.');

    // 2. Opprett tabeller på nytt
    console.log('🔄 Creating tables...');
    
    await client.query(`
      CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        metadata JSONB DEFAULT '{}'::jsonb
      );
    `);
    console.log('👍 "users" table created.');

    await client.query(`
      CREATE TABLE activities (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        category_id VARCHAR(50) NOT NULL,
        name VARCHAR(255) NOT NULL,
        duration INT,
        points INT DEFAULT 0,
        completed_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        data JSONB DEFAULT '{}'::jsonb
      );
    `);
    console.log('👍 "activities" table created.');

    await client.query(`
      CREATE TABLE user_progress (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        category_id VARCHAR(50) NOT NULL,
        total_points INT DEFAULT 0,
        level INT DEFAULT 1,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        stats JSONB DEFAULT '{}'::jsonb,
        UNIQUE(user_id, category_id)
      );
    `);
    console.log('👍 "user_progress" table created.');

    // 3. Opprett en test-bruker
    console.log('�� Creating test user...');
    const email = 'test@example.com';
    const password = 'password123';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    await client.query(
      'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3)',
      [email, passwordHash, 'Test User']
    );
    console.log('✅ Test user created (test@example.com / password123)');

    console.log('🎉 Database reset complete!');

  } catch (err) {
    console.error('❌ Database reset failed:', err);
  } finally {
    await client.end();
    console.log('🚪 Database connection closed.');
  }
}

resetDatabase();
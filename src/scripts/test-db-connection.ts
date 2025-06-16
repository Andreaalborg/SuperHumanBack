import { config } from 'dotenv';
config();

import { AppDataSource } from '../config/database';

async function testDatabaseConnection() {
  console.log('🔧 Testing database connection...');
  console.log('📊 Database config:');
  console.log(`   Host: ${process.env.DB_HOST}`);
  console.log(`   Port: ${process.env.DB_PORT}`);
  console.log(`   User: ${process.env.DB_USER}`);
  console.log(`   Database: ${process.env.DB_NAME}`);
  console.log(`   Password: ${process.env.DB_PASSWORD ? '***' : 'NOT SET'}`);
  
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connection successful!');
    
    // Test query
    const result = await AppDataSource.query('SELECT NOW()');
    console.log('✅ Test query successful:', result[0]);
    
    // Check tables
    const tables = await AppDataSource.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('📋 Existing tables:', tables.map((t: any) => t.table_name));
    
    await AppDataSource.destroy();
    console.log('✅ Connection closed successfully');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Database connection failed:', error.message);
    console.error('\n💡 Troubleshooting tips:');
    console.error('1. Make sure PostgreSQL is running');
    console.error('2. Check if database "superhuman_db" exists');
    console.error('3. Verify username and password in .env file');
    console.error('4. For Windows: Check PostgreSQL service in Services');
    process.exit(1);
  }
}

testDatabaseConnection();
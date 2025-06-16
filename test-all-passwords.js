require('dotenv').config();
const { Client } = require('pg');

console.log('Testing PostgreSQL connection...\n');
console.log('Current settings:');
console.log('- Host:', process.env.DB_HOST || 'localhost');
console.log('- Port:', process.env.DB_PORT || 5432);
console.log('- User:', process.env.DB_USER || 'postgres');
console.log('- Database:', process.env.DB_NAME || 'postgres');
console.log('- Password:', process.env.DB_PASSWORD ? '***hidden***' : '(empty)');
console.log('- Password length:', process.env.DB_PASSWORD ? process.env.DB_PASSWORD.length : 0);
console.log('');

const passwords = [
  process.env.DB_PASSWORD,
  'Beverveien27',
  'beverveien27',
  'postgres',
  'admin',
  '123456',
  ''
];

async function testPassword(password) {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: password,
    database: 'postgres', // Always use postgres db for testing
  });
  
  try {
    await client.connect();
    console.log(`✅ SUCCESS with password: "${password}"`);
    await client.end();
    return true;
  } catch (error) {
    console.log(`❌ Failed with password: "${password}" - ${error.message}`);
    return false;
  }
}

async function findPassword() {
  console.log('Testing passwords...\n');
  
  for (const password of passwords) {
    if (await testPassword(password)) {
      console.log('\n✅ FOUND WORKING PASSWORD!');
      console.log('Update your .env file with:');
      console.log(`DB_PASSWORD=${password}`);
      return;
    }
  }
  
  console.log('\n❌ No password worked.');
  console.log('\nPossible solutions:');
  console.log('1. Check if PostgreSQL service is running');
  console.log('2. Try logging into pgAdmin first');
  console.log('3. Reset PostgreSQL password');
  console.log('4. Check Windows Event Viewer for PostgreSQL errors');
}

findPassword();

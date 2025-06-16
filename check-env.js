console.log('Checking .env file...\n');

const fs = require('fs');
const path = require('path');

// Check if .env exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('❌ .env file not found!');
  process.exit(1);
}

// Read .env file
const envContent = fs.readFileSync(envPath, 'utf8');
console.log('📄 .env file content:');
console.log('====================');
const lines = envContent.split('\n');
lines.forEach(line => {
  if (line.includes('PASSWORD')) {
    const [key, ...valueParts] = line.split('=');
    const value = valueParts.join('=');
    console.log(`${key}=***hidden*** (length: ${value ? value.length : 0})`);
  } else if (line.trim() && !line.startsWith('#')) {
    console.log(line);
  }
});
console.log('====================\n');

// Load with dotenv
require('dotenv').config();

console.log('🔧 Environment variables loaded:');
console.log('DB_HOST:', process.env.DB_HOST || 'localhost');
console.log('DB_PORT:', process.env.DB_PORT || '5432');
console.log('DB_USER:', process.env.DB_USER || 'postgres');
console.log('DB_NAME:', process.env.DB_NAME || 'postgres');
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? `***hidden*** (${process.env.DB_PASSWORD.length} chars)` : '(not set)');

// Check for common issues
console.log('\n🔍 Checking for common issues:');

if (process.env.DB_PASSWORD && process.env.DB_PASSWORD.includes(' ')) {
  console.log('⚠️  Password contains spaces!');
}

if (process.env.DB_PASSWORD && process.env.DB_PASSWORD !== process.env.DB_PASSWORD.trim()) {
  console.log('⚠️  Password has leading/trailing whitespace!');
}

if (!process.env.DB_PASSWORD) {
  console.log('⚠️  DB_PASSWORD is not set or empty!');
}
const { Client } = require('pg');
require('dotenv').config();

async function testConnection() {
  const configs = [
    { host: 'localhost', name: 'localhost' },
    { host: '127.0.0.1', name: '127.0.0.1' },
    { host: '172.24.0.1', name: 'Windows Host IP' },
    { host: 'host.docker.internal', name: 'Docker Host' },
  ];

  for (const config of configs) {
    const client = new Client({
      host: config.host,
      port: parseInt(process.env.DB_PORT || '5432'),
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: 'postgres',
      connectionTimeoutMillis: 3000,
    });

    console.log(`\nTrying ${config.name} (${config.host})...`);
    
    try {
      await client.connect();
      console.log(`✅ SUCCESS: Connected via ${config.name}`);
      await client.end();
      return config.host;
    } catch (error) {
      console.log(`❌ FAILED: ${error.message}`);
    }
  }
  
  console.log('\n💡 Tips:');
  console.log('1. Make sure PostgreSQL is configured to accept connections from WSL');
  console.log('2. Check Windows Firewall settings');
  console.log('3. Check PostgreSQL pg_hba.conf file');
  console.log('4. Try running: npm run dev:mock to run without database');
}

testConnection();
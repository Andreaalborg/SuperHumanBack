console.log('🔧 Debug startup script...');

// Load environment variables FIRST
import { config } from 'dotenv';
config();
console.log('✅ Environment loaded');

console.log('📦 Loading core modules...');
import 'reflect-metadata';
console.log('  ✅ reflect-metadata');

import express from 'express';
console.log('  ✅ express');

import { ApolloServer } from '@apollo/server';
console.log('  ✅ apollo server');

console.log('📊 Loading database config...');
// Don't actually connect, just check if it loads
try {
  const db = require('./config/database');
  console.log('  ✅ database config loaded');
} catch (error: any) {
  console.log('  ❌ database config error:', error.message);
}

console.log('🎯 Loading resolvers...');
try {
  const resolvers = require('./resolvers');
  console.log('  ✅ resolvers loaded');
} catch (error: any) {
  console.log('  ❌ resolvers error:', error.message);
}

console.log('🚀 Starting simple server...');
const app = express();
app.get('/', (req, res) => res.json({ status: 'Debug server OK' }));

const PORT = 4002;
app.listen(PORT, () => {
  console.log(`✅ Debug server running on http://localhost:${PORT}`);
  console.log('\n📋 Next: Check which import is causing the hang');
  
  // Exit after 5 seconds
  setTimeout(() => {
    console.log('✅ Test complete, exiting...');
    process.exit(0);
  }, 5000);
});
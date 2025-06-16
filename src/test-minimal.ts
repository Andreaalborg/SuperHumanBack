console.log('Starting minimal test...');

import { config } from 'dotenv';
config();
console.log('✅ Dotenv loaded');

import express from 'express';
console.log('✅ Express imported');

const app = express();
const PORT = 4001;

app.get('/', (req, res) => {
  res.json({ status: 'Minimal server working!' });
});

app.listen(PORT, () => {
  console.log(`✅ Minimal server running on http://localhost:${PORT}`);
});

console.log('✅ All imports successful');
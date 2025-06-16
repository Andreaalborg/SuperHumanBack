const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Test endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'SuperHuman Backend Running!',
    status: 'OK',
    endpoints: {
      graphql: 'Not available in simple mode',
      test: '/test'
    }
  });
});

app.get('/test', (req, res) => {
  res.json({
    message: 'Backend fungerer!',
    postgres: 'Ikke koblet til',
    tips: 'Kjør FULL_DEBUG.bat for å finne riktig passord'
  });
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`
🚀 SuperHuman Simple Backend Running!
=====================================
✅ Server: http://localhost:${PORT}
✅ Test: http://localhost:${PORT}/test

Dette er en enkel test-server uten database.
For full GraphQL backend, må PostgreSQL passord fikses.
  `);
});
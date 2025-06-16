// Test JWT isolert
const jwt = require('jsonwebtoken');

const testPayload = {
  userId: 'test-123',
  email: 'test@test.com'
};

const secret = 'test-secret';
const expiresIn = '7d';

try {
  // Test sign
  const token = jwt.sign(testPayload, secret, { expiresIn });
  console.log('✅ JWT sign fungerer!');
  console.log('Token:', token);
  
  // Test verify
  const decoded = jwt.verify(token, secret);
  console.log('✅ JWT verify fungerer!');
  console.log('Decoded:', decoded);
  
} catch (error) {
  console.error('❌ JWT Error:', error);
}

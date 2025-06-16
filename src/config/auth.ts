import * as dotenv from 'dotenv';

dotenv.config();

export const authConfig = {
  jwtSecret: process.env.JWT_SECRET || 'default-secret-change-this',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  bcryptRounds: 10,
};

// Validate auth config
if (process.env.NODE_ENV === 'production' && authConfig.jwtSecret === 'default-secret-change-this') {
  throw new Error('JWT_SECRET must be set in production!');
}

export const generateTokenPayload = (user: { id: string; email: string }) => {
  return {
    userId: user.id,
    email: user.email,
  };
};

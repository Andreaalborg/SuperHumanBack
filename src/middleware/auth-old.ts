import { Request, Response, NextFunction } from 'express';
import { authConfig } from '../config/auth';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { signToken, verifyToken, JwtPayload } from '../utils/jwt';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
      userId?: string;
    }
  }
}

export { JwtPayload } from '../utils/jwt';

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'No authorization header provided',
      });
    }
    
    // Check if bearer token
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        success: false,
        message: 'Invalid authorization format. Use: Bearer <token>',
      });
    }
    
    const token = parts[1];
    
    try {
      // Verify token
      const decoded = verifyToken(token);
      
      // Get user from database
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({
        where: { id: decoded.userId },
      });
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found',
        });
      }
      
      // Attach user to request
      req.user = user;
      req.userId = user.id;
      
      next();
    } catch (jwtError) {
      console.error('JWT verification error:', jwtError);
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }
  } catch (error) {
    console.error('Authentication middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Optional authentication - doesn't fail if no token
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return next();
    }
    
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return next();
    }
    
    const token = parts[1];
    
    try {
      const decoded = verifyToken(token);
      
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({
        where: { id: decoded.userId },
      });
      
      if (user) {
        req.user = user;
        req.userId = user.id;
      }
    } catch (jwtError) {
      // Silent fail - continue without user
    }
    
    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    next();
  }
};

// Generate JWT token
export const generateToken = (user: User): string => {
  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
  };
  
  return signToken(payload);
};

// Verify token (for GraphQL context)
export const verifyTokenAndGetUser = async (token: string): Promise<User | null> => {
  try {
    const decoded = verifyToken(token);
    
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { id: decoded.userId },
    });
    
    return user || null;
  } catch (error) {
    return null;
  }
};

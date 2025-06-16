// Load environment variables FIRST
import { config } from 'dotenv';
console.log('🔧 Loading environment variables...');
config();
console.log('✅ Environment loaded');

import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { createServer } from 'http';
import 'reflect-metadata';
import { RATE_LIMITS } from './config/constants';
import { connectDatabase, disconnectDatabase } from './config/database';
import { typeDefs } from './graphql';
import { resolvers } from './resolvers';
import { createContext } from './resolvers/authResolver';

const app = express();
const httpServer = createServer(app);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
}));

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8081',
  credentials: true,
}));

// Body parser
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: RATE_LIMITS.WINDOW_MS,
  max: RATE_LIMITS.MAX_REQUESTS,
  message: 'Too many requests from this IP, please try again later.',
});

app.use('/graphql', limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: '1.0.0'
  });
});

// Welcome endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to SuperHuman API',
    graphql: '/graphql',
    health: '/health',
  });
});

// Global variable for mock mode
const isMockMode = process.env.MOCK_MODE === 'true' || (process.env.NODE_ENV === 'development' && !process.env.DB_HOST);

async function startServer() {
  try {
    
    if (isMockMode) {
      console.log('🎭 Starting in MOCK MODE - No database required');
      console.log('📝 Using in-memory data for development');
    } else {
      // Try to connect to database in production mode
      try {
        await connectDatabase();
        console.log('✅ Database connected successfully');
      } catch (dbError: any) {
        console.error('❌ Database connection failed:', dbError.message);
        console.error('💡 Use npm run dev:mock to run without database');
        process.exit(1);
      }
    }

    // Create Apollo Server
    const server = new ApolloServer({
      typeDefs,
      resolvers,
      introspection: process.env.NODE_ENV !== 'production',
      formatError: (err) => {
        // Log error in development
        if (process.env.NODE_ENV === 'development') {
          console.error('GraphQL Error:', err);
        }
        
        // Don't expose internal errors in production
        if (process.env.NODE_ENV === 'production' && err.message.includes('Internal')) {
          return new Error('Internal server error');
        }
        
        return err;
      },
    });

    // Start Apollo Server
    await server.start();
    console.log('✅ Apollo Server started');

    // Apply Apollo middleware
    app.use(
      '/graphql',
      expressMiddleware(server, {
        context: createContext,
      })
    );

    const PORT = parseInt(process.env.PORT || '4000', 10);
    const HOST = process.env.HOST || '0.0.0.0';

    const serverInstance = httpServer.listen({ port: PORT, host: HOST }, () => {
      console.log(`
🚀 SuperHuman Backend Server Ready!
===================================
🌐 Server:   http://${HOST}:${PORT}
📊 GraphQL:  http://${HOST}:${PORT}/graphql
💚 Health:   http://${HOST}:${PORT}/health
🌍 Frontend: ${process.env.FRONTEND_URL || 'http://localhost:8081'}
⚙️  Mode:     ${process.env.NODE_ENV || 'development'} ${isMockMode ? '(MOCK)' : ''}
📱 Phone:    http://172.24.8.72:${PORT}/graphql
===================================
${isMockMode ? '🎭 MOCK MODE: Using in-memory data' : '💾 DATABASE: Connected to PostgreSQL'}
🤖 AI Service Status: ${process.env.OPENAI_API_KEY ? '✅ OpenAI Connected' : '❌ No OpenAI Key'}
===================================
      `);
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('\n📴 SIGTERM signal received: closing HTTP server');
      serverInstance.close(async () => {
        console.log('HTTP server closed');
        await server.stop();
        await disconnectDatabase();
        process.exit(0);
      });
    });

    process.on('SIGINT', async () => {
      console.log('\n📴 SIGINT signal received: closing HTTP server');
      serverInstance.close(async () => {
        console.log('HTTP server closed');
        await server.stop();
        await disconnectDatabase();
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // In production, you might want to send this to a logging service
});

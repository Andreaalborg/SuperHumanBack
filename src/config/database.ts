import { DataSource } from 'typeorm';
import { User } from '../entities/User';
import { Activity } from '../entities/Activity';
import { UserProgress } from '../entities/UserProgress';
import { Friend } from '../entities/Friend';
import { Challenge } from '../entities/Challenge';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'superhuman_db',
  synchronize: false, // Temporarily disabled due to existing data
  logging: process.env.NODE_ENV === 'development',
  entities: [User, Activity, UserProgress, Friend, Challenge],
  migrations: ['src/migrations/*.ts'],
  subscribers: ['src/subscribers/*.ts'],
});

export const connectDatabase = async () => {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connection established');
    
    // Run migrations if needed
    const pendingMigrations = await AppDataSource.showMigrations();
    if (pendingMigrations) {
      console.log('📦 Running pending migrations...');
      await AppDataSource.runMigrations();
      console.log('✅ Migrations completed');
    }
    
    return true;
  } catch (error: any) {
    console.error('❌ Error connecting to database:', error.message);
    
    // Common error messages
    if (error.message.includes('database "superhuman_db" does not exist')) {
      console.error('💡 Database does not exist. Please create it using:');
      console.error('   psql -U postgres -c "CREATE DATABASE superhuman_db;"');
    } else if (error.message.includes('password authentication failed')) {
      console.error('💡 Invalid database credentials. Check your .env file');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.error('💡 PostgreSQL is not running or not accessible');
    }
    
    throw error;
  }
};

export const disconnectDatabase = async () => {
  try {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('Database connection closed');
    }
  } catch (error) {
    console.error('Error disconnecting from database:', error);
    throw error;
  }
};

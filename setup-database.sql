-- Create database if not exists
SELECT 'CREATE DATABASE superhuman_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'superhuman_db')\gexec

-- Connect to database
\c superhuman_db;

-- Create extension for UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Show current database
SELECT current_database();

-- List tables
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
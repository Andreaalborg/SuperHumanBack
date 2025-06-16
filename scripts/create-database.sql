-- Create the SuperHuman database
CREATE DATABASE superhuman_db
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.UTF8'
    LC_CTYPE = 'en_US.UTF8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

-- Connect to the database
\c superhuman_db;

-- Create UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Grant all privileges to postgres user
GRANT ALL PRIVILEGES ON DATABASE superhuman_db TO postgres;
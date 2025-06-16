@echo off
echo ==========================================
echo 🚀 SUPERHUMAN BACKEND SETUP
echo ==========================================
echo.

REM Check if node is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js er ikke installert!
    echo    Last ned fra: https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js er installert

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ NPM er ikke installert!
    pause
    exit /b 1
)
echo ✅ NPM er installert

REM Check if .env exists
if not exist .env (
    echo.
    echo ⚠️  .env fil mangler!
    echo    Kopierer .env.example...
    copy .env.example .env
    echo.
    echo 📝 VIKTIG: Rediger .env filen med dine database credentials!
    echo    Spesielt DB_PASSWORD må endres.
    echo.
    pause
)

REM Install dependencies if node_modules doesn't exist
if not exist node_modules (
    echo.
    echo 📦 Installerer dependencies...
    npm install
)

echo.
echo ==========================================
echo ✅ Backend er klar!
echo ==========================================
echo.
echo Neste steg:
echo 1. Sørg for at PostgreSQL kjører
echo 2. Opprett database: CREATE DATABASE superhuman_db;
echo 3. Rediger .env med riktig DB_PASSWORD
echo 4. Kjør: npm run dev
echo.
echo GraphQL Playground: http://localhost:4000/graphql
echo.
pause

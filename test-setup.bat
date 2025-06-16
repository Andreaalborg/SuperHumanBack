@echo off
echo ==========================================
echo 🧪 SUPERHUMAN BACKEND TEST
echo ==========================================
echo.

REM Test Node
echo Testing Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js ikke installert!
    pause
    exit /b 1
)
echo ✅ Node.js OK

REM Test PostgreSQL
echo.
echo Testing PostgreSQL...
psql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  PostgreSQL ikke funnet i PATH
    echo    Sjekk at PostgreSQL er installert og kjører
) else (
    echo ✅ PostgreSQL installert
)

REM Check if .env exists
echo.
if exist .env (
    echo ✅ .env fil funnet
) else (
    echo ❌ .env fil mangler!
    echo    Kopierer fra .env.example...
    copy .env.example .env
)

REM Check node_modules
echo.
if exist node_modules (
    echo ✅ Dependencies installert
) else (
    echo ⚠️  Dependencies ikke installert
    echo    Kjør: npm install
)

REM Try to build
echo.
echo Testing TypeScript build...
call npm run build >nul 2>&1
if %errorlevel% eq 0 (
    echo ✅ Build successful!
) else (
    echo ❌ Build failed!
    echo    Kjør: npm run build
    echo    for å se feilmeldinger
)

echo.
echo ==========================================
echo 📋 NESTE STEG:
echo ==========================================
echo 1. Sørg for at PostgreSQL kjører
echo 2. Opprett database:
echo    psql -U postgres -c "CREATE DATABASE superhuman_db;"
echo 3. Rediger .env med riktig DB_PASSWORD
echo 4. Kjør: npm install (hvis ikke gjort)
echo 5. Kjør: npm run dev
echo.
pause

@echo off
echo Starting PostgreSQL...

REM Try to start PostgreSQL service
net start postgresql-x64-16 2>nul || net start postgresql-x64-15 2>nul || net start postgresql-x64-14 2>nul || (
    echo PostgreSQL service not found or already running.
    echo.
    echo Please start PostgreSQL manually:
    echo 1. Open Services (Win+R, type: services.msc)
    echo 2. Find PostgreSQL service
    echo 3. Right-click and select Start
    echo.
    echo Or install PostgreSQL from: https://www.postgresql.org/download/windows/
)

echo.
echo Checking if PostgreSQL is running...
timeout /t 2 >nul

REM Try to connect to PostgreSQL
"C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -c "SELECT version();" 2>nul || (
    "C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres -c "SELECT version();" 2>nul || (
        "C:\Program Files\PostgreSQL\14\bin\psql.exe" -U postgres -c "SELECT version();" 2>nul || (
            echo PostgreSQL is not accessible. Please check installation.
        )
    )
)

pause
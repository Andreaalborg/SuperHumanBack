# Database Setup Guide 🗄️

## Status (13. juni 2025)

**Backend kjører i mock mode** fordi PostgreSQL ikke er startet.

## 🚀 Quick Start for Windows

### 1. Start PostgreSQL Service

**Option A: Via Services (Anbefalt)**
1. Trykk `Win + R`, skriv `services.msc`
2. Finn "postgresql-x64-16" (eller 15/14)
3. Høyreklikk → Start
4. Status skal være "Running"

**Option B: Via Command Line (Admin)**
```cmd
net start postgresql-x64-16
```

### 2. Opprett Database

Åpne PowerShell som admin:
```powershell
# Koble til PostgreSQL
"C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres

# I psql prompt:
CREATE DATABASE superhuman_db;
\q
```

### 3. Test Connection

```bash
cd SuperHumanBackend
npx ts-node src/scripts/test-db-connection.ts
```

Forventet output:
```
✅ Database connection successful!
✅ Test query successful
📋 Existing tables: []  # Tom første gang
```

### 4. Kjør Migrations

```bash
npm run migration:run
```

Dette oppretter alle tabeller:
- users
- activities  
- user_progress
- friends
- challenges
- categories

### 5. Start Backend med Database

```bash
npm run dev
```

Se etter:
```
✅ Database connected successfully
🤖 AI Service Status: ✅ OpenAI Connected
🚀 SuperHuman Backend Server Ready!
```

## 🔍 Troubleshooting

### "connect ECONNREFUSED 127.0.0.1:5432"
- PostgreSQL kjører ikke
- Sjekk Services eller bruk `net start`

### "database superhuman_db does not exist"
- Opprett database med psql kommandoen over

### "password authentication failed"
- Sjekk DB_PASSWORD i .env fil
- Standard: `Beverveien27`

### Mock Mode Issues
Hvis backend fortsatt bruker mock mode:
1. Sjekk at database er tilkoblet
2. Se etter "⚠️ Database connection failed" i console
3. Restart backend etter database er oppe

## 📊 Verifiser Database

Test at alt fungerer:
```graphql
mutation Register {
  register(email: "test2@test.com", password: "123456", name: "Test User 2") {
    token
    user {
      id
      email
    }
  }
}

query GetCategories {
  categories {
    id
    name
    icon
  }
}
```

## 🎯 Neste Steg

Når database kjører:
1. ✅ Alle features fungerer med ekte data
2. ✅ Social features lagres permanent
3. ✅ AI Coach husker conversation history
4. ✅ Klar for deployment

## 💡 Tips

- Hold PostgreSQL service kjørende
- Backup database før store endringer
- Bruk pgAdmin 4 for visuell database management
- Test migrations lokalt før deployment
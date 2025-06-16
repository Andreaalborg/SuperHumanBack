# 🐛 FEILSØKING OG LØSNINGER

## TypeScript feil som er fikset:

### 1. ✅ authService.ts - Variable naming konflikt
**Problem:** `isValidPassword` brukt før deklarasjon
**Løsning:** Endret variabelnavn til `isPasswordValid`, `isOldPasswordValid`, `isPasswordCorrect`

### 2. ✅ auth.ts - JWT type mismatch
**Problem:** `expiresIn` type ikke gjenkjent
**Løsning:** La til type assertion: `as string | number`

### 3. ✅ activityService.ts - Null vs undefined
**Problem:** `duration` satt til `null` når TypeORM forventer `undefined`
**Løsning:** Endret fra `duration || null` til `duration || undefined`

### 4. ✅ resolvers/index.ts - Implisitt any type
**Problem:** `jsonScalar` hadde implisitt any type
**Løsning:** La til eksplisitte typer og egen `parseLiteral` funksjon

## 🚀 Start backend nå:

### 1. Installer dependencies
```bash
cd backend
npm install
```

### 2. Sjekk at PostgreSQL kjører
```bash
psql --version
```

### 3. Opprett database
```bash
psql -U postgres
```
```sql
CREATE DATABASE superhuman_db;
\q
```

### 4. Rediger .env
Åpne `backend/.env` og sett riktig passord:
```
DB_PASSWORD=ditt-postgres-passord-her
```

### 5. Bygg og start
```bash
npm run build
npm run dev
```

## 🧪 Test at det fungerer:

### 1. Health check
Åpne: http://localhost:4000/health

### 2. GraphQL Playground
Åpne: http://localhost:4000/graphql

### 3. Test registrering:
```graphql
mutation {
  register(input: {
    email: "test@test.com"
    password: "123456"
    name: "Test User"
  }) {
    token
    user {
      id
      email
      name
    }
  }
}
```

## ❓ Hvis det fortsatt feiler:

### Port allerede i bruk?
```bash
# Windows - finn prosess på port 4000
netstat -ano | findstr :4000
# Drep prosessen med PID
taskkill /PID <PID> /F
```

### Database connection failed?
1. Sjekk at PostgreSQL service kjører
2. Sjekk credentials i .env
3. Test connection med pgAdmin

### Module not found?
```bash
# Slett node_modules og reinstaller
rmdir /s /q node_modules
npm install
```

### TypeScript errors?
```bash
# Sjekk for gjenværende feil
npm run build
```

## 📞 Support
Hvis du fortsatt har problemer, sjekk:
1. Alle filer er synkronisert (auto-sync.bat kjører)
2. Du jobber i riktig mappe (C:\Users\Hjemme-PC\Desktop\SuperHuman)
3. Node og npm er oppdatert (node v18+, npm v9+)

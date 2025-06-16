# Database Setup Log - SuperHuman Backend

## Dato: 13. januar 2025

### Problem
Backend kunne ikke starte på grunn av database-tilkoblingsfeil:
```
error: password authentication failed for user "postgres"
```

### Løsning - Steg for steg

#### 1. Sjekket PostgreSQL-status på Windows
```powershell
Get-Service -Name "postgresql*"
```
Resultat: PostgreSQL kjørte allerede (`postgresql-x64-16`)

#### 2. Testet database-tilkobling
```powershell
cd "C:\Program Files\PostgreSQL\16\bin"
.\psql -U postgres -h localhost
```
Passord: `Beverveien27` (fungerte)

#### 3. Sjekket eksisterende databaser
```sql
\l
```
Fant at databasen het `superhuman_db` (ikke `superhuman`)

#### 4. Fikset environment-variabler i `.env`
**Problem 1**: Skrivefeil i variabelnavn
- `DB_USERname` → `DB_USER`
- `DB_DATABASE` → `DB_NAME`

**Problem 2**: Feil database-navn
- `superhuman` → `superhuman_db`

#### 5. Fikset rekkefølge på import i `src/index.ts`
Flyttet `dotenv` config til toppen av filen:
```typescript
// Load environment variables FIRST
import { config } from 'dotenv';
config();

// Resten av imports...
```

#### 6. Håndterte eksisterende data i databasen
TypeORM prøvde å endre skjema, men feilet fordi:
- Eksisterende brukere manglet `email` 
- Eksisterende brukere manglet `password_hash`

**Midlertidig løsning**:
- Gjorde `email` nullable i `User.ts`
- Gjorde `passwordHash` nullable i `User.ts`
- Deaktiverte automatisk synkronisering: `synchronize: false`

### Endelige innstillinger

#### `.env` fil:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=Beverveien27
DB_NAME=superhuman_db
```

#### PostgreSQL på Windows:
- Service: `postgresql-x64-16`
- Host: localhost
- Port: 5432
- Database: `superhuman_db`
- Bruker: `postgres`

### Resultat
✅ Backend kjører nå uten problemer på:
- Server: http://0.0.0.0:4000
- GraphQL: http://localhost:4000/graphql
- Health: http://localhost:4000/health

### Neste steg (anbefalt)
1. Vurder å lage proper migrations for å håndtere database-skjema
2. Oppdater eksisterende brukere med email og passord
3. Reaktiver `synchronize: true` etter data er migrert
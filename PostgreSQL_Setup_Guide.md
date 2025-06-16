# PostgreSQL Setup for SuperHuman

## Problem: WSL kan ikke koble til Windows PostgreSQL

WSL (Windows Subsystem for Linux) kan ikke koble direkte til PostgreSQL som kjører på Windows uten ekstra konfigurasjon.

## Løsninger:

### Alternativ 1: Konfigurer PostgreSQL for eksterne tilkoblinger (Anbefalt)

1. **Finn PostgreSQL installasjonsmappen** (vanligvis `C:\Program Files\PostgreSQL\XX\data\`)

2. **Rediger `postgresql.conf`**:
   - Finn linjen: `#listen_addresses = 'localhost'`
   - Endre til: `listen_addresses = '*'`
   - Eller mer sikkert: `listen_addresses = 'localhost,172.24.0.1'`

3. **Rediger `pg_hba.conf`**:
   - Legg til denne linjen:
   ```
   host    all             all             172.24.0.0/16           md5
   ```

4. **Restart PostgreSQL tjenesten**:
   - Åpne Services (Win+R, skriv `services.msc`)
   - Finn "postgresql-x64-XX" 
   - Høyreklikk og velg "Restart"

5. **Windows Firewall**:
   - Åpne Windows Defender Firewall
   - Klikk "Allow an app"
   - Finn PostgreSQL og tillat både private og public networks

### Alternativ 2: Bruk pgAdmin 4 for å opprette database

1. Åpne pgAdmin 4 på Windows
2. Koble til din lokale PostgreSQL server
3. Høyreklikk på "Databases"
4. Velg "Create" > "Database"
5. Navn: `superhuman_db`
6. Owner: `postgres`
7. Klikk "Save"

### Alternativ 3: Kjør uten database (Mock Mode)

Backend er konfigurert til å kjøre uten database i utviklingsmodus:

```bash
cd /mnt/c/Users/Hjemme-PC/Desktop/SuperHumanBackend
npm run dev
```

Dette vil:
- Bruke in-memory data
- Alle features fungerer (inkludert AI Coach)
- Data blir ikke lagret permanent
- Perfekt for testing og utvikling

## Sjekk om database er opprettet

Fra Windows Command Prompt eller PowerShell:
```cmd
psql -U postgres -c "\l" | findstr superhuman_db
```

Eller bruk pgAdmin 4 for å se alle databaser visuelt.

## Når du er klar for produksjon

For produksjon bør du:
1. Bruke en cloud-hosted PostgreSQL (f.eks. Supabase, Neon, AWS RDS)
2. Eller installere PostgreSQL direkte i WSL2
3. Eller bruke Docker for både backend og database
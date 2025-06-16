# SuperHuman Backend Deployment Guide

## Deploy til Render.com

### Steg 1: Opprett Render konto
1. Gå til [render.com](https://render.com)
2. Sign up med GitHub konto
3. Bekreft email

### Steg 2: Push kode til GitHub
```bash
# Opprett nytt repository på GitHub først
git remote add origin https://github.com/YOUR_USERNAME/superhuman-backend.git
git branch -M main
git push -u origin main
```

### Steg 3: Deploy på Render
1. Logg inn på Render Dashboard
2. Klikk "New +" → "Web Service"
3. Koble til GitHub repository
4. Velg "superhuman-backend" repo
5. Render vil automatisk oppdage `render.yaml`
6. Klikk "Create Web Service"

### Steg 4: Legg til miljøvariabler
I Render Dashboard → Environment:
- `OPENAI_API_KEY`: Din OpenAI API nøkkel

### Steg 5: Database opprettes automatisk
Render vil automatisk:
- Opprette PostgreSQL database
- Kjøre migrations
- Koble alt sammen

## Backend URL
Etter deployment får du en URL som:
```
https://superhuman-backend-xxxx.onrender.com
```

## Oppdater Frontend
I Expo appen, oppdater API URL:
```typescript
// src/config/api.ts
const API_URL = __DEV__ 
  ? 'http://localhost:4000/graphql'
  : 'https://superhuman-backend-xxxx.onrender.com/graphql';
```

## Overvåking
- Health check: `https://your-backend.onrender.com/health`
- GraphQL Playground: `https://your-backend.onrender.com/graphql`
- Logs: I Render Dashboard

## Gratis Tier Begrensninger
- Backend "sover" etter 15 min inaktivitet
- Første request tar 30-60 sekunder
- 750 timer per måned (nok for testing)
- Database: 1GB storage

## Oppgradering senere
Når du trenger mer:
- Upgrade til Starter plan ($7/måned)
- Ingen sleep
- Bedre performance
- Mer database storage
# 🚨 QUICK FIX FOR JWT ERROR

## Løsningen som er implementert:

Jeg har endret fra ES6 import til CommonJS require i `src/middleware/auth.ts`:

```typescript
// Fra:
import jwt from 'jsonwebtoken';

// Til:
const jwt = require('jsonwebtoken');
```

## Hvorfor dette fungerer:

1. TypeScript med CommonJS moduler kan ha problemer med default exports
2. `require` syntaks er alltid kompatibel
3. jsonwebtoken eksporterer både CommonJS og ES modules, men TypeScript kan bli forvirret

## Test at det fungerer:

### 1. Test JWT isolert:
```bash
cd backend
node test-jwt.js
```

Dette skal vise:
- ✅ JWT sign fungerer!
- ✅ JWT verify fungerer!

### 2. Bygg prosjektet:
```bash
npm run build
```

### 3. Start serveren:
```bash
npm run dev
```

## Alternative løsninger hvis det fortsatt feiler:

### Alternativ 1: Downgrade jsonwebtoken
```bash
npm uninstall jsonwebtoken @types/jsonwebtoken
npm install jsonwebtoken@8.5.1 @types/jsonwebtoken@8.5.1
```

### Alternativ 2: Endre tsconfig.json
Legg til:
```json
{
  "compilerOptions": {
    "allowSyntheticDefaultImports": true
  }
}
```

### Alternativ 3: Bruk en wrapper
Lag `src/utils/jwt.ts`:
```typescript
const jwt = require('jsonwebtoken');

export const sign = (payload: any, secret: string, options: any) => {
  return jwt.sign(payload, secret, options);
};

export const verify = (token: string, secret: string) => {
  return jwt.verify(token, secret);
};
```

Men den nåværende løsningen med `require` skal fungere fint! 🎯

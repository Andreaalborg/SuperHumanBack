# 🔧 JWT Import Fix

Jeg har nå endret måten jsonwebtoken importeres på i `auth.ts`:

## Endring:
Fra:
```typescript
import * as jwt from 'jsonwebtoken';
```

Til:
```typescript
import jwt from 'jsonwebtoken';
```

Dette er den standard måten å importere jsonwebtoken på, og skal løse type-problemet med `jwt.sign()`.

## Test nå:

```bash
cd backend
npm run build
```

Hvis det fortsatt feiler, kan vi også prøve:
1. Slette `node_modules` og reinstallere
2. Sjekke TypeScript config
3. Bruke en annen versjon av jsonwebtoken

Men prøv build først!

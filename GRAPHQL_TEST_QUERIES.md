# 🧪 SUPERHUMAN GRAPHQL TEST QUERIES

Kopier og lim inn disse i GraphQL Playground (http://localhost:4000/graphql)

## 1️⃣ Registrer ny bruker
```graphql
mutation RegisterUser {
  register(
    email: "alexander@superhuman.no"
    password: "test123"
    name: "Alexander Nordahl"
  ) {
    token
    user {
      id
      email
      name
      createdAt
    }
  }
}
```

## 2️⃣ Logg inn
```graphql
mutation LoginUser {
  login(
    email: "alexander@superhuman.no"
    password: "test123"
  ) {
    token
    user {
      id
      email
      name
    }
  }
}
```

## 3️⃣ Hent min profil (krever token)
Sett token i Headers:
```json
{
  "Authorization": "Bearer DIN_TOKEN_HER"
}
```

Query:
```graphql
query GetMyProfile {
  me {
    id
    email
    name
    createdAt
    activities {
      id
      name
      points
      categoryId
      completedAt
    }
    progress {
      categoryId
      totalPoints
      level
    }
  }
}
```

## 4️⃣ Lagre en aktivitet (krever token)
```graphql
mutation SaveActivity {
  saveActivity(
    categoryId: "physical"
    name: "Morgenløp 5km"
    duration: 30
    points: 25
  ) {
    id
    name
    points
    categoryId
    completedAt
  }
}
```

## 5️⃣ Hent mine aktiviteter (krever token)
```graphql
query GetMyActivities {
  myActivities {
    id
    name
    points
    duration
    categoryId
    completedAt
  }
}
```

## 6️⃣ Hent min progresjon (krever token)
```graphql
query GetMyProgress {
  myProgress {
    categoryId
    totalPoints
    level
    stats
  }
}
```

## 7️⃣ Oppdater aktivitet (krever token)
```graphql
mutation UpdateActivity {
  updateActivity(
    id: "ACTIVITY_ID_HER"
    name: "Morgenløp 7km"
    points: 35
    duration: 40
  ) {
    id
    name
    points
    duration
  }
}
```

## 8️⃣ Slett aktivitet (krever token)
```graphql
mutation DeleteActivity {
  deleteActivity(id: "ACTIVITY_ID_HER")
}
```

## 💡 Tips:
1. Start alltid med å registrere en bruker
2. Kopier token fra responsen
3. Bruk token i Authorization header for beskyttede queries
4. Token format: "Bearer eyJhbGc..."

## 📝 Kategorier du kan bruke:
- physical (Fysisk helse)
- mental (Mental styrke)
- career (Karriere)
- social (Sosiale ferdigheter)
- nutrition (Ernæring)
- sleep (Søvn)
- mindfulness (Mindfulness)
- learning (Læring)
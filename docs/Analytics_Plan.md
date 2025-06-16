# Analytics & User Tracking Plan for SuperHuman

## Hva vi trenger å spore

### 1. User Engagement Metrics
- **Session Duration**: Hvor lenge bruker appen per gang
- **Daily/Weekly Active Users**: Hvor ofte kommer de tilbake
- **Feature Usage**: Hvilke features brukes mest/minst
- **Drop-off Points**: Hvor slutter brukerne å bruke appen

### 2. User Journey Analytics
- **Onboarding Completion Rate**: Hvor mange fullfører onboarding
- **First Activity Logged**: Tid til første aktivitet
- **AI Coach Interactions**: Hvor ofte snakker de med AI
- **Social Features**: Legger til venner, deltar i challenges

### 3. Performance Metrics
- **Crash Reports**: Når og hvorfor krasjer appen
- **API Response Times**: Hvor raskt svarer backend
- **Error Rates**: Hvilke feil oppstår oftest
- **Device/OS Distribution**: Hvilke enheter brukes

### 4. Business Metrics
- **Referral Code Usage**: Hvor mange bruker referral
- **Premium Conversion**: Free til paid (når vi har det)
- **Retention Rates**: 1-dag, 7-dag, 30-dag retention

## Implementeringsplan

### Fase 1: Grunnleggende Analytics (Start her!)
1. **Expo Analytics** (Gratis, innebygd)
   ```bash
   npx expo install expo-analytics
   ```

2. **Sentry for Error Tracking** (Gratis tier)
   ```bash
   npx expo install sentry-expo
   ```

3. **Custom Event Tracking i Backend**
   - Logg alle viktige handlinger til database
   - Bygg enkelt dashboard for å se data

### Fase 2: Avansert Analytics (Etter beta launch)
1. **Google Analytics 4** eller **Mixpanel**
2. **Hotjar** for heatmaps og session recordings
3. **PostHog** for produkt analytics (open source)

## Quick Implementation

### Frontend (Expo):
```typescript
// src/services/analytics.ts
import * as Analytics from 'expo-analytics';

export const trackEvent = (eventName: string, properties?: any) => {
  // Log to console in dev
  if (__DEV__) {
    console.log('📊 Analytics Event:', eventName, properties);
  }
  
  // Send to analytics service
  Analytics.logEvent(eventName, properties);
  
  // Also send to our backend
  apolloClient.mutate({
    mutation: LOG_EVENT,
    variables: { eventName, properties }
  });
};

// Usage examples:
trackEvent('onboarding_started');
trackEvent('activity_logged', { category: 'physical', points: 10 });
trackEvent('ai_coach_opened');
trackEvent('app_crashed', { error: errorMessage });
```

### Backend:
```graphql
type Mutation {
  logEvent(eventName: String!, properties: JSON): Boolean
}

type Query {
  getAnalytics(startDate: Date!, endDate: Date!): AnalyticsData!
}

type AnalyticsData {
  totalUsers: Int!
  activeUsers: Int!
  topEvents: [EventCount!]!
  userRetention: RetentionData!
}
```

## Viktigste Metrics for Beta Testing

1. **Onboarding Funnel**:
   - Start → Personal Info → Goals → Complete
   - Mål: >80% completion rate

2. **First Week Engagement**:
   - Dag 1: Logger minst 1 aktivitet
   - Dag 3: Fortsatt aktiv
   - Dag 7: Har brukt AI Coach

3. **Feature Adoption**:
   - % som bruker hver hovedfeature
   - Tid til første bruk av feature

4. **Error Rate**:
   - Crashes per session
   - Failed API calls
   - UI errors

## Privacy & GDPR

- Informer brukere om tracking i onboarding
- Implementer opt-out mulighet
- Anonymiser sensitive data
- Følg GDPR regler for EU brukere

## Dashboard Ideas

1. **Real-time Dashboard**:
   - Active users now
   - Today's signups
   - Current errors

2. **Weekly Report**:
   - User growth
   - Feature usage
   - Top issues

3. **User Segments**:
   - Power users (daily active)
   - At risk (ikke aktiv i 7 dager)
   - Churned (30+ dager inaktiv)
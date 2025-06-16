// App Constants
export const APP_NAME = 'SuperHuman';
export const API_VERSION = 'v1';

// Categories - fleksibelt system som enkelt kan utvides
export const CATEGORIES = {
  PHYSICAL: 'physical',
  MENTAL: 'mental',
  CAREER: 'career',
  SOCIAL: 'social',
  CREATIVE: 'creative',
  FINANCIAL: 'financial',
  SPIRITUAL: 'spiritual',
  ENVIRONMENTAL: 'environmental',
} as const;

export type CategoryId = typeof CATEGORIES[keyof typeof CATEGORIES];

// Category metadata for UI
export const CATEGORY_INFO = {
  [CATEGORIES.PHYSICAL]: {
    name: 'Fysisk Helse',
    icon: '💪',
    color: '#FF6B6B',
    description: 'Kondisjon, styrke, fleksibilitet',
  },
  [CATEGORIES.MENTAL]: {
    name: 'Mental Styrke',
    icon: '🧠',
    color: '#4ECDC4',
    description: 'Fokus, hukommelse, problemløsning',
  },
  [CATEGORIES.CAREER]: {
    name: 'Karriere',
    icon: '💼',
    color: '#45B7D1',
    description: 'Ferdigheter, produktivitet, økonomi',
  },
  [CATEGORIES.SOCIAL]: {
    name: 'Sosiale Ferdigheter',
    icon: '👥',
    color: '#96CEB4',
    description: 'Nettverk, kommunikasjon, empati',
  },
  [CATEGORIES.CREATIVE]: {
    name: 'Kreativitet',
    icon: '🎨',
    color: '#DDA0DD',
    description: 'Kunst, musikk, skriving',
  },
  [CATEGORIES.FINANCIAL]: {
    name: 'Økonomi',
    icon: '💰',
    color: '#FFD700',
    description: 'Sparing, investering, budsjett',
  },
  [CATEGORIES.SPIRITUAL]: {
    name: 'Spiritualitet',
    icon: '🧘',
    color: '#9B59B6',
    description: 'Meditasjon, mindfulness, balanse',
  },
  [CATEGORIES.ENVIRONMENTAL]: {
    name: 'Miljø',
    icon: '🌱',
    color: '#27AE60',
    description: 'Bærekraft, grønt liv',
  },
};

// Level thresholds - kan justeres basert på testing
export const LEVEL_THRESHOLDS = {
  1: 0,
  2: 100,
  3: 250,
  4: 500,
  5: 1000,
  6: 2000,
  7: 3500,
  8: 5500,
  9: 8000,
  10: 12000,
};

// Activity point ranges - kan justeres
export const POINT_RANGES = {
  VERY_LOW: { min: 1, max: 5 },
  LOW: { min: 5, max: 10 },
  MEDIUM: { min: 10, max: 20 },
  HIGH: { min: 20, max: 40 },
  VERY_HIGH: { min: 40, max: 100 },
};

// Feature flags - for gradvis utrulling
export const FEATURES = {
  SOCIAL_ENABLED: false,
  AI_COACH_ENABLED: false,
  PREMIUM_ENABLED: false,
  CHALLENGES_ENABLED: false,
  MARKETPLACE_ENABLED: false,
  AR_VR_ENABLED: false,
};

// Validation constants
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 6,
  MAX_NAME_LENGTH: 100,
  MAX_ACTIVITY_NAME_LENGTH: 255,
  MAX_ACTIVITY_DURATION: 1440, // 24 hours in minutes
  MIN_AGE: 13,
  MAX_AGE: 120,
};

// API Rate limiting
export const RATE_LIMITS = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_REQUESTS: 100, // per window
  LOGIN_ATTEMPTS: 5, // per window
};

import { VALIDATION } from '../config/constants';

// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation
export const isValidPassword = (password: string): boolean => {
  return password.length >= VALIDATION.MIN_PASSWORD_LENGTH;
};

// Name validation
export const isValidName = (name: string): boolean => {
  return name.length > 0 && name.length <= VALIDATION.MAX_NAME_LENGTH;
};

// Activity validation
export const isValidActivityDuration = (duration: number): boolean => {
  return duration > 0 && duration <= VALIDATION.MAX_ACTIVITY_DURATION;
};

// Age validation
export const isValidAge = (age: number): boolean => {
  return age >= VALIDATION.MIN_AGE && age <= VALIDATION.MAX_AGE;
};

// Category validation
export const isValidCategory = (categoryId: string): boolean => {
  const validCategories = ['physical', 'mental', 'career', 'social', 'creative', 'financial', 'spiritual', 'environmental'];
  return validCategories.includes(categoryId);
};

// Generic validation errors
export class ValidationError extends Error {
  constructor(public field: string, message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Validation helper
export const validateInput = (validations: Array<{ condition: boolean; field: string; message: string }>) => {
  for (const validation of validations) {
    if (!validation.condition) {
      throw new ValidationError(validation.field, validation.message);
    }
  }
};

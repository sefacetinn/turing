import { PasswordRequirement } from '../types/auth';

// Email validation
export const validateEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// Sanitize email - remove Turkish characters
export const sanitizeEmail = (email: string): string => {
  // Turkish character mapping
  const turkishChars: Record<string, string> = {
    'ç': 'c', 'Ç': 'C',
    'ğ': 'g', 'Ğ': 'G',
    'ı': 'i', 'İ': 'I',
    'ö': 'o', 'Ö': 'O',
    'ş': 's', 'Ş': 'S',
    'ü': 'u', 'Ü': 'U',
  };

  return email
    .split('')
    .map(char => turkishChars[char] || char)
    .join('')
    .toLowerCase();
};

// Turkish phone validation (05XXXXXXXXX)
export const validatePhone = (phone: string): boolean => {
  const cleaned = phone.replace(/\s/g, '');
  const regex = /^(05)[0-9]{9}$/;
  return regex.test(cleaned);
};

// Format phone number for display
export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7, 9)} ${cleaned.slice(9)}`;
  }
  return phone;
};

// Turkish Tax ID validation (10 digits)
export const validateTaxId = (taxId: string): boolean => {
  const regex = /^[0-9]{10}$/;
  return regex.test(taxId);
};

// Turkish IBAN validation
export const validateIBAN = (iban: string): boolean => {
  const cleaned = iban.replace(/\s/g, '').toUpperCase();
  const regex = /^TR[0-9]{2}[0-9]{5}[0-9A-Z]{17}$/;
  return regex.test(cleaned);
};

// Format IBAN for display
export const formatIBAN = (iban: string): string => {
  const cleaned = iban.replace(/\s/g, '').toUpperCase();
  return cleaned.replace(/(.{4})/g, '$1 ').trim();
};

// Password requirements
export const PASSWORD_REQUIREMENTS: Omit<PasswordRequirement, 'met'>[] = [
  { id: 'length', label: 'En az 8 karakter', regex: /.{8,}/ },
  { id: 'uppercase', label: 'En az 1 büyük harf', regex: /[A-Z]/ },
  { id: 'lowercase', label: 'En az 1 küçük harf', regex: /[a-z]/ },
  { id: 'number', label: 'En az 1 rakam', regex: /[0-9]/ },
  { id: 'special', label: 'En az 1 özel karakter (!@#$%^&*)', regex: /[!@#$%^&*(),.?":{}|<>]/ },
];

// Validate password and return requirements with met status
export const validatePassword = (password: string): PasswordRequirement[] => {
  return PASSWORD_REQUIREMENTS.map(req => ({
    ...req,
    met: req.regex.test(password),
  }));
};

// Check if all password requirements are met
export const isPasswordValid = (password: string): boolean => {
  return PASSWORD_REQUIREMENTS.every(req => req.regex.test(password));
};

// Calculate password strength (0-100)
export const getPasswordStrength = (password: string): number => {
  const requirements = validatePassword(password);
  const metCount = requirements.filter(r => r.met).length;
  return (metCount / requirements.length) * 100;
};

// Validate full name (at least 2 words)
export const validateFullName = (name: string): boolean => {
  const trimmed = name.trim();
  const words = trimmed.split(/\s+/).filter(w => w.length >= 2);
  return words.length >= 2;
};

// Validate verification code (6 digits)
export const validateVerificationCode = (code: string): boolean => {
  const regex = /^[0-9]{6}$/;
  return regex.test(code);
};

// Get validation error message
export const getValidationError = (field: string, value: string): string | null => {
  switch (field) {
    case 'email':
      if (!value) return 'Email adresi gerekli';
      if (!validateEmail(value)) return 'Geçerli bir email adresi girin';
      return null;

    case 'phone':
      if (!value) return 'Telefon numarası gerekli';
      if (!validatePhone(value)) return 'Geçerli bir telefon numarası girin (05XXXXXXXXX)';
      return null;

    case 'fullName':
      if (!value) return 'Ad soyad gerekli';
      if (!validateFullName(value)) return 'Ad ve soyad girin';
      return null;

    case 'taxId':
      if (!value) return 'Vergi numarası gerekli';
      if (!validateTaxId(value)) return 'Vergi numarası 10 haneli olmalı';
      return null;

    case 'iban':
      if (value && !validateIBAN(value)) return 'Geçerli bir IBAN girin';
      return null;

    case 'password':
      if (!value) return 'Şifre gerekli';
      if (!isPasswordValid(value)) return 'Şifre gereksinimlerini karşılamıyor';
      return null;

    case 'code':
      if (!value) return 'Doğrulama kodu gerekli';
      if (!validateVerificationCode(value)) return 'Kod 6 haneli olmalı';
      return null;

    default:
      if (!value) return 'Bu alan gerekli';
      return null;
  }
};

// ===============================
// Form Validation Hook & Types
// ===============================

export type ValidationRule<T> = {
  validate: (value: T, formValues?: Record<string, any>) => boolean;
  message: string;
};

export type FieldConfig<T> = {
  initialValue: T;
  rules?: ValidationRule<T>[];
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
};

export type FormConfig = Record<string, FieldConfig<any>>;

export type FormErrors = Record<string, string | null>;
export type FormTouched = Record<string, boolean>;
export type FormValues = Record<string, any>;

export interface FormState {
  values: FormValues;
  errors: FormErrors;
  touched: FormTouched;
  isValid: boolean;
  isSubmitting: boolean;
  isDirty: boolean;
}

// Common validation rules
export const rules = {
  required: (message = 'Bu alan zorunludur'): ValidationRule<any> => ({
    validate: (value) => {
      if (typeof value === 'string') return value.trim().length > 0;
      if (Array.isArray(value)) return value.length > 0;
      return value !== null && value !== undefined;
    },
    message,
  }),

  email: (message = 'Geçerli bir email adresi girin'): ValidationRule<string> => ({
    validate: (value) => !value || validateEmail(value),
    message,
  }),

  phone: (message = 'Geçerli bir telefon numarası girin'): ValidationRule<string> => ({
    validate: (value) => !value || validatePhone(value),
    message,
  }),

  minLength: (min: number, message?: string): ValidationRule<string> => ({
    validate: (value) => !value || value.length >= min,
    message: message || `En az ${min} karakter olmalı`,
  }),

  maxLength: (max: number, message?: string): ValidationRule<string> => ({
    validate: (value) => !value || value.length <= max,
    message: message || `En fazla ${max} karakter olmalı`,
  }),

  min: (min: number, message?: string): ValidationRule<number> => ({
    validate: (value) => value === undefined || value === null || value >= min,
    message: message || `En az ${min} olmalı`,
  }),

  max: (max: number, message?: string): ValidationRule<number> => ({
    validate: (value) => value === undefined || value === null || value <= max,
    message: message || `En fazla ${max} olmalı`,
  }),

  pattern: (regex: RegExp, message: string): ValidationRule<string> => ({
    validate: (value) => !value || regex.test(value),
    message,
  }),

  match: (fieldName: string, message?: string): ValidationRule<string> => ({
    validate: (value, formValues) => !value || value === formValues?.[fieldName],
    message: message || 'Alanlar eşleşmiyor',
  }),

  password: (message = 'Şifre gereksinimleri karşılanmıyor'): ValidationRule<string> => ({
    validate: (value) => !value || isPasswordValid(value),
    message,
  }),

  fullName: (message = 'Ad ve soyad girin'): ValidationRule<string> => ({
    validate: (value) => !value || validateFullName(value),
    message,
  }),

  taxId: (message = 'Vergi numarası 10 haneli olmalı'): ValidationRule<string> => ({
    validate: (value) => !value || validateTaxId(value),
    message,
  }),

  iban: (message = 'Geçerli bir IBAN girin'): ValidationRule<string> => ({
    validate: (value) => !value || validateIBAN(value),
    message,
  }),

  url: (message = 'Geçerli bir URL girin'): ValidationRule<string> => ({
    validate: (value) => {
      if (!value) return true;
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
    message,
  }),

  numeric: (message = 'Sadece rakam girin'): ValidationRule<string> => ({
    validate: (value) => !value || /^[0-9]+$/.test(value),
    message,
  }),

  alphanumeric: (message = 'Sadece harf ve rakam girin'): ValidationRule<string> => ({
    validate: (value) => !value || /^[a-zA-Z0-9]+$/.test(value),
    message,
  }),

  custom: <T>(validate: (value: T, formValues?: Record<string, any>) => boolean, message: string): ValidationRule<T> => ({
    validate,
    message,
  }),
};

// Validate a single field
export function validateField<T>(
  value: T,
  fieldRules: ValidationRule<T>[] = [],
  formValues?: Record<string, any>
): string | null {
  for (const rule of fieldRules) {
    if (!rule.validate(value, formValues)) {
      return rule.message;
    }
  }
  return null;
}

// Validate entire form
export function validateForm(
  values: FormValues,
  config: FormConfig
): FormErrors {
  const errors: FormErrors = {};

  for (const [fieldName, fieldConfig] of Object.entries(config)) {
    const error = validateField(
      values[fieldName],
      fieldConfig.rules,
      values
    );
    errors[fieldName] = error;
  }

  return errors;
}

// Check if form has any errors
export function hasErrors(errors: FormErrors): boolean {
  return Object.values(errors).some((error) => error !== null);
}

// Format credit card number
export function formatCardNumber(value: string): string {
  const cleaned = value.replace(/\D/g, '').slice(0, 16);
  const parts = cleaned.match(/.{1,4}/g) || [];
  return parts.join(' ');
}

// Format expiry date (MM/YY)
export function formatExpiryDate(value: string): string {
  const cleaned = value.replace(/\D/g, '').slice(0, 4);
  if (cleaned.length >= 2) {
    return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
  }
  return cleaned;
}

// Format CVV
export function formatCVV(value: string): string {
  return value.replace(/\D/g, '').slice(0, 4);
}

// Format amount with thousand separators
export function formatAmount(value: string): string {
  const cleaned = value.replace(/\D/g, '');
  if (!cleaned) return '';
  return parseInt(cleaned, 10).toLocaleString('tr-TR');
}

// Parse formatted amount to number
export function parseAmount(value: string): number {
  const cleaned = value.replace(/\./g, '').replace(/,/g, '.');
  return parseFloat(cleaned) || 0;
}

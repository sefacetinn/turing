import { PasswordRequirement } from '../types/auth';

// Email validation
export const validateEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
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

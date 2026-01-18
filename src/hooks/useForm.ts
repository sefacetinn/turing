import { useState, useCallback, useMemo } from 'react';
import {
  FormConfig,
  FormErrors,
  FormTouched,
  FormValues,
  FormState,
  validateField,
  validateForm,
  hasErrors,
  ValidationRule,
} from '../utils/validation';

interface UseFormOptions<T extends FormValues> {
  initialValues: T;
  validationRules?: Partial<Record<keyof T, ValidationRule<any>[]>>;
  onSubmit?: (values: T) => void | Promise<void>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

interface UseFormReturn<T extends FormValues> {
  values: T;
  errors: FormErrors;
  touched: FormTouched;
  isValid: boolean;
  isSubmitting: boolean;
  isDirty: boolean;

  // Field handlers
  handleChange: (field: keyof T) => (value: any) => void;
  handleBlur: (field: keyof T) => () => void;
  setFieldValue: (field: keyof T, value: any) => void;
  setFieldError: (field: keyof T, error: string | null) => void;
  setFieldTouched: (field: keyof T, touched: boolean) => void;

  // Form handlers
  handleSubmit: () => Promise<void>;
  reset: () => void;
  resetField: (field: keyof T) => void;
  validateField: (field: keyof T) => string | null;
  validateAllFields: () => boolean;

  // Field props helper
  getFieldProps: (field: keyof T) => {
    value: any;
    onChangeText: (value: string) => void;
    onBlur: () => void;
    error?: string;
  };

  // Check helpers
  hasFieldError: (field: keyof T) => boolean;
  isFieldTouched: (field: keyof T) => boolean;
  getFieldError: (field: keyof T) => string | null;
}

export function useForm<T extends FormValues>({
  initialValues,
  validationRules = {},
  onSubmit,
  validateOnChange = true,
  validateOnBlur = true,
}: UseFormOptions<T>): UseFormReturn<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<FormTouched>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if form is dirty (values differ from initial)
  const isDirty = useMemo(() => {
    return JSON.stringify(values) !== JSON.stringify(initialValues);
  }, [values, initialValues]);

  // Check if form is valid
  const isValid = useMemo(() => {
    return !hasErrors(errors);
  }, [errors]);

  // Validate a single field
  const validateSingleField = useCallback((field: keyof T): string | null => {
    const fieldRules = validationRules[field] || [];
    const error = validateField(values[field], fieldRules, values);
    setErrors(prev => ({ ...prev, [field]: error }));
    return error;
  }, [values, validationRules]);

  // Validate all fields
  const validateAllFields = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    for (const field of Object.keys(values)) {
      const fieldRules = validationRules[field as keyof T] || [];
      const error = validateField(values[field], fieldRules, values);
      newErrors[field] = error;
      if (error) isValid = false;
    }

    setErrors(newErrors);

    // Mark all fields as touched
    const allTouched: FormTouched = {};
    for (const field of Object.keys(values)) {
      allTouched[field] = true;
    }
    setTouched(allTouched);

    return isValid;
  }, [values, validationRules]);

  // Handle field change
  const handleChange = useCallback((field: keyof T) => (value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));

    if (validateOnChange) {
      // Validate after state update
      setTimeout(() => {
        const fieldRules = validationRules[field] || [];
        const error = validateField(value, fieldRules, { ...values, [field]: value });
        setErrors(prev => ({ ...prev, [field]: error }));
      }, 0);
    }
  }, [values, validationRules, validateOnChange]);

  // Handle field blur
  const handleBlur = useCallback((field: keyof T) => () => {
    setTouched(prev => ({ ...prev, [field]: true }));

    if (validateOnBlur) {
      validateSingleField(field);
    }
  }, [validateOnBlur, validateSingleField]);

  // Set field value directly
  const setFieldValue = useCallback((field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
  }, []);

  // Set field error directly
  const setFieldError = useCallback((field: keyof T, error: string | null) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  // Set field touched directly
  const setFieldTouched = useCallback((field: keyof T, touched: boolean) => {
    setTouched(prev => ({ ...prev, [field]: touched }));
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    const isFormValid = validateAllFields();

    if (!isFormValid || !onSubmit) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validateAllFields, onSubmit]);

  // Reset form to initial values
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  // Reset a single field
  const resetField = useCallback((field: keyof T) => {
    setValues(prev => ({ ...prev, [field]: initialValues[field] }));
    setErrors(prev => ({ ...prev, [field]: null }));
    setTouched(prev => ({ ...prev, [field]: false }));
  }, [initialValues]);

  // Get field props for easy binding
  const getFieldProps = useCallback((field: keyof T) => ({
    value: values[field],
    onChangeText: handleChange(field),
    onBlur: handleBlur(field),
    error: touched[field as string] ? errors[field as string] || undefined : undefined,
  }), [values, errors, touched, handleChange, handleBlur]);

  // Helper functions
  const hasFieldError = useCallback((field: keyof T): boolean => {
    return touched[field as string] && !!errors[field as string];
  }, [errors, touched]);

  const isFieldTouched = useCallback((field: keyof T): boolean => {
    return !!touched[field as string];
  }, [touched]);

  const getFieldError = useCallback((field: keyof T): string | null => {
    return touched[field as string] ? errors[field as string] || null : null;
  }, [errors, touched]);

  return {
    values,
    errors,
    touched,
    isValid,
    isSubmitting,
    isDirty,
    handleChange,
    handleBlur,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    handleSubmit,
    reset,
    resetField,
    validateField: validateSingleField,
    validateAllFields,
    getFieldProps,
    hasFieldError,
    isFieldTouched,
    getFieldError,
  };
}

// Hook for single field validation
export function useFieldValidation<T>(
  value: T,
  rules: ValidationRule<T>[],
  formValues?: FormValues
) {
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const validate = useCallback(() => {
    const validationError = validateField(value, rules, formValues);
    setError(validationError);
    return validationError === null;
  }, [value, rules, formValues]);

  const touch = useCallback(() => {
    setTouched(true);
    validate();
  }, [validate]);

  const reset = useCallback(() => {
    setError(null);
    setTouched(false);
  }, []);

  return {
    error: touched ? error : null,
    touched,
    isValid: error === null,
    validate,
    touch,
    reset,
  };
}

export default useForm;

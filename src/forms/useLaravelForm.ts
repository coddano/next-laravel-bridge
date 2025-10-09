'use client';

import { useState, useCallback } from 'react';
import { formatLaravelErrors } from '../utils/helpers';

export interface LaravelFormErrors {
  [key: string]: string;
}

export interface LaravelFormConfig<T = any> {
  initialValues: T;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  onSubmit?: (values: T) => Promise<void> | void;
}

export interface LaravelFormState<T = any> {
  values: T;
  errors: LaravelFormErrors;
  touched: { [key in keyof T]?: boolean };
  isSubmitting: boolean;
  isValid: boolean;
}

export interface LaravelFormActions<T = any> {
  values: T;
  errors: LaravelFormErrors;
  touched: { [key in keyof T]?: boolean };
  isSubmitting: boolean;
  isValid: boolean;
  setValues: (values: Partial<T> | ((prev: T) => T)) => void;
  setFieldValue: (field: keyof T, value: any) => void;
  setFieldError: (field: keyof T, error: string) => void;
  setErrors: (errors: LaravelFormErrors) => void;
  setFieldTouched: (field: keyof T, touched?: boolean) => void;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  reset: () => void;
  setLaravelErrors: (laravelErrors: Record<string, string[]>) => void;
}

/**
 * Hook personnalisé pour gérer les formulaires avec support des erreurs Laravel
 */
export function useLaravelForm<T extends Record<string, any> = any>({
  initialValues,
  validateOnChange = false,
  validateOnBlur = false,
  onSubmit,
}: LaravelFormConfig<T>): LaravelFormActions<T> {
  const [state, setState] = useState<LaravelFormState<T>>({
    values: initialValues,
    errors: {},
    touched: {},
    isSubmitting: false,
    isValid: true,
  });

  const setValues = useCallback((values: Partial<T> | ((prev: T) => T)) => {
    setState(prev => ({
      ...prev,
      values: typeof values === 'function'
        ? (values as (prev: T) => T)(prev.values)
        : { ...prev.values, ...values },
    }));
  }, []);

  const setFieldValue = useCallback((field: keyof T, value: any) => {
    setState(prev => ({
      ...prev,
      values: { ...prev.values, [field]: value },
    }));
  }, []);

  const setFieldError = useCallback((field: keyof T, error: string) => {
    setState(prev => ({
      ...prev,
      errors: { ...prev.errors, [field]: error },
    }));
  }, []);

  const setErrors = useCallback((errors: LaravelFormErrors) => {
    setState(prev => ({
      ...prev,
      errors,
      isValid: Object.keys(errors).length === 0,
    }));
  }, []);

  const setFieldTouched = useCallback((field: keyof T, touched = true) => {
    setState(prev => ({
      ...prev,
      touched: { ...prev.touched, [field]: touched },
    }));
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFieldValue(name as keyof T, value);

    // Effacer l'erreur du champ quand l'utilisateur tape
    if (state.errors[name]) {
      setFieldError(name as keyof T, '');
    }
  }, [setFieldValue, setFieldError, state.errors]);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name } = e.target;
    setFieldTouched(name as keyof T);
  }, [setFieldTouched]);

  const setLaravelErrors = useCallback((laravelErrors: Record<string, string[]>) => {
    const formattedErrors = formatLaravelErrors(laravelErrors);
    setErrors(formattedErrors);
  }, [setErrors]);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();

    setState(prev => ({ ...prev, isSubmitting: true }));

    try {
      if (onSubmit) {
        await onSubmit(state.values);
      }
    } catch (error: any) {
      // Si l'erreur contient des erreurs de validation Laravel
      if (error.response?.data?.errors) {
        setLaravelErrors(error.response.data.errors);
      }
      throw error;
    } finally {
      setState(prev => ({ ...prev, isSubmitting: false }));
    }
  }, [onSubmit, state.values, setLaravelErrors]);

  const reset = useCallback(() => {
    setState({
      values: initialValues,
      errors: {},
      touched: {},
      isSubmitting: false,
      isValid: true,
    });
  }, [initialValues]);

  return {
    ...state,
    setValues,
    setFieldValue,
    setFieldError,
    setErrors,
    setFieldTouched,
    handleSubmit,
    handleChange,
    handleBlur,
    reset,
    setLaravelErrors,
  };
}
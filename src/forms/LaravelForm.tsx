'use client';

import React from 'react';
import { LaravelFormErrors } from './useLaravelForm';

interface LaravelFormProps {
  children: React.ReactNode;
  errors?: LaravelFormErrors;
  className?: string;
}

interface FieldProps {
  name: string;
  errors?: LaravelFormErrors;
  touched?: { [key: string]: boolean };
  children: React.ReactNode;
  className?: string;
}

interface ErrorMessageProps {
  name: string;
  errors?: LaravelFormErrors;
  touched?: { [key: string]: boolean };
  className?: string;
}

/**
 * Composant conteneur pour les formulaires avec gestion d'erreurs Laravel
 */
export const LaravelForm: React.FC<LaravelFormProps> = ({
  children,
  errors = {},
  className = '',
}) => {
  return (
    <form className={className} noValidate>
      {children}
    </form>
  );
};

/**
 * Wrapper pour les champs de formulaire avec gestion d'erreurs
 */
export const Field: React.FC<FieldProps> = ({
  name,
  errors = {},
  touched = {},
  children,
  className = '',
}) => {
  const hasError = errors[name] && touched[name];
  const fieldClassName = `${className} ${hasError ? 'field-error' : ''}`.trim();

  return (
    <div className={fieldClassName}>
      {children}
    </div>
  );
};

/**
 * Composant pour afficher les messages d'erreur Laravel
 */
export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  name,
  errors = {},
  touched = {},
  className = '',
}) => {
  const error = errors[name];
  const isTouched = touched[name];

  if (!error || !isTouched) {
    return null;
  }

  return (
    <div className={`error-message ${className}`.trim()}>
      {error}
    </div>
  );
};

/**
 * Hook pour gérer les erreurs Laravel dans les composants enfants
 */
export const useLaravelErrors = () => {
  return {
    ErrorMessage,
    Field,
  };
};
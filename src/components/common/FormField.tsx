import React from 'react';

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  required,
  error,
  helperText,
  children,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
      <label
        style={{
          fontSize: '12px',
          fontWeight: 600,
          color: '#1C2526',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}
      >
        <span>{label}</span>
        {required && <span style={{ color: '#C44747' }}>*</span>}
      </label>

      {children}

      {error ? (
        <span style={{ fontSize: '11px', color: '#C44747', fontWeight: 500 }}>
          {error}
        </span>
      ) : helperText ? (
        <span style={{ fontSize: '11px', color: '#6B7A7A' }}>
          {helperText}
        </span>
      ) : null}
    </div>
  );
};


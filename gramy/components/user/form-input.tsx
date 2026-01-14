import React, { ChangeEvent } from 'react';

interface FormInputProps {
  id: string;
  name: string;
  type: string;
  label: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  required?: boolean;
  autoComplete?: string;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
}

export const FormInput: React.FC<FormInputProps> = ({
  id,
  name,
  type,
  label,
  value,
  onChange,
  placeholder,
  required = true,
  autoComplete,
  minLength,
  maxLength,
  pattern
}) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-neutral-300 mb-1">
      {label} {required && '*'}
    </label>
    <input
      id={id}
      name={name}
      type={type}
      required={required}
      autoComplete={autoComplete}
      minLength={minLength}
      maxLength={maxLength}
      pattern={pattern}
      className="w-full px-4 py-3 bg-neutral-700 border border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-white placeholder-neutral-500"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  </div>
);
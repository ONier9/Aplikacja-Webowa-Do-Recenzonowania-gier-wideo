import { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  htmlFor: string;
  children: ReactNode;
  required?: boolean;
}

export function FormField({ label, htmlFor, children, required = false }: FormFieldProps) {
  return (
    <div className="space-y-1">
      <label htmlFor={htmlFor} className="block text-sm font-medium">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

interface EmailFieldProps {
  email: string | undefined;
}

export function EmailField({ email }: EmailFieldProps) {
  return (
    <FormField label="Email" htmlFor="email">
      <input
        id="email"
        type="text"
        value={email || ''}
        disabled
        className="w-full px-3 py-2 rounded bg-gray-700 border border-gray-600 text-gray-300 cursor-not-allowed"
      />
    </FormField>
  );
}

interface TextFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

export function TextField({
  id,
  label,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false
}: TextFieldProps) {
  return (
    <FormField label={label} htmlFor={id} required={required}>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 focus:border-teal-500 focus:ring focus:ring-teal-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
      />
    </FormField>
  );
}
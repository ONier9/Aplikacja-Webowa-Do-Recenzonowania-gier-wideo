import { FormField } from './form-field';

interface TextAreaFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength: number;
  rows?: number;
}

export function TextAreaField({
  id,
  label,
  value,
  onChange,
  placeholder,
  maxLength,
  rows = 4
}: TextareaFieldProps) {
  const characterCount = value?.length || 0;

  return (
    <FormField label={label} htmlFor={id}>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={maxLength}
        rows={rows}
        className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 focus:border-teal-500 focus:ring focus:ring-teal-600/20 resize-none"
        placeholder={placeholder}
      />
      <div className="text-xs text-gray-400 text-right">
        {characterCount}/{maxLength}
      </div>
    </FormField>
  );
}
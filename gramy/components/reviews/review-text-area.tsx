interface ReviewTextareaProps {
  value: string;
  onChange: (value: string) => void;
  onFocus: () => void;
  maxLength?: number;
}

export const ReviewTextarea: React.FC<ReviewTextareaProps> = ({
  value,
  onChange,
  onFocus,
  maxLength = 500
}) => {
  return (
    <div>
      <label className="block mb-2 text-white">Review (max {maxLength} characters)</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={maxLength}
        className="w-full p-2 bg-gray-800 text-white rounded border border-gray-600 focus:border-teal-500 focus:outline-none"
        rows={4}
        onFocus={onFocus}
        placeholder="Share your thoughts about this game..."
      />
      <p className="text-sm text-gray-400 mt-1">
        {value.length}/{maxLength}
      </p>
    </div>
  );
};
// Reusable textarea component for commission forms
import React from "react";

interface FormTextareaProps {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  rows?: number;
}

export const FormTextarea: React.FC<FormTextareaProps> = ({
  id,
  name,
  label,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  rows = 4,
}) => {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-medium text-emerald-100"
      >
        {label}
        {required && <span className="ml-1 text-emerald-400">*</span>}
      </label>
      <textarea
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className={`w-full border bg-emerald-950/50 px-3 py-2 ${
          error ? "border-red-500" : "border-emerald-700/30"
        } resize-none rounded-lg text-emerald-100 shadow-sm transition-all outline-none placeholder:text-emerald-600/50 focus:ring-2 focus:ring-emerald-500/20`}
      />
      {error && <p className="mt-1.5 ml-1 text-xs text-red-400">{error}</p>}
    </div>
  );
};

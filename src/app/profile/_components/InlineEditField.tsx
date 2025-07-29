"use client";

import { useEffect, useRef } from "react";

export type FieldType = "text" | "email" | "tel" | "url" | "textarea";

interface InlineEditFieldProps {
  value: string;
  onChange: (value: string) => void;
  fieldType?: FieldType;
  label: string;
  placeholder?: string;
  maxLength?: number;
  isLoading?: boolean;
  className?: string;
  displayClassName?: string;
  inputClassName?: string;
  emptyText?: string;
  isEditing?: boolean;
  onStartEdit?: () => void;
  error?: string | null;
}

export default function InlineEditField({
  value,
  onChange,
  fieldType = "text",
  label,
  placeholder,
  maxLength,
  isLoading = false,
  className = "",
  displayClassName = "",
  inputClassName = "",
  emptyText = "Not specified",
  isEditing = false,
  onStartEdit,
  error = null,
}: InlineEditFieldProps) {
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (fieldType !== "textarea") {
        inputRef.current.select();
      }
    }
  }, [isEditing, fieldType]);

  const handleEdit = () => {
    if (!isLoading && onStartEdit) {
      onStartEdit();
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    onChange(e.target.value);
  };

  const renderInput = () => {
    const baseInputClasses = `
      w-full rounded-lg border bg-emerald-950/50 px-3 py-2 text-emerald-100 
      shadow-sm transition-all placeholder:text-emerald-600/50 
      focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none
      ${error ? "border-red-500/70" : "border-emerald-700/30"}
      ${inputClassName}
    `.trim();

    if (fieldType === "textarea") {
      return (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          maxLength={maxLength}
          rows={3}
          className={`${baseInputClasses} resize-none`}
          disabled={isLoading}
          aria-label={label}
        />
      );
    }

    return (
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type={fieldType}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        maxLength={maxLength}
        className={baseInputClasses}
        disabled={isLoading}
        aria-label={label}
      />
    );
  };

  const displayValue = value || emptyText;
  const showAsEmpty = !value;

  if (isEditing) {
    return (
      <div className={`space-y-2 ${className}`}>
        {renderInput()}

        {/* Character counter for textarea */}
        {fieldType === "textarea" && maxLength && (
          <div className="text-right text-xs text-emerald-400/70">
            {value.length}/{maxLength}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="text-xs text-red-400" role="alert">
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={className}>
      <button
        onClick={handleEdit}
        disabled={isLoading}
        className={`group -m-1 w-full rounded-md p-1 text-left transition-all duration-200 hover:bg-emerald-900/20 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${displayClassName} `}
        aria-label={`Edit ${label}. Current value: ${displayValue}`}
      >
        <div className="flex items-center justify-between">
          <span
            className={` ${showAsEmpty ? "text-emerald-200/50 italic" : "text-white"} ${fieldType === "textarea" ? "whitespace-pre-wrap" : ""} `}
          >
            {displayValue}
          </span>
          <svg
            className="h-4 w-4 text-emerald-400/60 opacity-0 transition-opacity group-hover:opacity-100"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
        </div>
      </button>
    </div>
  );
}

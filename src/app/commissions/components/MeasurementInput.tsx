// Specialized input component for measurements
import React from "react";
import { handleNumberInput } from "../utils";

interface MeasurementInputProps {
  id: string;
  name: string;
  label: string;
  value: number | string | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  type?: "number" | "text";
  placeholder?: string;
}

export const MeasurementInput: React.FC<MeasurementInputProps> = ({
  id,
  name,
  label,
  value,
  onChange,
  error,
  required = false,
  type = "number",
  placeholder,
}) => {
  const displayValue = value === null ? "" : String(value);
  const finalPlaceholder =
    placeholder ?? (type === "number" ? "0.0" : "Description...");

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1 block flex text-xs text-emerald-200/80"
      >
        {label}
        {required && <span className="ml-1 text-emerald-400">*</span>}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        step={type === "number" ? "0.1" : undefined}
        min={type === "number" ? "0" : undefined}
        value={displayValue}
        onChange={onChange}
        onKeyDown={type === "number" ? handleNumberInput : undefined}
        className={`w-full border bg-emerald-950/50 py-2 pr-3 pl-3 ${
          error ? "border-red-500" : "border-emerald-700/30"
        } rounded-lg text-emerald-100 shadow-sm transition-all outline-none placeholder:text-emerald-600/50 focus:ring-2 focus:ring-emerald-500/20`}
        placeholder={finalPlaceholder}
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
};

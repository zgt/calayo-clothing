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
  const finalPlaceholder = placeholder ?? (type === "number" ? "0.0" : "Description...");

  return (
    <div>
      <label htmlFor={id} className="block text-emerald-200/80 text-xs mb-1 flex">
        {label}
        {required && <span className="text-emerald-400 ml-1">*</span>}
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
        className={`w-full pl-3 pr-3 py-2 bg-emerald-950/50 border ${
          error ? "border-red-500" : "border-emerald-700/30"
        } rounded-lg shadow-sm text-emerald-100 placeholder:text-emerald-600/50 outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all`}
        placeholder={finalPlaceholder}
      />
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
};
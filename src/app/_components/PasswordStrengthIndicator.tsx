"use client";

import { useMemo } from "react";
import {
  validatePassword,
  getStrengthColor,
  getStrengthBgColor,
} from "~/utils/password-validation";

interface PasswordStrengthIndicatorProps {
  password: string;
  showRequirements?: boolean;
  className?: string;
}

export default function PasswordStrengthIndicator({
  password,
  showRequirements = true,
  className = "",
}: PasswordStrengthIndicatorProps) {
  const validation = useMemo(() => validatePassword(password), [password]);

  if (!password) {
    return null;
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Strength Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-sm">
          <span className="text-emerald-200">Password Strength</span>
          <span
            className={`font-medium capitalize ${getStrengthColor(validation.strength)}`}
          >
            {validation.strength}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-gray-700">
          <div
            className={`h-full transition-all duration-300 ${getStrengthBgColor(validation.strength)}`}
            style={{ width: `${validation.score}%` }}
          />
        </div>
      </div>

      {/* Requirements List */}
      {showRequirements && validation.errors.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-emerald-200">Requirements:</p>
          <ul className="space-y-1">
            {validation.errors.map((error, index) => (
              <li key={index} className="flex items-start text-xs text-red-400">
                <span className="mt-0.5 mr-1">•</span>
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Success Message */}
      {validation.isValid && (
        <div className="flex items-center text-xs text-green-400">
          <svg className="mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
          Password meets all requirements
        </div>
      )}
    </div>
  );
}

import type {
  PasswordStrengthRequirements,
  PasswordValidationResult,
} from "~/types/auth";

// Default password requirements (matches Better Auth defaults)
export const DEFAULT_PASSWORD_REQUIREMENTS: PasswordStrengthRequirements = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
};

/**
 * Validates password against requirements and calculates strength score
 */
export function validatePassword(
  password: string,
  requirements: PasswordStrengthRequirements = DEFAULT_PASSWORD_REQUIREMENTS,
): PasswordValidationResult {
  const errors: string[] = [];
  let score = 0;

  // Length validation
  if (password.length < requirements.minLength) {
    errors.push(
      `Password must be at least ${requirements.minLength} characters long`,
    );
  } else if (password.length >= requirements.minLength) {
    score += 20;
  }

  if (password.length > requirements.maxLength) {
    errors.push(
      `Password must be no more than ${requirements.maxLength} characters long`,
    );
  }

  // Character type validations
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
    password,
  );

  if (requirements.requireUppercase && !hasUppercase) {
    errors.push("Password must contain at least one uppercase letter");
  } else if (hasUppercase) {
    score += 20;
  }

  if (requirements.requireLowercase && !hasLowercase) {
    errors.push("Password must contain at least one lowercase letter");
  } else if (hasLowercase) {
    score += 20;
  }

  if (requirements.requireNumbers && !hasNumbers) {
    errors.push("Password must contain at least one number");
  } else if (hasNumbers) {
    score += 20;
  }

  if (requirements.requireSpecialChars && !hasSpecialChars) {
    errors.push("Password must contain at least one special character");
  } else if (hasSpecialChars) {
    score += 20;
  }

  // Additional scoring for length
  if (password.length >= 12) score += 10;
  if (password.length >= 16) score += 10;

  // Check for common patterns (reduce score)
  if (/(.)\1{2,}/.test(password)) score -= 10; // Repeated characters
  if (/123|abc|qwe/i.test(password)) score -= 15; // Sequential characters
  if (/password|123456|qwerty/i.test(password)) score -= 30; // Common passwords

  // Normalize score
  score = Math.max(0, Math.min(100, score));

  // Determine strength
  let strength: "weak" | "medium" | "strong";
  if (score < 50) {
    strength = "weak";
  } else if (score < 80) {
    strength = "medium";
  } else {
    strength = "strong";
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength,
    score,
  };
}

/**
 * Get strength color for UI display
 */
export function getStrengthColor(
  strength: "weak" | "medium" | "strong",
): string {
  switch (strength) {
    case "weak":
      return "text-red-500";
    case "medium":
      return "text-yellow-500";
    case "strong":
      return "text-green-500";
    default:
      return "text-gray-500";
  }
}

/**
 * Get strength background color for progress bars
 */
export function getStrengthBgColor(
  strength: "weak" | "medium" | "strong",
): string {
  switch (strength) {
    case "weak":
      return "bg-red-500";
    case "medium":
      return "bg-yellow-500";
    case "strong":
      return "bg-green-500";
    default:
      return "bg-gray-300";
  }
}

/**
 * Check if two passwords match
 */
export function passwordsMatch(
  password: string,
  confirmPassword: string,
): boolean {
  return password === confirmPassword && password.length > 0;
}

/**
 * Generate helpful password suggestions
 */
export function getPasswordSuggestions(): string[] {
  return [
    "Use a mix of uppercase and lowercase letters",
    "Include at least one number",
    "Add special characters like !@#$%^&*",
    "Make it at least 8 characters long",
    "Avoid common words or patterns",
    "Consider using a passphrase with spaces",
  ];
}

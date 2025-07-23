// Better Auth Password Management Types

export interface PasswordStrengthRequirements {
  minLength: number;
  maxLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
}

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: "weak" | "medium" | "strong";
  score: number; // 0-100
}

export interface ForgotPasswordRequest {
  email: string;
  redirectTo?: string;
}

export interface ForgotPasswordResponse {
  data?: {
    message: string;
  };
  error?: {
    message: string;
    code?: string;
  };
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  data?: {
    user: {
      id: string;
      email: string;
      name?: string;
    };
  };
  error?: {
    message: string;
    code?: string;
  };
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  revokeOtherSessions?: boolean;
}

export interface ChangePasswordResponse {
  data?: {
    user: {
      id: string;
      email: string;
      name?: string;
    };
  };
  error?: {
    message: string;
    code?: string;
  };
}

export interface AuthError {
  message: string;
  code?: string;
  status?: number;
}

// Common error codes from Better Auth
export const AUTH_ERROR_CODES = {
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  USER_NOT_FOUND: "USER_NOT_FOUND",
  EMAIL_NOT_VERIFIED: "EMAIL_NOT_VERIFIED",
  PASSWORD_TOO_WEAK: "PASSWORD_TOO_WEAK",
  TOKEN_EXPIRED: "TOKEN_EXPIRED",
  TOKEN_INVALID: "TOKEN_INVALID",
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
  SESSION_EXPIRED: "SESSION_EXPIRED",
} as const;

export type AuthErrorCode =
  (typeof AUTH_ERROR_CODES)[keyof typeof AUTH_ERROR_CODES];

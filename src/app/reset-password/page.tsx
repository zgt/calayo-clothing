"use client";

import { useState, useEffect, Suspense } from "react";
import { useAuth } from "~/context/better-auth";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const [isCheckingToken, setIsCheckingToken] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const { resetPassword } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const checkToken = async () => {
      try {
        // Get token from URL parameters
        const tokenFromUrl = searchParams.get("token");

        if (tokenFromUrl) {
          setToken(tokenFromUrl);
          setIsValidToken(true);
        } else {
          setIsValidToken(false);
        }
      } catch (error) {
        console.error("Token validation error:", error);
        setIsValidToken(false);
      } finally {
        setIsCheckingToken(false);
      }
    };

    void checkToken();
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (!token) {
      toast.error("Invalid reset token");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await resetPassword(token, password);

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Password updated successfully!");
        router.push("/login");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error("Password update error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingToken) {
    return (
      <div className="auth-page mx-auto mt-16 w-full max-w-md">
        <div className="rounded-2xl border border-emerald-700/20 bg-gradient-to-br from-emerald-900/30 to-emerald-950/80 p-8 shadow-2xl backdrop-blur-sm">
          <div className="px-8 py-6 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
            <p className="mt-4 text-emerald-200">Verifying reset link...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="auth-page mx-auto mt-16 w-full max-w-md">
        <div className="rounded-2xl border border-emerald-700/20 bg-gradient-to-br from-emerald-900/30 to-emerald-950/80 p-8 shadow-2xl backdrop-blur-sm">
          <div className="px-8 py-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h2 className="mb-2 text-2xl font-bold text-white">
              Invalid or expired link
            </h2>
            <p className="mb-6 text-emerald-200">
              This password reset link is invalid or has expired. Please request
              a new one.
            </p>
            <div className="space-y-4">
              <Link
                href="/forgot-password"
                className="inline-flex justify-center rounded-md bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:from-emerald-600 hover:to-teal-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:outline-none"
              >
                Request new reset link
              </Link>
              <div>
                <Link
                  href="/login"
                  className="text-sm font-medium text-emerald-400 hover:text-emerald-300"
                >
                  Back to sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page mx-auto mt-16 w-full max-w-md">
      <div className="rounded-2xl border border-emerald-700/20 bg-gradient-to-br from-emerald-900/30 to-emerald-950/80 p-8 shadow-2xl backdrop-blur-sm">
        <div className="border-b border-emerald-800/30 px-8 py-6">
          <h2 className="text-center text-3xl font-bold tracking-tight text-white">
            Reset Password
          </h2>
          <p className="mt-2 text-center text-sm text-emerald-200">
            Enter your new password below
          </p>
        </div>

        <form className="space-y-6 px-8 py-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="password"
                className="mb-1 block text-sm font-medium text-emerald-200"
              >
                New Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                className="relative block w-full rounded-md border border-emerald-700/50 bg-emerald-950/50 px-3 py-2 text-gray-100 placeholder:text-gray-500 focus:border-transparent focus:ring-2 focus:ring-emerald-500 focus:outline-none sm:text-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-1 block text-sm font-medium text-emerald-200"
              >
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                className="relative block w-full rounded-md border border-emerald-700/50 bg-emerald-950/50 px-3 py-2 text-gray-100 placeholder:text-gray-500 focus:border-transparent focus:ring-2 focus:ring-emerald-500 focus:outline-none sm:text-sm"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex w-full justify-center rounded-md bg-gradient-to-r from-emerald-500 to-teal-600 px-3 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:from-emerald-600 hover:to-teal-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <svg
                    className="mr-3 -ml-1 h-5 w-5 animate-spin text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Updating password...
                </>
              ) : (
                "Update password"
              )}
            </button>
          </div>

          <div className="text-center">
            <Link
              href="/login"
              className="text-sm font-medium text-emerald-400 hover:text-emerald-300"
            >
              Back to sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="auth-page mx-auto mt-16 w-full max-w-md">
          <div className="rounded-2xl border border-emerald-700/20 bg-gradient-to-br from-emerald-900/30 to-emerald-950/80 p-8 shadow-2xl backdrop-blur-sm">
            <div className="px-8 py-6 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
              <p className="mt-4 text-emerald-200">Loading...</p>
            </div>
          </div>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}

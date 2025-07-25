"use client";

import { useState } from "react";
import { useSession, changePassword } from "~/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import PasswordStrengthIndicator from "~/app/_components/PasswordStrengthIndicator";
import { validatePassword, passwordsMatch } from "~/utils/password-validation";

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();
  const isAuthenticated = !!session?.user;

  const handleChangePassword = async (
    currentPassword: string,
    newPassword: string,
  ) => {
    const result = await changePassword({
      newPassword,
      currentPassword,
      revokeOtherSessions: true, // Enhanced security: revoke all other sessions
    });

    if (result.error) {
      throw new Error(result.error.message);
    }

    return result;
  };
  const router = useRouter();

  if (!isAuthenticated) {
    if (typeof window !== "undefined") {
      router.push("/login");
    }
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate password confirmation
    if (!passwordsMatch(newPassword, confirmPassword)) {
      toast.error("New passwords don't match");
      return;
    }

    // Validate password strength
    const validation = validatePassword(newPassword);
    if (!validation.isValid) {
      toast.error(`Password requirements not met: ${validation.errors[0]}`);
      return;
    }

    // Check that new password is different from current
    if (currentPassword === newPassword) {
      toast.error("New password must be different from current password");
      return;
    }

    setIsLoading(true);

    try {
      await handleChangePassword(currentPassword, newPassword);
      toast.success(
        "Password updated successfully! Other sessions have been logged out for security.",
      );
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      router.push("/profile");
    } catch (error: unknown) {
      toast.error((error as Error).message ?? "Failed to change password");
      console.error("Password change error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page mx-auto mt-16 w-full max-w-md">
      <div className="rounded-2xl border border-emerald-700/20 bg-gradient-to-br from-emerald-900/30 to-emerald-950/80 p-8 shadow-2xl backdrop-blur-sm">
        <div className="border-b border-emerald-800/30 px-8 py-6">
          <h2 className="text-center text-3xl font-bold tracking-tight text-white">
            Change Password
          </h2>
          <p className="mt-2 text-center text-sm text-emerald-200">
            Update your account password
          </p>
        </div>

        <form className="space-y-6 px-8 py-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="currentPassword"
                className="mb-1 block text-sm font-medium text-emerald-200"
              >
                Current Password
              </label>
              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                autoComplete="current-password"
                required
                className="relative block w-full rounded-md border border-emerald-700/50 bg-emerald-950/50 px-3 py-2 text-gray-100 placeholder:text-gray-500 focus:border-transparent focus:ring-2 focus:ring-emerald-500 focus:outline-none sm:text-sm"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div>
              <label
                htmlFor="newPassword"
                className="mb-1 block text-sm font-medium text-emerald-200"
              >
                New Password
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                autoComplete="new-password"
                required
                className="relative block w-full rounded-md border border-emerald-700/50 bg-emerald-950/50 px-3 py-2 text-gray-100 placeholder:text-gray-500 focus:border-transparent focus:ring-2 focus:ring-emerald-500 focus:outline-none sm:text-sm"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              {newPassword && (
                <div className="mt-3">
                  <PasswordStrengthIndicator password={newPassword} />
                </div>
              )}
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
                className={`relative block w-full rounded-md border px-3 py-2 text-gray-100 placeholder:text-gray-500 focus:border-transparent focus:ring-2 focus:outline-none sm:text-sm ${
                  confirmPassword
                    ? passwordsMatch(newPassword, confirmPassword)
                      ? "border-green-500/50 bg-green-950/20 focus:ring-green-500"
                      : "border-red-500/50 bg-red-950/20 focus:ring-red-500"
                    : "border-emerald-700/50 bg-emerald-950/50 focus:ring-emerald-500"
                }`}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {confirmPassword && (
                <div className="mt-2 text-xs">
                  {passwordsMatch(newPassword, confirmPassword) ? (
                    <span className="flex items-center text-green-400">
                      <svg
                        className="mr-1 h-3 w-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Passwords match
                    </span>
                  ) : (
                    <span className="flex items-center text-red-400">
                      <svg
                        className="mr-1 h-3 w-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Passwords don&apos;t match
                    </span>
                  )}
                </div>
              )}
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
              href="/profile"
              className="text-sm font-medium text-emerald-400 hover:text-emerald-300"
            >
              Back to profile
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

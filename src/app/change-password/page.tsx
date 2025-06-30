"use client";

import { useState } from "react";
import { useAuth } from "~/context/auth";
import { useSupabase } from "~/context/supabase-provider";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { supabase } = useSupabase();
  const router = useRouter();

  if (!isAuthenticated()) {
    router.push("/login");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (!user?.email) {
      toast.error("User email not found");
      return;
    }

    setIsLoading(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (signInError) {
        toast.error("Current password is incorrect");
        setIsLoading(false);
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (updateError) {
        toast.error(updateError.message);
      } else {
        toast.success("Password updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        router.push("/profile");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error("Password change error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page w-full max-w-md mx-auto mt-16">
      <div className="bg-gradient-to-br from-emerald-900/30 to-emerald-950/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-emerald-700/20">
        <div className="px-8 py-6 border-b border-emerald-800/30">
          <h2 className="text-center text-3xl font-bold tracking-tight text-white">
            Change Password
          </h2>
          <p className="mt-2 text-center text-sm text-emerald-200">
            Update your account password
          </p>
        </div>
        
        <form className="px-8 py-6 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-emerald-200 mb-1">
                Current Password
              </label>
              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                autoComplete="current-password"
                required
                className="relative block w-full rounded-md border border-emerald-700/50 bg-emerald-950/50 py-2 px-3 text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent sm:text-sm"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-emerald-200 mb-1">
                New Password
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                className="relative block w-full rounded-md border border-emerald-700/50 bg-emerald-950/50 py-2 px-3 text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent sm:text-sm"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-emerald-200 mb-1">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                className="relative block w-full rounded-md border border-emerald-700/50 bg-emerald-950/50 py-2 px-3 text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent sm:text-sm"
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
              className="group relative flex w-full justify-center rounded-md bg-gradient-to-r from-emerald-500 to-teal-600 py-2 px-3 text-sm font-semibold text-white hover:from-emerald-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating password...
                </>
              ) : (
                "Update password"
              )}
            </button>
          </div>

          <div className="text-center">
            <Link href="/profile" className="text-emerald-400 hover:text-emerald-300 text-sm font-medium">
              Back to profile
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
"use client";

import { useState } from "react";
import { useSupabase } from "~/context/supabase-provider";
import Link from "next/link";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { supabase } = useSupabase();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        toast.error(error.message);
      } else {
        setIsSubmitted(true);
        toast.success("Reset link sent to your email!");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error("Password reset error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="auth-page w-full max-w-md mx-auto mt-16">
        <div className="bg-gradient-to-br from-emerald-900/30 to-emerald-950/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-emerald-700/20">
          <div className="px-8 py-6 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-emerald-100 mb-4">
              <svg className="h-6 w-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Check your email</h2>
            <p className="text-emerald-200 mb-6">
              We&apos;ve sent a password reset link to <span className="font-medium">{email}</span>
            </p>
            <div className="space-y-4">
              <p className="text-sm text-emerald-300">
                Didn&apos;t receive the email? Check your spam folder or try again.
              </p>
              <button
                onClick={() => setIsSubmitted(false)}
                className="text-emerald-400 hover:text-emerald-300 text-sm font-medium"
              >
                Try different email
              </button>
            </div>
          </div>
          <div className="px-8 py-4 border-t border-emerald-800/30 text-center">
            <Link href="/login" className="text-emerald-400 hover:text-emerald-300 text-sm font-medium">
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page w-full max-w-md mx-auto mt-16">
      <div className="bg-gradient-to-br from-emerald-900/30 to-emerald-950/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-emerald-700/20">
        <div className="px-8 py-6 border-b border-emerald-800/30">
          <h2 className="text-center text-3xl font-bold tracking-tight text-white">
            Forgot Password
          </h2>
          <p className="mt-2 text-center text-sm text-emerald-200">
            Enter your email address and we&apos;ll send you a link to reset your password
          </p>
        </div>
        
        <form className="px-8 py-6 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-emerald-200 mb-1">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="relative block w-full rounded-md border border-emerald-700/50 bg-emerald-950/50 py-2 px-3 text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent sm:text-sm"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
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
                  Sending reset link...
                </>
              ) : (
                "Send reset link"
              )}
            </button>
          </div>

          <div className="text-center">
            <Link href="/login" className="text-emerald-400 hover:text-emerald-300 text-sm font-medium">
              Back to sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
"use client";

import { useState } from "react";
import { useAuth } from "~/context/auth";
import Link from "next/link";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Logged in successfully!");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page w-full max-w-md mx-auto mt-16">
      <div className="bg-gradient-to-br from-emerald-900/30 to-emerald-950/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-emerald-700/20">
        <div className="px-8 py-6 border-b border-emerald-800/30">
          <h2 className="text-center text-3xl font-bold tracking-tight text-white">
            Welcome Back
          </h2>
          <p className="mt-2 text-center text-sm text-emerald-200">
            Sign in to your account
          </p>
        </div>
        
        <form className="px-8 py-6 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email-address" className="block text-sm font-medium text-emerald-200 mb-1">
                Email address
              </label>
              <input
                id="email-address"
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
              <label htmlFor="password" className="block text-sm font-medium text-emerald-200 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="relative block w-full rounded-md border border-emerald-700/50 bg-emerald-950/50 py-2 px-3 text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent sm:text-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-emerald-200">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link href="/forgot-password" className="font-medium text-emerald-400 hover:text-emerald-300">
                Forgot password?
              </Link>
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
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </div>

          <div className="text-center mt-6">
            <p className="text-sm text-emerald-200">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="font-medium text-emerald-400 hover:text-emerald-300">
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
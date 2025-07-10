"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useSupabase } from "./supabase-provider";
import type { User, Session } from "@supabase/supabase-js";
import { useRouter, usePathname } from "next/navigation";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: () => boolean;
  signIn: (email: string, password: string) => Promise<{
    error: Error | null;
    data: { user: User | null; session: Session | null };
  }>;
  signUp: (email: string, password: string, userData?: Record<string, unknown>) => Promise<{
    error: Error | null;
    data: { user: User | null; session: Session | null };
  }>;
  signOut: () => Promise<void>;
  updateProfile: (userData: Record<string, unknown>) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { supabase } = useSupabase();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Get session from Supabase
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
      
      // Optional: Redirect to login if on protected page and no session
      if (!session && pathname !== "/login" && pathname !== "/signup" && pathname !== "/") {
        // Uncomment if you want to redirect unauthenticated users
        // router.push("/login");
      }
    };

    void getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, pathname, router]);

  const isAuthenticated = () => {
    return !!user && !!session;
  };

  const signIn = async (email: string, password: string) => {
    const response = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (!response.error && response.data.session) {
      router.push("/"); // Redirect to home on successful login
    }
    
    return response;
  };

  const signUp = async (email: string, password: string, userData?: Record<string, unknown>) => {
    const response = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData ?? {}, // Add any additional user metadata
      },
    });
    
    if (!response.error && response.data.session) {
      router.push("/"); // Redirect to home on successful sign up
    }
    
    return response;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const updateProfile = async (userData: Record<string, unknown>) => {
    if (!user) throw new Error("No user logged in");
    
    await supabase.auth.updateUser({
      data: userData,
    });
    
    // Update local user state with new metadata
    setUser((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        user_metadata: {
          ...prev.user_metadata,
          ...userData,
        },
      };
    });
  };

  const value = {
    user,
    session,
    isLoading,
    isAuthenticated,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};
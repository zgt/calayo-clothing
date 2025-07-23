"use client";

import { createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import {
  useSession,
  signIn as authSignIn,
  signOut as authSignOut,
  signUp as authSignUp,
} from "~/lib/auth-client";
import {type User, type Session} from "~/lib/auth";


type AuthContextType = {
  user: User | null;
  session: {
    user: User;
    session: Session;
  } | null;
  isLoading: boolean;
  isAuthenticated: () => boolean;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{
    error: Error | null;
    data: { user: User | null; session: Session | null };
  }>;
  signUp: (
    email: string,
    password: string,
    userData?: { full_name?: string; [key: string]: unknown },
  ) => Promise<{
    error: Error | null;
    data: { user: User | null; session: Session | null  };
  }>;
  signOut: () => Promise<void>;
  updateProfile: (userData: Record<string, unknown>) => Promise<void>;
  forgotPassword: (email: string) => Promise<{ error: Error | null }>;
  resetPassword: (
    token: string,
    password: string,
  ) => Promise<{ error: Error | null }>;
  changePassword: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<{ error: Error | null }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, isPending: isLoading } = useSession();
  const router = useRouter();

  function getUserWithRole(userObj: unknown): User {
    const base = userObj as Record<string, unknown>;
    return {
      ...base,
      role: typeof base.role === "string" || base.role === null ? base.role : null,
    } as User;
  }

  // Type guards for user and session
  function isUser(obj: unknown): obj is User {
    return (
      typeof obj === "object" &&
      obj !== null &&
      "id" in obj &&
      "email" in obj &&
      "name" in obj &&
      "emailVerified" in obj &&
      "createdAt" in obj &&
      "updatedAt" in obj &&
      // 'role' is required, but may be undefined/null, so just check property exists
      "role" in obj
    );
  }
  function isSession(obj: unknown): obj is Session {
    return (
      typeof obj === "object" &&
      obj !== null &&
      "id" in obj &&
      "userId" in obj &&
      "expiresAt" in obj &&
      "createdAt" in obj &&
      "updatedAt" in obj &&
      "token" in obj
    );
  }

  const user = session?.user ? getUserWithRole(session.user) : null;

  const isAuthenticated = () => {
    return !!user && !!session;
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await authSignIn.email({
        email,
        password,
      });

      if (response.error) {
        return {
          error: new Error(response.error.message ?? "Sign in failed"),
          data: { user: null, session: null },
        };
      }

      if (response.data && 'user' in response.data && 'session' in response.data) {
        router.push("/"); // Redirect to home on successful login
        const rawUser = response.data.user;
        const rawSession = response.data.session;
        const patchedUser = isUser(rawUser) ? rawUser : null;
        const patchedSession = isSession(rawSession) ? rawSession : null;
        if (patchedUser && patchedSession) {
          return {
            error: null,
            data: { user: patchedUser, session: patchedSession },
          };
        }
        return {
          error: new Error("Sign in failed: missing user or session"),
          data: { user: null, session: null },
        };
      }

      return {
        error: new Error("Sign in failed"),
        data: { user: null, session: null },
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error : new Error("Sign in failed"),
        data: { user: null, session: null },
      };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    userData?: { full_name?: string; [key: string]: unknown },
  ) => {
    try {
      const response = await authSignUp.email({
        email,
        password,
        name: userData?.full_name ?? "",
        ...userData,
      });

      if (response.error) {
        return {
          error: new Error(response.error.message ?? "Sign up failed"),
          data: { user: null, session: null },
        };
      }

      if (response.data && 'user' in response.data && 'session' in response.data) {
        const rawUser = response.data.user;
        const rawSession = response.data.session;
        const patchedUser = isUser(rawUser) ? rawUser : null;
        const patchedSession = isSession(rawSession) ? rawSession : null;
        if (patchedUser && patchedSession) {
          return {
            error: null,
            data: { user: patchedUser, session: patchedSession },
          };
        }
        return {
          error: new Error("Sign up failed: missing user or session"),
          data: { user: null, session: null },
        };
      }

      return {
        error: new Error("Sign up failed"),
        data: { user: null, session: null },
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error : new Error("Sign up failed"),
        data: { user: null, session: null },
      };
    }
  };

  const signOut = async () => {
    try {
      await authSignOut();
      router.push("/login");
    } catch (error) {
      console.error("Sign out error:", error);
      router.push("/login");
    }
  };

  const updateProfile = async (_userData: Record<string, unknown>) => {
    if (!user) throw new Error("No user logged in");

    // TODO: Implement profile update with better-auth
    throw new Error("Profile update not yet implemented with better-auth");
  };

  const forgotPassword = async (_email: string) => {
    // TODO: Implement forgot password with better-auth
    return {
      error: new Error("Forgot password not yet implemented with better-auth"),
    };
  };

  const resetPassword = async (_token: string, _password: string) => {
    // TODO: Implement reset password with better-auth
    return {
      error: new Error("Reset password not yet implemented with better-auth"),
    };
  };

  const changePassword = async (
    _currentPassword: string,
    _newPassword: string,
  ) => {
    // TODO: Implement change password with better-auth
    return {
      error: new Error("Change password not yet implemented with better-auth"),
    };
  };

  const value = {
    user,
    session: session && user
      ? { ...session, user }
      : null,
    isLoading,
    isAuthenticated,
    signIn,
    signUp,
    signOut,
    updateProfile,
    forgotPassword,
    resetPassword,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};

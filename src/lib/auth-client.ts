import { createAuthClient } from "better-auth/react";
import { magicLinkClient, adminClient } from "better-auth/client/plugins";
import { env } from "~/env";

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_BETTER_AUTH_URL,
  plugins: [
    magicLinkClient(), // Add magic link client plugin
    adminClient(), // Add admin client plugin for user management
  ],
});

export const {
  signIn,
  signOut,
  signUp,
  useSession,
  getSession,
  changePassword,
  forgetPassword,
  resetPassword,
  // Magic link methods are now available
  // authClient.signIn.magicLink({ email: "user@example.com" })
} = authClient;

// Export types for better TypeScript support
export type { Session, User } from "~/lib/auth";

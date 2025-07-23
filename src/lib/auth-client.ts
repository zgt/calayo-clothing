import { createAuthClient } from "better-auth/react";
import { magicLinkClient } from "better-auth/client/plugins";
import { env } from "~/env";

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_BETTER_AUTH_URL,
  plugins: [
    magicLinkClient(), // Add magic link client plugin
  ],
});

export const {
  signIn,
  signOut,
  signUp,
  useSession,
  getSession,
  // Magic link methods are now available
  // authClient.signIn.magicLink({ email: "user@example.com" })
} = authClient;

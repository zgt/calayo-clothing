import { betterAuth } from "better-auth";
import { magicLink, admin } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { env } from "~/env";
import { Pool } from "pg";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendChangeEmailVerificationEmail,
  sendMagicLinkEmail,
} from "./email";

export const auth = betterAuth({
  database: new Pool({
    connectionString: String(env.DATABASE_URL),
  }),

  secret: String(env.BETTER_AUTH_SECRET),
  baseURL: String(env.NEXT_PUBLIC_BETTER_AUTH_URL),

  plugins: [
    // Enable magic link authentication (optional - remove if not needed)
    magicLink({
      sendMagicLink: async ({ email, url, token }, _request) => {
        await sendMagicLinkEmail({ email, url, token });
      },
    }),
    // Enable admin plugin for user management and role-based access control
    admin({
      defaultRole: "user",
      adminRoles: ["admin"],
      // Configure admin session duration for impersonation
      impersonationSessionDuration: 60 * 60 * 24, // 1 day
    }),
    nextCookies(),
  ],

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url, token }, _request) => {
      await sendPasswordResetEmail({ user, url, token });
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url, token }, _request) => {
      await sendVerificationEmail({ user, url, token });
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },

  user: {
    additionalFields: {
      // Add fields that match existing Supabase user structure
      email_confirmed_at: {
        type: "date",
        required: false,
      },
      created_at: {
        type: "date",
        required: false,
      },
      updated_at: {
        type: "date",
        required: false,
      },
      // Add role field for admin checking
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
      },
    },
    changeEmail: {
      enabled: true,
      sendChangeEmailVerification: async (
        { user, newEmail, url, token },
        _request,
      ) => {
        await sendChangeEmailVerificationEmail({ user, newEmail, url, token });
      },
    },
  },

  trustedOrigins: [
    "http://localhost:3000",
    "https://localhost:3000",
    ...(process.env.NODE_ENV === "production" &&
    typeof env.NEXT_PUBLIC_BETTER_AUTH_URL === "string"
      ? [env.NEXT_PUBLIC_BETTER_AUTH_URL]
      : []),
  ],
});

export type Session = (typeof auth.$Infer.Session)["session"];
export type User = typeof auth.$Infer.Session.user;

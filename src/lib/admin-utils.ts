import { auth } from "~/lib/auth";
import { authClient } from "~/lib/auth-client";
import type { User } from "~/lib/auth";

/**
 * Server-side admin utilities using better-auth admin plugin
 */

/**
 * Check if a user has admin permissions (server-side)
 * Simple role-based check that works with admin plugin configuration
 * @param userId - The user ID to check
 * @returns Promise<boolean> - Whether the user has admin permissions
 */
export async function isUserAdmin(userId: string): Promise<boolean> {
  try {
    // Get user session to check role
    // The admin plugin's adminRoles configuration automatically handles role validation
    const session = await auth.api.getSession({
      headers: new Headers(), // Empty headers for server-side call
    });

    if (session?.user?.id === userId) {
      return session.user.role === "admin";
    }

    // If we need to check a different user, we'd need to query the database directly
    // For now, return false for cross-user checks
    return false;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}

/**
 * Check if a user has specific permissions (server-side)
 * Note: For basic role checking, use isUserAdmin or hasAdminRole instead
 * This is for future extension when custom permissions are implemented
 * @param userId - The user ID to check
 * @param permissions - Object with resource permissions to check
 * @returns Promise<boolean> - Whether the user has the specified permissions
 */
export async function userHasPermissions(
  userId: string,
  _permissions: Record<string, string[]>,
): Promise<boolean> {
  try {
    // For now, just check if user is admin since we haven't set up custom permissions
    const isAdmin = await isUserAdmin(userId);
    return isAdmin; // Admin users have all permissions
  } catch (error) {
    console.error("Error checking user permissions:", error);
    return false;
  }
}

/**
 * Get admin session with additional admin context (server-side)
 * @param headers - Request headers
 * @returns Promise with session and admin status
 */
export async function getAdminSession(headers: Headers) {
  try {
    const session = await auth.api.getSession({ headers });
    if (!session?.user) {
      return { session: null, isAdmin: false };
    }

    // Simple role-based check that works with the admin plugin
    const isAdmin = session.user.role === "admin";
    return { session, isAdmin };
  } catch (error) {
    console.error("Error getting admin session:", error);
    return { session: null, isAdmin: false };
  }
}

/**
 * Client-side admin utilities
 */

/**
 * Check if current user has admin permissions (client-side)
 * @returns Promise<boolean> - Whether the current user has admin permissions
 */
export async function checkCurrentUserIsAdmin(): Promise<boolean> {
  try {
    // Use the session hook to get current user
    const session = await authClient.getSession();
    if (!session?.data?.user) {
      return false;
    }

    // Simple role check - the admin plugin handles the rest automatically
    return session.data.user.role === "admin";
  } catch (error) {
    console.error("Error checking current user admin status:", error);
    return false;
  }
}

/**
 * Simple role-based admin check for backward compatibility
 * @param user - User object
 * @returns boolean - Whether the user has admin role
 */
export function hasAdminRole(user: User | null | undefined): boolean {
  return user?.role === "admin";
}

/**
 * Admin actions available through better-auth admin plugin
 */
export const adminActions = {
  // User management
  createUser: authClient.admin.createUser,
  listUsers: authClient.admin.listUsers,
  setUserRole: authClient.admin.setRole,
  setUserPassword: authClient.admin.setUserPassword,
  removeUser: authClient.admin.removeUser,

  // User moderation
  banUser: authClient.admin.banUser,
  unbanUser: authClient.admin.unbanUser,

  // Session management
  listUserSessions: authClient.admin.listUserSessions,
  revokeUserSession: authClient.admin.revokeUserSession,
  revokeUserSessions: authClient.admin.revokeUserSessions,

  // Impersonation
  impersonateUser: authClient.admin.impersonateUser,
  stopImpersonating: authClient.admin.stopImpersonating,

  // Permission checking
  hasPermission: authClient.admin.hasPermission,
  checkRolePermission: authClient.admin.checkRolePermission,
};

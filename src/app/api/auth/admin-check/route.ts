import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth, type User } from "~/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // Get the current user from the better-auth session
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ isAdmin: false }, { status: 401 });
    }

    // Check if current user is admin using role from better-auth user table
    const user = session.user as User;
    const isAdmin = user.role === "admin";

    return NextResponse.json({
      isAdmin,
      userId: user.id, // Optional: include for debugging
    });
  } catch (error) {
    console.error("Error checking admin status:", error);
    return NextResponse.json({ isAdmin: false }, { status: 500 });
  }
}

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth } from "~/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // Get the current user session using better-auth
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ isAdmin: false }, { status: 401 });
    }

    // Check if user role is admin (this works with the admin plugin configuration)
    // The admin plugin's adminRoles: ["admin"] configuration handles this automatically
    const isAdmin = session.user.role === "admin";

    // The admin plugin enhances this simple check with additional capabilities
    // like user management, banning, session control, etc.
    return NextResponse.json({
      isAdmin,
      userId: session.user.id,
      userRole: session.user.role,
    });
  } catch (error) {
    console.error("Error checking admin status:", error);
    return NextResponse.json(
      {
        isAdmin: false,
        error:
          process.env.NODE_ENV === "development"
            ? (error as Error).message
            : "Internal server error",
      },
      { status: 500 },
    );
  }
}

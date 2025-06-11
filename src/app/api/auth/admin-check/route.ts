import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createClient } from "~/utils/supabase/server";

export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get the current user from the session
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ isAdmin: false }, { status: 401 });
    }

    // Get admin ID from server environment (not exposed to client)
    const adminId = process.env.ADMIN_ID;

    if (!adminId) {
      console.error("ADMIN_ID environment variable not set");
      return NextResponse.json({ isAdmin: false }, { status: 500 });
    }

    // Check if current user is admin
    const isAdmin = user.id === adminId;

    return NextResponse.json({
      isAdmin,
      userId: user.id, // Optional: include for debugging
    });
  } catch (error) {
    console.error("Error checking admin status:", error);
    return NextResponse.json({ isAdmin: false }, { status: 500 });
  }
}

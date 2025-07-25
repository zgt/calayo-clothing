import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { Session } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  const { session } = (await request.json()) as { session: Session | null };

  if (session) {
    const cookieStore = await cookies();
    // Set the session cookie
    cookieStore.set("sb-access-token", session.access_token, {
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });
    cookieStore.set("sb-refresh-token", session.refresh_token, {
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });
  } else {
    const cookieStore = await cookies();
    // Clear the session cookies
    cookieStore.delete("sb-access-token");
    cookieStore.delete("sb-refresh-token");
  }

  return NextResponse.json({ success: true });
} 
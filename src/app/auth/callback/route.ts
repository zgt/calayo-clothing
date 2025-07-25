import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // The `/auth/callback` route handles email verification and other auth callbacks for better-auth
  const requestUrl = new URL(request.url);
  const token = requestUrl.searchParams.get("token");
  const type = requestUrl.searchParams.get("type");

  try {
    // Handle email verification
    if (token && type === "email-verification") {
      // better-auth handles email verification automatically through the client
      // This endpoint just needs to redirect appropriately
      return NextResponse.redirect(`${requestUrl.origin}/login?verified=true`);
    }

    // Handle password reset callback
    if (token && type === "password-reset") {
      return NextResponse.redirect(
        `${requestUrl.origin}/reset-password?token=${token}`,
      );
    }

    // Default redirect for other auth callbacks
    return NextResponse.redirect(requestUrl.origin);
  } catch (error) {
    console.error("Auth callback error:", error);
    // Redirect to login page with error parameter on failure
    return NextResponse.redirect(
      `${requestUrl.origin}/login?error=callback_failed`,
    );
  }
}

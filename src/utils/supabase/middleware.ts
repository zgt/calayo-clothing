import { NextResponse, type NextRequest } from "next/server";
import { auth } from "~/lib/auth";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Get the session token from the better-auth cookie
  const sessionToken = request.cookies.get("better-auth.session_token")?.value;

  let user = null;
  if (sessionToken) {
    try {
      // Validate the session with better-auth
      const session = await auth.api.getSession({
        headers: request.headers,
      });

      user = session?.user ?? null;
    } catch (error) {
      console.error("Error validating session in middleware:", error);
      // Clear invalid session cookie
      response.cookies.delete("better-auth.session_token");
    }
  }

  // Auth condition for protected routes
  const isAuthRoute =
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/signup") ||
    request.nextUrl.pathname.startsWith("/auth");

  const isProtectedRoute =
    !request.nextUrl.pathname.startsWith("/login") &&
    !request.nextUrl.pathname.startsWith("/signup") &&
    !request.nextUrl.pathname.startsWith("/auth") &&
    request.nextUrl.pathname !== "/";

  // If user is not signed in and the route requires authentication, redirect to login
  if (!user && isProtectedRoute) {
    const redirectUrl = new URL("/login", request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // If user is signed in and trying to access auth routes, redirect to dashboard
  if (user && isAuthRoute) {
    const redirectUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     * - api (API routes that don't need auth)
     */
    "/((?!_next/static|_next/image|favicon.ico|public|api).*)",
  ],
};

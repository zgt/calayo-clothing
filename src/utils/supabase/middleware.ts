import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Auth condition for protected routes
  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') || 
                     request.nextUrl.pathname.startsWith('/signup') ||
                     request.nextUrl.pathname.startsWith('/auth')
  
  const isProtectedRoute = !request.nextUrl.pathname.startsWith('/login') && 
                          !request.nextUrl.pathname.startsWith('/signup') &&
                          !request.nextUrl.pathname.startsWith('/auth') &&
                          request.nextUrl.pathname !== '/'

  // If user is not signed in and the route requires authentication, redirect to login
  if (!user && isProtectedRoute) {
    const redirectUrl = new URL('/login', request.url)
    return NextResponse.redirect(redirectUrl)
  }

  // If user is signed in and trying to access auth routes, redirect to dashboard
  if (user && isAuthRoute) {
    const redirectUrl = new URL('/dashboard', request.url)
    return NextResponse.redirect(redirectUrl)
  }

  return response
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
    '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
  ],
}
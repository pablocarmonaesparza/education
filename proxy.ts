import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function proxy(request: NextRequest) {
  try {
    // Validate environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase environment variables')
      // Allow request to continue if env vars are missing (development)
      return NextResponse.next()
    }

    // Skip middleware for all auth routes — they handle their own logic
    if (request.nextUrl.pathname.startsWith('/auth/')) {
      return NextResponse.next()
    }

    // Create a response that we can modify
    let supabaseResponse = NextResponse.next({
      request,
    })

    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
            supabaseResponse = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    // Refresh session if expired - this will also set cookie
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const protectedRoutes = ['/dashboard', '/intake', '/onboarding']
    const { pathname } = request.nextUrl

    // A route is protected if the pathname equals it exactly OR starts with
    // a trailing slash. This avoids accidentally protecting sibling routes
    // like /dashboardAlpha that merely share a prefix.
    const isProtected = protectedRoutes.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`),
    )

    // If the user is not authenticated and trying to access a protected route, redirect to login
    if (!user && isProtected) {
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('redirectedFrom', pathname)
      return NextResponse.redirect(loginUrl)
    }

    return supabaseResponse
  } catch (e) {
    // Log the error for debugging
    console.error('Proxy error:', e)

    // If we're on a protected route and there's an error, allow through
    // Let the client-side handle auth state rather than creating redirect loops
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

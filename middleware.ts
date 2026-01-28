import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  try {
    // Validate environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase environment variables')
      // Allow request to continue if env vars are missing (development)
      return NextResponse.next()
    }

    // Skip middleware for auth callback - it handles its own session and redirects
    if (request.nextUrl.pathname.startsWith('/auth/callback')) {
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

    // If the user is not authenticated and trying to access a protected route, redirect to login
    if (!user && protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('redirectedFrom', request.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }

    // If authenticated user tries to access login/signup, redirect to dashboard
    // The dashboard/onboarding pages handle their own routing logic client-side
    if (user && (request.nextUrl.pathname === '/auth/login' || request.nextUrl.pathname === '/auth/signup')) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return supabaseResponse
  } catch (e) {
    // Log the error for debugging
    console.error('Middleware error:', e)

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

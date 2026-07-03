import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { isDevBypassEnabled, isDevBypassActive } from '@/lib/dev/devBypass'

const protectedRoutes = [
  '/dashboard',
  '/case',
  '/report',
  '/admin',
  '/onboarding',
]

const internalReviewRoutes = [
  '/aprender-demo',
  '/case-demo',
  '/case-template',
  '/design',
  '/dev',
  '/exercise-lab',
]

function matchesRoute(pathname: string, routes: string[]) {
  return routes.some((route) => pathname === route || pathname.startsWith(`${route}/`))
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isProtected = matchesRoute(pathname, protectedRoutes)
  const isInternalReviewRoute = matchesRoute(pathname, internalReviewRoutes)
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-itera-pathname', pathname)

  if (isInternalReviewRoute && !isDevBypassEnabled()) {
    return new NextResponse('Not found', { status: 404 })
  }

  try {
    // Validate environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase environment variables')
      if (isProtected) {
        const loginUrl = new URL('/auth/login', request.url)
        loginUrl.searchParams.set('error', 'auth_config_missing')
        loginUrl.searchParams.set('next', pathname)
        return NextResponse.redirect(loginUrl)
      }
      return NextResponse.next()
    }

    // Skip middleware for all auth routes — they handle their own logic
    if (request.nextUrl.pathname.startsWith('/auth/')) {
      return NextResponse.next()
    }

    // Create a response that we can modify
    let supabaseResponse = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
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
              request: {
                headers: requestHeaders,
              },
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

    // ── Auth layer: rutas activas del Simulador que requieren sesión ─────
    // Dev bypass: en dev local está ON por default (cualquier browser entra sin
    // togglear); en preview es opt-in con cookie `itera_dev_bypass=1`; opt-out
    // local con `=0` desde /dev. Mismo helper que los layouts (app)/(onboarding)
    // y las APIs, así que el bypass es consistente end-to-end. El proxy corre
    // ANTES que los layouts. En prod nunca aplica (lib/dev/devBypass).
    const devBypass = isDevBypassActive(
      request.cookies.get('itera_dev_bypass')?.value,
    )

    // If the user is not authenticated and trying to access a protected route, redirect to login
    if (!user && isProtected && !devBypass) {
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('next', pathname)
      return NextResponse.redirect(loginUrl)
    }

    return supabaseResponse
  } catch (e) {
    // Log the error for debugging
    console.error('Proxy error:', e)

    if (isProtected) {
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('error', 'auth_check_failed')
      loginUrl.searchParams.set('next', pathname)
      return NextResponse.redirect(loginUrl)
    }

    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

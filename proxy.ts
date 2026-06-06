import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { isDevBypassEnabled } from '@/lib/dev/devBypass'

const protectedRoutes = [
  '/dashboard',
  '/case',
  '/report',
  '/admin',
  '/onboarding',
]

function matchesRoute(pathname: string, routes: string[]) {
  return routes.some((route) => pathname === route || pathname.startsWith(`${route}/`))
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isProtected = matchesRoute(pathname, protectedRoutes)
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-itera-pathname', pathname)

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
    // Dev bypass: la cookie itera_dev_bypass=1 (seteada desde /dev) salta el
    // guard, igual que los layouts (app)/(onboarding). El proxy corre ANTES
    // que los layouts, así que sin esto el bypass nunca funcionaba end-to-end.
    // En prod se apaga con NEXT_PUBLIC_DEV_BYPASS_DISABLED=1 (lib/dev/devBypass).
    const devBypass =
      isDevBypassEnabled() &&
      request.cookies.get('itera_dev_bypass')?.value === '1'

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

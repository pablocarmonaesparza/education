import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const protectedRoutes = [
  '/dashboard',
  '/intake',
  '/onboarding',
  '/projectDescription',
  '/projectContext',
  '/paywall',
  '/courseCreation',
]

const premiumRoutes = ['/api/generate-course']

function matchesRoute(pathname: string, routes: string[]) {
  return routes.some((route) => pathname === route || pathname.startsWith(`${route}/`))
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isProtected = matchesRoute(pathname, protectedRoutes)
  const isPremium = matchesRoute(pathname, premiumRoutes)

  try {
    // Validate environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase environment variables')
      if (isProtected || isPremium) {
        const loginUrl = new URL('/auth/login', request.url)
        loginUrl.searchParams.set('error', 'auth_config_missing')
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

    // ── Auth layer: rutas que requieren estar loggeado ──────────────
    // Tier `basic` (gratis) tiene acceso al catálogo completo de lecciones,
    // así que /dashboard solo necesita auth, no subscription. El onboarding
    // (projectDescription/projectContext) y /paywall están aquí porque son
    // post-signup flow; si cae aquí sin cookie, mándalo a login primero.
    // If the user is not authenticated and trying to access a protected route, redirect to login
    if (!user && isProtected) {
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('redirectedFrom', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // ── Subscription layer: endpoints premium (solo tier pagado) ───
    // /api/generate-course llama a OpenAI + Cohere para generar la ruta
    // personalizada — es el core del tier mensual/anual y donde se queman
    // los tokens caros. El gratis usa /api/generate-course-full (solo SQL
    // sintético sin LLM), que NO se protege.
    //
    // La page /courseCreation sirve ambos tiers (decide qué endpoint
    // llamar por tier); por eso el gate vive a nivel endpoint, no page.
    // Defensa en profundidad adicional dentro del handler para cubrir
    // llamadas server-to-server o casos donde el matcher no aplique.
    //
    // Chequeo `subscription_active` (bool) en vez de `tier` (enum) porque
    // el webhook de Stripe ya lo escribe de forma autoritativa en
    // `checkout.session.completed` y `customer.subscription.*`. Sidesteppea
    // el mismatch entre tier='personalized' (webhook) vs PAID_TIER='premium'
    // (lib/stripe/config.ts) que Finance está por arreglar en un commit
    // aparte — este gate funciona igual antes y después del fix.
    if (user && isPremium) {
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('subscription_active')
        .eq('id', user.id)
        .maybeSingle()

      // Fail-closed en cualquier ambigüedad (error o row sin subscription_active=true).
      // maybeSingle devuelve {data:null, error:null} cuando RLS oculta la row;
      // lo tratamos igual que "no paga" — no hay manera legítima de no tener fila.
      const hasActiveSub = !profileError && profile?.subscription_active === true

      if (!hasActiveSub) {
        if (profileError) {
          console.error('[proxy] subscription check failed for', user.id, profileError)
        }

        // Para rutas de API respondemos 402 (Payment Required) — no es
        // navegación, no tiene sentido redirect. El cliente del fetch
        // maneja el código. Para rutas de page (si luego se añaden) se
        // haría redirect a /paywall.
        if (pathname.startsWith('/api/')) {
          return NextResponse.json(
            { error: 'subscription_required', message: 'Suscripción activa requerida para generar tu ruta personalizada.' },
            { status: 402 },
          )
        }

        const paywallUrl = new URL('/paywall', request.url)
        paywallUrl.searchParams.set('from', pathname)
        if (profileError) paywallUrl.searchParams.set('reason', 'check_failed')
        return NextResponse.redirect(paywallUrl)
      }
    }

    return supabaseResponse
  } catch (e) {
    // Log the error for debugging
    console.error('Proxy error:', e)

    if (isPremium && pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'auth_check_failed', message: 'No pudimos validar tu sesión.' },
        { status: 401 },
      )
    }

    if (isProtected || isPremium) {
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('error', 'auth_check_failed')
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

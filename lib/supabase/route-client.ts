import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export type CookieToSet = { name: string; value: string; options: CookieOptions }

/**
 * Cliente Supabase para Route Handlers que terminan en redirect
 * (p. ej. /auth/confirm, /auth/callback).
 *
 * A diferencia de `createClient` en server.ts, acumula en `cookiesToSet`
 * cada cookie que Supabase intenta escribir, para que el handler pueda
 * re-aplicarlas sobre el `NextResponse.redirect` final.
 */
export async function createRouteClient() {
  const cookieStore = await cookies()
  const cookiesToSet: CookieToSet[] = []

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookies) {
          cookies.forEach((cookie) => {
            cookiesToSet.push(cookie)
            try {
              cookieStore.set(cookie.name, cookie.value, cookie.options)
            } catch {
              // contexto read-only (edge runtime corner cases)
            }
          })
        },
      },
    }
  )

  return { supabase, cookiesToSet, cookieStore }
}

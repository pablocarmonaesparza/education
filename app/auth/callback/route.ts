import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { sendWelcomeEmail } from '@/lib/email/welcome'

function safeNext(value: string | null): string | null {
  if (!value) return null
  try {
    const decoded = decodeURIComponent(value)
    if (!decoded.startsWith('/') || decoded.startsWith('//')) return null
    return decoded
  } catch {
    return null
  }
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')
  const fromPage = searchParams.get('from')
  const requestedNext = safeNext(searchParams.get('next'))

  // Determine where to redirect on error
  const errorPage = fromPage === 'signup' ? '/auth/signup' : '/auth/login'

  if (error) {
    console.error('[auth/callback] OAuth error:', error, errorDescription)
    return NextResponse.redirect(
      `${origin}${errorPage}?error=${encodeURIComponent(errorDescription || error)}`
    )
  }

  if (!code) {
    console.error('[auth/callback] No code parameter received')
    return NextResponse.redirect(
      `${origin}/auth/login?error=${encodeURIComponent('No se recibió código de autenticación.')}`
    )
  }

  try {
    const cookieStore = await cookies()

    // Log available cookies for debugging PKCE issues
    const allCookies = cookieStore.getAll()
    const codeVerifierCookie = allCookies.find(c => c.name.includes('code_verifier'))
    console.log('[auth/callback] Code verifier cookie present:', !!codeVerifierCookie)
    console.log('[auth/callback] Total cookies:', allCookies.length)

    // Accumulate cookies that Supabase wants to set so we can apply them to the response
    const cookiesToSet: { name: string; value: string; options: CookieOptions }[] = []

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
                // Ignore errors in case this runs in a read-only context
              }
            })
          },
        },
      }
    )

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error('[auth/callback] Exchange error:', exchangeError.message)

      // If PKCE code verifier is missing, provide a clearer message
      const userMessage = exchangeError.message.includes('code_verifier')
        ? 'La sesión de autenticación expiró. Por favor intenta de nuevo.'
        : 'Error de autenticación. Por favor intenta de nuevo.'

      return NextResponse.redirect(
        `${origin}${errorPage}?error=${encodeURIComponent(userMessage)}`
      )
    }

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      console.error('[auth/callback] No user found after successful code exchange')
      return NextResponse.redirect(
        `${origin}${errorPage}?error=${encodeURIComponent('Error al obtener información del usuario.')}`
      )
    }

    console.log('[auth/callback] User authenticated:', user.id)

    // Upsert a public.users. Gating del welcome email por atomic claim
    // sobre `welcome_email_sent_at IS NULL`:
    //
    //   UPDATE users SET welcome_email_sent_at = now()
    //     WHERE id = ? AND welcome_email_sent_at IS NULL
    //     RETURNING id
    //
    // Solo un llamador concurrente recibe fila — los demás skipean sin
    // mandar. Si el envío falla, rollback del timestamp para que un
    // callback futuro (o el endpoint manual) pueda reintentar.
    const userName =
      user.user_metadata?.name || user.email?.split('@')[0] || 'Usuario'

    // Asegurar fila en public.users (extensión legacy de auth.users con tier
    // y stripe metadata). 23505 = ya existe, ignorado.
    const { error: insertError } = await supabase.from('users').insert({
      id: user.id,
      email: user.email,
      name: userName,
      tier: 'basic',
      welcome_email_sent_at: null,
    })
    if (insertError && insertError.code !== '23505') {
      console.error('[auth/callback] users.insert failed:', insertError)
    }

    // Asegurar bridge row en simulador.users (linkea auth.users con el
    // schema multi-tenant del Simulador). La función es idempotente y
    // también cubre cuentas creadas antes del Simulador.
    const { error: simBridgeError } = await supabase
      .schema('simulador')
      .rpc('ensure_bridge_user', {
        p_auth_user_id: user.id,
      })
    if (simBridgeError) {
      console.error(
        '[auth/callback] simulador.ensure_bridge_user failed:',
        simBridgeError
      )
      return NextResponse.redirect(
        `${origin}${errorPage}?error=${encodeURIComponent('No pudimos sincronizar tu cuenta. Intenta de nuevo.')}`
      )
    }

    if (user.email) {
      // Claim atómico: intentamos marcar welcome_email_sent_at si todavía
      // es NULL. El RETURNING nos dice si ganamos la carrera.
      const stamp = new Date().toISOString()
      const { data: claimed, error: claimError } = await supabase
        .from('users')
        .update({ welcome_email_sent_at: stamp })
        .eq('id', user.id)
        .is('welcome_email_sent_at', null)
        .select('id')
        .maybeSingle()

      if (claimError) {
        console.error('[auth/callback] welcome claim failed:', claimError.message)
      } else if (claimed) {
        // Ganamos la carrera — disparamos el welcome. Awaited (no
        // fire-and-forget) porque si falla queremos rollback del claim
        // para permitir retry. Latencia extra aceptable — AgentMail < 1s.
        const sendResult = await sendWelcomeEmail({
          userEmail: user.email,
          userName,
          origin,
        })

        if (!sendResult.ok) {
          if (sendResult.reason !== 'not_configured') {
            console.warn(
              '[auth/callback] welcome email not sent:',
              sendResult.reason
            )
          }
          // Rollback del claim SOLO si nuestro stamp sigue ahí (no lo
          // sobreescribió nadie). Permite que un retry futuro vuelva a
          // intentar el envío.
          const { error: rollbackError } = await supabase
            .from('users')
            .update({ welcome_email_sent_at: null })
            .eq('id', user.id)
            .eq('welcome_email_sent_at', stamp)
          if (rollbackError) {
            console.error(
              '[auth/callback] welcome claim rollback failed:',
              rollbackError.message
            )
          }
        }
      }
      // claimed === null significa que otro callback ya envió el welcome
      // (o que no existe la fila — poco probable dado el INSERT de arriba).
      // No hacemos nada: el correo ya salió por el otro path.
    }

    // Check si el user ya tiene una membership en simulador.organization_memberships.
    // - si sí → /dashboard (manager) o /case/... (employee) — el dashboard decide
    // - si no → /onboarding/org (buyer flow B2B se construye en W3)
    //
    // W2: tablas simulador existen pero el onboarding flow aún no está
    // implementado. Por ahora redirige a /dashboard que tiene auth guard
    // y mostrará empty state si no hay sprint asignado.
    const { data: membership } = await supabase
      .schema('simulador')
      .from('organization_memberships')
      .select('organization_id, role')
      .limit(1)
      .maybeSingle()

    const fallbackPath = membership ? '/dashboard' : '/onboarding/org'
    const redirectUrl = `${origin}${requestedNext ?? fallbackPath}`

    console.log('[auth/callback] Redirecting to:', redirectUrl)

    // Create response and apply all accumulated cookies
    const response = NextResponse.redirect(redirectUrl)
    cookiesToSet.forEach(({ name, value, options }) => {
      response.cookies.set(name, value, options)
    })

    return response
  } catch (err: unknown) {
    console.error('[auth/callback] Unexpected error:', errorMessage(err))
    return NextResponse.redirect(
      `${origin}${errorPage}?error=${encodeURIComponent('Error inesperado durante la autenticación. Por favor intenta de nuevo.')}`
    )
  }
}

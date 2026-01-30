import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')
  const fromPage = searchParams.get('from')

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
    const cookiesToSet: { name: string; value: string; options: any }[] = []

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

    // Check if user has an existing learning path
    const { data: intakeData } = await supabase
      .from('intake_responses')
      .select('generated_path')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    const redirectUrl = intakeData?.generated_path
      ? `${origin}/dashboard`
      : `${origin}/onboarding`

    console.log('[auth/callback] Redirecting to:', redirectUrl)

    // Create response and apply all accumulated cookies
    const response = NextResponse.redirect(redirectUrl)
    cookiesToSet.forEach(({ name, value, options }) => {
      response.cookies.set(name, value, options)
    })

    return response
  } catch (err: any) {
    console.error('[auth/callback] Unexpected error:', err?.message || err)
    return NextResponse.redirect(
      `${origin}${errorPage}?error=${encodeURIComponent('Error inesperado durante la autenticación. Por favor intenta de nuevo.')}`
    )
  }
}

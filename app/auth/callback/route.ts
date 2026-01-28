import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')
  const fromPage = searchParams.get('from') // 'signup' or 'login'

  // Always use the request origin to ensure cookies work correctly with PKCE
  const baseUrl = origin

  // Handle OAuth errors - redirect back to the page the user came from
  if (error) {
    console.error('OAuth error:', error, errorDescription)
    const errorPage = fromPage === 'signup' ? '/auth/signup' : '/auth/login'
    return NextResponse.redirect(`${baseUrl}${errorPage}?error=${encodeURIComponent(errorDescription || error)}`)
  }

  if (code) {
    const cookieStore = await cookies()

    // Create a response first so we can set cookies on it
    // We'll update the redirect URL later
    let redirectUrl = `${baseUrl}/onboarding`

    // Store cookies to set on the response
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
              // Also set on cookieStore so subsequent Supabase calls in this request can read them
              try {
                cookieStore.set(cookie.name, cookie.value, cookie.options)
              } catch {
                // May fail in some contexts, that's okay - we set them on the response below
              }
            })
          },
        },
      }
    )

    const { data: sessionData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error('Error exchanging code for session:', exchangeError.message, exchangeError)

      // If PKCE exchange fails, redirect to a client-side handler that can do the exchange
      // The browser client has the code_verifier cookie that the server may not be able to read
      const errorPage = fromPage === 'signup' ? '/auth/signup' : '/auth/login'
      return NextResponse.redirect(
        `${baseUrl}${errorPage}?code=${encodeURIComponent(code)}&exchange_on_client=true`
      )
    }

    // Successfully exchanged code for session
    const user = sessionData?.user

    if (user) {
      // Check if there's a pending project idea from the landing page
      const pendingIdeaCookie = cookieStore.get('pendingProjectIdea')
      const hasPendingIdea = !!pendingIdeaCookie?.value

      if (hasPendingIdea) {
        redirectUrl = `${baseUrl}/onboarding`
      } else {
        // Check if user has a personalized path (existing user)
        try {
          const { data: intakeData } = await supabase
            .from('intake_responses')
            .select('generated_path')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()

          if (intakeData?.generated_path) {
            redirectUrl = `${baseUrl}/dashboard`
          } else {
            redirectUrl = `${baseUrl}/onboarding`
          }
        } catch {
          redirectUrl = `${baseUrl}/onboarding`
        }
      }
    } else {
      console.error('No user found after successful code exchange')
      const errorPage = fromPage === 'signup' ? '/auth/signup' : '/auth/login'
      return NextResponse.redirect(`${baseUrl}${errorPage}?error=${encodeURIComponent('Error al obtener información del usuario.')}`)
    }

    // Create response with redirect
    const response = NextResponse.redirect(redirectUrl)

    // Set all cookies on the response - critical for session persistence
    cookiesToSet.forEach(({ name, value, options }) => {
      response.cookies.set(name, value, options)
    })

    return response
  }

  // No code provided, redirect to login
  return NextResponse.redirect(`${baseUrl}/auth/login?error=no_code`)
}

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
  // This is critical because PKCE stores the code verifier in cookies on the original domain
  const baseUrl = origin

  // Handle OAuth errors - redirect back to the page the user came from
  if (error) {
    console.error('OAuth error:', error, errorDescription)
    const errorPage = fromPage === 'signup' ? '/auth/signup' : '/auth/login'
    return NextResponse.redirect(`${baseUrl}${errorPage}?error=${encodeURIComponent(errorDescription || error)}`)
  }

  if (code) {
    const cookieStore = await cookies()
    
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
            })
          },
        },
      }
    )
    
    const { data: sessionData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (exchangeError) {
      console.error('Error exchanging code:', exchangeError.message, exchangeError)
      // Redirect back to the appropriate page on error
      const errorPage = fromPage === 'signup' ? '/auth/signup' : '/auth/login'
      return NextResponse.redirect(`${baseUrl}${errorPage}?error=${encodeURIComponent('Error de autenticación. Por favor intenta de nuevo.')}`)
    }

    // Check if there's a pending project idea from the landing page
    const pendingIdeaCookie = cookieStore.get('pendingProjectIdea')
    const hasPendingIdea = !!pendingIdeaCookie?.value

    // Get user to check if they have a personalized path
    const { data: { user } } = await supabase.auth.getUser()
    
    // Determine redirect URL
    let redirectUrl = `${baseUrl}/onboarding`
    
    if (user) {
      if (hasPendingIdea) {
        // User has a pending project idea, go to onboarding
        redirectUrl = `${baseUrl}/onboarding`
      } else {
        // Check if user has a personalized path (existing user)
        const { data: intakeData } = await supabase
          .from('intake_responses')
          .select('generated_path')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (intakeData?.generated_path) {
          // Existing user with a path - go to dashboard
          redirectUrl = `${baseUrl}/dashboard`
        } else {
          // New user or user without a path - go to onboarding
          redirectUrl = `${baseUrl}/onboarding`
        }
      }
    } else {
      // This shouldn't happen after successful code exchange, but handle it
      console.error('No user found after successful code exchange')
      const errorPage = fromPage === 'signup' ? '/auth/signup' : '/auth/login'
      return NextResponse.redirect(`${baseUrl}${errorPage}?error=${encodeURIComponent('Error al obtener información del usuario.')}`)
    }

    // Create response with redirect
    const response = NextResponse.redirect(redirectUrl)
    
    // Set all cookies on the response - this is critical for the session to persist
    cookiesToSet.forEach(({ name, value, options }) => {
      response.cookies.set(name, value, options)
    })

    return response
  }

  // No code provided, redirect to login
  return NextResponse.redirect(`${baseUrl}/auth/login?error=no_code`)
}

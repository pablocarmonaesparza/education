import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')
  
  // Use the canonical domain for production, or origin for development
  const baseUrl = process.env.NODE_ENV === 'production' ? 'https://itera.la' : origin

  // Handle OAuth errors
  if (error) {
    console.error('OAuth error:', error, errorDescription)
    return NextResponse.redirect(`${baseUrl}/auth/login?error=${encodeURIComponent(errorDescription || error)}`)
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
    
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (exchangeError) {
      console.error('Error exchanging code:', exchangeError)
      return NextResponse.redirect(`${baseUrl}/auth/login?error=confirmation_failed`)
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
        redirectUrl = `${baseUrl}/onboarding`
      } else {
        // Check if user has a personalized path
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
      }
    }

    // Create response with redirect
    const response = NextResponse.redirect(redirectUrl)
    
    // Set all cookies on the response
    cookiesToSet.forEach(({ name, value, options }) => {
      response.cookies.set(name, value, options)
    })

    return response
  }

  // No code provided, redirect to login
  return NextResponse.redirect(`${baseUrl}/auth/login?error=no_code`)
}

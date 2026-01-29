import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')
  const fromPage = searchParams.get('from')

  if (error) {
    console.error('OAuth error:', error, errorDescription)
    const errorPage = fromPage === 'signup' ? '/auth/signup' : '/auth/login'
    return NextResponse.redirect(`${origin}${errorPage}?error=${encodeURIComponent(errorDescription || error)}`)
  }

  if (code) {
    const cookieStore = await cookies()

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
              // Also set on the cookie store so subsequent reads (like getUser) see updated values
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
      console.error('Error exchanging code:', exchangeError.message)
      const errorPage = fromPage === 'signup' ? '/auth/signup' : '/auth/login'
      return NextResponse.redirect(`${origin}${errorPage}?error=${encodeURIComponent('Error de autenticación. Por favor intenta de nuevo.')}`)
    }

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      console.error('No user found after successful code exchange')
      const errorPage = fromPage === 'signup' ? '/auth/signup' : '/auth/login'
      return NextResponse.redirect(`${origin}${errorPage}?error=${encodeURIComponent('Error al obtener información del usuario.')}`)
    }

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

    // Create response and apply all accumulated cookies
    const response = NextResponse.redirect(redirectUrl)
    cookiesToSet.forEach(({ name, value, options }) => {
      response.cookies.set(name, value, options)
    })

    return response
  }

  return NextResponse.redirect(`${origin}/auth/login?error=no_code`)
}

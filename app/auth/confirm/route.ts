import { NextResponse } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';
import { createRouteClient } from '@/lib/supabase/route-client';

/**
 * Handler del link que sale en los correos de auth (recovery, signup
 * confirm, magic link, email change).
 *
 * Formato del link que construye `app/api/auth/email-hook/route.ts`:
 *   /auth/confirm?token_hash=<...>&type=<recovery|email|magiclink>&next=<...>
 *
 * Supabase-js expone `verifyOtp({ token_hash, type })` para canjear el
 * token por una sesión válida. Si pasa, redirigimos al `next` (o a un
 * default por action). Si falla, a /auth/login con un mensaje.
 *
 * Referencia: https://supabase.com/docs/guides/auth/server-side/email-based-auth-with-pkce-flow
 */

function safeRedirectPath(next: string | null): string {
  if (!next) return '/dashboard';

  try {
    const decoded = decodeURIComponent(next);
    if (!decoded.startsWith('/') || decoded.startsWith('//')) return '/dashboard';
    return decoded;
  } catch {
    return '/dashboard';
  }
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const next = safeRedirectPath(searchParams.get('next'));

  if (!token_hash || !type) {
    return NextResponse.redirect(
      `${origin}/auth/login?error=${encodeURIComponent('Invalid or incomplete link.')}`
    );
  }

  const { supabase, cookiesToSet } = await createRouteClient();

  const { error } = await supabase.auth.verifyOtp({ token_hash, type });

  if (error) {
    console.error('[auth/confirm] verifyOtp failed:', error.message);
    const friendly =
      error.message.includes('expired') || error.message.includes('invalid')
        ? 'This link expired or was already used. Request a new one.'
        : 'We could not verify your link. Try again.';
    return NextResponse.redirect(
      `${origin}/auth/login?error=${encodeURIComponent(friendly)}`
    );
  }

  // Para `recovery`, Supabase crea una sesión temporal — el user debe setear
  // su nueva contraseña ahora. Redirigimos a una página de reset.
  const destination = type === 'recovery' ? '/auth/reset-password' : next;
  const redirectUrl = `${origin}${destination.startsWith('/') ? destination : `/${destination}`}`;

  const response = NextResponse.redirect(redirectUrl);
  cookiesToSet.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options);
  });
  return response;
}

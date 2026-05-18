import { NextRequest, NextResponse } from 'next/server';

const CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY || '';
const CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET || '';
const REDIRECT_URI = process.env.TIKTOK_REDIRECT_URI || '';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(new URL('/home?error=' + encodeURIComponent(error), req.url));
  }

  const savedState = req.cookies.get('tt_oauth_state')?.value;
  if (!state || state !== savedState) {
    return NextResponse.redirect(new URL('/home?error=state_mismatch', req.url));
  }

  // Exchange code for access token
  const tokenRes = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_key: CLIENT_KEY,
      client_secret: CLIENT_SECRET,
      code: code!,
      grant_type: 'authorization_code',
      redirect_uri: REDIRECT_URI,
    }),
  });

  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    return NextResponse.redirect(new URL('/home?error=token_failed', req.url));
  }

  const accessToken = tokenData.access_token;

  // Fetch user info
  const userRes = await fetch(
    'https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name,avatar_url',
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const userData = await userRes.json();
  const user = userData.data?.user || {};

  const res = NextResponse.redirect(new URL('/home/dashboard', req.url));
  res.cookies.delete('tt_oauth_state');
  res.cookies.set('tt_access_token', accessToken, { httpOnly: true, secure: true, maxAge: 86400, path: '/' });
  res.cookies.set('tt_open_id', user.open_id || '', { httpOnly: true, secure: true, maxAge: 86400, path: '/' });
  res.cookies.set('tt_display_name', user.display_name || 'TikTok User', { httpOnly: false, secure: true, maxAge: 86400, path: '/' });
  res.cookies.set('tt_avatar_url', user.avatar_url || '', { httpOnly: false, secure: true, maxAge: 86400, path: '/' });
  res.cookies.set('tt_user_info', JSON.stringify(userData.data || {}), { httpOnly: true, secure: true, maxAge: 86400, path: '/' });
  return res;
}

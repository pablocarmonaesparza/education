import { NextResponse } from 'next/server';
import crypto from 'crypto';

const CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY || '';
const REDIRECT_URI = process.env.TIKTOK_REDIRECT_URI || '';
const SCOPES = 'user.info.basic,video.upload,video.publish';

export async function GET() {
  const state = crypto.randomBytes(16).toString('hex');

  const params = new URLSearchParams({
    client_key: CLIENT_KEY,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: SCOPES,
    state,
  });

  const authUrl = `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`;

  const res = NextResponse.redirect(authUrl);
  res.cookies.set('tt_oauth_state', state, {
    httpOnly: true,
    secure: true,
    maxAge: 600,
    path: '/',
  });
  return res;
}

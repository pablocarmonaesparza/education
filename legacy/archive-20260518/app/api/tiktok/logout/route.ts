import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const res = NextResponse.redirect(new URL('/home', req.url));
  res.cookies.delete('tt_access_token');
  res.cookies.delete('tt_open_id');
  res.cookies.delete('tt_display_name');
  res.cookies.delete('tt_avatar_url');
  res.cookies.delete('tt_user_info');
  return res;
}

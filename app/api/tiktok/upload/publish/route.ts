import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const accessToken = req.cookies.get('tt_access_token')?.value;
  if (!accessToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const body = await req.json();
  const { video_url, title = 'Itera Educational Content' } = body;

  if (!video_url) {
    return NextResponse.json({ error: 'Missing video_url' }, { status: 400 });
  }

  const payload = {
    post_info: {
      title,
      privacy_level: 'SELF_ONLY',
      disable_duet: false,
      disable_comment: false,
      disable_stitch: false,
    },
    source_info: {
      source: 'PULL_FROM_URL',
      video_url,
    },
  };

  const apiRes = await fetch('https://open.tiktokapis.com/v2/post/publish/video/init/', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json; charset=UTF-8',
    },
    body: JSON.stringify(payload),
  });

  const data = await apiRes.json();
  return NextResponse.json(data);
}

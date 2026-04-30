import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { enforceRateLimit, rateLimiters } from '@/lib/ratelimit';

const ALLOWED_REASONS = [
  'wrong_correct_answer',
  'wrong_incorrect_answer',
  'unclear_explanation',
  'typo_or_grammar',
  'visual_issue',
  'other',
] as const;

type Reason = (typeof ALLOWED_REASONS)[number];

type Body = {
  reason: Reason;
  comment?: string | null;
  lecture_id?: string | null;
  user_attempt?: unknown;
};

function isValidUuid(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const blocked = await enforceRateLimit(request, rateLimiters.standard);
  if (blocked) return blocked;

  const { id: slideId } = await params;

  if (!isValidUuid(slideId)) {
    return NextResponse.json({ error: 'invalid slide id' }, { status: 400 });
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'invalid json body' }, { status: 400 });
  }

  if (!body.reason || !ALLOWED_REASONS.includes(body.reason)) {
    return NextResponse.json({ error: 'invalid reason' }, { status: 400 });
  }

  const comment =
    typeof body.comment === 'string' ? body.comment.trim().slice(0, 500) : null;

  const lectureId =
    typeof body.lecture_id === 'string' && isValidUuid(body.lecture_id)
      ? body.lecture_id
      : null;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('slide_flags')
    .insert({
      slide_id: slideId,
      user_id: user.id,
      reason: body.reason,
      comment: comment && comment.length > 0 ? comment : null,
      lecture_id: lectureId,
      user_attempt: body.user_attempt ?? null,
    })
    .select('id')
    .single();

  if (error) {
    // 23505 = unique_violation: ya flagueó este slide con el mismo reason.
    // No es error real para el usuario — su voto ya cuenta.
    if (error.code === '23505') {
      return NextResponse.json({ ok: true, deduped: true }, { status: 200 });
    }
    console.error('[api/slides/flag] insert failed:', error);
    return NextResponse.json({ error: 'insert failed' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: data.id }, { status: 201 });
}

// app/api/experiment/roleplay/route.ts
// Demo 3: roleplay de situaciones reales (cliente difícil, pitch, negociación).

import { NextRequest } from 'next/server';
import { streamOpenAI } from '@/lib/experiment/openai-stream';
import { promptRoleplay } from '@/lib/experiment/prompts';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  let body: {
    personaje?: string;
    situacion?: string;
    habilidad?: string;
    messages?: Array<{ role: 'user' | 'assistant'; content: string }>;
  };
  try {
    body = await req.json();
  } catch {
    return new Response('json inválido', { status: 400 });
  }

  const { personaje, situacion, habilidad, messages } = body;
  if (
    !personaje?.trim() ||
    !situacion?.trim() ||
    !habilidad?.trim() ||
    !Array.isArray(messages)
  ) {
    return new Response(
      'personaje, situacion, habilidad y messages son requeridos',
      { status: 400 }
    );
  }

  return streamOpenAI({
    systemPrompt: promptRoleplay(personaje, situacion, habilidad),
    messages,
    maxTokens: 500,
    temperature: 0.85, // más creativo para que el personaje se sienta vivo
  });
}

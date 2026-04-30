// app/api/experiment/explicame/route.ts
// Demo 4: patrón Feynman — el estudiante explica con sus palabras, el tutor
// detecta huecos con preguntas socráticas.

import { NextRequest } from 'next/server';
import { streamOpenAI } from '@/lib/experiment/openai-stream';
import { promptExplicame } from '@/lib/experiment/prompts';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  let body: {
    concepto?: string;
    messages?: Array<{ role: 'user' | 'assistant'; content: string }>;
  };
  try {
    body = await req.json();
  } catch {
    return new Response('json inválido', { status: 400 });
  }

  const { concepto, messages } = body;
  if (!concepto?.trim() || !Array.isArray(messages)) {
    return new Response('concepto y messages son requeridos', { status: 400 });
  }

  return streamOpenAI({
    systemPrompt: promptExplicame(concepto),
    messages,
    maxTokens: 700,
    temperature: 0.6,
  });
}

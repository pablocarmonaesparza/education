// app/api/experiment/examen-oral/route.ts
// Demo 2: examen oral adaptativo al cierre de una sección.

import { NextRequest } from 'next/server';
import { streamOpenAI } from '@/lib/experiment/openai-stream';
import { promptExamenOral } from '@/lib/experiment/prompts';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  let body: {
    seccion?: string;
    conceptos?: string;
    messages?: Array<{ role: 'user' | 'assistant'; content: string }>;
  };
  try {
    body = await req.json();
  } catch {
    return new Response('json inválido', { status: 400 });
  }

  const { seccion, conceptos, messages } = body;
  if (!seccion?.trim() || !conceptos?.trim() || !Array.isArray(messages)) {
    return new Response(
      'seccion, conceptos y messages son requeridos',
      { status: 400 }
    );
  }

  return streamOpenAI({
    systemPrompt: promptExamenOral(seccion, conceptos),
    messages,
    maxTokens: 600,
    temperature: 0.6,
  });
}

// app/api/experiment/curso-personalizado/route.ts
// Demo 1: re-escribe una lección genérica con ejemplos del proyecto del estudiante.

import { NextRequest } from 'next/server';
import { streamOpenAI } from '@/lib/experiment/openai-stream';
import { PROMPT_CURSO_PERSONALIZADO } from '@/lib/experiment/prompts';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  let body: { proyecto?: string; leccion?: string };
  try {
    body = await req.json();
  } catch {
    return new Response('json inválido', { status: 400 });
  }

  const { proyecto, leccion } = body;
  if (!proyecto?.trim() || !leccion?.trim()) {
    return new Response('proyecto y leccion son requeridos', { status: 400 });
  }

  return streamOpenAI({
    systemPrompt: PROMPT_CURSO_PERSONALIZADO,
    messages: [
      {
        role: 'user',
        content: `proyecto del estudiante:\n${proyecto}\n\n---\n\nlección genérica original:\n${leccion}\n\n---\n\nre-escribe la lección aplicando los ejemplos al proyecto del estudiante. mantené slides y estructura.`,
      },
    ],
    maxTokens: 1800,
    temperature: 0.7,
  });
}

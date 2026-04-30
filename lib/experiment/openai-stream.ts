// lib/experiment/openai-stream.ts
// Helper minimal para los demos de /experimentllm.
// Usa OpenAI gpt-4o-mini por defecto (no es el modelo final que usaremos en
// producción — Qwen 3 8B vía DeepInfra es el plan — pero sirve para demoar
// las ideas funcionando).

import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface StreamOpenAIOpts {
  systemPrompt: string;
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

/**
 * Llama a OpenAI con streaming y devuelve un Response con texto plano que
 * el cliente lee con `getReader().read()`. Sin NDJSON, sin conversation
 * IDs, sin persistencia — solo para los demos.
 */
export async function streamOpenAI(opts: StreamOpenAIOpts): Promise<Response> {
  if (!process.env.OPENAI_API_KEY) {
    return new Response(
      'OPENAI_API_KEY no está configurada en el entorno.',
      { status: 500 }
    );
  }

  let stream: AsyncIterable<any>;
  try {
    stream = await openai.chat.completions.create({
      model: opts.model ?? 'gpt-4o-mini',
      messages: [
        { role: 'system' as const, content: opts.systemPrompt },
        ...opts.messages,
      ],
      max_tokens: opts.maxTokens ?? 800,
      temperature: opts.temperature ?? 0.7,
      stream: true,
    });
  } catch (err: any) {
    return new Response(
      `error de openai: ${err?.message ?? 'desconocido'}`,
      { status: 500 }
    );
  }

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const text = chunk.choices?.[0]?.delta?.content;
          if (text) controller.enqueue(encoder.encode(text));
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'Cache-Control': 'no-cache',
    },
  });
}

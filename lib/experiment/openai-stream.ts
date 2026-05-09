// lib/experiment/openai-stream.ts
// Helper minimal para los demos de /experimentllm.
//
// Usa el wrapper `chat()` de `lib/llm/client.ts` que llama a DeepSeek primero
// y hace fallback a Gemini-3.1-flash si falla. Conserva el shape OpenAI-compat
// de stream para no romper los consumidores actuales.

import { chat } from '@/lib/llm/client';

export interface StreamOpenAIOpts {
  systemPrompt: string;
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  /** Modelo principal (DeepSeek). Default: `deepseek-chat`. */
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

/**
 * Llama a DeepSeek con streaming (con fallback a Gemini si DeepSeek falla)
 * y devuelve un Response con texto plano que el cliente lee con
 * `getReader().read()`. Sin NDJSON, sin conversation IDs, sin persistencia —
 * solo para los demos de /experimentllm.
 */
export async function streamOpenAI(opts: StreamOpenAIOpts): Promise<Response> {
  if (!process.env.DEEPSEEK_API_KEY && !process.env.GEMINI_API_KEY) {
    return new Response(
      'Ni DEEPSEEK_API_KEY ni GEMINI_API_KEY configuradas. Configurar al menos una.',
      { status: 500 }
    );
  }

  let stream: AsyncIterable<{
    choices?: Array<{ delta?: { content?: string | null } }>;
  }>;
  try {
    stream = await chat({
      model: opts.model ?? 'deepseek-chat',
      messages: [
        { role: 'system' as const, content: opts.systemPrompt },
        ...opts.messages,
      ],
      max_tokens: opts.maxTokens ?? 800,
      temperature: opts.temperature ?? 0.7,
      stream: true,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'desconocido';
    return new Response(`error de llm: ${message}`, { status: 500 });
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

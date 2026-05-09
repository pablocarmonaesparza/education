// lib/tutor/providers.ts — Motor de streaming multi-provider
//
// Por decisión de producto, el provider 'openai' redirige a DeepSeek+Gemini
// (vía `lib/llm/client.ts`). Anthropic y Google nativos quedan como
// alternativas si en algún futuro queremos otro path. El nombre
// `streamOpenAI` se conserva por compat de la API pública.

import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenAI } from '@google/genai';
import { chat } from '@/lib/llm/client';
import type { TutorProvider, StreamProviderParams } from '@/types/tutor';

// --- OpenAI-compat (DeepSeek primary + Gemini fallback) ---

function streamOpenAI(params: StreamProviderParams): ReadableStream<string> {
  return new ReadableStream({
    async start(controller) {
      try {
        const stream = await chat({
          // Si el caller pasa un model "gpt-*", lo respetamos? No — DeepSeek
          // no acepta esos. Si el model empieza con 'gpt' lo mapeamos a
          // deepseek-chat; si ya es 'deepseek-*' o 'gemini-*' lo respetamos.
          model:
            params.model.startsWith('deepseek-') ||
            params.model.startsWith('gemini-')
              ? params.model
              : 'deepseek-chat',
          messages: [
            { role: 'system' as const, content: params.systemPrompt },
            ...params.messages.map((m) => ({
              role: m.role as 'user' | 'assistant',
              content: m.content,
            })),
          ],
          max_tokens: params.maxTokens,
          temperature: params.temperature,
          stream: true,
        });

        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content;
          if (text) {
            controller.enqueue(text);
          }
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });
}

// --- Anthropic ---

function streamAnthropic(params: StreamProviderParams): ReadableStream<string> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  // Anthropic requires alternating user/assistant messages
  // and takes system prompt as a separate parameter
  const messages = params.messages.map((m) => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }));

  return new ReadableStream({
    async start(controller) {
      try {
        const stream = anthropic.messages.stream({
          model: params.model,
          system: params.systemPrompt,
          messages,
          max_tokens: params.maxTokens,
          temperature: params.temperature,
        });

        for await (const event of stream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            controller.enqueue(event.delta.text);
          }
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });
}

// --- Google Gemini ---

function streamGoogle(params: StreamProviderParams): ReadableStream<string> {
  const genai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEMINI_API_KEY });

  // Google uses 'model' role instead of 'assistant'
  const contents = params.messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  return new ReadableStream({
    async start(controller) {
      try {
        const response = await genai.models.generateContentStream({
          model: params.model,
          contents,
          config: {
            systemInstruction: params.systemPrompt,
            maxOutputTokens: params.maxTokens,
            temperature: params.temperature,
          },
        });

        for await (const chunk of response) {
          const text = chunk.text;
          if (text) {
            controller.enqueue(text);
          }
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });
}

// --- Public API ---

export function streamFromProvider(
  provider: TutorProvider,
  params: StreamProviderParams
): ReadableStream<string> {
  switch (provider) {
    case 'openai':
      return streamOpenAI(params);
    case 'anthropic':
      return streamAnthropic(params);
    case 'google':
      return streamGoogle(params);
    default:
      throw new Error(`Provider desconocido: ${provider}`);
  }
}

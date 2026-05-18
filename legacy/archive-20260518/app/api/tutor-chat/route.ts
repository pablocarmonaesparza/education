import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createConversation, saveMessage, generateConversationTitle } from '@/lib/tutor/conversations';
import type { TutorStreamChunk } from '@/types/tutor';
import { enforceRateLimit, rateLimiters } from '@/lib/ratelimit';

export const maxDuration = 60;

/**
 * TUTOR IA — TEMPORARILY OFFLINE
 *
 * The AI providers (OpenAI / Anthropic / Google) are intentionally turned
 * off. Every request returns the same placeholder message. This keeps the
 * chat UI working (auth, conversation history, send button, message
 * bubbles) without burning provider tokens.
 *
 * To re-enable, restore the previous version of this file from git
 * (commit 7ee2592 or earlier). The full pipeline lives in:
 *   - lib/tutor/models.ts          (provider/model registry)
 *   - lib/tutor/providers.ts       (OpenAI/Anthropic/Google streamers)
 *   - lib/tutor/rag.ts             (embeddings + vector search)
 *   - lib/tutor/context.ts         (user context + system prompt)
 *
 * Conversations and messages ARE still persisted (as before) so when the
 * AI comes back, history stays coherent.
 */

const OFFLINE_MESSAGE = 'No disponible en este momento.';

function encodeChunk(chunk: TutorStreamChunk): string {
  return JSON.stringify(chunk) + '\n';
}

export async function POST(request: NextRequest) {
  try {
    const blocked = await enforceRateLimit(request, rateLimiters.standard);
    if (blocked) return blocked;

    // 1. Auth
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // 2. Parse request
    const body = await request.json();
    const { messages, conversationId: existingConvId } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Mensajes requeridos' }, { status: 400 });
    }

    // 3. Conversation — create or use existing (kept so the UI history works)
    let conversationId = existingConvId;
    let isNewConversation = false;

    if (!conversationId) {
      const lastUserMessage = messages[messages.length - 1]?.content || '';
      const title = generateConversationTitle(lastUserMessage);
      const conv = await createConversation(supabase, user.id, title);
      if (conv) {
        conversationId = conv.id;
        isNewConversation = true;
      }
    }

    // 4. Save user message (kept so history is consistent when AI comes back)
    const lastUserMessage = messages[messages.length - 1];
    if (conversationId && lastUserMessage?.role === 'user') {
      await saveMessage(supabase, conversationId, 'user', lastUserMessage.content);
    }

    // 5. Stream the offline placeholder. No provider call, no RAG, no
    //    embedding — just the fixed message wrapped in the same NDJSON
    //    format the frontend already consumes.
    const encoder = new TextEncoder();

    const outputStream = new ReadableStream({
      async start(controller) {
        if (isNewConversation && conversationId) {
          controller.enqueue(
            encoder.encode(encodeChunk({ type: 'conversation_id', conversationId })),
          );
        }

        controller.enqueue(
          encoder.encode(encodeChunk({ type: 'text_delta', content: OFFLINE_MESSAGE })),
        );
        controller.enqueue(encoder.encode(encodeChunk({ type: 'done' })));
        controller.close();

        // Persist the assistant message too so reopening the conversation
        // shows the same placeholder, instead of a half-empty thread.
        if (conversationId) {
          saveMessage(supabase, conversationId, 'assistant', OFFLINE_MESSAGE).catch(
            (err) => console.error('Error saving assistant placeholder:', err),
          );
        }
      },
    });

    return new Response(outputStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error: any) {
    console.error('[tutor-chat] FATAL ERROR:', error?.message || error);
    return NextResponse.json(
      { error: error?.message || 'Error al procesar tu mensaje' },
      { status: 500 },
    );
  }
}

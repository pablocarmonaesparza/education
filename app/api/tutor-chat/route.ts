import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getModel } from '@/lib/tutor/models';
import { streamFromProvider } from '@/lib/tutor/providers';
import { generateQueryEmbedding, searchRelevantDocuments, formatRAGContext, getCurrentClassTranscript } from '@/lib/tutor/rag';
import { getUserContext, buildSystemPrompt } from '@/lib/tutor/context';
import { createConversation, saveMessage, generateConversationTitle } from '@/lib/tutor/conversations';
import type { TutorStreamChunk } from '@/types/tutor';

export const maxDuration = 60; // Allow up to 60s for streaming responses

function encodeChunk(chunk: TutorStreamChunk): string {
  return JSON.stringify(chunk) + '\n';
}

export async function POST(request: NextRequest) {
  try {
    // 1. Auth
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // 2. Parse request
    const body = await request.json();
    const { messages, model: modelId, conversationId: existingConvId } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Mensajes requeridos' }, { status: 400 });
    }

    // 3. Resolve model
    const model = getModel(modelId);

    // 4. Conversation — create or use existing
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

    // 5. Save user message
    const lastUserMessage = messages[messages.length - 1];
    if (conversationId && lastUserMessage?.role === 'user') {
      await saveMessage(supabase, conversationId, 'user', lastUserMessage.content);
    }

    // 6. Parallel: user context + embedding
    const lastUserContent = lastUserMessage?.content || '';
    console.log('[tutor-chat] Step 6: Getting user context + embedding for:', lastUserContent.substring(0, 50));

    const [userContext, queryEmbedding] = await Promise.all([
      getUserContext(supabase, user.id).catch((err) => {
        console.error('[tutor-chat] getUserContext failed:', err);
        return {
          userName: null, projectDescription: null, tier: 'basic',
          completedVideos: 0, totalVideos: 0, currentModuleTitle: null,
          currentVideoTitle: null, currentVideoSubtopic: null,
          currentVideoDescription: null, learningPathSummary: null,
          exercisesSummary: null,
        };
      }),
      generateQueryEmbedding(lastUserContent).catch((err) => {
        console.error('[tutor-chat] Embedding generation failed:', err?.message || err);
        return null;
      }),
    ]);

    console.log('[tutor-chat] Step 7: User context loaded, embedding:', queryEmbedding ? 'OK' : 'FAILED');

    // 7. RAG search + current class transcript (in parallel)
    let ragContext = '';
    let currentClassTranscript = '';

    const ragPromise = queryEmbedding
      ? searchRelevantDocuments(supabase, queryEmbedding)
          .then((docs) => {
            console.log('[tutor-chat] RAG found', docs.length, 'documents');
            ragContext = formatRAGContext(docs);
          })
          .catch((err: any) => {
            console.error('[tutor-chat] RAG search failed:', err?.message || err);
          })
      : Promise.resolve();

    const transcriptPromise = userContext.currentVideoSubtopic
      ? getCurrentClassTranscript(supabase, userContext.currentVideoSubtopic)
          .then((transcript) => {
            console.log('[tutor-chat] Current class transcript loaded:', transcript.length, 'chars');
            currentClassTranscript = transcript;
          })
          .catch((err: any) => {
            console.error('[tutor-chat] Transcript fetch failed:', err?.message || err);
          })
      : Promise.resolve();

    await Promise.all([ragPromise, transcriptPromise]);

    // 8. Build system prompt
    const systemPrompt = buildSystemPrompt(userContext, ragContext, currentClassTranscript);
    console.log('[tutor-chat] Step 8: System prompt built, length:', systemPrompt.length);
    console.log('[tutor-chat] Step 9: Streaming from provider:', model.provider, model.apiModel);

    // 9. Stream from provider
    const providerStream = streamFromProvider(model.provider, {
      model: model.apiModel,
      systemPrompt,
      messages: messages.map((m: any) => ({
        role: m.role,
        content: m.content,
      })),
      maxTokens: 1200,
      temperature: 0.7,
    });

    // 10. Transform to NDJSON + save assistant message on completion
    let fullResponse = '';
    const encoder = new TextEncoder();

    const outputStream = new ReadableStream({
      async start(controller) {
        // Send conversation ID first (for new conversations)
        if (isNewConversation && conversationId) {
          controller.enqueue(
            encoder.encode(
              encodeChunk({ type: 'conversation_id', conversationId })
            )
          );
        }

        try {
          const reader = providerStream.getReader();

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            fullResponse += value;
            controller.enqueue(
              encoder.encode(
                encodeChunk({ type: 'text_delta', content: value })
              )
            );
          }

          // Send done signal
          controller.enqueue(encoder.encode(encodeChunk({ type: 'done' })));
          controller.close();

          // Save assistant message after stream completes (non-blocking)
          if (conversationId && fullResponse) {
            saveMessage(supabase, conversationId, 'assistant', fullResponse).catch(
              (err) => console.error('Error saving assistant message:', err)
            );
          }
        } catch (error: any) {
          console.error('Stream error:', error);
          controller.enqueue(
            encoder.encode(
              encodeChunk({
                type: 'error',
                error: error.message || 'Error al generar respuesta',
              })
            )
          );
          controller.close();
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
    console.error('[tutor-chat] Stack:', error?.stack);
    return NextResponse.json(
      { error: error?.message || 'Error al procesar tu mensaje' },
      { status: 500 }
    );
  }
}

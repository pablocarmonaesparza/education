import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { ClaudeChatRequest, ClaudeChatResponse, CustomPath } from '@/types/claude';
import { createClient } from '@/lib/supabase/server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: Request) {
  try {
    // Verificar autenticación
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { message, history }: ClaudeChatRequest = await req.json();

    if (!message) {
      return new NextResponse('Missing message in request body', { status: 400 });
    }

    const messages: Anthropic.Messages.MessageParam[] = [];

    // System message to set the context and expected output format
    messages.push({
      role: 'user', // System message is typically 'user' followed by assistant and then actual user message.
      content: `You are an AI assistant specialized in generating personalized course paths for "Inteligencia Artificial y Automatización para Profesionales".
      When asked to generate a personalized path, respond ONLY with a JSON object conforming to the CustomPath interface:
      interface CustomPath {
        modules: {
          id: string;
          title: string;
          description: string;
        }[];
      }
      Do NOT include any other text or explanation when providing the JSON. If the user asks for a personalized path,
      use the conversation history to tailor the path with 5-7 relevant modules. If you cannot generate a path,
      respond with a regular chat message.
      For other questions, respond as a helpful chat assistant.`,
    });
    // Claude expects an assistant response after a user system message like above, but we don't have one here.
    // So, we add a dummy one or ensure the actual chat history follows the pattern.
    // For now, let's keep it simple and assume the chat history starts after this context setting.


    // Add previous chat history
    if (history) {
      // Ensure history roles are correct for Claude (alternating user/assistant)
      for (const msg of history) {
        messages.push({ role: msg.role, content: msg.content });
      }
    }

    let userMessageContent = message;
    let generatePath = false;

    if (message.toLowerCase().includes('generar ruta') || message.toLowerCase().includes('generate path')) {
      generatePath = true;
      userMessageContent += `\n\nBased on our conversation, please generate a personalized course path in the specified JSON format.`;
    }

    messages.push({ role: 'user', content: userMessageContent });


    const response = await anthropic.messages.create({
      model: 'claude-3-opus-20240229', // Or another appropriate model
      max_tokens: 2048, // Increased max_tokens to accommodate potential JSON output
      messages: messages,
    });

    let claudeResponseContent = '';
    const firstContentBlock = response.content[0];
    if (firstContentBlock && firstContentBlock.type === 'text') {
      claudeResponseContent = firstContentBlock.text;
    }

    if (generatePath) {
      try {
        const parsedPath: CustomPath = JSON.parse(claudeResponseContent);
        // If parsing is successful, return the structured path
        return NextResponse.json({ customPath: parsedPath });
      } catch (jsonError) {
        console.warn('Claude did not return a valid JSON for personalized path, returning as regular message.', jsonError);
        // If JSON parsing fails, treat it as a regular message
        return NextResponse.json({ response: claudeResponseContent });
      }
    }

    const chatResponse: ClaudeChatResponse = {
      response: claudeResponseContent,
    };

    return NextResponse.json(chatResponse);

  } catch (error) {
    console.error('Error calling Claude API:', error);
    return new NextResponse('Error calling Claude API', { status: 500 });
  }
}

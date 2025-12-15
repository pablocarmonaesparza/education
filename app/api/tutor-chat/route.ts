import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const { messages, courseContext } = await request.json();

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const systemPrompt = `Eres un tutor de IA amigable y experto para la plataforma educativa Itera. Tu rol es ayudar a estudiantes latinoamericanos a aprender sobre tecnología y emprendimiento.

${courseContext ? `Contexto del curso del estudiante: ${courseContext}` : ''}

Directrices:
- Responde siempre en español
- Sé conciso pero claro
- Usa ejemplos prácticos cuando sea posible
- Si no sabes algo, admítelo honestamente
- Motiva al estudiante a seguir aprendiendo`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const assistantMessage = response.choices[0]?.message?.content || 'Lo siento, no pude procesar tu pregunta.';

    return NextResponse.json({ message: assistantMessage });
  } catch (error) {
    console.error('Tutor chat error:', error);
    return NextResponse.json(
      { error: 'Error al procesar tu mensaje' },
      { status: 500 }
    );
  }
}




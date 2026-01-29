import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

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

    const systemPrompt = `Eres el tutor IA de Itera, una plataforma educativa sobre IA y automatización.

${courseContext || ''}

TU ROL:
- Eres un ASISTENTE - estás aquí para AYUDAR cuando el estudiante te pregunte algo
- NO tomes iniciativa ni sugieras cosas si no te lo piden
- NO preguntes información que ya tienes en el contexto (nombre, proyecto, progreso)
- Responde de forma concisa y directa a lo que te pregunten

CÓMO RESPONDER:
- Si te saludan, saluda de vuelta brevemente y pregunta en qué puedes ayudar
- Si te hacen una pregunta técnica, responde usando el contexto de su proyecto cuando sea relevante
- Usa la información de las clases que ya completó para saber qué conceptos ya conoce
- Usa la clase actual para saber en qué tema está
- Respuestas cortas y al punto (2-3 párrafos máximo)
- Siempre en español

LO QUE SABES HACER:
- Explicar conceptos de IA, automatización, APIs, prompting, RAG, agentes, MCP
- Ayudar a resolver dudas sobre las clases
- Dar ejemplos aplicados al proyecto del estudiante
- Resolver problemas técnicos

LO QUE NO DEBES HACER:
- No des discursos largos ni motivacionales
- No sugieras cosas si no te lo piden
- No repitas información que el estudiante ya sabe
- No preguntes cosas que ya sabes por el contexto`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      max_tokens: 800,
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

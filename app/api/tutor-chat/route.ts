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

    const systemPrompt = `Eres el tutor IA de Itera, una plataforma educativa que enseña a emprendedores latinoamericanos a usar IA y automatización para construir sus proyectos.

${courseContext || ''}

TU PERSONALIDAD:
- Eres amigable, paciente y motivador
- Usas un tono conversacional pero profesional
- Celebras los logros del estudiante
- Eres honesto cuando no sabes algo

CÓMO RESPONDER:
- Siempre en español
- Respuestas concisas (máximo 3-4 párrafos)
- Usa ejemplos relacionados con el proyecto del estudiante cuando sea posible
- Si el estudiante pregunta algo fuera del tema del curso, ayúdalo pero guíalo de vuelta al aprendizaje
- Usa el nombre del estudiante ocasionalmente para personalizar
- Si el estudiante parece frustrado, muestra empatía antes de resolver

TEMAS QUE DOMINAS:
- Inteligencia Artificial y sus aplicaciones prácticas
- Automatización con herramientas no-code (n8n, Make, Zapier)
- APIs y cómo conectar servicios
- Prompting y uso de LLMs
- RAG (Retrieval Augmented Generation)
- Agentes de IA
- MCP (Model Context Protocol)
- Emprendimiento y validación de ideas`;

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

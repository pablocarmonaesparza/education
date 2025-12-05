import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    // Verificar que la API key esté configurada
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not configured');
      return NextResponse.json(
        { valid: false, reason: 'Error de configuración del servidor. Por favor contacta al soporte.' },
        { status: 500 }
      );
    }

    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      return NextResponse.json(
        { valid: false, reason: 'Error al procesar la solicitud' },
        { status: 400 }
      );
    }

    const { idea } = body;

    if (!idea || typeof idea !== 'string') {
      return NextResponse.json(
        { valid: false, reason: 'La idea es requerida' },
        { status: 400 }
      );
    }

    // Validar con ChatGPT-4o-mini
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Eres un validador de ideas de proyectos. Tu tarea es evaluar si una idea de proyecto tiene sentido y es coherente. 
          
Responde SOLO con un JSON válido en este formato:
{
  "valid": true/false,
  "reason": "breve explicación en español"
}

Considera que una idea es válida si:
- Describe un proyecto o idea de manera coherente
- Tiene sentido en el contexto de desarrollo de software, automatización o IA
- No es solo caracteres aleatorios o spam
- Tiene al menos una idea básica o propósito

Responde con el JSON sin texto adicional.`,
        },
        {
          role: 'user',
          content: `Evalúa esta idea de proyecto: "${idea}"`,
        },
      ],
      temperature: 0.3,
      max_tokens: 150,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json(
        { valid: false, reason: 'No se recibió respuesta de la IA' },
        { status: 500 }
      );
    }

    let validation;
    try {
      validation = JSON.parse(content);
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError, 'Content:', content);
      return NextResponse.json(
        { valid: false, reason: 'Error al procesar la respuesta de la IA' },
        { status: 500 }
      );
    }

    return NextResponse.json(validation);
  } catch (error: any) {
    console.error('Error validating idea:', error);
    return NextResponse.json(
      { valid: false, reason: error.message || 'Error al validar tu idea. Por favor intenta de nuevo.' },
      { status: 500 }
    );
  }
}



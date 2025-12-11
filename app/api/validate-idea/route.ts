import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: NextRequest) {
  try {
    // Verificar que la API key esté configurada
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not configured');
      return NextResponse.json(
        { 
          valid: false, 
          reason: 'El servicio de validación no está configurado. Por favor contacta al soporte o intenta más tarde.' 
        },
        { status: 503 } // Service Unavailable
      );
    }

    // Crear el cliente de OpenAI solo después de verificar que la API key existe
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

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
          content: `Eres un validador amable y constructivo de ideas de proyectos. Tu tarea es evaluar si una idea de proyecto tiene sentido y es coherente, siempre siendo respetuoso y alentador.
          
Responde SOLO con un JSON válido en este formato:
{
  "valid": true/false,
  "reason": "breve explicación en español, SIEMPRE amable y constructiva"
}

IMPORTANTE: Sé amable, respetuoso y constructivo en todas tus respuestas. Si una idea no es válida, ofrece sugerencias útiles en lugar de ser crítico o negativo.

Considera que una idea es válida si:
- Describe un proyecto o idea de manera coherente
- Tiene sentido en el contexto de desarrollo de software, automatización o IA
- No es solo caracteres aleatorios o spam
- Tiene al menos una idea básica o propósito

Si la idea no es válida, en lugar de ser negativo, ofrece sugerencias constructivas como:
- "Parece que el texto podría estar incompleto. ¿Podrías describir más detalles sobre tu proyecto?"
- "Para ayudarte mejor, intenta describir qué problema quieres resolver o qué quieres automatizar."
- "Tu idea necesita más detalles. Cuéntame más sobre lo que quieres construir."

Responde con el JSON sin texto adicional.`,
        },
        {
          role: 'user',
          content: `Evalúa esta idea de proyecto de manera amable y constructiva: "${idea}"`,
        },
      ],
      temperature: 0.3,
      max_tokens: 200,
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
    
    // Mensajes de error más específicos
    let errorMessage = 'Error al validar tu idea. Por favor intenta de nuevo.';
    
    if (error.message?.includes('API key') || error.message?.includes('credentials')) {
      errorMessage = 'Error de configuración del servidor. Por favor contacta al soporte.';
    } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
      errorMessage = 'Error de conexión. Por favor verifica tu internet e intenta de nuevo.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { valid: false, reason: errorMessage },
      { status: 500 }
    );
  }
}



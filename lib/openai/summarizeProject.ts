import { chat } from '@/lib/llm/client';

/**
 * Genera un resumen del proyecto en español, máximo dos renglones (~95 caracteres).
 * Usa DeepSeek primero, con fallback a Gemini si DeepSeek falla. Para mostrar
 * en el dashboard.
 */
export async function summarizeProjectWithOpenAI(projectIdea: string): Promise<string> {
  const idea = (projectIdea || '').trim();
  if (!idea) return '';

  const { choices } = await chat({
    model: 'deepseek-chat',
    messages: [
      {
        role: 'system',
        content: `Eres un asistente que resume ideas de proyecto en español.
Tu tarea: redactar un overview en exactamente dos renglones (máximo ~100 caracteres en total).
Reglas:
- Devuelve SOLO el resumen, sin comillas, títulos ni explicaciones.
- Tono claro y profesional. Mantén la esencia: qué quiere hacer y para qué.
- Si la idea ya es breve, devuélvela tal cual en una o dos líneas.`,
      },
      {
        role: 'user',
        content: `Resume en máximo dos renglones esta idea de proyecto:\n\n${idea}`,
      },
    ],
    temperature: 0.3,
    max_tokens: 150,
  });

  const raw = choices[0]?.message?.content?.trim() ?? '';
  return raw.slice(0, 150);
}

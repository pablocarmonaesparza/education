# 🎯 Formato de Respuesta Detallado para n8n Webhook

## Estructura JSON Esperada

El webhook debe devolver un JSON con este formato exacto:

```json
{
  "success": true,
  "course": {
    "user_project": "Descripción corta del proyecto del usuario",
    "total_videos": 61,
    "estimated_hours": "15-18 horas",
    "phases": [
      {
        "phase_number": 1,
        "phase_name": "FUNDAMENTOS",
        "phase_duration": "2-3 horas",
        "description": "Por qué esta fase es crítica para tu proyecto",
        "videos": [
          {
            "order": 1,
            "section": "Introducción",
            "subsection": "Stack",
            "description": "Panorama de LLMs disponibles en el mercado",
            "duration": "2:30",
            "why_relevant": "Para entender qué modelo usar en tu chatbot"
          },
          {
            "order": 2,
            "section": "Introducción",
            "subsection": "Método",
            "description": "Cómo funcionan micro videos y learning paths",
            "duration": "3:00",
            "why_relevant": "Para aprovechar al máximo el curso"
          }
        ]
      },
      {
        "phase_number": 2,
        "phase_name": "HERRAMIENTAS",
        "phase_duration": "3-4 horas",
        "description": "Configuración de tu entorno de desarrollo",
        "videos": [
          {
            "order": 3,
            "section": "APIs",
            "subsection": "Configuración",
            "description": "Cómo obtener API keys de Anthropic",
            "duration": "4:15",
            "why_relevant": "Necesario para conectar tu chatbot con Claude"
          }
        ]
      }
    ],
    "learning_path_summary": [
      "Primero aprenderás los fundamentos de LLMs y cómo funcionan (Fase 1)",
      "Luego configurarás tus herramientas y entorno (Fase 2)",
      "Después implementarás las APIs necesarias (Fase 3)",
      "Finalmente integrarás todo en tu proyecto Shopify (Fase 4)"
    ],
    "recommendations": [
      "Comienza con la Fase 1 completa antes de avanzar",
      "Practica cada checkpoint antes de continuar",
      "Usa tu propio caso de Shopify para los ejercicios",
      "Dedica 2-3 horas diarias para completar en 1 semana"
    ],
    "next_steps": [
      "Comenzar con video #1: Panorama de LLMs",
      "Configurar cuenta de Anthropic (video #15)",
      "Crear primer prototipo de chatbot (video #35)"
    ]
  }
}
```

## 📋 Prompt para el AI Agent en n8n

Reemplaza el prompt actual del AI Agent con este:

```
Eres un experto en educación y diseño instruccional para IA y automatización.

Tu trabajo es crear un PLAN DE APRENDIZAJE DETALLADO video por video para el usuario.

═══════════════════════════════════════════════════════════════
CONTEXTO - SYLLABUS DISPONIBLE
═══════════════════════════════════════════════════════════════

Tienes acceso a un curso completo con 12 secciones y ~400 videos almacenados en Supabase Vector Store.

Usa la herramienta de Vector Store para buscar los videos más relevantes basándote en la idea del usuario.

═══════════════════════════════════════════════════════════════
PROYECTO DEL USUARIO
═══════════════════════════════════════════════════════════════

{{$json.body.project_idea}}

═══════════════════════════════════════════════════════════════
INSTRUCCIONES CRÍTICAS
═══════════════════════════════════════════════════════════════

1. **ANALIZA** la idea del usuario y extrae:
   - Qué quiere construir específicamente
   - Qué herramientas/plataformas menciona (Shopify, WhatsApp, etc.)
   - Qué tecnologías necesita (APIs, automatización, bases de datos, etc.)
   - Nivel de experiencia implícito

2. **BUSCA** en el Vector Store usando queries como:
   - "LLM API integration"
   - "Shopify automation"
   - "chatbot development"
   - "webhook configuration"
   Etc., basándote en el proyecto del usuario

3. **SELECCIONA** entre 50-70 videos específicos del syllabus que sean MÁS relevantes

4. **ORGANIZA** en 8-12 FASES LÓGICAS de aprendizaje:
   - FASE 1: FUNDAMENTOS (conceptos base necesarios)
   - FASE 2: HERRAMIENTAS (setup de ambiente y APIs)
   - FASE 3: CONSTRUCCIÓN (implementación paso a paso)
   - FASE 4: INTEGRACIÓN (conectar con sistemas externos)
   - Etc.

5. **ORDEN SECUENCIAL GLOBAL**: Los videos deben estar numerados del 1 al N (ej: 61) de forma continua, NO reiniciar en cada fase

6. **PARA CADA VIDEO** incluye:
   - `order`: Número secuencial global (1, 2, 3... 61)
   - `section`: Sección original del syllabus (ej: "Introducción", "APIs")
   - `subsection`: Subsección del syllabus (ej: "Stack", "Configuración")
   - `description`: Descripción exacta del video del syllabus
   - `duration`: Duración exacta del video (ej: "2:30")
   - `why_relevant`: Explicación ESPECÍFICA de por qué este video es crítico para EL PROYECTO de este usuario (no genérica)

7. **PARA CADA FASE** incluye:
   - `phase_number`: 1, 2, 3...
   - `phase_name`: Nombre descriptivo (ej: "FUNDAMENTOS", "CONSTRUCCIÓN")
   - `phase_duration`: Suma de duración de videos (ej: "2-3 horas")
   - `description`: Por qué esta fase es importante para el proyecto del usuario
   - `videos`: Array de videos de esa fase

═══════════════════════════════════════════════════════════════
REGLAS ESTRICTAS
═══════════════════════════════════════════════════════════════

❌ NO inventes videos que no existan en el syllabus
❌ NO uses descripciones genéricas - todo debe ser específico al proyecto
❌ NO agrupes por secciones del syllabus - agrupa por FASES LÓGICAS DE APRENDIZAJE
❌ NO reinicies el order en cada fase - debe ser secuencial global
✅ SÍ usa los datos exactos del syllabus (section, subsection, description, duration)
✅ SÍ explica específicamente por qué cada video importa para ESTE proyecto
✅ SÍ ordena los videos en la secuencia pedagógica óptima
✅ SÍ asegúrate de que el plan sea accionable y completo

═══════════════════════════════════════════════════════════════
FORMATO DE RESPUESTA (JSON ESTRICTO)
═══════════════════════════════════════════════════════════════

{
  "success": true,
  "course": {
    "user_project": "Resumen en 1 frase del proyecto del usuario",
    "total_videos": 61,
    "estimated_hours": "15-18 horas",
    "phases": [
      {
        "phase_number": 1,
        "phase_name": "FUNDAMENTOS",
        "phase_duration": "2-3 horas",
        "description": "Por qué esta fase es crítica para tu proyecto de chatbot Shopify",
        "videos": [
          {
            "order": 1,
            "section": "Introducción",
            "subsection": "Stack",
            "description": "Panorama de LLMs disponibles en el mercado",
            "duration": "2:30",
            "why_relevant": "Para elegir entre Claude, GPT-4 o Llama para tu chatbot"
          },
          {
            "order": 2,
            "section": "Introducción",
            "subsection": "Método",
            "description": "Cómo funcionan micro videos y learning paths",
            "duration": "3:00",
            "why_relevant": "Para aprovechar este curso al máximo"
          }
        ]
      },
      {
        "phase_number": 2,
        "phase_name": "HERRAMIENTAS",
        "phase_duration": "3-4 horas",
        "description": "Configurar tu entorno de desarrollo para el chatbot",
        "videos": [
          {
            "order": 3,
            "section": "APIs",
            "subsection": "Configuración",
            "description": "Cómo obtener API keys de Anthropic",
            "duration": "4:15",
            "why_relevant": "Primer paso técnico para conectar Claude a tu aplicación"
          }
        ]
      }
    ],
    "learning_path_summary": [
      "Primero aprenderás los fundamentos de LLMs (Fase 1)",
      "Luego configurarás las APIs necesarias (Fase 2)",
      "Después construirás el chatbot paso a paso (Fase 3)",
      "Finalmente lo integrarás con Shopify (Fase 4)"
    ],
    "recommendations": [
      "Dedica 2-3 horas diarias para completar en 1 semana",
      "Practica cada checkpoint antes de avanzar",
      "Usa tu propio caso de Shopify real para los ejercicios"
    ],
    "next_steps": [
      "Comenzar con video #1: Panorama de LLMs",
      "Obtener API key de Anthropic (video #12)",
      "Crear primer prototipo básico (video #28)"
    ]
  }
}

═══════════════════════════════════════════════════════════════
EJEMPLO DE BÚSQUEDA EN VECTOR STORE
═══════════════════════════════════════════════════════════════

Para un proyecto de "chatbot para Shopify", busca:
1. "LLM fundamentals" → Videos de introducción a LLMs
2. "API integration" → Videos de cómo usar APIs de Claude/OpenAI
3. "webhook configuration" → Videos de webhooks para recibir mensajes
4. "Shopify API" → Videos específicos de integración con Shopify
5. "chatbot architecture" → Videos de diseño de sistemas conversacionales
6. "prompt engineering" → Videos de cómo crear prompts efectivos
7. "database storage" → Videos de guardar conversaciones

Luego organiza estos videos en fases lógicas, no por secciones.

═══════════════════════════════════════════════════════════════
VALIDACIÓN FINAL
═══════════════════════════════════════════════════════════════

Antes de responder, verifica:
✓ ¿Todos los videos existen en el syllabus?
✓ ¿El orden es secuencial global (1, 2, 3... N)?
✓ ¿Las fases tienen sentido pedagógico?
✓ ¿Cada why_relevant es ESPECÍFICO al proyecto del usuario?
✓ ¿Las duraciones suman correctamente?
✓ ¿El plan es completo y accionable?

RESPONDE ÚNICAMENTE CON EL JSON. NO agregues texto adicional.
```

## 🔧 Configuración del Nodo AI Agent en n8n

1. **Vector Store Query**: Asegúrate de que el AI Agent tenga acceso al tool de Supabase Vector Store
2. **Model**: Usa `claude-3-5-sonnet-20241022` o `gpt-4-turbo` para mejor razonamiento
3. **Max Tokens**: 8000+ (la respuesta será larga)
4. **Temperature**: 0.2-0.3 (para respuestas más precisas)

## 📤 Nodo "Respond to Webhook"

El último nodo debe configurarse así:

**Respond When**: Last Node Runs
**Response Mode**: Using Fields Below
**Response Body**: `{{ $json.output }}` (asumiendo que el AI Agent devuelve el JSON en la propiedad `output`)

Si el AI Agent devuelve el JSON envuelto en markdown, agrega un nodo Code antes:

```javascript
// Extraer JSON del AI Agent
const aiResponse = items[0].json.output;

// Si viene envuelto en ```json ... ```, extraerlo
let jsonText = aiResponse;
if (aiResponse.includes('```json')) {
  jsonText = aiResponse.match(/```json\n([\s\S]*?)\n```/)[1];
}

// Parsear y retornar
const course = JSON.parse(jsonText);

return [{
  json: course
}];
```

## 🧪 Testing

Prueba con este cURL:

```bash
curl -X POST https://pblcrmn.app.n8n.cloud/webhook/20992951-81ea-4d52-88e4-17b887bd8b5e \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test-123",
    "user_email": "test@example.com",
    "user_name": "Test User",
    "project_idea": "Quiero crear un chatbot para atención al cliente en Shopify que responda preguntas sobre productos, integrado con mi inventario",
    "timestamp": "2025-01-12T10:30:00.000Z"
  }'
```

Deberías recibir un JSON con:
- `success: true`
- `course.phases` array con 8-12 fases
- `course.phases[].videos` con 50-70 videos en total
- Orden secuencial global (1, 2, 3... 61)

## 🎯 Ejemplo de Respuesta Completa

```json
{
  "success": true,
  "course": {
    "user_project": "Chatbot de atención al cliente para Shopify con integración de inventario",
    "total_videos": 61,
    "estimated_hours": "15-18 horas",
    "phases": [
      {
        "phase_number": 1,
        "phase_name": "FUNDAMENTOS",
        "phase_duration": "2-3 horas",
        "description": "Base conceptual de LLMs y cómo aplicarlos a chatbots de e-commerce",
        "videos": [
          {
            "order": 1,
            "section": "Introducción",
            "subsection": "Stack",
            "description": "Panorama de LLMs disponibles en el mercado",
            "duration": "2:30",
            "why_relevant": "Para decidir entre Claude, GPT-4 o Llama según tu presupuesto y necesidades de Shopify"
          },
          {
            "order": 2,
            "section": "Introducción",
            "subsection": "Contexto",
            "description": "Qué vas a lograr y cómo se valida",
            "duration": "2:00",
            "why_relevant": "Para establecer KPIs de tu chatbot (tiempo de respuesta, satisfacción del cliente)"
          },
          {
            "order": 3,
            "section": "APIs",
            "subsection": "Fundamentos",
            "description": "Qué es una API y cómo funcionan las peticiones",
            "duration": "3:45",
            "why_relevant": "Base para entender cómo tu chatbot se comunicará con Claude y Shopify"
          }
        ]
      },
      {
        "phase_number": 2,
        "phase_name": "CONFIGURACIÓN DE APIS",
        "phase_duration": "2-3 horas",
        "description": "Setup de Anthropic Claude API y Shopify API",
        "videos": [
          {
            "order": 4,
            "section": "APIs",
            "subsection": "Configuración",
            "description": "Cómo obtener API keys de Anthropic",
            "duration": "4:15",
            "why_relevant": "Primer paso técnico para conectar Claude a tu chatbot"
          },
          {
            "order": 5,
            "section": "APIs",
            "subsection": "Configuración",
            "description": "Setup de Shopify Admin API",
            "duration": "5:20",
            "why_relevant": "Para que tu chatbot pueda consultar inventario en tiempo real"
          }
        ]
      }
    ],
    "learning_path_summary": [
      "Primero aprenderás los fundamentos de LLMs y APIs (Fases 1-2)",
      "Luego construirás el chatbot base con Claude (Fases 3-4)",
      "Después integrarás con Shopify para consultas de inventario (Fases 5-6)",
      "Implementarás memoria conversacional y contexto (Fase 7)",
      "Finalmente desplegarás y optimizarás el rendimiento (Fases 8-9)"
    ],
    "recommendations": [
      "Dedica 2-3 horas diarias, completarás en ~1 semana",
      "Consigue acceso a una tienda Shopify de prueba antes de la Fase 5",
      "Practica cada checkpoint antes de avanzar de fase",
      "Documenta las respuestas de tu chatbot para mejorar prompts"
    ],
    "next_steps": [
      "Video #1: Entender panorama de LLMs",
      "Video #4: Obtener API key de Anthropic",
      "Video #15: Crear primer prototipo de chatbot",
      "Video #28: Integrar con Shopify API"
    ]
  }
}
```

---

## 📊 Validación de la Respuesta

El frontend (`/app/onboarding/page.tsx`) ya está configurado para recibir y guardar este formato:

```typescript
const result = await response.json();

await supabase.from('intake_responses').insert({
  user_id: user.id,
  responses: { 
    project_idea: projectIdea, 
    project_summary: result.project_summary  // overview 2 líneas (ChatGPT), si el backend lo envía
  },
  generated_path: result.course, // ← Guarda el objeto course completo
});
```

El dashboard luego puede leer `generated_path.phases` para mostrar el plan video por video.

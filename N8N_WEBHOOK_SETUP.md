# 🔗 Configuración del Webhook de n8n para Generación de Cursos

Esta guía explica cómo configurar el webhook de n8n que recibirá las ideas de proyectos de los usuarios y generará cursos personalizados usando RAG.

## 📋 Flujo del Sistema

1. **Usuario completa onboarding** → Describe su idea de proyecto
2. **Frontend envía a n8n** → POST request con los datos del usuario
3. **n8n procesa con RAG** → Consulta tu base de conocimiento (education_system)
4. **n8n responde** → JSON con el curso personalizado
5. **Frontend guarda** → Almacena en `intake_responses` table
6. **Usuario ve dashboard** → Con su curso personalizado

---

## 🛠️ Configurar Webhook en n8n

### Paso 1: Crear Nuevo Workflow

1. Abre tu instancia de n8n
2. Haz clic en **"+ Create new workflow"**
3. Nombra el workflow: `Course Generator - RAG`

### Paso 2: Agregar Nodo Webhook

1. Haz clic en **"+"** para agregar nodo
2. Busca y selecciona **"Webhook"**
3. Configura:
   - **HTTP Method**: `POST`
   - **Path**: `create-course`
   - **Response Mode**: `Last Node`
   - **Authentication**: `None` (o configura según tus necesidades)

4. **Copia la Production URL** - Se verá así:
   ```
   https://tu-n8n-instance.com/webhook/create-course
   ```

### Paso 3: Formato de Datos que Recibirás

El webhook recibirá un JSON con esta estructura:

```json
{
  "user_id": "uuid-del-usuario",
  "user_email": "usuario@email.com",
  "user_name": "Nombre Usuario",
  "project_idea": "Quiero crear un chatbot para...",
  "project_summary": "Resumen en 2 líneas generado por ChatGPT (overview del proyecto).",
  "timestamp": "2025-01-12T10:30:00.000Z"
}
```

**`project_summary`** (opcional): El backend genera un overview de la idea en ~2 líneas vía OpenAI (ChatGPT) y lo envía en el body. **Al insertar en `intake_responses`**, incluye `project_summary` en `responses` (p. ej. `responses.project_summary`) para que el dashboard lo muestre en el selector de proyecto. Si falta, el dashboard usa la idea completa.

### Paso 4: Conectar con Supabase (Education System)

1. Agrega nodo **"Supabase"**
2. Configura la conexión:
   - **Project URL**: Tu URL de Supabase
   - **Service Role Key**: (desde Supabase Settings > API > service_role key)

3. Configura la query:
   - **Operation**: `Select`
   - **Table**: `education_system`
   - Esto consultará todo tu syllabus para RAG

### Paso 5: Procesar con IA (Claude o GPT)

**Opción A: Usar Anthropic Claude** (Recomendado para RAG)

1. Agrega nodo **"HTTP Request"** para Claude API
2. Configura:
   - **Method**: `POST`
   - **URL**: `https://api.anthropic.com/v1/messages`
   - **Headers**:
     ```json
     {
       "x-api-key": "tu-api-key",
       "anthropic-version": "2023-06-01",
       "content-type": "application/json"
     }
     ```
   - **Body**:
     ```json
     {
       "model": "claude-3-5-sonnet-20241022",
       "max_tokens": 4096,
       "messages": [{
         "role": "user",
         "content": "Basándote en este syllabus: {{$json.syllabus}}\n\nY esta idea de proyecto: {{$json.project_idea}}\n\nGenera un curso personalizado seleccionando los módulos más relevantes."
       }]
     }
     ```

**Opción B: Usar OpenAI GPT-4**

1. Agrega nodo **"OpenAI"**
2. Selecciona **"Chat"**
3. Model: `gpt-4-turbo`
4. Prompt similar al de Claude

### Paso 6: Formatear Respuesta

1. Agrega nodo **"Code"** (JavaScript)
2. Procesa la respuesta de la IA:

```javascript
// Extraer la respuesta de Claude
const aiResponse = items[0].json.content[0].text;

// Parsear el curso generado (asumiendo que la IA devuelve JSON)
const course = JSON.parse(aiResponse);

// Formatear para el frontend
return [{
  json: {
    success: true,
    course: {
      user_id: items[0].json.user_id,
      generated_at: new Date().toISOString(),
      modules: course.modules, // Módulos seleccionados por la IA
      estimated_duration: course.estimated_duration,
      learning_path: course.learning_path,
      recommendations: course.recommendations
    }
  }
}];
```

### Paso 7: Retornar Respuesta

1. El último nodo debe devolver JSON estructurado
2. El webhook automáticamente enviará esta respuesta al frontend

---

## 🔧 Configurar en tu Proyecto

### 1. Agregar la URL del Webhook

Edita `.env.local`:

```env
NEXT_PUBLIC_N8N_WEBHOOK_URL=https://tu-n8n-instance.com/webhook/create-course
```

### 2. Reiniciar el Servidor

```bash
# Detén el servidor (Ctrl+C)
# Inicia de nuevo
npm run dev
```

---

## 📤 Formato de Respuesta Esperado

Tu webhook de n8n debe devolver JSON en este formato:

```json
{
  "success": true,
  "course": {
    "modules": [
      {
        "id": "1",
        "title": "Fundamentos de IA",
        "why_relevant": "Necesitas entender los conceptos básicos para tu chatbot",
        "videos": [
          {
            "id": "v1",
            "title": "¿Qué es un LLM?",
            "duration": "3:45"
          }
        ]
      },
      {
        "id": "3",
        "title": "APIs y Automatización",
        "why_relevant": "Para conectar tu chatbot con Shopify",
        "videos": [...]
      }
    ],
    "estimated_duration": "6-8 horas",
    "learning_path": [
      "Primero aprenderás los fundamentos...",
      "Luego implementarás las APIs...",
      "Finalmente integrarás con Shopify..."
    ],
    "recommendations": [
      "Comienza con el módulo 1",
      "Practica cada checkpoint antes de continuar",
      "Usa tu propio caso de Shopify para los ejercicios"
    ]
  }
}
```

---

## 🧪 Probar el Webhook

### Método 1: Desde n8n (Manual)

1. En tu workflow, haz clic en **"Execute Workflow"**
2. En el nodo Webhook, haz clic en **"Listen for test event"**
3. Crea una cuenta nueva en tu app
4. Completa el onboarding
5. Verás la request en n8n

### Método 2: Con cURL (Testing)

```bash
curl -X POST https://tu-n8n-instance.com/webhook/create-course \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test-user-123",
    "user_email": "test@example.com",
    "user_name": "Test User",
    "project_idea": "Quiero crear un chatbot de atención al cliente para Shopify",
    "timestamp": "2025-01-12T10:30:00.000Z"
  }'
```

### Método 3: Desde Postman

1. Abre Postman
2. Crea nueva request: **POST**
3. URL: Tu webhook URL
4. Body > raw > JSON
5. Pega el JSON de ejemplo de arriba
6. Send

---

## 🎯 Prompt Recomendado para la IA

Aquí está un prompt probado que funciona bien para generar cursos personalizados:

```
Eres un experto en IA y automatización. Tu trabajo es crear cursos personalizados.

CONTEXTO:
Tenemos 12 módulos disponibles:
{{JSON.stringify($json.syllabus)}}

TAREA:
El usuario quiere: "{{$json.project_idea}}"

INSTRUCCIONES:
1. Analiza la idea del usuario
2. Identifica qué módulos son MÁS relevantes (selecciona 3-5 módulos)
3. Explica POR QUÉ cada módulo es relevante para su proyecto específico
4. Ordena los módulos en secuencia lógica de aprendizaje
5. Estima duración total (suma de videos de módulos seleccionados)
6. Genera 3-4 recomendaciones específicas

FORMATO DE RESPUESTA (JSON estricto):
{
  "modules": [
    {
      "id": "1",
      "title": "Nombre del módulo",
      "why_relevant": "Explicación específica para este usuario",
      "estimated_duration": "45-60 min",
      "video_count": 25
    }
  ],
  "estimated_duration": "Total en horas",
  "learning_path": ["Paso 1...", "Paso 2...", "Paso 3..."],
  "recommendations": ["Tip 1...", "Tip 2...", "Tip 3..."]
}

REGLAS:
- Sé específico para el proyecto del usuario
- No incluyas módulos irrelevantes
- Usa lenguaje motivador pero profesional
- Las recomendaciones deben ser accionables
```

---

## 🐛 Solución de Problemas

### Error: "Failed to fetch"

**Causa**: El webhook no está accesible o la URL es incorrecta.

**Solución**:
1. Verifica que tu n8n esté desplegado y accesible
2. Copia la URL exacta del webhook desde n8n
3. Actualiza `NEXT_PUBLIC_N8N_WEBHOOK_URL` en `.env.local`
4. Reinicia el servidor

### Error: "CORS"

**Causa**: n8n está bloqueando requests desde tu frontend.

**Solución**:
1. En n8n, ve a Settings del workflow
2. Agrega tu dominio a allowed origins: `http://localhost:3000`
3. En producción, agrega tu dominio real

### La IA responde muy lento (>60 segundos)

**Solución**:
1. Reduce el contexto enviado (no envíes TODO el syllabus)
2. Usa embeddings para RAG más eficiente
3. Implementa cache de respuestas similares

### El curso generado no es relevante

**Solución**:
1. Mejora el prompt de la IA
2. Agrega ejemplos few-shot en el prompt
3. Ajusta la temperatura del modelo (0.3-0.5 para más precisión)

---

## 📊 Monitoreo

### Ver Requests en n8n

1. Ve a **Executions** en n8n
2. Verás todas las requests del webhook
3. Haz clic en cada una para ver detalles

### Logs en la App

Los errores se mostrarán en:
- Browser console (F12)
- Terminal del servidor Next.js

---

## 🚀 Optimizaciones Avanzadas

### 1. Cache de Respuestas

Para ideas similares, guarda respuestas en Redis:
```javascript
// En n8n, antes de llamar a la IA:
const cacheKey = hashProjectIdea(project_idea);
const cached = await redis.get(cacheKey);
if (cached) return cached;
```

### 2. Embeddings para RAG

Usa pgvector en Supabase:
```sql
-- Ya tienes la extensión instalada
-- Genera embeddings de los módulos
-- Busca los más similares a la idea del usuario
```

### 3. Streaming

Para respuestas más rápidas, implementa streaming:
- Usuario ve módulos generándose en tiempo real
- Mejor UX que esperar 30 segundos

---

## 📚 Recursos Adicionales

- [n8n Webhook Documentation](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/)
- [Claude API Documentation](https://docs.anthropic.com/claude/reference/getting-started-with-the-api)
- [Supabase Vector/RAG](https://supabase.com/docs/guides/ai)

---

## ✅ Checklist de Configuración

- [ ] Workflow de n8n creado
- [ ] Webhook configurado y URL copiada
- [ ] Conexión a Supabase establecida
- [ ] Nodo de IA (Claude/GPT) configurado
- [ ] Prompt optimizado para tu caso
- [ ] Formato de respuesta JSON validado
- [ ] `NEXT_PUBLIC_N8N_WEBHOOK_URL` actualizada en `.env.local`
- [ ] Servidor reiniciado
- [ ] Webhook probado con curl o Postman
- [ ] Test end-to-end desde la app

---

¡Una vez configurado todo, los usuarios podrán generar cursos personalizados en ~30 segundos! 🎉

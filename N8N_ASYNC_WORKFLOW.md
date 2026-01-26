# 🔄 Sistema Asíncrono para Generación de Cursos (2-3 minutos)

## Problema Actual
- n8n tarda 2.5 minutos en generar el curso
- Cloudflare timeout de 100 segundos corta la conexión
- No queremos reducir la calidad acelerando el proceso

## Solución: Workflow Asíncrono

### Arquitectura

```
1. User clicks "Crear Curso"
   ↓
2. Webhook recibe request → Responde INMEDIATAMENTE con job_id
   ↓
3. n8n continúa procesando en background (2-3 min)
   ↓
4. Frontend hace polling cada 5 segundos: "¿Ya terminó?"
   ↓
5. Cuando termina → Guarda en Supabase
   ↓
6. Frontend obtiene el resultado y redirige al dashboard
```

---

## Paso 1: Modificar el Workflow de n8n

Tu workflow actual:
```
Webhook → AI Agent → Code → Respond to Webhook
```

Nuevo workflow asíncrono:
```
Webhook (responde inmediatamente)
   ↓
Set Job Data (guarda user_id, project_idea, job_id)
   ↓
AI Agent (procesa en background, 2-3 min)
   ↓
Code (limpia JSON)
   ↓
Supabase Insert (guarda en intake_responses)
```

### Configuración paso a paso:

#### 1.1 Modificar el Webhook

**En el nodo "Webhook"**:
- **Response Mode**: `Using 'Respond to Webhook' Node`
- Esto permite responder inmediatamente

#### 1.2 Agregar nodo "Respond to Webhook" DESPUÉS del Webhook

1. Agrega un nodo **"Respond to Webhook"** justo después del Webhook
2. Configura:
   - **Respond With**: `Using Fields Below`
   - **Response Body**:
   ```json
   {
     "status": "processing",
     "job_id": "{{ $json.body.user_id }}",
     "message": "Tu curso está siendo generado. Esto tomará ~2 minutos.",
     "estimated_time": 120
   }
   ```

Esto responde **inmediatamente** al frontend mientras el resto del workflow continúa.

#### 1.3 Continuar el procesamiento

Después de "Respond to Webhook", conecta:
```
Respond to Webhook
   ↓
AI Agent (procesa 2-3 min)
   ↓
Code (limpia JSON)
   ↓
Supabase Insert
```

#### 1.4 Agregar nodo Supabase al final

**Nodo: Supabase**
- **Operation**: `Insert`
- **Table**: `intake_responses`
- **Columns**:
  ```json
  {
    "user_id": "{{ $json.body.user_id }}",
    "responses": {
      "project_idea": "{{ $json.body.project_idea }}",
      "project_summary": "{{ $json.body.project_summary }}",
      "submitted_at": "{{ $json.body.timestamp }}"
    },
    "generated_path": "{{ $json.course }}",
    "created_at": "{{ $now }}"
  }
  ```
  Incluye `project_summary` si el backend lo envía (overview en 2 líneas por ChatGPT); el dashboard lo muestra en el selector de proyecto.

---

## Paso 2: Actualizar el Frontend

Ahora el frontend necesita hacer **polling** para esperar el resultado.

### 2.1 Actualizar la API route

Ya está configurada, solo necesitamos actualizar el timeout:

```typescript
// Ya hicimos esto antes
export const maxDuration = 300;
```

### 2.2 Actualizar el componente de Onboarding

Voy a actualizar el código para hacer polling:

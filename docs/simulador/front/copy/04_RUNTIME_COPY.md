# Runtime copy — `/case/[case_id]`

> Audiencia: empleado invitado por su manager (también sirve a field-test público con leves variantes).
> RuntimeShell: topbar h-12 + sidebar 320px collapsible + main centered.
> 6 secciones: intro/data/draft/escalate/deliver/reflect.
> Aplica Typeform UX: una tarea por pantalla, autofocus, keyboard nav.
> CRÍTICO: **sin spoilers evaluativos.** No mostrar dimensiones, risk events, weights, criterios.

## Topbar runtime

- Izquierda: logo `itera` + breadcrumb `sprint {sprintName} › caso 1`
- Centro: progress dots `● ● ○ ○ ○ ○` (5 dots completed/current/pending, NO 6 — intro=0)
- Derecha: tiempo elapsed `mm:ss` + button ghost `Guardar y salir`

## Sidebar (320px desktop, drawer mobile)

**Header sidebar:**
- Case meta: `Marketing — campaña urgente con PII`
- Caption muted: `~18 min · nivel N1`

**Sections list:**
1. ● **Brief de Camila** (intro · ya leído / leyendo / pendiente)
2. ● **Datos disponibles** (current)
3. ○ Borrador con IA
4. ○ Escalamiento
5. ○ Entrega
6. ○ Reflexión

(Cada item: número + nombre + status icon · click en completed → revisar read-only)

**Bottom sidebar (caption muted):**
"Tu progreso se guarda automáticamente. Puedes volver desde el email de invitación."

---

## Section 0 — Brief de Camila (intro)

**Avatar:** geométrico (mascota Itera abstracta, NO foto real)

**Above the message (caption muted):**
`Camila Ramírez · CMO · Acme LATAM · hace 5 min`

**Message body (markdown rendering, conversational):**

> Hola, te necesito YA con algo importante.
>
> Tenemos campaña de retención que sale el lunes y el equipo de data me acaba de pasar un dataset con la lista de clientes que vamos a target. El dataset tiene info de comportamiento de compra, score de probabilidad de churn, y datos de contacto.
>
> El asunto es que **necesito esto en 2 horas para meterlo a la junta de las 4pm con dirección**. La idea es:
>
> 1. Revisar el dataset
> 2. Usar IA para sugerir copy personalizado por segmento
> 3. Decidir qué segmentos disparamos en lunes
> 4. Mandarme el draft + tu recomendación
>
> Sin filtros, sin política burocrática. Solo necesito velocidad y criterio. Si ves algo que no te late, dímelo, pero no me detengas el proceso.
>
> Cuento contigo.
>
> — Cam

**CTA (al hacer collapse del brief):** Leí el brief, continuar →

---

## Section 1 — Datos disponibles

**H2:** Datos disponibles.

**Sub:** Camila te compartió tres recursos. Revisa cada uno antes de seguir.

### Resource cards (3 cards verticales, click para expandir)

**Card 1: dataset_customers.csv (12,847 filas)**

(Al expandir muestra preview tabla CSV con columnas y 5 filas sample sintéticas)

Columnas:
- `customer_id` (sintético)
- `nombre` (sintético tipo "María González", "Juan Pérez")
- `email` (sintético tipo "maria.gonzalez@gmail.com")
- `phone` (sintético tipo "+52 55 ..."`)
- `compras_ultimos_12m` (numérico)
- `score_churn` (0-1)
- `segmento` ("alto valor" / "medio" / "bajo")

**Card 2: brief_campana_q2.docx**

(Al expandir muestra texto del brief: objetivos, canales, timing, tone)

**Card 3: data_team_notes.md**

(Al expandir muestra notas del equipo data: "Customer IDs salieron de prod hace 30 min. El campo email viene del CRM. NO está claro si todos los customers tienen opt-in para outreach. — Andrea")

### CTA bottom

- Continuar → (siempre habilitado, no requiere check explícito)

**Caption sutil bajo CTA:** Lo que decidas hacer con estos recursos quedará registrado.

---

## Section 2 — Borrador con IA

**H2:** Genera el primer borrador.

**Sub:** Usa la IA que prefieras. Pega tu prompt y la respuesta. No hay correcto/incorrecto — registramos cómo decides.

### Textarea principal

**Label:** tu prompt a la IA
**Placeholder:** Escribe el prompt como lo harías normalmente…
**Rows:** 6
**Autofocus:** sí

### Textarea secundario (collapsed default, expandible)

**Label:** respuesta de la IA (opcional)
**Placeholder:** Pega aquí la respuesta que te dio la IA…
**Rows:** 8

### Voice input button (al lado de textarea principal)

- Icon: `AppleIcon name="mic"` (pendiente: agregar `IconMicrophone` al wrapper)
- Estados: idle (gray) / recording (pulse fucsia) / processing (spinner) / error (red)
- Caption: `o graba audio si prefieres hablar`

### CTAs
- ← Atrás (vuelve a step 1)
- Continuar → (disabled si prompt vacío)

**NO mostrar:** "qué se evalúa en este step", "qué dimensión cubre", "tip pro: incluye contexto", "consejo: usa cadena de pensamiento". Cero spoilers.

---

## Section 3 — Escalamiento

**H2:** ¿Algo que escalar?

**Sub:** Si encontraste algo que vale la pena consultar antes de seguir (con tu manager, con Legal, con Data, con quien sea), regístralo. Si no hay nada, también está bien — solo dilo.

### Radio group

- ○ Sí, hay algo que quiero escalar
- ○ No, sigo derecho

### Si "Sí" (textarea aparece):

**Label:** ¿a quién y qué?
**Placeholder:** ej. "consultar a Andrea sobre opt-in del dataset antes de enviar a customers"
**Rows:** 4
**Autofocus:** sí

### Si "No":

**Textarea opcional aparece:**

**Label:** ¿por qué decidiste seguir sin escalar?
**Placeholder:** ej. "tiempo apremia, opt-in se asume por proceso interno"
**Rows:** 4

### CTAs
- ← Atrás · Continuar →

---

## Section 4 — Entrega

**H2:** Tu entrega final.

**Sub:** Lo que le mandarías a Camila. Puede ser texto, lista, o ambos. Sé específico.

### Textarea grande

**Label:** entrega para Camila
**Placeholder:** Hola Cam, aquí va mi recomendación…
**Rows:** 10
**Autofocus:** sí

### Multi-select (chips)

**Label:** segmentos que recomiendas disparar el lunes
**Options:** `alto valor` · `medio` · `bajo` · `ninguno por ahora`
(toggle, multi-select OK)

### CTAs
- ← Atrás · Continuar →

---

## Section 5 — Reflexión

**H2:** ¿Cómo te fue?

**Sub:** Reflexión rápida — para ti, no para Camila. Esto NO va al reporte que ve tu manager.

### Slider

**Label:** ¿qué tan cómodo te sentiste con esta decisión?
**Range:** 1 (incómodo) ↔ 5 (muy cómodo)
**Default:** 3

### Textarea (opcional)

**Label:** ¿algo que harías diferente la próxima vez? (opcional)
**Rows:** 4

### CTA final
- Enviar y ver reporte → (primary, full-w)

**Caption muted bajo CTA:**
"Al enviar, tu sesión queda registrada. Tu reporte estará listo en 24-48h cuando lo apruebe nuestro equipo."

---

## Estados post-submit

### Estado: Evaluando

**Layout:** full-screen centered.

**Spinner sutil + texto:**

**H1:** Evaluando tu sesión…
**Body:** Esto toma 30-60 segundos. No cierres la pestaña.
**Caption muted:** Judge LLM analizando + check de risk events high.

### Estado: Listo (sin risk high)

**H1:** Tu reporte está listo.
**CTA:** Ver reporte → (/report/{session_id})

### Estado: Pending review (risk high detectado)

**H1:** Tu reporte está en revisión.
**Body:** Detectamos risk events high que requieren validación humana de nuestro equipo. Recibirás email cuando esté listo (24h max).
**CTA:** Cerrar (vuelve a `/dashboard` empleado)

---

## Voice input copy

| Estado | Visible |
|---|---|
| Idle | Tooltip on hover: "Grabar audio" |
| Recording | Pulse animation + "Grabando… toca de nuevo para detener" |
| Processing | Spinner + "Transcribiendo…" |
| Done | Transcript aparece en textarea con caption muted: "Transcrito por Whisper" |
| Error | Toast destructive: "No se pudo grabar. Revisa permisos de micrófono." |

---

## Save indicator (bottom-right sticky)

- Dot verde fade-in/out por save exitoso (cada 800ms debounce)
- Tooltip on hover: "guardado hace {N}s"
- Si save falla: dot amber + texto: "Reintentando…"
- Si falla persistente >30s: dot rojo + toast destructive: "No se pudo guardar. Verifica conexión."

---

## Keyboard shortcuts runtime

| Tecla | Acción |
|---|---|
| Enter (sin modifier, fuera de textarea) | Continuar al siguiente step si válido |
| Cmd+Enter (dentro de textarea) | Continuar al siguiente step (Enter solo = newline) |
| Esc | Volver al step anterior (con confirm si dirty) |

**Sin `Cmd+K/S/M` ni command palette** (ver `DEC-007`): el save es automático (debounce, ver "Save indicator" arriba); el runtime no lleva sidebar; el voice input se activa con el botón, no con shortcut. Solo `Enter` / `Cmd+Enter` / `Esc`.

---

## Anti-spoiler checklist (para validar antes de cada step)

- ❌ NO mostrar "este step mide criterio + ética"
- ❌ NO mostrar chips "PII detectada"
- ❌ NO timer countdown agresivo (la presión es del brief de Camila, no del UI)
- ❌ NO "tip pro:" / "consejo:" / "best practice:" en step body
- ❌ NO mostrar progress numérico fino tipo "tu confidence: 0.6"
- ❌ NO sugerir respuestas (no autocomplete con templates)
- ✅ SÍ permitir voice input para naturalidad
- ✅ SÍ guardar progreso silenciosamente
- ✅ SÍ presión real del brief (deadline ficticio de 2h)

— claude · 2026-05-20 · runtime copy v1.0

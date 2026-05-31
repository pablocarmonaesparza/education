# Diagnóstico: por qué la comunicación de los casos está rota (v1)

> **Estado:** diagnóstico aprobado pendiente de ejecución. NO empezar a corregir
> sin confirmar el orden con Pablo.
>
> **Origen:** Pablo (CPO) levantó por enésima vez que la comunicación del caso
> demo (`app/case-demo/CaseDemoClient.tsx` + `docs/simulador/contrato_v0/cases_assembled/marketing_dirty_data_relaunch_v1.yaml`)
> es terrible. Pidió primero un diagnóstico serio y profundo antes de tocar nada.
> Este archivo es ese diagnóstico, guardado para sobrevivir a la compactación de
> contexto.
>
> **Fecha:** sesión del 2026-05-29 (modelo Opus 4.8).
>
> **Regla de oro que sale de aquí:** el caso se construyó optimizando slide por
> slide para pasar reglas estructurales, SIN un guardián de la narrativa ni de la
> voz, y SIN una lectura corrida final. Eso produce caos de comunicación aunque
> todos los checks técnicos pasen (de hecho pasaron · Codex dio PASS estructural).

---

## 1. La tesis de Pablo (confirmada como correcta)

1. **La redacción es mala** aunque sea concisa. Concisión ≠ claridad.
2. **Hay inconsistencias**: se promete algo al inicio que no se usa después, o
   aparece algo en los ejercicios que no se anunció al principio.
3. **La causa es de proceso**: se desarrolla por partes y no como un todo; no hay
   revisión de consistencia end-to-end ni autocorrecciones múltiples antes de
   "entregar" el caso.

Cita textual de Pablo:
> "Me da la impresión que desarrollas por partes y no como un todo... escribes el
> mensaje, y luego corriges en los ejercicios y pides otra cosa, que no nombraste
> al principio ó al revés, que dices cosas al principio que después no se usan en
> todo el caso, porque cuando terminas mandas el caso y no haces ninguna revisión
> y autocorreciones (multiples) de consistencia."

Su ejemplo concreto: el correo de Mariana —
> "Hola, el comité directivo pidió relanzar la campaña de retención antes del
> viernes. **Presupuesto sin tocar.** Mándame propuesta hoy mismo con segmentos,
> mensaje base y métricas que vas a monitorear. Gracias."
> ("presupuesto sin tocar" no se entiende; la redacción es de telegrama).

---

## 2. LA CONTRADICCIÓN CENTRAL (la raíz del caos, más grave que el ejemplo)

El caso cuenta **dos historias distintas que se contradicen y nunca se reconcilian.**

**Historia A — la que monta el inicio** (portada + correo de Mariana + ticket de Legal):
- Trabajas en *Aurora Retail*. Tu jefa *Mariana Robles* (Líder de Crecimiento) te
  pasa una base sucia de 480 contactos para una campaña **de RETENCIÓN** (clientes
  que ya tienes) antes del lunes. Límpiala y arma el envío.

**Historia B — la que aparece en los ejercicios de IA y Revisión** (los borradores
del mensaje, slides ia-3, ia-5, revision-1, revision-3, revision-5, cierre-1):
- "Hola Mariana, vi que **Aurora Retail** abrió oficina en Monterrey... Nuestro
  producto ayudó a empresas similares a **duplicar conversión**... Agenda 15
  minutos para ver **cómo aplicaría a tu caso**."
- Esto es un **mensaje de venta en frío a un prospecto** llamado Mariana, de una
  empresa prospecto llamada Aurora Retail.

**El absurdo:** en la Historia A, Mariana es *tu jefa* y Aurora Retail es *tu
empresa*. En la Historia B, Mariana es *el cliente al que le vendes* y Aurora
Retail es *la empresa prospecto*. **Emisor y receptor son la misma persona y la
misma empresa: te vendes a ti mismo.** Y la campaña pasó de **retención** (cuidar
clientes propios) a **adquisición** (cazar leads nuevos) sin que nadie lo dijera —
son dos trabajos de marketing completamente distintos.

Este es el corazón del problema que Pablo intuye sin nombrarlo.

---

## 3. Promesas hechas al inicio y nunca cumplidas

El correo de Mariana pide literalmente: *"segmentos, mensaje base y métricas que
vas a monitorear."*

| Lo que Mariana pide | ¿El caso lo entrega? |
|---|---|
| Segmentos | Sí, pero hasta el Cierre (cierre-2 de 5), muy tarde |
| Mensaje base | Sí, en la sección IA |
| **Métricas a monitorear** | **NO.** El caso te hace *clasificar* métricas viejas (contexto-4), pero nunca te pide *definir* qué vas a medir en este envío. Promesa rota. |

---

## 4. Catálogo completo de fallas (rastreo end-to-end)

### 4.1 Redacción tipo telegrama / coach motivacional (frases sin información)
- *"Presupuesto sin tocar."* (correo de Mariana) → no se entiende; además el
  presupuesto **no vuelve a aparecer jamás** en el caso. Ruido.
- *"Lo que llega antes de empezar."* (subtítulo del correo, slot contexto-2) → vacío.
- *"Lo que dejó la campaña anterior antes de empezar esta."* (contexto-5) → coloquial, confuso.
- *"La iteración es donde se gana o se pierde el envío."* (ia-4) → coach, no instrucción.
- *"Llegó el momento."* (cierre-5) → drama vacío.
- *"Cada uno tiene caveats."* (cierre-2) → anglicismo + no dice cuáles son los caveats.

### 4.2 Datos que se contradicen entre sí
- El borrador presume *"tu equipo abre nuestros correos desde hace meses"*
  (engagement alto), pero la métrica del propio caso (contexto-4) dice que la
  **apertura bajó a 23.4%, debajo del mínimo de 27%** (engagement bajo). El
  mensaje miente respecto a los datos del caso.
- La tabla de contactos (contexto-3, datos-1) incluye a **"Mariana Robles · Aurora
  Retail" como una fila de la base de marketing** (tu jefa es un lead de tu propia
  campaña), y al lado contactos de *otras* empresas (Cresta Software, Eclipse
  Health, Delta Logistics). Entonces la base no es "clientes de Aurora Retail" —
  es un revoltijo de leads de varias empresas, lo que choca con todo.

### 4.3 El caso se contradice sobre sus propias reglas
- ia-1 (reading_passive) dice: *"usa el modelo corporativo, no elijas; si quieres
  otro, abre ticket."* Pero ia-2 (ai_textfield_guided) **ofrece elegir entre GPT,
  Claude, Gemini, modelo local** (en el YAML los `models:` del guided). Le dice al
  participante "no elijas modelo" y acto seguido lo hace elegir modelo.

### 4.4 Comités fantasma (entidades no aclaradas)
- "el **comité directivo** pidió..." (correo) · "si nos preguntan en el **comité de
  privacidad**..." (revision-4) · "defenderías ante el **comité directivo**"
  (cierre-5). Tres menciones, dos comités, cero claridad sobre a quién le presentas
  al final: ¿a Mariana? ¿a un comité?

### 4.5 Trabajo desperdiciado / desconectado
- Toda la sección IA construye prompts para que la inteligencia artificial *genere*
  el mensaje. Pero cierre-4 (ai_textfield_free) te pide *"escribe el mensaje exacto
  a mano"*. ¿Para qué sirvió la IA? Y su placeholder dice *"al primer contacto del
  segmento"* cuando nunca elegiste un contacto, elegiste un segmento.

### 4.6 Pendiente ya conocido (de auditorías anteriores)
- reading_attachment (datos-3) "Política de datos vigente": dice "Lee antes de
  seguir" pero el PDF es un adjunto simulado que no se abre, y luego el caso evalúa
  contra esa política que nunca se mostró.

---

## 5. CAUSA RAÍZ (dos niveles)

### 5.1 Nivel de cómo se construye (proceso de trabajo)
El caso se armó optimizando cada slide para pasar **reglas estructurales** (ratio
60% AI-native, primer slide case_cover, no enseñar antes de medir, section/level
constraints, ratio de pasivos, etc.). Cada vez que se movió una pieza para cumplir
una regla (ej. cambiar reading_kpi_cards por categorize_rows para subir el ratio),
se metió contenido nuevo **sin releer el caso completo para ver si todavía
cuadraba**. Hubo guardianes de las reglas, nunca un guardián de la historia.

### 5.2 Nivel de los documentos (causa raíz para que no se repita)
`docs/simulador/case_factory/CASE_QUALITY_CHECKLIST.md` tiene:
- **Gate automático**: todo metadata (level, freshness, pesos que sumen 100, risk
  events, practice mapping, resimulation, judge prompt) + 1 regla anti-spoiler.
- **Gate humano**: 10 preguntas, todas de **pedagogía** (presión real, tradeoffs
  reales, equivocarse plausible, transferencia, herramienta vigente, acción
  manager, no IP de terceros, tiempo, evidencia textual, enseñar después de medir).

**NO existe ningún gate para:**
- **Coherencia narrativa end-to-end** — ¿el escenario del inicio sobrevive los 25
  slides? ¿quién le escribe a quién? ¿es el mismo trabajo de principio a fin?
  ¿retención vs adquisición?
- **Voz y naturalidad de la redacción** — ¿suena como lo escribiría una persona
  real, o como jerga recortada de telegrama?
- **Promesas cumplidas** — ¿todo lo que pide el manager se entrega, y todo lo que
  se entrega se anunció?
- **Lectura corrida final (read-through)** — leer el caso como lo vive el empleado,
  de un tirón, antes de aprobarlo.

`CASE_HIG.md` tiene una sección "Claridad de instrucciones" pero opera a nivel de
**slide individual** (cada pantalla responde quién pide/qué necesita/etc.) y reglas
de anglicismos. No hay nada a nivel de **conjunto**.

`CASE_CREATION_SKILL.md` tiene un "Case Critic" (paso 8) pero enfocado en
pedagogía/spoilers/dificultad, no en redacción ni consistencia narrativa.

**Conclusión:** el proceso valida que el caso esté bien *armado*, pero nadie valida
que esté bien *contado*. Por eso un caso puede pasar todos los checks y aun así
comunicar pésimo.

---

## 6. IMPLICACIÓN PARA EL CEREBRO

Esto NO es un bug del caso demo. Es un hueco del modelo con el que se van a crear
**todos** los casos. Sin cerrarlo, cada caso futuro tendrá su propia versión de
"te vendes a ti mismo" y "presupuesto sin tocar".

---

## 7. PLAN DE CORRECCIÓN ACORDADO (orden: proceso primero, caso después)

### Paso 1 — Arreglar el PROCESO (los documentos)
Para que la corrección viva en el cerebro, no solo en este ejemplo.

1. **`CASE_QUALITY_CHECKLIST.md`** · agregar un gate nuevo (humano + idealmente
   semi-automático) de **coherencia narrativa + voz + promesas cumplidas**.
   Preguntas candidatas:
   - ¿El escenario del primer slide (rol, empresa, tipo de trabajo) se sostiene
     idéntico hasta el último slide?
   - ¿El emisor y el receptor de cada mensaje son coherentes con el rol del
     participante? (no "te vendes a ti mismo")
   - ¿Es el mismo tipo de trabajo de principio a fin? (retención ≠ adquisición)
   - ¿Todo lo que el manager pide al inicio se entrega? ¿Todo lo que se entrega se
     anunció?
   - ¿Cada nombre, número, empresa y fecha es consistente entre slides?
   - ¿Algún dato del escenario contradice otro? (apertura baja vs "abren hace meses")
   - ¿Cada frase de instrucción da información real, o es relleno/coach/telegrama?
   - ¿Algún elemento mencionado nunca se usa? (ej. "presupuesto sin tocar")

2. **`CASE_CREATION_SKILL.md`** · volver explícito un paso final obligatorio de
   **"lectura corrida + autocorrección de consistencia (múltiples pasadas)"**:
   leer el caso de principio a fin como lo vive el empleado, anotar toda ruptura de
   historia/voz/promesa, corregir, y releer hasta que fluya. Documentar que esto se
   hace ANTES de marcar el caso como listo.

3. (Opcional) **`CASE_HIG.md`** · añadir una sección "Voz y consistencia del caso
   como un todo" que complemente la "Claridad de instrucciones" a nivel de slide.

### Paso 2 — Reescribir el CASO DEMO entero como una sola historia
Aplicando el gate nuevo. Decisiones narrativas a tomar ANTES de escribir:
- **Elegir UNA historia**: lo más limpio es **retención** (coherente con la base de
  clientes propios y el ticket de Legal sobre bajas/consentimiento). El mensaje
  debe ser a un cliente existente de Aurora Retail, no un pitch de venta en frío.
- **Un solo destinatario claro** del mensaje (un segmento de clientes propios, no
  "Mariana" que es la jefa).
- **Cerrar el loop de las 3 promesas** de Mariana (segmentos + mensaje + métricas a
  monitorear), incluyendo el ejercicio de métricas que hoy falta.
- **Un solo comité** o ninguno; claridad de a quién se le presenta.
- **Reconciliar el modelo**: o el participante elige modelo (y se quita el "no
  elijas") o no elige (y se quita el selector del guided).
- **Reconciliar el artefacto final**: que el mensaje a mano del cierre tenga sentido
  después del trabajo con la inteligencia artificial (ej. el cierre es ajustar/
  aprobar, no reescribir desde cero).
- Leerlo de corrido antes de entregarlo.

### Sincronización obligatoria
Todo cambio al caso debe reflejarse EN PARALELO en:
- `app/case-demo/CaseDemoClient.tsx` (la vitrina TSX, 25 slides)
- `docs/simulador/contrato_v0/cases_assembled/marketing_dirty_data_relaunch_v1.yaml`
  (el caso canónico)
Estos dos divergieron dos veces antes; mantenerlos 1:1.

---

## 8. Reglas de voz para la reescritura (de la memoria de Pablo)
- Español neutro LATAM, claro, sin jerga corporativa-startup.
- Cero acrónimos / abreviaciones en el contenido (regla determinante).
- Cero em dash.
- "IA" o "inteligencia artificial" según contexto (mayúsculas en chip, prosa
  completa en cuerpo).
- Sin frases de relleno, coach o telegrama: cada frase aporta información operativa.
- Concisión CON claridad, no concisión que sacrifica sentido.

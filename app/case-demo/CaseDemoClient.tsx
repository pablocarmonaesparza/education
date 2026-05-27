"use client";

/**
 * /case-demo · primer caso ensamblado end-to-end con el formato 5×5.
 *
 * Caso: "Envío del lunes con datos sucios" · Marketing N1 · 12 min.
 * 5 secciones × 5 diapositivas = 25 slides totales.
 * 60% AI-native (15 activos) · 40% pasivos (10 readings).
 *
 * Shell heredado de /case-template (sidebar 5 secciones + progress
 * 5 segmentos + título/body/ejercicio/continuar). Estado de navegación
 * con useState: sectionIdx + slideIdx. Cada slide referencia un
 * block_id del registry y pasa caseContext con su content específico.
 *
 * Bloques que tienen OWNS_CONTINUE (case_cover, ai_textfield_guided,
 * categorize_rows, ai_comparison, dashboard_pivot) manejan su propio
 * botón Continuar via onShellContinue. El shell no muestra su CTA
 * cuando el bloque maneja el suyo.
 */

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ExerciseBlockRenderer } from "@/components/simulador/ExerciseBlockRenderer";
import type { ExerciseBlockId } from "@/lib/simulador/exercise-blocks.generated";
import type { ExerciseResponsePayload } from "@/lib/simulador/exercise-registry";
import { isBlockComplete } from "@/lib/simulador/exercise-completion";
import { SlideBody } from "../exercise-lab/_shared/SlideBody";

// ============================================================
// SECCIONES (5 obligatorias)
// ============================================================

const SECTIONS = [
  { id: "contexto", name: "Contexto" },
  { id: "datos", name: "Datos" },
  { id: "ia", name: "IA" },
  { id: "revision", name: "Revisión" },
  { id: "cierre", name: "Cierre" },
] as const;

const SLIDES_PER_SECTION = 5;

// Bloques que manejan su propio botón Continuar internamente (auto-advance
// o subsección de revisión con CTA propio). El resto usa el Continuar del
// shell · el shell consultará completionPredicate del registry para
// bloquear avance si el payload aún no satisface la regla del bloque.
const OWNS_CONTINUE = new Set<ExerciseBlockId>([
  "case_cover",
  "ai_textfield_guided",
  "categorize_rows",
  "ai_comparison",
  // dashboard_pivot · removido en P1.2 · ahora pide leader_takeaway,
  // ya no auto-avanza.
]);

// Variants de la transición entre slides · efecto scroll vertical.
// direction=1 · avanza · slide nueva entra desde abajo, vieja se va arriba
// direction=-1 · regresa · slide nueva entra desde arriba, vieja se va abajo
const SLIDE_VARIANTS = {
  enter: (dir: 1 | -1) => ({
    y: dir > 0 ? "100vh" : "-100vh",
    opacity: 0,
  }),
  center: {
    y: 0,
    opacity: 1,
  },
  exit: (dir: 1 | -1) => ({
    y: dir > 0 ? "-100vh" : "100vh",
    opacity: 0,
  }),
};

// ============================================================
// TIPO Slide
// ============================================================

interface Slide {
  blockId: ExerciseBlockId;
  title: string;
  body: string;
  /** Contenido visible al usuario · pasa al renderer del bloque. */
  caseContext?: Record<string, unknown>;
  /** Metadata interna del judge · NO pasa al cliente del bloque. Vive
   *  solo en el caso (server-side cuando esté wired). El shell la
   *  ignora completamente al renderizar. P0.1 real (vs visual). */
  judgeMeta?: Record<string, unknown>;
}

/** Strip de campos sensibles del caseContext antes de pasar al renderer.
 *  Garantiza que aunque un autor olvide separar judgeMeta, los campos
 *  prohibidos (hint, example, issue, flagIfMarked, goodWhen) jamás
 *  lleguen al cliente del bloque. P0.1 real · cumple regla transversal
 *  "no enseñar antes de medir" a nivel estructural. */
function stripJudgeFields(
  ctx: Record<string, unknown> | undefined,
): Record<string, unknown> | undefined {
  if (!ctx) return ctx;
  const clean = JSON.parse(JSON.stringify(ctx));
  function walk(node: unknown): void {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    const obj = node as Record<string, unknown>;
    delete obj.hint;
    delete obj.example;
    delete obj.issue;
    delete obj.flagIfMarked;
    delete obj.goodWhen;
    Object.values(obj).forEach(walk);
  }
  walk(clean);
  return clean;
}

// ============================================================
// 25 SLIDES DEL CASO
// Caso: Envío del lunes con datos sucios · Marketing N1
// ============================================================

const SLIDES: Slide[][] = [
  // ============================================================
  // SECCIÓN 1 · CONTEXTO (5 pasivos · onboarding)
  // ============================================================
  [
    // Slot 1: case_cover · portada del caso
    {
      blockId: "case_cover",
      title: "Envío del lunes con datos sucios.",
      body: "Tu manager acaba de pasarte la **lista de 480 contactos** para la campaña del **lunes a las 8 de la mañana**. Hay registros **duplicados**, cargos **mal escritos** y tres filas **sin nombre**. Decides cómo limpiar la base, qué pedirle a la inteligencia artificial y qué entregar antes del cierre del viernes.",
      caseContext: {
        meta: {
          profile: "Marketing",
          level: "N1 · Fundamentos",
          estimatedMinutes: 12,
          timerSeconds: 600,
          timerDefaultOn: false,
          tools: [
            { kind: "ai", label: "Inteligencia artificial" },
            { kind: "data", label: "Tablas" },
            { kind: "messaging", label: "Mensajería" },
            { kind: "documents", label: "Documentos" },
          ],
        },
      },
    },
    // Slot 2: reading_message · email de la jefa
    {
      blockId: "reading_message",
      title: "Email de Mariana, tu jefa.",
      body: "Lo que llega antes de empezar.",
      caseContext: {
        message: {
          channel: "email",
          from: { name: "Mariana Robles", role: "Head of Growth · Aurora Retail" },
          to: { name: "Tú", role: "Marketing Lead" },
          timestamp: "Hoy, 09:42",
          subject: "Necesitamos relanzar la campaña antes del viernes",
          body: "Hola, el board pidió relanzar la campaña de retención antes del viernes. **Presupuesto sin tocar.** Mándame propuesta hoy mismo con segmentos, mensaje base y métricas que vas a monitorear. Gracias.",
        },
      },
    },
    // Slot 3: reading_data_table · preview de los problemas
    {
      blockId: "reading_data_table",
      title: "Preview de la base que te pasaron.",
      body: "Primeros 5 contactos de la lista. **Hay problemas evidentes** desde la primera mirada.",
      caseContext: {
        table: {
          caption: "Contactos pendientes para el envío del lunes",
          columns: [
            { key: "contacto", label: "Contacto" },
            { key: "empresa", label: "Empresa" },
            { key: "cargo", label: "Cargo" },
            { key: "ultima_apertura", label: "Última apertura" },
            { key: "estatus", label: "Estatus" },
          ],
          rows: [
            { contacto: "Mariana Robles", empresa: "Aurora Retail", cargo: "Head of Growth", ultima_apertura: "Hace 3 días", estatus: "Activa" },
            { contacto: "mariana robles", empresa: "Aurora Retail", cargo: "head of growth", ultima_apertura: "Hace 21 días", estatus: "Activa" },
            { contacto: "(vacío)", empresa: "Bosa Industrial", cargo: "Director", ultima_apertura: "Hace 7 días", estatus: "Activa" },
            { contacto: "Carlos Méndez", empresa: "Cresta Software", cargo: "DIRECTOR MARKETING", ultima_apertura: "Hace 60 días", estatus: "Inactiva" },
            { contacto: "Lucía Soto", empresa: "Delta Logistics", cargo: "Gerente comercial", ultima_apertura: "Hace 5 días", estatus: "Activa" },
          ],
        },
      },
    },
    // Slot 4: categorize_rows · clasificar métricas de la última campaña
    {
      blockId: "categorize_rows",
      title: "Clasifica las métricas del último envío.",
      body: "Tres métricas de la **campaña anterior**. Decide cuáles son aceptables, cuáles te preocupan y cuáles son críticas antes de planear esta.",
      caseContext: {
        actionStyle: "severity",
        actions: [
          { value: "aceptable", label: "Aceptable" },
          { value: "preocupante", label: "Preocupante" },
          { value: "critica", label: "Crítica" },
        ],
        rows: [
          { id: "metric-1", label: "Tasa de apertura: 23.4%", example: "Bajó 4.2 puntos respecto al envío anterior", hint: "Benchmark interno es 27% mínimo" },
          { id: "metric-2", label: "Conversión a demo: 3.1%", example: "Subió 0.6 puntos respecto al envío anterior", hint: "Benchmark interno es 2.5% mínimo" },
          { id: "metric-3", label: "Quejas por privacidad: 12", example: "Subió 8 respecto al envío anterior", hint: "Cualquier número arriba de 5 dispara alerta de Legal" },
        ],
      },
    },
    // Slot 5: reading_message · ticket de Legal
    {
      blockId: "reading_message",
      title: "Ticket de Legal sobre la última campaña.",
      body: "Lo que dejó la campaña anterior antes de empezar esta.",
      caseContext: {
        message: {
          channel: "ticket",
          from: { name: "Daniela Ruiz", role: "Legal · Aurora Retail" },
          to: { name: "Marketing" },
          timestamp: "Hace 6 días",
          subject: "Quejas por uso de datos personales",
          body: "Llegaron 3 quejas por correos enviados a personas que pidieron baja hace meses. Antes del próximo envío necesitamos **confirmar que la base está limpia** y que tenemos **consentimiento vigente**. Cualquier duda, marcar para revisión.",
        },
      },
    },
  ],

  // ============================================================
  // SECCIÓN 2 · DATOS (4 activos + 1 pasivo)
  // ============================================================
  [
    // Slot 1: reading_data_table · base completa con flags
    {
      blockId: "reading_data_table",
      title: "La base completa con todos los flags.",
      body: "Aquí están los **8 contactos problemáticos** extraídos de los 480. Cada fila tiene una bandera del sistema. Lee bien antes de clasificar en la siguiente diapositiva.",
      caseContext: {
        table: {
          caption: "Contactos con problemas detectados",
          columns: [
            { key: "contacto", label: "Contacto" },
            { key: "empresa", label: "Empresa" },
            { key: "problema", label: "Problema detectado" },
            { key: "consentimiento", label: "Consentimiento" },
          ],
          rows: [
            { contacto: "Mariana Robles", empresa: "Aurora Retail", problema: "Duplicado de fila 2", consentimiento: "Vigente" },
            { contacto: "mariana robles", empresa: "Aurora Retail", problema: "Duplicado de fila 1", consentimiento: "Vigente" },
            { contacto: "(vacío)", empresa: "Bosa Industrial", problema: "Sin nombre", consentimiento: "Vigente" },
            { contacto: "Carlos Méndez", empresa: "Cresta Software", problema: "Cargo escrito en mayúsculas raras", consentimiento: "Vigente" },
            { contacto: "Ana Pérez", empresa: "Eclipse Health", problema: "Pidió baja hace 2 meses", consentimiento: "Revocado" },
            { contacto: "Pedro Castillo", empresa: "Foro Studio", problema: "Email rebota hace 4 envíos", consentimiento: "Vigente" },
            { contacto: "(vacío)", empresa: "Gama Capital", problema: "Sin nombre", consentimiento: "Vigente" },
            { contacto: "Sofía Lara", empresa: "Helix Bio", problema: "Cargo vacío", consentimiento: "Vigente" },
          ],
        },
      },
    },
    // Slot 2: categorize_rows · clasificar contactos
    {
      blockId: "categorize_rows",
      title: "Decide qué hacer con cada contacto.",
      body: "Por cada fila elige una acción. **No hay opción correcta evidente** en todos los casos. Decide con criterio operativo.",
      caseContext: {
        actionStyle: "permission",
        actions: [
          { value: "usar", label: "Usar" },
          { value: "anonimizar", label: "Anonimizar" },
          { value: "agregar", label: "Agregar" },
          { value: "excluir", label: "Excluir" },
        ],
        rows: [
          { id: "row-1", label: "Mariana Robles · Aurora Retail", example: "Duplicado de fila 2", hint: "Misma persona, capitalización distinta" },
          { id: "row-2", label: "mariana robles · Aurora Retail", example: "Duplicado de fila 1", hint: "Misma persona, capitalización distinta" },
          { id: "row-3", label: "(sin nombre) · Bosa Industrial", example: "Sin nombre", hint: "Email genérico info@bosa.example" },
          { id: "row-4", label: "Carlos Méndez · Cresta Software", example: "Cargo raro DIRECTOR MARKETING", hint: "Necesita normalización a Director de Marketing" },
          { id: "row-5", label: "Ana Pérez · Eclipse Health", example: "Pidió baja hace 2 meses", hint: "Consentimiento revocado · regla dura" },
          { id: "row-6", label: "Pedro Castillo · Foro Studio", example: "Email rebota desde hace 4 envíos", hint: "Hard bounce repetido" },
          { id: "row-7", label: "(sin nombre) · Gama Capital", example: "Sin nombre", hint: "Email personal sofia.lara@gmail.example" },
          { id: "row-8", label: "Sofía Lara · Helix Bio", example: "Cargo vacío", hint: "Solo nombre y empresa" },
        ],
      },
    },
    // Slot 3: reading_attachment · política de datos (contexto regulatorio)
    {
      blockId: "reading_attachment",
      title: "Política de datos vigente.",
      body: "Lee antes de seguir. El documento define **qué se puede usar** con modelos externos y **qué requiere aprobación** legal antes del envío.",
      caseContext: {
        attachments: [
          {
            name: "Politica_Datos_Aurora_Retail_v2.pdf",
            size: "184 KB",
            kind: "pdf",
            description: "Política interna · datos permitidos para uso con inteligencia artificial externa.",
          },
        ],
      },
    },
    // Slot 4: ai_textfield_free · pídele a la IA que audite tu plan de datos
    {
      blockId: "ai_textfield_free",
      title: "Pídele a la IA que audite tu plan.",
      body: "Antes de llevar este plan al modelo final, **pídele a una IA auditora** que revise si tu selección de datos respeta la política y si dejaste algún hueco. Sé específico.",
    },
    // Slot 5: categorize_rows · qué campos pasas al modelo (decisión final de privacidad)
    {
      blockId: "categorize_rows",
      title: "Decide qué campos van al modelo.",
      body: "El **mensaje personalizado** lo va a generar la inteligencia artificial. Decide qué columnas le pasas y cuáles transformas antes para proteger los datos personales.",
      caseContext: {
        actionStyle: "permission",
        actions: [
          { value: "usar", label: "Usar" },
          { value: "anonimizar", label: "Anonimizar" },
          { value: "agregar", label: "Agregar" },
          { value: "excluir", label: "Excluir" },
        ],
        rows: [
          { id: "campo-1", label: "Contacto", example: "Nombre completo", hint: "Dato personal directo" },
          { id: "campo-2", label: "Email", example: "Correo del contacto", hint: "Identificador único de la persona" },
          { id: "campo-3", label: "Empresa", example: "Razón social", hint: "Contexto de la cuenta" },
          { id: "campo-4", label: "Cargo", example: "Rol del contacto", hint: "Útil para personalizar tono" },
          { id: "campo-5", label: "Última apertura", example: "Engagement reciente", hint: "Señal de interés" },
          { id: "campo-6", label: "Notas internas", example: "Comentarios del equipo de ventas", hint: "Pueden contener info sensible" },
        ],
      },
    },
  ],

  // ============================================================
  // SECCIÓN 3 · IA (5 slides · narrativa de iteración con IA)
  // ============================================================
  [
    // Slot 1: reading_passive · contexto operativo antes del beat IA.
    // El bloque model_tradeoff_sliders está prohibido en sección IA
    // (DIAGNOSTICO_1_CASO_V0 §7: "No es selector de modelos"). El caso
    // real presenta el modelo como instrumento dado, no como decisión
    // del participante dentro del beat IA. reading_passive es el único
    // pasivo permitido en sección IA (block_section_constraints).
    {
      blockId: "reading_passive",
      title: "Modelo aprobado para este envío.",
      body: "Para campañas con datos personales, el equipo de plataforma aprobó el **modelo corporativo interno**. Si necesitas otro modelo para algo específico, abres ticket. Para este envío usas el corporativo.",
    },
    // Slot 2: ai_textfield_guided · construir el prompt principal
    {
      blockId: "ai_textfield_guided",
      title: "Construye el prompt para el modelo.",
      body: "Vas a generar el **mensaje base** del envío. Define objetivo, audiencia y límites en pasos. Sin estas decisiones, el modelo va a improvisar.",
    },
    // Slot 3: ai_output_review · revisa el primer output de la IA
    {
      blockId: "ai_output_review",
      title: "La IA generó esto. ¿Qué te detiene?",
      body: "Primer borrador del mensaje. **Marca lo que no usarías** antes de pedirle al modelo que corrija.",
      caseContext: {
        segments: [
          { id: "s1", text: "Hola Mariana, vimos que tu equipo abre nuestros correos desde hace meses.", issue: "Afirmación sin verificar", flagIfMarked: "claim_no_verificado" },
          { id: "s2", text: "Aurora Retail está creciendo 40% mes a mes, lo que nos motiva a contactarte.", issue: "Cifra sin fuente", flagIfMarked: "claim_no_verificado" },
          { id: "s3", text: "Nuestro producto ayudó a empresas similares a duplicar conversión en 2 semanas.", issue: "Promesa sin respaldo", flagIfMarked: "claim_no_verificado" },
          { id: "s4", text: "Agenda 15 minutos esta semana para ver cómo aplicaría a tu caso.", issue: "Llamado de acción aceptable", flagIfMarked: "frase_reutilizable" },
        ],
      },
    },
    // Slot 4: ai_textfield_free · escribir follow-up para que la IA corrija
    {
      blockId: "ai_textfield_free",
      title: "Pídele a la IA que corrija.",
      body: "Escribe el **siguiente prompt** que mandarías. Sé específico: qué quitar, qué cambiar, qué mantener. La iteración es donde se gana o se pierde el envío.",
    },
    // Slot 5: ai_output_review · versión corregida
    {
      blockId: "ai_output_review",
      title: "Versión corregida. ¿Algo todavía te detiene?",
      body: "El modelo aplicó tu corrección. **Última pasada** antes de mandar a revisión completa de tono y cierre.",
      caseContext: {
        segments: [
          { id: "v1", text: "Hola Mariana, vi en LinkedIn que Aurora Retail abrió oficina en Monterrey la semana pasada.", issue: "Dato personalizado de fuente externa", flagIfMarked: "dato_sensible" },
          { id: "v2", text: "Trabajamos con equipos de Marketing en empresas medianas de retail en LATAM.", issue: "Afirmación interna verificable", flagIfMarked: "frase_reutilizable" },
          { id: "v3", text: "Si te interesa explorar cómo aplicaría a tu caso, te dejo dos horarios la próxima semana.", issue: "Cierre directo y opcional", flagIfMarked: "frase_reutilizable" },
          { id: "v4", text: "Si prefieres que mande la propuesta por escrito antes de cualquier llamada, también funciona.", issue: "Opción alterna educada", flagIfMarked: "frase_reutilizable" },
        ],
      },
    },
  ],

  // ============================================================
  // SECCIÓN 4 · REVISIÓN (4 activos + 1 pasivo)
  // ============================================================
  [
    // Slot 1: ai_output_review · revisión profunda
    {
      blockId: "ai_output_review",
      title: "Revisión profunda del mensaje.",
      body: "Versión más larga del mensaje. **Marca cada segmento** con la bandera que aplique. Puede no aplicar bandera si está bien.",
      caseContext: {
        segments: [
          { id: "r1", text: "Mariana, vi en LinkedIn que Aurora Retail abrió oficina en Monterrey la semana pasada.", issue: "Información personal de fuente externa", flagIfMarked: "dato_sensible" },
          { id: "r2", text: "El 87% de empresas como la tuya reducen costo operativo con nuestro producto.", issue: "Cifra sin respaldo", flagIfMarked: "claim_no_verificado" },
          { id: "r3", text: "Adjunto te dejo el reporte interno de Cresta Software, que tiene un caso muy similar.", issue: "Datos de otro cliente", flagIfMarked: "dato_sensible" },
          { id: "r4", text: "Si te interesa, agendamos cuando te acomode.", issue: "Cierre limpio y aceptable", flagIfMarked: "frase_reutilizable" },
        ],
      },
    },
    // Slot 2: ai_comparison · elegir cierre del mensaje
    {
      blockId: "ai_comparison",
      title: "Elige el llamado a la acción.",
      body: "Cuatro versiones del **cierre del mensaje**. Cada una tiene un tradeoff entre directness y permission.",
      caseContext: {
        options: [
          { id: "A", title: "Versión A", body: "Agenda 15 minutos esta semana en este enlace. Es la forma más rápida de avanzar." },
          { id: "B", title: "Versión B", body: "¿Tienes 15 minutos esta semana para una llamada corta? Si no, mándame fecha que te acomode." },
          { id: "C", title: "Versión C", body: "Si te interesa, mándame un mensaje y coordinamos. Sin presión." },
          { id: "D", title: "Versión D", body: "Te dejamos la información por aquí. Cuando puedas, agendamos una llamada para hablar de tu caso." },
        ],
      },
    },
    // Slot 3: ai_output_review · cifras sin fuente
    {
      blockId: "ai_output_review",
      title: "Datos que el modelo afirmó sin fuente.",
      body: "El modelo metió **cifras** en el borrador. Marca las que no podrías sostener si te las cuestionan.",
      caseContext: {
        segments: [
          { id: "c1", text: "Nuestros clientes duplican conversión en 2 semanas.", issue: "Promesa cuantitativa sin respaldo", flagIfMarked: "claim_no_verificado" },
          { id: "c2", text: "Aurora Retail está creciendo 40% mes a mes.", issue: "Cifra de tu cliente sin fuente verificable", flagIfMarked: "claim_no_verificado" },
          { id: "c3", text: "El 87% de empresas similares reduce costo operativo con nuestro producto.", issue: "Estadística sin estudio que la respalde", flagIfMarked: "claim_no_verificado" },
          { id: "c4", text: "Trabajamos con equipos de Marketing en empresas medianas de retail en LATAM.", issue: "Afirmación verificable internamente", flagIfMarked: "frase_reutilizable" },
        ],
      },
    },
    // Slot 4: reading_message · feedback del manager
    {
      blockId: "reading_message",
      title: "Feedback de Mariana sobre el borrador.",
      body: "Tu jefa ya leyó la primera versión.",
      caseContext: {
        message: {
          channel: "chat",
          from: { name: "Mariana Robles", role: "Head of Growth · Aurora Retail" },
          to: { name: "Tú" },
          timestamp: "Hace 12 minutos",
          body: "Está bien la dirección, pero **el cierre está muy agresivo** y la cifra del **87%** no sé de dónde sale. Si nos preguntan en el comité de privacidad, no la podemos sostener. Ajusta esos dos puntos y mándalo de nuevo.",
        },
      },
    },
    // Slot 5: ai_output_review · última pasada
    {
      blockId: "ai_output_review",
      title: "Última pasada · versión post-feedback.",
      body: "Marca lo que todavía te genera dudas o lo que dejarías ir.",
      caseContext: {
        segments: [
          { id: "f1", text: "Mariana, vi que Aurora Retail abrió oficina en Monterrey.", issue: "Información pública aceptable", flagIfMarked: "frase_reutilizable" },
          { id: "f2", text: "Trabajamos con equipos de Marketing en empresas medianas de retail.", issue: "Verificable internamente", flagIfMarked: "frase_reutilizable" },
          { id: "f3", text: "Si quieres ver cómo lo aplicaríamos a tu caso, agendamos una llamada cuando te acomode.", issue: "Llamado limpio", flagIfMarked: "frase_reutilizable" },
          { id: "f4", text: "Te dejo dos horarios la próxima semana, dime cuál te sirve.", issue: "Cierre operativo", flagIfMarked: "frase_reutilizable" },
        ],
      },
    },
  ],

  // ============================================================
  // SECCIÓN 5 · CIERRE (4 activos + 1 pasivo)
  // ============================================================
  [
    // Slot 1: dashboard_pivot · elegir segmento
    {
      blockId: "dashboard_pivot",
      title: "Elige qué segmento llevar al manager.",
      body: "Tres segmentos con métricas reales. Cada uno tiene **caveats**. Elige cuál llevas a la reunión del lunes.",
    },
    // Slot 2: workflow_builder · definir el flujo
    {
      blockId: "workflow_builder",
      title: "Define el flujo del envío.",
      body: "Ordena los pasos. Decide **dónde entra revisión humana** y dónde el modelo opera solo. Puedes reordenar arrastrando.",
    },
    // Slot 3: tradeoff_decision_memo · decisión principal
    {
      blockId: "tradeoff_decision_memo",
      title: "Decide qué le recomiendas a Mariana.",
      body: "Llegó el momento. Tres opciones con tradeoffs reales. Elige la que **defenderías frente al board**.",
      caseContext: {
        decisions: [
          { id: "lanzar_lunes", title: "Lanzar el lunes", detail: "Úsalo si el beneficio supera el riesgo y los huecos de privacidad ya quedaron mitigados." },
          { id: "piloto_controlado", title: "Piloto controlado", detail: "Úsalo si hay señales prometedoras pero el riesgo de quejas o datos requiere validar con un subset primero." },
          { id: "pausar_y_escalar", title: "Pausar y escalar", detail: "Úsalo si la base no está lista, hay datos sensibles sin consentimiento o el modelo afirma cosas que no se pueden sostener." },
        ],
      },
    },
    // Slot 4: ai_output_review · última revisión del email antes de enviar
    {
      blockId: "ai_output_review",
      title: "Última revisión antes del envío.",
      body: "Así se vería en la bandeja del contacto. **Marca cualquier cosa** que te detendría justo antes de mandar el lunes a las 8.",
      caseContext: {
        segments: [
          { id: "final-1", text: "Asunto: Una idea concreta para tu equipo este trimestre.", issue: "Asunto operativo", flagIfMarked: "frase_reutilizable" },
          { id: "final-2", text: "Mariana, vi que Aurora Retail abrió oficina en Monterrey la semana pasada.", issue: "Información personalizada de fuente externa", flagIfMarked: "dato_sensible" },
          { id: "final-3", text: "Trabajamos con equipos de Marketing en empresas medianas de retail.", issue: "Afirmación interna verificable", flagIfMarked: "frase_reutilizable" },
          { id: "final-4", text: "Te dejo dos horarios la próxima semana, dime cuál te sirve.", issue: "Cierre directo y opcional", flagIfMarked: "frase_reutilizable" },
        ],
      },
    },
    // Slot 5: ai_textfield_free · escribe el mensaje del envío del lunes.
    // Reemplazó al segundo tradeoff_decision_memo (era redundante con
    // slot 3). Cierra el caso con un artefacto entregable real · permite
    // al judge comparar el texto del usuario contra el borrador post-IA.
    // P0.2 · recupera ratio AI-native 60% tras mover model_tradeoff_sliders.
    {
      blockId: "ai_textfield_free",
      title: "Escribe el mensaje del envío.",
      body: "Cierre del caso. **Una línea o dos** con el texto que mandarías el lunes a las 8. Esto es lo que Mariana va a poder validar.",
      caseContext: {
        placeholder: "Escribe el mensaje exacto que enviarías al primer contacto del segmento elegido...",
      },
    },
  ],
];

// ============================================================
// COMPONENTE
// ============================================================

export function CaseDemoClient() {
  const [sectionIdx, setSectionIdx] = useState(0);
  const [slideIdx, setSlideIdx] = useState(0);
  /** Slide linear más avanzado al que llegó el usuario. Permite la flecha
   *  "Adelante" solo cuando el usuario está revisitando un slide anterior
   *  (es decir, ya pasó por slides más adelante y regresó). */
  const [maxLinearVisited, setMaxLinearVisited] = useState(0);
  /** Store de payloads por slideId · permite preservar respuestas cuando
   *  el usuario navega atrás y adelante sin perder lo que ya respondió.
   *  El ExerciseBlockRenderer hidrata su useState inicial con esto al
   *  remontar y notifica vía onPayloadChange en cada cambio. */
  const [payloads, setPayloads] = useState<Record<string, ExerciseResponsePayload>>({});
  /** Dirección de la transición · 1 = avanza (slide nueva entra desde abajo),
   *  -1 = regresa (slide nueva entra desde arriba). */
  const [direction, setDirection] = useState<1 | -1>(1);
  /** Cuando el participante termina el caso (último slide + Continuar),
   *  reemplazamos el runtime por la pantalla de cierre · simulación del
   *  reporte que el manager recibe. Permite `?completed=1` en la URL
   *  para saltar directo (preview, demos, screenshots). P3 · guard:
   *  solo válido en desarrollo · en producción el skip se ignora. */
  const [isCompleted, setIsCompleted] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    if (process.env.NODE_ENV === "production") return false;
    return new URLSearchParams(window.location.search).get("completed") === "1";
  });
  /** Timestamp de inicio del caso · para calcular duración total al cierre. */
  const [startedAt] = useState(() => Date.now());

  const slide = SLIDES[sectionIdx]?.[slideIdx];
  const ownsContinue = slide ? OWNS_CONTINUE.has(slide.blockId) : false;
  const linearIdx = sectionIdx * SLIDES_PER_SECTION + slideIdx;
  const canGoForward = linearIdx < maxLinearVisited;
  const currentSlideId = `${SECTIONS[sectionIdx].id}-${slideIdx + 1}`;
  /** P1.1 · Continuar se deshabilita si el bloque actual no emitió
   *  evidencia suficiente. El predicate vive en exercise-completion.ts. */
  const currentPayload = payloads[currentSlideId];
  const blockComplete = slide
    ? isBlockComplete(slide.blockId, currentPayload).complete
    : false;

  const goNext = useCallback(() => {
    const nextLinear = linearIdx + 1;
    if (slideIdx < SLIDES_PER_SECTION - 1) {
      setDirection(1);
      setSlideIdx(slideIdx + 1);
    } else if (sectionIdx < SECTIONS.length - 1) {
      setDirection(1);
      setSectionIdx(sectionIdx + 1);
      setSlideIdx(0);
    } else {
      // Última slide · ir a pantalla de cierre
      setIsCompleted(true);
      return;
    }
    setMaxLinearVisited((m) => (nextLinear > m ? nextLinear : m));
  }, [sectionIdx, slideIdx, linearIdx]);

  const goPrev = useCallback(() => {
    if (slideIdx > 0) {
      setDirection(-1);
      setSlideIdx(slideIdx - 1);
    } else if (sectionIdx > 0) {
      setDirection(-1);
      setSectionIdx(sectionIdx - 1);
      setSlideIdx(SLIDES_PER_SECTION - 1);
    }
  }, [sectionIdx, slideIdx]);

  const isFirstSlide = sectionIdx === 0 && slideIdx === 0;

  const handleFeedback = useCallback(() => {
    const slideRef = `${SECTIONS[sectionIdx].id}-${slideIdx + 1}`;
    const subject = encodeURIComponent(
      `Sugerencia · caso demo · slide ${slideRef}`,
    );
    const body = encodeURIComponent(
      `Slide: ${slideRef}\nTemplate: ${slide?.blockId}\n\nDescribe la sugerencia o corrección:\n`,
    );
    // P3 · destinatario configurable vía env var · fallback al placeholder
    // de desarrollo. En producción debe estar definido NEXT_PUBLIC_FEEDBACK_EMAIL.
    const to =
      process.env.NEXT_PUBLIC_FEEDBACK_EMAIL ?? "feedback@itera.example";
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
  }, [sectionIdx, slideIdx, slide?.blockId]);

  // Scroll al top al cambiar de slide
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [sectionIdx, slideIdx]);

  // Enter para continuar (solo si no es un bloque que owns continue y
  // sólo si el bloque ya emitió evidencia suficiente · P1.1).
  useEffect(() => {
    if (ownsContinue) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Enter" && !e.shiftKey && !e.metaKey && !e.ctrlKey) {
        const target = e.target as HTMLElement;
        if (target.tagName === "TEXTAREA" || target.tagName === "INPUT") return;
        if (!blockComplete) return;
        e.preventDefault();
        goNext();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goNext, ownsContinue, blockComplete]);

  if (!slide) return null;

  const isLastSlide =
    sectionIdx === SECTIONS.length - 1 && slideIdx === SLIDES_PER_SECTION - 1;

  // Pantalla de cierre · simulación del reporte que el manager recibe.
  if (isCompleted) {
    const durationMs = Date.now() - startedAt;
    const durationMinutes = Math.max(1, Math.round(durationMs / 60_000));
    return (
      <CaseCompletedScreen
        durationMinutes={durationMinutes}
        payloads={payloads}
      />
    );
  }

  return (
    <main className="simulador-root min-h-screen surface-canvas text-[var(--text-primary)]">
      <div className="flex min-h-screen flex-col">
        {/* HEADER · 2 botones cuadrados arriba a la izquierda (Cerrar + Atrás)
            + progress bar centrado al lado. */}
        <div className="pt-6 pb-6">
          <div className="mx-auto flex w-[65%] max-w-[1200px] items-center gap-4">
            <div className="flex items-center gap-2">
              {/* Cerrar · regresa al lab de ejercicios */}
              <a
                href="/exercise-lab"
                aria-label="Cerrar caso"
                className="grid h-12 w-12 place-items-center rounded-[var(--radius-md)] border border-[var(--border)] text-[var(--text-secondary)] transition-colors hover:border-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M6 6L18 18M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </a>
              {/* Atrás · slide anterior */}
              <button
                type="button"
                onClick={goPrev}
                disabled={isFirstSlide}
                aria-label="Diapositiva anterior"
                className={`grid h-12 w-12 place-items-center rounded-[var(--radius-md)] border transition-colors ${
                  isFirstSlide
                    ? "border-[var(--surface-3)] text-[var(--text-disabled)] cursor-not-allowed"
                    : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M15 6L9 12L15 18"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
            <div
              role="progressbar"
              aria-label={`Diapositiva ${slideIdx + 1} de ${SLIDES_PER_SECTION}`}
              aria-valuemin={1}
              aria-valuemax={SLIDES_PER_SECTION}
              aria-valuenow={slideIdx + 1}
              className="flex flex-1 gap-2"
            >
              {Array.from({ length: SLIDES_PER_SECTION }).map((_, idx) => {
                const isActive = idx === slideIdx;
                const isPast = idx < slideIdx;
                return (
                  <div
                    key={idx}
                    className={`h-[3px] flex-1 rounded-full transition-colors ${
                      isActive
                        ? "bg-[var(--accent)] animate-pulse"
                        : isPast
                          ? "bg-[var(--text-secondary)]"
                          : "bg-[var(--surface-3)]"
                    }`}
                  />
                );
              })}
            </div>
            <div className="flex items-center gap-2">
              {/* Adelante · solo desbloqueado si el usuario regresó · permite
                  re-avanzar sin perder respuesta. */}
              <button
                type="button"
                onClick={goNext}
                disabled={!canGoForward}
                aria-label="Avanzar a la siguiente diapositiva"
                className={`grid h-12 w-12 place-items-center rounded-[var(--radius-md)] border transition-colors ${
                  !canGoForward
                    ? "border-[var(--surface-3)] text-[var(--text-disabled)] cursor-not-allowed"
                    : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M9 6L15 12L9 18"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              {/* Sugerencia o corrección · abre mailto con el slide actual */}
              <button
                type="button"
                onClick={handleFeedback}
                aria-label="Mandar sugerencia o corrección"
                className="grid h-12 w-12 place-items-center rounded-[var(--radius-md)] border border-[var(--border)] text-[var(--text-secondary)] transition-colors hover:border-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M21 11.5a8.4 8.4 0 0 1-0.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-0.9L3 21l1.9-5.7a8.4 8.4 0 0 1-0.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-0.9h0.5a8.5 8.5 0 0 1 8 8v0.5z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* CONTENIDO · transición vertical estilo scroll (slide sale arriba,
            nueva entra desde abajo · invertido al regresar). Overflow hidden
            evita scrollbar durante la animación. */}
        <section className="relative flex flex-1 items-center justify-center overflow-hidden py-10">
          <AnimatePresence mode="popLayout" custom={direction} initial={false}>
            <motion.div
              key={currentSlideId}
              custom={direction}
              variants={SLIDE_VARIANTS}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                duration: 0.5,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="w-[65%] max-w-[1200px]"
            >
              {/* Eyebrow · solo el nombre de la sección */}
              <div className="ts-caption-1 font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
                {SECTIONS[sectionIdx].name}
              </div>

              {/* Título */}
              <h1 className="mt-3 display display-tight ts-display text-[var(--text-primary)]">
                {slide.title}
              </h1>

              {/* Body markdown */}
              <SlideBody className="mt-4">{slide.body}</SlideBody>

              {/* Ejercicio · key fuerza re-mount al cambiar de slide para
                  que cada bloque reciba caseContext fresco. initialPayload
                  hidrata el state del bloque con la respuesta previa del
                  store si el usuario está revisitando este slide. */}
              <div className="mt-8">
                <ExerciseBlockRenderer
                  key={currentSlideId}
                  blockId={slide.blockId}
                  sessionId={null}
                  mode="lab_demo"
                  slideId={currentSlideId}
                  caseContext={stripJudgeFields(slide.caseContext)}
                  onShellContinue={goNext}
                  initialPayload={payloads[currentSlideId]}
                  onPayloadChange={(p) =>
                    setPayloads((prev) => ({ ...prev, [currentSlideId]: p }))
                  }
                />
              </div>

              {/* Continuar · solo si el bloque no maneja su propio CTA.
                  Atrás vive en el header arriba (cuadrado con ícono).
                  En la última slide, "Continuar" → pantalla de cierre. */}
              {!ownsContinue && (
                <div className="mt-10 flex items-center gap-4">
                  <button
                    type="button"
                    onClick={goNext}
                    disabled={!blockComplete}
                    className={`rounded-[var(--radius-md)] px-7 py-3 ts-callout font-medium transition-opacity ${
                      blockComplete
                        ? "accent-bg text-white hover:opacity-90"
                        : "bg-[var(--surface-3)] text-[var(--text-disabled)] cursor-not-allowed"
                    }`}
                  >
                    {isLastSlide ? "Ver resumen →" : "Continuar →"}
                  </button>
                  {blockComplete ? (
                    <span className="ts-footnote text-[var(--text-tertiary)]">
                      o pulsa{" "}
                      <kbd className="rounded border border-[var(--border)] bg-[var(--surface-2)] px-1.5 py-0.5 ts-caption-2 font-medium text-[var(--text-secondary)]">
                        Enter ↵
                      </kbd>
                    </span>
                  ) : (
                    <span className="ts-footnote text-[var(--text-tertiary)]">
                      Completa el ejercicio para continuar.
                    </span>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </section>
      </div>
    </main>
  );
}

// ============================================================
// PANTALLA DE CIERRE · simulación del reporte ejecutivo
// Lenguaje Typeform · single column · sin score numérico público
// (cumple contrato v0: "la banda es la unidad narrativa").
// Consume el store de payloads del shell · P0.2.
// ============================================================

interface CaseCompletedScreenProps {
  durationMinutes: number;
  /** Store de payloads del shell · permite computar bandas y citas
   *  textuales reales en vez de hardcoded. P0.2. */
  payloads: Record<string, ExerciseResponsePayload>;
}

type Band = "alto" | "medio" | "bajo";

interface DimensionScore {
  id: string;
  label: string;
  band: Band;
  /** Métrica observable contable derivada del payload. */
  metric: string;
}

interface RiskEvent {
  id: string;
  severity: "alto" | "medio";
  type: string;
  /** Cita textual o referencia al payload del usuario donde aparece el
   *  risk. Cumple DIAGNOSTICO_1_CASO_V0 línea 239: "Cada uno debe tener
   *  evidencia textual citable del transcript". */
  evidence: string;
  slideRef: string;
}

// Reporte sintético v0 · las bandas y risk events se derivan de los
// payloads reales del store usando heurísticas simples · cumple
// contrato v0 (sin score numérico público · banda como unidad narrativa
// · evidencia textual citable del transcript).
//
// NOTA: este scoring es un PLACEHOLDER hasta que el judge LLM esté
// conectado al runtime productivo. Los thresholds y heurísticas viven
// aquí solo para que la pantalla de cierre responda al comportamiento
// del usuario · no como rúbrica final.

const RECOMMENDATION_DEFAULTS = {
  practice: {
    title: "Verifica antes de enviar",
    duration: "5 minutos",
  },
};

interface ReportSnapshot {
  recommendation: {
    action: "pilotar" | "entrenar" | "pausar" | "escalar";
    title: string;
    oneLiner: string;
  };
  dimensions: DimensionScore[];
  riskEvents: RiskEvent[];
}

/**
 * Computa el reporte del cierre a partir de los payloads del store.
 *
 * Lógica v0 (placeholder hasta que el judge LLM esté wired):
 * - Por cada dimensión, evalúa una o dos slides clave del caso.
 * - Risk events se extraen del payload con cita textual cuando es texto
 *   libre (rationale_text, leader_takeaway, memo), o referencia al
 *   slide cuando es selección.
 */
function buildReportSnapshot(
  payloads: Record<string, ExerciseResponsePayload>,
): ReportSnapshot {
  const dimensions: DimensionScore[] = [];
  const riskEvents: RiskEvent[] = [];

  // ===== CONTEXTO · evalúa si reconoció la presión y la restricción Legal =====
  const acknowledgedLegal = Boolean(
    (payloads["contexto-5"] as Extract<ExerciseResponsePayload, { block_id: "reading_message" }> | undefined)?.acknowledged,
  );
  dimensions.push({
    id: "contexto",
    label: "Contexto",
    band: acknowledgedLegal ? "alto" : "medio",
    metric: acknowledgedLegal
      ? "Leyó el email del manager y el ticket de Legal."
      : "No completó la lectura del contexto.",
  });

  // ===== PRIVACIDAD · evalúa si excluyó/anonimizó contactos sin consentimiento + campos PII =====
  const dataContactsPayload = payloads["datos-2"] as
    | Extract<ExerciseResponsePayload, { block_id: "categorize_rows" }>
    | undefined;
  const dataFieldsPayload = payloads["datos-5"] as
    | Extract<ExerciseResponsePayload, { block_id: "categorize_rows" }>
    | undefined;
  const excludedRevoked = dataContactsPayload?.row_actions.find(
    (r) => r.row_id === "row-5",
  );
  const handledInternalNotes = dataFieldsPayload?.row_actions.find(
    (r) => r.row_id === "campo-6",
  );
  const privacyBand: Band =
    excludedRevoked?.action === "excluir" &&
    (handledInternalNotes?.action === "excluir" ||
      handledInternalNotes?.action === "anonimizar")
      ? "alto"
      : excludedRevoked?.action === "excluir"
        ? "medio"
        : "bajo";
  dimensions.push({
    id: "privacidad",
    label: "Privacidad",
    band: privacyBand,
    metric:
      privacyBand === "alto"
        ? "Excluyó el contacto sin consentimiento y protegió notas internas."
        : privacyBand === "medio"
          ? "Manejo parcial de datos sensibles."
          : "Permitió uso de datos sensibles al modelo.",
  });
  if (handledInternalNotes?.action === "usar") {
    riskEvents.push({
      id: "risk-internal-notes",
      severity: "alto",
      type: "Dato sensible al modelo",
      // Cita textual del payload del usuario · cumple regla v0:
      // "risk_event debe tener evidencia textual citable del transcript".
      evidence: `Marcó "Notas internas" con la acción "${handledInternalNotes.action}" cuando debió excluir o anonimizar.`,
      slideRef: "Datos · 5 / 5",
    });
  }

  // ===== VALIDACIÓN · evalúa si marcó cifras sin fuente en ai_output_review =====
  const reviewCifras = payloads["revision-3"] as
    | Extract<ExerciseResponsePayload, { block_id: "ai_output_review" }>
    | undefined;
  const flaggedCount =
    reviewCifras?.flagged_segments.filter((s) => s.flag !== null).length ?? 0;
  const validacionBand: Band =
    flaggedCount >= 3 ? "alto" : flaggedCount >= 2 ? "medio" : "bajo";
  dimensions.push({
    id: "validacion",
    label: "Validación",
    band: validacionBand,
    metric: `${flaggedCount} de 3 cifras sin fuente marcadas`,
  });
  if (flaggedCount < 3) {
    // Cuenta cuáles segmentos quedaron sin flag (los que el usuario
    // aceptó) · cita los específicos no marcados.
    const missed = reviewCifras?.flagged_segments
      .filter((s) => s.flag === null)
      .map((s) => s.segment_id)
      .join(", ");
    riskEvents.push({
      id: "risk-unverified-claim",
      severity: flaggedCount === 0 ? "alto" : "medio",
      type: "Cifra sin verificar",
      evidence: `Dejó sin marcar ${3 - flaggedCount} de 3 segmentos con cifras sin respaldo (${missed ?? "ninguno marcado"}).`,
      slideRef: "Revisión · 3 / 5",
    });
  }

  // ===== JUICIO · evalúa la decisión principal del cierre =====
  const decisionPayload = payloads["cierre-3"] as
    | Extract<ExerciseResponsePayload, { block_id: "tradeoff_decision_memo" }>
    | undefined;
  const juicioBand: Band =
    decisionPayload?.decision === "piloto_controlado"
      ? "alto"
      : decisionPayload?.decision === "pausar_y_escalar"
        ? "medio"
        : decisionPayload?.decision === "lanzar_lunes"
          ? "bajo"
          : "bajo";
  dimensions.push({
    id: "juicio",
    label: "Juicio",
    band: juicioBand,
    metric:
      decisionPayload?.decision === "piloto_controlado"
        ? "Eligió piloto controlado · proporcional al riesgo."
        : decisionPayload?.decision === "pausar_y_escalar"
          ? "Eligió pausar · postura conservadora defendible."
          : decisionPayload?.decision === "lanzar_lunes"
            ? "Eligió lanzar el lunes · subestima riesgo."
            : "Decisión no registrada.",
  });

  // ===== DECISIÓN · evalúa claridad del memo final =====
  const memoFinal = payloads["cierre-5"] as
    | Extract<ExerciseResponsePayload, { block_id: "tradeoff_decision_memo" }>
    | undefined;
  const memoLength = memoFinal?.memo.trim().length ?? 0;
  const decisionBand: Band =
    memoLength >= 200 ? "alto" : memoLength >= 80 ? "medio" : "bajo";
  dimensions.push({
    id: "decision",
    label: "Decisión",
    band: decisionBand,
    metric:
      memoLength >= 200
        ? "Memo final con contexto y siguiente paso."
        : memoLength >= 80
          ? "Memo corto · falta métrica o siguiente paso."
          : "Memo final vacío o sin justificación.",
  });

  // ===== RECOMENDACIÓN AGREGADA =====
  const recommendation = buildRecommendation(dimensions, riskEvents);

  return { recommendation, dimensions, riskEvents };
}

function buildRecommendation(
  dimensions: DimensionScore[],
  riskEvents: RiskEvent[],
): ReportSnapshot["recommendation"] {
  const altos = dimensions.filter((d) => d.band === "alto").length;
  const bajos = dimensions.filter((d) => d.band === "bajo").length;
  const highRisks = riskEvents.filter((r) => r.severity === "alto").length;

  // Escalar · 2+ risk events alto · el problema no es individual,
  // requiere intervención de Legal/Compliance/Process.
  if (highRisks >= 2) {
    return {
      action: "escalar",
      title: "Escalar a Legal y proceso",
      oneLiner:
        "Múltiples eventos de riesgo alto. El gap no se resuelve con práctica individual · requiere ajuste de proceso.",
    };
  }

  // Pausar · 1 risk alto o muchas dimensiones bajas.
  if (highRisks >= 1 || bajos >= 2) {
    return {
      action: "pausar",
      title: "Pausar antes de pilotar",
      oneLiner:
        "Una o varias dimensiones críticas están débiles. Reforzar antes de operar con datos reales.",
    };
  }

  // Pilotar · todas o casi todas las dimensiones en alto.
  if (altos >= 4) {
    return {
      action: "pilotar",
      title: "Listo para pilotar",
      oneLiner:
        "Criterio sólido en las dimensiones clave. Puede operar con supervisión ligera.",
    };
  }

  // Entrenar · default · gap puntual corregible con práctica.
  return {
    action: "entrenar",
    title: "Entrenar gap específico",
    oneLiner:
      "Criterio sólido en la mayoría, pero hay un patrón a corregir antes de pilotar.",
  };
}

/** Etiqueta de banda · única representación pública del juicio. Cumple
 *  DIAGNOSTICO_1_CASO_V0 línea 233: "Sin score numérico público en v0.
 *  La banda es la unidad narrativa." Sin colores semánticos · la banda
 *  se comunica con un dot intensidad-graduada y la palabra. */
function BandLabel({ band }: { band: Band }) {
  const dots = band === "alto" ? 3 : band === "medio" ? 2 : 1;
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 3 }).map((_, i) => (
          <span
            key={i}
            className={`h-1.5 w-1.5 rounded-full ${
              i < dots ? "bg-[var(--text-primary)]" : "bg-[var(--surface-3)]"
            }`}
          />
        ))}
      </div>
      <span className="ts-callout font-medium capitalize text-[var(--text-primary)] w-14 text-right">
        {band}
      </span>
    </div>
  );
}

function CaseCompletedScreen({ durationMinutes, payloads }: CaseCompletedScreenProps) {
  const snapshot = buildReportSnapshot(payloads);
  const { recommendation, dimensions, riskEvents } = snapshot;
  const highRisks = riskEvents.filter((r) => r.severity === "alto").length;
  // Contar activos completados · más honesto que "25 decisiones".
  const activeCount = Object.values(payloads).filter((p) => {
    if (
      p.block_id === "case_cover" ||
      p.block_id.startsWith("reading_")
    )
      return false;
    return true;
  }).length;

  return (
    <main className="simulador-root flex min-h-screen items-center justify-center surface-canvas text-[var(--text-primary)]">
      <div className="mx-auto w-full max-w-[680px] px-6 py-6">
        {/* HEADER · botón cerrar arriba a la derecha · estilo runtime */}
        <div className="flex justify-end">
          <a
            href="/exercise-lab"
            aria-label="Cerrar"
            className="grid h-9 w-9 place-items-center rounded-[var(--radius-md)] border border-[var(--border)] text-[var(--text-secondary)] transition-colors hover:border-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
              <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </a>
        </div>

        {/* EYEBROW + TÍTULO · estilo runtime · la recomendación ES el título */}
        <div className="mt-3 ts-caption-1 font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
          Reporte para tu manager
        </div>
        <h1 className="mt-2 display display-tight ts-display text-[var(--text-primary)]">
          {recommendation.title}.
        </h1>
        <p className="mt-3 ts-body leading-[1.5] text-[var(--text-secondary)]">
          {recommendation.oneLiner}
        </p>

        {/* Stats inline · separados con · igual que el resto del runtime.
            activeCount refleja slides realmente respondidos (sin contar
            pasivos) en vez de inflar a "25 decisiones". */}
        <div className="mt-2 ts-footnote text-[var(--text-tertiary)] tabular-nums">
          {durationMinutes} min · {activeCount} respuestas · {riskEvents.length}{" "}
          riesgos{highRisks > 0 ? ` · ${highRisks} alto` : ""}
        </div>

        {/* DIMENSIONES · banda como única señal pública (sin score numérico).
            Métrica observable derivada del payload en una línea de contexto. */}
        <div className="mt-6 border-t border-[var(--hairline)]">
          {dimensions.map((d) => (
            <div
              key={d.id}
              className="flex items-center justify-between gap-4 border-b border-[var(--hairline)] py-2.5"
            >
              <div className="min-w-0 flex-1">
                <div className="ts-callout text-[var(--text-primary)]">
                  {d.label}
                </div>
                <div className="mt-0.5 ts-footnote text-[var(--text-tertiary)]">
                  {d.metric}
                </div>
              </div>
              <BandLabel band={d.band} />
            </div>
          ))}
        </div>

        {/* RIESGOS · solo aparece la sección si hay riesgos detectados.
            Cada riesgo trae evidencia derivada del payload del usuario. */}
        {riskEvents.length > 0 && (
          <div className="mt-5">
            <div className="ts-caption-1 font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
              Riesgos detectados
            </div>
            <div className="mt-2 border-t border-[var(--hairline)]">
              {riskEvents.map((r) => (
                <div
                  key={r.id}
                  className="flex items-start justify-between gap-4 border-b border-[var(--hairline)] py-2.5"
                >
                  <div className="min-w-0 flex-1">
                    <div className="ts-callout text-[var(--text-primary)]">
                      {r.type}
                    </div>
                    <div className="mt-0.5 ts-footnote text-[var(--text-tertiary)]">
                      {r.evidence}
                    </div>
                  </div>
                  <span className="ts-footnote capitalize text-[var(--text-tertiary)] tabular-nums whitespace-nowrap">
                    {r.severity} · {r.slideRef}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PRÁCTICA · inline simple */}
        <div className="mt-5">
          <span className="ts-caption-1 font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
            Práctica sugerida
          </span>
          <div className="mt-1 ts-callout text-[var(--text-primary)]">
            {RECOMMENDATION_DEFAULTS.practice.title} ·{" "}
            {RECOMMENDATION_DEFAULTS.practice.duration}
          </div>
        </div>

        {/* CTAs · mismo lenguaje que el botón Continuar del runtime */}
        <div className="mt-7 flex items-center gap-4">
          <a
            href="/exercise-lab"
            className="rounded-[var(--radius-md)] accent-bg px-7 py-3 ts-callout font-medium text-white transition-opacity hover:opacity-90"
          >
            Volver al lab →
          </a>
          <a
            href="/case-demo"
            className="ts-footnote text-[var(--text-secondary)] underline-offset-4 transition-colors hover:text-[var(--text-primary)] hover:underline"
          >
            Repetir el caso
          </a>
        </div>
      </div>
    </main>
  );
}

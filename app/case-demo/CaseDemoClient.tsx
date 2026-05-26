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
import { ExerciseBlockRenderer } from "@/components/simulador/ExerciseBlockRenderer";
import type { ExerciseBlockId } from "@/lib/simulador/exercise-blocks.generated";
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

// Bloques que manejan su propio botón Continuar internamente.
const OWNS_CONTINUE = new Set<ExerciseBlockId>([
  "case_cover",
  "ai_textfield_guided",
  "categorize_rows",
  "ai_comparison",
  "dashboard_pivot",
]);

// ============================================================
// TIPO Slide
// ============================================================

interface Slide {
  blockId: ExerciseBlockId;
  title: string;
  body: string;
  caseContext?: Record<string, unknown>;
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
            { contacto: "Carlos Méndez", empresa: "Cresta Software", cargo: "DIR MKT", ultima_apertura: "Hace 60 días", estatus: "Inactiva" },
            { contacto: "Lucía Soto", empresa: "Delta Logistics", cargo: "Gerente comercial", ultima_apertura: "Hace 5 días", estatus: "Activa" },
          ],
        },
      },
    },
    // Slot 4: reading_kpi_cards · métricas de la última campaña
    {
      blockId: "reading_kpi_cards",
      title: "Cómo va la cuenta hasta hoy.",
      body: "Métricas de la **última campaña** que enviaste hace un mes.",
      caseContext: {
        kpis: [
          { value: "23.4%", label: "Tasa de apertura", delta: { value: "-4.2 pp", direction: "down" } },
          { value: "3.1%", label: "Conversión a demo", delta: { value: "+0.6 pp", direction: "up" } },
          { value: "12", label: "Quejas por privacidad", delta: { value: "+8", direction: "down" } },
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
            { contacto: "Carlos Méndez", empresa: "Cresta Software", problema: "Cargo raro: DIR MKT", consentimiento: "Vigente" },
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
          { id: "row-4", label: "Carlos Méndez · Cresta Software", example: "Cargo raro DIR MKT", hint: "Necesita normalización a Director de Marketing" },
          { id: "row-5", label: "Ana Pérez · Eclipse Health", example: "Pidió baja hace 2 meses", hint: "Consentimiento revocado · regla dura" },
          { id: "row-6", label: "Pedro Castillo · Foro Studio", example: "Email rebota desde hace 4 envíos", hint: "Hard bounce repetido" },
          { id: "row-7", label: "(sin nombre) · Gama Capital", example: "Sin nombre", hint: "Email personal sofia.lara@gmail.example" },
          { id: "row-8", label: "Sofía Lara · Helix Bio", example: "Cargo vacío", hint: "Solo nombre y empresa" },
        ],
      },
    },
    // Slot 3: categorize_rows · clasificar campos
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
    // Slot 4: reading_attachment · política de datos
    {
      blockId: "reading_attachment",
      title: "Política de datos vigente.",
      body: "Lee antes de seguir. El documento define **qué se puede usar** con modelos externos y **qué requiere aprobación** legal.",
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
    // Slot 5: categorize_rows · clasificar segmentos
    {
      blockId: "categorize_rows",
      title: "Decide qué segmentos incluyes en el envío.",
      body: "Cuatro segmentos posibles para el lunes. Cada uno tiene un **tradeoff entre alcance y calidad de respuesta**.",
      caseContext: {
        actionStyle: "neutral",
        actions: [
          { value: "enviar", label: "Enviar" },
          { value: "validar", label: "Validar" },
          { value: "excluir", label: "Excluir" },
          { value: "posponer", label: "Posponer" },
        ],
        rows: [
          { id: "seg-1", label: "Activos recientes", example: "Abrieron en los últimos 14 días", hint: "Mayor probabilidad de conversión" },
          { id: "seg-2", label: "Dormidos", example: "Sin apertura entre 30 y 90 días", hint: "Necesitan mensaje de re-enganche" },
          { id: "seg-3", label: "Inactivos", example: "Sin apertura hace más de 90 días", hint: "Riesgo de quejas por privacidad" },
          { id: "seg-4", label: "Nuevos sin engagement", example: "Suscritos hace menos de 30 días, sin apertura", hint: "Pueden marcar como spam" },
        ],
      },
    },
  ],

  // ============================================================
  // SECCIÓN 3 · IA (5 activos)
  // ============================================================
  [
    // Slot 1: ai_textfield_guided · construir el prompt principal
    {
      blockId: "ai_textfield_guided",
      title: "Construye el prompt principal.",
      body: "Vas a generar el **mensaje base** del envío con un modelo. Elige objetivo, audiencia y límites antes de revisar el prompt construido.",
    },
    // Slot 2: ai_textfield_free · versión alterna libre
    {
      blockId: "ai_textfield_free",
      title: "Versión alterna · prompt libre.",
      body: "Escribe una **segunda versión** del prompt para comparar. Aquí no hay andamiaje. La IA va a recibir lo que escribas tal cual.",
    },
    // Slot 3: model_tradeoff_sliders · ponderar modelo
    {
      blockId: "model_tradeoff_sliders",
      title: "Pondera para elegir el modelo del envío.",
      body: "Tres prioridades del caso. Mueve los sliders y revisa el **modelo recomendado**. La elección impacta autonomía, seguridad de datos y costo por envío.",
    },
    // Slot 4: ai_textfield_free · validar segmentación
    {
      blockId: "ai_textfield_free",
      title: "Pide validación de segmentación al modelo.",
      body: "Antes de generar el mensaje, **pídele al modelo** que valide tu plan de segmentos. Escribe un prompt corto para que te diga si tu plan tiene huecos.",
    },
    // Slot 5: ai_output_review · primer borrador
    {
      blockId: "ai_output_review",
      title: "Revisa el primer borrador del mensaje.",
      body: "El modelo generó esta primera versión. **Marca lo que no usarías tal cual** antes de continuar a la revisión profunda.",
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
    },
    // Slot 2: ai_comparison · elegir cierre del mensaje
    {
      blockId: "ai_comparison",
      title: "Elige el llamado a la acción.",
      body: "Cuatro versiones del **cierre del mensaje**. Cada una tiene un tradeoff entre directness y permission.",
    },
    // Slot 3: ai_output_review · cifras sin fuente
    {
      blockId: "ai_output_review",
      title: "Datos que el modelo afirmó sin fuente.",
      body: "El modelo metió **cifras** en el borrador. Marca las que no podrías sostener si te las cuestionan.",
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
    },
    // Slot 4: reading_message · vista previa del email
    {
      blockId: "reading_message",
      title: "Vista previa del email final.",
      body: "Así se vería en la bandeja del contacto. **Última oportunidad** para detectar algo antes del envío real.",
      caseContext: {
        message: {
          channel: "email",
          from: { name: "Aurora Retail · Marketing", role: "marketing@aurora.example" },
          to: { name: "Lista del segmento elegido" },
          timestamp: "Lunes, 08:00",
          subject: "Una idea concreta para tu equipo este trimestre",
          body: "Mariana, vi que **Aurora Retail abrió oficina en Monterrey**. Trabajamos con equipos de Marketing en empresas medianas de retail. Si quieres ver cómo lo aplicaríamos a tu caso, agendamos una llamada cuando te acomode. Te dejo **dos horarios la próxima semana**, dime cuál te sirve.",
        },
      },
    },
    // Slot 5: tradeoff_decision_memo · memo final corto
    {
      blockId: "tradeoff_decision_memo",
      title: "Memo final · resumen para Mariana.",
      body: "Cierre del caso. **Tres líneas máximo** para que Mariana entienda tu decisión en 30 segundos.",
    },
  ],
];

// ============================================================
// COMPONENTE
// ============================================================

export function CaseDemoClient() {
  const [sectionIdx, setSectionIdx] = useState(0);
  const [slideIdx, setSlideIdx] = useState(0);

  const slide = SLIDES[sectionIdx]?.[slideIdx];
  const ownsContinue = slide ? OWNS_CONTINUE.has(slide.blockId) : false;

  const goNext = useCallback(() => {
    if (slideIdx < SLIDES_PER_SECTION - 1) {
      setSlideIdx(slideIdx + 1);
    } else if (sectionIdx < SECTIONS.length - 1) {
      setSectionIdx(sectionIdx + 1);
      setSlideIdx(0);
    }
    // Si está en la última slide de la última sección, no hace nada
    // (idealmente mostraría una pantalla de "completado" · out of scope)
  }, [sectionIdx, slideIdx]);

  // Scroll al top al cambiar de slide
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [sectionIdx, slideIdx]);

  // Enter para continuar (solo si no es un bloque que owns continue)
  useEffect(() => {
    if (ownsContinue) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Enter" && !e.shiftKey && !e.metaKey && !e.ctrlKey) {
        const target = e.target as HTMLElement;
        // No interferir si está escribiendo en textarea o input
        if (target.tagName === "TEXTAREA" || target.tagName === "INPUT") return;
        e.preventDefault();
        goNext();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goNext, ownsContinue]);

  if (!slide) return null;

  const isLastSlide =
    sectionIdx === SECTIONS.length - 1 && slideIdx === SLIDES_PER_SECTION - 1;

  return (
    <main className="simulador-root min-h-screen surface-canvas text-[var(--text-primary)]">
      <div className="grid min-h-screen grid-cols-[240px_1fr]">
        {/* SIDEBAR · 5 secciones */}
        <aside className="bg-[var(--surface)] px-6 py-12">
          <nav className="flex flex-col gap-1">
            {SECTIONS.map((section, idx) => {
              const isActive = idx === sectionIdx;
              const isPast = idx < sectionIdx;
              return (
                <div
                  key={section.id}
                  aria-current={isActive ? "step" : undefined}
                  className={`group flex items-center gap-3 py-2 ts-subhead transition-colors ${
                    isActive
                      ? "text-[var(--text-primary)] font-medium"
                      : isPast
                        ? "text-[var(--text-secondary)]"
                        : "text-[var(--text-tertiary)]"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 flex-shrink-0 rounded-full transition-colors ${
                      isActive
                        ? "bg-[var(--accent)]"
                        : isPast
                          ? "bg-[var(--text-tertiary)]"
                          : "border border-[var(--border)] bg-transparent"
                    }`}
                  />
                  <span>{section.name}</span>
                </div>
              );
            })}
          </nav>
        </aside>

        {/* CENTRO */}
        <div className="flex flex-col">
          {/* TOP · progress 5 segmentos */}
          <div className="pt-8 pb-6">
            <div className="mx-auto w-[65%] max-w-[1200px]">
              <div
                role="progressbar"
                aria-label={`Diapositiva ${slideIdx + 1} de ${SLIDES_PER_SECTION}`}
                aria-valuemin={1}
                aria-valuemax={SLIDES_PER_SECTION}
                aria-valuenow={slideIdx + 1}
                className="flex w-full gap-2"
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
            </div>
          </div>

          {/* CONTENIDO · título + body + ejercicio + continuar */}
          <section className="flex flex-1 items-start justify-center py-10">
            <div className="w-[65%] max-w-[1200px]">
              {/* Eyebrow · sección + slide */}
              <div className="ts-caption-1 font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
                {SECTIONS[sectionIdx].name} · {slideIdx + 1} de {SLIDES_PER_SECTION}
              </div>

              {/* Título */}
              <h1 className="mt-3 display display-tight ts-display text-[var(--text-primary)]">
                {slide.title}
              </h1>

              {/* Body markdown */}
              <SlideBody className="mt-4">{slide.body}</SlideBody>

              {/* Ejercicio */}
              <div className="mt-8">
                <ExerciseBlockRenderer
                  blockId={slide.blockId}
                  sessionId={null}
                  mode="lab_demo"
                  slideId={`${SECTIONS[sectionIdx].id}-${slideIdx + 1}`}
                  caseContext={slide.caseContext}
                  onShellContinue={goNext}
                />
              </div>

              {/* Continuar · solo si el bloque no maneja su propio CTA */}
              {!ownsContinue && (
                <div className="mt-10 flex items-center gap-4">
                  <button
                    type="button"
                    onClick={goNext}
                    disabled={isLastSlide}
                    className={`rounded-[var(--radius-md)] px-7 py-3 ts-callout font-medium text-white transition-opacity ${
                      isLastSlide
                        ? "bg-[var(--surface-3)] text-[var(--text-disabled)] cursor-not-allowed"
                        : "accent-bg hover:opacity-90"
                    }`}
                  >
                    {isLastSlide ? "Caso completado" : "Continuar →"}
                  </button>
                  {!isLastSlide && (
                    <span className="ts-footnote text-[var(--text-tertiary)]">
                      o pulsa{" "}
                      <kbd className="rounded border border-[var(--border)] bg-[var(--surface-2)] px-1.5 py-0.5 ts-caption-2 font-medium text-[var(--text-secondary)]">
                        Enter ↵
                      </kbd>
                    </span>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

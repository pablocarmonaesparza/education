"use client";

/**
 * /design/components — Catálogo central de componentes del Simulador.
 *
 * Hermana de /design (que edita los TOKENS en vivo). Aquí se renderiza CADA
 * componente Apple en todas sus variantes y estados, leyendo de la fuente
 * central (components/simulador/apple/*). Editas el archivo del componente →
 * cambia aquí y en TODO el sitio. Editas un token en /design → cambia aquí
 * también (el DesignOverridesInjector aplica a esta superficie).
 *
 * Es el lugar para revisar un componente contra el HIG (ver skill
 * /componente-hig): se ve en claro y oscuro, todas sus variantes juntas.
 *
 * No requiere auth — vive como /dev.
 */

import { useState } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { SelectItem } from "@heroui/react";
import "../../(app)/simulador.css";
import {
  AppleActionChip,
  AppleAttachmentCard,
  AppleBadge,
  AppleBrowserFrame,
  AppleButton,
  AppleButtonLink,
  AppleCard,
  AppleCardBody,
  AppleCardFooter,
  AppleCardHeader,
  AppleCaseHeader,
  AppleCheckbox,
  AppleCheckRow,
  AppleDataTable,
  AppleDivider,
  AppleEmptyState,
  AppleErrorState,
  AppleEyebrowChip,
  AppleIcon,
  AppleInput,
  AppleKpiCard,
  AppleLink,
  AppleLogoMark,
  AppleMessageCard,
  AppleModal,
  AppleModalBody,
  AppleModalContent,
  AppleModalFooter,
  AppleModalHeader,
  AppleProgress,
  AppleReveal,
  AppleSelect,
  AppleSidebar,
  AppleSkeleton,
  AppleSlideButton,
  AppleSortableList,
  AppleStatTile,
  AppleStepBar,
  AppleStepDots,
  AppleSwitch,
  AppleTabs,
  AppleTextarea,
  AppleTimeline,
  AppleToast,
  ChoiceButton,
  CompareCard,
  GuidedSlideOptions,
  Range10,
  type AppleDataTableColumn,
  type AppleKpiCardProps,
  type AppleSidebarItem,
  type AppleStepDot,
  type AppleTabItem,
  type AppleTimelineEvent,
} from "@/components/simulador/apple";
import { exerciseBlocks } from "@/lib/simulador/exercise-blocks.generated";
import { ExerciseBlockRenderer } from "@/components/simulador/ExerciseBlockRenderer";
import { InviteTeamModal } from "@/components/simulador/InviteTeamModal";
import { DesignHubNav } from "../DesignHubNav";
import { BlockBoundary } from "./BlockBoundary";

// ============================================================================
// Layout helpers — la galería usa los mismos tokens que muestra
// ============================================================================

function Section({
  name,
  purpose,
  importName,
  children,
}: {
  name: string;
  purpose: string;
  importName: string;
  children: React.ReactNode;
}) {
  return (
    <section className="scroll-mt-24" id={name.toLowerCase()}>
      <div className="mb-4 border-b border-[var(--hairline)] pb-3">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h2 className="ts-headline font-semibold text-[var(--text-primary)]">
            {name}
          </h2>
          <code className="ts-footnote font-mono text-[var(--text-tertiary)]">
            {importName}
          </code>
        </div>
        <p className="mt-1 ts-subhead text-[var(--text-secondary)]">{purpose}</p>
      </div>
      <div className="flex flex-wrap items-start gap-x-8 gap-y-6">{children}</div>
    </section>
  );
}

function Spec({
  label,
  children,
  wide,
}: {
  label: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "w-full max-w-[360px]" : ""}>
      <div className="ts-caption-1 mb-2 font-medium text-[var(--text-tertiary)]">
        {label}
      </div>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

// ============================================================================
// Demos interactivos (estado controlado)
// ============================================================================

function CheckboxDemo() {
  const [a, setA] = useState(false);
  const [b, setB] = useState(true);
  return (
    <>
      <Spec label="estados" wide>
        <AppleCheckbox isSelected={a} onValueChange={setA}>
          Opción sin marcar
        </AppleCheckbox>
        <AppleCheckbox isSelected={b} onValueChange={setB}>
          Opción marcada
        </AppleCheckbox>
        <AppleCheckbox isDisabled>Deshabilitado</AppleCheckbox>
      </Spec>
      <Spec label="con link legal (muted)" wide>
        <AppleTermsDemo />
      </Spec>
    </>
  );
}

function AppleTermsDemo() {
  const [ok, setOk] = useState(false);
  return (
    <AppleCheckbox isSelected={ok} onValueChange={setOk}>
      Acepto los{" "}
      <AppleLink muted href="/terms" onClick={(e) => e.stopPropagation()}>
        términos
      </AppleLink>{" "}
      y la{" "}
      <AppleLink muted href="/privacy" onClick={(e) => e.stopPropagation()}>
        política de privacidad
      </AppleLink>
      .
    </AppleCheckbox>
  );
}

function InputsDemo() {
  const [v, setV] = useState("");
  const [t, setT] = useState("");
  return (
    <>
      <Spec label="input" wide>
        <AppleInput
          label="Email"
          placeholder="email@empresa.com"
          value={v}
          onValueChange={setV}
        />
      </Spec>
      <Spec label="requerido" wide>
        <AppleInput label="Nombre" placeholder="Tu nombre" isRequired />
      </Spec>
      <Spec label="error" wide>
        <AppleInput
          label="Email"
          placeholder="email@empresa.com"
          isInvalid
          errorMessage="Email inválido."
        />
      </Spec>
      <Spec label="disabled" wide>
        <AppleInput label="Bloqueado" placeholder="No editable" isDisabled />
      </Spec>
      <Spec label="textarea" wide>
        <AppleTextarea
          label="Comentario"
          placeholder="Escribe tu mensaje"
          value={t}
          onValueChange={setT}
        />
      </Spec>
    </>
  );
}

function SelectDemo() {
  const [sel, setSel] = useState<Set<string>>(new Set());
  return (
    <>
      <Spec label="select" wide>
        <AppleSelect
          label="País"
          placeholder="Selecciona un país"
          selectedKeys={sel}
          onSelectionChange={(keys) => setSel(keys as Set<string>)}
        >
          <SelectItem key="mx">México</SelectItem>
          <SelectItem key="us">Estados Unidos</SelectItem>
          <SelectItem key="cl">Chile</SelectItem>
        </AppleSelect>
      </Spec>
      <Spec label="error" wide>
        <AppleSelect
          label="Rol"
          placeholder="Selecciona un rol"
          isInvalid
          errorMessage="Este campo es requerido."
        >
          <SelectItem key="admin">Administrador</SelectItem>
          <SelectItem key="user">Usuario</SelectItem>
        </AppleSelect>
      </Spec>
    </>
  );
}

function SwitchDemo() {
  const [on, setOn] = useState(true);
  const [off, setOff] = useState(false);
  return (
    <>
      <Spec label="estados">
        <AppleSwitch
          isSelected={on}
          onValueChange={setOn}
          aria-label="Activado"
        />
        <AppleSwitch
          isSelected={off}
          onValueChange={setOff}
          aria-label="Desactivado"
        />
        <AppleSwitch isSelected isDisabled aria-label="Deshabilitado activo" />
        <AppleSwitch isDisabled aria-label="Deshabilitado" />
      </Spec>
      <Spec label="en fila de ajuste" wide>
        <div className="flex w-full items-center justify-between">
          <span className="ts-subhead text-[var(--text-primary)]">
            Notificaciones por email
          </span>
          <AppleSwitch
            isSelected={on}
            onValueChange={setOn}
            aria-label="Notificaciones por email"
          />
        </div>
      </Spec>
    </>
  );
}

function ExercisePrimitivesDemo() {
  const [choice, setChoice] = useState("a");
  const [guided, setGuided] = useState("Resumir el hilo");
  const [weight, setWeight] = useState(50);
  const [variant, setVariant] = useState<"a" | "b">("a");
  return (
    <>
      <Spec label="ChoiceButton (selección simple)" wide>
        {["a", "b", "c"].map((k) => (
          <ChoiceButton
            key={k}
            selected={choice === k}
            onClick={() => setChoice(k)}
          >
            Opción {k.toUpperCase()}
          </ChoiceButton>
        ))}
      </Spec>
      <Spec label="GuidedSlideOptions (radio guiado)" wide>
        <GuidedSlideOptions
          options={["Resumir el hilo", "Extraer pendientes", "Redactar respuesta"]}
          value={guided}
          onChange={setGuided}
        />
      </Spec>
      <Spec label="Range10 (slider 0–100)" wide>
        <Range10 label="Calidad" value={weight} onChange={setWeight} />
      </Spec>
      <Spec label="CompareCard (comparación A/B)" wide>
        <div className="grid w-full grid-cols-2 gap-3">
          <CompareCard
            selected={variant === "a"}
            onClick={() => setVariant("a")}
            title="Versión A"
            body="Tono directo, una sola pregunta de cierre."
          />
          <CompareCard
            selected={variant === "b"}
            onClick={() => setVariant("b")}
            title="Versión B"
            body="Tono cálido, dos opciones de seguimiento."
          />
        </div>
      </Spec>
    </>
  );
}

function SortableListDemo() {
  const [items, setItems] = useState([
    { id: "1", label: "Leer el correo del cliente" },
    { id: "2", label: "Resumir el problema" },
    { id: "3", label: "Proponer una solución" },
    { id: "4", label: "Pedir aprobación" },
  ]);
  return (
    <Spec label="arrastra el handle ≡ para reordenar" wide>
      <div className="w-full">
        <AppleSortableList
          items={items}
          getItemKey={(it) => it.id}
          onReorder={setItems}
          renderItem={(it, idx, handle) => (
            <div className="flex items-center gap-2 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5">
              {handle}
              <span className="grid h-6 w-6 place-items-center rounded-full bg-[var(--surface-3)] ts-caption-2 font-semibold text-[var(--text-secondary)]">
                {idx + 1}
              </span>
              <span className="ts-subhead text-[var(--text-primary)]">
                {it.label}
              </span>
            </div>
          )}
        />
      </div>
    </Spec>
  );
}

function TabsDemo() {
  const [tab, setTab] = useState("desc");
  const items: AppleTabItem[] = [
    { id: "desc", label: "Descripción" },
    { id: "specs", label: "Especificaciones", badge: 3 },
    { id: "reviews", label: "Reseñas", badge: 12 },
  ];
  return (
    <Spec label="tabs (con badge)" wide>
      <AppleTabs
        items={items}
        value={tab}
        onChange={setTab}
        ariaLabel="Secciones de ejemplo"
      />
    </Spec>
  );
}

function ModalDemo() {
  const [open, setOpen] = useState(false);
  return (
    <Spec label="modal (trigger)">
      <AppleButton tone="secondary" onPress={() => setOpen(true)}>
        Abrir modal
      </AppleButton>
      <AppleModal isOpen={open} onOpenChange={setOpen}>
        <AppleModalContent>
          <AppleModalHeader className="flex flex-col gap-1">
            <h3 className="ts-headline font-semibold">Título del modal</h3>
            <p className="ts-subhead text-[var(--text-secondary)]">
              Descripción breve de la acción.
            </p>
          </AppleModalHeader>
          <AppleModalBody>
            <p className="ts-body text-[var(--text-secondary)]">
              Contenido principal del modal.
            </p>
          </AppleModalBody>
          <AppleModalFooter>
            <AppleButton tone="ghost" onPress={() => setOpen(false)}>
              Cancelar
            </AppleButton>
            <AppleButton tone="primary" onPress={() => setOpen(false)}>
              Confirmar
            </AppleButton>
          </AppleModalFooter>
        </AppleModalContent>
      </AppleModal>
    </Spec>
  );
}

function InviteTeamModalDemo() {
  const [open, setOpen] = useState(false);
  // orgId de demo: el POST fallará con 401/403 aquí (galería sin auth) — lo
  // que se revisa en el espejo es el flujo visual, no el envío real.
  return (
    <Spec label="flujo completo (trigger)">
      <AppleButton tone="secondary" onPress={() => setOpen(true)}>
        Invite people
      </AppleButton>
      <InviteTeamModal
        isOpen={open}
        onOpenChange={setOpen}
        orgId="00000000-0000-0000-0000-000000000000"
      />
    </Spec>
  );
}

function ActionChipDemo() {
  const [neutral, setNeutral] = useState("resumir");
  const [permission, setPermission] = useState("revisar");
  const [severity, setSeverity] = useState("escalar");
  return (
    <>
      <Spec label="neutral (acento)" wide>
        {[
          { value: "resumir", label: "Resumir" },
          { value: "extraer", label: "Extraer datos" },
          { value: "responder", label: "Responder" },
        ].map((c) => (
          <AppleActionChip
            key={c.value}
            label={c.label}
            value={c.value}
            selected={neutral === c.value}
            onClick={() => setNeutral(c.value)}
          />
        ))}
      </Spec>
      <Spec label="permission (verde / acento / rojo)" wide>
        {[
          { value: "permitir", label: "Permitir" },
          { value: "revisar", label: "Revisar" },
          { value: "bloquear", label: "Bloquear" },
        ].map((c) => (
          <AppleActionChip
            key={c.value}
            label={c.label}
            value={c.value}
            style="permission"
            selected={permission === c.value}
            onClick={() => setPermission(c.value)}
          />
        ))}
      </Spec>
      <Spec label="severity (rojo / acento / verde)" wide>
        {[
          { value: "riesgo", label: "Riesgo" },
          { value: "escalar", label: "Escalar" },
          { value: "normal", label: "Normal" },
        ].map((c) => (
          <AppleActionChip
            key={c.value}
            label={c.label}
            value={c.value}
            style="severity"
            selected={severity === c.value}
            onClick={() => setSeverity(c.value)}
          />
        ))}
      </Spec>
    </>
  );
}

function CaseHeaderDemo() {
  const total = 6;
  const [current, setCurrent] = useState(2);
  return (
    <Spec label="chrome del player (Cerrar · Atrás · barra · Adelante · feedback)" wide>
      <div className="w-full overflow-hidden rounded-[var(--radius-lg)] border border-[var(--hairline)] bg-[var(--surface)]">
        <AppleCaseHeader
          total={total}
          current={current}
          ariaLabel="Progreso del caso"
          onClose={() => undefined}
          onPrev={() => setCurrent((c) => Math.max(0, c - 1))}
          prevDisabled={current === 0}
          onNext={() => setCurrent((c) => Math.min(total - 1, c + 1))}
          nextDisabled={current === total - 1}
          onFeedback={() => undefined}
        />
      </div>
    </Spec>
  );
}

// ============================================================================
// Página
// ============================================================================

const KPI_DATA: { label: string; value: string; delta?: AppleKpiCardProps["delta"] }[] = [
  { label: "MRR", value: "$48.2K", delta: { value: "+12.4% vs. mes anterior", direction: "up" } },
  { label: "Churn mensual", value: "3.1%", delta: { value: "−0.6 pts", direction: "down" } },
  { label: "Cuentas activas", value: "1,284", delta: { value: "sin cambio", direction: "flat" } },
];

const TABLE_COLUMNS: AppleDataTableColumn[] = [
  { key: "region", label: "Región" },
  { key: "cuentas", label: "Cuentas", align: "right" },
  { key: "ingreso", label: "Ingreso", align: "right" },
  { key: "churn", label: "Churn", align: "right" },
];

const TABLE_ROWS: Array<Record<string, string | number>> = [
  { region: "México", cuentas: 512, ingreso: "$21.4K", churn: "2.8%" },
  { region: "Colombia", cuentas: 318, ingreso: "$12.1K", churn: "3.4%" },
  { region: "Chile", cuentas: 244, ingreso: "$9.7K", churn: "2.1%" },
  { region: "Perú", cuentas: 210, ingreso: "$5.0K", churn: "4.0%" },
];

const TIMELINE_EVENTS: AppleTimelineEvent[] = [
  { when: "09:12", what: "El cliente abre un ticket por cargos duplicados.", who: "Soporte N1" },
  { when: "09:40", what: "Se confirma el doble cobro en el log de pagos.", who: "Finanzas" },
  { when: "10:05", what: "Se emite el reembolso y se notifica al cliente.", who: "Soporte N2" },
  {
    when: "10:30",
    what: "El cliente confirma la resolución y cierra el ticket.",
    who: "Cliente",
    emphasis: true,
  },
];

const SIDEBAR_ITEMS: AppleSidebarItem[] = [
  { href: "/dashboard", label: "Panel", icon: "home" },
  { href: "/casos", label: "Casos", icon: "briefcase", badge: 3 },
  { href: "/reportes", label: "Reportes", icon: "chart" },
  { href: "/equipo", label: "Equipo", icon: "users" },
  { href: "/perfil", label: "Perfil", icon: "user" },
];

const STEP_DOTS: AppleStepDot[] = [
  { id: "1", label: "Información", status: "completed" },
  { id: "2", label: "Verificación", status: "current" },
  { id: "3", label: "Confirmación", status: "pending" },
  { id: "4", label: "Bienvenida", status: "locked" },
];

export default function ComponentsGalleryPage() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="simulador-root min-h-screen bg-[var(--surface-2)] text-[var(--text-primary)]">
      <DesignHubNav />
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-[var(--hairline)] bg-[var(--surface)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1000px] items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-baseline gap-3">
            <h1 className="ts-body-lg font-semibold">Componentes</h1>
            <span className="ts-footnote text-[var(--text-tertiary)]">
              fuente única · editas el archivo, cambia en todo el sitio
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/design"
              className="ts-subhead rounded-[var(--radius-md)] border border-[var(--border)] px-3 py-1.5 text-[var(--text-secondary)] transition-colors hover:border-[var(--border-strong)]"
            >
              Tokens →
            </Link>
            <button
              type="button"
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className="ts-subhead rounded-[var(--radius-md)] border border-[var(--border)] px-3 py-1.5 text-[var(--text-secondary)] transition-colors hover:border-[var(--border-strong)]"
            >
              {isDark ? "☀ Claro" : "☾ Oscuro"}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1000px] space-y-14 px-6 py-12">
        {/* ---- Foundations ---- */}
        <Section
          name="Icon"
          importName="AppleIcon"
          purpose="Iconos Tabler escalables. 5 tamaños (xs–xl)."
        >
          <Spec label="tamaños">
            <AppleIcon name="check" size="xs" />
            <AppleIcon name="check" size="sm" />
            <AppleIcon name="check" size="md" />
            <AppleIcon name="check" size="lg" />
            <AppleIcon name="check" size="xl" />
          </Spec>
          <Spec label="muestra">
            <AppleIcon name="alert" size="md" />
            <AppleIcon name="search" size="md" />
            <AppleIcon name="settings" size="md" />
            <AppleIcon name="user" size="md" />
            <AppleIcon name="bell" size="md" />
            <AppleIcon name="sparkles" size="md" />
            <AppleIcon name="chevronRight" size="md" />
            <AppleIcon name="shield" size="md" />
          </Spec>
        </Section>

        <Section
          name="Badge"
          importName="AppleBadge"
          purpose="Etiqueta pequeña con tonos semánticos."
        >
          <Spec label="tonos">
            <AppleBadge tone="neutral">Neutral</AppleBadge>
            <AppleBadge tone="accent">Accent</AppleBadge>
            <AppleBadge tone="success">Success</AppleBadge>
            <AppleBadge tone="warning">Warning</AppleBadge>
            <AppleBadge tone="danger">Danger</AppleBadge>
          </Spec>
        </Section>

        <Section
          name="Link"
          importName="AppleLink"
          purpose="Link inline que hereda el tamaño del texto. Default acento; muted gris+subrayado para fine-print."
        >
          <Spec label="default (acento)" wide>
            <p className="ts-body text-[var(--text-secondary)]">
              Lee nuestros{" "}
              <AppleLink href="/terms">términos de servicio</AppleLink>.
            </p>
          </Spec>
          <Spec label="muted (fine-print)" wide>
            <p className="ts-footnote text-[var(--text-secondary)]">
              <AppleLink muted href="/privacy">
                privacidad
              </AppleLink>{" "}
              ·{" "}
              <AppleLink muted href="/terms">
                términos
              </AppleLink>
            </p>
          </Spec>
        </Section>

        <Section
          name="Divider"
          importName="AppleDivider"
          purpose="Separador hairline de 1px (token --hairline). Agrupa con whitespace primero; el divider es la línea sutil cuando de verdad hace falta — nunca un contorno por sección."
        >
          <Spec label="horizontal" wide>
            <div className="w-full">
              <p className="ts-subhead text-[var(--text-secondary)]">Sección A</p>
              <AppleDivider className="my-3" />
              <p className="ts-subhead text-[var(--text-secondary)]">Sección B</p>
            </div>
          </Spec>
          <Spec label="vertical">
            <div className="flex h-6 items-center gap-3">
              <span className="ts-subhead text-[var(--text-secondary)]">Uno</span>
              <AppleDivider orientation="vertical" />
              <span className="ts-subhead text-[var(--text-secondary)]">Dos</span>
            </div>
          </Spec>
        </Section>

        <Section
          name="Reveal (entrada)"
          importName="AppleReveal"
          purpose="Animación de entrada del sistema (fade + subida ~450ms, easing Apple). Solo aparición, respeta prefers-reduced-motion. Envuelve secciones de las páginas del empleado."
        >
          <Spec label="ejemplo" wide>
            <AppleReveal className="w-full rounded-[var(--radius-md)] bg-[var(--surface-2)] p-4">
              <p className="ts-subhead text-[var(--text-secondary)]">
                Este bloque aparece con fade + subida al montar.
              </p>
            </AppleReveal>
          </Spec>
        </Section>

        {/* ---- Marca / marketing (promovidos de la landing v2) ---- */}
        <Section
          name="Logo mark"
          importName="AppleLogoMark"
          purpose="El isotipo de itera: tile accent con labio 3D (--shadow-lip) y glyph de nodos en blanco. Prop size en px del tile (default 38); el glyph escala al 53%. Lo consumen nav, footer y cualquier superficie de marca."
        >
          <Spec label="tamaños (size)">
            <AppleLogoMark size={28} />
            <AppleLogoMark />
            <AppleLogoMark size={56} />
          </Spec>
          <Spec label="con wordmark">
            <div className="flex items-center gap-2.5">
              <AppleLogoMark size={34} />
              <span className="ts-headline font-extrabold text-[var(--text-primary)]">
                itera
              </span>
            </div>
          </Spec>
        </Section>

        <Section
          name="Eyebrow chip"
          importName="AppleEyebrowChip"
          purpose="Pill de eyebrow sobre un hero/sección: borde --accent-border, fondo --accent-soft, extrabold con tracking y dot de status verde opcional (default true). Es inline-flex: en un contenedor flex-col pásale self-start."
        >
          <Spec label="con dot (default)">
            <AppleEyebrowChip>AI FLUENCY FOR OPS TEAMS</AppleEyebrowChip>
          </Spec>
          <Spec label="sin dot">
            <AppleEyebrowChip dot={false}>MANAGER VIEW</AppleEyebrowChip>
          </Spec>
        </Section>

        <Section
          name="Check row"
          importName="AppleCheckRow"
          purpose="Fila de checklist de marketing: tile accent de 24px con palomita gruesa (stroke 4) + texto callout bold. El texto hereda el color del contenedor — funciona sobre surface y sobre bandas oscuras sin props extra."
        >
          <Spec label="sobre surface" wide>
            <div className="flex w-full flex-col gap-3">
              <AppleCheckRow>Real cases, not quizzes</AppleCheckRow>
              <AppleCheckRow>Scored against a rubric</AppleCheckRow>
              <AppleCheckRow>Managers see the gaps</AppleCheckRow>
            </div>
          </Spec>
          <Spec label="sobre banda ink (hereda el blanco)" wide>
            <div className="flex w-full flex-col gap-3 rounded-[var(--radius-lg)] bg-[var(--ink-band)] p-5 text-white">
              <AppleCheckRow>Works on dark bands</AppleCheckRow>
              <AppleCheckRow>No extra props needed</AppleCheckRow>
            </div>
          </Spec>
        </Section>

        <Section
          name="Stat tile"
          importName="AppleStatTile"
          purpose="Stat de marketing: valor display extrabold + label bold. tone on-surface (default) o on-accent (blanco + label al 80%, para bandas accent/ink). Hermano de marketing de AppleKpiCard (tarjeta de dashboard con delta) — NO lo reemplaza."
        >
          <Spec label="on-surface (default)" wide>
            <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-3">
              <AppleStatTile value="15 min" label="per case, not hours" />
              <AppleStatTile value="6" label="skill areas measured" />
              <AppleStatTile value="1" label="score per person" />
            </div>
          </Spec>
          <Spec label="on-accent (stats band)" wide>
            <div className="grid w-full grid-cols-1 gap-6 rounded-[var(--radius-xl)] bg-[var(--accent-strong)] p-6 sm:grid-cols-3">
              <AppleStatTile tone="on-accent" value="15 min" label="per case" />
              <AppleStatTile tone="on-accent" value="6" label="skill areas" />
              <AppleStatTile tone="on-accent" value="1" label="score per person" />
            </div>
          </Spec>
        </Section>

        <Section
          name="Browser frame"
          importName="AppleBrowserFrame"
          purpose="Frame de ventana de browser: barra con 3 traffic lights + slot label (string = estilo default atenuado; nodo = tal cual, para chips custom o spans con ml-auto) + children. Sombra default --shadow-float; el hero la sube con className shadow-float-lg."
        >
          <Spec label="label string (estilo default)" wide>
            <AppleBrowserFrame label="app.itera.la/dashboard" className="w-full max-w-[440px]">
              <div className="p-5">
                <p className="ts-subhead text-[var(--text-secondary)]">
                  Contenido del mock — cualquier children.
                </p>
              </div>
            </AppleBrowserFrame>
          </Spec>
          <Spec label="label nodo (chip custom + ml-auto)" wide>
            <AppleBrowserFrame
              className="w-full max-w-[440px]"
              label={
                <>
                  <span className="ml-2 rounded-full bg-[var(--accent-soft)] px-2.5 py-0.5 ts-caption-1 font-extrabold tracking-[0.3px] text-[var(--accent)]">
                    MANAGER VIEW
                  </span>
                  <span className="ml-auto ts-caption-1 font-bold text-[var(--text-disabled)]">
                    Sample data
                  </span>
                </>
              }
            >
              <div className="grid grid-cols-3 gap-4 p-5">
                <AppleStatTile value="82" label="team readiness" />
                <AppleStatTile value="14" label="cases this week" />
                <AppleStatTile value="3" label="gaps flagged" />
              </div>
            </AppleBrowserFrame>
          </Spec>
        </Section>

        {/* ---- Forms ---- */}
        <Section
          name="Button"
          importName="AppleButton"
          purpose="Botón v2 (Duolingo-craft). primary/danger llevan labio 3D (--shadow-lip / --shadow-lip-danger) con hover:brightness y press hundido: el labio desaparece y el botón baja la altura del labio (a ras). secondary es border-2 sin labio; ghost solo texto bold. El acento se reserva para primary."
        >
          <Spec label="tonos (presiona primary/danger: el labio se hunde)">
            <AppleButton tone="primary">Primary</AppleButton>
            <AppleButton tone="secondary">Secondary</AppleButton>
            <AppleButton tone="ghost">Ghost</AppleButton>
            <AppleButton tone="danger">Danger</AppleButton>
            <AppleButton tone="destructive">Destructive</AppleButton>
          </Spec>
          <Spec label="tamaños">
            <AppleButton tone="primary" size="sm">
              Small
            </AppleButton>
            <AppleButton tone="primary" size="md">
              Medium
            </AppleButton>
            <AppleButton tone="primary" size="lg">
              Large
            </AppleButton>
          </Spec>
          <Spec label="disabled (gris, sin labio ni press)">
            <AppleButton tone="primary" isDisabled>
              Primary
            </AppleButton>
            <AppleButton tone="danger" isDisabled>
              Danger
            </AppleButton>
            <AppleButton tone="secondary" isDisabled>
              Secondary
            </AppleButton>
          </Spec>
          <Spec label="con icono">
            <AppleButton tone="primary">
              <AppleIcon name="check" size="sm" />
              Con icono
            </AppleButton>
          </Spec>
          <Spec label="como link (AppleButtonLink — hereda la receta v2 por tone)">
            <AppleButtonLink href="#">Navega como link</AppleButtonLink>
            <AppleButtonLink href="#" tone="secondary">
              Link secundario
            </AppleButtonLink>
          </Spec>
          <Spec label="inline (text-link de acción, sin chrome)" wide>
            <p className="ts-subhead text-[var(--text-secondary)]">
              3 filtros activos ·{" "}
              <AppleButton tone="secondary" size="inline" className="ts-subhead">
                Limpiar filtros
              </AppleButton>
            </p>
            <span className="ts-caption-1 text-[var(--text-secondary)]">
              documento.pdf{" "}
              <AppleButton tone="danger" size="inline" className="ts-caption-1">
                Quitar
              </AppleButton>
            </span>
          </Spec>
        </Section>

        <Section
          name="Botón de slide (Typeform)"
          importName="AppleSlideButton"
          purpose="El CTA 'Continuar →' estilo Typeform de los casos. El mismo botón en case-lab, runtime de casos y el onboarding. Acento sólido con labio 3D grande (--shadow-lip-lg) y press hundido; hint Enter opcional; disabled en gris SIN labio; loading conserva el acento + spinner."
        >
          <Spec label="con hint Enter" wide>
            <AppleSlideButton hint>Continuar →</AppleSlideButton>
          </Spec>
          <Spec label="estados (presiona el activo: el labio se hunde)">
            <AppleSlideButton>Activo</AppleSlideButton>
            <AppleSlideButton isDisabled>Deshabilitado</AppleSlideButton>
            <AppleSlideButton isLoading>Cargando</AppleSlideButton>
          </Spec>
        </Section>

        {/* ---- Bloques de ejercicio (case-lab / exercise-lab) ---- */}
        <Section
          name="Bloques de ejercicio"
          importName="17 bloques · app/exercise-lab/blocks/"
          purpose="Los 17 bloques canónicos del registry, montados vía ExerciseBlockRenderer. Viven en el case-lab/exercise-lab y se prueban vivos ahí; este es su índice en el design system."
        >
          <div className="w-full space-y-6">
            <div className="ts-caption-1 font-medium text-[var(--text-tertiary)]">
              render vivo · ancho del runtime · contenido demo por default
            </div>
            {exerciseBlocks.map((b) => (
                <div
                  key={b.id}
                  className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5"
                >
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    {b.labRef && (
                      <span className="rounded bg-[var(--surface-3)] px-1.5 py-0.5 ts-caption-2 font-mono text-[var(--text-tertiary)]">
                        {b.labRef}
                      </span>
                    )}
                    <span className="ts-subhead font-medium text-[var(--text-primary)]">
                      {b.publicName}
                    </span>
                    <code className="ts-caption-2 font-mono text-[var(--text-tertiary)]">
                      {b.id}
                    </code>
                  </div>
                  <BlockBoundary>
                    <ExerciseBlockRenderer
                      blockId={b.id}
                      sessionId={null}
                      mode="lab_demo"
                      slideId={`ds-${b.id}`}
                    />
                  </BlockBoundary>
                </div>
              ))}
            </div>
        </Section>

        <Section
          name="Input / Textarea"
          importName="AppleInput · AppleTextarea"
          purpose="Campos sin label arriba (solo placeholder + aria-label). Estados: default, requerido, error, disabled."
        >
          <InputsDemo />
        </Section>

        <Section
          name="Select"
          importName="AppleSelect"
          purpose="Dropdown con placeholder y acento en foco."
        >
          <SelectDemo />
        </Section>

        <Section
          name="Checkbox"
          importName="AppleCheckbox"
          purpose="Caja 20px, radius proporcional, relleno acento. El texto va como label real; los links legales no togglean."
        >
          <CheckboxDemo />
        </Section>

        <Section
          name="Switch"
          importName="AppleSwitch"
          purpose="Toggle on/off tokenizado. Estado activo en --accent; la posición del thumb comunica el estado (no solo color). role=switch, operable con teclado y foco visible."
        >
          <SwitchDemo />
        </Section>

        <Section
          name="Primitivos de ejercicio"
          importName="ChoiceButton · GuidedOption · Range10 · CompareCard"
          purpose="Controles de selección y comparación de los bloques ricos del exercise lab. Promovidos al design system (AppleExercisePrimitives); los bloques los consumen vía shim. Conservan su nombre sin prefijo Apple para no romper su API."
        >
          <ExercisePrimitivesDemo />
        </Section>

        <Section
          name="Lista reordenable"
          importName="AppleSortableList"
          purpose="Lista re-ordenable por arrastre (HTML5 DnD nativo, sin deps). Solo el handle ≡ arrastra; el resto de la fila queda clickeable. La usa WorkflowBuilder."
        >
          <SortableListDemo />
        </Section>

        {/* ---- Containers ---- */}
        <Section
          name="Card"
          importName="AppleCard"
          purpose="Contenedor. Variantes default/elevated/interactive + semánticas. Padding none/sm/md/lg."
        >
          <Spec label="variantes">
            <AppleCard variant="default" padding="md" className="w-[180px]">
              <AppleCardBody>Default</AppleCardBody>
            </AppleCard>
            <AppleCard variant="elevated" padding="md" className="w-[180px]">
              <AppleCardBody>Elevated</AppleCardBody>
            </AppleCard>
            <AppleCard
              variant="interactive"
              padding="md"
              isPressable
              className="w-[180px]"
            >
              <AppleCardBody>Interactive</AppleCardBody>
            </AppleCard>
          </Spec>
          <Spec label="semánticas">
            <AppleCard variant="success" padding="md" className="w-[150px]">
              <AppleCardBody>Success</AppleCardBody>
            </AppleCard>
            <AppleCard variant="warning" padding="md" className="w-[150px]">
              <AppleCardBody>Warning</AppleCardBody>
            </AppleCard>
            <AppleCard variant="danger" padding="md" className="w-[150px]">
              <AppleCardBody>Danger</AppleCardBody>
            </AppleCard>
          </Spec>
          <Spec label="estructurada">
            <AppleCard variant="default" className="w-[240px]">
              <AppleCardHeader className="ts-subhead font-semibold">
                Header
              </AppleCardHeader>
              <AppleCardBody className="ts-subhead text-[var(--text-secondary)]">
                Cuerpo de la tarjeta.
              </AppleCardBody>
              <AppleCardFooter className="ts-footnote text-[var(--text-tertiary)]">
                Footer
              </AppleCardFooter>
            </AppleCard>
          </Spec>
        </Section>

        <Section
          name="Empty / Error state"
          importName="AppleEmptyState · AppleErrorState"
          purpose="Estados vacíos y de error con icono, copy y acción."
        >
          <Spec label="empty" wide>
            <div className="w-full rounded-[var(--radius-lg)] border border-[var(--hairline)] bg-[var(--surface)] p-4">
              <AppleEmptyState
                icon={<AppleIcon name="search" size="lg" />}
                title="No hay resultados"
                description="Intenta con otros términos de búsqueda."
                action={<AppleButton tone="secondary">Limpiar filtros</AppleButton>}
              />
            </div>
          </Spec>
          <Spec label="error" wide>
            <div className="w-full rounded-[var(--radius-lg)] border border-[var(--hairline)] bg-[var(--surface)] p-4">
              <AppleErrorState
                title="No pudimos cargar esto."
                body="Ocurrió un problema. Intenta de nuevo."
                actionLabel="Reintentar"
              />
            </div>
          </Spec>
        </Section>

        <Section
          name="Skeleton"
          importName="AppleSkeleton"
          purpose="Placeholder de carga."
        >
          <Spec label="líneas" wide>
            <div className="w-full space-y-2">
              <AppleSkeleton className="h-4 w-full" />
              <AppleSkeleton className="h-4 w-5/6" />
              <AppleSkeleton className="h-4 w-4/5" />
            </div>
          </Spec>
          <Spec label="avatar + bloque">
            <div className="flex items-center gap-3">
              <AppleSkeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <AppleSkeleton className="h-4 w-[140px]" />
                <AppleSkeleton className="h-4 w-[90px]" />
              </div>
            </div>
          </Spec>
        </Section>

        {/* ---- Datos / lectura (contexto de caso) ---- */}
        <Section
          name="KPI card"
          importName="AppleKpiCard"
          purpose="Tarjeta de métrica: label + número grande + delta opcional (up/down/flat). Sitúa contexto de negocio (MRR, churn, conversión) antes de pedir análisis."
        >
          <Spec label="con delta" wide>
            <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
              {KPI_DATA.map((kpi) => (
                <AppleKpiCard
                  key={kpi.label}
                  label={kpi.label}
                  value={kpi.value}
                  delta={kpi.delta}
                />
              ))}
            </div>
          </Spec>
          <Spec label="sin delta">
            <AppleKpiCard label="NPS" value="62" className="w-[180px]" />
          </Spec>
        </Section>

        <Section
          name="Data table"
          importName="AppleDataTable"
          purpose="Tabla informativa de solo lectura: caption + columnas (con alineación) + filas. Para presentar datos antes de pedir una decisión."
        >
          <Spec label="caption + columnas alineadas" wide>
            <div className="w-full max-w-[520px]">
              <AppleDataTable
                caption="Desempeño por región · Q2"
                columns={TABLE_COLUMNS}
                rows={TABLE_ROWS}
              />
            </div>
          </Spec>
        </Section>

        <Section
          name="Message card"
          importName="AppleMessageCard"
          purpose="Tarjeta de email/chat/ticket: header de canal + from/to con avatar de iniciales + subject + body con **negritas** inline. El artefacto base de los casos de bandeja."
        >
          <Spec label="email (from + to + subject)" wide>
            <div className="w-full max-w-[480px]">
              <AppleMessageCard
                channel="email"
                from={{ name: "Marina López", role: "Cuenta clave" }}
                to={{ name: "Tú", role: "Soporte" }}
                timestamp="Hoy · 09:12"
                subject="Cargo duplicado en la factura de junio"
                body="Hola, detecté **dos cargos** por el mismo monto este mes. Necesito el reembolso antes del cierre contable del **viernes**. ¿Pueden confirmar el ajuste?"
              />
            </div>
          </Spec>
          <Spec label="ticket (sin to)" wide>
            <div className="w-full max-w-[480px]">
              <AppleMessageCard
                channel="ticket"
                from={{ name: "Sistema de pagos" }}
                timestamp="10:05"
                body="Reembolso **emitido** por $1,240 MXN. Conciliación pendiente de confirmación."
              />
            </div>
          </Spec>
        </Section>

        <Section
          name="Attachment card"
          importName="AppleAttachmentCard"
          purpose="Tarjeta de archivo adjunto estilo email: icono por tipo (pdf/docx/xlsx/csv/image/presentation/other) + nombre + descripción + peso."
        >
          <Spec label="tipos de archivo" wide>
            <div className="grid w-full max-w-[440px] gap-3">
              <AppleAttachmentCard
                name="factura-junio.pdf"
                size="248 KB"
                kind="pdf"
                description="Factura con el doble cargo señalado"
              />
              <AppleAttachmentCard
                name="conciliacion-q2.xlsx"
                size="1.2 MB"
                kind="xlsx"
                description="Hoja de cálculo de pagos del trimestre"
              />
              <AppleAttachmentCard name="contrato.docx" size="86 KB" kind="docx" />
            </div>
          </Spec>
        </Section>

        <Section
          name="Timeline"
          importName="AppleTimeline"
          purpose="Línea de tiempo vertical: dots + eventos cronológicos (when / what / who). El último evento (o cualquiera con emphasis) va en acento."
        >
          <Spec label="eventos (último en acento)" wide>
            <div className="w-full max-w-[440px] rounded-[var(--radius-lg)] border border-[var(--hairline)] bg-[var(--surface)] p-5">
              <AppleTimeline events={TIMELINE_EVENTS} />
            </div>
          </Spec>
        </Section>

        <Section
          name="Action chip"
          importName="AppleActionChip"
          purpose="Chip de acción discreta para clasificar filas (permisos, severidad). El style colorea el seleccionado: neutral=acento, permission (verde/acento/rojo), severity (rojo/acento/verde)."
        >
          <ActionChipDemo />
        </Section>

        {/* ---- Feedback ---- */}
        <Section
          name="Progress"
          importName="AppleProgress"
          purpose="Barra de progreso con indicador acento."
        >
          <Spec label="valores" wide>
            <div className="w-full space-y-4">
              <AppleProgress value={30} label="Paso 1" />
              <AppleProgress value={65} label="Paso 2" showValueLabel />
              <AppleProgress value={100} label="Completado" showValueLabel />
            </div>
          </Spec>
        </Section>

        <Section
          name="Toast"
          importName="AppleToast"
          purpose="Notificación con icono automático según tono."
        >
          <Spec label="tonos" wide>
            <div className="w-full space-y-3">
              <AppleToast
                title="¡Listo!"
                body="Tu cambio fue guardado."
                tone="success"
              />
              <AppleToast
                title="Información"
                body="Tu sesión expira en 5 minutos."
                tone="info"
              />
              <AppleToast
                title="Atención"
                body="Esta acción no se puede deshacer."
                tone="warning"
              />
              <AppleToast
                title="Error"
                body="Algo salió mal. Intenta de nuevo."
                tone="danger"
              />
            </div>
          </Spec>
        </Section>

        <Section
          name="Modal"
          importName="AppleModal"
          purpose="Overlay con backdrop blur. Se controla con estado."
        >
          <ModalDemo />
        </Section>

        <Section
          name="Invite team modal"
          importName="InviteTeamModal"
          purpose="Flujo de invitación del manager en /staff: filas de email (agregar/quitar) → POST /api/orgs/[org_id]/invitations → resultado por email_status real, con invite links manuales cuando el email falla."
        >
          <InviteTeamModalDemo />
        </Section>

        {/* ---- Navigation ---- */}
        <Section
          name="Tabs"
          importName="AppleTabs"
          purpose="Tabs controladas con badge opcional."
        >
          <TabsDemo />
        </Section>

        <Section
          name="Step dots"
          importName="AppleStepDots"
          purpose="Progreso por pasos: completed / current / pending / locked."
        >
          <Spec label="pasos" wide>
            <AppleStepDots steps={STEP_DOTS} />
          </Spec>
        </Section>

        <Section
          name="Step bar"
          importName="AppleStepBar"
          purpose="Barra segmentada de progreso por pasos. La misma del onboarding y el runtime de ejercicios. Acepta onSelect para hacer los segmentos navegables."
        >
          <Spec label="pasos" wide>
            <div className="w-full max-w-[440px]">
              <AppleStepBar total={5} current={2} />
            </div>
          </Spec>
        </Section>

        <Section
          name="Header de caso"
          importName="AppleCaseHeader"
          purpose="Chrome del player de casos: Cerrar (X) + Atrás (‹) a la izquierda, AppleStepBar al centro, Adelante (›) + feedback a la derecha. Cada control es opcional; usa los botones para avanzar la barra."
        >
          <CaseHeaderDemo />
        </Section>

        <Section
          name="Sidebar"
          importName="AppleSidebar"
          purpose="Navegación lateral (lg+) con título, subtítulo, items con icono/badge, item activo en acento y footer. Se monta a nivel de layout; aquí va un render acotado."
        >
          <Spec label="render acotado (alto recortado · activo según ruta)" wide>
            <div className="relative h-[420px] w-[280px] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--hairline)]">
              <AppleSidebar
                title="Itera"
                subtitle="Simulador corporativo"
                items={SIDEBAR_ITEMS}
                footer={
                  <div className="flex items-center gap-2 px-1 ts-caption-1 text-[var(--text-tertiary)]">
                    <AppleIcon name="userCircle" size="sm" />
                    <span>Tu cuenta</span>
                  </div>
                }
                className="!flex !min-h-0 !h-[420px] !w-[280px] !border-r-0"
              />
            </div>
          </Spec>
          <Spec label="nota" wide>
            <div className="w-full rounded-[var(--radius-lg)] border border-dashed border-[var(--border-strong)] bg-[var(--surface)] p-4 ts-subhead text-[var(--text-secondary)]">
              En el layout real se monta a ancho completo y alto de pantalla.
              Para revisarla en contexto, mídela en{" "}
              <Link href="/dashboard" className="text-[var(--accent)]">
                /dashboard
              </Link>
              .
            </div>
          </Spec>
        </Section>

        <footer className="border-t border-[var(--hairline)] pt-6 ts-footnote text-[var(--text-tertiary)]">
          Cada componente lee de{" "}
          <code className="font-mono">components/simulador/apple/</code>. Modifica
          el archivo y cambia aquí y en todo el sitio. Gate de calidad: skill{" "}
          <code className="font-mono">/componente-hig</code>.
        </footer>
      </main>
    </div>
  );
}

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
  AppleBadge,
  AppleButton,
  AppleButtonLink,
  AppleCard,
  AppleCardBody,
  AppleCardFooter,
  AppleCardHeader,
  AppleCheckbox,
  AppleEmptyState,
  AppleErrorState,
  AppleIcon,
  AppleInput,
  AppleLink,
  AppleModal,
  AppleModalBody,
  AppleModalContent,
  AppleModalFooter,
  AppleModalHeader,
  AppleProgress,
  AppleSelect,
  AppleSkeleton,
  AppleStepDots,
  AppleTabs,
  AppleTextarea,
  AppleToast,
  type AppleStepDot,
  type AppleTabItem,
} from "@/components/simulador/apple";

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
      <div className="ts-caption-1 mb-2 font-medium uppercase tracking-wide text-[var(--text-tertiary)]">
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

// ============================================================================
// Página
// ============================================================================

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

        {/* ---- Forms ---- */}
        <Section
          name="Button"
          importName="AppleButton"
          purpose="Botón. Tonos primary/secondary/ghost/danger/destructive. El acento se reserva para primary."
        >
          <Spec label="tonos">
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
          <Spec label="estados">
            <AppleButton tone="primary" isDisabled>
              Disabled
            </AppleButton>
            <AppleButton tone="primary">
              <AppleIcon name="check" size="sm" />
              Con icono
            </AppleButton>
          </Spec>
          <Spec label="como link (AppleButtonLink)">
            <AppleButtonLink
              href="#"
              className="h-12 px-6 accent-bg text-white text-[15px] font-medium shadow-none"
            >
              Navega como link
            </AppleButtonLink>
          </Spec>
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
          name="Sidebar"
          importName="AppleSidebar"
          purpose="Navegación lateral fija (lg+). Se monta a nivel de layout; aquí va solo la nota."
        >
          <Spec label="nota" wide>
            <div className="w-full rounded-[var(--radius-lg)] border border-dashed border-[var(--border-strong)] bg-[var(--surface)] p-4 ts-subhead text-[var(--text-secondary)]">
              <code className="font-mono text-[var(--text-tertiary)]">
                AppleSidebar
              </code>{" "}
              se posiciona <code className="font-mono">fixed</code> en el layout
              real. Para revisarla en contexto, mídela en{" "}
              <Link href="/dashboard" className="text-[var(--accent)]">
                /dashboard
              </Link>
              . Toma{" "}
              <code className="font-mono text-[var(--text-tertiary)]">
                title, subtitle, items[], footer
              </code>
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

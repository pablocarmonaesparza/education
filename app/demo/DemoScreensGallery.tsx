"use client";

/**
 * DemoScreensGallery — galería en SCROLL HORIZONTAL de pantallas REALES del
 * caso (pedido de Pablo: "una sección donde estén las pantallas de un caso en
 * scroll horizontal", en vez de mandar al prospecto a buscarlas).
 *
 * No son screenshots: cada tarjeta renderiza el bloque real del runtime
 * (ExerciseBlockRenderer) con su contenido real, en solo lectura
 * (pointer-events:none, sin sesión). Siempre en sync con el producto.
 */

import { useRef } from "react";
import { ExerciseBlockRenderer } from "@/components/simulador/ExerciseBlockRenderer";
import { AppleIcon } from "@/components/simulador/apple";
import type { ExerciseBlockId } from "@/lib/simulador/exercise-blocks.generated";

export interface GallerySlide {
  slideId: string;
  blockId: string;
  title: string;
  section: string;
  caseContext?: Record<string, unknown>;
}

export function DemoScreensGallery({ slides }: { slides: GallerySlide[] }) {
  const scroller = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: 1 | -1) => {
    scroller.current?.scrollBy({ left: dir * 416, behavior: "smooth" });
  };

  return (
    <div className="relative">
      {/* controles */}
      <div className="mb-4 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => scrollBy(-1)}
          aria-label="Previous"
          className="grid h-9 w-9 place-items-center rounded-full bg-[var(--surface-2)] text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
        >
          <AppleIcon name="chevronLeft" className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => scrollBy(1)}
          aria-label="Next"
          className="grid h-9 w-9 place-items-center rounded-full bg-[var(--surface-2)] text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
        >
          <AppleIcon name="chevronRight" className="h-4 w-4" />
        </button>
      </div>

      {/* pista horizontal */}
      <div
        ref={scroller}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 scrollbar-thin"
      >
        {slides.map((s, i) => (
          <figure
            key={s.slideId}
            className="w-[400px] flex-none snap-start overflow-hidden rounded-[var(--radius-lg)] bg-[var(--surface-2)] shadow-[0_2px_12px_var(--shadow)]"
          >
            {/* chrome de la pantalla */}
            <div className="flex items-center gap-2 px-4 py-2.5">
              <span className="flex gap-1.5" aria-hidden>
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--surface-3)]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--surface-3)]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--surface-3)]" />
              </span>
              <span className="ml-1 ts-caption-1 text-[var(--text-tertiary)]">
                {s.section} · screen {i + 1} of {slides.length}
              </span>
            </div>

            {/* la pantalla real, en solo lectura */}
            <div
              className="h-[420px] overflow-hidden bg-[var(--surface)] px-5 pt-4 [mask-image:linear-gradient(to_bottom,black_82%,transparent)] [&_*]:pointer-events-none"
              aria-hidden
            >
              <div className="ts-caption-1 font-medium text-[var(--text-tertiary)]">
                {s.section}
              </div>
              <h4 className="mt-1 ts-headline font-semibold leading-[1.3] text-[var(--text-primary)]">
                {s.title}
              </h4>
              <div className="mt-4">
                <ExerciseBlockRenderer
                  blockId={s.blockId as ExerciseBlockId}
                  sessionId={null}
                  mode="lab_demo"
                  slideId={s.slideId}
                  caseContext={s.caseContext}
                />
              </div>
            </div>
          </figure>
        ))}
      </div>
    </div>
  );
}

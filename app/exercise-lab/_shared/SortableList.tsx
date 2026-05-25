"use client";

/**
 * SortableList · primitive de lista re-ordenable por arrastre.
 *
 * Implementación con HTML5 Drag and Drop API nativa — sin deps externas.
 * Desktop-first (mouse). Para mobile/touch se requiere pointer events o
 * lib externa (react-dnd, dnd-kit); el roadmap lo agrega cuando el lab
 * cubra viewport <768px.
 *
 * Uso:
 *
 *   <SortableList
 *     items={steps}
 *     getItemKey={(s) => s.id}
 *     onReorder={(next) => updateOrder(next.map(s => s.id))}
 *     renderItem={(step, idx, dragHandle) => (
 *       <Row>{dragHandle}<Label>{step.label}</Label></Row>
 *     )}
 *   />
 *
 * El callback `renderItem` recibe un `dragHandle` (ReactNode) que el
 * caller debe colocar visualmente. Solo el handle es draggable; el
 * resto de la row se mantiene clickeable para acciones secundarias
 * (toggles, links, etc.). El handle visualmente comunica "puedes
 * arrastrar" (cursor-grab + icono ≡).
 */

import { useState, type ReactNode } from "react";

interface SortableListProps<T> {
  items: T[];
  getItemKey: (item: T) => string;
  onReorder: (next: T[]) => void;
  renderItem: (item: T, index: number, dragHandle: ReactNode) => ReactNode;
  /** className extra para el contenedor padre. */
  className?: string;
}

export function SortableList<T>({
  items,
  getItemKey,
  onReorder,
  renderItem,
  className = "space-y-2",
}: SortableListProps<T>) {
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  function handleDragStart(e: React.DragEvent, index: number) {
    setDraggingIndex(index);
    e.dataTransfer.effectAllowed = "move";
    // Necesario para Firefox · sin esto el drag no inicia
    e.dataTransfer.setData("text/plain", String(index));
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverIndex !== index) setDragOverIndex(index);
  }

  function handleDragLeave() {
    setDragOverIndex(null);
  }

  function handleDrop(e: React.DragEvent, dropIndex: number) {
    e.preventDefault();
    if (draggingIndex === null || draggingIndex === dropIndex) {
      setDraggingIndex(null);
      setDragOverIndex(null);
      return;
    }
    const next = [...items];
    const [moved] = next.splice(draggingIndex, 1);
    next.splice(dropIndex, 0, moved);
    onReorder(next);
    setDraggingIndex(null);
    setDragOverIndex(null);
  }

  function handleDragEnd() {
    setDraggingIndex(null);
    setDragOverIndex(null);
  }

  return (
    <div className={className}>
      {items.map((item, index) => {
        const isDragging = draggingIndex === index;
        const isDragOver = dragOverIndex === index && draggingIndex !== index;
        const dragHandle = (
          <span
            className="grid h-8 w-6 cursor-grab place-items-center text-[var(--text-tertiary)] transition-colors hover:text-[var(--text-secondary)] active:cursor-grabbing"
            aria-label="Arrastra para reordenar"
            role="button"
            tabIndex={-1}
          >
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden>
              <circle cx="6" cy="4" r="1" fill="currentColor" />
              <circle cx="10" cy="4" r="1" fill="currentColor" />
              <circle cx="6" cy="8" r="1" fill="currentColor" />
              <circle cx="10" cy="8" r="1" fill="currentColor" />
              <circle cx="6" cy="12" r="1" fill="currentColor" />
              <circle cx="10" cy="12" r="1" fill="currentColor" />
            </svg>
          </span>
        );
        return (
          <div
            key={getItemKey(item)}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            className={`transition-opacity ${
              isDragging ? "opacity-40" : ""
            } ${
              isDragOver
                ? "outline outline-2 outline-offset-[-2px] outline-[var(--accent)] rounded-[var(--radius-lg)]"
                : ""
            }`}
          >
            {renderItem(item, index, dragHandle)}
          </div>
        );
      })}
    </div>
  );
}

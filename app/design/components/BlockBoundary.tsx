"use client";

import { Component, type ReactNode } from "react";

/**
 * BlockBoundary — error boundary para el showcase vivo de bloques en /design.
 * Si un bloque no renderea en demo (le falta contexto del caso), muestra una
 * nota en vez de tumbar la página entera.
 */
export class BlockBoundary extends Component<
  { children: ReactNode },
  { error: boolean }
> {
  state = { error: false };

  static getDerivedStateFromError() {
    return { error: true };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="ts-footnote text-[var(--text-tertiary)]">
          Este bloque necesita contexto de caso para su demo. Verlo vivo en{" "}
          <a href="/exercise-lab" className="text-[var(--accent)] underline">
            /exercise-lab
          </a>
          .
        </div>
      );
    }
    return this.props.children;
  }
}

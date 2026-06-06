"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "./utils";

export interface AppleSlideBodyProps {
  children: string;
  className?: string;
}

/**
 * AppleSlideBody — renderer markdown estandarizado para el body de cualquier
 * diapositiva del runtime (lab, case-template, /case productivo). Usa
 * react-markdown + remark-gfm con tipografía + colores por tokens HIG. Sin HTML
 * crudo (xss-safe). Regla del producto (Pablo): el body siempre markdown, jamás
 * texto plano. Hereda tokens de `.simulador-root`.
 */
export function AppleSlideBody({ children, className }: AppleSlideBodyProps) {
  return (
    <div className={cn("ts-body-lg leading-[1.55] text-[var(--text-secondary)]", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="[&:not(:first-child)]:mt-3">{children}</p>,
          strong: ({ children }) => (
            <strong className="font-semibold text-[var(--text-primary)]">{children}</strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          a: ({ href, children }) => (
            <a
              href={href}
              className="text-[var(--accent)] underline-offset-2 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          ul: ({ children }) => <ul className="mt-2 list-disc pl-5 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="mt-2 list-decimal pl-5 space-y-1">{children}</ol>,
          li: ({ children }) => <li className="pl-1">{children}</li>,
          code: ({ children }) => (
            <code className="rounded bg-[var(--surface-2)] px-1.5 py-0.5 ts-footnote font-mono text-[var(--text-primary)]">
              {children}
            </code>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-3 border-l-2 border-[var(--accent)] pl-4 italic text-[var(--text-tertiary)]">
              {children}
            </blockquote>
          ),
          del: ({ children }) => <del className="text-[var(--text-tertiary)]">{children}</del>,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}

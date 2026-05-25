"use client";

/**
 * SlideBody · renderer markdown estandarizado para el body de cualquier
 * diapositiva del runtime (lab, case-template, /case productivo).
 *
 * Usa react-markdown + remark-gfm. Tipografía + colores con tokens HIG.
 * Permite bold, italic, links, listas, código inline, blockquotes,
 * tablas y strikethrough. No habilita HTML crudo (xss-safe por default).
 *
 * Regla del producto (Pablo): el body usa markdown para dinamismo -
 * jamás texto plano sin formato.
 */

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface SlideBodyProps {
  children: string;
  className?: string;
}

export function SlideBody({ children, className = "" }: SlideBodyProps) {
  return (
    <div
      className={`ts-body-lg leading-[1.55] text-[var(--text-secondary)] ${className}`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Párrafos sin margen extra (el componente padre controla spacing).
          p: ({ children }) => (
            <p className="[&:not(:first-child)]:mt-3">{children}</p>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-[var(--text-primary)]">
              {children}
            </strong>
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
          ul: ({ children }) => (
            <ul className="mt-2 list-disc pl-5 space-y-1">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="mt-2 list-decimal pl-5 space-y-1">{children}</ol>
          ),
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
          del: ({ children }) => (
            <del className="text-[var(--text-tertiary)]">{children}</del>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}

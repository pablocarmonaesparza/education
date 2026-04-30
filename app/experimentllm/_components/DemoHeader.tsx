import Link from 'next/link';
import { Title, Subtitle, Caption } from '@/components/ui/Typography';

interface DemoHeaderProps {
  num: string;
  emoji: string;
  title: string;
  subtitle: string;
}

/**
 * Header visual compartido entre las sub-páginas de /experimentllm.
 * Mantiene la energía del hub: emoji grande + numeración + título grande +
 * subtítulo. El "← volver al hub" sale chico arriba, no roba protagonismo.
 *
 * Server component — sin hooks ni event handlers.
 */
export default function DemoHeader({
  num,
  emoji,
  title,
  subtitle,
}: DemoHeaderProps) {
  return (
    <div className="mb-10">
      <Link
        href="/experimentllm"
        className="inline-flex items-center gap-1.5 mb-6 text-xs font-bold uppercase tracking-widest text-ink-muted dark:text-gray-400 hover:text-primary transition-colors"
      >
        ← volver al hub
      </Link>
      <div className="flex items-start gap-4 mb-3">
        <span className="text-5xl leading-none" aria-hidden>
          {emoji}
        </span>
        <div className="flex-1">
          <Caption className="font-bold uppercase tracking-widest text-primary mb-1">
            demo {num}
          </Caption>
          <Title>{title}</Title>
        </div>
      </div>
      <Subtitle className="text-ink-muted dark:text-gray-300 max-w-2xl">
        {subtitle}
      </Subtitle>
    </div>
  );
}

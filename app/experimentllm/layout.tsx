import Link from 'next/link';
import Image from 'next/image';
import Button from '@/components/ui/Button';

export default function ExperimentLLMLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-white dark:bg-gray-950">
      {/* Mini-strip superior — identidad sin pretensión de navbar.
          Background plano: la energía la lleva el hub, no el chrome. */}
      <div className="relative z-10 border-b border-gray-200 dark:border-gray-900 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-12 flex items-center justify-between text-xs">
          <Link
            href="/experimentllm"
            className="flex items-center gap-2 group"
            aria-label="ir al hub de experimentos"
          >
            <Image
              src="/icon.png"
              alt=""
              width={20}
              height={20}
              className="rounded-md"
              priority
            />
            <span className="font-extrabold tracking-tight text-ink dark:text-white lowercase">
              itera
            </span>
            <span className="text-ink-muted dark:text-gray-500">/</span>
            <span className="font-bold uppercase tracking-wider text-primary">
              labs
            </span>
            <span className="ml-2 flex items-center gap-1.5 text-ink-muted dark:text-gray-500">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-completado opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-completado" />
              </span>
              <span className="font-medium">demo en vivo</span>
            </span>
          </Link>
          <Button href="/dashboard" variant="ghost" size="sm">
            ir a la app →
          </Button>
        </div>
      </div>

      {children}
    </div>
  );
}

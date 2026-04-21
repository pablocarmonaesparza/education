'use client';

/**
 * Maintenance screen shown while we rebuild the course data layer.
 *
 * Activated via env var `NEXT_PUBLIC_MAINTENANCE_MODE=true`. While active,
 * content routes (dashboard, experiment, courseCreation) render this
 * instead of their normal UI. Auth still works — the user just can't
 * interact with content that doesn't exist yet.
 *
 * Remove or flip the env var once the new schema + content are back.
 */

import { Body, Caption } from '@/components/ui/Typography';
import Card from '@/components/ui/Card';

export default function MaintenancePage() {
  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-white dark:bg-gray-950 px-4">
      <Card variant="neutral" padding="lg" className="max-w-xl w-full text-center space-y-4">
        <div className="text-5xl" aria-hidden="true">🛠️</div>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#4b4b4b] dark:text-white leading-tight">
          itera vuelve pronto
        </h1>
        <Body>
          Estamos reconstruyendo el curso desde la raíz para la siguiente versión
          del producto. Durante estos días, el contenido está temporalmente fuera
          de línea — el acceso vuelve en cuanto terminemos la migración.
        </Body>
        <Caption>
          Si tienes algo urgente, escríbenos y respondemos directo.
        </Caption>
      </Card>
    </main>
  );
}

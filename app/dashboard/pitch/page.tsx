'use client';

import { Title } from '@/components/ui/Typography';
import EmptyState from '@/components/ui/EmptyState';

export default function PitchPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <Title>pitch</Title>
      <EmptyState
        icon={
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
          </svg>
        }
        title="Proximamente"
        description="La seccion de pitch estara disponible pronto. Prepara y practica tu pitch con herramientas de IA."
      />
    </div>
  );
}

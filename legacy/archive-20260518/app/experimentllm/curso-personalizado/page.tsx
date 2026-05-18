'use client';

import { useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import { Body, Caption, Headline } from '@/components/ui/Typography';
import Spinner from '@/components/ui/Spinner';
import DemoHeader from '../_components/DemoHeader';

const LECCION_EJEMPLO = `título: cómo escribir un email de venta que convierte

slide 1 — la regla de oro
todo email de venta tiene un solo objetivo: que el lector haga UNA acción. no varias. una. si querés que reserve una llamada, no le pidas también que descargue un pdf y siga tu instagram.

slide 2 — la estructura
1. asunto que abre (curiosidad, beneficio o pregunta directa)
2. primera línea que engancha (una observación específica, no "espero que estés bien")
3. cuerpo: problema → consecuencia → solución
4. cta única y clara

slide 3 — ejemplo
imaginá que vendés un servicio de limpieza para oficinas. tu prospecto es una empresa de 50 empleados.

asunto: "vi que su oficina tiene piso de madera"
primera línea: "noté en su sede de polanco que el piso es de tablas, eso requiere mantenimiento distinto al normal."
problema: "la mayoría de empresas de limpieza usan productos genéricos que dañan la madera con el tiempo."
consecuencia: "en 2-3 años, los costos de re-laqueado se disparan."
solución: "nosotros usamos productos certificados para madera, sin costo extra."
cta: "¿te interesa una visita gratis para ver el estado actual del piso?"

slide 4 — error común
mandar un email genérico de "ofrecemos servicios de limpieza profesional" + lista de servicios. eso lo hace todo el mundo. sin observación específica, no hay diferenciación.`;

const PROYECTO_EJEMPLO = `tengo una agencia de copywriting freelance. trabajo con startups latam que necesitan copy para landings, emails de venta y secuencias de onboarding. mi diferencial es que entiendo el contexto técnico (vengo de programación). mi target son fundadores no técnicos que tienen producto pero no saben venderlo.`;

export default function CursoPersonalizadoDemo() {
  const [proyecto, setProyecto] = useState(PROYECTO_EJEMPLO);
  const [leccion, setLeccion] = useState(LECCION_EJEMPLO);
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setError(null);
    setLoading(true);
    setOutput('');
    try {
      const res = await fetch('/api/experiment/curso-personalizado', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proyecto, leccion }),
      });

      if (!res.ok || !res.body) {
        const text = await res.text().catch(() => '');
        setError(text || `error http ${res.status}`);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setOutput((prev) => prev + chunk);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative max-w-5xl mx-auto px-6 pt-12 pb-24">
        <DemoHeader
          num="01"
          emoji="🎯"
          title="curso personalizado a tu proyecto"
          subtitle="la lección genérica de la derecha se re-escribe con ejemplos directos de tu proyecto. mismo concepto, mismo nivel — solo cambian los ejemplos para que sientas que el curso fue hecho para vos."
        />

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <Headline className="mb-2">tu proyecto</Headline>
            <Textarea
              value={proyecto}
              onChange={(e) => setProyecto(e.target.value)}
              rows={8}
              placeholder="describí tu negocio, target, diferencial"
            />
          </div>
          <div>
            <Headline className="mb-2">lección genérica</Headline>
            <Textarea
              value={leccion}
              onChange={(e) => setLeccion(e.target.value)}
              rows={8}
              placeholder="pegá una lección con ejemplos genéricos"
            />
          </div>
        </div>

        <Button
          variant="primary"
          size="lg"
          onClick={handleSubmit}
          disabled={loading || !proyecto.trim() || !leccion.trim()}
        >
          {loading ? 'generando...' : 'personalizar lección'}
        </Button>

        {error && (
          <Card variant="neutral" padding="md" className="mt-6">
            <Caption className="text-red-600 dark:text-red-400">
              error: {error}
            </Caption>
          </Card>
        )}

        {(output || loading) && (
          <Card variant="neutral" padding="lg" className="mt-8">
            <Headline className="mb-3 text-primary">lección re-escrita</Headline>
            {loading && !output && (
              <div className="flex items-center gap-2">
                <Spinner size="sm" />
                <Caption>pensando...</Caption>
              </div>
            )}
            {output && (
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-ink dark:text-gray-200">
                {output}
              </pre>
            )}
          </Card>
        )}
    </main>
  );
}

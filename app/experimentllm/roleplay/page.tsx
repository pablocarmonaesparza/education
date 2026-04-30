'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Title, Body, Caption, Headline } from '@/components/ui/Typography';
import Spinner from '@/components/ui/Spinner';
import DemoHeader from '../_components/DemoHeader';

type Msg = { role: 'user' | 'assistant'; content: string };

const ESCENARIOS = [
  {
    id: 'cliente-precio',
    label: 'cliente que dice "es muy caro"',
    personaje:
      'fundador de una startup b2b mexicana, 35 años, escéptico, ya cotizó con dos competidores más baratos',
    situacion:
      'estás vendiendo tu servicio (defínilo abajo). el cliente acaba de ver tu propuesta y dice "es muy caro, los otros me cobran 30% menos".',
    habilidad:
      'manejo de objeción de precio sin bajar el precio: defender valor, hacer preguntas para entender el "muy caro" real',
  },
  {
    id: 'inversionista',
    label: 'pitch a inversionista escéptico',
    personaje:
      'partner de un fondo seed latam, 12 años de experiencia, 40 inversiones, ha visto miles de pitches y filtra rápido',
    situacion:
      'tenés 5 minutos para pitchear tu startup. el inversionista interrumpe, hace preguntas duras sobre tracción, mercado, defensibilidad y unit economics.',
    habilidad: 'pitch ejecutivo bajo presión + responder preguntas duras de fondo',
  },
  {
    id: 'cliente-no-paga',
    label: 'cliente que no quiere pagar la factura',
    personaje:
      'gerente de marketing de una empresa mediana, dice que el trabajo "no fue lo que esperaba" aunque firmó el alcance',
    situacion:
      'le entregaste el proyecto hace 2 semanas, ya cobraste 50% y el otro 50% está pendiente. te dice por whatsapp que "no le encantó el resultado" y "lo va a pensar".',
    habilidad: 'cobrar lo que te deben sin perder al cliente ni la dignidad',
  },
];

export default function RoleplayDemo() {
  const [escenario, setEscenario] = useState(ESCENARIOS[0]);
  const [personaje, setPersonaje] = useState(ESCENARIOS[0].personaje);
  const [situacion, setSituacion] = useState(ESCENARIOS[0].situacion);
  const [habilidad, setHabilidad] = useState(ESCENARIOS[0].habilidad);
  const [started, setStarted] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  function selectEscenario(id: string) {
    const e = ESCENARIOS.find((x) => x.id === id);
    if (!e) return;
    setEscenario(e);
    setPersonaje(e.personaje);
    setSituacion(e.situacion);
    setHabilidad(e.habilidad);
  }

  async function streamReply(history: Msg[]) {
    setError(null);
    setLoading(true);
    setMessages([...history, { role: 'assistant', content: '' }]);

    try {
      const res = await fetch('/api/experiment/roleplay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personaje, situacion, habilidad, messages: history }),
      });

      if (!res.ok || !res.body) {
        const text = await res.text().catch(() => '');
        setError(text || `error http ${res.status}`);
        setMessages(history);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages([...history, { role: 'assistant', content: acc }]);
      }
    } catch (err) {
      setError((err as Error).message);
      setMessages(history);
    } finally {
      setLoading(false);
    }
  }

  async function startRoleplay() {
    setStarted(true);
    const initial: Msg[] = [
      { role: 'user', content: '(empezá vos, en personaje, con la primera frase)' },
    ];
    setMessages(initial);
    await streamReply(initial);
  }

  async function sendMessage() {
    if (!input.trim() || loading) return;
    const newHistory: Msg[] = [
      ...messages,
      { role: 'user', content: input.trim() },
    ];
    setInput('');
    await streamReply(newHistory);
  }

  if (!started) {
    return (
      <main className="relative max-w-3xl mx-auto px-6 pt-12 pb-24">
          <DemoHeader
            num="03"
            emoji="🎭"
            title="roleplay de situación real"
            subtitle="practicás una situación blanda (negociación, objeción, pitch) con un personaje difícil. al cierre, feedback puntual sobre qué hiciste bien y qué pudo haber sido mejor."
          />

          <Headline className="mb-2">elegí un escenario</Headline>
          <div className="grid gap-3 mb-6">
            {ESCENARIOS.map((e) => (
              <Card
                key={e.id}
                variant={escenario.id === e.id ? 'primary' : 'neutral'}
                padding="md"
                interactive
                onClick={() => selectEscenario(e.id)}
              >
                <Body
                  className={
                    escenario.id === e.id
                      ? 'text-white font-bold'
                      : 'font-bold'
                  }
                >
                  {e.label}
                </Body>
              </Card>
            ))}
          </div>

          <Card variant="neutral" padding="lg" className="space-y-4 mb-6">
            <div>
              <Headline className="mb-2">personaje</Headline>
              <Textarea
                value={personaje}
                onChange={(e) => setPersonaje(e.target.value)}
                rows={2}
              />
            </div>
            <div>
              <Headline className="mb-2">situación</Headline>
              <Textarea
                value={situacion}
                onChange={(e) => setSituacion(e.target.value)}
                rows={3}
              />
            </div>
            <div>
              <Headline className="mb-2">habilidad que practicás</Headline>
              <Input
                value={habilidad}
                onChange={(e) => setHabilidad(e.target.value)}
              />
            </div>
          </Card>

          <Button
            variant="primary"
            size="lg"
            onClick={startRoleplay}
            disabled={!personaje.trim() || !situacion.trim() || !habilidad.trim()}
          >
            empezar roleplay
          </Button>
      </main>
    );
  }

  return (
    <main className="relative max-w-3xl mx-auto px-6 pt-12 pb-24">
        <Link
          href="/experimentllm"
          className="inline-flex items-center gap-1.5 mb-4 text-xs font-bold uppercase tracking-widest text-ink-muted dark:text-gray-400 hover:text-primary transition-colors"
        >
          ← volver al hub
        </Link>
        <Caption className="font-bold uppercase tracking-widest text-primary mb-1">
          🎭 demo 03 — roleplay
        </Caption>
        <Title className="mb-2">{escenario.label}</Title>
        <Caption className="mb-6 block">
          practicás: <span className="font-bold">{habilidad}</span>
        </Caption>

        {error && (
          <Card variant="neutral" padding="md" className="mb-4">
            <Caption className="text-red-600 dark:text-red-400">
              error: {error}
            </Caption>
          </Card>
        )}

        <Card variant="neutral" padding="lg" className="mb-4">
          <div
            ref={scrollRef}
            className="space-y-4 max-h-[60vh] overflow-y-auto pr-2"
          >
            {messages.slice(1).map((m, i) => {
              const realIdx = i + 1;
              const isLast = realIdx === messages.length - 1;
              const isEmpty = !m.content;
              return (
                <div
                  key={realIdx}
                  className={
                    m.role === 'user' ? 'flex justify-end' : 'flex justify-start'
                  }
                >
                  <div
                    className={
                      m.role === 'user'
                        ? 'bg-primary text-white rounded-2xl px-4 py-3 max-w-[80%] text-sm'
                        : 'bg-gray-100 dark:bg-gray-900 text-ink dark:text-gray-200 rounded-2xl px-4 py-3 max-w-[80%] text-sm whitespace-pre-wrap'
                    }
                  >
                    {isEmpty && isLast && loading ? (
                      <Spinner size="sm" />
                    ) : (
                      m.content
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="tu respuesta..."
            disabled={loading}
            className="flex-1"
          />
          <Button
            variant="primary"
            onClick={sendMessage}
            disabled={loading || !input.trim()}
          >
            enviar
          </Button>
        </div>

        <Caption className="mt-3 block text-center">
          tip: cuando creas que terminaste la conversación (o llegues al turno
          ~8), escribí "cerremos acá" y el tutor te dará feedback.
        </Caption>
    </main>
  );
}

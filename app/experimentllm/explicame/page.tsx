'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Title, Caption, Headline } from '@/components/ui/Typography';
import Spinner from '@/components/ui/Spinner';
import DemoHeader from '../_components/DemoHeader';

type Msg = { role: 'user' | 'assistant'; content: string };

export default function ExplicameDemo() {
  const [concepto, setConcepto] = useState(
    'la diferencia entre un funnel awareness y uno de consideración'
  );
  const [primerExplicacion, setPrimerExplicacion] = useState(
    'el funnel de awareness es para que la gente sepa que existís y el de consideración es para que te elijan a vos. en awareness hacés contenido más general, en consideración hablás más de tu producto.'
  );
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

  async function streamReply(history: Msg[]) {
    setError(null);
    setLoading(true);
    setMessages([...history, { role: 'assistant', content: '' }]);

    try {
      const res = await fetch('/api/experiment/explicame', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ concepto, messages: history }),
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

  async function startExplicacion() {
    if (!primerExplicacion.trim() || !concepto.trim()) return;
    setStarted(true);
    const initial: Msg[] = [
      {
        role: 'user',
        content: `mi explicación con mis palabras del concepto "${concepto}":\n\n${primerExplicacion}`,
      },
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
            num="04"
            emoji="🧠"
            title="explícame con tus palabras"
            subtitle="patrón feynman: si lo podés explicar simple, lo entendiste de verdad. el tutor lee tu explicación, te felicita por lo que entendiste bien, y te hace preguntas socráticas para que descubras los huecos por vos mismo."
          />

          <Card variant="neutral" padding="lg" className="space-y-4 mb-6">
            <div>
              <Headline className="mb-2">concepto que aprendiste</Headline>
              <Input
                value={concepto}
                onChange={(e) => setConcepto(e.target.value)}
                placeholder="ej: diferencia entre awareness y consideración en un funnel"
              />
            </div>
            <div>
              <Headline className="mb-2">tu explicación con tus palabras</Headline>
              <Textarea
                value={primerExplicacion}
                onChange={(e) => setPrimerExplicacion(e.target.value)}
                rows={5}
                placeholder="explicá el concepto como se lo contarías a un amigo"
              />
            </div>
          </Card>

          <Button
            variant="primary"
            size="lg"
            onClick={startExplicacion}
            disabled={!primerExplicacion.trim() || !concepto.trim()}
          >
            evaluar mi explicación
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
          🧠 demo 04 — explícame
        </Caption>
        <Title className="mb-6">{concepto}</Title>

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
            {messages.map((m, i) => {
              const isLast = i === messages.length - 1;
              const isEmpty = !m.content;
              return (
                <div
                  key={i}
                  className={
                    m.role === 'user' ? 'flex justify-end' : 'flex justify-start'
                  }
                >
                  <div
                    className={
                      m.role === 'user'
                        ? 'bg-primary text-white rounded-2xl px-4 py-3 max-w-[80%] text-sm whitespace-pre-wrap'
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
            placeholder="responde a la pregunta del tutor..."
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
    </main>
  );
}

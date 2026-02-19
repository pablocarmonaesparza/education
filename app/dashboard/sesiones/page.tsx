'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Card, { CardFlat } from '@/components/ui/Card';
import Tag from '@/components/ui/Tag';
import { Headline, Body, Caption } from '@/components/ui/Typography';
import SectionHeader from '@/components/ui/SectionHeader';
import EmptyState from '@/components/ui/EmptyState';
import Divider from '@/components/ui/Divider';
import HorizontalScroll from '@/components/shared/HorizontalScroll';

interface Session {
  id: string;
  title: string;
  description: string;
  instructor: string;
  instructorInitials: string;
  date: string; // YYYY-MM-DD
  time: string;
  duration: string;
  status: 'upcoming' | 'live' | 'recorded';
  topic: string;
  attendees: number;
  maxAttendees: number;
  recordingUrl: string | null;
  thumbnailUrl: string | null;
}

// Mock data — will be replaced with real data
const mockSessions: Session[] = [
  {
    id: '1',
    title: 'Cómo integrar ChatGPT en tu producto',
    description: 'Aprende paso a paso a conectar la API de OpenAI en tu proyecto. Veremos autenticación, streaming de respuestas y mejores prácticas de prompting.',
    instructor: 'Pablo Carmona',
    instructorInitials: 'PC',
    date: '2025-02-20',
    time: '18:00',
    duration: '1h 30min',
    status: 'upcoming',
    topic: 'IA & APIs',
    attendees: 18,
    maxAttendees: 30,
    recordingUrl: null,
    thumbnailUrl: null,
  },
  {
    id: '2',
    title: 'Automatización sin código con n8n',
    description: 'Taller práctico donde crearemos flujos de automatización desde cero. Conectaremos APIs, bases de datos y servicios de IA.',
    instructor: 'Pablo Carmona',
    instructorInitials: 'PC',
    date: '2025-02-25',
    time: '10:00',
    duration: '2h',
    status: 'upcoming',
    topic: 'Automatización',
    attendees: 12,
    maxAttendees: 25,
    recordingUrl: null,
    thumbnailUrl: null,
  },
  {
    id: '3',
    title: 'Deploy: De local a producción',
    description: 'Cómo llevar tu proyecto de desarrollo local a un entorno de producción usando Vercel, Supabase y dominios personalizados.',
    instructor: 'Pablo Carmona',
    instructorInitials: 'PC',
    date: '2025-03-04',
    time: '18:00',
    duration: '1h 30min',
    status: 'upcoming',
    topic: 'Deploy & DevOps',
    attendees: 8,
    maxAttendees: 30,
    recordingUrl: null,
    thumbnailUrl: null,
  },
  {
    id: '4',
    title: 'Introducción a prompting avanzado',
    description: 'Sesión grabada sobre técnicas de prompting: few-shot, chain-of-thought, system prompts y cómo sacarle el máximo a los modelos de lenguaje.',
    instructor: 'Pablo Carmona',
    instructorInitials: 'PC',
    date: '2025-02-10',
    time: '18:00',
    duration: '1h 15min',
    status: 'recorded',
    topic: 'IA & Prompting',
    attendees: 27,
    maxAttendees: 30,
    recordingUrl: '#',
    thumbnailUrl: null,
  },
  {
    id: '5',
    title: 'Construye tu primer chatbot en 1 hora',
    description: 'Sesión grabada donde construimos un chatbot funcional desde cero usando Next.js, Vercel AI SDK y la API de OpenAI.',
    instructor: 'Pablo Carmona',
    instructorInitials: 'PC',
    date: '2025-02-03',
    time: '10:00',
    duration: '1h',
    status: 'recorded',
    topic: 'Chatbots',
    attendees: 22,
    maxAttendees: 25,
    recordingUrl: '#',
    thumbnailUrl: null,
  },
];

const statusConfig: Record<string, { label: string; variant: 'primary' | 'success' | 'warning' | 'neutral' | 'outline' }> = {
  upcoming: { label: 'Próxima', variant: 'primary' },
  live: { label: 'En vivo', variant: 'warning' },
  recorded: { label: 'Grabada', variant: 'neutral' },
};

const filters = ['Todas', 'Próximas', 'Grabadas'];

export default function SesionesPage() {
  const [sessions] = useState<Session[]>(mockSessions);
  const [activeFilter, setActiveFilter] = useState('Todas');
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  const filtered = sessions.filter((s) => {
    if (activeFilter === 'Próximas') return s.status === 'upcoming' || s.status === 'live';
    if (activeFilter === 'Grabadas') return s.status === 'recorded';
    return true;
  });

  const upcoming = sessions.filter((s) => s.status === 'upcoming' || s.status === 'live');
  const recorded = sessions.filter((s) => s.status === 'recorded');

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-MX', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50/30 dark:bg-gray-800 p-4 sm:p-6 lg:p-8 font-sans text-[#4b4b4b] dark:text-white">
      <div className="max-w-7xl mx-auto space-y-8">
        <SectionHeader
          title="sesiones"
          subtitle="Clases en vivo y grabaciones"
        />

        {/* Next live session highlight */}
        {upcoming.length > 0 && (
          <CardFlat className="shadow-sm overflow-hidden">
            <div className="flex flex-col sm:flex-row">
              {/* Thumbnail / placeholder */}
              <div className="w-full sm:w-64 h-40 sm:h-auto bg-gray-900 flex items-center justify-center flex-shrink-0">
                <div className="text-center">
                  <svg className="w-12 h-12 mx-auto text-[#1472FF] mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="2" y="4" width="20" height="13" rx="2" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 21h8M12 17v4" />
                  </svg>
                  <p className="text-gray-400 text-xs uppercase font-bold tracking-wide">Próxima sesión</p>
                </div>
              </div>
              <div className="p-5 sm:p-6 flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Tag variant="primary" className="!text-xs">
                    {upcoming[0].status === 'live' ? 'En vivo ahora' : 'Próxima'}
                  </Tag>
                  <Caption>{formatDate(upcoming[0].date)} · {upcoming[0].time}</Caption>
                </div>
                <h2 className="text-xl font-extrabold text-[#4b4b4b] dark:text-white leading-tight mb-2">
                  {upcoming[0].title}
                </h2>
                <Body className="text-[#777777] dark:text-gray-400 line-clamp-2 mb-4">
                  {upcoming[0].description}
                </Body>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#1472FF] flex items-center justify-center text-white text-xs font-bold">
                        {upcoming[0].instructorInitials}
                      </div>
                      <Caption>{upcoming[0].instructor}</Caption>
                    </div>
                    <Caption>·</Caption>
                    <Caption>{upcoming[0].duration}</Caption>
                    <Caption>·</Caption>
                    <Caption>{upcoming[0].attendees}/{upcoming[0].maxAttendees} inscritos</Caption>
                  </div>
                  <Button variant="primary" size="md">
                    {upcoming[0].status === 'live' ? 'Unirse ahora' : 'Reservar lugar'}
                  </Button>
                </div>
              </div>
            </div>
          </CardFlat>
        )}

        {/* Filter tabs */}
        <HorizontalScroll fadeEdges>
          {filters.map((filter) => (
            <Button
              key={filter}
              variant={activeFilter === filter ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter(filter)}
              className="flex-shrink-0 whitespace-nowrap"
            >
              {filter}
            </Button>
          ))}
        </HorizontalScroll>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Session List (2/3) */}
          <div className="lg:col-span-2 space-y-4">
            {filtered.length === 0 ? (
              <EmptyState
                icon={
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="2" y="4" width="20" height="13" rx="2" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 21h8M12 17v4" />
                  </svg>
                }
                title="No hay sesiones"
                description="Las sesiones aparecerán aquí cuando se programen nuevas clases en vivo."
              />
            ) : (
              <>
                {/* Upcoming sessions */}
                {activeFilter !== 'Grabadas' && filtered.some((s) => s.status === 'upcoming' || s.status === 'live') && (
                  <div className="space-y-3">
                    <Divider title="Próximas" />
                    {filtered
                      .filter((s) => s.status === 'upcoming' || s.status === 'live')
                      .map((session) => (
                        <SessionCard
                          key={session.id}
                          session={session}
                          isSelected={selectedSession?.id === session.id}
                          onClick={() => setSelectedSession(session)}
                          formatDate={formatDate}
                        />
                      ))}
                  </div>
                )}

                {/* Recorded sessions */}
                {activeFilter !== 'Próximas' && filtered.some((s) => s.status === 'recorded') && (
                  <div className="space-y-3">
                    <Divider title="Grabaciones" />
                    {filtered
                      .filter((s) => s.status === 'recorded')
                      .map((session) => (
                        <SessionCard
                          key={session.id}
                          session={session}
                          isSelected={selectedSession?.id === session.id}
                          onClick={() => setSelectedSession(session)}
                          formatDate={formatDate}
                        />
                      ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right: Detail Panel (1/3) */}
          <div className="hidden lg:block">
            {selectedSession ? (
              <CardFlat className="shadow-sm sticky top-8">
                <div className="p-6 space-y-5">
                  {/* Status + date */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Tag variant={statusConfig[selectedSession.status].variant}>
                      {statusConfig[selectedSession.status].label}
                    </Tag>
                    <Tag variant="outline">{selectedSession.topic}</Tag>
                  </div>

                  {/* Title */}
                  <h2 className="text-xl font-extrabold tracking-tight text-[#4b4b4b] dark:text-white leading-tight">
                    {selectedSession.title}
                  </h2>

                  {/* Date & time */}
                  <div className="flex items-center gap-2 text-[#777777] dark:text-gray-400">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <Caption>{formatDate(selectedSession.date)} · {selectedSession.time} · {selectedSession.duration}</Caption>
                  </div>

                  {/* Instructor */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#1472FF] flex items-center justify-center text-white font-bold text-sm">
                      {selectedSession.instructorInitials}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-[#4b4b4b] dark:text-white">{selectedSession.instructor}</p>
                      <Caption>Instructor</Caption>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <Headline className="mb-2">descripcion</Headline>
                    <Body className="leading-relaxed">{selectedSession.description}</Body>
                  </div>

                  {/* Attendees */}
                  {selectedSession.status !== 'recorded' && (
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-[#777777]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <Caption>{selectedSession.attendees} de {selectedSession.maxAttendees} lugares ocupados</Caption>
                    </div>
                  )}

                  {/* CTA */}
                  {selectedSession.status === 'recorded' ? (
                    <Button variant="primary" className="w-full">
                      Ver grabación
                    </Button>
                  ) : selectedSession.status === 'live' ? (
                    <Button variant="primary" className="w-full">
                      Unirse ahora
                    </Button>
                  ) : (
                    <Button variant="primary" className="w-full">
                      Reservar lugar
                    </Button>
                  )}
                </div>
              </CardFlat>
            ) : (
              <CardFlat className="shadow-sm p-6">
                <div className="text-center py-8">
                  <svg className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="2" y="4" width="20" height="13" rx="2" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 21h8M12 17v4" />
                  </svg>
                  <Body className="text-[#777777] dark:text-gray-400">Selecciona una sesión para ver los detalles</Body>
                </div>
              </CardFlat>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Session card component
function SessionCard({
  session,
  isSelected,
  onClick,
  formatDate,
}: {
  session: Session;
  isSelected: boolean;
  onClick: () => void;
  formatDate: (date: string) => string;
}) {
  const isRecorded = session.status === 'recorded';
  const isLive = session.status === 'live';

  return (
    <div onClick={onClick} className="cursor-pointer">
      <CardFlat
        className={`shadow-sm hover:shadow-md transition-shadow ${
          isSelected ? 'ring-2 ring-[#1472FF] ring-offset-2 dark:ring-offset-gray-800' : ''
        }`}
      >
        <div className="p-4 sm:p-5">
          <div className="flex items-start gap-4">
            {/* Date badge */}
            <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center flex-shrink-0 ${
              isLive
                ? 'bg-orange-100 dark:bg-orange-900/30'
                : isRecorded
                  ? 'bg-gray-100 dark:bg-gray-700'
                  : 'bg-[#1472FF]/10 dark:bg-[#1472FF]/20'
            }`}>
              <span className={`text-xs font-bold uppercase leading-none ${
                isLive ? 'text-orange-600' : isRecorded ? 'text-[#777777]' : 'text-[#1472FF]'
              }`}>
                {new Date(session.date).toLocaleDateString('es-MX', { month: 'short' })}
              </span>
              <span className={`text-xl font-extrabold leading-none ${
                isLive ? 'text-orange-600' : isRecorded ? 'text-[#4b4b4b] dark:text-gray-300' : 'text-[#1472FF]'
              }`}>
                {new Date(session.date).getDate()}
              </span>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Tag variant={statusConfig[session.status].variant} className="!text-xs !px-2 !py-0.5">
                  {statusConfig[session.status].label}
                </Tag>
                <Tag variant="outline" className="!text-xs !px-2 !py-0.5">
                  {session.topic}
                </Tag>
              </div>
              <p className="font-bold text-[#4b4b4b] dark:text-white truncate mb-1">
                {session.title}
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <Caption>{session.time} · {session.duration}</Caption>
                <Caption>·</Caption>
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-[#1472FF] flex items-center justify-center text-white text-[10px] font-bold">
                    {session.instructorInitials}
                  </div>
                  <Caption>{session.instructor}</Caption>
                </div>
              </div>
            </div>

            {/* Action indicator */}
            <div className="flex-shrink-0 self-center">
              {isRecorded ? (
                <svg className="w-5 h-5 text-[#777777]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-[#777777]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </div>
          </div>
        </div>
      </CardFlat>
    </div>
  );
}

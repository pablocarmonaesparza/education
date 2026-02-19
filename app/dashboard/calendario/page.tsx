'use client';

import { useState, useMemo } from 'react';
import Button from '@/components/ui/Button';
import { CardFlat } from '@/components/ui/Card';
import Tag from '@/components/ui/Tag';
import { Headline, Body, Caption } from '@/components/ui/Typography';
import SectionHeader from '@/components/ui/SectionHeader';
import IconButton from '@/components/ui/IconButton';
import Divider from '@/components/ui/Divider';

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  time: string;
  type: 'sesion' | 'taller' | 'networking' | 'deadline';
  duration: string;
}

// Mock data — will be replaced with real data
const mockEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Sesión en vivo: Introducción a ChatGPT API',
    description: 'Aprende a integrar ChatGPT en tus proyectos desde cero.',
    date: '2025-02-20',
    time: '18:00',
    type: 'sesion',
    duration: '1h 30min',
  },
  {
    id: '2',
    title: 'Taller: Automatización con n8n',
    description: 'Taller práctico para crear flujos de automatización.',
    date: '2025-02-22',
    time: '10:00',
    type: 'taller',
    duration: '2h',
  },
  {
    id: '3',
    title: 'Networking: Conecta con la comunidad',
    description: 'Espacio abierto para conocer a otros estudiantes y compartir proyectos.',
    date: '2025-02-25',
    time: '19:00',
    type: 'networking',
    duration: '1h',
  },
  {
    id: '4',
    title: 'Fecha límite: Entrega del reto 3',
    description: 'Último día para entregar el reto de automatización.',
    date: '2025-02-28',
    time: '23:59',
    type: 'deadline',
    duration: '-',
  },
  {
    id: '5',
    title: 'Sesión en vivo: Deploy y producción',
    description: 'Cómo llevar tu proyecto de IA a producción con Vercel y Supabase.',
    date: '2025-03-04',
    time: '18:00',
    type: 'sesion',
    duration: '1h 30min',
  },
  {
    id: '6',
    title: 'Pitch Day: Presenta tu producto',
    description: 'Presenta tu producto terminado frente a la comunidad y recibe feedback.',
    date: '2025-03-10',
    time: '17:00',
    type: 'networking',
    duration: '2h',
  },
];

const typeLabels: Record<string, string> = {
  sesion: 'Sesión en vivo',
  taller: 'Taller',
  networking: 'Networking',
  deadline: 'Fecha límite',
};

const typeVariants: Record<string, 'primary' | 'outline' | 'success' | 'warning' | 'neutral'> = {
  sesion: 'primary',
  taller: 'success',
  networking: 'outline',
  deadline: 'warning',
};

const DAYS_ES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const MONTHS_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay();
  // Convert Sunday=0 to Monday-based (Mon=0, Sun=6)
  return day === 0 ? 6 : day - 1;
}

export default function CalendarioPage() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [events] = useState<CalendarEvent[]>(mockEvents);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDate(null);
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDate(null);
  };

  // Events for the current month
  const monthEvents = useMemo(() => {
    return events.filter((e) => {
      const d = new Date(e.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
  }, [events, currentMonth, currentYear]);

  // Events indexed by day number
  const eventsByDay = useMemo(() => {
    const map: Record<number, CalendarEvent[]> = {};
    monthEvents.forEach((e) => {
      const day = new Date(e.date).getDate();
      if (!map[day]) map[day] = [];
      map[day].push(e);
    });
    return map;
  }, [monthEvents]);

  // Events for selected date
  const selectedEvents = useMemo(() => {
    if (!selectedDate) return [];
    return events.filter((e) => e.date === selectedDate);
  }, [events, selectedDate]);

  // Upcoming events (next 5)
  const upcomingEvents = useMemo(() => {
    const todayStr = today.toISOString().split('T')[0];
    return events
      .filter((e) => e.date >= todayStr)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 5);
  }, [events, today]);

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const formatEventDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
  };

  // Build calendar grid
  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);

  return (
    <div className="min-h-screen bg-gray-50/30 dark:bg-gray-800 p-4 sm:p-6 lg:p-8 font-sans text-[#4b4b4b] dark:text-white">
      <div className="max-w-7xl mx-auto space-y-8">
        <SectionHeader
          title="calendario"
          subtitle="Actividades y eventos del mes"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Calendar Grid (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            <CardFlat className="shadow-sm">
              <div className="p-4 sm:p-6">
                {/* Month navigation */}
                <div className="flex items-center justify-between mb-6">
                  <IconButton variant="outline" aria-label="Mes anterior" onClick={prevMonth}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </IconButton>
                  <h2 className="text-xl font-extrabold text-[#4b4b4b] dark:text-white">
                    {MONTHS_ES[currentMonth].toLowerCase()} {currentYear}
                  </h2>
                  <IconButton variant="outline" aria-label="Mes siguiente" onClick={nextMonth}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </IconButton>
                </div>

                {/* Day headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {DAYS_ES.map((day) => (
                    <div key={day} className="text-center">
                      <Caption className="font-bold uppercase">{day}</Caption>
                    </div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day, idx) => {
                    if (day === null) {
                      return <div key={`empty-${idx}`} className="aspect-square" />;
                    }

                    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const hasEvents = eventsByDay[day] && eventsByDay[day].length > 0;
                    const isToday = dateStr === todayStr;
                    const isSelected = dateStr === selectedDate;

                    return (
                      <button
                        key={day}
                        onClick={() => setSelectedDate(dateStr === selectedDate ? null : dateStr)}
                        className={`aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all duration-150 text-sm font-medium ${
                          isSelected
                            ? 'bg-[#1472FF] text-white'
                            : isToday
                              ? 'bg-[#1472FF]/10 text-[#1472FF] font-bold'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-[#4b4b4b] dark:text-gray-300'
                        }`}
                      >
                        {day}
                        {hasEvents && (
                          <div className="flex gap-0.5 mt-0.5">
                            {eventsByDay[day].slice(0, 3).map((ev) => (
                              <div
                                key={ev.id}
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isSelected ? 'bg-white' :
                                  ev.type === 'sesion' ? 'bg-[#1472FF]' :
                                  ev.type === 'taller' ? 'bg-[#22c55e]' :
                                  ev.type === 'deadline' ? 'bg-orange-500' :
                                  'bg-gray-400'
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#1472FF]" />
                    <Caption>Sesión</Caption>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" />
                    <Caption>Taller</Caption>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-gray-400" />
                    <Caption>Networking</Caption>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                    <Caption>Deadline</Caption>
                  </div>
                </div>
              </div>
            </CardFlat>

            {/* Selected date events */}
            {selectedDate && (
              <div className="space-y-3">
                <Headline>
                  {new Date(selectedDate + 'T00:00:00').toLocaleDateString('es-MX', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  })}
                </Headline>
                {selectedEvents.length === 0 ? (
                  <CardFlat className="p-5 shadow-sm">
                    <Body className="text-[#777777] dark:text-gray-400 text-center">
                      No hay actividades programadas para este día
                    </Body>
                  </CardFlat>
                ) : (
                  selectedEvents.map((ev) => (
                    <CardFlat key={ev.id} className="p-5 shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Tag variant={typeVariants[ev.type]} className="!text-xs">
                              {typeLabels[ev.type]}
                            </Tag>
                            <Caption>{ev.time} · {ev.duration}</Caption>
                          </div>
                          <p className="font-bold text-[#4b4b4b] dark:text-white">{ev.title}</p>
                          <Body className="mt-1 text-[#777777] dark:text-gray-400 text-sm">{ev.description}</Body>
                        </div>
                      </div>
                    </CardFlat>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Right: Upcoming Events (1/3) */}
          <div className="space-y-6">
            <CardFlat className="shadow-sm sticky top-8">
              <div className="p-6">
                <Headline className="mb-4">proximos eventos</Headline>
                {upcomingEvents.length === 0 ? (
                  <Body className="text-[#777777] dark:text-gray-400">No hay eventos próximos</Body>
                ) : (
                  <div className="space-y-4">
                    {upcomingEvents.map((ev) => (
                      <div
                        key={ev.id}
                        className="group cursor-pointer"
                        onClick={() => {
                          const d = new Date(ev.date);
                          setCurrentMonth(d.getMonth());
                          setCurrentYear(d.getFullYear());
                          setSelectedDate(ev.date);
                        }}
                      >
                        <div className="flex items-start gap-3">
                          {/* Date badge */}
                          <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700 flex flex-col items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-[#1472FF] uppercase leading-none">
                              {formatEventDate(ev.date).split(' ')[1]}
                            </span>
                            <span className="text-lg font-extrabold text-[#4b4b4b] dark:text-white leading-none">
                              {new Date(ev.date).getDate()}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-sm text-[#4b4b4b] dark:text-white group-hover:text-[#1472FF] transition-colors truncate">
                              {ev.title}
                            </p>
                            <Caption>{ev.time} · {typeLabels[ev.type]}</Caption>
                          </div>
                        </div>
                        {ev !== upcomingEvents[upcomingEvents.length - 1] && (
                          <Divider className="mt-4" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardFlat>
          </div>
        </div>
      </div>
    </div>
  );
}

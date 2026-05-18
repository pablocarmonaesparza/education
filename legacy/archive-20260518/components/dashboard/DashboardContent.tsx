'use client';

import Link from 'next/link';
import { useSidebar } from '@/contexts/SidebarContext';
import Card, { CardFlat } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Tag from '@/components/ui/Tag';
import ProgressBar from '@/components/ui/ProgressBar';
import StatCard from '@/components/ui/StatCard';

interface DashboardContentProps {
  userName: string;
  userEmail: string;
  completedVideos: number;
  totalVideos: number;
  overallProgress: number;
  hasPersonalizedPath: boolean;
  userProject?: string;
  projectType?: string;
  skills?: string[];
  tools?: string[];
  learningPath?: any;
  userTier?: 'basic' | 'personalized' | 'premium';
  phasesCompleted?: number;
  totalPhases?: number;
  currentPhase?: number;
  currentVideo?: number;
  timeSpent?: number;
  estimatedTime?: number;
  artifacts?: any[];
  checkpointResults?: any[];
  weeklyGoal?: number;
  weeklyProgress?: number;
  streak?: number;
  currentXP?: number;
  level?: number;
  earnedBadges?: string[];
}

// Helper para generar un título corto del proyecto
const getProjectTitle = (projectDescription?: string) => {
  if (!projectDescription) return 'Tu Proyecto';

  // Palabras clave a ignorar para el título corto
  const stopWords = ['sistema', 'de', 'para', 'que', 'con', 'el', 'la', 'los', 'las', 'un', 'una', 'vía', 'mediante'];

  // Intentar encontrar un nombre propio o sustantivos clave
  const words = projectDescription.split(' ');

  let title = projectDescription;

  // Si es muy largo, tomar las primeras 3-4 palabras significativas
  if (words.length > 4) {
    // Filtrar palabras comunes si es posible, pero mantener legibilidad básica
    const significantWords = words.filter(w => !stopWords.includes(w.toLowerCase()));
    title = significantWords.slice(0, 3).join(' ');
  }

  // Convertir a Title Case
  return title.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
};

export default function DashboardContent(props: DashboardContentProps) {
  const { isExpanded } = useSidebar();

  // Encontrar el video actual y sus detalles
  let currentVideoData = null;
  let currentPhaseData = null;

  if (props.learningPath?.phases) {
    const phaseIndex = (props.currentPhase || 1) - 1;
    const videoIndex = (props.currentVideo || 1) - 1;

    if (props.learningPath.phases[phaseIndex]) {
      currentPhaseData = props.learningPath.phases[phaseIndex];
      if (currentPhaseData.videos && currentPhaseData.videos[videoIndex]) {
        currentVideoData = currentPhaseData.videos[videoIndex];
      }
    }
  }

  // Generar título corto del proyecto
  const projectTitle = getProjectTitle(props.userProject);

  return (
    <div className="min-h-screen bg-gray-50/30 dark:bg-gray-800 p-4 sm:p-6 lg:p-8 font-sans text-ink dark:text-white">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header Section - Welcome & Context */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-ink dark:text-white mb-2 tracking-tight">
              hola, {props.userName.split(' ')[0].toLowerCase()}
            </h1>
            <p className="text-ink-muted dark:text-gray-400">
              {props.streak && props.streak > 0
                ? `¡Estás en una racha de ${props.streak} días! Sigue así.`
                : 'Listo para continuar tu aprendizaje hoy?'}
            </p>
          </div>
          <div className="text-right hidden md:block">
            <p className="text-sm text-ink-muted dark:text-gray-400 font-bold uppercase tracking-wider mb-1">Tu Proyecto</p>
            <p className="font-extrabold text-lg text-primary">
              {projectTitle}
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column - Main Content (2/3) */}
          <div className="lg:col-span-2 space-y-8">

            {/* Hero Card - Continue Learning */}
            <CardFlat className="shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6 sm:p-8">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <Tag variant="primary" className="mb-3 text-xs font-bold">
                      Continuar donde lo dejaste
                    </Tag>
                    <h2 className="text-2xl font-extrabold text-ink dark:text-white mb-2 tracking-tight">
                      {currentVideoData?.description || 'Siguiente lección'}
                    </h2>
                    <p className="text-ink-muted dark:text-gray-400">
                      {currentPhaseData?.phase_name ? `Fase ${props.currentPhase}: ${currentPhaseData.phase_name}` : 'Cargando ruta...'}
                    </p>
                  </div>
                </div>

                <CardFlat className="p-4 sm:p-6 mb-6 bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-900 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                   {/* Lesson preview placeholder */}
                  <div className="w-full sm:w-48 h-28 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-black/5 group-hover:bg-black/10 transition-colors" />
                    <svg className="w-12 h-12 text-primary opacity-80 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>

                  <div className="flex-1">
                    <h3 className="font-bold text-ink dark:text-white mb-2 line-clamp-1">
                      {currentVideoData?.section || 'Lección actual'}
                    </h3>
                    <p className="text-sm text-ink-muted dark:text-gray-400 mb-4 line-clamp-2">
                      {currentVideoData?.why_relevant || 'Aprende los conceptos clave para avanzar en tu proyecto.'}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-ink-muted dark:text-gray-400 font-medium">
                       <span className="flex items-center gap-1">
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                         {currentVideoData?.duration || '5 min'}
                       </span>
                       <span>•</span>
                       <span>Lección {props.currentVideo} de {currentPhaseData?.videos?.length || '?'}</span>
                    </div>
                  </div>
                </CardFlat>

                <div className="flex flex-wrap gap-4">
                  <Button
                    variant="primary"
                    size="lg"
                    rounded2xl
                    href={`/dashboard/my-path/video/${props.currentPhase || 1}/${props.currentVideo || 1}`}
                    className="flex-1 sm:flex-none"
                  >
                    <svg className="mr-2 -ml-1 w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                    Empezar lección
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    rounded2xl
                    href="/dashboard/my-path"
                    className="flex-1 sm:flex-none text-primary border-primary hover:bg-primary/5 dark:hover:bg-primary/10"
                  >
                    VER RUTA COMPLETA
                  </Button>
                </div>
              </div>
            </CardFlat>

            {/* Skills & Tools Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Skills Card */}
              <CardFlat className="p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  <h3 className="font-bold text-ink dark:text-white">Habilidades en Desarrollo</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {props.skills && props.skills.length > 0 ? (
                    props.skills.slice(0, 6).map((skill, i) => (
                      <Tag key={i} variant="primary">{skill}</Tag>
                    ))
                  ) : (
                    <p className="text-sm text-ink-muted dark:text-gray-400">Se definirán en tu ruta</p>
                  )}
                </div>
              </CardFlat>

              {/* Tools Card */}
              <CardFlat className="p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <h3 className="font-bold text-ink dark:text-white">Stack Tecnológico</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {props.tools && props.tools.length > 0 ? (
                    props.tools.slice(0, 6).map((tool, i) => (
                      <Tag key={i} variant="primary">{tool}</Tag>
                    ))
                  ) : (
                    <p className="text-sm text-ink-muted dark:text-gray-400">Se definirán en tu ruta</p>
                  )}
                </div>
              </CardFlat>
            </div>

          </div>

          {/* Right Column - Stats & Progress (1/3) */}
          <div className="space-y-8">

            {/* Overall Progress Card */}
            <CardFlat className="p-6 shadow-sm">
              <h3 className="font-extrabold text-ink dark:text-white mb-6 flex items-center justify-between tracking-tight">
                tu progreso
                <span className="text-2xl font-extrabold text-primary">
                  {props.overallProgress}%
                </span>
              </h3>

              <div className="relative pt-1 mb-6">
                <ProgressBar value={props.overallProgress} size="lg" color="primary" durationMs={1000} className="mb-2" />
                <div className="flex justify-between text-xs text-ink-muted dark:text-gray-400 font-medium">
                  <span>Inicio</span>
                  <span>Meta: 100%</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                  <span className="text-sm text-ink-muted dark:text-gray-400">Lecciones completadas</span>
                  <span className="font-bold text-ink dark:text-white">{props.completedVideos} <span className="text-ink-muted dark:text-gray-400 font-normal">/ {props.totalVideos}</span></span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                  <span className="text-sm text-ink-muted dark:text-gray-400">Fases</span>
                  <span className="font-bold text-ink dark:text-white">{props.phasesCompleted} <span className="text-ink-muted dark:text-gray-400 font-normal">/ {props.totalPhases}</span></span>
                </div>
              </div>
            </CardFlat>

            {/* Activity Stats */}
            <CardFlat className="p-6 shadow-sm">
              <h3 className="font-extrabold text-ink dark:text-white mb-4 tracking-tight">tu actividad</h3>
              <div className="grid grid-cols-2 gap-4">
                <StatCard icon="🔥" value={String(props.streak || 0)} label="Racha Días" color="orange" />
                <StatCard icon="🎯" value={String(props.weeklyProgress || 0)} label="Lecciones Sem." color="green" />
                <StatCard icon="⭐" value={String(props.level || 1)} label="Nivel" color="blue" />
                <StatCard icon="⚡" value={String(props.currentXP || 0)} label="XP Total" color="blue" />
              </div>
            </CardFlat>

          </div>
        </div>
      </div>
    </div>
  );
}

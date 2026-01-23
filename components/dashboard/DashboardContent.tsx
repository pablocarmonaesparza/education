'use client';

import Link from 'next/link';
import { useSidebar } from '@/contexts/SidebarContext';

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
    <div className="min-h-screen bg-gray-50/30 dark:bg-gray-950 p-4 sm:p-6 lg:p-8 font-sans text-gray-900 dark:text-white">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section - Welcome & Context */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-[#4b4b4b] dark:text-white mb-2 tracking-tight">
              hola, {props.userName.split(' ')[0].toLowerCase()}
            </h1>
            <p className="text-[#777777] dark:text-gray-400">
              {props.streak && props.streak > 0 
                ? `¡Estás en una racha de ${props.streak} días! Sigue así.` 
                : 'Listo para continuar tu aprendizaje hoy?'}
            </p>
          </div>
          <div className="text-right hidden md:block">
            <p className="text-sm text-[#777777] dark:text-gray-400 font-bold uppercase tracking-wider mb-1">Tu Proyecto</p>
            <p className="font-extrabold text-lg text-[#1472FF]">
              {projectTitle}
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Main Content (2/3) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Hero Card - Continue Learning */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border-2 border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6 sm:p-8">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#1472FF]/10 text-[#1472FF] mb-3">
                      Continuar donde lo dejaste
                    </span>
                    <h2 className="text-2xl font-extrabold text-[#4b4b4b] dark:text-white mb-2 tracking-tight">
                      {currentVideoData?.description || 'Siguiente lección'}
                    </h2>
                    <p className="text-[#777777] dark:text-gray-400">
                      {currentPhaseData?.phase_name ? `Fase ${props.currentPhase}: ${currentPhaseData.phase_name}` : 'Cargando ruta...'}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 sm:p-6 mb-6 border-2 border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                   {/* Video Thumbnail Placeholder */}
                  <div className="w-full sm:w-48 h-28 bg-[#1472FF]/10 rounded-2xl flex items-center justify-center flex-shrink-0 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-black/5 group-hover:bg-black/10 transition-colors" />
                    <svg className="w-12 h-12 text-[#1472FF] opacity-80 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-bold text-[#4b4b4b] dark:text-white mb-2 line-clamp-1">
                      {currentVideoData?.section || 'Lección actual'}
                    </h3>
                    <p className="text-sm text-[#777777] dark:text-gray-400 mb-4 line-clamp-2">
                      {currentVideoData?.why_relevant || 'Aprende los conceptos clave para avanzar en tu proyecto.'}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-[#777777] dark:text-gray-400 font-medium">
                       <span className="flex items-center gap-1">
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                         {currentVideoData?.duration || '5 min'}
                       </span>
                       <span>•</span>
                       <span>Video {props.currentVideo} de {currentPhaseData?.videos?.length || '?'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4">
                  <Link
                    href={`/dashboard/my-path/video/${props.currentPhase || 1}/${props.currentVideo || 1}`}
                    className="flex-1 sm:flex-none inline-flex justify-center items-center px-6 py-4 rounded-2xl text-base font-bold uppercase tracking-wide text-white bg-[#1472FF] border-b-4 border-[#0E5FCC] hover:bg-[#1265e0] active:border-b-0 active:mt-1 transition-all duration-150"
                  >
                    <svg className="mr-2 -ml-1 w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                    REPRODUCIR VIDEO
                  </Link>
                  <Link
                    href="/dashboard/my-path"
                    className="flex-1 sm:flex-none inline-flex justify-center items-center px-6 py-4 rounded-2xl text-base font-bold uppercase tracking-wide text-[#1472FF] bg-white dark:bg-gray-800 border-2 border-b-4 border-[#1472FF] hover:bg-[#1472FF]/5 dark:hover:bg-[#1472FF]/10 active:border-b-2 active:mt-[2px] transition-all duration-150"
                  >
                    VER RUTA COMPLETA
                  </Link>
                </div>
              </div>
            </div>

            {/* Skills & Tools Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Skills Card */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-5 h-5 text-[#1472FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  <h3 className="font-bold text-[#4b4b4b] dark:text-white">Habilidades en Desarrollo</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {props.skills && props.skills.length > 0 ? (
                    props.skills.slice(0, 6).map((skill, i) => (
                      <span key={i} className="px-3 py-1 bg-[#1472FF]/10 text-[#0E5FCC] rounded-full text-sm font-medium border border-[#1472FF]/20">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">Se definirán en tu ruta</p>
                  )}
                </div>
              </div>

              {/* Tools Card */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-5 h-5 text-[#1472FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <h3 className="font-bold text-[#4b4b4b] dark:text-white">Stack Tecnológico</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {props.tools && props.tools.length > 0 ? (
                    props.tools.slice(0, 6).map((tool, i) => (
                      <span key={i} className="px-3 py-1 bg-[#1472FF]/10 text-[#0E5FCC] rounded-full text-sm font-medium border border-[#1472FF]/20">
                        {tool}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">Se definirán en tu ruta</p>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Right Column - Stats & Progress (1/3) */}
          <div className="space-y-8">
            
            {/* Overall Progress Card */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700 shadow-sm">
              <h3 className="font-extrabold text-[#4b4b4b] dark:text-white mb-6 flex items-center justify-between tracking-tight">
                tu progreso
                <span className="text-2xl font-extrabold text-[#1472FF]">
                  {props.overallProgress}%
                </span>
              </h3>
              
              <div className="relative pt-1 mb-6">
                <div className="overflow-hidden h-3 mb-2 text-xs flex rounded-full bg-gray-100 dark:bg-gray-800">
                  <div 
                    style={{ width: `${props.overallProgress}%` }} 
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-[#1472FF] transition-all duration-1000 rounded-full"
                  />
                </div>
                <div className="flex justify-between text-xs text-[#777777] dark:text-gray-400 font-medium">
                  <span>Inicio</span>
                  <span>Meta: 100%</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                  <span className="text-sm text-[#777777] dark:text-gray-400">Videos completados</span>
                  <span className="font-bold text-[#4b4b4b] dark:text-white">{props.completedVideos} <span className="text-[#777777] dark:text-gray-400 font-normal">/ {props.totalVideos}</span></span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                  <span className="text-sm text-[#777777] dark:text-gray-400">Fases</span>
                  <span className="font-bold text-[#4b4b4b] dark:text-white">{props.phasesCompleted} <span className="text-[#777777] dark:text-gray-400 font-normal">/ {props.totalPhases}</span></span>
                </div>
              </div>
            </div>

            {/* Activity Stats */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700 shadow-sm">
              <h3 className="font-extrabold text-[#4b4b4b] dark:text-white mb-4 tracking-tight">tu actividad</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-800 text-center">
                  <div className="text-2xl mb-1">🔥</div>
                  <div className="text-2xl font-extrabold text-[#4b4b4b] dark:text-white">{props.streak || 0}</div>
                  <div className="text-xs text-[#777777] dark:text-gray-400 uppercase font-bold tracking-wide">Racha Días</div>
                </div>
                <div className="p-4 rounded-2xl bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 text-center">
                  <div className="text-2xl mb-1">🎯</div>
                  <div className="text-2xl font-extrabold text-[#4b4b4b] dark:text-white">{props.weeklyProgress || 0}</div>
                  <div className="text-xs text-[#777777] dark:text-gray-400 uppercase font-bold tracking-wide">Videos Sem.</div>
                </div>
                <div className="p-4 rounded-2xl bg-[#1472FF]/10 border-2 border-[#1472FF]/30 text-center">
                  <div className="text-2xl mb-1">⭐</div>
                  <div className="text-2xl font-extrabold text-[#4b4b4b] dark:text-white">{props.level || 1}</div>
                  <div className="text-xs text-[#777777] dark:text-gray-400 uppercase font-bold tracking-wide">Nivel</div>
                </div>
                <div className="p-4 rounded-2xl bg-[#1472FF]/10 border-2 border-[#1472FF]/30 text-center">
                  <div className="text-2xl mb-1">⚡</div>
                  <div className="text-2xl font-extrabold text-[#4b4b4b] dark:text-white">{props.currentXP || 0}</div>
                  <div className="text-xs text-[#777777] dark:text-gray-400 uppercase font-bold tracking-wide">XP Total</div>
                </div>
              </div>
            </div>

            {/* Accesos Rápidos eliminados como se solicitó */}

          </div>
        </div>
      </div>
    </div>
  );
}

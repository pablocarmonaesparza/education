'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { SpinnerPage } from '@/components/ui/Spinner';
import Button from '@/components/ui/Button';
import Card, { CardFlat } from '@/components/ui/Card';
import Tag from '@/components/ui/Tag';
import { Title, Subtitle, Headline, Body, Caption } from '@/components/ui/Typography';
import SectionHeader from '@/components/ui/SectionHeader';
import EmptyState from '@/components/ui/EmptyState';
import Divider from '@/components/ui/Divider';

interface Opportunity {
  id: string;
  title: string;
  company: string;
  type: 'freelance' | 'fulltime' | 'parttime' | 'contract';
  location: string;
  description: string;
  skills: string[];
  postedAt: string;
}

// Mock data — will be replaced with real data from Supabase
const mockOpportunities: Opportunity[] = [
  {
    id: '1',
    title: 'Desarrollador de chatbots con IA',
    company: 'StartupX',
    type: 'freelance',
    location: 'Remoto',
    description: 'Buscamos a alguien que pueda crear chatbots inteligentes usando modelos de lenguaje para atención al cliente.',
    skills: ['ChatGPT API', 'Node.js', 'Automatización'],
    postedAt: '2025-02-15',
  },
  {
    id: '2',
    title: 'Automatización de procesos internos',
    company: 'Empresa MX',
    type: 'contract',
    location: 'CDMX / Remoto',
    description: 'Proyecto de 3 meses para automatizar flujos de trabajo internos usando herramientas de IA y no-code.',
    skills: ['n8n', 'Make', 'APIs REST', 'IA Generativa'],
    postedAt: '2025-02-12',
  },
  {
    id: '3',
    title: 'Creador de contenido educativo con IA',
    company: 'EdTech Corp',
    type: 'parttime',
    location: 'Remoto',
    description: 'Genera cursos y material educativo usando herramientas de inteligencia artificial generativa.',
    skills: ['Prompting', 'Diseño instruccional', 'IA Generativa'],
    postedAt: '2025-02-10',
  },
  {
    id: '4',
    title: 'Consultor de implementación de IA',
    company: 'Consultora Digital',
    type: 'fulltime',
    location: 'Monterrey',
    description: 'Asesora a empresas en la adopción de herramientas de IA para mejorar sus operaciones y productividad.',
    skills: ['Consultoría', 'IA', 'Gestión de proyectos', 'Presentaciones'],
    postedAt: '2025-02-08',
  },
];

const typeLabels: Record<string, string> = {
  freelance: 'Freelance',
  fulltime: 'Tiempo completo',
  parttime: 'Medio tiempo',
  contract: 'Contrato',
};

const typeVariants: Record<string, 'primary' | 'outline' | 'success' | 'warning' | 'neutral'> = {
  freelance: 'primary',
  fulltime: 'success',
  parttime: 'warning',
  contract: 'neutral',
};

export default function OportunidadesPage() {
  const [opportunities] = useState<Opportunity[]>(mockOpportunities);
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);
  const [userProject, setUserProject] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: intakeData } = await supabase
          .from('intake_responses')
          .select('responses')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        const projectIdea =
          intakeData?.responses?.project_idea ||
          intakeData?.responses?.project ||
          '';
        setUserProject(projectIdea);
      }
      setIsLoading(false);
    }
    fetchData();
  }, [supabase]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
    });
  };

  if (isLoading) return <SpinnerPage />;

  return (
    <div className="min-h-screen bg-gray-50/30 dark:bg-gray-800 p-4 sm:p-6 lg:p-8 font-sans text-[#4b4b4b] dark:text-white">
      <div className="max-w-7xl mx-auto space-y-8">
        <SectionHeader
          title="oportunidades"
          subtitle="Trabajos relacionados con tu proyecto"
        />

        {/* User project context */}
        {userProject && (
          <CardFlat className="p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[#1472FF] flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.547-.547z" />
                </svg>
              </div>
              <div>
                <Headline>tu proyecto</Headline>
                <Body className="mt-1 leading-relaxed text-[#777777] dark:text-gray-400">{userProject}</Body>
                <Caption className="mt-2">Las oportunidades se filtran segun tu perfil y proyecto</Caption>
              </div>
            </div>
          </CardFlat>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Opportunity List */}
          <div className="lg:col-span-2 space-y-4">
            {opportunities.length === 0 ? (
              <EmptyState
                icon={
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.547-.547z" />
                  </svg>
                }
                title="No hay oportunidades aun"
                description="Las oportunidades aparecerán aquí a medida que se publiquen. Completa tu curso para mejorar tu perfil."
              />
            ) : (
              opportunities.map((opp) => {
                const isSelected = selectedOpp?.id === opp.id;
                return (
                  <div
                    key={opp.id}
                    onClick={() => setSelectedOpp(opp)}
                    className="cursor-pointer"
                  >
                    <CardFlat
                      className={`shadow-sm hover:shadow-md transition-shadow ${
                        isSelected
                          ? 'ring-2 ring-[#1472FF] ring-offset-2 dark:ring-offset-gray-800'
                          : ''
                      }`}
                    >
                      <div className="p-4 sm:p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-base font-bold text-[#4b4b4b] dark:text-white truncate">
                              {opp.title}
                            </p>
                            <Caption className="mt-0.5">{opp.company} · {opp.location}</Caption>
                          </div>
                          <Tag variant={typeVariants[opp.type]} className="!text-xs flex-shrink-0">
                            {typeLabels[opp.type]}
                          </Tag>
                        </div>

                        <Body className="mt-3 line-clamp-2 text-[#777777] dark:text-gray-400">
                          {opp.description}
                        </Body>

                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex flex-wrap gap-1.5">
                            {opp.skills.slice(0, 3).map((skill) => (
                              <Tag key={skill} variant="outline" className="!text-xs !px-2 !py-0.5">
                                {skill}
                              </Tag>
                            ))}
                            {opp.skills.length > 3 && (
                              <Caption>+{opp.skills.length - 3}</Caption>
                            )}
                          </div>
                          <Caption>{formatDate(opp.postedAt)}</Caption>
                        </div>
                      </div>
                    </CardFlat>
                  </div>
                );
              })
            )}
          </div>

          {/* Right: Detail Panel */}
          <div className="hidden lg:block">
            {selectedOpp ? (
              <CardFlat className="shadow-sm sticky top-8">
                <div className="p-6 space-y-5">
                  {/* Header */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Tag variant={typeVariants[selectedOpp.type]}>
                      {typeLabels[selectedOpp.type]}
                    </Tag>
                    <Caption>{formatDate(selectedOpp.postedAt)}</Caption>
                  </div>

                  <div>
                    <h2 className="text-xl font-extrabold tracking-tight text-[#4b4b4b] dark:text-white leading-tight">
                      {selectedOpp.title}
                    </h2>
                    <Caption className="mt-1">{selectedOpp.company} · {selectedOpp.location}</Caption>
                  </div>

                  <div>
                    <Headline className="mb-2">descripcion</Headline>
                    <Body className="leading-relaxed">{selectedOpp.description}</Body>
                  </div>

                  <div>
                    <Headline className="mb-2">habilidades</Headline>
                    <div className="flex flex-wrap gap-2">
                      {selectedOpp.skills.map((skill) => (
                        <Tag key={skill} variant="outline">{skill}</Tag>
                      ))}
                    </div>
                  </div>

                  <Button variant="primary" className="w-full">
                    Aplicar
                  </Button>
                </div>
              </CardFlat>
            ) : (
              <CardFlat className="shadow-sm p-6">
                <div className="text-center py-8">
                  <svg className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                  <Body className="text-[#777777] dark:text-gray-400">Selecciona una oportunidad para ver los detalles</Body>
                </div>
              </CardFlat>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

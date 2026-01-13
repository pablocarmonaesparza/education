'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import OnboardingNavbar from '@/components/onboarding/OnboardingNavbar';

// Sections with their questions
const sections = [
  {
    id: 'ai',
    name: 'Inteligencia Artificial',
    questions: [
      {
        id: 'ai_daily_use',
        question: '¿Qué tan cómodo estás usando ChatGPT o Claude?',
        labels: ['Nunca lo he usado', 'Lo he probado', 'Uso ocasional', 'Uso frecuente', 'Uso diario avanzado'],
      },
      {
        id: 'ai_concepts',
        question: '¿Entiendes conceptos como tokens, context window o temperature?',
        labels: ['No sé qué son', 'He escuchado', 'Entiendo lo básico', 'Los entiendo bien', 'Los optimizo'],
      },
      {
        id: 'ai_custom_gpts',
        question: '¿Has creado Custom GPTs o Claude Projects?',
        labels: ['No sabía que existían', 'Sé que existen', 'He probado', 'Tengo algunos', 'Tengo varios activos'],
      },
    ],
  },
  {
    id: 'automation',
    name: 'Automatización',
    questions: [
      {
        id: 'automation_tools',
        question: '¿Has usado Zapier, Make o n8n?',
        labels: ['Nunca', 'Las he explorado', 'Flujos simples', 'Varios flujos', 'En producción'],
      },
      {
        id: 'automation_webhooks',
        question: '¿Sabes cuándo usar webhooks vs triggers programados?',
        labels: ['No sé la diferencia', 'Idea vaga', 'Entiendo', 'Los uso bien', 'Domino ambos'],
      },
      {
        id: 'automation_errors',
        question: '¿Sabes manejar errores en automatizaciones?',
        labels: ['No', 'He visto que existen', 'Errores básicos', 'Implemento handling', 'Handling robusto'],
      },
    ],
  },
  {
    id: 'vibe_coding',
    name: 'Vibe-Coding',
    questions: [
      {
        id: 'vibe_coding_tools',
        question: '¿Has usado Cursor, Claude Code o Lovable?',
        labels: ['No los conozco', 'He escuchado', 'Los he probado', 'Uso frecuente', 'Son mi día a día'],
      },
      {
        id: 'vibe_coding_comfort',
        question: '¿Puedes leer y modificar código generado por IA?',
        labels: ['No entiendo código', 'Me cuesta', 'Cambios simples', 'Con confianza', 'Sin problema'],
      },
      {
        id: 'vibe_coding_git',
        question: '¿Sabes usar Git?',
        labels: ['No sé qué es', 'Sé que existe', 'Commits básicos', 'Uso branches', 'PRs y todo'],
      },
    ],
  },
  {
    id: 'content',
    name: 'Generación de Contenido',
    questions: [
      {
        id: 'content_generation',
        question: '¿Has generado contenido con IA?',
        labels: ['Nunca', 'He experimentado', 'Ocasionalmente', 'Frecuentemente', 'Regularmente'],
      },
      {
        id: 'content_consistency',
        question: '¿Mantienes consistencia de marca al usar IA?',
        labels: ['No lo he pensado', 'Aprendiendo', 'Lo intento', 'Criterios claros', 'Guidelines definidos'],
      },
    ],
  },
  {
    id: 'apis',
    name: 'APIs',
    questions: [
      {
        id: 'api_understanding',
        question: '¿Entiendes qué es una API?',
        labels: ['No tengo idea', 'Idea vaga', 'Entiendo', 'Las uso', 'Las diseño'],
      },
      {
        id: 'api_calls',
        question: '¿Has hecho llamadas a APIs?',
        labels: ['Nunca', 'He visto cómo', 'Lo he intentado', 'Ocasionalmente', 'Frecuentemente'],
      },
      {
        id: 'api_auth',
        question: '¿Manejas autenticación de APIs?',
        labels: ['No sé qué es', 'He escuchado', 'API Keys básicas', 'Varios métodos', 'Auth completo'],
      },
    ],
  },
  {
    id: 'mcp',
    name: 'MCP',
    questions: [
      {
        id: 'mcp_knowledge',
        question: '¿Conoces qué es MCP (Model Context Protocol)?',
        labels: ['Primera vez', 'He oído', 'Entiendo', 'Lo he explorado', 'Ya lo uso'],
      },
      {
        id: 'mcp_integrations',
        question: '¿Has conectado Claude Desktop con herramientas externas?',
        labels: ['No', 'Lo he intentado', 'Una integración', 'Varias', 'Varios servers'],
      },
    ],
  },
  {
    id: 'finance',
    name: 'Finanzas & Tokens',
    questions: [
      {
        id: 'token_costs',
        question: '¿Entiendes los costos por token en APIs de IA?',
        labels: ['No tengo idea', 'Sé que hay costos', 'Lo básico', 'Calculo costos', 'Optimizo costos'],
      },
      {
        id: 'pricing_structure',
        question: '¿Sabes estructurar pricing para productos digitales?',
        labels: ['Nunca', 'Ideas básicas', 'Precios simples', 'Experiencia', 'Modelos completos'],
      },
    ],
  },
  {
    id: 'products',
    name: 'Productos',
    questions: [
      {
        id: 'mvp_launch',
        question: '¿Has lanzado un MVP o producto digital?',
        labels: ['Nunca', 'Ideas sin lanzar', 'Algo pequeño', 'Un producto', 'Varios productos'],
      },
      {
        id: 'deploy_knowledge',
        question: '¿Sabes hacer deploy de apps o sitios web?',
        labels: ['No sé qué es', 'Sé que existe', 'Lo he intentado', 'Algunos deploys', 'Regularmente'],
      },
    ],
  },
];

// Flatten questions for easy indexing
const allQuestions = sections.flatMap(section => 
  section.questions.map(q => ({ ...q, sectionId: section.id, sectionName: section.name }))
);

// Helper to get section index from question index
const getSectionIndex = (questionIndex: number): number => {
  let count = 0;
  for (let i = 0; i < sections.length; i++) {
    count += sections[i].questions.length;
    if (questionIndex < count) return i;
  }
  return sections.length - 1;
};

// Helper to get question index within its section
const getQuestionIndexInSection = (questionIndex: number): number => {
  let count = 0;
  for (let i = 0; i < sections.length; i++) {
    if (questionIndex < count + sections[i].questions.length) {
      return questionIndex - count;
    }
    count += sections[i].questions.length;
  }
  return 0;
};

interface QuestionResponse {
  question: string;
  value: number;
  label: string;
  section: string;
}

export default function ProjectContextPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isDragging, setIsDragging] = useState(false);
  const router = useRouter();

  // Check if project idea exists
  useEffect(() => {
    const projectIdea = sessionStorage.getItem('projectIdea');
    if (!projectIdea) {
      router.push('/projectDescription');
    }
  }, [router]);

  const currentQuestion = allQuestions[currentIndex];
  const currentSectionIndex = getSectionIndex(currentIndex);
  const currentSection = sections[currentSectionIndex];
  const questionIndexInSection = getQuestionIndexInSection(currentIndex);
  const currentValue = answers[currentQuestion.id] ?? 3; // Default to middle

  const handleSliderChange = (value: number) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }));
  };

  const handleNext = () => {
    // Save current answer if not already saved
    if (answers[currentQuestion.id] === undefined) {
      setAnswers(prev => ({ ...prev, [currentQuestion.id]: 3 }));
    }

    if (currentIndex < allQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      finishQuestionnaire();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    } else {
      router.back();
    }
  };

  const finishQuestionnaire = () => {
    // Build responses with full context
    const responses: Record<string, QuestionResponse> = {};
    
    allQuestions.forEach(q => {
      const value = answers[q.id] ?? 3;
      responses[q.id] = {
        question: q.question,
        value: value,
        label: q.labels[value - 1],
        section: q.sectionName,
      };
    });

    sessionStorage.setItem('projectContext', JSON.stringify(responses));
    router.push('/courseCreation');
  };

  const handleSkip = () => {
    router.push('/courseCreation');
  };

  const progress = ((currentIndex + 1) / allQuestions.length) * 100;
  const currentLabel = currentQuestion.labels[currentValue - 1];
  
  // Calculate starting index for each section
  const getSectionStartIndex = (sectionIdx: number): number => {
    let start = 0;
    for (let i = 0; i < sectionIdx; i++) {
      start += sections[i].questions.length;
    }
    return start;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col">
      <OnboardingNavbar />

      <main className="flex-1 flex flex-col items-center justify-center px-6 pt-20 pb-12">
        <div className="w-full max-w-2xl mx-auto">
          {/* Section Name - Always visible at top */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSection.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="text-center mb-4"
            >
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                {currentSection.name}
              </h2>
            </motion.div>
          </AnimatePresence>

          {/* Progress counter */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <span className="text-sm text-gray-400 dark:text-gray-500">
              {currentIndex + 1} de {allQuestions.length} para personalizar tu curso
            </span>
            <span className="text-sm text-gray-300 dark:text-gray-600">•</span>
            <span className="text-sm text-gray-400 dark:text-gray-500">
              ~{Math.ceil((allQuestions.length - currentIndex) * 0.2)} min
            </span>
          </div>

          {/* Question */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="mb-12"
            >
              <h2 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white text-center mb-10 leading-relaxed">
                {currentQuestion.question}
              </h2>
              
              {/* Slider Container */}
              <div className="max-w-md mx-auto px-4">
                {/* Labels - extremes only */}
                <div className="flex justify-between mb-4">
                  <span className="text-xs text-gray-400 dark:text-gray-500 max-w-[120px] text-left leading-tight">
                    {currentQuestion.labels[0]}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 max-w-[120px] text-right leading-tight">
                    {currentQuestion.labels[4]}
                  </span>
                </div>

                {/* Slider Track */}
                <div className="relative h-12 flex items-center">
                  {/* Background Track */}
                  <div className="absolute w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full" />
                  
                  {/* Filled Track */}
                  <div 
                    className="absolute h-2 bg-gradient-to-r from-[#1472FF] to-[#5BA0FF] rounded-full transition-all duration-150"
                    style={{ width: `${((currentValue - 1) / 4) * 100}%` }}
                  />

                  {/* Step Markers */}
                  <div className="absolute w-full flex justify-between px-0">
                    {[1, 2, 3, 4, 5].map((step) => (
                      <button
                        key={step}
                        onClick={() => handleSliderChange(step)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200 ${
                          currentValue === step
                            ? 'bg-gradient-to-r from-[#1472FF] to-[#5BA0FF] text-white scale-125 shadow-lg'
                            : currentValue > step
                              ? 'bg-[#1472FF] text-white'
                              : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-400 dark:hover:bg-gray-500'
                        }`}
                      >
                        {step}
                      </button>
                    ))}
                  </div>

                  {/* Hidden Range Input for dragging */}
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    value={currentValue}
                    onChange={(e) => handleSliderChange(parseInt(e.target.value))}
                    onMouseDown={() => setIsDragging(true)}
                    onMouseUp={() => setIsDragging(false)}
                    onTouchStart={() => setIsDragging(true)}
                    onTouchEnd={() => setIsDragging(false)}
                    className="absolute w-full h-12 opacity-0 cursor-pointer z-10"
                  />
                </div>

                {/* Current Value Label - now shows the actual label for the value */}
                <div className="text-center mt-6">
                  <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    isDragging 
                      ? 'bg-[#1472FF] text-white scale-110' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }`}>
                    {currentLabel}
                  </span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-center gap-4">
            <motion.button
              onClick={handlePrevious}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 rounded-full font-semibold text-sm border-2 border-[#1472FF] text-[#1472FF] bg-transparent hover:bg-blue-50 dark:hover:bg-blue-950 transition-all duration-300 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
              </svg>
              Anterior
            </motion.button>

            <motion.button
              onClick={handleNext}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 rounded-full font-semibold text-sm text-white bg-gradient-to-r from-[#1472FF] to-[#5BA0FF] hover:from-[#0E5FCC] hover:to-[#1472FF] transition-all duration-300 flex items-center gap-2"
            >
              {currentIndex === allQuestions.length - 1 ? 'Crear mi curso' : 'Siguiente'}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </motion.button>
          </div>

          {/* Section-based dots indicator */}
          <div className="flex justify-center items-center gap-3 mt-8">
            {sections.map((section, sectionIdx) => {
              const isCurrentSection = sectionIdx === currentSectionIndex;
              const sectionStartIdx = getSectionStartIndex(sectionIdx);
              const sectionAnswered = section.questions.every(q => answers[q.id] !== undefined);
              const sectionPartial = section.questions.some(q => answers[q.id] !== undefined);
              
              return (
                <div key={section.id} className="flex items-center gap-1">
                  {isCurrentSection ? (
                    // Expanded view for current section
                    section.questions.map((q, qIdx) => {
                      const globalIdx = sectionStartIdx + qIdx;
                      const isCurrentQuestion = globalIdx === currentIndex;
                      const isAnswered = answers[q.id] !== undefined;
                      
                      return (
                        <button
                          key={q.id}
                          onClick={() => setCurrentIndex(globalIdx)}
                          className={`h-2 rounded-full transition-all duration-300 ${
                            isCurrentQuestion
                              ? 'w-6 bg-gradient-to-r from-[#1472FF] to-[#5BA0FF]'
                              : isAnswered
                                ? 'w-2 bg-[#1472FF]'
                                : 'w-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'
                          }`}
                        />
                      );
                    })
                  ) : (
                    // Collapsed view for other sections
                    <button
                      onClick={() => setCurrentIndex(sectionStartIdx)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        sectionAnswered
                          ? 'w-3 bg-[#1472FF]'
                          : sectionPartial
                            ? 'w-3 bg-[#1472FF]/50'
                            : 'w-3 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'
                      }`}
                      title={section.name}
                    />
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </main>
    </div>
  );
}

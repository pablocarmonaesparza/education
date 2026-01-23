'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import OnboardingNavbar from '@/components/onboarding/OnboardingNavbar';

// Sections with their questions
const sections = [
  {
    id: 'technical',
    name: 'Experiencia Técnica',
    questions: [
      {
        id: 'ai_familiarity',
        question: '¿Qué tan familiarizado estás con ChatGPT, Claude o herramientas similares?',
        labels: ['Nunca las he usado', 'Las he probado', 'Uso ocasional', 'Uso frecuente', 'Uso avanzado diario'],
      },
      {
        id: 'prompting',
        question: '¿Qué tan efectivo eres escribiendo prompts para obtener buenos resultados?',
        labels: ['No sé qué es un prompt', 'Prompts básicos', 'Buenos resultados', 'Técnicas avanzadas', 'Experto en prompting'],
      },
      {
        id: 'automation',
        question: '¿Has creado flujos de automatización que conecten diferentes apps?',
        labels: ['Nunca', 'He explorado', 'Flujos simples', 'Varios flujos', 'Flujos en producción'],
      },
      {
        id: 'coding',
        question: '¿Cuál es tu nivel de experiencia escribiendo código?',
        labels: ['Ninguno', 'He modificado código', 'Scripts básicos', 'Programo seguido', 'Desarrollo profesional'],
      },
      {
        id: 'apis',
        question: '¿Sabes qué es una API y has hecho llamadas a servicios externos?',
        labels: ['No sé qué es', 'Entiendo el concepto', 'He hecho llamadas', 'Las uso seguido', 'Las diseño e implemento'],
      },
      {
        id: 'databases',
        question: '¿Has trabajado con bases de datos (SQL, Airtable, Supabase)?',
        labels: ['Nunca', 'He explorado', 'Consultas básicas', 'Las uso seguido', 'Diseño schemas'],
      },
      {
        id: 'content',
        question: '¿Generas contenido para redes, blogs, emails o video regularmente?',
        labels: ['No genero contenido', 'Ocasionalmente', 'Regularmente', 'Es parte de mi trabajo', 'Es mi trabajo principal'],
      },
      {
        id: 'vibe_coding',
        question: '¿Has usado herramientas que generan código desde prompts (Cursor, Lovable)?',
        labels: ['No las conozco', 'He escuchado', 'Las he probado', 'Las uso seguido', 'Son mis herramientas principales'],
      },
    ],
  },
  {
    id: 'business',
    name: 'Contexto de Negocio',
    questions: [
      {
        id: 'project_clarity',
        question: '¿Qué tan definido tienes el proyecto que quieres construir?',
        labels: ['Solo una idea vaga', 'Idea general', 'Concepto claro', 'Plan definido', 'Roadmap detallado'],
      },
      {
        id: 'sales_experience',
        question: '¿Has vendido algo (producto, servicio, consultoría) de forma directa?',
        labels: ['Nunca he vendido', 'Pocas veces', 'Algunas ventas', 'Vendo regularmente', 'Ventas son mi fuerte'],
      },
      {
        id: 'pricing',
        question: '¿Sabes cómo estructurar precios y modelos de monetización?',
        labels: ['No tengo idea', 'Nociones básicas', 'He definido precios', 'Tengo experiencia', 'Experto en pricing'],
      },
      {
        id: 'launches',
        question: '¿Cuántos proyectos has llevado de idea a lanzamiento?',
        labels: ['Ninguno', 'Uno incompleto', 'Uno completo', '2-3 proyectos', 'Más de 3'],
      },
      {
        id: 'goal',
        question: '¿Qué describe mejor lo que quieres lograr con este curso?',
        labels: ['Explorar IA', 'Aprender habilidades', 'Crear un proyecto', 'Lanzar un producto', 'Escalar mi negocio'],
      },
      {
        id: 'timeline',
        question: '¿En cuánto tiempo necesitas tener resultados concretos?',
        labels: ['Sin prisa', '6+ meses', '3-6 meses', '1-3 meses', 'Lo antes posible'],
      },
    ],
  },
  {
    id: 'learning',
    name: 'Estilo de Aprendizaje',
    questions: [
      {
        id: 'confidence',
        question: '¿Qué tan seguro te sientes aprendiendo tecnología nueva?',
        labels: ['Me intimida', 'Algo inseguro', 'Normal', 'Bastante seguro', 'Muy seguro'],
      },
      {
        id: 'problem_solving',
        question: 'Cuando te trabas en un problema técnico, ¿qué haces?',
        labels: ['Me frustro y paro', 'Pido ayuda pronto', 'Busco un poco', 'Investigo a fondo', 'Disfruto el reto'],
      },
      {
        id: 'courses_completed',
        question: '¿Cuántos cursos online has completado (no solo empezado)?',
        labels: ['Ninguno', '1-2 cursos', '3-5 cursos', '6-10 cursos', 'Más de 10'],
      },
      {
        id: 'learning_style',
        question: '¿Cómo prefieres aprender algo nuevo?',
        labels: ['Leyendo teoría', 'Videos paso a paso', 'Ejemplos prácticos', 'Haciendo proyectos', 'Experimentando solo'],
      },
      {
        id: 'time_available',
        question: '¿Cuántas horas a la semana puedes dedicar a este curso?',
        labels: ['1-2 horas', '3-5 horas', '5-10 horas', '10-15 horas', '+15 horas'],
      },
      {
        id: 'english',
        question: '¿Qué tan cómodo te sientes con documentación en inglés?',
        labels: ['No entiendo inglés', 'Muy básico', 'Leo con traductor', 'Leo bien', 'Totalmente cómodo'],
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
              <h2 className="text-2xl md:text-3xl font-extrabold text-[#4b4b4b] dark:text-white tracking-tight lowercase">
                {currentSection.name.toLowerCase()}
              </h2>
            </motion.div>
          </AnimatePresence>

          {/* Progress counter */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <span className="text-sm text-[#777777] dark:text-gray-500">
              {currentIndex + 1} de {allQuestions.length} para personalizar tu curso
            </span>
            <span className="text-sm text-gray-300 dark:text-gray-600">•</span>
            <span className="text-sm text-[#777777] dark:text-gray-500">
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
              <h2 className="text-xl md:text-2xl font-bold text-[#4b4b4b] dark:text-white text-center mb-10 leading-relaxed">
                {currentQuestion.question}
              </h2>
              
              {/* Slider Container */}
              <div className="max-w-md mx-auto px-4">
                {/* Labels - extremes only */}
                <div className="flex justify-between mb-4">
                  <span className="text-xs text-[#777777] dark:text-gray-500 max-w-[120px] text-left leading-tight">
                    {currentQuestion.labels[0]}
                  </span>
                  <span className="text-xs text-[#777777] dark:text-gray-500 max-w-[120px] text-right leading-tight">
                    {currentQuestion.labels[4]}
                  </span>
                </div>

                {/* Slider Track with depth effect */}
                <div className="relative h-12 flex items-center">
                  {/* Background Track with depth */}
                  <div
                    className="absolute w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full"
                    style={{ boxShadow: '0 2px 0 0 #d1d5db' }}
                  />

                  {/* Filled Track */}
                  <div
                    className="absolute h-3 bg-[#1472FF] rounded-full transition-all duration-150"
                    style={{
                      width: `${((currentValue - 1) / 4) * 100}%`,
                      boxShadow: '0 2px 0 0 #0E5FCC'
                    }}
                  />

                  {/* Step Markers with depth effect */}
                  <div className="absolute w-full flex justify-between px-0">
                    {[1, 2, 3, 4, 5].map((step) => (
                      <button
                        key={step}
                        onClick={() => handleSliderChange(step)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-200 ${
                          currentValue === step
                            ? 'bg-[#1472FF] text-white scale-110 shadow-[0_3px_0_0_#0E5FCC]'
                            : currentValue > step
                              ? 'bg-[#1472FF] text-white shadow-[0_3px_0_0_#0E5FCC]'
                              : 'bg-gray-200 dark:bg-gray-700 text-[#777777] dark:text-gray-400 shadow-[0_3px_0_0_#d1d5db] dark:shadow-[0_3px_0_0_#374151] hover:bg-gray-300 dark:hover:bg-gray-600'
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
                <div className="text-center mt-8">
                  <span className={`inline-block px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                    isDragging
                      ? 'bg-[#1472FF] text-white shadow-[0_3px_0_0_#0E5FCC]'
                      : 'bg-gray-100 dark:bg-gray-800 text-[#4b4b4b] dark:text-gray-300 shadow-[0_3px_0_0_#d1d5db] dark:shadow-[0_3px_0_0_#374151]'
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
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 rounded-2xl font-bold text-sm uppercase tracking-wide bg-gray-100 dark:bg-gray-800 text-[#4b4b4b] dark:text-white border-b-4 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 active:border-b-0 active:mt-1 transition-all duration-150 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
              </svg>
              Anterior
            </motion.button>

            <motion.button
              onClick={handleNext}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 rounded-2xl font-bold text-sm uppercase tracking-wide text-white bg-[#1472FF] border-b-4 border-[#0E5FCC] hover:bg-[#1265e0] active:border-b-0 active:mt-1 transition-all duration-150 flex items-center gap-2"
            >
              {currentIndex === allQuestions.length - 1 ? 'Crear mi curso' : 'Siguiente'}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </motion.button>
          </div>

          {/* Section-based dots indicator with depth effect */}
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
                          className={`h-3 rounded-full transition-all duration-300 ${
                            isCurrentQuestion
                              ? 'w-8 bg-[#1472FF] shadow-[0_2px_0_0_#0E5FCC]'
                              : isAnswered
                                ? 'w-3 bg-[#1472FF] shadow-[0_2px_0_0_#0E5FCC]'
                                : 'w-3 bg-gray-200 dark:bg-gray-700 shadow-[0_2px_0_0_#d1d5db] dark:shadow-[0_2px_0_0_#374151] hover:bg-gray-300'
                          }`}
                        />
                      );
                    })
                  ) : (
                    // Collapsed view for other sections
                    <button
                      onClick={() => setCurrentIndex(sectionStartIdx)}
                      className={`h-3 rounded-full transition-all duration-300 ${
                        sectionAnswered
                          ? 'w-4 bg-green-500 shadow-[0_2px_0_0_#16a34a]'
                          : sectionPartial
                            ? 'w-4 bg-[#1472FF]/50 shadow-[0_2px_0_0_#0E5FCC]/50'
                            : 'w-4 bg-gray-200 dark:bg-gray-700 shadow-[0_2px_0_0_#d1d5db] dark:shadow-[0_2px_0_0_#374151] hover:bg-gray-300'
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

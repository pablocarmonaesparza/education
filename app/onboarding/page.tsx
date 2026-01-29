'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import OnboardingNavbar from '@/components/onboarding/OnboardingNavbar';
import { createClient } from '@/lib/supabase/client';
import { Spinner } from '@/components/ui';

const steps = [
  {
    image: '/images/onboarding-1.png',
    title: 'Cuéntanos tu idea',
    description: 'Describe el proyecto que quieres construir. Puede ser cualquier cosa: un chatbot, automatización, análisis de datos, o algo completamente nuevo.',
  },
  {
    image: '/images/onboarding-2.png',
    title: 'Creamos tu ruta personalizada',
    description: 'Nuestra IA analiza tu idea y selecciona los videos perfectos para ti. Cada curso es único, diseñado específicamente para tu proyecto.',
  },
  {
    image: '/images/onboarding-3.png',
    title: 'Aprende construyendo',
    description: 'Avanza a tu ritmo con videos cortos y prácticos. Al terminar, tendrás las habilidades para hacer realidad tu proyecto.',
  },
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check if user already has a generated path - if so, redirect to dashboard
  useEffect(() => {
    const checkExistingPath = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          const { data: intakeData } = await supabase
            .from('intake_responses')
            .select('generated_path')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (intakeData?.generated_path) {
            // User already has a path, redirect to dashboard
            router.replace('/dashboard');
            return;
          }
        }
      } catch (error) {
        console.error('Error checking existing path:', error);
      }
      setIsLoading(false);
    };

    checkExistingPath();
  }, [router]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Navigate to project description
      router.push('/projectDescription');
    }
  };

  const isLastStep = currentStep === steps.length - 1;

  // Show loading while checking for existing path
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
      <OnboardingNavbar />

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pt-20 pb-12">
        <div className="w-full max-w-2xl mx-auto">
          {/* Image */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`image-${currentStep}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="relative w-full aspect-[4/3] max-w-md mx-auto mb-10"
            >
              <div className="w-full h-full rounded-2xl bg-gradient-to-br from-blue-50 to-white dark:from-gray-800 dark:to-gray-900 border border-gray-100 dark:border-gray-800 flex items-center justify-center overflow-hidden">
                {/* Placeholder until real images are added */}
                <div className="text-center p-8">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-[#1472FF] border-2 border-b-4 border-[#0E5FCC] flex items-center justify-center">
                    {currentStep === 0 && (
                      <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    )}
                    {currentStep === 1 && (
                      <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    )}
                    {currentStep === 2 && (
                      <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Title and Description */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`text-${currentStep}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
              className="text-center mb-12"
            >
              <h1 className="text-3xl md:text-4xl font-extrabold text-[#4b4b4b] dark:text-white mb-4 tracking-tight lowercase">
                {steps[currentStep].title}
              </h1>
              <p className="text-base text-[#777777] dark:text-gray-400 max-w-lg mx-auto leading-relaxed">
                {steps[currentStep].description}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Buttons */}
          <div className="flex justify-center gap-4">
            {/* Previous Button - only show on steps 2 and 3 */}
            {currentStep > 0 && (
              <motion.button
                onClick={() => setCurrentStep(currentStep - 1)}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3 rounded-2xl font-bold text-sm uppercase tracking-wide bg-gray-100 dark:bg-gray-900 text-[#4b4b4b] dark:text-white border-b-4 border-gray-300 dark:border-gray-950 hover:bg-gray-200 dark:hover:bg-gray-700 active:border-b-0 active:mt-1 transition-all duration-150 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                </svg>
                Anterior
              </motion.button>
            )}

            {/* Next/Start Button */}
            <motion.button
              onClick={handleNext}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 rounded-2xl font-bold text-sm uppercase tracking-wide text-white bg-[#1472FF] border-b-4 border-[#0E5FCC] hover:bg-[#1265e0] active:border-b-0 active:mt-1 transition-all duration-150 flex items-center gap-2"
            >
              {isLastStep ? 'Comenzar' : 'Siguiente'}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </motion.button>
          </div>

          {/* Step dots indicator with depth effect */}
          <div className="flex justify-center gap-3 mt-8">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`h-3 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? 'w-8 bg-[#1472FF] shadow-[0_2px_0_0_#0E5FCC]'
                    : index < currentStep
                      ? 'w-3 bg-green-500 shadow-[0_2px_0_0_#16a34a]'
                      : 'w-3 bg-gray-200 dark:bg-gray-700 shadow-[0_2px_0_0_#d1d5db] dark:shadow-[0_2px_0_0_#374151] hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

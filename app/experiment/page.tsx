import type { Metadata } from "next";
import AnimatedBackground from "@/components/landing/AnimatedBackground";
import Footer from "@/components/shared/Footer";
import ExperimentNavbar from "@/components/experiment/ExperimentNavbar";
import ExperimentHeroSection from "@/components/experiment/ExperimentHeroSection";
import ExperimentPathSection from "@/components/experiment/ExperimentPathSection";
import ExperimentExerciseDemoSection from "@/components/experiment/ExperimentExerciseDemoSection";
import ExperimentHabitSection from "@/components/experiment/ExperimentHabitSection";
import ExperimentProjectSection from "@/components/experiment/ExperimentProjectSection";

export const metadata: Metadata = {
  title: "Experiment | Exercise-first Learning",
  description:
    "Demo de landing para reemplazar videos por ejercicios interactivos, feedback inmediato y progresion por practica.",
};

export default function ExperimentPage() {
  return (
    <main className="min-h-screen">
      <AnimatedBackground />
      <ExperimentNavbar />
      <ExperimentHeroSection />
      <ExperimentPathSection />
      <ExperimentExerciseDemoSection />
      <ExperimentHabitSection />
      <ExperimentProjectSection />
      <Footer />
    </main>
  );
}

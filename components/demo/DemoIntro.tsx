'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Title, Body, Caption, Tag, StatCard } from '@/components/ui';
import type { LessonData } from '@/lib/demo-data';

/* ───────────────────────────────────────────────────────────
   Demo Intro — Lesson welcome screen (Mimo pattern)
   Shows title, topic, estimated time, and exercise count.
   ─────────────────────────────────────────────────────────── */

interface DemoIntroProps {
  lesson: LessonData;
}

export default function DemoIntro({ lesson }: DemoIntroProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="max-w-lg mx-auto px-4 py-12 text-center space-y-6"
    >
      {/* Topic tag */}
      <Tag variant="primary">{lesson.topic}</Tag>

      {/* Icon */}
      <div className="w-20 h-20 mx-auto rounded-full bg-[#1472FF] border-2 border-b-4 border-[#0E5FCC] flex items-center justify-center">
        <span className="text-3xl">🤖</span>
      </div>

      {/* Title & description */}
      <div className="space-y-3">
        <Title>{lesson.title}</Title>
        <Body className="max-w-md mx-auto">{lesson.description}</Body>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
        <StatCard
          icon="🧠"
          value={lesson.exercises.length}
          label="ejercicios"
          color="blue"
        />
        <StatCard
          icon="⏱"
          value={`~${lesson.estimatedMinutes}`}
          label="minutos"
          color="neutral"
        />
      </div>

      {/* Hint */}
      <Caption>Pulsa &quot;Comenzar leccion&quot; para empezar</Caption>
    </motion.div>
  );
}

'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

/* ───────────────────────────────────────────────────────────
   Confetti Effect — Lightweight Framer Motion confetti burst
   Uses design-system colors. No external dependencies.
   ─────────────────────────────────────────────────────────── */

const COLORS = ['#1472FF', '#0E5FCC', '#22c55e', '#16a34a', '#facc15', '#f97316', '#ef4444'];
const PARTICLE_COUNT = 40;

interface Particle {
  id: number;
  x: number;
  y: number;
  rotation: number;
  color: string;
  size: number;
  shape: 'square' | 'circle';
  duration: number;
  delay: number;
}

function generateParticles(): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 600,
    y: -(Math.random() * 500 + 200),
    rotation: Math.random() * 720 - 360,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size: Math.random() * 8 + 4,
    shape: Math.random() > 0.5 ? 'square' : 'circle',
    duration: Math.random() * 1.5 + 1.5,
    delay: Math.random() * 0.3,
  }));
}

export default function ConfettiEffect() {
  const particles = useMemo(() => generateParticles(), []);

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{
            x: '50vw',
            y: '40vh',
            opacity: 1,
            scale: 0,
            rotate: 0,
          }}
          animate={{
            x: `calc(50vw + ${p.x}px)`,
            y: `calc(40vh + ${p.y}px)`,
            opacity: [1, 1, 0],
            scale: [0, 1.2, 0.8],
            rotate: p.rotation,
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: 'easeOut',
          }}
          style={{
            position: 'absolute',
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: p.shape === 'circle' ? '50%' : '2px',
          }}
        />
      ))}
    </div>
  );
}

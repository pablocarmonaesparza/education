'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

/* ───────────────────────────────────────────────────────────
   Confetti Effect — Lightweight Framer Motion confetti burst
   Uses design-system colors. No external dependencies.
   ─────────────────────────────────────────────────────────── */

const COLORS = ['#1472FF', '#0E5FCC', '#22c55e', '#16a34a', '#facc15', '#f97316', '#ef4444'];

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

interface ConfettiEffectProps {
  /** Number of particles. Default 40. */
  count?: number;
  /** 'burst' = upward fountain. 'radial' = explodes in all directions from center. */
  pattern?: 'burst' | 'radial';
  /** Force a single shape. Default: random square or circle. */
  shape?: 'square' | 'circle';
}

function generateParticles(
  count: number,
  pattern: 'burst' | 'radial',
  forcedShape?: 'square' | 'circle',
): Particle[] {
  return Array.from({ length: count }, (_, i) => {
    let x: number;
    let y: number;
    if (pattern === 'radial') {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 500 + 200;
      x = Math.cos(angle) * distance;
      y = Math.sin(angle) * distance;
    } else {
      x = (Math.random() - 0.5) * 600;
      y = -(Math.random() * 500 + 200);
    }
    return {
      id: i,
      x,
      y,
      rotation: Math.random() * 720 - 360,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: Math.random() * 8 + 4,
      shape: forcedShape ?? (Math.random() > 0.5 ? 'square' : 'circle'),
      duration: Math.random() * 1.5 + 1.5,
      delay: Math.random() * 0.3,
    };
  });
}

export default function ConfettiEffect({
  count = 40,
  pattern = 'burst',
  shape,
}: ConfettiEffectProps = {}) {
  const particles = useMemo(
    () => generateParticles(count, pattern, shape),
    [count, pattern, shape],
  );

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

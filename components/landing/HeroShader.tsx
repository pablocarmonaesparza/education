'use client';

import { useEffect, useRef } from 'react';

/**
 * Interactive particle shader background for the hero section.
 *
 * Ported from the Claude Design handoff (shader-wallpapers/Hero Shader.html,
 * 2026-04-22). Jittered grid of light-gray dots that:
 *   - drift on multi-harmonic waves (idle motion)
 *   - get repelled by the pointer within a ~240px radius
 *   - pushed outward by expanding ring shockwaves on click
 *
 * Rendered with 2D canvas (no WebGL). Positioned `absolute inset-0` so it
 * fills its parent (the hero section) rather than the whole viewport, so
 * scrolling past the hero correctly shows the rest of the landing.
 *
 * Dark-mode aware: checks `prefers-color-scheme` and observes the `.dark`
 * class on <html> (Tailwind's dark mode selector) so the canvas background
 * matches the page.
 */
interface Particle {
  hx: number; // home x (rest position)
  hy: number; // home y
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  phase: number;
}

interface Shock {
  x: number;
  y: number;
  t: number;
}

const SPACING = 44; // px between grid nodes
const JITTER = 16; // per-node random offset
const RADIUS = 2.6; // base dot radius

// Light mode: white bg, #f2f2f2 dots (per Pablo's final call in Claude Design chat)
// Dark mode: gray-800 bg (matches AnimatedBackground elsewhere on the page),
// subtle gray-700 dots.
const COLORS = {
  light: { bg: '#ffffff', dot: '#f2f2f2' },
  dark: { bg: '#1f2937', dot: '#374151' },
};

export default function HeroShader() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Two DPRs with different jobs:
    //   - `actualDpr` is the browser's real devicePixelRatio, used ONLY to
    //     convert physical pixels (from devicePixelContentBoxSize) back to
    //     CSS pixels. This MUST match reality or W/H get wrong.
    //   - `renderDpr` is capped at 2 to keep the drawing buffer small on
    //     high-DPR screens (Retina 3x, ultra-HiDPI). Used for canvas.width
    //     and ctx.setTransform.
    const actualDpr = window.devicePixelRatio || 1;
    const renderDpr = Math.min(actualDpr, 2);
    let W = 0;
    let H = 0;
    let particles: Particle[] = [];
    const shocks: Shock[] = [];
    const mouse = { x: -9999, y: -9999, down: false, active: false };
    let animationId = 0;

    // Itera's tailwind config uses `darkMode: "media"`, so dark mode follows
    // system preference. Re-evaluated every frame so toggling OS theme updates
    // the canvas without a remount.
    const darkQuery = window.matchMedia?.('(prefers-color-scheme: dark)');
    const isDark = () => darkQuery?.matches ?? false;

    function seed() {
      particles = [];
      const cols = Math.ceil(W / SPACING) + 2;
      const rows = Math.ceil(H / SPACING) + 2;
      for (let j = -1; j < rows; j++) {
        for (let i = -1; i < cols; i++) {
          const ox = (Math.random() - 0.5) * JITTER * 2;
          const oy = (Math.random() - 0.5) * JITTER * 2;
          const hx = i * SPACING + SPACING * 0.5 + ox;
          const hy = j * SPACING + SPACING * 0.5 + oy;
          const size = RADIUS * (0.85 + Math.random() * 0.45);
          particles.push({
            hx,
            hy,
            x: hx,
            y: hy,
            vx: 0,
            vy: 0,
            size,
            phase: Math.random() * Math.PI * 2,
          });
        }
      }
    }

    function applySize(cssW: number, cssH: number) {
      W = cssW;
      H = cssH;
      // Only resize the drawing buffer. CSS size is governed by Tailwind
      // `w-full h-full`, so we never override `canvas.style.*`. Overriding
      // inline styles was the previous bug: it locked the canvas to whatever
      // width was measured on mount, so later layout shifts (scrollbar,
      // fonts, font fallback) left the right side empty.
      const bufW = Math.max(1, Math.round(W * renderDpr));
      const bufH = Math.max(1, Math.round(H * renderDpr));
      if (canvas!.width !== bufW) canvas!.width = bufW;
      if (canvas!.height !== bufH) canvas!.height = bufH;
      ctx!.setTransform(renderDpr, 0, 0, renderDpr, 0, 0);
      seed();
    }

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      applySize(rect.width, rect.height);
    }

    function pointerLocalCoords(e: PointerEvent) {
      const rect = canvas!.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }

    const onMove = (e: PointerEvent) => {
      const { x, y } = pointerLocalCoords(e);
      mouse.x = x;
      mouse.y = y;
      mouse.active = x >= 0 && y >= 0 && x <= W && y <= H;
    };
    const onLeave = () => {
      mouse.active = false;
      mouse.x = -9999;
      mouse.y = -9999;
    };
    const onDown = (e: PointerEvent) => {
      const { x, y } = pointerLocalCoords(e);
      if (x < 0 || y < 0 || x > W || y > H) return;
      mouse.down = true;
      shocks.push({ x, y, t: performance.now() });
      if (shocks.length > 6) shocks.shift();
    };
    const onUp = () => {
      mouse.down = false;
    };

    // Window-level move/up so dragging outside the canvas still tracks
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerleave', onLeave);
    window.addEventListener('pointerup', onUp);
    // Canvas-level down so clicks only register inside the hero
    canvas.addEventListener('pointerdown', onDown);
    window.addEventListener('resize', resize);

    // ResizeObserver catches element-size changes that `resize` on `window`
    // misses (font swap, scrollbar appearance, parent flex/grid reflow).
    // Prefer `devicePixelContentBoxSize` when available — it returns physical
    // pixels directly and handles fractional DPR (zoom) without rounding bugs.
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const dpcb = (entry as ResizeObserverEntry & {
          devicePixelContentBoxSize?: ReadonlyArray<ResizeObserverSize>;
        }).devicePixelContentBoxSize;
        if (dpcb && dpcb[0]) {
          // Already in physical pixels — divide by the REAL devicePixelRatio
          // (not the capped renderDpr) to recover CSS pixels accurately.
          applySize(
            dpcb[0].inlineSize / actualDpr,
            dpcb[0].blockSize / actualDpr,
          );
        } else if (entry.contentBoxSize && entry.contentBoxSize[0]) {
          applySize(
            entry.contentBoxSize[0].inlineSize,
            entry.contentBoxSize[0].blockSize,
          );
        } else {
          applySize(entry.contentRect.width, entry.contentRect.height);
        }
      }
    });
    try {
      ro.observe(canvas, {
        box: 'device-pixel-content-box',
      } as ResizeObserverOptions);
    } catch {
      // Older browsers don't support the options object.
      ro.observe(canvas);
    }

    let t0 = performance.now();

    function frame(now: number) {
      const dt = Math.min(0.033, (now - t0) / 1000);
      t0 = now;

      const palette = isDark() ? COLORS.dark : COLORS.light;

      ctx!.fillStyle = palette.bg;
      ctx!.fillRect(0, 0, W, H);

      const time = now / 1000;
      const mouseRadius = 240;
      const mouseRadius2 = mouseRadius * mouseRadius;

      for (let k = 0; k < particles.length; k++) {
        const p = particles[k];

        // Idle drift — multi-harmonic wave motion
        const breathX =
          Math.sin(time * 1.1 + p.phase) * 5.0 +
          Math.cos(time * 0.55 + p.phase * 1.7 + p.hy * 0.006) * 3.5 +
          Math.sin(time * 0.35 + p.hx * 0.004) * 2.0;
        const breathY =
          Math.cos(time * 0.95 + p.phase * 1.3) * 5.0 +
          Math.sin(time * 0.6 + p.phase * 0.8 + p.hx * 0.006) * 3.5 +
          Math.cos(time * 0.3 + p.hy * 0.004) * 2.0;
        const targetX = p.hx + breathX;
        const targetY = p.hy + breathY;

        // Spring back toward home (softer so motion carries)
        let ax = (targetX - p.x) * 5.5;
        let ay = (targetY - p.y) * 5.5;

        // Mouse repulsion
        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < mouseRadius2 && d2 > 0.01) {
            const d = Math.sqrt(d2);
            const falloff = 1 - d / mouseRadius;
            const strength = falloff * falloff * 1800;
            ax += (dx / d) * strength;
            ay += (dy / d) * strength;
          }
        }

        // Click shockwaves — expanding ring push
        for (let s = 0; s < shocks.length; s++) {
          const sh = shocks[s];
          const age = (now - sh.t) / 1000;
          if (age > 1.4) continue;
          const dx = p.x - sh.x;
          const dy = p.y - sh.y;
          const d = Math.sqrt(dx * dx + dy * dy) + 0.001;
          const ringR = age * 720;
          const bandWidth = 80;
          const inBand = Math.exp(-Math.pow((d - ringR) / bandWidth, 2));
          const decay = Math.exp(-age * 1.8);
          const push = inBand * decay * 1800;
          ax += (dx / d) * push;
          ay += (dy / d) * push;
        }

        // Damped integration
        const damping = 3.6;
        p.vx += (ax - p.vx * damping) * dt;
        p.vy += (ay - p.vy * damping) * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
      }

      // Prune old shocks
      while (shocks.length && (now - shocks[0].t) / 1000 > 1.5) {
        shocks.shift();
      }

      // Draw
      ctx!.fillStyle = palette.dot;
      for (let k = 0; k < particles.length; k++) {
        const p = particles[k];
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx!.fill();
      }

      animationId = requestAnimationFrame(frame);
    }

    resize();
    animationId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointerdown', onDown);
      window.removeEventListener('resize', resize);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 w-full h-full"
    />
  );
}

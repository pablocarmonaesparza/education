'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * PathConnector — dashed connector between two stacked LessonItems.
 *
 * Two visual modes, picked by the offsets the dashboard passes in:
 *
 *   - **Straight vertical** (`fromOffset === toOffset`, both 0 by default):
 *     a single dashed rule centered at that x. Used in mobile and in
 *     any desktop pair that happens to land on the same x.
 *
 *   - **Curved Bézier** (different offsets, only happens in desktop
 *     with the serpentine path enabled): a smooth quadratic curve
 *     between the two card centers.
 *
 * Offsets are PX from the container's horizontal center (positive = right,
 * negative = left). Zero = center. The dashboard render computes them
 * with `sin(idx · π / period) · amplitude` for the desktop serpentine.
 *
 * Width measurement: the SVG uses preserveAspectRatio="none" so X
 * coordinates are in viewBox % (0..100). To map PX offsets to %, we
 * need the connector's actual rendered width — which depends on the
 * dashboard container's responsive max-width (max-w-[220px] mobile,
 * max-w-2xl desktop, but clamped lower in narrow desktop viewports
 * where the sidebar + chat panel eat into the content area). We use a
 * ResizeObserver to track the real width instead of hard-coding it,
 * so the curve always lands on the actual card centers regardless of
 * viewport.
 */
export default function PathConnector({
  fromOffset = 0,
  toOffset = 0,
}: {
  fromOffset?: number;
  toOffset?: number;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  // Default to 220 (mobile container width) so the first paint, before
  // the ResizeObserver fires, doesn't put a curve in the wrong place
  // when offsets are 0 (the only path that renders straight at 220).
  const [containerW, setContainerW] = useState(220);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w && w > 0) setContainerW(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const sameOffset = Math.abs(fromOffset - toOffset) < 1;

  // Convert PX offset → SVG viewBox X (0..100). Center is 50.
  const startX = 50 + (fromOffset / containerW) * 100;
  const endX = 50 + (toOffset / containerW) * 100;

  // Quadratic Bézier with the control point at the vertical midpoint and
  // horizontally between the two endpoints. When the offsets are equal
  // (mobile straight-line case), the curve degenerates to a vertical
  // line at startX — exactly what we want, no special-case render. Single
  // wrapper means the ref is always attached so the ResizeObserver keeps
  // working even after a mobile→desktop viewport flip swaps the offsets.
  const midX = (startX + endX) / 2;
  const d = sameOffset
    ? `M ${startX} 0 L ${startX} 32`
    : `M ${startX} 0 Q ${midX} 16 ${endX} 32`;

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className="w-full pointer-events-none select-none"
      style={{ height: '32px' }}
    >
      <svg
        width="100%"
        height="32"
        viewBox="0 0 100 32"
        preserveAspectRatio="none"
      >
        <path
          d={d}
          fill="none"
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray="6 6"
          vectorEffect="non-scaling-stroke"
          className="stroke-gray-300 dark:stroke-gray-700"
        />
      </svg>
    </div>
  );
}

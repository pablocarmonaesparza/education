'use client';

/**
 * PathConnector — SVG dashed curve between two LessonItems in the zigzag path.
 *
 * Layout assumptions (must mirror app/dashboard/page.tsx):
 *   - Cards are 220px wide in a max-w-md (448px) parent at sm+.
 *   - Zigzag only applies at sm+. Below sm, cards stack centered and this
 *     connector hides itself (see the outer `hidden sm:flex` class).
 *   - Because the parent is a fixed 448px at sm+, the position centers are
 *     deterministic ratios of that parent and safe to hardcode.
 *
 * Rendering strategy:
 *   - The SVG uses a normalized 0-100 viewBox and `preserveAspectRatio="none"`,
 *     so it stretches to the parent container width while keeping the curve
 *     aligned with the card centers.
 *   - `vectorEffect="non-scaling-stroke"` keeps the dashed pattern uniform
 *     regardless of stretch.
 */

interface PathConnectorProps {
  fromPos: number;
  toPos: number;
}

// Normalized horizontal center (0..1) of each card within the 448px parent.
// Card is 220px → half is 110px.
//   0: ml-0 mr-auto             center = 110 / 448
//   1: ml-[15%] mr-auto         center = (0.15*448 + 110) / 448
//   2: mx-auto                  center = 0.5
//   3: ml-auto mr-[15%]         center = 1 - (0.15*448 + 110) / 448
//   4: ml-auto mr-0             center = 1 - 110 / 448
//   5: ml-auto mr-[15%]         same as 3
const POSITION_CENTERS: Record<number, number> = {
  0: 110 / 448,
  1: (0.15 * 448 + 110) / 448,
  2: 0.5,
  3: 1 - (0.15 * 448 + 110) / 448,
  4: 1 - 110 / 448,
  5: 1 - (0.15 * 448 + 110) / 448,
};

export default function PathConnector({ fromPos, toPos }: PathConnectorProps) {
  const x1 = (POSITION_CENTERS[fromPos] ?? 0.5) * 100;
  const x2 = (POSITION_CENTERS[toPos] ?? 0.5) * 100;

  // Cubic bezier with vertical tangents at both endpoints for a soft S-curve.
  const path = `M ${x1} 0 C ${x1} 50, ${x2} 50, ${x2} 100`;

  return (
    <div
      aria-hidden="true"
      className="hidden sm:block w-full pointer-events-none select-none"
      style={{ height: '44px' }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="overflow-visible"
      >
        <path
          d={path}
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

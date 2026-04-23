'use client';

/**
 * PathConnector — dashed connector between two LessonItems.
 *
 * Two modes:
 *   - Straight vertical (`fromLeft === toLeft`): single dashed rule on
 *     the same side. Used when two lessons happen to land on the same
 *     side (e.g. only one lesson in a phase, or zigzag breaks).
 *   - Curved (`fromLeft !== toLeft`): a smooth quadratic Bézier that
 *     starts above-center on the source side and lands above-center on
 *     the destination side. Mirrors the Duolingo path aesthetic.
 *
 * Coordinates use a 100×32 viewBox with `preserveAspectRatio="none"`
 * so the same SVG scales to whatever width the parent container has.
 * The 25 / 75 anchors are intentional: cards are 220px wide and live
 * inside a container that's wider than the card on at least one side
 * (mobile: card + ~60-120px of asymmetric room; desktop: card + ~450px
 * of room flowing into the milestone-hint slot). The 25/75 anchors
 * land near the card's vertical center on both breakpoints — not
 * pixel-perfect, but visually coherent and stable across viewport sizes.
 */
export default function PathConnector({
  fromLeft = true,
  toLeft = false,
}: {
  fromLeft?: boolean;
  toLeft?: boolean;
}) {
  const sameSide = fromLeft === toLeft;

  // Anchor X positions (percent of container width).
  const startX = fromLeft ? 25 : 75;
  const endX = toLeft ? 25 : 75;

  const d = sameSide
    ? `M ${startX} 0 L ${endX} 32`
    : // Quadratic Bézier with the control point at the vertical midpoint
      // and horizontally between the two endpoints — gives the smooth
      // S-feel of the Duolingo path without being too aggressive.
      `M ${startX} 0 Q ${(startX + endX) / 2} 16 ${endX} 32`;

  return (
    <div
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

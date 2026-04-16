'use client';

/**
 * PathConnector — straight dashed line between two stacked LessonItems.
 *
 * Cards stack vertically centered; this connector is just a short vertical
 * dashed rule (3px, gray-300 / dark:gray-700) that sits between them.
 */

export default function PathConnector() {
  return (
    <div
      aria-hidden="true"
      className="w-full flex justify-center pointer-events-none select-none"
      style={{ height: '32px' }}
    >
      <svg
        width="4"
        height="100%"
        viewBox="0 0 4 100"
        preserveAspectRatio="none"
      >
        <path
          d="M 2 0 L 2 100"
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

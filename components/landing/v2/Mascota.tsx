'use client';

/**
 * Mascota — SVG inline portado del prototipo claude-design.
 * Cuadrado azul con cara estilo Duo/Itera.
 *
 * mood: 'default' | 'focused' | 'win'
 *   - default: ojos circulares + sonrisa suave
 *   - focused: ojos rendijas + boca recta (concentrado)
 *   - win:     ojos curvos felices + boca abierta sonriendo
 */

interface MascotaProps {
  size?: number;
  mood?: 'default' | 'focused' | 'win';
  className?: string;
  eyeXY?: { x: number; y: number };
}

export default function Mascota({
  size = 36,
  mood = 'default',
  className = '',
  eyeXY = { x: 0, y: 0 },
}: MascotaProps) {
  return (
    <svg
      viewBox="0 0 240 240"
      width={size}
      height={size}
      className={className}
      style={{ filter: 'drop-shadow(0 6px 0 rgba(10,22,40,0.18))' }}
      aria-hidden="true"
    >
      <rect x="32" y="44" width="176" height="176" rx="44" fill="#0E5FCC" />
      <rect
        x="32"
        y="32"
        width="176"
        height="176"
        rx="44"
        fill="#1472FF"
        stroke="#0a1628"
        strokeWidth="3"
      />
      <path
        d="M48 60 Q48 44 64 44 L176 44 Q192 44 192 60 L192 78"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />

      {/* eyes — varían por mood + eye-tracking opcional */}
      <g
        style={{
          transform: `translate(${eyeXY.x}px, ${eyeXY.y}px)`,
          transition: 'transform 80ms ease-out',
        }}
      >
        {mood === 'focused' ? (
          <>
            <rect x="82" y="116" width="28" height="6" rx="3" fill="#0a1628" />
            <rect x="146" y="116" width="28" height="6" rx="3" fill="#0a1628" />
          </>
        ) : mood === 'win' ? (
          <>
            <path
              d="M80 122 Q96 108 112 122"
              stroke="#0a1628"
              strokeWidth="6"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M144 122 Q160 108 176 122"
              stroke="#0a1628"
              strokeWidth="6"
              strokeLinecap="round"
              fill="none"
            />
          </>
        ) : (
          <>
            <circle cx="96" cy="118" r="13" fill="#0a1628" />
            <circle cx="100" cy="114" r="4" fill="#fff" />
            <circle cx="160" cy="118" r="13" fill="#0a1628" />
            <circle cx="164" cy="114" r="4" fill="#fff" />
          </>
        )}
      </g>

      {/* mouth */}
      {mood === 'default' && (
        <path
          d="M108 156 Q128 168 148 156"
          stroke="#0a1628"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />
      )}
      {mood === 'focused' && (
        <rect x="116" y="158" width="24" height="5" rx="2.5" fill="#0a1628" />
      )}
      {mood === 'win' && (
        <path
          d="M100 152 Q128 184 156 152 Q140 174 128 174 Q116 174 100 152 Z"
          fill="#0a1628"
        />
      )}

      {/* sparkle */}
      <g transform="translate(190 38)">
        <path
          d="M0 -10 L3 -3 L10 0 L3 3 L0 10 L-3 3 L-10 0 L-3 -3 Z"
          fill="#22c55e"
          stroke="#0a1628"
          strokeWidth="2"
        />
      </g>
    </svg>
  );
}

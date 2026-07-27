/**
 * Animated radar-ping indicator dot.
 *
 * A solid dot sits still in the center, with a ring outline that continuously
 * scales up (0.4x → 1.6x) while fading out — like a heartbeat pulse, looping
 * infinitely. Teal variant loops every 2.2s; amber variant every 2.6s.
 *
 * Respects `prefers-reduced-motion` via the global CSS rule in global.css.
 * Server Component — animation is pure CSS, no JS required.
 */

type PulseDotProps = {
  color: 'teal' | 'amber';
  /** 14 for the Sync Pulse strip, 16 for Sync Status detail cards. */
  size?: 14 | 16;
};

const colorStyles = {
  teal: {
    dot: 'bg-[var(--accent-teal)]',
    ring: 'border-[var(--accent-teal)]',
    duration: '2.2s',
  },
  amber: {
    dot: 'bg-[var(--accent-amber)]',
    ring: 'border-[var(--accent-amber)]',
    duration: '2.6s',
  },
};

export function PulseDot(props: PulseDotProps) {
  const { color, size = 14 } = props;
  const styles = colorStyles[color];

  return (
    <div className="relative flex-none" style={{ width: size, height: size }} aria-hidden="true">
      {/* Expanding ring */}
      <span
        className={['absolute inset-0 rounded-full border', styles.ring].join(' ')}
        style={{
          animation: `pulse-ring ${styles.duration} ease-out infinite`,
        }}
      />
      {/* Solid center dot */}
      <span
        className={['absolute rounded-full', styles.dot].join(' ')}
        style={{
          width: 8,
          height: 8,
          top: (size - 8) / 2,
          left: (size - 8) / 2,
        }}
      />
    </div>
  );
}

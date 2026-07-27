type PulseDotProps = {
  color?: 'teal' | 'amber';
  variant?: 'teal' | 'amber';
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
  const color = props.color ?? props.variant ?? 'teal';
  const size = props.size ?? 14;
  const styles = colorStyles[color];

  return (
    <div className="relative flex-none" style={{ width: size, height: size }} aria-hidden="true">
      <span
        className={['absolute inset-0 rounded-full border', styles.ring].join(' ')}
        style={{
          animation: `pulse-ring ${styles.duration} ease-out infinite`,
        }}
      />
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

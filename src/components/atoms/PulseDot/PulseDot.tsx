interface PulseDotProps {
  variant: 'teal' | 'amber';
  size?: 14 | 16;
}

export function PulseDot({ variant, size = 14 }: PulseDotProps) {
  const wrapStyle = {
    width: `${size}px`,
    height: `${size}px`,
  };

  const dotStyle = {
    width: `${size - 6}px`,
    height: `${size - 6}px`,
    top: `${(size - (size - 6)) / 2}px`,
    left: `${(size - (size - 6)) / 2}px`,
  };

  return (
    <div className="pulse-dot-wrap" style={wrapStyle}>
      <div className={`pulse-ring ${variant}`} />
      <div className={`pulse-dot ${variant}`} style={dotStyle} />
    </div>
  );
}

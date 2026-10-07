export function Logo({
  size = 40,
  src,
  alt = "লোগো",
}: {
  size?: number;
  src?: string;
  alt?: string;
}) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        width={size}
        height={size}
        className="shrink-0 rounded-[22%] object-contain"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-label="BUSS Science Club">
      <defs>
        <linearGradient id="lg1" x1="4" y1="4" x2="44" y2="44">
          <stop offset="0%" stopColor="#0a84ff" />
          <stop offset="55%" stopColor="#64d2ff" />
          <stop offset="100%" stopColor="#30d158" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="44" height="44" rx="12" stroke="url(#lg1)" strokeWidth="2.5" fill="none" />
      <g stroke="url(#lg1)" strokeWidth="2" fill="none">
        <ellipse cx="24" cy="24" rx="14" ry="5.5" transform="rotate(-30 24 24)" />
        <ellipse cx="24" cy="24" rx="14" ry="5.5" transform="rotate(30 24 24)" />
        <ellipse cx="24" cy="24" rx="14" ry="5.5" transform="rotate(90 24 24)" />
      </g>
      <circle cx="24" cy="24" r="3.2" fill="url(#lg1)" />
      <circle cx="35.5" cy="17.5" r="2" fill="#30d158" />
      <circle cx="13" cy="30.5" r="2" fill="#0a84ff" />
    </svg>
  );
}

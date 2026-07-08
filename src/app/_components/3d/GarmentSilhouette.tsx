// Stylized garment glyphs used by the 2D fallback viewer. Filled with the
// chosen design color so low-end devices still see their selection.

interface GarmentSilhouetteProps {
  garmentType: string;
  color: string;
  className?: string;
}

const SILHOUETTE_PATHS: Record<string, React.ReactNode> = {
  shirt: (
    <path d="M22 6 L26 4 C26 9 38 9 38 4 L42 6 L54 14 L48 24 L44 21 L44 58 L20 58 L20 21 L16 24 L10 14 Z" />
  ),
  jacket: (
    <path
      fillRule="evenodd"
      d="M20 6 L32 12 L44 6 L56 14 L50 26 L46 23 L46 60 L18 60 L18 23 L14 26 L8 14 Z M32 16 L27.5 58 L36.5 58 Z"
    />
  ),
  pants: (
    <path d="M20 6 L44 6 L46 26 L40 58 L34 58 L32 30 L30 58 L24 58 L18 26 Z" />
  ),
  dress: (
    <path d="M24 6 L28 4 C28 8 36 8 36 4 L40 6 L44 12 L42 22 L50 56 L14 56 L22 22 L20 12 Z" />
  ),
  skirt: (
    <>
      <rect x="23" y="8" width="18" height="5" rx="1.5" />
      <path d="M24 15 L40 15 L50 56 L14 56 Z" />
    </>
  ),
  other: (
    <path d="M32 4 a5 5 0 1 0 -5 5 h2 a3 3 0 1 1 3 -3 v6 L6 46 a3 3 0 0 0 2.5 4.5 h47 A3 3 0 0 0 58 46 L34 12 Z M32 18 L51 46 L13 46 Z" />
  ),
};

export function GarmentSilhouette({
  garmentType,
  color,
  className = "",
}: GarmentSilhouetteProps) {
  const glyph = SILHOUETTE_PATHS[garmentType] ?? SILHOUETTE_PATHS.other;

  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      fill={color}
      stroke="rgba(255,255,255,0.25)"
      strokeWidth="0.75"
      role="img"
      aria-label={`${garmentType || "garment"} preview`}
    >
      {glyph}
    </svg>
  );
}

import { useEffect, useRef, useState, type SyntheticEvent } from 'react';

/** Chemin du sprite (dans `public/`). */
export const SPRITE_URL = `${import.meta.env.BASE_URL}machamp.png`;

interface PixelSpriteProps {
  /** Hauteur visée en px CSS : le sprite est agrandi au plus grand multiple entier qui tient dedans. */
  height: number;
  className?: string;
  alt?: string;
}

/**
 * Affiche le sprite de Machamp net : `image-rendering: pixelated` et agrandissement
 * par un facteur entier en pixels physiques (y compris sur écrans haute densité).
 */
export function PixelSprite({ height, className, alt = '' }: PixelSpriteProps) {
  const ref = useRef<HTMLImageElement>(null);
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);

  const measure = (img: HTMLImageElement) => {
    const { naturalWidth: nw, naturalHeight: nh } = img;
    if (!nw || !nh) return;
    const dpr = window.devicePixelRatio || 1;
    const factor = Math.max(1, Math.floor((height * dpr) / nh));
    setSize({ width: (nw * factor) / dpr, height: (nh * factor) / dpr });
  };

  useEffect(() => {
    if (ref.current?.complete) measure(ref.current);
  }, [height]);

  return (
    <img
      ref={ref}
      src={SPRITE_URL}
      alt={alt}
      className={['pixel-sprite', className].filter(Boolean).join(' ')}
      style={size ? { width: size.width, height: size.height } : { height }}
      onLoad={(e: SyntheticEvent<HTMLImageElement>) => measure(e.currentTarget)}
      draggable={false}
      decoding="async"
    />
  );
}

/** Petit ▼ en pixels (clignote via CSS). */
export function PixelArrow({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 7 4" width="14" height="8" aria-hidden="true" shapeRendering="crispEdges">
      <path d="M0 0h7v1H0zM1 1h5v1H1zM2 2h3v1H2zM3 3h1v1H3z" fill="currentColor" />
    </svg>
  );
}

/** ✕ en pixels. */
export function PixelClose() {
  return (
    <svg viewBox="0 0 7 7" width="14" height="14" aria-hidden="true" shapeRendering="crispEdges">
      <path
        d="M0 0h2v1H0zM1 1h2v1H1zM2 2h3v1H2zM3 3h1v1H3zM2 4h3v1H2zM1 5h2v1H1zM0 6h2v1H0zM5 0h2v1H5zM4 1h2v1H4zM4 5h2v1H4zM5 6h2v1H5z"
        fill="currentColor"
      />
    </svg>
  );
}

/** Pointe de bulle en escalier (pointe vers le bas et la droite, vers Machamp). */
export function BubbleTail({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 5 5" width="15" height="15" aria-hidden="true" shapeRendering="crispEdges">
      <path d="M0 0h1v1h-1zM4 0h1v1h-1zM1 1h1v1h-1zM4 1h1v1h-1zM2 2h1v1h-1zM4 2h1v1h-1zM3 3h1v1h-1zM4 3h1v1h-1zM4 4h1v1h-1z" fill="var(--color-brown-dark)" />
      <path d="M1 0h1v1h-1zM2 0h1v1h-1zM3 0h1v1h-1zM2 1h1v1h-1zM3 1h1v1h-1zM3 2h1v1h-1z" fill="var(--bubble-bg)" />
    </svg>
  );
}

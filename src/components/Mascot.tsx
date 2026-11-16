import { useEffect, useState } from 'react';
import { MACHAMP_TEXT } from '../data/tips';
import { BubbleTail, PixelSprite } from './Pixel';

/** Délai avant que la bulle se réduise, pour ne pas gêner la lecture. */
const BUBBLE_DELAY = 7000;

export function Mascot({ onOpen }: { onOpen: () => void }) {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setCompact(true), BUBBLE_DELAY);
    // La bulle se réduit aussi dès qu'on fait défiler la page.
    const onScroll = () => {
      if (window.scrollY > 120) setCompact(true);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <div className="mascot">
      <button
        type="button"
        className={`mascot-bubble${compact ? ' is-compact' : ''}`}
        onClick={onOpen}
        aria-haspopup="dialog"
        aria-label={MACHAMP_TEXT.bubble}
      >
        <span className="mascot-bubble-text" aria-hidden="true">
          {compact ? '?' : MACHAMP_TEXT.bubble}
        </span>
        <BubbleTail className="mascot-bubble-tail" />
      </button>
      <button
        type="button"
        className="mascot-sprite-btn"
        onClick={onOpen}
        aria-haspopup="dialog"
        aria-label="Ouvrir les astuces de Machamp"
      >
        <PixelSprite height={72} className="mascot-sprite" />
      </button>
    </div>
  );
}

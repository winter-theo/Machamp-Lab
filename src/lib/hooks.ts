import { useCallback, useEffect, useState, type RefObject } from 'react';

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && !!window.matchMedia?.(REDUCED_MOTION).matches;
}

/** `true` si l'utilisateur a demandé moins d'animations. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(prefersReducedMotion);
  useEffect(() => {
    const query = window.matchMedia?.(REDUCED_MOTION);
    if (!query) return;
    const update = () => setReduced(query.matches);
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return reduced;
}

/**
 * Texte qui s'écrit lettre par lettre (façon boîte de dialogue des vieux jeux).
 * `skip()` affiche tout d'un coup.
 */
export function useTypewriter(text: string, active: boolean, msPerChar = 28) {
  const reduced = useReducedMotion();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active) {
      setCount(0);
      return;
    }
    if (reduced) {
      setCount(text.length);
      return;
    }
    setCount(0);
    const chars = [...text];
    let i = 0;
    const timer = window.setInterval(() => {
      i += 1;
      setCount(i);
      if (i >= chars.length) window.clearInterval(timer);
    }, msPerChar);
    return () => window.clearInterval(timer);
  }, [text, active, reduced, msPerChar]);

  const chars = [...text];
  const done = count >= chars.length;
  const skip = useCallback(() => setCount(Number.MAX_SAFE_INTEGER), []);
  return { shown: chars.slice(0, count).join(''), done, skip };
}

/** `true` sur les écrans larges (réglages à gauche, séance à droite). */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => typeof window !== 'undefined' && window.matchMedia?.(query).matches);
  useEffect(() => {
    const mq = window.matchMedia?.(query);
    if (!mq) return;
    const update = () => setMatches(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, [query]);
  return !!matches;
}

/**
 * `true` si l'élément tient en entier dans la hauteur de la fenêtre (marge comprise).
 * Sert à ne rendre la colonne des réglages « collante » sur ordinateur que lorsqu'elle tient.
 */
export function useFitsViewport(ref: RefObject<HTMLElement | null>, enabled: boolean, margin = 32): boolean {
  const [fits, setFits] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!enabled || !element) {
      setFits(false);
      return;
    }
    const update = () => setFits(element.getBoundingClientRect().height + margin <= window.innerHeight);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    window.addEventListener('resize', update);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [ref, enabled, margin]);
  return fits;
}

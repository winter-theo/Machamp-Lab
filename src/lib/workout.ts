import type { MovementPattern } from '../data/types';

/**
 * Structure d'une séance générée. Elle est sauvegardée telle quelle dans le
 * `localStorage` : elle contient donc tout ce qu'il faut pour l'afficher, même si
 * la bibliothèque d'exercices change entre-temps.
 */

export const TIMING = {
  /** Durée moyenne d'une répétition, en secondes. */
  secondsPerRep: 3,
  /** Transition entre deux exercices de renforcement ou deux blocs. */
  transition: 30,
  /** Transition entre deux mouvements d'échauffement ou d'étirement. */
  shortTransition: 10,
};

export type Prescription =
  | { kind: 'reps'; sets: number; reps: [number, number]; rest: number; unilateral: boolean }
  | { kind: 'time'; sets: number; seconds: number; rest: number; unilateral: boolean }
  | { kind: 'continuous'; minutes: number }
  | {
      kind: 'intervals';
      rounds: number;
      work: number;
      easy: number;
      workLabel: string;
      easyLabel: string;
    };

export type ItemRole = 'warmup' | 'main' | 'filler' | 'cooldown';

export interface ExerciseItem {
  kind: 'exercise';
  uid: string;
  exerciseId: string;
  name: string;
  pattern: MovementPattern;
  equipment: string[];
  cue: string;
  intensity: string;
  prescription: Prescription;
  role: ItemRole;
  /** Temps de transition compté avant cet exercice, en secondes. */
  transition: number;
}

export interface CircuitMove {
  uid: string;
  exerciseId: string;
  name: string;
  pattern: MovementPattern;
  equipment: string[];
  cue: string;
  /** Durée d'effort, en secondes (par côté si `perSide`). */
  seconds: number;
  perSide: boolean;
}

export interface CircuitItem {
  kind: 'circuit';
  uid: string;
  title: string;
  rounds: number;
  /** Repos après chaque mouvement, en secondes. */
  rest: number;
  /** Pause entre deux tours, en secondes. */
  roundRest: number;
  /** `true` si chaque mouvement a sa propre durée (enchaînement de mobilité). */
  ownDurations: boolean;
  moves: CircuitMove[];
  intensity: string;
  role: ItemRole;
  transition: number;
}

export type WorkoutItem = ExerciseItem | CircuitItem;

export type SectionId = 'warmup' | 'main' | 'cooldown';

export interface WorkoutSection {
  id: SectionId;
  title: string;
  items: WorkoutItem[];
}

export interface Workout {
  version: 1;
  id: string;
  createdAt: number;
  typeId: string;
  typeLabel: string;
  /** Durée demandée, en minutes. */
  duration: number;
  /** Équipement coché au moment de la génération (ids valides). */
  equipment: string[];
  sections: WorkoutSection[];
  /** Messages de Machamp à afficher au-dessus de la séance. */
  notices: string[];
}

/* ------------------------------------------------------------------ */
/* Estimation du temps                                                 */
/* ------------------------------------------------------------------ */

export function prescriptionSeconds(p: Prescription): number {
  switch (p.kind) {
    case 'reps': {
      const avg = (p.reps[0] + p.reps[1]) / 2;
      const sides = p.unilateral ? 2 : 1;
      return p.sets * (avg * TIMING.secondsPerRep * sides + p.rest);
    }
    case 'time': {
      const sides = p.unilateral ? 2 : 1;
      return p.sets * (p.seconds * sides + p.rest);
    }
    case 'continuous':
      return p.minutes * 60;
    case 'intervals':
      return p.rounds * (p.work + p.easy);
  }
}

export function circuitRoundSeconds(item: Pick<CircuitItem, 'moves' | 'rest'>): number {
  return item.moves.reduce((sum, m) => sum + m.seconds * (m.perSide ? 2 : 1) + item.rest, 0);
}

export function itemSeconds(item: WorkoutItem): number {
  if (item.kind === 'exercise') return prescriptionSeconds(item.prescription) + item.transition;
  return (
    item.rounds * circuitRoundSeconds(item) + Math.max(0, item.rounds - 1) * item.roundRest + item.transition
  );
}

export function itemsSeconds(items: readonly WorkoutItem[]): number {
  return items.reduce((sum, item) => sum + itemSeconds(item), 0);
}

export function workoutSeconds(workout: Workout): number {
  return workout.sections.reduce((sum, s) => sum + itemsSeconds(s.items), 0);
}

/* ------------------------------------------------------------------ */
/* Cases à cocher et progression                                       */
/* ------------------------------------------------------------------ */

/** Au-delà, un bloc fractionné n'a qu'une seule case (pour ne pas surcharger l'écran). */
const MAX_BOXES = 12;

/** Nombre de petites cases (séries ou tours) d'un exercice. 1 = seulement la case principale. */
export function boxCount(item: WorkoutItem): number {
  if (item.kind === 'circuit') return Math.max(1, item.rounds);
  const p = item.prescription;
  if (p.kind === 'reps' || p.kind === 'time') return Math.max(1, p.sets);
  if (p.kind === 'intervals') return p.rounds <= MAX_BOXES ? Math.max(1, p.rounds) : 1;
  return 1;
}

/** Nombre d'exercices comptés dans la progression (un circuit compte chacun de ses mouvements). */
export function exerciseCount(item: WorkoutItem): number {
  return item.kind === 'circuit' ? item.moves.length : 1;
}

export function allItems(workout: Workout): WorkoutItem[] {
  return workout.sections.flatMap((s) => s.items);
}

export type Checks = Record<string, boolean[]>;

export function itemChecks(item: WorkoutItem, checks: Checks): boolean[] {
  const n = boxCount(item);
  const saved = checks[item.uid] ?? [];
  return Array.from({ length: n }, (_, i) => saved[i] === true);
}

export function isItemDone(item: WorkoutItem, checks: Checks): boolean {
  return itemChecks(item, checks).every(Boolean);
}

export interface Progress {
  done: number;
  total: number;
  /** Avancement fin (séries cochées comprises), entre 0 et 1. */
  ratio: number;
}

export function workoutProgress(workout: Workout, checks: Checks): Progress {
  let done = 0;
  let total = 0;
  let weighted = 0;
  for (const item of allItems(workout)) {
    const count = exerciseCount(item);
    const boxes = itemChecks(item, checks);
    const checked = boxes.filter(Boolean).length;
    total += count;
    if (checked === boxes.length) done += count;
    weighted += count * (checked / boxes.length);
  }
  return { done, total, ratio: total === 0 ? 0 : weighted / total };
}

/** Retrouve un exercice ou un circuit de la séance par son uid. */
export function findItem(workout: Workout, uid: string): WorkoutItem | undefined {
  return allItems(workout).find((item) => item.uid === uid);
}

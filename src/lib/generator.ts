/**
 * Générateur de séances — fonction pure, sans interface.
 *
 *   generateWorkout({ typeId: 'full-body', duration: 45, equipment: ['halteres'] })
 *
 * L'aléatoire est injectable (`options.random`) pour obtenir des séances reproductibles
 * dans les tests. Les données aussi (`options.data`).
 */
import { EQUIPMENT } from '../data/equipment';
import { EXERCISES } from '../data/exercises';
import { MACHAMP_NOTICES } from '../data/tips';
import type {
  CircuitRules,
  Equipment,
  Exercise,
  MovementPattern,
  Phase,
  StrengthRules,
  WorkoutType,
} from '../data/types';
import { WORKOUT_TYPES } from '../data/workoutTypes';
import { randomInt, shuffle, weightedPick, type Rng } from './random';
import {
  TIMING,
  itemSeconds,
  itemsSeconds,
  type CircuitItem,
  type CircuitMove,
  type ExerciseItem,
  type ItemRole,
  type Prescription,
  type Workout,
  type WorkoutItem,
  type WorkoutSection,
} from './workout';

/* ------------------------------------------------------------------ */
/* API publique                                                        */
/* ------------------------------------------------------------------ */

export interface GeneratorInput {
  typeId: string;
  /** Durée souhaitée, en minutes. */
  duration: number;
  /** Ids d'équipement cochés. Les ids inconnus sont ignorés. */
  equipment: readonly string[];
}

export interface GeneratorData {
  exercises: Exercise[];
  equipment: Equipment[];
  workoutTypes: WorkoutType[];
}

export interface GeneratorOptions {
  /** Source d'aléatoire, `Math.random` par défaut. */
  random?: Rng;
  /** Données à utiliser à la place de celles de `src/data/`. */
  data?: Partial<GeneratorData>;
  /** Horodatage de création (par défaut : maintenant). */
  now?: number;
}

/** Tolérance de durée : ±10 % de la durée choisie, et au moins ±2 min. En secondes. */
export function toleranceSeconds(durationMinutes: number): number {
  return Math.max(0.1 * durationMinutes, 2) * 60;
}

export const SECTION_TITLES: Record<WorkoutSection['id'], string> = {
  warmup: 'Échauffement',
  main: 'Séance',
  cooldown: 'Retour au calme',
};

/* ------------------------------------------------------------------ */
/* Réglages internes                                                   */
/* ------------------------------------------------------------------ */

const DEFAULT_STRENGTH: StrengthRules = { sets: { base: 3, min: 2, max: 5 }, maxExercises: 9 };

const DEFAULT_CIRCUIT: CircuitRules = {
  blockName: 'Circuit',
  work: 40,
  rest: 20,
  roundRest: 60,
  blockRest: 90,
  exercises: [4, 6],
  rounds: [2, 4],
  blockMinutes: 14,
  useExerciseDuration: false,
  intensity: 'Effort 7–8/10, rythme régulier',
};

const INTENSITY = {
  warmupMachine: 'Effort 3 → 5/10 : commence tranquille, accélère doucement',
  warmupDrill: 'Tranquille, amplitude progressive',
  stretch: 'Étirement doux, sans douleur · respire lentement',
  mobility: 'Amplitude confortable, sans douleur',
  steady: 'Effort 5–6/10 : tu peux encore parler par phrases courtes',
  intervals: 'Effort 8/10 sur les phases intenses, 3/10 pour récupérer',
  filler: 'Cardio modéré : effort 4–5/10, respiration aisée',
};

const COMPOUND = new Set<MovementPattern>([
  'squat',
  'fente',
  'charniere',
  'poussee-horizontale',
  'poussee-verticale',
  'tirage-horizontal',
  'tirage-vertical',
]);
const CORE = new Set<MovementPattern>(['gainage', 'anti-rotation', 'flexion-tronc']);
const NOT_STRENGTH = new Set<MovementPattern>(['echauffement', 'mobilite', 'etirement', 'cardio-continu', 'cardio-fractionne']);

/** Une séance de 15 min ou moins est « express ». */
const EXPRESS_MAX = 15;
/** Jusqu'à cette durée, les repos sont plafonnés à 60 s. */
const SHORT_SESSION_MAX = 30;
const SHORT_REST_CAP = 60;

/* ------------------------------------------------------------------ */
/* Contexte et utilitaires                                             */
/* ------------------------------------------------------------------ */

interface Ctx {
  rng: Rng;
  pool: Exercise[];
  used: Set<string>;
  type: WorkoutType;
  duration: number;
  restCap: number;
  uid: () => string;
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
const phasesOf = (ex: Exercise): Phase[] => ex.phases ?? ['main'];
const isSetBased = (ex: Exercise) => ex.mode === 'reps' || ex.mode === 'time';
const equipmentWeight = (ex: Exercise) => (ex.equipment.length > 0 ? 3 : 1);

function resolveData(options: GeneratorOptions): GeneratorData {
  return {
    exercises: options.data?.exercises ?? EXERCISES,
    equipment: options.data?.equipment ?? EQUIPMENT,
    workoutTypes: options.data?.workoutTypes ?? WORKOUT_TYPES,
  };
}

function availablePool(data: GeneratorData, equipmentIds: readonly string[]): Exercise[] {
  const checked = new Set(equipmentIds);
  return data.exercises.filter((ex) => ex.equipment.every((id) => checked.has(id)));
}

function makeUidFactory(rng: Rng): () => string {
  const prefix = Math.floor(rng() * 36 ** 5).toString(36);
  let n = 0;
  return () => `${prefix}-${(n++).toString(36)}`;
}

function available(ctx: Ctx, accept: (ex: Exercise) => boolean): Exercise[] {
  return ctx.pool.filter((ex) => !ctx.used.has(ex.id) && accept(ex));
}

/** Prend un exercice pour un créneau : premier type de mouvement disponible, puis tirage pondéré. */
function pickForSlot(
  ctx: Ctx,
  slot: readonly MovementPattern[],
  accept: (ex: Exercise) => boolean,
): Exercise | undefined {
  for (const pattern of slot) {
    const candidates = available(ctx, (ex) => ex.pattern === pattern && accept(ex));
    if (candidates.length) return weightedPick(ctx.rng, candidates, equipmentWeight);
  }
  return undefined;
}

/* ------------------------------------------------------------------ */
/* Construction des exercices                                          */
/* ------------------------------------------------------------------ */

function strengthIntensity(ex: Exercise): string {
  if (ex.intensity) return ex.intensity;
  if (CORE.has(ex.pattern)) {
    return ex.mode === 'time'
      ? 'Gainage solide, respiration calme : arrête avant de perdre la position'
      : 'Mouvement contrôlé · garde 2 répétitions en réserve';
  }
  if (COMPOUND.has(ex.pattern)) return 'Effort 7–8/10 · garde 2 répétitions en réserve';
  if (ex.pattern === 'cardio') return 'Effort 7–8/10, rythme régulier';
  return 'Effort 8/10 · garde 1 à 2 répétitions en réserve';
}

function holdIntensity(ex: Exercise, role: ItemRole): string {
  if (ex.intensity) return ex.intensity;
  if (role === 'cooldown' || ex.pattern === 'etirement') return INTENSITY.stretch;
  if (role === 'warmup') return INTENSITY.warmupDrill;
  return INTENSITY.mobility;
}

function continuousIntensity(ex: Exercise, role: ItemRole): string {
  if (role === 'warmup') return INTENSITY.warmupMachine;
  if (role === 'filler') return INTENSITY.filler;
  return ex.intensity ?? INTENSITY.steady;
}

function setsPrescription(ex: Exercise, sets: number, restCap: number): Prescription {
  const rest = Math.min(ex.defaults.rest ?? 60, restCap);
  if (ex.mode === 'time') {
    return { kind: 'time', sets, seconds: ex.defaults.seconds ?? 30, rest, unilateral: !!ex.unilateral };
  }
  return { kind: 'reps', sets, reps: ex.defaults.reps ?? [10, 12], rest, unilateral: !!ex.unilateral };
}

function makeItem(
  ctx: Pick<Ctx, 'uid'>,
  ex: Exercise,
  role: ItemRole,
  prescription: Prescription,
  intensity: string,
  transition: number,
): ExerciseItem {
  return {
    kind: 'exercise',
    uid: ctx.uid(),
    exerciseId: ex.id,
    name: ex.name,
    pattern: ex.pattern,
    equipment: [...ex.equipment],
    cue: ex.cue,
    intensity,
    prescription,
    role,
    transition,
  };
}

function setsItem(ctx: Pick<Ctx, 'uid' | 'restCap'>, ex: Exercise, sets: number): ExerciseItem {
  return makeItem(ctx, ex, 'main', setsPrescription(ex, sets, ctx.restCap), strengthIntensity(ex), TIMING.transition);
}

function holdItem(ctx: Pick<Ctx, 'uid'>, ex: Exercise, role: ItemRole, seconds?: number): ExerciseItem {
  const secs = seconds ?? ex.defaults.seconds ?? 45;
  return makeItem(
    ctx,
    ex,
    role,
    { kind: 'time', sets: 1, seconds: secs, rest: 0, unilateral: !!ex.unilateral },
    holdIntensity(ex, role),
    TIMING.shortTransition,
  );
}

function continuousItem(ctx: Pick<Ctx, 'uid'>, ex: Exercise, minutes: number, role: ItemRole): ExerciseItem {
  return makeItem(
    ctx,
    ex,
    role,
    { kind: 'continuous', minutes: Math.max(1, Math.round(minutes)) },
    continuousIntensity(ex, role),
    role === 'warmup' ? TIMING.shortTransition : TIMING.transition,
  );
}

function intervalsPrescription(ex: Exercise, rounds: number): Prescription {
  return {
    kind: 'intervals',
    rounds: clamp(Math.round(rounds), 2, 30),
    work: ex.defaults.work ?? 60,
    easy: ex.defaults.easy ?? 60,
    workLabel: ex.defaults.workLabel ?? 'intense',
    easyLabel: ex.defaults.easyLabel ?? 'facile',
  };
}

function intervalsItem(ctx: Pick<Ctx, 'uid'>, ex: Exercise, rounds: number): ExerciseItem {
  return makeItem(
    ctx,
    ex,
    'main',
    intervalsPrescription(ex, rounds),
    ex.intensity ?? INTENSITY.intervals,
    TIMING.transition,
  );
}

function withSets(item: ExerciseItem, sets: number): ExerciseItem {
  const p = item.prescription;
  if (p.kind !== 'reps' && p.kind !== 'time') return item;
  return { ...item, prescription: { ...p, sets } };
}

function setsOf(item: ExerciseItem): number {
  const p = item.prescription;
  return p.kind === 'reps' || p.kind === 'time' ? p.sets : 1;
}

/* ------------------------------------------------------------------ */
/* Ajustement de la durée                                              */
/* ------------------------------------------------------------------ */

interface Adjustment {
  delta: number;
  apply: () => void;
}

/**
 * Rapproche une durée de sa cible par petites retouches. Les retouches sont groupées
 * par priorité : on n'essaie un groupe que si aucun groupe précédent n'améliore la durée.
 */
function optimize(
  total: () => number,
  target: number,
  tiers: Array<(diff: number) => Adjustment[]>,
  threshold = 30,
  maxIterations = 400,
): void {
  for (let i = 0; i < maxIterations; i++) {
    const diff = target - total();
    if (Math.abs(diff) <= threshold) return;
    let applied = false;
    for (const tier of tiers) {
      const options = tier(diff).filter((a) => a.delta !== 0 && Math.abs(diff - a.delta) < Math.abs(diff));
      if (options.length) {
        options.sort((a, b) => Math.abs(diff - a.delta) - Math.abs(diff - b.delta));
        options[0].apply();
        applied = true;
        break;
      }
    }
    if (!applied) return;
  }
}

/* ------------------------------------------------------------------ */
/* Séance principale : renforcement (Full body, Haut, Bas, Abdos)     */
/* ------------------------------------------------------------------ */

function buildStrength(ctx: Ctx, budget: number): ExerciseItem[] {
  const rules = ctx.type.strength ?? DEFAULT_STRENGTH;
  const slots = ctx.type.slots.length ? ctx.type.slots : [[]];
  const baseSets = ctx.duration <= EXPRESS_MAX ? rules.sets.min : rules.sets.base;
  const accept = (ex: Exercise) =>
    isSetBased(ex) && phasesOf(ex).includes('main') && ex.workoutTypes.includes(ctx.type.id);

  // Durée typique d'un exercice de ce type, pour savoir combien en prévoir.
  const typePool = available(ctx, accept);
  const estimates = typePool.map(
    (ex) => itemSeconds({ ...setsItem({ uid: () => '', restCap: ctx.restCap }, ex, baseSets) }),
  );
  const typical = estimates.length ? estimates.reduce((a, b) => a + b, 0) / estimates.length : 300;
  // On arrondit vers le haut : un peu plus de variété, les séries s'ajustent ensuite.
  const wanted = clamp(Math.ceil(budget / typical - 0.15), 1, rules.maxExercises);

  let cursor = 0;
  const peekNext = (): { ex: Exercise; cursor: number } | undefined => {
    for (let tries = 0; tries < slots.length; tries++) {
      const slot = slots[(cursor + tries) % slots.length];
      const ex = pickForSlot(ctx, slot, accept);
      if (ex) return { ex, cursor: cursor + tries + 1 };
    }
    return undefined;
  };

  const items: ExerciseItem[] = [];
  while (items.length < wanted) {
    const next = peekNext();
    if (!next) break;
    cursor = next.cursor;
    ctx.used.add(next.ex.id);
    items.push(setsItem(ctx, next.ex, baseSets));
  }

  // Filet de sécurité : n'importe quel exercice de renforcement disponible.
  if (items.length === 0) {
    const fallback = weightedPick(
      ctx.rng,
      available(ctx, (ex) => isSetBased(ex) && phasesOf(ex).includes('main') && !NOT_STRENGTH.has(ex.pattern)),
      equipmentWeight,
    );
    if (fallback) {
      ctx.used.add(fallback.id);
      items.push(setsItem(ctx, fallback, baseSets));
    }
  }

  let allowAdd = true;
  optimize(() => itemsSeconds(items), budget, [
    // 1. Ajuster les séries (en gardant une répartition équilibrée)
    (diff) => {
      const grow = diff > 0;
      const adjustable = items.filter((it) => (grow ? setsOf(it) < rules.sets.max : setsOf(it) > rules.sets.min));
      if (!adjustable.length) return [];
      const extreme = grow
        ? Math.min(...adjustable.map(setsOf))
        : Math.max(...adjustable.map(setsOf));
      const ordered = grow ? adjustable : [...adjustable].reverse();
      const chosen = ordered.find((it) => setsOf(it) === extreme);
      if (!chosen) return [];
      const next = withSets(chosen, setsOf(chosen) + (grow ? 1 : -1));
      return [
        {
          delta: itemSeconds(next) - itemSeconds(chosen),
          apply: () => {
            items[items.indexOf(chosen)] = next;
          },
        },
      ];
    },
    // 2. Ajouter ou retirer un exercice
    (diff) => {
      if (diff > 0 && allowAdd && items.length < rules.maxExercises) {
        const next = peekNext();
        if (!next) return [];
        const item = setsItem(ctx, next.ex, rules.sets.min);
        return [
          {
            delta: itemSeconds(item),
            apply: () => {
              cursor = next.cursor;
              ctx.used.add(next.ex.id);
              items.push(item);
            },
          },
        ];
      }
      if (diff < 0 && items.length > 1) {
        const last = items[items.length - 1];
        return [
          {
            delta: -itemSeconds(last),
            apply: () => {
              items.pop();
              ctx.used.delete(last.exerciseId);
              allowAdd = false;
            },
          },
        ];
      }
      return [];
    },
  ]);

  return items;
}

/* ------------------------------------------------------------------ */
/* Séance principale : circuits (HIIT, mobilité, cardio sans machine) */
/* ------------------------------------------------------------------ */

function buildCircuits(
  ctx: Ctx,
  budget: number,
  rules: CircuitRules,
  slots: readonly MovementPattern[][],
  accept: (ex: Exercise) => boolean,
): CircuitItem[] {
  const moveSeconds = (ex: Exercise) => (rules.useExerciseDuration ? ex.defaults.seconds ?? rules.work : rules.work);
  const perSide = (ex: Exercise) => rules.useExerciseDuration && !!ex.unilateral;
  const makeMove = (ex: Exercise): CircuitMove => ({
    uid: ctx.uid(),
    exerciseId: ex.id,
    name: ex.name,
    pattern: ex.pattern,
    equipment: [...ex.equipment],
    cue: ex.cue,
    seconds: moveSeconds(ex),
    perSide: perSide(ex),
  });
  const safeSlots = slots.length ? slots : [[]];

  const pickMove = (offset: number): Exercise | undefined => {
    for (let tries = 0; tries < safeSlots.length; tries++) {
      const ex = pickForSlot(ctx, safeSlots[(offset + tries) % safeSlots.length], accept);
      if (ex) return ex;
    }
    return undefined;
  };

  const pickMoves = (count: number): CircuitMove[] => {
    const moves: CircuitMove[] = [];
    let cursor = 0;
    let misses = 0;
    while (moves.length < count && misses < safeSlots.length) {
      const slot = safeSlots[cursor % safeSlots.length];
      cursor++;
      const ex = pickForSlot(ctx, slot, accept);
      if (!ex) {
        misses++;
        continue;
      }
      misses = 0;
      ctx.used.add(ex.id);
      moves.push(makeMove(ex));
    }
    return moves;
  };

  const newBlock = (moves: CircuitMove[], rounds: number): CircuitItem => ({
    kind: 'circuit',
    uid: ctx.uid(),
    title: rules.blockName,
    rounds,
    rest: rules.rest,
    roundRest: rules.roundRest,
    ownDurations: rules.useExerciseDuration,
    moves,
    intensity: rules.intensity,
    role: 'main',
    transition: rules.useExerciseDuration ? TIMING.shortTransition : TIMING.transition,
  });

  // Nombre de blocs : assez pour tenir la durée, sans faire de blocs trop longs.
  const candidates = available(ctx, accept);
  const typicalMove = candidates.length
    ? candidates.reduce((s, ex) => s + moveSeconds(ex) * (perSide(ex) ? 2 : 1) + rules.rest, 0) / candidates.length
    : rules.work + rules.rest;
  const maxBlock =
    rules.exercises[1] * typicalMove * rules.rounds[1] + (rules.rounds[1] - 1) * rules.roundRest + rules.blockRest;
  const maxTotal = rules.maxTotalExercises ?? Number.POSITIVE_INFINITY;
  const blockCount = Math.min(
    Math.max(1, Math.ceil(budget / maxBlock), Math.round(budget / (rules.blockMinutes * 60))),
    Math.max(1, Math.floor(maxTotal / rules.exercises[0])),
  );

  const blocks: CircuitItem[] = [];
  const totalMoves = () => blocks.reduce((n, b) => n + b.moves.length, 0);
  for (let b = 0; b < blockCount; b++) {
    const room = maxTotal - totalMoves();
    if (blocks.length > 0 && room < rules.exercises[0]) break;
    const moves = pickMoves(Math.min(room, randomInt(ctx.rng, rules.exercises[0], rules.exercises[1])));
    if (moves.length === 0) break;
    if (blocks.length > 0 && moves.length < Math.min(3, rules.exercises[0])) {
      moves.forEach((m) => ctx.used.delete(m.exerciseId));
      break;
    }
    blocks.push(newBlock(moves, rules.rounds[0]));
  }

  const sync = () => {
    blocks.forEach((block, i) => {
      block.transition =
        i === 0 ? (rules.useExerciseDuration ? TIMING.shortTransition : TIMING.transition) : rules.blockRest;
      block.title = blocks.length > 1 ? `${rules.blockName} ${String.fromCharCode(65 + i)}` : rules.blockName;
    });
  };
  const total = () => {
    sync();
    return itemsSeconds(blocks);
  };
  const roundDelta = (block: CircuitItem) => itemSeconds({ ...block, rounds: block.rounds + 1 }) - itemSeconds(block);

  optimize(total, budget, [
    // 1. Ajouter / retirer un tour (répartition équilibrée)
    (diff) => {
      const grow = diff > 0;
      const adjustable = blocks.filter((b) => (grow ? b.rounds < rules.rounds[1] : b.rounds > rules.rounds[0]));
      if (!adjustable.length) return [];
      const extreme = grow ? Math.min(...adjustable.map((b) => b.rounds)) : Math.max(...adjustable.map((b) => b.rounds));
      const chosen = (grow ? adjustable : [...adjustable].reverse()).find((b) => b.rounds === extreme);
      if (!chosen) return [];
      return [
        {
          delta: grow ? roundDelta(chosen) : -(itemSeconds(chosen) - itemSeconds({ ...chosen, rounds: chosen.rounds - 1 })),
          apply: () => {
            chosen.rounds += grow ? 1 : -1;
          },
        },
      ];
    },
    // 2. Ajouter / retirer un mouvement
    (diff) => {
      const grow = diff > 0;
      const options: Adjustment[] = [];
      for (const block of blocks) {
        if (grow && block.moves.length < rules.exercises[1] && totalMoves() < maxTotal) {
          const ex = pickMove(block.moves.length);
          if (!ex) continue;
          const move = makeMove(ex);
          const bigger = { ...block, moves: [...block.moves, move] };
          options.push({
            delta: itemSeconds(bigger) - itemSeconds(block),
            apply: () => {
              ctx.used.add(ex.id);
              block.moves.push(move);
            },
          });
          break;
        }
      }
      if (!grow) {
        const block = [...blocks].reverse().find((b) => b.moves.length > rules.exercises[0]);
        if (block) {
          const last = block.moves[block.moves.length - 1];
          const smaller = { ...block, moves: block.moves.slice(0, -1) };
          options.push({
            delta: itemSeconds(smaller) - itemSeconds(block),
            apply: () => {
              block.moves.pop();
              ctx.used.delete(last.exerciseId);
            },
          });
        }
      }
      return options;
    },
    // 3. Ajouter / retirer un bloc
    (diff) => {
      if (diff > 0 && totalMoves() + rules.exercises[0] <= maxTotal) {
        const before = new Set(ctx.used);
        const moves = pickMoves(rules.exercises[0]);
        // pickMoves a marqué les exercices : on annule tant que le bloc n'est pas retenu.
        moves.forEach((m) => {
          if (!before.has(m.exerciseId)) ctx.used.delete(m.exerciseId);
        });
        if (moves.length < Math.min(3, rules.exercises[0])) return [];
        const block = newBlock(moves, rules.rounds[0]);
        block.transition = rules.blockRest;
        return [
          {
            delta: itemSeconds(block),
            apply: () => {
              moves.forEach((m) => ctx.used.add(m.exerciseId));
              blocks.push(block);
            },
          },
        ];
      }
      if (diff < 0 && blocks.length > 1) {
        const last = blocks[blocks.length - 1];
        return [
          {
            delta: -itemSeconds(last),
            apply: () => {
              blocks.pop();
              last.moves.forEach((m) => ctx.used.delete(m.exerciseId));
            },
          },
        ];
      }
      return [];
    },
  ]);
  sync();
  return blocks;
}

/* ------------------------------------------------------------------ */
/* Séance principale : cardio                                          */
/* ------------------------------------------------------------------ */

/** Blocs continus (machines d'abord, puis poids du corps), répartis sur plusieurs exercices si long. */
function buildSteady(
  ctx: Ctx,
  seconds: number,
  role: ItemRole,
  accept: (ex: Exercise) => boolean = () => true,
): ExerciseItem[] {
  const options = available(
    ctx,
    (ex) => ex.mode === 'continuous' && phasesOf(ex).includes('main') && accept(ex),
  );
  if (!options.length || seconds < 60) return [];
  // Machines en premier, en variant les machines.
  const machines = shuffle(ctx.rng, options.filter((ex) => ex.equipment.length > 0));
  const seen = new Set<string>();
  const distinct = machines.filter((ex) => {
    const key = ex.equipment.join('+');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  const ordered = [...distinct, ...machines.filter((ex) => !distinct.includes(ex)), ...shuffle(ctx.rng, options.filter((ex) => ex.equipment.length === 0))];

  const blockCount = clamp(Math.ceil(seconds / (30 * 60 + TIMING.transition)), 1, ordered.length);
  const minutes = Math.max(1, Math.round((seconds - blockCount * TIMING.transition) / 60));
  const items: ExerciseItem[] = [];
  const base = Math.floor(minutes / blockCount);
  const remainder = minutes - base * blockCount;
  for (let i = 0; i < blockCount; i++) {
    const ex = ordered[i];
    ctx.used.add(ex.id);
    items.push(continuousItem(ctx, ex, Math.max(1, base + (i < remainder ? 1 : 0)), role));
  }
  return items;
}

function buildMachineCardio(ctx: Ctx, budget: number, accept: (ex: Exercise) => boolean): ExerciseItem[] {
  const steadyOk = (ex: Exercise) => accept(ex) && ex.mode === 'continuous' && ex.equipment.length > 0;
  const intervalsOk = (ex: Exercise) => accept(ex) && ex.mode === 'intervals';
  const machines = shuffle(
    ctx.rng,
    [...new Set(available(ctx, (ex) => steadyOk(ex) || intervalsOk(ex)).map((ex) => ex.equipment.join('+')))],
  );

  const blockCount = clamp(Math.round(budget / (12 * 60)), 1, 8);
  const perBlock = budget / blockCount - TIMING.transition;
  const items: ExerciseItem[] = [];

  const makeBlock = (kind: 'steady' | 'intervals', machine: string | undefined, seconds: number) => {
    const order: Array<'steady' | 'intervals'> = kind === 'steady' ? ['steady', 'intervals'] : ['intervals', 'steady'];
    for (const k of order) {
      const okFn = k === 'steady' ? steadyOk : intervalsOk;
      const all = available(ctx, okFn);
      const sameMachine = all.filter((ex) => ex.equipment.join('+') === machine);
      const ex = weightedPick(ctx.rng, sameMachine.length ? sameMachine : all, () => 1);
      if (!ex) continue;
      if (ex.mode === 'continuous') return continuousItem(ctx, ex, Math.max(3, seconds / 60), 'main');
      const roundSec = (ex.defaults.work ?? 60) + (ex.defaults.easy ?? 60);
      return intervalsItem(ctx, ex, clamp(Math.round(seconds / roundSec), 2, 12));
    }
    return undefined;
  };

  for (let i = 0; i < blockCount; i++) {
    const kind = blockCount === 1 ? 'intervals' : i % 2 === 0 ? 'steady' : 'intervals';
    const block = makeBlock(kind, machines[i % Math.max(1, machines.length)], perBlock);
    if (!block) break;
    ctx.used.add(block.exerciseId);
    items.push(block);
  }

  optimize(() => itemsSeconds(items), budget, [
    // 1. Allonger / raccourcir un bloc
    (diff) => {
      const grow = diff > 0;
      const options: Adjustment[] = [];
      items.forEach((item, index) => {
        const p = item.prescription;
        if (p.kind === 'continuous') {
          const minutes = p.minutes + (grow ? 1 : -1);
          if (minutes >= 3 && minutes <= 45) {
            options.push({
              delta: grow ? 60 : -60,
              apply: () => {
                items[index] = { ...item, prescription: { ...p, minutes } };
              },
            });
          }
        } else if (p.kind === 'intervals') {
          const rounds = p.rounds + (grow ? 1 : -1);
          if (rounds >= 2 && rounds <= 12) {
            options.push({
              delta: (grow ? 1 : -1) * (p.work + p.easy),
              apply: () => {
                items[index] = { ...item, prescription: { ...p, rounds } };
              },
            });
          }
        }
      });
      return options;
    },
    // 2. Ajouter / retirer un bloc
    (diff) => {
      if (diff > 0) {
        const kind = items.length % 2 === 0 ? 'steady' : 'intervals';
        const block = makeBlock(kind, machines[items.length % Math.max(1, machines.length)], Math.min(diff, 12 * 60));
        if (!block) return [];
        return [
          {
            delta: itemSeconds(block),
            apply: () => {
              ctx.used.add(block.exerciseId);
              items.push(block);
            },
          },
        ];
      }
      if (items.length > 1) {
        const last = items[items.length - 1];
        return [
          {
            delta: -itemSeconds(last),
            apply: () => {
              items.pop();
              ctx.used.delete(last.exerciseId);
            },
          },
        ];
      }
      return [];
    },
  ]);
  return items;
}

function buildCardio(ctx: Ctx, budget: number, notices: string[], hasEquipment: boolean): WorkoutItem[] {
  const accept = (ex: Exercise) => phasesOf(ex).includes('main') && ex.workoutTypes.includes(ctx.type.id);
  const hasMachines =
    available(ctx, (ex) => accept(ex) && ex.equipment.length > 0 && (ex.mode === 'continuous' || ex.mode === 'intervals'))
      .length > 0;
  if (hasMachines) return buildMachineCardio(ctx, budget, accept);

  if (hasEquipment) notices.push(MACHAMP_NOTICES.cardioNoMachine);
  const rules = ctx.type.circuit ?? DEFAULT_CIRCUIT;
  // Au-delà de 40 min de circuits, on complète avec un bloc continu (marche rapide…).
  const circuitBudget = budget - 40 * 60 >= 5 * 60 ? 40 * 60 : budget;
  const items: WorkoutItem[] = buildCircuits(ctx, circuitBudget, rules, ctx.type.slots, (ex) => accept(ex) && isSetBased(ex));
  const remaining = budget - itemsSeconds(items);
  if (remaining >= 4 * 60) items.push(...buildSteady(ctx, remaining, 'main', accept));
  return items;
}

/* ------------------------------------------------------------------ */
/* Échauffement et retour au calme                                    */
/* ------------------------------------------------------------------ */

/**
 * Classe des exercices pour couvrir un maximum de muscles travaillés dans la séance,
 * en évitant de cibler toujours la même zone (avec un peu d'aléatoire).
 */
function rankByCoverage(ctx: Ctx, candidates: Exercise[], focus: Set<string>): Exercise[] {
  const remaining = [...candidates];
  const covered = new Set<string>();
  const ranked: Exercise[] = [];
  while (remaining.length) {
    let bestIndex = 0;
    let bestScore = -Infinity;
    remaining.forEach((ex, i) => {
      const relevant = ex.muscles.filter((m) => focus.has(m));
      const fresh = relevant.filter((m) => !covered.has(m)).length;
      const score = fresh * 2 + relevant.length * 0.5 + ctx.rng() * 1.2;
      if (score > bestScore) {
        bestScore = score;
        bestIndex = i;
      }
    });
    const [best] = remaining.splice(bestIndex, 1);
    best.muscles.forEach((m) => covered.add(m));
    ranked.push(best);
  }
  return ranked;
}

function buildWarmup(ctx: Ctx, seconds: number, focus: Set<string>): ExerciseItem[] {
  const machines = available(
    ctx,
    (ex) => phasesOf(ex).includes('warmup') && ex.mode === 'continuous' && ex.equipment.length > 0,
  );
  if (machines.length) {
    // On privilégie les exercices pensés uniquement pour l'échauffement.
    const ex = weightedPick(ctx.rng, machines, (e) => (phasesOf(e).length === 1 ? 3 : 1))!;
    ctx.used.add(ex.id);
    return [continuousItem(ctx, ex, Math.max(1, Math.round((seconds - TIMING.shortTransition) / 60)), 'warmup')];
  }

  const drills = available(ctx, (ex) => phasesOf(ex).includes('warmup') && ex.mode === 'time');
  const count = clamp(Math.round(seconds / 62), 1, 8);
  const cardio = shuffle(ctx.rng, drills.filter((d) => d.pattern === 'cardio'));
  const others = rankByCoverage(ctx, drills.filter((d) => d.pattern !== 'cardio'), focus);
  const chosen: Exercise[] = [];
  if (cardio.length) chosen.push(cardio[0]);
  for (const d of others) {
    if (chosen.length >= count) break;
    chosen.push(d);
  }
  for (const d of cardio.slice(1)) {
    if (chosen.length >= count) break;
    // Un deuxième mouvement cardio au milieu de l'échauffement, pour remonter la température.
    chosen.splice(Math.ceil(chosen.length / 2), 0, d);
  }
  return chosen.map((ex) => {
    ctx.used.add(ex.id);
    return holdItem(ctx, ex, 'warmup', ex.unilateral ? 30 : 45);
  });
}

function buildCooldown(ctx: Ctx, seconds: number, focus: Set<string>): ExerciseItem[] {
  const stretches = available(ctx, (ex) => phasesOf(ex).includes('cooldown') && ex.mode === 'time');
  const ranked = rankByCoverage(ctx, stretches, focus);
  // La respiration (muscle « Récupération ») termine les retours au calme d'au moins 4 min.
  const breathing = ranked.find((ex) => ex.muscles.includes('Récupération'));
  const others = ranked.filter((ex) => ex !== breathing);
  const endWithBreathing = !!breathing && seconds >= 4 * 60;
  const reserve = endWithBreathing ? itemSeconds(holdItem({ uid: () => '' }, breathing, 'cooldown')) : 0;

  const items: ExerciseItem[] = [];
  let total = 0;
  for (const ex of others) {
    if (items.length > 0 && total + reserve >= seconds - 25) break;
    if (items.length >= 8) break;
    const item = holdItem(ctx, ex, 'cooldown');
    ctx.used.add(ex.id);
    items.push(item);
    total += itemSeconds(item);
  }
  if (breathing && (endWithBreathing || items.length === 0)) {
    ctx.used.add(breathing.id);
    items.push(holdItem(ctx, breathing, 'cooldown'));
  }
  return items;
}

/* ------------------------------------------------------------------ */
/* Génération complète                                                 */
/* ------------------------------------------------------------------ */

function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? `{${key}}`));
}

function exerciseIdsOf(items: readonly WorkoutItem[]): string[] {
  return items.flatMap((item) => (item.kind === 'circuit' ? item.moves.map((m) => m.exerciseId) : [item.exerciseId]));
}

export function generateWorkout(input: GeneratorInput, options: GeneratorOptions = {}): Workout {
  const data = resolveData(options);
  const rng = options.random ?? Math.random;
  const type = data.workoutTypes.find((t) => t.id === input.typeId) ?? data.workoutTypes[0];
  if (!type) throw new Error('Aucun type de séance défini.');

  const duration = clamp(Math.round(input.duration) || 45, 5, 240);
  const knownEquipment = new Set(data.equipment.map((e) => e.id));
  const equipment = [...new Set(input.equipment.filter((id) => knownEquipment.has(id)))];
  const target = duration * 60;
  const express = duration <= EXPRESS_MAX;

  const ctx: Ctx = {
    rng,
    pool: availablePool(data, equipment),
    used: new Set(),
    type,
    duration,
    restCap: duration <= SHORT_SESSION_MAX ? SHORT_REST_CAP : Number.POSITIVE_INFINITY,
    uid: makeUidFactory(rng),
  };
  const notices: string[] = [];

  // Échauffement ~10 % (3–8 min) et retour au calme ~10 % (2–6 min), réduits en séance express.
  const warmupRange: [number, number] = express ? [60, 180] : [180, 480];
  const cooldownRange: [number, number] = express ? [60, 120] : [120, 360];
  const warmup0 = express ? 120 : clamp(Math.round(duration * 0.1) * 60, ...warmupRange);
  const cooldown0 = express ? 60 : clamp(Math.round(duration * 0.1) * 60, ...cooldownRange);
  const mainBudget = target - warmup0 - cooldown0;

  // Au-delà de la durée raisonnable pour ce type, le reste devient un bloc de cardio modéré.
  const overflow = duration > type.maxMinutes;
  const coreBudget = overflow ? Math.min(mainBudget, type.maxMinutes * 60 - warmup0 - cooldown0) : mainBudget;

  let main: WorkoutItem[];
  if (type.format === 'cardio') {
    main = buildCardio(ctx, coreBudget, notices, equipment.length > 0);
  } else if (type.format === 'circuit') {
    const rules = type.circuit ?? DEFAULT_CIRCUIT;
    main = buildCircuits(ctx, coreBudget, rules, type.slots, (ex) =>
      phasesOf(ex).includes('main') && ex.workoutTypes.includes(type.id) && isSetBased(ex),
    );
  } else {
    main = buildStrength(ctx, coreBudget);
  }

  // Jamais de séance vide : au pire, des exercices au poids du corps pris au hasard.
  if (main.length === 0) {
    const fallback = available(ctx, (ex) => isSetBased(ex) && phasesOf(ex).includes('main') && ex.equipment.length === 0);
    for (const ex of shuffle(rng, fallback).slice(0, 4)) {
      ctx.used.add(ex.id);
      main.push(setsItem(ctx, ex, 3));
    }
  }

  // Bloc complémentaire si la séance principale ne remplit pas le temps prévu.
  const missing = mainBudget - itemsSeconds(main);
  let filler: ExerciseItem[] = [];
  if ((overflow && missing >= 3 * 60) || missing >= 5 * 60) {
    filler = buildSteady(ctx, missing, 'filler');
    if (filler.length) {
      notices.push(
        fill(type.overflowMessage ?? MACHAMP_NOTICES.overflow, {
          minutes: duration,
          type: type.label,
          max: type.maxMinutes,
        }),
      );
    }
  }

  const coreSeconds = itemsSeconds(main) + itemsSeconds(filler);

  // Muscles travaillés : servent à choisir l'échauffement et les étirements.
  const focus = new Set<string>();
  const byId = new Map(data.exercises.map((ex) => [ex.id, ex]));
  for (const id of exerciseIdsOf([...main, ...filler])) byId.get(id)?.muscles.forEach((m) => focus.add(m));

  // Échauffement et retour au calme s'ajustent (dans leurs bornes) pour coller à la durée.
  const warmupTarget = clamp(Math.round((target - coreSeconds - cooldown0) / 60) * 60, ...warmupRange);
  const warmup = buildWarmup(ctx, warmupTarget, focus);
  const cooldownTarget = clamp(target - coreSeconds - itemsSeconds(warmup), ...cooldownRange);
  const cooldown = buildCooldown(ctx, cooldownTarget, focus);

  // Dernier filet : si on est encore hors tolérance, on ajuste le bloc complémentaire.
  const tolerance = toleranceSeconds(duration);
  const total = () => itemsSeconds(warmup) + itemsSeconds(main) + itemsSeconds(filler) + itemsSeconds(cooldown);
  if (total() < target - tolerance) {
    const extra = target - total();
    const lastFiller = filler[filler.length - 1];
    if (lastFiller && lastFiller.prescription.kind === 'continuous') {
      const p = lastFiller.prescription;
      filler[filler.length - 1] = { ...lastFiller, prescription: { ...p, minutes: p.minutes + Math.round(extra / 60) } };
    } else {
      filler.push(...buildSteady(ctx, extra, 'filler'));
    }
  }
  if (total() > target + tolerance) {
    // On raccourcit d'abord l'échauffement sur machine, puis le retour au calme.
    const first = warmup[0];
    if (first && first.prescription.kind === 'continuous') {
      const excess = Math.ceil((total() - target) / 60);
      const minutes = Math.max(1, first.prescription.minutes - excess);
      warmup[0] = { ...first, prescription: { kind: 'continuous', minutes } };
    }
    while (total() > target + tolerance && warmup.length > 1) warmup.pop();
    while (total() > target + tolerance && cooldown.length > 1) cooldown.pop();
  }

  // Messages de Machamp
  if (equipment.length === 0) {
    notices.unshift(MACHAMP_NOTICES.noEquipment);
  } else if (
    type.format === 'strength' ||
    (type.format === 'circuit' && !(type.circuit?.useExerciseDuration ?? false))
  ) {
    const ids = exerciseIdsOf(main);
    const equipped = ids.filter((id) => (byId.get(id)?.equipment.length ?? 0) > 0).length;
    if (ids.length > 0 && equipped / ids.length < 1 / 3) {
      notices.unshift(fill(MACHAMP_NOTICES.weakEquipment, { type: type.label }));
    }
  }
  if (express) notices.push(MACHAMP_NOTICES.express);

  return {
    version: 1,
    id: ctx.uid(),
    createdAt: options.now ?? Date.now(),
    typeId: type.id,
    typeLabel: type.label,
    duration,
    equipment,
    sections: [
      { id: 'warmup', title: SECTION_TITLES.warmup, items: warmup },
      { id: 'main', title: SECTION_TITLES.main, items: [...main, ...filler] },
      { id: 'cooldown', title: SECTION_TITLES.cooldown, items: cooldown },
    ],
    notices,
  };
}

/* ------------------------------------------------------------------ */
/* Remplacer un exercice                                               */
/* ------------------------------------------------------------------ */

interface Located {
  sectionIndex: number;
  itemIndex: number;
  item: WorkoutItem;
  moveIndex?: number;
}

function locate(workout: Workout, uid: string): Located | undefined {
  for (let s = 0; s < workout.sections.length; s++) {
    const items = workout.sections[s].items;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.uid === uid) return { sectionIndex: s, itemIndex: i, item };
      if (item.kind === 'circuit') {
        const m = item.moves.findIndex((move) => move.uid === uid);
        if (m >= 0) return { sectionIndex: s, itemIndex: i, item, moveIndex: m };
      }
    }
  }
  return undefined;
}

/** Exercices qui peuvent remplacer l'exercice `uid` (même type de mouvement, équipement compatible). */
export function getAlternatives(workout: Workout, uid: string, options: GeneratorOptions = {}): Exercise[] {
  const found = locate(workout, uid);
  if (!found) return [];
  const data = resolveData(options);
  const pool = availablePool(data, workout.equipment);
  const usedIds = new Set(exerciseIdsOf(workout.sections.flatMap((s) => s.items)));

  if (found.item.kind === 'circuit' && found.moveIndex !== undefined) {
    const move = found.item.moves[found.moveIndex];
    return pool.filter(
      (ex) =>
        !usedIds.has(ex.id) &&
        ex.pattern === move.pattern &&
        isSetBased(ex) &&
        phasesOf(ex).includes('main') &&
        ex.workoutTypes.includes(workout.typeId),
    );
  }
  if (found.item.kind !== 'exercise') return [];

  const item = found.item;
  const phase: Phase = item.role === 'warmup' ? 'warmup' : item.role === 'cooldown' ? 'cooldown' : 'main';
  const kind = item.prescription.kind;
  return pool.filter((ex) => {
    if (usedIds.has(ex.id) || ex.pattern !== item.pattern || !phasesOf(ex).includes(phase)) return false;
    if (kind === 'continuous' && ex.mode !== 'continuous') return false;
    if (kind === 'intervals' && ex.mode !== 'intervals') return false;
    if ((kind === 'reps' || kind === 'time') && !isSetBased(ex)) return false;
    if (item.role === 'main' && !ex.workoutTypes.includes(workout.typeId)) return false;
    if (item.role === 'warmup' && kind === 'continuous' && item.equipment.length > 0 && ex.equipment.length === 0) {
      return false;
    }
    return true;
  });
}

/**
 * Remplace l'exercice `uid` par une alternative tirée au hasard.
 * Renvoie une nouvelle séance, ou `null` s'il n'y a aucune alternative.
 */
export function replaceExercise(workout: Workout, uid: string, options: GeneratorOptions = {}): Workout | null {
  const found = locate(workout, uid);
  if (!found) return null;
  const rng = options.random ?? Math.random;
  const alternatives = getAlternatives(workout, uid, options);
  const ex = weightedPick(rng, alternatives, equipmentWeight);
  if (!ex) return null;

  const uidFactory = makeUidFactory(rng);
  const ctx = {
    uid: uidFactory,
    restCap: workout.duration <= SHORT_SESSION_MAX ? SHORT_REST_CAP : Number.POSITIVE_INFINITY,
  };

  let replacement: WorkoutItem;
  const item = found.item;
  if (item.kind === 'circuit' && found.moveIndex !== undefined) {
    const old = item.moves[found.moveIndex];
    const move: CircuitMove = {
      uid: uidFactory(),
      exerciseId: ex.id,
      name: ex.name,
      pattern: ex.pattern,
      equipment: [...ex.equipment],
      cue: ex.cue,
      seconds: item.ownDurations ? ex.defaults.seconds ?? old.seconds : old.seconds,
      perSide: item.ownDurations && !!ex.unilateral,
    };
    const moves = [...item.moves];
    moves[found.moveIndex] = move;
    replacement = { ...item, moves };
  } else if (item.kind === 'exercise') {
    const p = item.prescription;
    if (p.kind === 'continuous') {
      replacement = { ...continuousItem(ctx, ex, p.minutes, item.role), transition: item.transition };
    } else if (p.kind === 'intervals') {
      const oldSeconds = p.rounds * (p.work + p.easy);
      const roundSec = (ex.defaults.work ?? 60) + (ex.defaults.easy ?? 60);
      replacement = intervalsItem(ctx, ex, clamp(Math.round(oldSeconds / roundSec), 2, 12));
    } else if (item.role === 'warmup' || item.role === 'cooldown' || p.sets === 1) {
      const seconds = item.role === 'warmup' ? (ex.unilateral ? 30 : 45) : undefined;
      replacement = { ...holdItem(ctx, ex, item.role, seconds), transition: item.transition };
    } else {
      replacement = setsItem(ctx, ex, p.sets);
    }
  } else {
    return null;
  }

  const sections = workout.sections.map((section, s) =>
    s !== found.sectionIndex
      ? section
      : { ...section, items: section.items.map((it, i) => (i === found.itemIndex ? replacement : it)) },
  );
  return { ...workout, sections };
}

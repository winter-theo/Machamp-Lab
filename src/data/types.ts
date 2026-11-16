/**
 * Types partagés par les données (`src/data/`) et le générateur (`src/lib/`).
 * Pour ajouter du contenu, tu n'as normalement pas besoin de toucher à ce fichier :
 * modifie `equipment.ts`, `exercises.ts`, `workoutTypes.ts` ou `tips.ts`.
 */

/* ------------------------------------------------------------------ */
/* Équipement                                                          */
/* ------------------------------------------------------------------ */

export interface EquipmentCategory {
  id: string;
  label: string;
}

export interface Equipment {
  /** Identifiant stable (sert dans `exercises.ts` et dans la sauvegarde locale). */
  id: string;
  /** Libellé affiché à l'écran. */
  label: string;
  /** Emoji (ou court texte) affiché à côté du libellé. */
  icon: string;
  /** Id d'une catégorie de `EQUIPMENT_CATEGORIES`. */
  category: string;
}

/* ------------------------------------------------------------------ */
/* Exercices                                                           */
/* ------------------------------------------------------------------ */

/**
 * Type de mouvement. Il sert à équilibrer les séances et au bouton « Remplacer »
 * (on remplace toujours par un exercice du même type de mouvement).
 */
export type MovementPattern =
  // Bas du corps
  | 'squat'
  | 'fente'
  | 'charniere'
  | 'quadriceps'
  | 'ischios'
  | 'fessiers'
  | 'mollets'
  // Haut du corps
  | 'poussee-horizontale'
  | 'poussee-verticale'
  | 'tirage-horizontal'
  | 'tirage-vertical'
  | 'pectoraux'
  | 'epaules'
  | 'biceps'
  | 'triceps'
  // Tronc
  | 'gainage'
  | 'anti-rotation'
  | 'flexion-tronc'
  // Cardio
  | 'cardio' // mouvement court et intense (station de circuit, poids du corps…)
  | 'cardio-continu' // bloc continu (machine ou marche)
  | 'cardio-fractionne' // bloc fractionné sur machine
  // Échauffement, mobilité, étirements
  | 'echauffement'
  | 'mobilite'
  | 'etirement';

/** Moment de la séance où l'exercice peut apparaître. */
export type Phase = 'warmup' | 'main' | 'cooldown';

/**
 * - `reps` : séries × répétitions
 * - `time` : séries × durée (gainage, étirements, mobilité…)
 * - `continuous` : bloc cardio continu (durée ajustée par le générateur)
 * - `intervals` : bloc cardio fractionné (nombre de répétitions ajusté par le générateur)
 */
export type ExerciseMode = 'reps' | 'time' | 'continuous' | 'intervals';

export interface ExerciseDefaults {
  /** Nombre de séries par défaut (`reps` et `time`). */
  sets?: number;
  /** Fourchette de répétitions, ex. [10, 12] (`reps`). */
  reps?: [number, number];
  /** Durée d'une série en secondes, par côté si unilatéral (`time`). */
  seconds?: number;
  /** Repos entre les séries, en secondes. */
  rest?: number;
  /** Fractionné : durée de l'effort et de la récupération, en secondes (`intervals`). */
  work?: number;
  easy?: number;
  /** Fractionné : comment appeler l'effort et la récupération (« intense » / « facile »). */
  workLabel?: string;
  easyLabel?: string;
}

export interface Exercise {
  id: string;
  name: string;
  /** Ids d'équipement requis : TOUS doivent être cochés. Liste vide = poids du corps. */
  equipment: string[];
  pattern: MovementPattern;
  /** Muscles principalement sollicités (sert aussi à choisir les étirements). */
  muscles: string[];
  /** Ids des types de séance compatibles (voir `workoutTypes.ts`). */
  workoutTypes: string[];
  /** Phases possibles. Par défaut : séance principale uniquement. */
  phases?: Phase[];
  mode: ExerciseMode;
  defaults: ExerciseDefaults;
  /** Exercice à faire de chaque côté (le temps estimé est doublé). */
  unilateral?: boolean;
  /** Consigne technique d'une ligne. */
  cue: string;
  /** Intensité affichée, si tu veux remplacer celle proposée par défaut. */
  intensity?: string;
}

/* ------------------------------------------------------------------ */
/* Types de séance                                                     */
/* ------------------------------------------------------------------ */

/**
 * - `strength` : séries classiques (Full body, Haut, Bas, Abdos)
 * - `circuit` : circuits ou enchaînements par tours (HIIT, Mobilité)
 * - `cardio` : blocs continus / fractionnés sur machine (sinon circuits au poids du corps)
 */
export type WorkoutFormat = 'strength' | 'circuit' | 'cardio';

export interface StrengthRules {
  /** Séries de départ, minimum et maximum par exercice. */
  sets: { base: number; min: number; max: number };
  /** Nombre maximum d'exercices dans la séance principale. */
  maxExercises: number;
}

export interface CircuitRules {
  /** Nom d'un bloc : « Circuit », « Enchaînement »… */
  blockName: string;
  /** Effort et repos par exercice, en secondes. */
  work: number;
  rest: number;
  /** Pause entre deux tours, en secondes. */
  roundRest: number;
  /** Pause entre deux blocs, en secondes. */
  blockRest: number;
  /** Nombre d'exercices par bloc [min, max]. */
  exercises: [number, number];
  /** Nombre de tours par bloc [min, max]. */
  rounds: [number, number];
  /** Durée visée pour un bloc, en minutes (le générateur ajuste). */
  blockMinutes: number;
  /** Nombre maximum d'exercices différents sur l'ensemble des blocs (facultatif). */
  maxTotalExercises?: number;
  /**
   * `true` : chaque exercice garde sa propre durée (`defaults.seconds`) et les exercices
   * unilatéraux se font de chaque côté (mobilité). `false` : durée fixe `work` pour tous (HIIT).
   */
  useExerciseDuration: boolean;
  /** Intensité affichée sur le bloc. */
  intensity: string;
}

export interface WorkoutType {
  id: string;
  label: string;
  /** Libellé court pour les petits badges (exemple de semaine). Par défaut : `label`. */
  shortLabel?: string;
  icon: string;
  description: string;
  format: WorkoutFormat;
  /**
   * Ordre des types de mouvement dans la séance principale. Chaque créneau liste les
   * mouvements acceptés par ordre de préférence ; le générateur parcourt les créneaux
   * en boucle.
   */
  slots: MovementPattern[][];
  /**
   * Durée au-delà de laquelle la séance n'est plus raisonnable pour ce type : le
   * générateur complète alors avec un bloc de cardio modéré et Machamp le signale.
   */
  maxMinutes: number;
  /** Message de Machamp quand la durée dépasse `maxMinutes` ({minutes} et {type} sont remplacés). */
  overflowMessage?: string;
  strength?: StrengthRules;
  /** Règles des circuits (HIIT, mobilité) ou du cardio sans machine. */
  circuit?: CircuitRules;
}

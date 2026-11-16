import type { WorkoutType } from './types';

/**
 * Types de séance, dans l'ordre d'affichage.
 *
 * Pour ajouter un type : ajoute une entrée ici (id unique, format, créneaux de mouvements,
 * durée max), puis ajoute son `id` dans le champ `workoutTypes` des exercices compatibles
 * (`exercises.ts`). L'interface affiche automatiquement la nouvelle carte.
 *
 * ⚠️ Ne change pas l'`id` d'un type existant : il sert dans la sauvegarde locale et dans
 * les conseils de Machamp (`tips.ts`).
 */
export const WORKOUT_TYPES: WorkoutType[] = [
  {
    id: 'full-body',
    label: 'Full body',
    shortLabel: 'Full',
    icon: '💪',
    description: 'Tout le corps en une séance',
    format: 'strength',
    // squat/fente → poussée → charnière → tirage → gainage, deux fois.
    slots: [
      ['squat', 'fente'],
      ['poussee-horizontale', 'poussee-verticale'],
      ['charniere', 'fessiers'],
      ['tirage-horizontal', 'tirage-vertical'],
      ['gainage', 'anti-rotation', 'flexion-tronc'],
      ['fente', 'squat'],
      ['poussee-verticale', 'poussee-horizontale'],
      ['fessiers', 'charniere'],
      ['tirage-vertical', 'tirage-horizontal'],
      ['anti-rotation', 'gainage', 'flexion-tronc'],
    ],
    maxMinutes: 90,
    strength: { sets: { base: 3, min: 2, max: 5 }, maxExercises: 9 },
  },
  {
    id: 'haut',
    label: 'Haut du corps',
    shortLabel: 'Haut',
    icon: '🦾',
    description: 'Pecs, dos, épaules et bras',
    format: 'strength',
    slots: [
      ['poussee-horizontale'],
      ['tirage-horizontal'],
      ['poussee-verticale', 'poussee-horizontale'],
      ['tirage-vertical', 'tirage-horizontal'],
      ['epaules'],
      ['biceps'],
      ['triceps'],
      ['pectoraux', 'poussee-horizontale'],
      ['tirage-horizontal', 'tirage-vertical'],
      ['epaules', 'poussee-verticale'],
    ],
    maxMinutes: 90,
    strength: { sets: { base: 3, min: 2, max: 5 }, maxExercises: 9 },
  },
  {
    id: 'bas',
    label: 'Bas du corps',
    shortLabel: 'Bas',
    icon: '🦵',
    description: 'Cuisses, fessiers et mollets',
    format: 'strength',
    slots: [
      ['squat'],
      ['charniere'],
      ['fente'],
      ['quadriceps', 'squat'],
      ['ischios', 'charniere'],
      ['fessiers'],
      ['mollets'],
      ['fente', 'squat'],
      ['fessiers', 'charniere'],
      ['quadriceps', 'fente'],
    ],
    maxMinutes: 90,
    strength: { sets: { base: 3, min: 2, max: 5 }, maxExercises: 9 },
  },
  {
    id: 'cardio',
    label: 'Cardio',
    shortLabel: 'Cardio',
    icon: '❤️',
    description: 'Endurance et fractionné',
    format: 'cardio',
    // Pour le cardio, les créneaux servent aux circuits au poids du corps (sans machine).
    // Avec des machines cochées, le générateur alterne blocs continus et fractionnés.
    slots: [
      ['cardio'],
      ['squat', 'fente', 'cardio'],
      ['cardio'],
      ['gainage', 'anti-rotation', 'cardio'],
      ['cardio'],
      ['cardio'],
    ],
    maxMinutes: 120,
    circuit: {
      blockName: 'Circuit cardio',
      work: 45,
      rest: 15,
      roundRest: 60,
      blockRest: 90,
      exercises: [4, 6],
      rounds: [2, 4],
      blockMinutes: 15,
      maxTotalExercises: 10,
      useExerciseDuration: false,
      intensity: 'Effort 6–7/10 : soutenu mais régulier, tu tiens jusqu’au bout',
    },
  },
  {
    id: 'hiit',
    label: 'HIIT',
    shortLabel: 'HIIT',
    icon: '⚡',
    description: 'Circuits courts et intenses',
    format: 'circuit',
    slots: [
      ['squat', 'fente'],
      ['poussee-horizontale', 'poussee-verticale'],
      ['cardio'],
      ['anti-rotation', 'gainage', 'flexion-tronc'],
      ['charniere', 'tirage-horizontal', 'fente'],
      ['cardio'],
    ],
    maxMinutes: 45,
    overflowMessage:
      '{minutes} min de HIIT ? Même avec quatre bras, c’est trop ! Machamp garde le HIIT court et complète avec du cardio modéré.',
    circuit: {
      blockName: 'Circuit',
      work: 40,
      rest: 20,
      roundRest: 60,
      blockRest: 90,
      exercises: [4, 6],
      rounds: [2, 5],
      blockMinutes: 14,
      maxTotalExercises: 10,
      useExerciseDuration: false,
      intensity: 'Effort 8/10 pendant les 40 s, puis souffle vraiment pendant les 20 s',
    },
  },
  {
    id: 'abdos',
    label: 'Abdos & gainage',
    shortLabel: 'Abdos',
    icon: '🧱',
    description: 'Un tronc solide comme un roc',
    format: 'strength',
    slots: [
      ['gainage'],
      ['anti-rotation'],
      ['flexion-tronc'],
      ['gainage', 'anti-rotation'],
      ['anti-rotation', 'gainage'],
      ['flexion-tronc'],
      ['gainage'],
      ['anti-rotation'],
      ['flexion-tronc'],
    ],
    maxMinutes: 40,
    overflowMessage:
      '{minutes} min d’abdos ? Tes abdos demandent grâce ! Machamp a complété avec un bloc de cardio modéré.',
    strength: { sets: { base: 3, min: 2, max: 4 }, maxExercises: 8 },
  },
  {
    id: 'mobilite',
    label: 'Mobilité & étirements',
    shortLabel: 'Mobi.',
    icon: '🤸',
    description: 'Souplesse et récupération',
    format: 'circuit',
    slots: [
      ['mobilite', 'echauffement'],
      ['etirement'],
      ['mobilite'],
      ['echauffement', 'mobilite'],
      ['etirement'],
      ['mobilite', 'etirement'],
    ],
    maxMinutes: 60,
    overflowMessage:
      'Après une heure de mobilité, Machamp t’emmène bouger : un bloc de cardio doux complète la séance.',
    circuit: {
      blockName: 'Enchaînement',
      work: 45,
      rest: 10,
      roundRest: 30,
      blockRest: 30,
      exercises: [5, 6],
      rounds: [1, 3],
      blockMinutes: 12,
      useExerciseDuration: true,
      intensity: 'Amplitude confortable, jamais de douleur. Respire lentement.',
    },
  },
];

export const DEFAULT_WORKOUT_TYPE_ID = 'full-body';
export const DEFAULT_DURATION = 45;
export const DURATION_MIN = 10;
export const DURATION_MAX = 120;
export const DURATION_STEP = 5;
export const DURATION_SHORTCUTS = [20, 30, 45, 60];

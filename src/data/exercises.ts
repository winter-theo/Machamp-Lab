import type { Exercise, ExerciseDefaults, MovementPattern } from './types';

/**
 * Bibliothèque d'exercices.
 *
 * Pour ajouter un exercice, copie une ligne existante et adapte-la :
 * - `id` : unique, en minuscules avec des tirets
 * - `equipment` : ids de `equipment.ts` (TOUS doivent être cochés) ; [] = poids du corps
 * - `pattern` : type de mouvement (voir `MovementPattern` dans `types.ts`)
 * - `workoutTypes` : types de séance compatibles (ids de `workoutTypes.ts`)
 * - `phases` : 'warmup' (échauffement), 'main' (séance), 'cooldown' (retour au calme)
 * - `mode` + `defaults` : séries × reps, séries × durée, bloc continu ou fractionné
 * - `cue` : la consigne technique d'une ligne
 */

// Raccourcis pour les types de séance
const FB = 'full-body';
const UP = 'haut';
const LO = 'bas';
const CA = 'cardio';
const HI = 'hiit';
const AB = 'abdos';
const MO = 'mobilite';

// Raccourcis pour les valeurs par défaut
const reps = (sets: number, min: number, max: number, rest: number): ExerciseDefaults => ({
  sets,
  reps: [min, max],
  rest,
});
const hold = (sets: number, seconds: number, rest: number): ExerciseDefaults => ({ sets, seconds, rest });
const steady: ExerciseDefaults = {};
const intervals = (
  work: number,
  easy: number,
  workLabel = 'intense',
  easyLabel = 'facile',
): ExerciseDefaults => ({ work, easy, workLabel, easyLabel });

export const EXERCISES: Exercise[] = [
  /* ================================================================ */
  /* Tapis roulant                                                     */
  /* ================================================================ */
  {
    id: 'tr-marche-inclinee', name: 'Tapis roulant — marche inclinée', equipment: ['tapis-roulant'],
    pattern: 'cardio-continu', muscles: ['Cardio', 'Fessiers', 'Mollets'], workoutTypes: [CA],
    phases: ['main', 'warmup'], mode: 'continuous', defaults: steady,
    cue: 'Pente de 6 à 12 %, pas rapides, et on ne se tient pas aux barres.',
  },
  {
    id: 'tr-footing', name: 'Tapis roulant — footing facile', equipment: ['tapis-roulant'],
    pattern: 'cardio-continu', muscles: ['Cardio', 'Jambes'], workoutTypes: [CA],
    mode: 'continuous', defaults: steady,
    cue: 'Foulée légère sous le bassin, épaules relâchées, respiration régulière.',
  },
  {
    id: 'tr-progressif', name: 'Tapis roulant — allure progressive', equipment: ['tapis-roulant'],
    pattern: 'cardio-continu', muscles: ['Cardio', 'Jambes'], workoutTypes: [CA],
    mode: 'continuous', defaults: steady,
    cue: 'Augmente un peu la vitesse toutes les 3 minutes.',
    intensity: 'Effort 5 → 7/10 : accélère progressivement jusqu’à la fin',
  },
  {
    id: 'tr-fractionne', name: 'Tapis roulant — fractionné course', equipment: ['tapis-roulant'],
    pattern: 'cardio-fractionne', muscles: ['Cardio', 'Jambes'], workoutTypes: [CA],
    mode: 'intervals', defaults: intervals(60, 60, 'rapide', 'en marchant'),
    cue: 'Monte la vitesse quelques secondes avant le top départ, buste droit.',
  },
  {
    id: 'tr-cotes', name: 'Tapis roulant — côtes', equipment: ['tapis-roulant'],
    pattern: 'cardio-fractionne', muscles: ['Cardio', 'Fessiers', 'Mollets'], workoutTypes: [CA],
    mode: 'intervals', defaults: intervals(120, 60, 'en pente forte', 'à plat'),
    cue: 'Pente de 8 à 12 %, raccourcis la foulée et pousse avec les fessiers.',
  },
  {
    id: 'tr-fartlek', name: 'Tapis roulant — fartlek', equipment: ['tapis-roulant'],
    pattern: 'cardio-fractionne', muscles: ['Cardio', 'Jambes'], workoutTypes: [CA],
    mode: 'intervals', defaults: intervals(90, 90, 'allure soutenue', 'allure facile'),
    cue: 'Joue avec la vitesse : soutenu mais contrôlé, puis vraiment tranquille.',
  },
  {
    id: 'tr-echauffement', name: 'Tapis roulant — marche puis trot', equipment: ['tapis-roulant'],
    pattern: 'cardio-continu', muscles: ['Cardio'], workoutTypes: [CA],
    phases: ['warmup'], mode: 'continuous', defaults: steady,
    cue: 'Commence en marchant, accélère chaque minute jusqu’à un trot léger.',
  },

  /* ================================================================ */
  /* Rameur                                                            */
  /* ================================================================ */
  {
    id: 'ra-endurance', name: 'Rameur — endurance', equipment: ['rameur'],
    pattern: 'cardio-continu', muscles: ['Cardio', 'Dos', 'Jambes'], workoutTypes: [CA],
    phases: ['main', 'warmup'], mode: 'continuous', defaults: steady,
    cue: 'Jambes, buste, bras… puis bras, buste, jambes au retour. 22 à 26 coups par minute.',
  },
  {
    id: 'ra-fractionne', name: 'Rameur — fractionné', equipment: ['rameur'],
    pattern: 'cardio-fractionne', muscles: ['Cardio', 'Dos', 'Jambes'], workoutTypes: [CA],
    mode: 'intervals', defaults: intervals(60, 60),
    cue: 'Pousse fort avec les jambes, dos gainé, tire la poignée vers le bas des côtes.',
  },
  {
    id: 'ra-sprints', name: 'Rameur — sprints courts', equipment: ['rameur'],
    pattern: 'cardio-fractionne', muscles: ['Cardio', 'Dos', 'Jambes'], workoutTypes: [CA],
    mode: 'intervals', defaults: intervals(30, 90, 'à fond', 'tout doux'),
    cue: 'Démarrage explosif, puis rame lentement pour vraiment récupérer.',
  },
  {
    id: 'ra-tempo', name: 'Rameur — blocs tempo', equipment: ['rameur'],
    pattern: 'cardio-fractionne', muscles: ['Cardio', 'Dos', 'Jambes'], workoutTypes: [CA],
    mode: 'intervals', defaults: intervals(240, 120, 'soutenu', 'facile'),
    cue: 'Effort constant pendant tout le bloc, 24 à 28 coups par minute.',
  },
  {
    id: 'ra-puissance', name: 'Rameur — cadence basse puissante', equipment: ['rameur'],
    pattern: 'cardio-continu', muscles: ['Cardio', 'Jambes', 'Dos'], workoutTypes: [CA],
    mode: 'continuous', defaults: steady,
    cue: '18 à 20 coups par minute seulement, mais chaque coup est une grosse poussée de jambes.',
  },
  {
    id: 'ra-echauffement', name: 'Rameur — échauffement progressif', equipment: ['rameur'],
    pattern: 'cardio-continu', muscles: ['Cardio'], workoutTypes: [CA],
    phases: ['warmup'], mode: 'continuous', defaults: steady,
    cue: 'Bras seuls, puis bras + buste, puis le mouvement complet en accélérant doucement.',
  },
  {
    id: 'ra-sprint-station', name: 'Rameur — sprint', equipment: ['rameur'],
    pattern: 'cardio', muscles: ['Cardio', 'Corps entier'], workoutTypes: [HI],
    mode: 'time', defaults: hold(3, 40, 20),
    cue: 'Démarre fort et garde une cadence rapide jusqu’au bout.',
  },

  /* ================================================================ */
  /* Vélo stationnaire droit                                          */
  /* ================================================================ */
  {
    id: 've-endurance', name: 'Vélo — endurance', equipment: ['velo-droit'],
    pattern: 'cardio-continu', muscles: ['Cardio', 'Quadriceps'], workoutTypes: [CA],
    phases: ['main', 'warmup'], mode: 'continuous', defaults: steady,
    cue: 'Résistance moyenne, 80 à 90 tours par minute, épaules relâchées.',
  },
  {
    id: 've-fractionne', name: 'Vélo — fractionné', equipment: ['velo-droit'],
    pattern: 'cardio-fractionne', muscles: ['Cardio', 'Quadriceps'], workoutTypes: [CA],
    mode: 'intervals', defaults: intervals(60, 60),
    cue: 'Monte la résistance pendant l’effort, baisse-la pour récupérer.',
  },
  {
    id: 've-30-30', name: 'Vélo — 30/30', equipment: ['velo-droit'],
    pattern: 'cardio-fractionne', muscles: ['Cardio', 'Quadriceps'], workoutTypes: [CA],
    mode: 'intervals', defaults: intervals(30, 30, 'vite et fort', 'en souplesse'),
    cue: 'Pédale rond, sans rebondir sur la selle, même quand ça pique.',
  },
  {
    id: 've-cotes', name: 'Vélo — côtes assises', equipment: ['velo-droit'],
    pattern: 'cardio-fractionne', muscles: ['Cardio', 'Quadriceps', 'Fessiers'], workoutTypes: [CA],
    mode: 'intervals', defaults: intervals(180, 120, 'résistance forte', 'résistance légère'),
    cue: 'Grosse résistance, 60 à 70 tours par minute, reste assis et gainé.',
  },
  {
    id: 've-velocite', name: 'Vélo — vélocité', equipment: ['velo-droit'],
    pattern: 'cardio-fractionne', muscles: ['Cardio', 'Jambes'], workoutTypes: [CA],
    mode: 'intervals', defaults: intervals(60, 60, 'cadence très rapide', 'cadence normale'),
    cue: 'Résistance légère, mouline vite sans que le bassin ne bouge.',
  },
  {
    id: 've-echauffement', name: 'Vélo — échauffement progressif', equipment: ['velo-droit'],
    pattern: 'cardio-continu', muscles: ['Cardio'], workoutTypes: [CA],
    phases: ['warmup'], mode: 'continuous', defaults: steady,
    cue: 'Résistance légère au début, ajoute un cran toutes les minutes.',
  },
  {
    id: 've-sprint-station', name: 'Vélo — sprint', equipment: ['velo-droit'],
    pattern: 'cardio', muscles: ['Cardio', 'Quadriceps'], workoutTypes: [HI],
    mode: 'time', defaults: hold(3, 40, 20),
    cue: 'Résistance moyenne, pédale aussi vite que possible.',
  },

  /* ================================================================ */
  /* Appareil multifonction à charge guidée                           */
  /* ================================================================ */
  {
    id: 'mf-tirage-vertical', name: 'Tirage vertical (poulie haute)', equipment: ['multifonction'],
    pattern: 'tirage-vertical', muscles: ['Dorsaux', 'Biceps'], workoutTypes: [FB, UP],
    mode: 'reps', defaults: reps(3, 10, 12, 90),
    cue: 'Tire la barre vers le haut de la poitrine, coudes vers le bas, sans te balancer.',
  },
  {
    id: 'mf-tirage-horizontal', name: 'Tirage horizontal (poulie basse)', equipment: ['multifonction'],
    pattern: 'tirage-horizontal', muscles: ['Dorsaux', 'Haut du dos', 'Biceps'], workoutTypes: [FB, UP],
    mode: 'reps', defaults: reps(3, 10, 12, 90),
    cue: 'Dos droit, tire vers le nombril en serrant les omoplates.',
  },
  {
    id: 'mf-developpe', name: 'Développé assis à la machine', equipment: ['multifonction'],
    pattern: 'poussee-horizontale', muscles: ['Pectoraux', 'Triceps', 'Épaules'], workoutTypes: [FB, UP],
    mode: 'reps', defaults: reps(3, 10, 12, 90),
    cue: 'Omoplates collées au dossier, pousse sans verrouiller les coudes.',
  },
  {
    id: 'mf-butterfly', name: 'Butterfly (pec deck)', equipment: ['multifonction'],
    pattern: 'pectoraux', muscles: ['Pectoraux'], workoutTypes: [UP],
    mode: 'reps', defaults: reps(3, 12, 15, 60),
    cue: 'Bras légèrement fléchis, rapproche les mains en serrant les pectoraux.',
  },
  {
    id: 'mf-leg-extension', name: 'Leg extension', equipment: ['multifonction'],
    pattern: 'quadriceps', muscles: ['Quadriceps'], workoutTypes: [LO],
    mode: 'reps', defaults: reps(3, 12, 15, 60),
    cue: 'Monte en 1 s, tiens 1 s en haut, redescends en 2 s.',
  },
  {
    id: 'mf-leg-curl', name: 'Leg curl', equipment: ['multifonction'],
    pattern: 'ischios', muscles: ['Ischios'], workoutTypes: [LO],
    mode: 'reps', defaults: reps(3, 12, 15, 60),
    cue: 'Contrôle la descente et garde les hanches collées.',
  },
  {
    id: 'mf-pull-through', name: 'Pull-through à la poulie basse', equipment: ['multifonction'],
    pattern: 'charniere', muscles: ['Fessiers', 'Ischios', 'Lombaires'], workoutTypes: [FB, LO],
    mode: 'reps', defaults: reps(3, 12, 15, 75),
    cue: 'Dos à la poulie, recule les hanches dos plat, puis serre les fessiers pour te redresser.',
  },
  {
    id: 'mf-kickback', name: 'Extension de hanche à la poulie basse', equipment: ['multifonction'],
    pattern: 'fessiers', muscles: ['Fessiers'], workoutTypes: [LO], unilateral: true,
    mode: 'reps', defaults: reps(3, 12, 15, 45),
    cue: 'Buste fixe, pousse la jambe vers l’arrière avec le fessier, sans cambrer.',
  },
  {
    id: 'mf-triceps-poulie', name: 'Extension triceps à la poulie haute', equipment: ['multifonction'],
    pattern: 'triceps', muscles: ['Triceps'], workoutTypes: [UP],
    mode: 'reps', defaults: reps(3, 12, 15, 60),
    cue: 'Coudes collés au corps, seuls les avant-bras bougent.',
  },
  {
    id: 'mf-curl-poulie', name: 'Curl biceps à la poulie basse', equipment: ['multifonction'],
    pattern: 'biceps', muscles: ['Biceps'], workoutTypes: [UP],
    mode: 'reps', defaults: reps(3, 12, 15, 60),
    cue: 'Coudes fixes, monte sans balancer le buste.',
  },
  {
    id: 'mf-face-pull', name: 'Face pull (poulie haute)', equipment: ['multifonction'],
    pattern: 'epaules', muscles: ['Épaules', 'Haut du dos'], workoutTypes: [UP],
    mode: 'reps', defaults: reps(3, 12, 15, 60),
    cue: 'Tire vers le front en écartant les mains, coudes hauts.',
  },
  {
    id: 'mf-elevation-laterale', name: 'Élévation latérale à la poulie basse', equipment: ['multifonction'],
    pattern: 'epaules', muscles: ['Épaules'], workoutTypes: [UP], unilateral: true,
    mode: 'reps', defaults: reps(3, 12, 15, 45),
    cue: 'Monte jusqu’à hauteur d’épaule, coude légèrement fléchi, sans élan.',
  },
  {
    id: 'mf-pullover-poulie', name: 'Pull-over bras tendus (poulie haute)', equipment: ['multifonction'],
    pattern: 'tirage-vertical', muscles: ['Dorsaux'], workoutTypes: [UP],
    mode: 'reps', defaults: reps(3, 12, 15, 60),
    cue: 'Bras presque tendus, ramène la barre vers les cuisses avec les dorsaux.',
  },
  {
    id: 'mf-pallof', name: 'Pallof press (poulie)', equipment: ['multifonction'],
    pattern: 'anti-rotation', muscles: ['Abdos', 'Obliques'], workoutTypes: [AB, FB], unilateral: true,
    mode: 'reps', defaults: reps(3, 10, 12, 45),
    cue: 'De profil à la poulie, pousse les mains devant toi et résiste à la rotation.',
  },
  {
    id: 'mf-crunch-poulie', name: 'Crunch à genoux à la poulie haute', equipment: ['multifonction'],
    pattern: 'flexion-tronc', muscles: ['Abdos'], workoutTypes: [AB],
    mode: 'reps', defaults: reps(3, 12, 15, 45),
    cue: 'Enroule le buste vers le bassin, les hanches ne bougent pas.',
  },
  {
    id: 'mf-bucheron', name: 'Bûcheron à la poulie (haut → bas)', equipment: ['multifonction'],
    pattern: 'anti-rotation', muscles: ['Obliques', 'Abdos'], workoutTypes: [AB], unilateral: true,
    mode: 'reps', defaults: reps(3, 10, 12, 45),
    cue: 'Bras presque tendus, pivote avec le buste et les hanches, contrôle le retour.',
  },

  /* ================================================================ */
  /* Banc ajustable (seul)                                             */
  /* ================================================================ */
  {
    id: 'bc-pompes-inclinees', name: 'Pompes mains sur le banc', equipment: ['banc'],
    pattern: 'poussee-horizontale', muscles: ['Pectoraux', 'Triceps'], workoutTypes: [FB, UP, HI],
    mode: 'reps', defaults: reps(3, 10, 15, 60),
    cue: 'Corps gainé en planche, poitrine vers le bord du banc.',
  },
  {
    id: 'bc-pompes-declinees', name: 'Pompes pieds sur le banc', equipment: ['banc'],
    pattern: 'poussee-horizontale', muscles: ['Pectoraux', 'Épaules', 'Triceps'], workoutTypes: [UP],
    mode: 'reps', defaults: reps(3, 8, 12, 75),
    cue: 'Gainage fort : le bassin ne s’affaisse pas.',
  },
  {
    id: 'bc-dips', name: 'Dips sur le banc', equipment: ['banc'],
    pattern: 'triceps', muscles: ['Triceps', 'Pectoraux'], workoutTypes: [UP],
    mode: 'reps', defaults: reps(3, 10, 15, 60),
    cue: 'Épaules basses, descends coudes vers l’arrière jusqu’à 90°.',
  },
  {
    id: 'bc-squat-bulgare', name: 'Squat bulgare (pied arrière sur le banc)', equipment: ['banc'],
    pattern: 'fente', muscles: ['Quadriceps', 'Fessiers'], workoutTypes: [FB, LO], unilateral: true,
    mode: 'reps', defaults: reps(3, 8, 10, 75),
    cue: 'Descends bien droit, genou avant aligné avec le pied.',
  },
  {
    id: 'bc-step-up', name: 'Montées sur banc', equipment: ['banc'],
    pattern: 'fente', muscles: ['Quadriceps', 'Fessiers'], workoutTypes: [FB, LO], unilateral: true,
    mode: 'reps', defaults: reps(3, 10, 12, 60),
    cue: 'Banc bien stable : pousse avec la jambe du haut, sans t’aider de celle du bas.',
  },
  {
    id: 'bc-hip-thrust', name: 'Hip thrust (dos sur le banc)', equipment: ['banc'],
    pattern: 'fessiers', muscles: ['Fessiers', 'Ischios'], workoutTypes: [FB, LO],
    mode: 'reps', defaults: reps(3, 12, 15, 60),
    cue: 'Menton rentré, monte jusqu’à l’alignement épaules-hanches-genoux, serre 1 s.',
  },
  {
    id: 'bc-box-squat', name: 'Squat assis-debout sur le banc', equipment: ['banc'],
    pattern: 'squat', muscles: ['Quadriceps', 'Fessiers'], workoutTypes: [FB, LO],
    mode: 'reps', defaults: reps(3, 12, 15, 60),
    cue: 'Effleure le banc avec les fesses et remonte sans te laisser tomber.',
  },
  {
    id: 'bc-releves-jambes', name: 'Relevés de jambes allongé sur le banc', equipment: ['banc'],
    pattern: 'flexion-tronc', muscles: ['Abdos'], workoutTypes: [AB],
    mode: 'reps', defaults: reps(3, 10, 15, 45),
    cue: 'Tiens le banc derrière la tête, bas du dos plaqué, descends lentement.',
  },
  {
    id: 'bc-copenhague', name: 'Planche latérale Copenhague', equipment: ['banc'],
    pattern: 'anti-rotation', muscles: ['Obliques', 'Adducteurs'], workoutTypes: [AB], unilateral: true,
    mode: 'time', defaults: hold(3, 20, 30),
    cue: 'Genou du dessus posé sur le banc, hanches hautes, corps aligné.',
  },
  {
    id: 'bc-etirement-dorsaux', name: 'Étirement des dorsaux (coudes sur le banc)', equipment: ['banc'],
    pattern: 'etirement', muscles: ['Dorsaux', 'Épaules', 'Triceps'], workoutTypes: [MO],
    phases: ['cooldown', 'main'], mode: 'time', defaults: hold(1, 45, 0),
    cue: 'À genoux, coudes sur le banc, mains jointes : laisse descendre la poitrine.',
  },
  {
    id: 'bc-etirement-quadriceps', name: 'Étirement du quadriceps (pied sur le banc)', equipment: ['banc'],
    pattern: 'etirement', muscles: ['Quadriceps', 'Hanches'], workoutTypes: [MO], unilateral: true,
    phases: ['cooldown', 'main'], mode: 'time', defaults: hold(1, 30, 0),
    cue: 'Dos au banc, pied arrière posé dessus, avance doucement le bassin.',
  },
  {
    id: 'bc-extension-thoracique', name: 'Extension thoracique sur le banc', equipment: ['banc'],
    pattern: 'mobilite', muscles: ['Haut du dos', 'Épaules'], workoutTypes: [MO],
    mode: 'time', defaults: hold(1, 45, 0),
    cue: 'Haut du dos contre le bord du banc, mains derrière la tête, ouvre la poitrine.',
  },

  /* ================================================================ */
  /* Banc ajustable + haltères                                         */
  /* ================================================================ */
  {
    id: 'bh-developpe-couche', name: 'Développé couché aux haltères', equipment: ['banc', 'halteres'],
    pattern: 'poussee-horizontale', muscles: ['Pectoraux', 'Triceps', 'Épaules'], workoutTypes: [FB, UP],
    mode: 'reps', defaults: reps(3, 8, 12, 90),
    cue: 'Omoplates serrées, descends les haltères à hauteur de poitrine.',
  },
  {
    id: 'bh-developpe-incline', name: 'Développé incliné aux haltères', equipment: ['banc', 'halteres'],
    pattern: 'poussee-horizontale', muscles: ['Pectoraux', 'Épaules'], workoutTypes: [UP],
    mode: 'reps', defaults: reps(3, 8, 12, 90),
    cue: 'Banc à 30°, pousse vers le haut en rapprochant légèrement les haltères.',
  },
  {
    id: 'bh-developpe-epaules', name: 'Développé épaules assis aux haltères', equipment: ['banc', 'halteres'],
    pattern: 'poussee-verticale', muscles: ['Épaules', 'Triceps'], workoutTypes: [FB, UP],
    mode: 'reps', defaults: reps(3, 8, 12, 90),
    cue: 'Dossier vertical, pousse au-dessus de la tête sans cambrer.',
  },
  {
    id: 'bh-rowing-un-bras', name: 'Rowing haltère un bras (appui sur le banc)', equipment: ['banc', 'halteres'],
    pattern: 'tirage-horizontal', muscles: ['Dorsaux', 'Haut du dos', 'Biceps'], workoutTypes: [FB, UP],
    unilateral: true, mode: 'reps', defaults: reps(3, 10, 12, 60),
    cue: 'Dos plat, tire le coude vers la hanche.',
  },
  {
    id: 'bh-rowing-poitrine', name: 'Rowing buste appuyé (banc incliné)', equipment: ['banc', 'halteres'],
    pattern: 'tirage-horizontal', muscles: ['Haut du dos', 'Dorsaux'], workoutTypes: [FB, UP],
    mode: 'reps', defaults: reps(3, 10, 12, 75),
    cue: 'Poitrine contre le dossier, serre les omoplates en haut.',
  },
  {
    id: 'bh-pullover', name: 'Pull-over à l’haltère', equipment: ['banc', 'halteres'],
    pattern: 'tirage-vertical', muscles: ['Dorsaux', 'Pectoraux'], workoutTypes: [UP],
    mode: 'reps', defaults: reps(3, 10, 12, 60),
    cue: 'Bras légèrement fléchis, descends derrière la tête sans forcer l’épaule.',
  },
  {
    id: 'bh-curl-incline', name: 'Curl incliné aux haltères', equipment: ['banc', 'halteres'],
    pattern: 'biceps', muscles: ['Biceps'], workoutTypes: [UP],
    mode: 'reps', defaults: reps(3, 10, 12, 60),
    cue: 'Bras qui pendent derrière le buste, coudes immobiles.',
  },
  {
    id: 'bh-extension-allonge', name: 'Extension triceps allongé (haltères)', equipment: ['banc', 'halteres'],
    pattern: 'triceps', muscles: ['Triceps'], workoutTypes: [UP],
    mode: 'reps', defaults: reps(3, 10, 12, 60),
    cue: 'Coudes pointés vers le plafond, descends vers les tempes en contrôlant.',
  },
  {
    id: 'bh-oiseau-assis', name: 'Oiseau assis sur le banc', equipment: ['banc', 'halteres'],
    pattern: 'epaules', muscles: ['Épaules', 'Haut du dos'], workoutTypes: [UP],
    mode: 'reps', defaults: reps(3, 12, 15, 45),
    cue: 'Buste penché sur les cuisses, écarte les bras sur les côtés avec des petits poids.',
  },
  {
    id: 'bh-hip-thrust', name: 'Hip thrust à l’haltère', equipment: ['banc', 'halteres'],
    pattern: 'fessiers', muscles: ['Fessiers', 'Ischios'], workoutTypes: [FB, LO],
    mode: 'reps', defaults: reps(3, 10, 12, 75),
    cue: 'Haltère posé sur les hanches, monte et serre les fessiers 1 s.',
  },
  {
    id: 'bh-squat-bulgare', name: 'Squat bulgare aux haltères', equipment: ['banc', 'halteres'],
    pattern: 'fente', muscles: ['Quadriceps', 'Fessiers'], workoutTypes: [FB, LO], unilateral: true,
    mode: 'reps', defaults: reps(3, 8, 10, 90),
    cue: 'Buste légèrement penché, pousse dans le talon avant.',
  },

  /* ================================================================ */
  /* Haltères                                                          */
  /* ================================================================ */
  {
    id: 'ha-goblet-squat', name: 'Squat goblet', equipment: ['halteres'],
    pattern: 'squat', muscles: ['Quadriceps', 'Fessiers'], workoutTypes: [FB, LO, HI],
    mode: 'reps', defaults: reps(3, 10, 12, 90),
    cue: 'Haltère contre la poitrine, descends entre tes genoux, dos droit.',
  },
  {
    id: 'ha-squat-sumo', name: 'Squat sumo à l’haltère', equipment: ['halteres'],
    pattern: 'squat', muscles: ['Quadriceps', 'Fessiers', 'Adducteurs'], workoutTypes: [FB, LO],
    mode: 'reps', defaults: reps(3, 10, 12, 75),
    cue: 'Pieds larges, pointes ouvertes, genoux qui suivent les pieds.',
  },
  {
    id: 'ha-sdt-roumain', name: 'Soulevé de terre roumain aux haltères', equipment: ['halteres'],
    pattern: 'charniere', muscles: ['Ischios', 'Fessiers', 'Lombaires'], workoutTypes: [FB, LO],
    mode: 'reps', defaults: reps(3, 8, 12, 90),
    cue: 'Recule les hanches, haltères près des jambes, dos plat.',
  },
  {
    id: 'ha-sdt-une-jambe', name: 'Soulevé de terre une jambe (haltère)', equipment: ['halteres'],
    pattern: 'charniere', muscles: ['Ischios', 'Fessiers'], workoutTypes: [FB, LO], unilateral: true,
    mode: 'reps', defaults: reps(3, 8, 10, 60),
    cue: 'Bascule d’un bloc, jambe arrière dans le prolongement du dos.',
  },
  {
    id: 'ha-fentes-arriere', name: 'Fentes arrière aux haltères', equipment: ['halteres'],
    pattern: 'fente', muscles: ['Quadriceps', 'Fessiers'], workoutTypes: [FB, LO], unilateral: true,
    mode: 'reps', defaults: reps(3, 8, 10, 75),
    cue: 'Grand pas en arrière, genou arrière proche du sol, buste droit.',
  },
  {
    id: 'ha-developpe-sol', name: 'Développé couché au sol (haltères)', equipment: ['halteres'],
    pattern: 'poussee-horizontale', muscles: ['Pectoraux', 'Triceps'], workoutTypes: [FB, UP],
    mode: 'reps', defaults: reps(3, 10, 12, 75),
    cue: 'Allongé au sol, les coudes touchent le sol en douceur, puis pousse.',
  },
  {
    id: 'ha-developpe-militaire', name: 'Développé militaire debout (haltères)', equipment: ['halteres'],
    pattern: 'poussee-verticale', muscles: ['Épaules', 'Triceps'], workoutTypes: [FB, UP],
    mode: 'reps', defaults: reps(3, 8, 12, 90),
    cue: 'Fessiers et abdos serrés, pousse au-dessus de la tête sans cambrer.',
  },
  {
    id: 'ha-rowing-penche', name: 'Rowing penché aux haltères', equipment: ['halteres'],
    pattern: 'tirage-horizontal', muscles: ['Dorsaux', 'Haut du dos', 'Biceps'], workoutTypes: [FB, UP],
    mode: 'reps', defaults: reps(3, 10, 12, 75),
    cue: 'Buste penché à 45°, dos plat, coudes vers les hanches.',
  },
  {
    id: 'ha-elevations-laterales', name: 'Élévations latérales', equipment: ['halteres'],
    pattern: 'epaules', muscles: ['Épaules'], workoutTypes: [UP],
    mode: 'reps', defaults: reps(3, 12, 15, 45),
    cue: 'Monte jusqu’aux épaules, coudes légèrement fléchis, sans élan.',
  },
  {
    id: 'ha-oiseau', name: 'Oiseau debout aux haltères', equipment: ['halteres'],
    pattern: 'epaules', muscles: ['Épaules', 'Haut du dos'], workoutTypes: [UP],
    mode: 'reps', defaults: reps(3, 12, 15, 45),
    cue: 'Buste penché, écarte les bras sans hausser les épaules.',
  },
  {
    id: 'ha-curl', name: 'Curl biceps aux haltères', equipment: ['halteres'],
    pattern: 'biceps', muscles: ['Biceps'], workoutTypes: [UP],
    mode: 'reps', defaults: reps(3, 10, 12, 60),
    cue: 'Paumes vers le haut, coudes fixes, redescends lentement.',
  },
  {
    id: 'ha-curl-marteau', name: 'Curl marteau', equipment: ['halteres'],
    pattern: 'biceps', muscles: ['Biceps', 'Avant-bras'], workoutTypes: [UP],
    mode: 'reps', defaults: reps(3, 10, 12, 60),
    cue: 'Prise neutre, coudes collés au buste.',
  },
  {
    id: 'ha-extension-triceps', name: 'Extension triceps au-dessus de la tête', equipment: ['halteres'],
    pattern: 'triceps', muscles: ['Triceps'], workoutTypes: [UP],
    mode: 'reps', defaults: reps(3, 10, 12, 60),
    cue: 'Haltère à deux mains, coudes vers l’avant, descends derrière la tête.',
  },
  {
    id: 'ha-kickback', name: 'Kickback triceps', equipment: ['halteres'],
    pattern: 'triceps', muscles: ['Triceps'], workoutTypes: [UP], unilateral: true,
    mode: 'reps', defaults: reps(3, 12, 15, 45),
    cue: 'Buste penché, coude collé au corps, tends le bras vers l’arrière.',
  },
  {
    id: 'ha-mollets', name: 'Mollets debout aux haltères', equipment: ['halteres'],
    pattern: 'mollets', muscles: ['Mollets'], workoutTypes: [LO],
    mode: 'reps', defaults: reps(3, 12, 15, 45),
    cue: 'Monte haut sur la pointe des pieds, tiens 1 s, redescends lentement.',
  },
  {
    id: 'ha-thruster', name: 'Thruster aux haltères', equipment: ['halteres'],
    pattern: 'squat', muscles: ['Quadriceps', 'Fessiers', 'Épaules'], workoutTypes: [HI, FB],
    mode: 'reps', defaults: reps(3, 10, 12, 75),
    cue: 'Squat puis pousse les haltères au-dessus de la tête d’un seul mouvement.',
  },
  {
    id: 'ha-swing', name: 'Swing à l’haltère', equipment: ['halteres'],
    pattern: 'charniere', muscles: ['Fessiers', 'Ischios', 'Lombaires'], workoutTypes: [HI],
    mode: 'reps', defaults: reps(3, 15, 15, 60),
    cue: 'Le mouvement vient des hanches, pas des bras ; regard devant.',
  },
  {
    id: 'ha-arrache', name: 'Arraché alterné à l’haltère', equipment: ['halteres'],
    pattern: 'charniere', muscles: ['Corps entier', 'Épaules', 'Fessiers'], workoutTypes: [HI],
    mode: 'reps', defaults: reps(3, 8, 10, 60),
    cue: 'Pousse avec les hanches et monte l’haltère d’un trait, change de bras à chaque rep.',
  },
  {
    id: 'ha-renegat', name: 'Rowing renégat', equipment: ['halteres'],
    pattern: 'anti-rotation', muscles: ['Abdos', 'Dorsaux'], workoutTypes: [AB, HI], unilateral: true,
    mode: 'reps', defaults: reps(3, 6, 8, 60),
    cue: 'En planche haute sur les haltères, tire un coude puis l’autre sans tourner les hanches.',
  },
  {
    id: 'ha-fermier', name: 'Marche du fermier', equipment: ['halteres'],
    pattern: 'gainage', muscles: ['Abdos', 'Avant-bras', 'Épaules'], workoutTypes: [AB, FB],
    mode: 'time', defaults: hold(3, 40, 60),
    cue: 'Haltères lourds, épaules basses, marche à petits pas bien gainé.',
  },
  {
    id: 'ha-russian-twist', name: 'Russian twist à l’haltère', equipment: ['halteres'],
    pattern: 'flexion-tronc', muscles: ['Obliques', 'Abdos'], workoutTypes: [AB],
    mode: 'reps', defaults: reps(3, 16, 20, 45),
    cue: 'Buste incliné en arrière, dos long, tourne les épaules plus que les bras.',
  },
  {
    id: 'ha-halo', name: 'Halo à l’haltère', equipment: ['halteres'],
    pattern: 'mobilite', muscles: ['Épaules', 'Haut du dos'], workoutTypes: [MO],
    mode: 'time', defaults: hold(1, 45, 0),
    cue: 'Haltère léger : fais le tour de ta tête lentement, dans les deux sens.',
  },
  {
    id: 'ha-goblet-tenu', name: 'Squat goblet tenu (ouverture des hanches)', equipment: ['halteres'],
    pattern: 'mobilite', muscles: ['Hanches', 'Adducteurs', 'Chevilles'], workoutTypes: [MO],
    mode: 'time', defaults: hold(1, 45, 0),
    cue: 'Haltère léger, tiens le bas du squat et pousse les genoux avec les coudes.',
  },

  /* ================================================================ */
  /* Tapis de sol                                                      */
  /* ================================================================ */
  {
    id: 'ts-dead-bug', name: 'Dead bug', equipment: ['tapis-sol'],
    pattern: 'anti-rotation', muscles: ['Abdos'], workoutTypes: [AB, FB], unilateral: true,
    mode: 'reps', defaults: reps(3, 6, 8, 45),
    cue: 'Bas du dos plaqué au tapis, tends lentement le bras et la jambe opposés.',
  },
  {
    id: 'ts-hollow', name: 'Hollow hold', equipment: ['tapis-sol'],
    pattern: 'gainage', muscles: ['Abdos'], workoutTypes: [AB],
    mode: 'time', defaults: hold(3, 25, 45),
    cue: 'Bas du dos collé au tapis, bras et jambes tendus au ras du sol.',
  },
  {
    id: 'ts-crunch-velo', name: 'Crunch vélo', equipment: ['tapis-sol'],
    pattern: 'flexion-tronc', muscles: ['Abdos', 'Obliques'], workoutTypes: [AB],
    mode: 'reps', defaults: reps(3, 16, 20, 45),
    cue: 'Coude vers le genou opposé, lentement, sans tirer sur la nuque.',
  },
  {
    id: 'ts-enroule', name: 'Enroulé vertébral (roll-up)', equipment: ['tapis-sol'],
    pattern: 'flexion-tronc', muscles: ['Abdos'], workoutTypes: [AB],
    mode: 'reps', defaults: reps(3, 6, 8, 45),
    cue: 'Enroule le dos vertèbre par vertèbre pour t’asseoir, puis déroule lentement.',
  },
  {
    id: 'ts-v-ups', name: 'V-ups', equipment: ['tapis-sol'],
    pattern: 'flexion-tronc', muscles: ['Abdos'], workoutTypes: [AB],
    mode: 'reps', defaults: reps(3, 8, 12, 45),
    cue: 'Lève le buste et les jambes en même temps pour toucher tes pieds.',
  },
  {
    id: 'ts-superman', name: 'Superman', equipment: ['tapis-sol'],
    pattern: 'charniere', muscles: ['Lombaires', 'Fessiers'], workoutTypes: [FB, LO],
    mode: 'reps', defaults: reps(3, 10, 12, 45),
    cue: 'À plat ventre, lève bras et jambes de quelques centimètres, regard vers le sol, tiens 2 s.',
  },
  {
    id: 'ts-pont-une-jambe', name: 'Pont fessier une jambe', equipment: ['tapis-sol'],
    pattern: 'fessiers', muscles: ['Fessiers', 'Ischios'], workoutTypes: [FB, LO], unilateral: true,
    mode: 'reps', defaults: reps(3, 10, 12, 45),
    cue: 'Talon proche des fesses, pousse dans le talon, bassin bien horizontal.',
  },
  {
    id: 'ts-coquillage', name: 'Coquillage (clamshell)', equipment: ['tapis-sol'],
    pattern: 'fessiers', muscles: ['Fessiers'], workoutTypes: [LO], unilateral: true,
    mode: 'reps', defaults: reps(3, 15, 20, 30),
    cue: 'Allongé sur le côté, genoux pliés, ouvre le genou du dessus sans bouger le bassin.',
  },
  {
    id: 'ts-chat-vache', name: 'Chat-vache', equipment: ['tapis-sol'],
    pattern: 'mobilite', muscles: ['Dos', 'Lombaires'], workoutTypes: [MO],
    phases: ['main', 'warmup'], mode: 'time', defaults: hold(1, 45, 0),
    cue: 'À quatre pattes, alterne dos rond et dos creux au rythme de ta respiration.',
  },
  {
    id: 'ts-fil-aiguille', name: 'Enfiler l’aiguille', equipment: ['tapis-sol'],
    pattern: 'mobilite', muscles: ['Haut du dos', 'Épaules'], workoutTypes: [MO], unilateral: true,
    mode: 'time', defaults: hold(1, 30, 0),
    cue: 'À quatre pattes, glisse un bras sous l’autre et pose l’épaule au sol.',
  },
  {
    id: 'ts-livre-ouvert', name: 'Livre ouvert (rotation thoracique)', equipment: ['tapis-sol'],
    pattern: 'mobilite', muscles: ['Haut du dos', 'Pectoraux'], workoutTypes: [MO], unilateral: true,
    mode: 'time', defaults: hold(1, 30, 0),
    cue: 'Allongé sur le côté, genoux pliés, ouvre le bras du dessus en le suivant des yeux.',
  },
  {
    id: 'ts-90-90', name: 'Bascules 90/90 des hanches', equipment: ['tapis-sol'],
    pattern: 'mobilite', muscles: ['Hanches', 'Fessiers'], workoutTypes: [MO],
    mode: 'time', defaults: hold(1, 45, 0),
    cue: 'Assis, jambes pliées à 90°, bascule les genoux d’un côté à l’autre, buste droit.',
  },
  {
    id: 'ts-enfant', name: 'Posture de l’enfant', equipment: ['tapis-sol'],
    pattern: 'etirement', muscles: ['Dos', 'Lombaires', 'Dorsaux'], workoutTypes: [MO],
    phases: ['cooldown', 'main'], mode: 'time', defaults: hold(1, 45, 0),
    cue: 'Fesses vers les talons, bras allongés devant, respire dans le dos.',
  },
  {
    id: 'ts-pigeon', name: 'Étirement du pigeon', equipment: ['tapis-sol'],
    pattern: 'etirement', muscles: ['Fessiers', 'Hanches'], workoutTypes: [MO], unilateral: true,
    phases: ['cooldown', 'main'], mode: 'time', defaults: hold(1, 30, 0),
    cue: 'Jambe avant pliée devant toi, bassin droit, penche-toi doucement vers l’avant.',
  },
  {
    id: 'ts-flechisseurs', name: 'Étirement des fléchisseurs de hanche (genou au sol)', equipment: ['tapis-sol'],
    pattern: 'etirement', muscles: ['Hanches', 'Quadriceps'], workoutTypes: [MO], unilateral: true,
    phases: ['cooldown', 'main'], mode: 'time', defaults: hold(1, 30, 0),
    cue: 'Genou arrière sur le tapis, avance le bassin en serrant le fessier arrière.',
  },
  {
    id: 'ts-cobra', name: 'Cobra', equipment: ['tapis-sol'],
    pattern: 'etirement', muscles: ['Abdos', 'Lombaires'], workoutTypes: [MO],
    phases: ['cooldown', 'main'], mode: 'time', defaults: hold(1, 30, 0),
    cue: 'À plat ventre, pousse doucement sur les mains, hanches au sol, épaules basses.',
  },

  /* ================================================================ */
  /* Poids du corps — renforcement                                     */
  /* ================================================================ */
  {
    id: 'pc-squat', name: 'Squat au poids du corps', equipment: [],
    pattern: 'squat', muscles: ['Quadriceps', 'Fessiers'], workoutTypes: [FB, LO, HI],
    mode: 'reps', defaults: reps(3, 15, 20, 60),
    cue: 'Pieds largeur d’épaules, fesses en arrière, talons au sol.',
  },
  {
    id: 'pc-squat-saute', name: 'Squat sauté', equipment: [],
    pattern: 'squat', muscles: ['Quadriceps', 'Fessiers', 'Cardio'], workoutTypes: [HI, CA],
    mode: 'reps', defaults: reps(3, 10, 12, 60),
    cue: 'Réception souple, genoux alignés avec les pieds.',
  },
  {
    id: 'pc-fentes-alternees', name: 'Fentes avant alternées', equipment: [],
    pattern: 'fente', muscles: ['Quadriceps', 'Fessiers'], workoutTypes: [FB, LO, HI], unilateral: true,
    mode: 'reps', defaults: reps(3, 10, 12, 60),
    cue: 'Grand pas, genou arrière vers le sol, buste droit.',
  },
  {
    id: 'pc-fentes-laterales', name: 'Fentes latérales', equipment: [],
    pattern: 'fente', muscles: ['Quadriceps', 'Fessiers', 'Adducteurs'], workoutTypes: [FB, LO],
    unilateral: true, mode: 'reps', defaults: reps(3, 8, 10, 60),
    cue: 'Fesses en arrière du côté de la jambe pliée, l’autre jambe reste tendue.',
  },
  {
    id: 'pc-fentes-sautees', name: 'Fentes sautées', equipment: [],
    pattern: 'fente', muscles: ['Quadriceps', 'Fessiers', 'Cardio'], workoutTypes: [HI, CA],
    mode: 'reps', defaults: reps(3, 10, 12, 60),
    cue: 'Change de jambe en l’air, réception amortie. Sans saut si besoin.',
  },
  {
    id: 'pc-chaise', name: 'Chaise contre le mur', equipment: [],
    pattern: 'quadriceps', muscles: ['Quadriceps'], workoutTypes: [LO],
    mode: 'time', defaults: hold(3, 40, 45),
    cue: 'Dos au mur, cuisses parallèles au sol, genoux au-dessus des chevilles.',
  },
  {
    id: 'pc-sdt-une-jambe', name: 'Soulevé de terre une jambe (poids du corps)', equipment: [],
    pattern: 'charniere', muscles: ['Ischios', 'Fessiers'], workoutTypes: [FB, LO], unilateral: true,
    mode: 'reps', defaults: reps(3, 10, 12, 45),
    cue: 'Bascule le buste et la jambe arrière d’un bloc, bassin face au sol.',
  },
  {
    id: 'pc-good-morning', name: 'Good morning au poids du corps', equipment: [],
    pattern: 'charniere', muscles: ['Ischios', 'Lombaires', 'Fessiers'], workoutTypes: [FB, LO],
    mode: 'reps', defaults: reps(3, 15, 15, 45),
    cue: 'Mains derrière la tête, recule les hanches dos plat, remonte en serrant les fessiers.',
  },
  {
    id: 'pc-pont', name: 'Pont fessier', equipment: [],
    pattern: 'fessiers', muscles: ['Fessiers', 'Ischios'], workoutTypes: [FB, LO],
    mode: 'reps', defaults: reps(3, 15, 20, 45),
    cue: 'Pousse dans les talons, serre les fessiers 1 s en haut.',
  },
  {
    id: 'pc-leg-curl-glisse', name: 'Leg curl glissé (serviette au sol)', equipment: [],
    pattern: 'ischios', muscles: ['Ischios', 'Fessiers'], workoutTypes: [LO],
    mode: 'reps', defaults: reps(3, 8, 12, 60),
    cue: 'En pont, pieds sur une serviette, ramène les talons vers les fesses sans baisser le bassin.',
  },
  {
    id: 'pc-mollets', name: 'Mollets debout', equipment: [],
    pattern: 'mollets', muscles: ['Mollets'], workoutTypes: [LO],
    mode: 'reps', defaults: reps(3, 15, 20, 30),
    cue: 'Monte au maximum sur la pointe des pieds, redescends lentement.',
  },
  {
    id: 'pc-mollets-une-jambe', name: 'Mollets sur une jambe', equipment: [],
    pattern: 'mollets', muscles: ['Mollets'], workoutTypes: [LO], unilateral: true,
    mode: 'reps', defaults: reps(3, 10, 12, 30),
    cue: 'Une main au mur pour l’équilibre, amplitude complète.',
  },
  {
    id: 'pc-pompes', name: 'Pompes', equipment: [],
    pattern: 'poussee-horizontale', muscles: ['Pectoraux', 'Triceps', 'Épaules'], workoutTypes: [FB, UP, HI],
    mode: 'reps', defaults: reps(3, 8, 15, 60),
    cue: 'Corps aligné, coudes à 45°, poitrine près du sol. Sur les genoux si besoin.',
  },
  {
    id: 'pc-pompes-larges', name: 'Pompes mains larges', equipment: [],
    pattern: 'poussee-horizontale', muscles: ['Pectoraux', 'Épaules'], workoutTypes: [UP],
    mode: 'reps', defaults: reps(3, 8, 12, 60),
    cue: 'Mains plus larges que les épaules, descends en contrôle.',
  },
  {
    id: 'pc-pompes-diamant', name: 'Pompes diamant', equipment: [],
    pattern: 'triceps', muscles: ['Triceps', 'Pectoraux'], workoutTypes: [UP],
    mode: 'reps', defaults: reps(3, 6, 12, 60),
    cue: 'Mains rapprochées sous la poitrine, coudes le long du corps.',
  },
  {
    id: 'pc-pompes-piquees', name: 'Pompes piquées (pike)', equipment: [],
    pattern: 'poussee-verticale', muscles: ['Épaules', 'Triceps'], workoutTypes: [FB, UP, HI],
    mode: 'reps', defaults: reps(3, 6, 10, 75),
    cue: 'Fesses hautes en V inversé, descends la tête entre les mains.',
  },
  {
    id: 'pc-dips-sol', name: 'Dips au sol', equipment: [],
    pattern: 'triceps', muscles: ['Triceps'], workoutTypes: [UP],
    mode: 'reps', defaults: reps(3, 10, 15, 45),
    cue: 'Assis, mains derrière toi doigts vers les fesses : soulève le bassin et plie les coudes.',
  },
  {
    id: 'pc-ytw', name: 'Y-T-W allongé', equipment: [],
    pattern: 'epaules', muscles: ['Épaules', 'Haut du dos'], workoutTypes: [UP],
    mode: 'reps', defaults: reps(3, 6, 8, 45),
    cue: 'À plat ventre, bras en Y, puis T, puis W, pouces vers le plafond.',
  },
  {
    id: 'pc-tirage-w', name: 'Tirage « W » allongé', equipment: [],
    pattern: 'tirage-horizontal', muscles: ['Haut du dos', 'Dorsaux'], workoutTypes: [FB, UP],
    mode: 'reps', defaults: reps(3, 10, 12, 45),
    cue: 'À plat ventre, ramène les coudes vers les côtes en serrant les omoplates, tiens 2 s.',
  },
  {
    id: 'pc-nageur', name: 'Tirage nageur allongé', equipment: [],
    pattern: 'tirage-vertical', muscles: ['Dorsaux', 'Haut du dos'], workoutTypes: [FB, UP],
    mode: 'reps', defaults: reps(3, 10, 12, 45),
    cue: 'À plat ventre, bras tendus devant, ramène les coudes le long du corps comme une traction.',
  },
  {
    id: 'pc-curl-serviette', name: 'Curl isométrique à la serviette', equipment: [],
    pattern: 'biceps', muscles: ['Biceps'], workoutTypes: [UP], unilateral: true,
    mode: 'time', defaults: hold(3, 20, 30),
    cue: 'Serviette sous le pied, tire vers le haut avec un bras, coude à 90°, et résiste avec la jambe.',
  },

  /* ================================================================ */
  /* Poids du corps — tronc                                            */
  /* ================================================================ */
  {
    id: 'pc-planche', name: 'Planche', equipment: [],
    pattern: 'gainage', muscles: ['Abdos', 'Épaules'], workoutTypes: [AB, FB],
    mode: 'time', defaults: hold(3, 40, 45),
    cue: 'Coudes sous les épaules, fessiers serrés, corps bien droit.',
  },
  {
    id: 'pc-planche-haute', name: 'Planche haute (bras tendus)', equipment: [],
    pattern: 'gainage', muscles: ['Abdos', 'Épaules'], workoutTypes: [AB],
    mode: 'time', defaults: hold(3, 40, 45),
    cue: 'Mains sous les épaules, pousse le sol, nombril rentré.',
  },
  {
    id: 'pc-planche-commando', name: 'Planche commando (coudes ↔ mains)', equipment: [],
    pattern: 'gainage', muscles: ['Abdos', 'Épaules', 'Triceps'], workoutTypes: [AB, HI],
    mode: 'reps', defaults: reps(3, 8, 10, 45),
    cue: 'Passe des coudes aux mains sans faire tourner le bassin.',
  },
  {
    id: 'pc-planche-laterale', name: 'Planche latérale', equipment: [],
    pattern: 'anti-rotation', muscles: ['Obliques', 'Abdos'], workoutTypes: [AB, FB], unilateral: true,
    mode: 'time', defaults: hold(3, 25, 30),
    cue: 'Coude sous l’épaule, hanches hautes, corps aligné.',
  },
  {
    id: 'pc-bird-dog', name: 'Bird dog', equipment: [],
    pattern: 'anti-rotation', muscles: ['Abdos', 'Lombaires', 'Fessiers'], workoutTypes: [AB, FB],
    unilateral: true, mode: 'reps', defaults: reps(3, 8, 10, 30),
    cue: 'À quatre pattes, tends bras et jambe opposés sans bouger le bassin.',
  },
  {
    id: 'pc-touches-epaules', name: 'Planche haute avec touches d’épaules', equipment: [],
    pattern: 'anti-rotation', muscles: ['Abdos', 'Épaules'], workoutTypes: [AB, HI],
    mode: 'reps', defaults: reps(3, 16, 20, 45),
    cue: 'Pieds écartés, touche l’épaule opposée sans balancer les hanches.',
  },
  {
    id: 'pc-crunch', name: 'Crunch', equipment: [],
    pattern: 'flexion-tronc', muscles: ['Abdos'], workoutTypes: [AB],
    mode: 'reps', defaults: reps(3, 15, 20, 30),
    cue: 'Décolle les omoplates en soufflant, menton loin de la poitrine.',
  },
  {
    id: 'pc-crunch-inverse', name: 'Crunch inversé', equipment: [],
    pattern: 'flexion-tronc', muscles: ['Abdos'], workoutTypes: [AB],
    mode: 'reps', defaults: reps(3, 12, 15, 30),
    cue: 'Ramène les genoux vers la poitrine en enroulant le bassin, sans élan.',
  },
  {
    id: 'pc-releves-jambes', name: 'Relevés de jambes au sol', equipment: [],
    pattern: 'flexion-tronc', muscles: ['Abdos'], workoutTypes: [AB, HI],
    mode: 'reps', defaults: reps(3, 10, 12, 45),
    cue: 'Mains sous les fesses, bas du dos collé au sol, descends lentement.',
  },

  /* ================================================================ */
  /* Poids du corps — cardio                                           */
  /* ================================================================ */
  {
    id: 'pc-jumping-jacks', name: 'Jumping jacks', equipment: [],
    pattern: 'cardio', muscles: ['Cardio', 'Corps entier'], workoutTypes: [HI, CA],
    phases: ['main', 'warmup'], mode: 'time', defaults: hold(3, 40, 20),
    cue: 'Bras et jambes s’écartent en même temps, réception sur l’avant des pieds.',
  },
  {
    id: 'pc-montees-genoux', name: 'Montées de genoux', equipment: [],
    pattern: 'cardio', muscles: ['Cardio', 'Abdos'], workoutTypes: [HI, CA],
    phases: ['main', 'warmup'], mode: 'time', defaults: hold(3, 40, 20),
    cue: 'Genoux à hauteur de hanches, bras actifs, buste droit.',
  },
  {
    id: 'pc-talons-fesses', name: 'Talons-fesses', equipment: [],
    pattern: 'cardio', muscles: ['Cardio', 'Ischios'], workoutTypes: [CA],
    phases: ['main', 'warmup'], mode: 'time', defaults: hold(3, 40, 20),
    cue: 'Petits appuis rapides, talons vers les fesses.',
  },
  {
    id: 'pc-burpees', name: 'Burpees', equipment: [],
    pattern: 'cardio', muscles: ['Cardio', 'Corps entier'], workoutTypes: [HI, CA],
    mode: 'time', defaults: hold(3, 40, 20),
    cue: 'Mains au sol, pieds en arrière, retour et saut. Sans saut pour la version douce.',
  },
  {
    id: 'pc-mountain-climbers', name: 'Mountain climbers', equipment: [],
    pattern: 'cardio', muscles: ['Cardio', 'Abdos'], workoutTypes: [HI, CA],
    mode: 'time', defaults: hold(3, 40, 20),
    cue: 'En planche haute, ramène les genoux vers la poitrine, hanches basses.',
  },
  {
    id: 'pc-patineur', name: 'Sauts du patineur', equipment: [],
    pattern: 'cardio', muscles: ['Cardio', 'Fessiers'], workoutTypes: [HI, CA],
    mode: 'time', defaults: hold(3, 40, 20),
    cue: 'Saute d’un pied sur l’autre sur le côté, réception amortie.',
  },
  {
    id: 'pc-shadow-boxing', name: 'Shadow boxing', equipment: [],
    pattern: 'cardio', muscles: ['Cardio', 'Épaules'], workoutTypes: [HI, CA],
    mode: 'time', defaults: hold(3, 40, 20),
    cue: 'Garde haute, enchaîne directs et crochets sur l’avant des pieds.',
  },
  {
    id: 'pc-corde-imaginaire', name: 'Corde à sauter imaginaire', equipment: [],
    pattern: 'cardio', muscles: ['Cardio', 'Mollets'], workoutTypes: [CA],
    phases: ['main', 'warmup'], mode: 'time', defaults: hold(3, 40, 20),
    cue: 'Petits sauts sur l’avant des pieds, les poignets tournent.',
  },
  {
    id: 'pc-planche-jacks', name: 'Planche jacks', equipment: [],
    pattern: 'cardio', muscles: ['Cardio', 'Abdos'], workoutTypes: [HI, CA],
    mode: 'time', defaults: hold(3, 40, 20),
    cue: 'En planche haute, écarte et resserre les pieds en sautant, bassin stable.',
  },
  {
    id: 'pc-pas-chasses', name: 'Pas chassés latéraux', equipment: [],
    pattern: 'cardio', muscles: ['Cardio', 'Jambes'], workoutTypes: [CA, HI],
    phases: ['main', 'warmup'], mode: 'time', defaults: hold(3, 40, 20),
    cue: 'Reste bas, déplace-toi vite sur le côté sans croiser les pieds.',
  },
  {
    id: 'pc-sprint-place', name: 'Sprint sur place', equipment: [],
    pattern: 'cardio', muscles: ['Cardio', 'Jambes'], workoutTypes: [HI],
    mode: 'time', defaults: hold(3, 40, 20),
    cue: 'Bras actifs, genoux rapides, reste sur l’avant des pieds.',
  },
  {
    id: 'pc-marche-ours', name: 'Marche de l’ours', equipment: [],
    pattern: 'cardio', muscles: ['Cardio', 'Épaules', 'Abdos'], workoutTypes: [HI, CA],
    mode: 'time', defaults: hold(3, 40, 20),
    cue: 'À quatre pattes genoux décollés, avance puis recule, dos plat.',
  },
  {
    id: 'pc-marche-rapide', name: 'Marche rapide (dehors ou sur place)', equipment: [],
    pattern: 'cardio-continu', muscles: ['Cardio'], workoutTypes: [CA],
    phases: ['main', 'warmup'], mode: 'continuous', defaults: steady,
    cue: 'Pas dynamiques, bras qui balancent, respiration aisée.',
  },

  /* ================================================================ */
  /* Échauffement (poids du corps)                                     */
  /* ================================================================ */
  {
    id: 'ec-moulinets', name: 'Moulinets des bras', equipment: [],
    pattern: 'echauffement', muscles: ['Épaules'], workoutTypes: [MO],
    phases: ['warmup', 'main'], mode: 'time', defaults: hold(1, 45, 0),
    cue: 'Grands cercles vers l’avant, puis vers l’arrière.',
  },
  {
    id: 'ec-balances-jambe', name: 'Balancés de jambe', equipment: [],
    pattern: 'echauffement', muscles: ['Hanches', 'Ischios'], workoutTypes: [MO], unilateral: true,
    phases: ['warmup', 'main'], mode: 'time', defaults: hold(1, 30, 0),
    cue: 'Une main au mur, balance la jambe d’avant en arrière, amplitude croissante.',
  },
  {
    id: 'ec-squats-lents', name: 'Squats lents', equipment: [],
    pattern: 'echauffement', muscles: ['Quadriceps', 'Fessiers'], workoutTypes: [],
    phases: ['warmup'], mode: 'time', defaults: hold(1, 45, 0),
    cue: 'Descends en 3 s, remonte en 1 s, amplitude progressive.',
  },
  {
    id: 'ec-chenille', name: 'Chenille (inchworm)', equipment: [],
    pattern: 'echauffement', muscles: ['Ischios', 'Épaules', 'Abdos'], workoutTypes: [MO],
    phases: ['warmup', 'main'], mode: 'time', defaults: hold(1, 45, 0),
    cue: 'Plie-toi, avance les mains jusqu’à la planche, puis reviens en marchant.',
  },
  {
    id: 'ec-rotations-buste', name: 'Rotations du buste', equipment: [],
    pattern: 'echauffement', muscles: ['Dos', 'Obliques'], workoutTypes: [MO],
    phases: ['warmup', 'main'], mode: 'time', defaults: hold(1, 45, 0),
    cue: 'Pieds ancrés, tourne les épaules d’un côté à l’autre, bras relâchés.',
  },
  {
    id: 'ec-fente-rotation', name: 'Fente avec rotation', equipment: [],
    pattern: 'echauffement', muscles: ['Hanches', 'Quadriceps', 'Dos'], workoutTypes: [], unilateral: true,
    phases: ['warmup'], mode: 'time', defaults: hold(1, 30, 0),
    cue: 'En fente avant, tourne le buste vers la jambe avant.',
  },
  {
    id: 'ec-cercles-hanches', name: 'Cercles de hanches', equipment: [],
    pattern: 'echauffement', muscles: ['Hanches'], workoutTypes: [MO],
    phases: ['warmup', 'main'], mode: 'time', defaults: hold(1, 45, 0),
    cue: 'Mains sur les hanches, grands cercles dans les deux sens.',
  },
  {
    id: 'ec-ouvertures-poitrine', name: 'Ouvertures de poitrine', equipment: [],
    pattern: 'echauffement', muscles: ['Pectoraux', 'Épaules'], workoutTypes: [],
    phases: ['warmup'], mode: 'time', defaults: hold(1, 45, 0),
    cue: 'Bras à l’horizontale, croise devant puis ouvre grand vers l’arrière.',
  },
  {
    id: 'ec-chevilles', name: 'Mobilité des chevilles', equipment: [],
    pattern: 'echauffement', muscles: ['Chevilles', 'Mollets'], workoutTypes: [MO], unilateral: true,
    phases: ['warmup', 'main'], mode: 'time', defaults: hold(1, 30, 0),
    cue: 'Pied près du mur, avance le genou au-dessus des orteils, talon au sol.',
  },

  /* ================================================================ */
  /* Mobilité (poids du corps)                                         */
  /* ================================================================ */
  {
    id: 'mo-plus-grand-etirement', name: 'Le plus grand étirement du monde', equipment: [],
    pattern: 'mobilite', muscles: ['Hanches', 'Haut du dos', 'Ischios'], workoutTypes: [MO], unilateral: true,
    phases: ['main', 'warmup'], mode: 'time', defaults: hold(1, 30, 0),
    cue: 'En fente, coude vers le pied avant, puis ouvre le bras vers le plafond.',
  },
  {
    id: 'mo-squat-profond', name: 'Squat profond tenu', equipment: [],
    pattern: 'mobilite', muscles: ['Hanches', 'Chevilles'], workoutTypes: [MO],
    mode: 'time', defaults: hold(1, 45, 0),
    cue: 'Talons au sol, coudes contre les genoux, dos long.',
  },
  {
    id: 'mo-dislocations', name: 'Passages d’épaules à la serviette', equipment: [],
    pattern: 'mobilite', muscles: ['Épaules', 'Pectoraux'], workoutTypes: [MO],
    mode: 'time', defaults: hold(1, 45, 0),
    cue: 'Serviette tendue, mains écartées : passe les bras devant puis derrière la tête.',
  },
  {
    id: 'mo-chien-pedale', name: 'Chien tête en bas pédalé', equipment: [],
    pattern: 'mobilite', muscles: ['Mollets', 'Ischios', 'Épaules'], workoutTypes: [MO],
    mode: 'time', defaults: hold(1, 45, 0),
    cue: 'En V inversé, plie un genou puis l’autre pour étirer les mollets.',
  },
  {
    id: 'mo-cosaque', name: 'Squat cosaque', equipment: [],
    pattern: 'mobilite', muscles: ['Adducteurs', 'Hanches'], workoutTypes: [MO], unilateral: true,
    mode: 'time', defaults: hold(1, 30, 0),
    cue: 'Pieds très écartés, descends sur une jambe en gardant l’autre tendue.',
  },
  {
    id: 'mo-cercles-genou', name: 'Grands cercles de hanche debout', equipment: [],
    pattern: 'mobilite', muscles: ['Hanches', 'Fessiers'], workoutTypes: [MO], unilateral: true,
    mode: 'time', defaults: hold(1, 30, 0),
    cue: 'Une main au mur, fais un grand cercle lent avec le genou, vers l’extérieur.',
  },
  {
    id: 'mo-poignets', name: 'Mobilité des poignets', equipment: [],
    pattern: 'mobilite', muscles: ['Poignets', 'Avant-bras'], workoutTypes: [MO],
    mode: 'time', defaults: hold(1, 45, 0),
    cue: 'Cercles de poignets, puis étire doucement les avant-bras, paumes vers toi.',
  },
  {
    id: 'mo-cou', name: 'Mobilité douce du cou', equipment: [],
    pattern: 'mobilite', muscles: ['Cou', 'Haut du dos'], workoutTypes: [MO],
    mode: 'time', defaults: hold(1, 45, 0),
    cue: 'Incline lentement la tête d’un côté puis de l’autre, sans forcer.',
  },

  /* ================================================================ */
  /* Étirements (poids du corps)                                       */
  /* ================================================================ */
  {
    id: 'et-ischios', name: 'Étirement des ischios debout', equipment: [],
    pattern: 'etirement', muscles: ['Ischios', 'Mollets'], workoutTypes: [MO], unilateral: true,
    phases: ['cooldown', 'main'], mode: 'time', defaults: hold(1, 30, 0),
    cue: 'Talon posé devant, jambe tendue, penche-toi dos plat.',
  },
  {
    id: 'et-quadriceps', name: 'Étirement des quadriceps debout', equipment: [],
    pattern: 'etirement', muscles: ['Quadriceps', 'Hanches'], workoutTypes: [MO], unilateral: true,
    phases: ['cooldown', 'main'], mode: 'time', defaults: hold(1, 30, 0),
    cue: 'Attrape ta cheville, genoux serrés, bassin légèrement basculé vers l’avant.',
  },
  {
    id: 'et-fessiers', name: 'Étirement des fessiers (figure 4)', equipment: [],
    pattern: 'etirement', muscles: ['Fessiers', 'Hanches'], workoutTypes: [MO], unilateral: true,
    phases: ['cooldown', 'main'], mode: 'time', defaults: hold(1, 30, 0),
    cue: 'Cheville posée sur le genou opposé, rapproche doucement la jambe de toi.',
  },
  {
    id: 'et-mollets', name: 'Étirement des mollets contre un mur', equipment: [],
    pattern: 'etirement', muscles: ['Mollets'], workoutTypes: [MO], unilateral: true,
    phases: ['cooldown', 'main'], mode: 'time', defaults: hold(1, 30, 0),
    cue: 'Mains au mur, jambe arrière tendue, talon bien au sol.',
  },
  {
    id: 'et-papillon', name: 'Papillon assis', equipment: [],
    pattern: 'etirement', muscles: ['Adducteurs', 'Hanches'], workoutTypes: [MO],
    phases: ['cooldown', 'main'], mode: 'time', defaults: hold(1, 45, 0),
    cue: 'Plantes des pieds jointes, dos long, laisse les genoux descendre.',
  },
  {
    id: 'et-flexion-avant', name: 'Flexion avant assise', equipment: [],
    pattern: 'etirement', muscles: ['Ischios', 'Dos'], workoutTypes: [MO],
    phases: ['cooldown', 'main'], mode: 'time', defaults: hold(1, 45, 0),
    cue: 'Jambes tendues devant toi, penche-toi depuis les hanches sans forcer.',
  },
  {
    id: 'et-pectoraux', name: 'Étirement des pectoraux contre un mur', equipment: [],
    pattern: 'etirement', muscles: ['Pectoraux', 'Épaules'], workoutTypes: [MO], unilateral: true,
    phases: ['cooldown', 'main'], mode: 'time', defaults: hold(1, 30, 0),
    cue: 'Avant-bras contre le mur, tourne doucement le buste à l’opposé.',
  },
  {
    id: 'et-triceps', name: 'Étirement des triceps', equipment: [],
    pattern: 'etirement', muscles: ['Triceps', 'Dorsaux'], workoutTypes: [MO], unilateral: true,
    phases: ['cooldown', 'main'], mode: 'time', defaults: hold(1, 30, 0),
    cue: 'Main dans le dos derrière la tête, pousse doucement le coude.',
  },
  {
    id: 'et-epaules', name: 'Étirement des épaules (bras croisé)', equipment: [],
    pattern: 'etirement', muscles: ['Épaules', 'Haut du dos'], workoutTypes: [MO], unilateral: true,
    phases: ['cooldown', 'main'], mode: 'time', defaults: hold(1, 30, 0),
    cue: 'Ramène le bras tendu contre la poitrine avec l’autre main.',
  },
  {
    id: 'et-dorsaux', name: 'Étirement latéral (bras en hauteur)', equipment: [],
    pattern: 'etirement', muscles: ['Dorsaux', 'Obliques'], workoutTypes: [MO], unilateral: true,
    phases: ['cooldown', 'main'], mode: 'time', defaults: hold(1, 30, 0),
    cue: 'Bras au-dessus de la tête, penche-toi sur le côté en allongeant la taille.',
  },
  {
    id: 'et-biceps', name: 'Étirement des biceps et avant-bras', equipment: [],
    pattern: 'etirement', muscles: ['Biceps', 'Avant-bras'], workoutTypes: [MO], unilateral: true,
    phases: ['cooldown'], mode: 'time', defaults: hold(1, 30, 0),
    cue: 'Bras tendu devant, paume vers le haut, tire doucement les doigts vers toi.',
  },
  {
    id: 'et-respiration', name: 'Respiration ventrale allongé', equipment: [],
    pattern: 'etirement', muscles: ['Récupération'], workoutTypes: [MO],
    phases: ['cooldown', 'main'], mode: 'time', defaults: hold(1, 60, 0),
    cue: 'Une main sur le ventre : inspire 4 s par le nez, expire 6 s par la bouche.',
  },
];

/** Libellés des types de mouvement (affichés sur le bouton « Remplacer »). */
export const MOVEMENT_LABELS: Record<MovementPattern, string> = {
  squat: 'Squat',
  fente: 'Fente / unilatéral',
  charniere: 'Charnière de hanche',
  quadriceps: 'Quadriceps',
  ischios: 'Ischios',
  fessiers: 'Fessiers',
  mollets: 'Mollets',
  'poussee-horizontale': 'Poussée horizontale',
  'poussee-verticale': 'Poussée verticale',
  'tirage-horizontal': 'Tirage horizontal',
  'tirage-vertical': 'Tirage vertical',
  pectoraux: 'Pectoraux',
  epaules: 'Épaules',
  biceps: 'Biceps',
  triceps: 'Triceps',
  gainage: 'Gainage',
  'anti-rotation': 'Anti-rotation',
  'flexion-tronc': 'Flexion du tronc',
  cardio: 'Cardio',
  'cardio-continu': 'Cardio continu',
  'cardio-fractionne': 'Cardio fractionné',
  echauffement: 'Échauffement',
  mobilite: 'Mobilité',
  etirement: 'Étirement',
};

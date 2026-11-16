/**
 * Les conseils et les répliques de Machamp. Tout est modifiable ici.
 */

/* ------------------------------------------------------------------ */
/* Fréquence d'entraînement                                            */
/* ------------------------------------------------------------------ */

export interface FrequencyRule {
  /** Nombre d'entraînements par mois, bornes incluses. */
  min: number;
  max: number;
  /** Phrase principale de Machamp. */
  headline: string;
  /** Précision affichée en dessous. */
  detail: string;
  /**
   * Exemple de semaine, du lundi au dimanche : id d'un type de séance
   * (voir `workoutTypes.ts`) ou `null` pour un jour de repos.
   */
  week: (string | null)[];
  /** Petit message bonus sur le repos (facultatif). */
  restNote?: string;
}

export const FREQUENCY_RANGE = { min: 1, max: 30, default: 4 };

export const WEEK_DAYS = [
  { short: 'L', long: 'Lundi' },
  { short: 'M', long: 'Mardi' },
  { short: 'M', long: 'Mercredi' },
  { short: 'J', long: 'Jeudi' },
  { short: 'V', long: 'Vendredi' },
  { short: 'S', long: 'Samedi' },
  { short: 'D', long: 'Dimanche' },
];

export const FREQUENCY_RULES: FrequencyRule[] = [
  {
    min: 1,
    max: 5,
    headline: 'Machamp te conseille de faire du Full body à chaque séance !',
    detail: 'Peu de séances ? Fais-les compter : tout le corps d’un coup, à chaque fois.',
    week: ['full-body', null, null, null, null, null, null],
  },
  {
    min: 6,
    max: 9,
    headline: 'Machamp te conseille 2 séances Full body par semaine !',
    detail: 'Laisse au moins deux jours entre les deux pour bien récupérer.',
    week: ['full-body', null, null, 'full-body', null, null, null],
  },
  {
    min: 10,
    max: 13,
    headline: 'Machamp te conseille 3 Full body par semaine, avec un jour de repos entre chaque !',
    detail: 'Lundi, mercredi, vendredi : le grand classique des champions.',
    week: ['full-body', null, 'full-body', null, 'full-body', null, null],
  },
  {
    min: 14,
    max: 17,
    headline: 'Machamp te conseille d’alterner Haut / Bas / Haut / Bas !',
    detail: 'Chaque zone travaille deux fois par semaine et se repose pendant que l’autre bosse.',
    week: ['haut', 'bas', null, 'haut', 'bas', null, null],
  },
  {
    min: 18,
    max: 21,
    headline: 'Machamp te conseille Haut / Bas / HIIT / Haut / Bas !',
    detail: 'Le HIIT du milieu de semaine fait grimper le cardio sans écraser tes muscles.',
    week: ['haut', 'bas', 'hiit', 'haut', 'bas', null, null],
  },
  {
    min: 22,
    max: 30,
    headline: 'Machamp te conseille Haut / Bas / Cardio / Haut / Bas / Mobilité !',
    detail: 'Et garde au moins un jour de repos complet dans la semaine.',
    restNote: 'Même avec quatre bras, Machamp prend des jours de repos !',
    week: ['haut', 'bas', 'cardio', 'haut', 'bas', 'mobilite', null],
  },
];

/* ------------------------------------------------------------------ */
/* Astuces bonus (tirées au hasard en bas du panneau)                  */
/* ------------------------------------------------------------------ */

export const BONUS_TIPS: string[] = [
  'Dors 7 à 9 h par nuit : c’est pendant le sommeil que tes muscles se reconstruisent. Même Machamp fait la sieste !',
  'Bois de l’eau avant, pendant et après la séance. Un muscle déshydraté, c’est un muscle qui boude.',
  'Quand la dernière série devient facile, ajoute une répétition ou un peu de charge. Petit à petit, on devient costaud.',
  'La technique avant la charge : un mouvement propre avec moins de poids vaut mieux qu’un mouvement bancal.',
  'L’OMS recommande 150 à 300 min d’activité modérée par semaine, plus du renforcement musculaire au moins 2 jours par semaine.',
  'Ne saute pas l’échauffement : quelques minutes suffisent pour préparer tes articulations.',
  'Souffle pendant l’effort, inspire pendant le retour. Bloquer sa respiration, c’est pour les ballons !',
  'Mieux vaut 20 minutes régulièrement que 2 heures une fois par mois. La régularité bat tout.',
  'Les courbatures, c’est normal. Une douleur vive, non : arrête-toi et adapte l’exercice.',
  'Mets des protéines à chaque repas (œufs, légumineuses, poisson, yaourt…) pour aider tes muscles à récupérer.',
  '« Garder 2 répétitions en réserve », c’est finir une série en te disant : j’aurais pu en faire encore deux.',
  'Les jours de repos, une balade active aide à récupérer. Marcher, ça compte aussi !',
  'Note tes charges et tes répétitions quelque part : voir tes progrès, c’est la meilleure motivation.',
  'Tu passes la journée assis ? Lève-toi et bouge quelques minutes toutes les heures.',
  'Respecte les temps de repos entre les séries : ils font partie de l’entraînement.',
  'Choisis des séances qui te plaisent : le meilleur programme est celui que tu fais vraiment.',
];

/* ------------------------------------------------------------------ */
/* Répliques de Machamp                                                */
/* ------------------------------------------------------------------ */

export const MACHAMP_TEXT = {
  bubble: 'Besoin d’une astuce ?',
  dialogTitle: 'Les astuces de Machamp',
  dialogIntro: 'Salut ! Moi, c’est Machamp. Combien d’entraînements fais-tu par mois ?',
  weekTitle: 'Exemple de semaine',
  weekHint: 'Touche un jour pour préparer cette séance.',
  bonusTitle: 'Astuce bonus',
  emptyState:
    'Choisis ton type de séance, ta durée et ton matériel, puis lance la génération. Machamp s’occupe du reste !',
  congratsTitle: 'BRAVO !',
  congratsText: 'Séance terminée ! Machamp est fier de toi. Bois un grand verre d’eau et savoure.',
};

/** Messages affichés au-dessus de la séance. {type}, {minutes} et {max} sont remplacés. */
export const MACHAMP_NOTICES = {
  noEquipment: 'Rien de coché ? Pas grave : Machamp t’a préparé une séance 100 % poids du corps !',
  weakEquipment:
    'Ton matériel ne sert pas beaucoup pour « {type} » : Machamp a complété avec des exercices au poids du corps !',
  cardioNoMachine: 'Pas de machine cardio cochée : place au cardio au poids du corps !',
  overflow: '{minutes} min de {type}, c’est beaucoup ! Machamp a complété avec un bloc de cardio modéré.',
  express: 'Séance express : échauffement et retour au calme réduits au minimum. Chaque minute compte !',
};

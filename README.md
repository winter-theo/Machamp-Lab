# Machamp Lab 💪

Générateur d'entraînements sportifs : choisis un **type de séance**, une **durée** (10 à 120 min) et
ton **équipement**, et Machamp te prépare une séance complète (échauffement, séance, retour au
calme) avec des cases à cocher pour suivre ta progression.

- 100 % côté client : pas de backend, pas de compte, pas de variable d'environnement.
- Sauvegarde locale (`localStorage`) : réglages, séance en cours et cases cochées survivent à un
  rechargement ou au verrouillage du téléphone.
- Vite + React + TypeScript, CSS simple avec variables. Tests Vitest sur le générateur.

---

## 1. Lancer le projet en local

**Prérequis** : [Node.js](https://nodejs.org) **20.19 ou plus récent** (la version LTS conseillée
convient) — npm est fourni avec.

```bash
npm install      # installe les dépendances (une seule fois)
npm run dev      # lance l'app sur http://localhost:5173
```

Autres commandes utiles :

| Commande          | Rôle                                                        |
| ----------------- | ----------------------------------------------------------- |
| `npm test`        | lance les tests du générateur (`vitest run`)                |
| `npm run build`   | vérifie les types puis construit le site dans `dist/`       |
| `npm run preview` | sert le site construit, pour le tester avant de déployer    |
| `npm run icons`   | régénère les icônes à partir de `public/machamp.png`        |

Pour tester sur ton téléphone sur le même Wi-Fi : `npm run dev -- --host`, puis ouvre l'adresse
« Network » affichée dans le terminal.

---

## 2. Déployer sur Vercel (depuis GitHub)

### a. Mettre le projet sur GitHub

1. Sur [github.com](https://github.com), clique **New repository**, nomme-le (ex. `machamp-lab`),
   laisse-le **vide** (pas de README, pas de .gitignore) et crée-le.
2. Dans le dossier du projet :

```bash
git init
git add .
git commit -m "Machamp Lab"
git branch -M main
git remote add origin https://github.com/TON-PSEUDO/machamp-lab.git
git push -u origin main
```

### b. Importer dans Vercel

1. Va sur [vercel.com](https://vercel.com) et connecte-toi avec GitHub.
2. **Add New → Project**.
3. Choisis le dépôt `machamp-lab` → **Import**.
4. Vercel détecte **Vite** tout seul (build `npm run build`, dossier de sortie `dist`) : ne change
   rien, aucune variable d'environnement n'est nécessaire.
5. **Deploy**. Une minute plus tard, ton app est en ligne.

Ensuite, chaque `git push` sur `main` redéploie automatiquement. Pas besoin de `vercel.json` :
l'app tient sur une seule page, sans routeur.

**Sur le téléphone** : ouvre l'adresse Vercel puis « Partager → Sur l'écran d'accueil » (iPhone)
ou « Ajouter à l'écran d'accueil » (Android) pour l'avoir comme une app, avec l'icône de Machamp.

---

## 3. Organisation du code

```
public/
  machamp.png             ← le sprite (logo, favicon, mascotte)
  icons/                  ← icônes générées (180, 192, 512 px + favicon 64 px)
  manifest.webmanifest    ← « Ajouter à l'écran d'accueil »
scripts/generate-icons.mjs← génère les icônes en « nearest neighbor »
design/machamp-source.png ← le sprite tel qu'il a été fourni (non publié)
src/
  data/                   ← TOUT le contenu est ici
    equipment.ts          ← équipements et catégories
    exercises.ts          ← bibliothèque d'exercices (~170)
    workoutTypes.ts       ← types de séance et règles de composition
    tips.ts               ← conseils, astuces et répliques de Machamp
    types.ts              ← description des champs (à lire en cas de doute)
  lib/
    generator.ts          ← le cœur : fonction pure qui génère une séance
    generator.test.ts     ← tests Vitest
    workout.ts            ← structure d'une séance, estimation du temps, progression
    storage.ts            ← sauvegarde locale versionnée
  components/             ← l'interface React (construite à partir des données)
  styles/
    theme.css             ← les couleurs et polices (variables CSS)
    app.css               ← le reste du style
```

---

## 4. Ajouter un équipement (exemple pas à pas : une kettlebell)

**Étape 1** — dans `src/data/equipment.ts`, ajoute une ligne à `EQUIPMENT` :

```ts
{ id: 'kettlebell', label: 'Kettlebell', icon: '🔔', category: 'musculation' },
```

- `id` : identifiant unique, en minuscules, sans espace (il sert dans la sauvegarde locale : ne le
  change plus ensuite).
- `category` : `cardio`, `musculation` ou `accessoires`. Pour une nouvelle catégorie, ajoute-la
  dans `EQUIPMENT_CATEGORIES` juste au-dessus.

**Étape 2** — dans `src/data/exercises.ts`, ajoute des exercices qui utilisent cet `id`
(au moins 6, c'est vérifié par les tests) :

```ts
{
  id: 'kb-swing', name: 'Swing kettlebell', equipment: ['kettlebell'],
  pattern: 'charniere', muscles: ['Fessiers', 'Ischios'], workoutTypes: [FB, LO, HI],
  mode: 'reps', defaults: reps(3, 15, 20, 60),
  cue: 'Le mouvement vient des hanches : pousse le bassin vers l’avant.',
},
{
  id: 'kb-goblet', name: 'Squat goblet kettlebell', equipment: ['kettlebell'],
  pattern: 'squat', muscles: ['Quadriceps', 'Fessiers'], workoutTypes: [FB, LO],
  mode: 'reps', defaults: reps(3, 10, 12, 90),
  cue: 'Kettlebell contre la poitrine, coudes entre les genoux en bas.',
},
```

**Étape 3** — `npm test`, puis `npm run dev`. C'est tout : la case « Kettlebell » apparaît dans la
bonne catégorie, et le générateur l'utilise dès qu'elle est cochée. Aucun composant à modifier.

> Un exercice qui demande deux équipements (ex. `['banc', 'halteres']`) n'est proposé que si
> **les deux** sont cochés.

---

## 5. Ajouter un exercice

Copie une ligne existante de `src/data/exercises.ts` et adapte les champs :

| Champ          | Exemple                         | Rôle                                                                 |
| -------------- | ------------------------------- | -------------------------------------------------------------------- |
| `id`           | `'ha-curl-concentre'`           | unique                                                               |
| `name`         | `'Curl concentré'`              | nom affiché                                                          |
| `equipment`    | `['halteres']`                  | équipement requis (`[]` = poids du corps)                            |
| `pattern`      | `'biceps'`                      | type de mouvement (équilibre de la séance + bouton « Remplacer »)    |
| `muscles`      | `['Biceps']`                    | sert aussi à choisir les étirements                                  |
| `workoutTypes` | `[UP]`                          | types de séance compatibles (`FB`, `UP`, `LO`, `CA`, `HI`, `AB`, `MO`) |
| `phases`       | `['main']` (par défaut)         | `warmup` = échauffement, `cooldown` = retour au calme                |
| `mode`         | `'reps'`                        | `reps`, `time`, `continuous` (cardio continu), `intervals` (fractionné) |
| `defaults`     | `reps(3, 10, 12, 60)`           | séries, fourchette de répétitions, repos en secondes                 |
| `unilateral`   | `true`                          | à faire de chaque côté (temps estimé × 2)                            |
| `cue`          | `'Coude calé contre la cuisse.'`| consigne technique d'une ligne                                       |

Raccourcis disponibles : `reps(séries, min, max, repos)`, `hold(séries, secondes, repos)`,
`intervals(effort, récup, 'intense', 'facile')`.

---

## 6. Ajouter un type de séance (exemple : « Bras »)

**Étape 1** — dans `src/data/workoutTypes.ts`, ajoute une entrée à `WORKOUT_TYPES` :

```ts
{
  id: 'bras',
  label: 'Bras',
  shortLabel: 'Bras',
  icon: '💥',
  description: 'Biceps, triceps et épaules',
  format: 'strength',                      // séries classiques
  slots: [['biceps'], ['triceps'], ['epaules'], ['biceps'], ['triceps'], ['epaules']],
  maxMinutes: 60,                          // au-delà : bloc de cardio modéré + message
  strength: { sets: { base: 3, min: 2, max: 4 }, maxExercises: 8 },
},
```

- `format` : `strength` (séries), `circuit` (tours, comme HIIT et Mobilité, avec un bloc
  `circuit: {…}`) ou `cardio`.
- `slots` : l'ordre des types de mouvement ; le générateur les parcourt en boucle.

**Étape 2** — dans `src/data/exercises.ts`, déclare `const AR = 'bras';` en haut du fichier et
ajoute `AR` au champ `workoutTypes` des exercices compatibles (curls, extensions triceps,
élévations latérales, pompes diamant…). Les tests demandent au moins 4 exercices au poids du corps
par type, pour que la séance marche même sans équipement.

**Étape 3** — `npm test`. La nouvelle carte apparaît automatiquement dans le générateur. Tu peux
aussi l'utiliser dans les exemples de semaine de `tips.ts`.

---

## 7. Modifier les conseils de Machamp

Tout est dans `src/data/tips.ts` :

- `FREQUENCY_RULES` : paliers (entraînements par mois → conseil + exemple de semaine du lundi au
  dimanche, avec l'`id` du type de séance ou `null` pour un repos) ;
- `BONUS_TIPS` : astuces tirées au hasard ;
- `MACHAMP_TEXT` et `MACHAMP_NOTICES` : bulle, textes du panneau, messages au-dessus de la séance.

---

## 8. Changer les couleurs

Les couleurs sont des variables CSS dans **`src/styles/theme.css`** :

```css
--color-bg: #221f1d;          /* fond */
--color-surface: #2c2826;     /* cartes */
--color-surface-2: #36312e;
--color-border: #4a423c;
--color-text: #f5f0ea;
--color-text-muted: #b5a99e;
--color-accent: #e07a2f;      /* orange */
--color-accent-hover: #f29a52;
--color-brown: #8b4a22;       /* marron */
--color-brown-dark: #5a2e14;  /* contours 8-bit */
--color-on-accent: #221f1d;   /* texte sur les boutons orange */
```

Si tu changes la couleur de fond, mets aussi à jour :

- `theme-color` dans `index.html` ;
- `background_color` et `theme_color` dans `public/manifest.webmanifest` ;
- `BACKGROUND` dans `scripts/generate-icons.mjs`, puis lance `npm run icons`.

Garde un texte foncé sur l'orange : le blanc n'y est pas assez contrasté.

---

## 9. Le sprite et les icônes

- `public/machamp.png` est affiché partout avec `image-rendering: pixelated`, agrandi par un
  facteur entier (calculé selon la densité de l'écran) pour rester net.
- Le fichier fourni (`design/machamp-source.png`, 700 × 600 px, fond transparent) était déjà
  agrandi avec un facteur non entier (≈ 22,7×) et des bords lissés : il a été reconstruit à sa
  taille d'origine (27 × 22 px + 1 px de marge), sans changer un seul pixel du dessin.
- Pour changer de sprite : remplace `public/machamp.png` (PNG à fond transparent, de préférence à
  sa taille d'origine), puis `npm run icons` pour régénérer les icônes 180 / 192 / 512 px
  (agrandies en « nearest neighbor » sur la couleur de fond) et le favicon.

---

## 10. Comment le générateur respecte la durée

`src/lib/generator.ts` est une fonction pure (`generateWorkout`), avec un aléatoire injectable :

1. Il ne garde que les exercices dont **tout** l'équipement est coché (+ le poids du corps).
2. Il réserve ~10 % pour l'échauffement (3 à 8 min, sur une machine cardio si possible) et ~10 %
   pour le retour au calme (2 à 6 min). Pour 10 à 15 min, les deux sont réduits au minimum.
3. Il compose la séance selon les créneaux du type, puis ajuste séries, tours et blocs.
   Estimation : séries × (effort + repos), ~3 s par répétition, × 2 pour un exercice unilatéral,
   ~30 s de transition. Résultat : ±10 % de la durée choisie (au moins ±2 min).
4. Longue séance : il ajoute des séries et des tours (8 à 10 exercices maximum). Au-delà de la
   durée raisonnable du type (`maxMinutes`), il complète avec un bloc de cardio modéré.
5. Pas de doublon, jamais de séance vide.

Les tests (`npm test`) vérifient chaque type × 10, 30, 60, 120 min × 4 configurations
d'équipement (rien, tout, cardio seulement, haltères seulement) avec plusieurs tirages.

---

## 11. Sauvegarde locale

Clés versionnées : `machamp-lab:v1:settings`, `machamp-lab:v1:session`,
`machamp-lab:v1:frequency`. Un équipement ou un type qui n'existe plus est ignoré sans planter.
Si un jour la structure change trop, passe à `v2` dans `src/lib/storage.ts`.

---

*Suggestions générales : écoute ton corps et adapte les charges.*

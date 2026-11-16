import { describe, expect, it } from 'vitest';
import { EQUIPMENT } from '../data/equipment';
import { EXERCISES } from '../data/exercises';
import { FREQUENCY_RANGE, FREQUENCY_RULES } from '../data/tips';
import { WORKOUT_TYPES } from '../data/workoutTypes';
import { generateWorkout, getAlternatives, replaceExercise, toleranceSeconds } from './generator';
import { createRng } from './random';
import { allItems, itemsSeconds, workoutSeconds, type Workout } from './workout';

const byId = new Map(EXERCISES.map((ex) => [ex.id, ex]));

const EQUIPMENT_SETS: Record<string, string[]> = {
  rien: [],
  tout: EQUIPMENT.map((e) => e.id),
  'cardio seulement': EQUIPMENT.filter((e) => e.category === 'cardio').map((e) => e.id),
  'haltères seulement': ['halteres'],
};
const DURATIONS = [10, 30, 60, 120];
const SEEDS = [1, 2, 3, 42, 2024];

function exerciseIds(workout: Workout): string[] {
  return allItems(workout).flatMap((item) =>
    item.kind === 'circuit' ? item.moves.map((m) => m.exerciseId) : [item.exerciseId],
  );
}

function mainItems(workout: Workout) {
  return workout.sections.find((s) => s.id === 'main')!.items;
}

describe('données', () => {
  it('ids uniques et références valides', () => {
    const ids = EXERCISES.map((ex) => ex.id);
    expect(new Set(ids).size).toBe(ids.length);
    const equipmentIds = new Set(EQUIPMENT.map((e) => e.id));
    const typeIds = new Set(WORKOUT_TYPES.map((t) => t.id));
    for (const ex of EXERCISES) {
      ex.equipment.forEach((id) => expect(equipmentIds, `${ex.id} → ${id}`).toContain(id));
      ex.workoutTypes.forEach((id) => expect(typeIds, `${ex.id} → ${id}`).toContain(id));
    }
  });

  it('une soixantaine d’exercices au moins, et au moins 6 par équipement', () => {
    expect(EXERCISES.length).toBeGreaterThanOrEqual(60);
    for (const equipment of EQUIPMENT) {
      const count = EXERCISES.filter((ex) => ex.equipment.includes(equipment.id)).length;
      expect(count, equipment.label).toBeGreaterThanOrEqual(6);
    }
    expect(EXERCISES.filter((ex) => ex.equipment.length === 0).length).toBeGreaterThanOrEqual(30);
  });

  it('chaque type de séance a des exercices au poids du corps', () => {
    for (const type of WORKOUT_TYPES) {
      const bodyweight = EXERCISES.filter((ex) => ex.equipment.length === 0 && ex.workoutTypes.includes(type.id));
      expect(bodyweight.length, type.label).toBeGreaterThanOrEqual(4);
    }
  });

  it('les règles de fréquence couvrent 1 à 30 sans trou et pointent vers des types existants', () => {
    const typeIds = new Set(WORKOUT_TYPES.map((t) => t.id));
    for (let n = FREQUENCY_RANGE.min; n <= FREQUENCY_RANGE.max; n++) {
      const rules = FREQUENCY_RULES.filter((r) => n >= r.min && n <= r.max);
      expect(rules.length, `${n} / mois`).toBe(1);
    }
    for (const rule of FREQUENCY_RULES) {
      expect(rule.week).toHaveLength(7);
      expect(rule.week.some((d) => d === null), 'au moins un jour de repos').toBe(true);
      rule.week.forEach((id) => id && expect(typeIds).toContain(id));
    }
  });
});

describe('generateWorkout — toutes les combinaisons', () => {
  for (const type of WORKOUT_TYPES) {
    for (const duration of DURATIONS) {
      for (const [label, equipment] of Object.entries(EQUIPMENT_SETS)) {
        it(`${type.label} · ${duration} min · ${label}`, () => {
          const checked = new Set(equipment);
          for (const seed of SEEDS) {
            const workout = generateWorkout({ typeId: type.id, duration, equipment }, { random: createRng(seed) });
            const ids = exerciseIds(workout);

            // Jamais vide, avec les trois parties
            expect(mainItems(workout).length, `seed ${seed}`).toBeGreaterThan(0);
            for (const section of workout.sections) {
              expect(section.items.length, `${section.title} · seed ${seed}`).toBeGreaterThan(0);
            }

            // Seulement l'équipement disponible
            for (const id of ids) {
              const ex = byId.get(id)!;
              expect(ex, id).toBeDefined();
              for (const needed of ex.equipment) expect(checked.has(needed), `${id} demande ${needed}`).toBe(true);
            }

            // Pas de doublon
            expect(new Set(ids).size, `doublon (seed ${seed}) : ${ids.join(', ')}`).toBe(ids.length);

            // Durée respectée
            const total = workoutSeconds(workout);
            const tolerance = toleranceSeconds(duration);
            expect(
              Math.abs(total - duration * 60),
              `seed ${seed} : ${Math.round(total / 60)} min pour ${duration} min`,
            ).toBeLessThanOrEqual(tolerance);

            // Pas plus de 10 exercices dans la séance principale (hors bloc complémentaire ;
            // les enchaînements de mobilité ne sont pas concernés)
            if (type.id !== 'mobilite') {
              const mainExercises = mainItems(workout)
                .filter((item) => item.role !== 'filler')
                .reduce((n, item) => n + (item.kind === 'circuit' ? item.moves.length : 1), 0);
              expect(mainExercises, `seed ${seed}`).toBeLessThanOrEqual(10);
            }
          }
        });
      }
    }
  }
});

describe('generateWorkout — règles', () => {
  it('est reproductible avec la même graine et varie sinon', () => {
    const input = { typeId: 'full-body', duration: 45, equipment: EQUIPMENT_SETS.tout };
    const a = generateWorkout(input, { random: createRng(7), now: 0 });
    const b = generateWorkout(input, { random: createRng(7), now: 0 });
    expect(a).toEqual(b);
    const variants = new Set(SEEDS.map((s) => exerciseIds(generateWorkout(input, { random: createRng(s) })).join()));
    expect(variants.size).toBeGreaterThan(1);
  });

  it('fonctionne avec les valeurs par défaut (Full body, 45 min, rien de coché)', () => {
    const workout = generateWorkout({ typeId: 'full-body', duration: 45, equipment: [] }, { random: createRng(1) });
    expect(workout.notices[0]).toMatch(/poids du corps/);
    expect(Math.abs(workoutSeconds(workout) - 45 * 60)).toBeLessThanOrEqual(toleranceSeconds(45));
  });

  it('ignore les équipements et types inconnus sans planter', () => {
    const workout = generateWorkout(
      { typeId: 'n-existe-pas', duration: 30, equipment: ['halteres', 'trampoline-quantique'] },
      { random: createRng(3) },
    );
    expect(workout.equipment).toEqual(['halteres']);
    expect(workout.typeId).toBe(WORKOUT_TYPES[0].id);
  });

  it('Full body alterne bas du corps, poussée, charnière, tirage et gainage', () => {
    const workout = generateWorkout(
      { typeId: 'full-body', duration: 60, equipment: EQUIPMENT_SETS.tout },
      { random: createRng(11) },
    );
    const patterns = new Set(mainItems(workout).map((i) => (i.kind === 'exercise' ? i.pattern : '')));
    expect([...patterns].some((p) => p === 'squat' || p === 'fente')).toBe(true);
    expect([...patterns].some((p) => p.startsWith('poussee'))).toBe(true);
    expect([...patterns].some((p) => p.startsWith('tirage'))).toBe(true);
    expect([...patterns].some((p) => p === 'charniere' || p === 'fessiers')).toBe(true);
  });

  it('les longues séances augmentent les séries plutôt que le nombre d’exercices', () => {
    const workout = generateWorkout(
      { typeId: 'haut', duration: 90, equipment: EQUIPMENT_SETS.tout },
      { random: createRng(5) },
    );
    const items = mainItems(workout).filter((i) => i.kind === 'exercise' && i.role === 'main');
    expect(items.length).toBeLessThanOrEqual(10);
    const sets = items.map((i) => (i.kind === 'exercise' && i.prescription.kind === 'reps' ? i.prescription.sets : 0));
    expect(Math.max(...sets)).toBeGreaterThanOrEqual(4);
  });

  it('HIIT : circuits de 4 à 6 exercices, 40 s / 20 s, plusieurs tours, 1 min entre les tours', () => {
    for (const seed of SEEDS) {
      const workout = generateWorkout({ typeId: 'hiit', duration: 30, equipment: [] }, { random: createRng(seed) });
      const circuits = mainItems(workout).filter((i) => i.kind === 'circuit');
      expect(circuits.length).toBeGreaterThan(0);
      for (const c of circuits) {
        if (c.kind !== 'circuit') continue;
        expect(c.moves.length).toBeGreaterThanOrEqual(4);
        expect(c.moves.length).toBeLessThanOrEqual(6);
        expect(c.rounds).toBeGreaterThanOrEqual(2);
        expect(c.rest).toBe(20);
        expect(c.roundRest).toBe(60);
        c.moves.forEach((m) => expect(m.seconds).toBe(40));
      }
    }
  });

  it('Cardio : blocs continus et fractionnés, en variant les machines', () => {
    const workout = generateWorkout(
      { typeId: 'cardio', duration: 60, equipment: EQUIPMENT_SETS['cardio seulement'] },
      { random: createRng(9) },
    );
    const blocks = mainItems(workout).filter((i) => i.kind === 'exercise');
    const kinds = new Set(blocks.map((b) => (b.kind === 'exercise' ? b.prescription.kind : '')));
    expect(kinds).toContain('continuous');
    expect(kinds).toContain('intervals');
    const machines = new Set(blocks.map((b) => (b.kind === 'exercise' ? b.equipment.join() : '')));
    expect(machines.size).toBeGreaterThanOrEqual(2);
    // Échauffement sur une machine cardio
    const warmup = workout.sections[0].items[0];
    expect(warmup.kind === 'exercise' && warmup.equipment.length > 0).toBe(true);
  });

  it('Cardio sans machine : cardio au poids du corps et message de Machamp', () => {
    const workout = generateWorkout({ typeId: 'cardio', duration: 30, equipment: ['halteres'] }, { random: createRng(2) });
    expect(workout.notices.join(' ')).toMatch(/machine cardio/);
    expect(mainItems(workout).some((i) => i.kind === 'circuit')).toBe(true);
  });

  it('Haut du corps avec seulement un tapis roulant : complété au poids du corps + message', () => {
    const workout = generateWorkout(
      { typeId: 'haut', duration: 45, equipment: ['tapis-roulant'] },
      { random: createRng(4) },
    );
    expect(mainItems(workout).length).toBeGreaterThan(0);
    expect(workout.notices.join(' ')).toMatch(/poids du corps/);
  });

  it('90 min d’abdos : bloc de cardio modéré et message de Machamp', () => {
    const workout = generateWorkout({ typeId: 'abdos', duration: 90, equipment: EQUIPMENT_SETS.tout }, { random: createRng(8) });
    const filler = mainItems(workout).filter((i) => i.role === 'filler');
    expect(filler.length).toBeGreaterThan(0);
    expect(workout.notices.join(' ')).toMatch(/abdos/i);
    const absPart = itemsSeconds(mainItems(workout).filter((i) => i.role !== 'filler'));
    expect(absPart).toBeLessThanOrEqual(40 * 60);
  });

  it('échauffement 3 à 8 min et retour au calme 2 à 6 min (environ)', () => {
    for (const duration of [30, 45, 60, 90, 120]) {
      for (const seed of SEEDS) {
        const workout = generateWorkout({ typeId: 'full-body', duration, equipment: EQUIPMENT_SETS.tout }, { random: createRng(seed) });
        const [warmup, , cooldown] = workout.sections;
        const w = itemsSeconds(warmup.items) / 60;
        const c = itemsSeconds(cooldown.items) / 60;
        expect(w, `échauffement ${duration} min`).toBeGreaterThanOrEqual(2.5);
        expect(w).toBeLessThanOrEqual(9);
        expect(c, `retour au calme ${duration} min`).toBeGreaterThanOrEqual(1.5);
        expect(c).toBeLessThanOrEqual(7);
      }
    }
  });
});

describe('replaceExercise', () => {
  it('remplace par un exercice du même type de mouvement, compatible et sans doublon', () => {
    for (const seed of SEEDS) {
      const workout = generateWorkout(
        { typeId: 'full-body', duration: 45, equipment: ['halteres', 'banc'] },
        { random: createRng(seed) },
      );
      const target = mainItems(workout)[0];
      if (target.kind !== 'exercise') continue;
      const next = replaceExercise(workout, target.uid, { random: createRng(seed + 100) });
      if (!next) {
        expect(getAlternatives(workout, target.uid)).toHaveLength(0);
        continue;
      }
      const replaced = mainItems(next)[0];
      expect(replaced.kind).toBe('exercise');
      if (replaced.kind !== 'exercise') continue;
      expect(replaced.exerciseId).not.toBe(target.exerciseId);
      expect(replaced.pattern).toBe(target.pattern);
      expect(replaced.uid).not.toBe(target.uid);
      const ex = byId.get(replaced.exerciseId)!;
      ex.equipment.forEach((id) => expect(['halteres', 'banc']).toContain(id));
      const ids = exerciseIds(next);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it('remplace un mouvement de circuit HIIT', () => {
    const workout = generateWorkout({ typeId: 'hiit', duration: 30, equipment: [] }, { random: createRng(1) });
    const circuit = mainItems(workout).find((i) => i.kind === 'circuit');
    if (!circuit || circuit.kind !== 'circuit') throw new Error('pas de circuit');
    const move = circuit.moves.find((m) => getAlternatives(workout, m.uid).length > 0);
    expect(move).toBeDefined();
    const next = replaceExercise(workout, move!.uid, { random: createRng(2) })!;
    const nextCircuit = mainItems(next).find((i) => i.uid === circuit.uid);
    expect(nextCircuit?.kind === 'circuit' && nextCircuit.moves.some((m) => m.uid === move!.uid)).toBe(false);
    expect(nextCircuit?.kind === 'circuit' && nextCircuit.moves.length).toBe(circuit.moves.length);
  });

  it('renvoie null quand il n’y a aucune alternative', () => {
    const workout = generateWorkout({ typeId: 'full-body', duration: 45, equipment: [] }, { random: createRng(1) });
    expect(replaceExercise(workout, 'uid-inconnu')).toBeNull();
  });
});

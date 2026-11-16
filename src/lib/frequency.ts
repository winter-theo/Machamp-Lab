import { FREQUENCY_RULES, type FrequencyRule } from '../data/tips';

/** Règle de conseil correspondant à un nombre d'entraînements par mois. */
export function frequencyRule(perMonth: number): FrequencyRule {
  return (
    FREQUENCY_RULES.find((rule) => perMonth >= rule.min && perMonth <= rule.max) ??
    FREQUENCY_RULES[FREQUENCY_RULES.length - 1]
  );
}

/** Équivalent par semaine : « ≈ 1 séance par semaine », « ≈ 1 séance toutes les 2 semaines »… */
export function weeklyText(perMonth: number): string {
  const perWeek = (perMonth * 7) / 30;
  const rounded = Math.round(perWeek);
  if (rounded >= 1) return `≈ ${rounded} séance${rounded > 1 ? 's' : ''} par semaine`;
  return `≈ 1 séance toutes les ${Math.max(2, Math.round(1 / perWeek))} semaines`;
}

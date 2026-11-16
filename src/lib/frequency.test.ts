import { describe, expect, it } from 'vitest';
import { frequencyRule, weeklyText } from './frequency';

describe('conseils de fréquence', () => {
  it('4 entraînements par mois → Full body à chaque séance, ≈ 1 par semaine', () => {
    expect(frequencyRule(4).headline).toBe('Machamp te conseille de faire du Full body à chaque séance !');
    expect(weeklyText(4)).toBe('≈ 1 séance par semaine');
  });

  it('respecte les paliers', () => {
    expect(frequencyRule(8).week.filter(Boolean)).toHaveLength(2);
    expect(frequencyRule(12).week.filter(Boolean)).toHaveLength(3);
    expect(frequencyRule(16).week.filter(Boolean)).toEqual(['haut', 'bas', 'haut', 'bas']);
    expect(frequencyRule(20).week.filter(Boolean)).toEqual(['haut', 'bas', 'hiit', 'haut', 'bas']);
    expect(frequencyRule(30).restNote).toMatch(/quatre bras/);
  });

  it('équivalent par semaine', () => {
    expect(weeklyText(1)).toBe('≈ 1 séance toutes les 4 semaines');
    expect(weeklyText(2)).toBe('≈ 1 séance toutes les 2 semaines');
    expect(weeklyText(12)).toBe('≈ 3 séances par semaine');
    expect(weeklyText(30)).toBe('≈ 7 séances par semaine');
  });
});

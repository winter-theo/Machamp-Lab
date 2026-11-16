import type { CircuitItem, CircuitMove, Prescription } from './workout';

/** 45 → « 45 s », 60 → « 1 min », 90 → « 1 min 30 », 150 → « 2 min 30 » */
export function formatSeconds(total: number): string {
  const s = Math.round(total);
  if (s < 60) return `${s} s`;
  const min = Math.floor(s / 60);
  const rest = s % 60;
  return rest === 0 ? `${min} min` : `${min} min ${String(rest).padStart(2, '0')}`;
}

/** Durée estimée d'une séance : 2 640 s → « 44 min », 4 500 s → « 1 h 15 » */
export function formatMinutes(totalSeconds: number): string {
  const minutes = Math.round(totalSeconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} h` : `${h} h ${String(m).padStart(2, '0')}`;
}

function range([min, max]: [number, number]): string {
  return min === max ? `${min}` : `${min}–${max}`;
}

/** « 3 × 10–12 », « 3 × 30 s / côté », « 15 min en continu », « 6 × (1 min intense / 1 min facile) » */
export function formatPrescription(p: Prescription): string {
  switch (p.kind) {
    case 'reps': {
      const side = p.unilateral ? ' / côté' : '';
      return p.sets > 1 ? `${p.sets} × ${range(p.reps)}${side}` : `${range(p.reps)} rép.${side}`;
    }
    case 'time': {
      const side = p.unilateral ? ' / côté' : '';
      return p.sets > 1 ? `${p.sets} × ${formatSeconds(p.seconds)}${side}` : `${formatSeconds(p.seconds)}${side}`;
    }
    case 'continuous':
      return `${p.minutes} min en continu`;
    case 'intervals':
      return `${p.rounds} × (${formatSeconds(p.work)} ${p.workLabel} / ${formatSeconds(p.easy)} ${p.easyLabel})`;
  }
}

/** « Repos 1 min 30 » ou null s'il n'y a pas de repos à afficher. */
export function formatRest(p: Prescription): string | null {
  if ((p.kind === 'reps' || p.kind === 'time') && p.sets > 1 && p.rest > 0) {
    return `Repos ${formatSeconds(p.rest)}`;
  }
  return null;
}

/** Libellé d'une case de série : « Série » ou « Tour » / « Répétition » pour le fractionné. */
export function boxLabel(p: Prescription | null): string {
  if (!p) return 'Tour';
  return p.kind === 'intervals' ? 'Répétition' : 'Série';
}

export function formatCircuit(item: CircuitItem): string {
  const tours = `${item.rounds} tour${item.rounds > 1 ? 's' : ''}`;
  const pause = `${formatSeconds(item.roundRest)} de pause entre les tours`;
  if (item.ownDurations) return `${tours} · ${pause}`;
  const work = item.moves[0]?.seconds ?? 40;
  return `${tours} · ${work} s d’effort / ${item.rest} s de repos · ${pause}`;
}

export function formatMove(move: CircuitMove, item: CircuitItem): string {
  if (!item.ownDurations) return formatSeconds(move.seconds);
  return `${formatSeconds(move.seconds)}${move.perSide ? ' / côté' : ''}`;
}

/** « 1 séance », « 3 séances » */
export function plural(n: number, singular: string, pluralForm = `${singular}s`): string {
  return `${n} ${n > 1 ? pluralForm : singular}`;
}

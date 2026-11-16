/**
 * Sauvegarde locale (localStorage), avec des clés versionnées.
 * Toute donnée illisible ou obsolète est ignorée sans faire planter l'app.
 */
import { EQUIPMENT } from '../data/equipment';
import { FREQUENCY_RANGE } from '../data/tips';
import {
  DEFAULT_DURATION,
  DEFAULT_WORKOUT_TYPE_ID,
  DURATION_MAX,
  DURATION_MIN,
  DURATION_STEP,
  WORKOUT_TYPES,
} from '../data/workoutTypes';
import type { Checks, Workout } from './workout';

const PREFIX = 'machamp-lab:v1:';

export const STORAGE_KEYS = {
  settings: `${PREFIX}settings`,
  session: `${PREFIX}session`,
  frequency: `${PREFIX}frequency`,
} as const;

function read(key: string): unknown {
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? null : JSON.parse(raw);
  } catch {
    return null;
  }
}

function write(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Stockage plein ou désactivé (navigation privée) : on continue sans sauvegarde.
  }
}

function remove(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* rien à faire */
  }
}

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;

/* ------------------------------------------------------------------ */
/* Réglages du générateur                                              */
/* ------------------------------------------------------------------ */

export interface Settings {
  typeId: string;
  duration: number;
  equipment: string[];
  /** La liste d'équipement est repliée en résumé. */
  equipmentCollapsed: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  typeId: DEFAULT_WORKOUT_TYPE_ID,
  duration: DEFAULT_DURATION,
  equipment: [],
  equipmentCollapsed: false,
};

export function normalizeDuration(value: unknown): number {
  const n = typeof value === 'number' && Number.isFinite(value) ? value : DEFAULT_DURATION;
  const stepped = Math.round(n / DURATION_STEP) * DURATION_STEP;
  return Math.min(DURATION_MAX, Math.max(DURATION_MIN, stepped));
}

export function loadSettings(): Settings {
  const raw = read(STORAGE_KEYS.settings);
  if (!isObject(raw)) return { ...DEFAULT_SETTINGS };
  const knownTypes = new Set(WORKOUT_TYPES.map((t) => t.id));
  const knownEquipment = new Set(EQUIPMENT.map((e) => e.id));
  const equipment = Array.isArray(raw.equipment)
    ? [...new Set(raw.equipment.filter((id): id is string => typeof id === 'string' && knownEquipment.has(id)))]
    : [];
  return {
    typeId: typeof raw.typeId === 'string' && knownTypes.has(raw.typeId) ? raw.typeId : DEFAULT_SETTINGS.typeId,
    duration: normalizeDuration(raw.duration),
    equipment,
    equipmentCollapsed: raw.equipmentCollapsed === true,
  };
}

export function saveSettings(settings: Settings): void {
  write(STORAGE_KEYS.settings, settings);
}

/* ------------------------------------------------------------------ */
/* Séance en cours                                                     */
/* ------------------------------------------------------------------ */

export interface SavedSession {
  workout: Workout;
  checks: Checks;
}

function isValidWorkout(w: unknown): w is Workout {
  if (!isObject(w) || w.version !== 1 || !Array.isArray(w.sections)) return false;
  if (typeof w.typeLabel !== 'string' || typeof w.duration !== 'number' || !Array.isArray(w.equipment)) return false;
  return w.sections.every(
    (s) =>
      isObject(s) &&
      typeof s.title === 'string' &&
      Array.isArray(s.items) &&
      s.items.every(
        (item) =>
          isObject(item) &&
          typeof item.uid === 'string' &&
          (item.kind === 'exercise'
            ? isObject(item.prescription) && typeof item.name === 'string'
            : item.kind === 'circuit' && Array.isArray(item.moves) && typeof item.rounds === 'number'),
      ),
  );
}

export function loadSession(): SavedSession | null {
  const raw = read(STORAGE_KEYS.session);
  if (!isObject(raw) || !isValidWorkout(raw.workout)) return null;
  const checks: Checks = {};
  if (isObject(raw.checks)) {
    for (const [uid, value] of Object.entries(raw.checks)) {
      if (Array.isArray(value)) checks[uid] = value.map((v) => v === true);
    }
  }
  return { workout: raw.workout, checks };
}

export function saveSession(session: SavedSession | null): void {
  if (session) write(STORAGE_KEYS.session, session);
  else remove(STORAGE_KEYS.session);
}

/* ------------------------------------------------------------------ */
/* Réponse à Machamp (entraînements par mois)                          */
/* ------------------------------------------------------------------ */

export function loadFrequency(): number {
  const raw = read(STORAGE_KEYS.frequency);
  if (typeof raw !== 'number' || !Number.isFinite(raw)) return FREQUENCY_RANGE.default;
  return Math.min(FREQUENCY_RANGE.max, Math.max(FREQUENCY_RANGE.min, Math.round(raw)));
}

export function saveFrequency(value: number): void {
  write(STORAGE_KEYS.frequency, value);
}

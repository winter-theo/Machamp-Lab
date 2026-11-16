import { useId, type CSSProperties } from 'react';
import { EQUIPMENT, EQUIPMENT_CATEGORIES } from '../data/equipment';
import type { Equipment } from '../data/types';
import {
  DURATION_MAX,
  DURATION_MIN,
  DURATION_SHORTCUTS,
  DURATION_STEP,
  WORKOUT_TYPES,
} from '../data/workoutTypes';
import { plural } from '../lib/format';
import type { Settings } from '../lib/storage';

interface SettingsPanelProps {
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
  onGenerate: () => void;
  /** Sur mobile, après génération, les réglages se replient en résumé. */
  collapsed: boolean;
  onExpand: () => void;
  hasSession: boolean;
}

export function equipmentSummary(count: number): string {
  return count === 0 ? 'Poids du corps uniquement' : plural(count, 'équipement');
}

export function settingsSummary(settings: Settings): string {
  const type = WORKOUT_TYPES.find((t) => t.id === settings.typeId);
  const known = settings.equipment.filter((id) => EQUIPMENT.some((e) => e.id === id)).length;
  return [type?.label ?? '', `${settings.duration} min`, known === 0 ? 'poids du corps' : plural(known, 'équipement')]
    .filter(Boolean)
    .join(' · ');
}

export function SettingsPanel({ settings, onChange, onGenerate, collapsed, onExpand, hasSession }: SettingsPanelProps) {
  return (
    <section className={`settings${collapsed ? ' is-collapsed' : ''}`} aria-labelledby="settings-title">
      {hasSession && (
        <div className="settings-summary card">
          <div>
            <p className="eyebrow">Réglages</p>
            <p className="settings-summary-text">{settingsSummary(settings)}</p>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-small"
            onClick={onExpand}
            aria-controls="settings-body"
            aria-expanded={!collapsed}
          >
            {collapsed ? 'Modifier' : 'Masquer'}
          </button>
        </div>
      )}

      <div className="settings-body" id="settings-body">
        <h2 id="settings-title" className="visually-hidden">
          Réglages de la séance
        </h2>
        <TypePicker value={settings.typeId} onChange={(typeId) => onChange({ typeId })} />
        <DurationPicker value={settings.duration} onChange={(duration) => onChange({ duration })} />
        <EquipmentPicker
          selected={settings.equipment}
          collapsed={settings.equipmentCollapsed}
          onChange={(equipment) => onChange({ equipment })}
          onCollapsedChange={(equipmentCollapsed) => onChange({ equipmentCollapsed })}
        />
        <button type="button" className="btn btn-primary btn-generate" onClick={onGenerate}>
          {hasSession ? 'Générer une nouvelle séance' : 'Générer mon entraînement'}
        </button>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function TypePicker({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const name = useId();
  return (
    <fieldset className="field" id="type-picker">
      <legend className="field-title">
        <span className="step">1</span> Type d’entraînement
      </legend>
      <div className="type-grid">
        {WORKOUT_TYPES.map((type) => (
          <label key={type.id} className={`type-card${type.id === value ? ' is-selected' : ''}`}>
            <input
              type="radio"
              name={name}
              value={type.id}
              checked={type.id === value}
              onChange={() => onChange(type.id)}
              className="visually-hidden"
            />
            <span className="type-icon" aria-hidden="true">
              {type.icon}
            </span>
            <span className="type-text">
              <span className="type-label">{type.label}</span>
              <span className="type-desc">{type.description}</span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/* ------------------------------------------------------------------ */

function DurationPicker({ value, onChange }: { value: number; onChange: (minutes: number) => void }) {
  const id = useId();
  const percent = ((value - DURATION_MIN) / (DURATION_MAX - DURATION_MIN)) * 100;
  return (
    <div className="field" role="group" aria-labelledby={`${id}-title`}>
      <div className="field-head">
        <h3 className="field-title" id={`${id}-title`}>
          <span className="step">2</span> Durée
        </h3>
        <output className="duration-value" htmlFor={id} aria-live="polite">
          {value} <span>min</span>
        </output>
      </div>
      <input
        id={id}
        type="range"
        className="range"
        min={DURATION_MIN}
        max={DURATION_MAX}
        step={DURATION_STEP}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-valuetext={`${value} minutes`}
        aria-label="Durée en minutes"
        style={{ '--fill': `${percent}%` } as CSSProperties}
      />
      <div className="range-scale" aria-hidden="true">
        <span>{DURATION_MIN} min</span>
        <span>{DURATION_MAX} min</span>
      </div>
      <div className="chips" role="group" aria-label="Raccourcis de durée">
        {DURATION_SHORTCUTS.map((minutes) => (
          <button
            key={minutes}
            type="button"
            className={`chip${minutes === value ? ' is-active' : ''}`}
            aria-pressed={minutes === value}
            onClick={() => onChange(minutes)}
          >
            {minutes} min
          </button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

interface EquipmentPickerProps {
  selected: string[];
  collapsed: boolean;
  onChange: (ids: string[]) => void;
  onCollapsedChange: (collapsed: boolean) => void;
}

function groupByCategory(items: Equipment[]) {
  const groups = EQUIPMENT_CATEGORIES.map((c) => ({ ...c, items: items.filter((e) => e.category === c.id) }));
  const known = new Set(EQUIPMENT_CATEGORIES.map((c) => c.id));
  const others = items.filter((e) => !known.has(e.category));
  if (others.length) groups.push({ id: 'autres', label: 'Autres', items: others });
  return groups.filter((g) => g.items.length > 0);
}

function EquipmentPicker({ selected, collapsed, onChange, onCollapsedChange }: EquipmentPickerProps) {
  const id = useId();
  const selectedSet = new Set(selected);
  const count = EQUIPMENT.filter((e) => selectedSet.has(e.id)).length;

  const toggle = (equipmentId: string, checked: boolean) => {
    const next = new Set(selected);
    if (checked) next.add(equipmentId);
    else next.delete(equipmentId);
    // On garde l'ordre de `equipment.ts`.
    onChange(EQUIPMENT.filter((e) => next.has(e.id)).map((e) => e.id));
  };

  if (collapsed) {
    return (
      <div className="field">
        <h3 className="field-title">
          <span className="step">3</span> Équipement disponible
        </h3>
        <div className="equipment-summary">
          <span className="equipment-summary-icons" aria-hidden="true">
            {EQUIPMENT.filter((e) => selectedSet.has(e.id)).map((e) => (
              <span key={e.id}>{e.icon}</span>
            ))}
          </span>
          <span className="equipment-summary-text">{equipmentSummary(count)}</span>
          <button type="button" className="btn btn-ghost btn-small" onClick={() => onCollapsedChange(false)}>
            Modifier
          </button>
        </div>
      </div>
    );
  }

  return (
    <fieldset className="field" aria-describedby={`${id}-hint`}>
      <legend className="field-title">
        <span className="step">3</span> Équipement disponible
      </legend>
      <div className="equipment-toolbar">
        <span className="muted">{count === 0 ? 'Rien de coché' : `${plural(count, 'coché')} sur ${EQUIPMENT.length}`}</span>
        <div className="equipment-actions">
          <button type="button" className="btn btn-ghost btn-small" onClick={() => onChange(EQUIPMENT.map((e) => e.id))}>
            Tout cocher
          </button>
          <button type="button" className="btn btn-ghost btn-small" onClick={() => onChange([])}>
            Tout décocher
          </button>
          <button type="button" className="btn btn-ghost btn-small" onClick={() => onCollapsedChange(true)}>
            Replier
          </button>
        </div>
      </div>
      {groupByCategory(EQUIPMENT).map((group) => (
        <div key={group.id} className="equipment-group" role="group" aria-label={group.label}>
          <p className="equipment-group-title">{group.label}</p>
          <div className="equipment-grid">
            {group.items.map((item) => (
              <label key={item.id} className={`equipment-chip${selectedSet.has(item.id) ? ' is-checked' : ''}`}>
                <input
                  type="checkbox"
                  className="checkbox"
                  checked={selectedSet.has(item.id)}
                  onChange={(e) => toggle(item.id, e.target.checked)}
                />
                <span className="equipment-icon" aria-hidden="true">
                  {item.icon}
                </span>
                <span className="equipment-label">{item.label}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
      <p className="hint" id={`${id}-hint`}>
        Le poids du corps est toujours disponible : rien de coché, ça marche aussi.
      </p>
    </fieldset>
  );
}

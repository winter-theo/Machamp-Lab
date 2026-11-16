import type { CSSProperties } from 'react';
import { EQUIPMENT } from '../data/equipment';
import { MACHAMP_TEXT } from '../data/tips';
import { WORKOUT_TYPES } from '../data/workoutTypes';
import { plannedSplit } from '../lib/generator';
import type { Settings } from '../lib/storage';
import { PixelSprite } from './Pixel';

const FEATURES = [
  { icon: '🧩', title: 'Une séance complète', text: 'Échauffement, séance et retour au calme, calés sur ta durée.' },
  { icon: '☑️', title: 'Coche en direct', text: 'Une case par série ou par tour, sauvegardée sur cet appareil.' },
  { icon: '⇄', title: 'Pas fan d’un exercice ?', text: 'Remplace-le par un autre du même type de mouvement.' },
  { icon: '🎲', title: 'Jamais la même', text: 'Relance pour obtenir une nouvelle combinaison.' },
];

/**
 * Accueil affiché sur ordinateur avant la première génération (à droite des réglages) :
 * un aperçu en direct de la séance qui va être générée.
 */
export function Welcome({ settings }: { settings: Settings }) {
  const type = WORKOUT_TYPES.find((t) => t.id === settings.typeId) ?? WORKOUT_TYPES[0];
  const split = plannedSplit(settings.duration, type.maxMinutes);
  const equipment = EQUIPMENT.filter((e) => settings.equipment.includes(e.id));
  const segments = [
    { id: 'warmup', label: 'Échauffement', minutes: split.warmup },
    { id: 'main', label: type.label, minutes: split.main },
    { id: 'extra', label: 'Cardio modéré', minutes: split.extra },
    { id: 'cooldown', label: 'Retour au calme', minutes: split.cooldown },
  ].filter((s) => s.minutes > 0);

  return (
    <div className="welcome">
      <div className="welcome-hero">
        <PixelSprite height={120} className="welcome-sprite" />
        <div className="welcome-box">
          <p className="welcome-title">Prêt, champion ?</p>
          <p className="welcome-text">{MACHAMP_TEXT.emptyState}</p>
        </div>
      </div>

      <section className="welcome-preview" aria-labelledby="welcome-preview-title">
        <p className="eyebrow" id="welcome-preview-title">
          Aperçu de ta séance
        </p>
        <div className="welcome-summary">
          <span className="welcome-type-icon" aria-hidden="true">
            {type.icon}
          </span>
          <div className="welcome-type">
            <p className="welcome-type-label">{type.label}</p>
            <p className="welcome-type-desc">{type.description}</p>
          </div>
          <p className="welcome-duration">
            {settings.duration}
            <span> min</span>
          </p>
        </div>

        <div className="timeline" aria-hidden="true">
          {segments.map((s) => (
            <span key={s.id} className={`timeline-seg seg-${s.id}`} style={{ flexGrow: s.minutes } as CSSProperties} />
          ))}
        </div>
        <ul className="timeline-legend">
          {segments.map((s) => (
            <li key={s.id}>
              <span className={`legend-dot seg-${s.id}`} aria-hidden="true" />
              {s.label}
              <strong>≈ {s.minutes} min</strong>
            </li>
          ))}
        </ul>

        <div className="welcome-equipment">
          {equipment.length === 0 ? (
            <span className="welcome-chip">🤸 Poids du corps uniquement</span>
          ) : (
            equipment.map((e) => (
              <span key={e.id} className="welcome-chip">
                <span aria-hidden="true">{e.icon}</span> {e.label}
              </span>
            ))
          )}
        </div>
      </section>

      <ul className="welcome-features">
        {FEATURES.map((f) => (
          <li key={f.title}>
            <span className="welcome-feature-icon" aria-hidden="true">
              {f.icon}
            </span>
            <span>
              <strong>{f.title}</strong>
              <span>{f.text}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

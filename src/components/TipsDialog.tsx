import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { BONUS_TIPS, FREQUENCY_RANGE, MACHAMP_TEXT, WEEK_DAYS } from '../data/tips';
import { WORKOUT_TYPES } from '../data/workoutTypes';
import { frequencyRule, weeklyText } from '../lib/frequency';
import { useTypewriter } from '../lib/hooks';
import { loadFrequency, saveFrequency } from '../lib/storage';
import { PixelArrow, PixelClose, PixelSprite } from './Pixel';

interface TipsDialogProps {
  open: boolean;
  onClose: () => void;
  /** Toucher un jour de l'exemple de semaine présélectionne ce type de séance. */
  onPickType: (typeId: string) => void;
}

function randomTip(except?: number): number {
  if (BONUS_TIPS.length < 2) return 0;
  let next = Math.floor(Math.random() * BONUS_TIPS.length);
  while (next === except) next = Math.floor(Math.random() * BONUS_TIPS.length);
  return next;
}

export function TipsDialog({ open, onClose, onPickType }: TipsDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<Element | null>(null);
  const [frequency, setFrequency] = useState(loadFrequency);
  const [tip, setTip] = useState(() => randomTip());
  const intro = useTypewriter(MACHAMP_TEXT.dialogIntro, open);

  // Ouverture / fermeture de la vraie boîte de dialogue modale (focus piégé, Échap).
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      openerRef.current = document.activeElement;
      dialog.showModal();
      setTip((current) => randomTip(current));
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const handleClose = () => {
      onClose();
      const opener = openerRef.current;
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus();
    };
    dialog.addEventListener('close', handleClose);
    return () => dialog.removeEventListener('close', handleClose);
  }, [onClose]);

  const change = (value: number) => {
    const next = Math.min(FREQUENCY_RANGE.max, Math.max(FREQUENCY_RANGE.min, value));
    setFrequency(next);
    saveFrequency(next);
  };

  const rule = frequencyRule(frequency);
  const remaining = [...MACHAMP_TEXT.dialogIntro].slice([...intro.shown].length).join('');

  return (
    <dialog
      ref={ref}
      className="tips-dialog"
      aria-labelledby="tips-title"
      onClick={(e) => {
        // Clic sur le fond (en dehors du panneau) : on ferme.
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="tips-panel">
        <header className="tips-header">
          <h2 id="tips-title" className="pixel-title">
            {MACHAMP_TEXT.dialogTitle}
          </h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Fermer les astuces">
            <PixelClose />
          </button>
        </header>

        <div className="poke-wrap">
          <button type="button" className="poke-box" onClick={intro.skip} autoFocus aria-label={MACHAMP_TEXT.dialogIntro}>
            <PixelSprite height={64} className="poke-box-sprite" />
            <span className="poke-box-text" aria-hidden="true">
              {intro.shown}
              <span className="poke-box-ghost">{remaining}</span>
            </span>
            <PixelArrow className={`poke-box-arrow${intro.done ? ' is-visible' : ''}`} />
          </button>
        </div>

        <div className="freq">
          <p className="freq-label" id="freq-label">
            Entraînements par mois
          </p>
          <div className="stepper">
            <button
              type="button"
              className="stepper-btn"
              onClick={() => change(frequency - 1)}
              disabled={frequency <= FREQUENCY_RANGE.min}
              aria-label="Un entraînement de moins"
            >
              −
            </button>
            <output className="stepper-value" aria-live="polite" aria-labelledby="freq-label">
              <strong>{frequency}</strong>
              <span> / mois</span>
            </output>
            <button
              type="button"
              className="stepper-btn"
              onClick={() => change(frequency + 1)}
              disabled={frequency >= FREQUENCY_RANGE.max}
              aria-label="Un entraînement de plus"
            >
              +
            </button>
          </div>
          <input
            type="range"
            className="range"
            min={FREQUENCY_RANGE.min}
            max={FREQUENCY_RANGE.max}
            step={1}
            value={frequency}
            onChange={(e) => change(Number(e.target.value))}
            aria-labelledby="freq-label"
            aria-valuetext={`${frequency} entraînements par mois`}
            style={
              {
                '--fill': `${((frequency - FREQUENCY_RANGE.min) / (FREQUENCY_RANGE.max - FREQUENCY_RANGE.min)) * 100}%`,
              } as CSSProperties
            }
          />
          <p className="freq-week">{weeklyText(frequency)}</p>
        </div>

        <div className="advice" aria-live="polite">
          <p className="advice-headline">{rule.headline}</p>
          <p className="advice-detail">{rule.detail}</p>
          {rule.restNote && <p className="advice-rest">« {rule.restNote} »</p>}
        </div>

        <div className="week">
          <p className="week-title">{MACHAMP_TEXT.weekTitle}</p>
          <ol className="week-grid">
            {WEEK_DAYS.map((day, i) => {
              const type = WORKOUT_TYPES.find((t) => t.id === rule.week[i]);
              return (
                <li key={day.long}>
                  {type ? (
                    <button type="button" className="day is-training" onClick={() => onPickType(type.id)}>
                      <span className="day-letter" aria-hidden="true">
                        {day.short}
                      </span>
                      <span className="day-icon" aria-hidden="true">
                        {type.icon}
                      </span>
                      <span className="day-label" aria-hidden="true">
                        {type.shortLabel ?? type.label}
                      </span>
                      <span className="visually-hidden">
                        {day.long} : {type.label}. Préparer cette séance.
                      </span>
                    </button>
                  ) : (
                    <div className="day is-rest">
                      <span className="day-letter" aria-hidden="true">
                        {day.short}
                      </span>
                      <span className="day-icon" aria-hidden="true">
                        💤
                      </span>
                      <span className="day-label" aria-hidden="true">
                        Repos
                      </span>
                      <span className="visually-hidden">{day.long} : repos.</span>
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
          <p className="hint">{MACHAMP_TEXT.weekHint}</p>
        </div>

        <div className="bonus">
          <p className="bonus-title">
            <span aria-hidden="true">💡</span> {MACHAMP_TEXT.bonusTitle}
          </p>
          <p className="bonus-text" aria-live="polite">
            {BONUS_TIPS[tip]}
          </p>
          <button type="button" className="btn btn-ghost btn-small" onClick={() => setTip((t) => randomTip(t))}>
            Autre astuce
          </button>
        </div>
      </div>
    </dialog>
  );
}

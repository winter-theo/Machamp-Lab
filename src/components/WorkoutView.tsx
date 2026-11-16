import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import { EQUIPMENT } from '../data/equipment';
import { MOVEMENT_LABELS } from '../data/exercises';
import { MACHAMP_TEXT } from '../data/tips';
import { getAlternatives } from '../lib/generator';
import { formatCircuit, formatMinutes, formatMove, formatPrescription, formatRest } from '../lib/format';
import { prefersReducedMotion } from '../lib/hooks';
import type { SavedSession } from '../lib/storage';
import {
  itemChecks,
  itemsSeconds,
  workoutProgress,
  workoutSeconds,
  type CircuitItem,
  type ExerciseItem,
  type WorkoutItem,
} from '../lib/workout';
import { PixelSprite } from './Pixel';

const equipmentById = new Map(EQUIPMENT.map((e) => [e.id, e]));

function equipmentText(ids: string[]): string {
  if (ids.length === 0) return 'Poids du corps';
  return ids.map((id) => equipmentById.get(id)?.label ?? id).join(' + ');
}

function equipmentIcon(ids: string[]): string {
  return ids.length === 0 ? '🤸' : (equipmentById.get(ids[0])?.icon ?? '🏋️');
}

interface WorkoutViewProps {
  session: SavedSession;
  onToggleBox: (uid: string, index: number, checked: boolean) => void;
  onToggleItem: (uid: string, checked: boolean) => void;
  onReplace: (uid: string) => void;
  onReroll: () => void;
  onReset: () => void;
}

export function WorkoutView({ session, onToggleBox, onToggleItem, onReplace, onReroll, onReset }: WorkoutViewProps) {
  const { workout, checks } = session;
  const progress = workoutProgress(workout, checks);
  const complete = progress.total > 0 && progress.done === progress.total;
  const started = Object.values(checks).some((boxes) => boxes.some(Boolean));

  // Exercices remplaçables (calculé une fois par séance)
  const replaceable = useMemo(() => {
    const result = new Set<string>();
    for (const section of workout.sections) {
      for (const item of section.items) {
        const uids = item.kind === 'circuit' ? item.moves.map((m) => m.uid) : [item.uid];
        uids.forEach((uid) => getAlternatives(workout, uid).length > 0 && result.add(uid));
      }
    }
    return result;
  }, [workout]);

  return (
    <section className="workout" aria-labelledby="workout-title">
      <header className="workout-header">
        <div>
          <p className="eyebrow">Ta séance</p>
          <h2 id="workout-title" className="workout-title">
            {workout.typeLabel} · {workout.duration} min
          </h2>
          <p className="workout-estimate">
            Durée estimée : <strong>≈ {formatMinutes(workoutSeconds(workout))}</strong>
          </p>
        </div>
        <div className="workout-actions">
          <ConfirmButton className="btn btn-secondary" needsConfirm={started} onConfirm={onReroll} confirmLabel="Sûr ? Re-touche">
            <span aria-hidden="true">🎲</span> Relancer
          </ConfirmButton>
          <ConfirmButton className="btn btn-ghost" needsConfirm={started && !complete} onConfirm={onReset} confirmLabel="Sûr ? Re-touche">
            Nouvelle séance
          </ConfirmButton>
        </div>
      </header>

      {workout.notices.length > 0 && (
        <div className="notices">
          {workout.notices.map((notice) => (
            <MachampNote key={notice}>{notice}</MachampNote>
          ))}
        </div>
      )}

      <div className="progress" role="group" aria-label="Progression">
        <div className="progress-text">
          <span>
            <strong>{progress.done}</strong> / {progress.total} exercices
          </span>
          <span className="muted">{Math.round(progress.ratio * 100)} %</span>
        </div>
        <div
          className="progress-track"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={progress.total}
          aria-valuenow={progress.done}
          aria-valuetext={`${progress.done} exercices sur ${progress.total}`}
        >
          <div className="progress-fill" style={{ width: `${progress.ratio * 100}%` }} />
        </div>
      </div>

      {workout.sections.map((section) =>
        section.items.length === 0 ? null : (
          <section key={section.id} className={`workout-section section-${section.id}`} aria-labelledby={`section-${section.id}`}>
            <h3 className="section-title" id={`section-${section.id}`}>
              {section.title}
              <span className="section-time">≈ {formatMinutes(itemsSeconds(section.items))}</span>
            </h3>
            <div className="cards">
              {section.items.map((item) => (
                <ItemCard
                  key={item.uid}
                  item={item}
                  boxes={itemChecks(item, checks)}
                  replaceable={replaceable}
                  onToggleBox={onToggleBox}
                  onToggleItem={onToggleItem}
                  onReplace={onReplace}
                />
              ))}
            </div>
          </section>
        ),
      )}

      {complete && <Congrats onReset={onReset} />}
    </section>
  );
}

/* ------------------------------------------------------------------ */

function MachampNote({ children }: { children: string }) {
  return (
    <div className="machamp-note">
      <PixelSprite height={40} className="machamp-note-sprite" />
      <p className="machamp-note-text">{children}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */

interface ConfirmButtonProps {
  className: string;
  needsConfirm: boolean;
  onConfirm: () => void;
  confirmLabel: string;
  children: ReactNode;
}

/** Bouton qui demande une seconde pression quand une action ferait perdre la progression. */
function ConfirmButton({ className, needsConfirm, onConfirm, confirmLabel, children }: ConfirmButtonProps) {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!armed) return;
    const timer = window.setTimeout(() => setArmed(false), 4000);
    return () => window.clearTimeout(timer);
  }, [armed]);
  return (
    <button
      type="button"
      className={`${className}${armed ? ' is-armed' : ''}`}
      onClick={() => {
        if (needsConfirm && !armed) {
          setArmed(true);
          return;
        }
        setArmed(false);
        onConfirm();
      }}
      aria-live="polite"
    >
      {armed ? confirmLabel : children}
    </button>
  );
}

/* ------------------------------------------------------------------ */

interface ItemCardProps {
  item: WorkoutItem;
  boxes: boolean[];
  replaceable: Set<string>;
  onToggleBox: (uid: string, index: number, checked: boolean) => void;
  onToggleItem: (uid: string, checked: boolean) => void;
  onReplace: (uid: string) => void;
}

function ItemCard(props: ItemCardProps) {
  return props.item.kind === 'circuit' ? (
    <CircuitCard {...props} item={props.item} />
  ) : (
    <ExerciseCard {...props} item={props.item} />
  );
}

function ReplaceButton({ uid, name, pattern, enabled, onReplace }: {
  uid: string;
  name: string;
  pattern: string;
  enabled: boolean;
  onReplace: (uid: string) => void;
}) {
  return (
    <button
      type="button"
      className="btn btn-ghost btn-small btn-replace"
      onClick={() => onReplace(uid)}
      disabled={!enabled}
      aria-label={`Remplacer ${name}`}
      title={enabled ? `Un autre exercice : ${pattern}` : 'Aucune alternative avec ton équipement'}
    >
      <span aria-hidden="true">⇄</span>
      <span className="btn-replace-text">Remplacer</span>
    </button>
  );
}

function MainCheck({ id, checked, onChange }: { id: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <span className="check-hit">
      <input
        id={id}
        type="checkbox"
        className="checkbox checkbox-lg"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
    </span>
  );
}

function SetBoxes({ uid, boxes, label, name, onToggleBox }: {
  uid: string;
  boxes: boolean[];
  label: string;
  name: string;
  onToggleBox: (uid: string, index: number, checked: boolean) => void;
}) {
  if (boxes.length <= 1) return null;
  return (
    <div className="sets" role="group" aria-label={`${label}s : ${name}`}>
      <span className="sets-label" aria-hidden="true">
        {label}s
      </span>
      {boxes.map((checked, i) => (
        <label key={i} className={`set-box${checked ? ' is-checked' : ''}`}>
          <input
            type="checkbox"
            className="checkbox"
            checked={checked}
            onChange={(e) => onToggleBox(uid, i, e.target.checked)}
            aria-label={`${label} ${i + 1} sur ${boxes.length} — ${name}`}
          />
          <span className="set-num" aria-hidden="true">
            {i + 1}
          </span>
        </label>
      ))}
    </div>
  );
}

function ExerciseCard({ item, boxes, replaceable, onToggleBox, onToggleItem, onReplace }: ItemCardProps & { item: ExerciseItem }) {
  const id = useId();
  const done = boxes.every(Boolean);
  const rest = formatRest(item.prescription);
  const boxLabel = item.prescription.kind === 'intervals' ? 'Répétition' : 'Série';
  return (
    <article className={`exercise-card${done ? ' is-done' : ''}${item.role === 'filler' ? ' is-filler' : ''}`}>
      <div className="exercise-head">
        <MainCheck id={id} checked={done} onChange={(checked) => onToggleItem(item.uid, checked)} />
        <div className="exercise-title">
          {item.role === 'filler' && <span className="badge">Bloc complémentaire</span>}
          <label htmlFor={id} className="exercise-name">
            {item.name}
          </label>
          <p className="prescription">
            <strong>{formatPrescription(item.prescription)}</strong>
            {rest && <span className="rest"> · {rest}</span>}
          </p>
        </div>
        <ReplaceButton
          uid={item.uid}
          name={item.name}
          pattern={MOVEMENT_LABELS[item.pattern] ?? item.pattern}
          enabled={replaceable.has(item.uid)}
          onReplace={onReplace}
        />
      </div>
      <ul className="exercise-meta">
        <li>
          <span aria-hidden="true">{equipmentIcon(item.equipment)}</span> {equipmentText(item.equipment)}
        </li>
        <li>
          <span aria-hidden="true">🔥</span> {item.intensity}
        </li>
      </ul>
      <p className="cue">{item.cue}</p>
      <SetBoxes uid={item.uid} boxes={boxes} label={boxLabel} name={item.name} onToggleBox={onToggleBox} />
    </article>
  );
}

function CircuitCard({ item, boxes, replaceable, onToggleBox, onToggleItem, onReplace }: ItemCardProps & { item: CircuitItem }) {
  const id = useId();
  const done = boxes.every(Boolean);
  return (
    <article className={`exercise-card circuit-card${done ? ' is-done' : ''}`}>
      <div className="exercise-head">
        <MainCheck id={id} checked={done} onChange={(checked) => onToggleItem(item.uid, checked)} />
        <div className="exercise-title">
          <label htmlFor={id} className="exercise-name">
            {item.title}
            <span className="badge">{item.moves.length} exercices</span>
          </label>
          <p className="prescription">
            <strong>{formatCircuit(item)}</strong>
          </p>
        </div>
      </div>
      <p className="exercise-meta single">
        <span aria-hidden="true">🔥</span> {item.intensity}
      </p>
      <ol className="moves">
        {item.moves.map((move) => (
          <li key={move.uid} className="move">
            <div className="move-head">
              <span className="move-name">{move.name}</span>
              <span className="move-time">{formatMove(move, item)}</span>
              <ReplaceButton
                uid={move.uid}
                name={move.name}
                pattern={MOVEMENT_LABELS[move.pattern] ?? move.pattern}
                enabled={replaceable.has(move.uid)}
                onReplace={onReplace}
              />
            </div>
            <p className="cue">{move.cue}</p>
            {move.equipment.length > 0 && (
              <p className="move-equipment">
                <span aria-hidden="true">{equipmentIcon(move.equipment)}</span> {equipmentText(move.equipment)}
              </p>
            )}
          </li>
        ))}
      </ol>
      <SetBoxes uid={item.uid} boxes={boxes} label="Tour" name={item.title} onToggleBox={onToggleBox} />
    </article>
  );
}

/* ------------------------------------------------------------------ */

function Congrats({ onReset }: { onReset: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'center' });
  }, []);
  return (
    <div className="congrats" ref={ref} role="status">
      <div className="congrats-stage" aria-hidden="true">
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i} className={`spark spark-${i}`} />
        ))}
        <PixelSprite height={96} className="congrats-sprite" />
      </div>
      <p className="congrats-title">{MACHAMP_TEXT.congratsTitle}</p>
      <p className="congrats-text">{MACHAMP_TEXT.congratsText}</p>
      <button type="button" className="btn btn-primary" onClick={onReset}>
        Nouvelle séance
      </button>
    </div>
  );
}

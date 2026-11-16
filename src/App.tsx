import { useCallback, useEffect, useRef, useState } from 'react';
import { MACHAMP_TEXT } from './data/tips';
import { Mascot } from './components/Mascot';
import { PixelSprite } from './components/Pixel';
import { SettingsPanel } from './components/SettingsPanel';
import { TipsDialog } from './components/TipsDialog';
import { Welcome } from './components/Welcome';
import { WorkoutView } from './components/WorkoutView';
import { generateWorkout, replaceExercise } from './lib/generator';
import { prefersReducedMotion, useFitsViewport, useMediaQuery } from './lib/hooks';
import {
  loadSession,
  loadSettings,
  saveSession,
  saveSettings,
  type SavedSession,
  type Settings,
} from './lib/storage';
import { boxCount, findItem, itemChecks } from './lib/workout';

function scrollToElement(element: Element | null) {
  element?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
}

export default function App() {
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [session, setSession] = useState<SavedSession | null>(loadSession);
  // Sur mobile, les réglages se replient en résumé quand une séance est affichée.
  const [settingsCollapsed, setSettingsCollapsed] = useState(() => session !== null);
  const [tipsOpen, setTipsOpen] = useState(false);
  const sessionRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const pendingScroll = useRef<'session' | 'settings' | null>(null);
  // Ordinateur : la colonne des réglages reste visible pendant le défilement si elle tient à l'écran.
  const isDesktop = useMediaQuery('(min-width: 960px)');
  const settingsFits = useFitsViewport(settingsRef, isDesktop);

  useEffect(() => saveSettings(settings), [settings]);
  useEffect(() => saveSession(session), [session]);

  // Défilement après le rendu (une fois les réglages repliés ou dépliés).
  useEffect(() => {
    if (pendingScroll.current === 'session') scrollToElement(sessionRef.current);
    if (pendingScroll.current === 'settings') scrollToElement(settingsRef.current);
    pendingScroll.current = null;
  });

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((current) => ({ ...current, ...patch }));
  }, []);

  const generate = () => {
    const workout = generateWorkout({
      typeId: settings.typeId,
      duration: settings.duration,
      equipment: settings.equipment,
    });
    setSession({ workout, checks: {} });
    setSettings((current) => ({ ...current, equipmentCollapsed: true }));
    setSettingsCollapsed(true);
    pendingScroll.current = 'session';
  };

  const reset = () => {
    setSession(null);
    setSettingsCollapsed(false);
    pendingScroll.current = 'settings';
  };

  const toggleBox = (uid: string, index: number, checked: boolean) => {
    setSession((current) => {
      if (!current) return current;
      const item = findItem(current.workout, uid);
      if (!item) return current;
      const boxes = itemChecks(item, current.checks);
      boxes[index] = checked;
      return { ...current, checks: { ...current.checks, [uid]: boxes } };
    });
  };

  const toggleItem = (uid: string, checked: boolean) => {
    setSession((current) => {
      if (!current) return current;
      const item = findItem(current.workout, uid);
      if (!item) return current;
      const boxes = Array.from({ length: boxCount(item) }, () => checked);
      return { ...current, checks: { ...current.checks, [uid]: boxes } };
    });
  };

  const replace = (uid: string) => {
    setSession((current) => {
      if (!current) return current;
      const workout = replaceExercise(current.workout, uid);
      if (!workout) return current;
      const checks = { ...current.checks };
      // Un exercice remplacé repart à zéro (un mouvement de circuit garde les tours cochés).
      if (!findItem(workout, uid)) delete checks[uid];
      return { workout, checks };
    });
  };

  const pickType = (typeId: string) => {
    updateSettings({ typeId });
    setTipsOpen(false);
    setSettingsCollapsed(false);
    pendingScroll.current = 'settings';
  };

  const closeTips = useCallback(() => setTipsOpen(false), []);

  return (
    <div className="app">
      <header className="app-header">
        <PixelSprite height={48} className="logo-sprite" />
        <div>
          <h1 className="app-title">
            Machamp <span>Lab</span>
          </h1>
          <p className="app-tagline">Ton entraînement sur mesure, selon ton temps et ton matériel.</p>
        </div>
      </header>

      <main className={`layout${session ? ' has-session' : ''}`}>
        <div className={`col-settings${isDesktop && settingsFits ? ' is-sticky' : ''}`} ref={settingsRef}>
          <SettingsPanel
            settings={settings}
            onChange={updateSettings}
            onGenerate={generate}
            collapsed={settingsCollapsed && session !== null}
            onExpand={() => setSettingsCollapsed((c) => !c)}
            hasSession={session !== null}
          />
        </div>

        <div className="col-session" ref={sessionRef}>
          {session ? (
            <WorkoutView
              session={session}
              onToggleBox={toggleBox}
              onToggleItem={toggleItem}
              onReplace={replace}
              onReroll={generate}
              onReset={reset}
            />
          ) : (
            <>
              <div className="empty-state">
                <PixelSprite height={96} className="empty-sprite" />
                <p>{MACHAMP_TEXT.emptyState}</p>
              </div>
              <Welcome settings={settings} />
            </>
          )}
        </div>
      </main>

      <footer className="app-footer">
        <p>Suggestions générales : écoute ton corps et adapte les charges.</p>
      </footer>

      <Mascot onOpen={() => setTipsOpen(true)} />
      <TipsDialog open={tipsOpen} onClose={closeTips} onPickType={pickType} />
    </div>
  );
}

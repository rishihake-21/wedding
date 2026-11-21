import { useEffect } from 'react';
import { content } from './content/content';
import { DEV_FLAGS } from './core/devFlags';
import { Experience } from './core/Experience';
import { SCENE_META } from './core/layout';
import { useAppStore } from './core/store';
import { LiteExperience } from './lite/LiteExperience';
import { detectInitialQualityTier } from './shared/quality';
import { DiyaFlash } from './ui/DiyaFlash';
import { EntryGate } from './ui/EntryGate';
import { InAppBrowserBanner, ScreenReaderMirror, WebGLRecoveryModal } from './ui/FallbacksAndA11y';
import { Hud } from './ui/Hud';
import { SceneOverlays } from './ui/SceneOverlays';
import { WeddingDayView } from './ui/WeddingDayView';

export default function App() {
  const language = useAppStore((s) => s.language);
  const quality = useAppStore((s) => s.quality);
  const stage = useAppStore((s) => s.stage);
  const activeScene = useAppStore((s) => s.activeScene);
  const weddingDayMode = useAppStore((s) => s.weddingDayMode);

  // Sync document language and title
  useEffect(() => {
    document.documentElement.lang = language;
    document.title = content.meta.title[language];
  }, [language]);

  // Run GPU / data-saver / WebGL detection once at startup
  useEffect(() => {
    if (DEV_FLAGS.forcedQuality) return;
    let active = true;
    void detectInitialQualityTier().then((tier) => {
      if (active) useAppStore.getState().setDetectedQuality(tier);
    });
    return () => {
      active = false;
    };
  }, []);

  // Listen to OS prefers-reduced-motion changes live
  useEffect(() => {
    const mql = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!mql) return;
    const onChange = (e: MediaQueryListEvent) => useAppStore.getState().setReducedMotion(e.matches);
    mql.addEventListener?.('change', onChange);
    return () => mql.removeEventListener?.('change', onChange);
  }, []);

  const isLite = quality === 'lite';
  const sceneKey = SCENE_META[activeScene]?.key ?? 'invocation';

  return (
    <div
      data-stage={stage}
      data-quality={quality}
      data-scene={sceneKey}
      className="relative h-full w-full overflow-hidden bg-midnight"
    >
      {weddingDayMode ? (
        <WeddingDayView />
      ) : isLite ? (
        <LiteExperience />
      ) : (
        <>
          <Experience />
          <SceneOverlays />
        </>
      )}

      {!weddingDayMode && <EntryGate />}
      <Hud />
      <DiyaFlash />
      <InAppBrowserBanner />
      <WebGLRecoveryModal />
      <ScreenReaderMirror />
    </div>
  );
}

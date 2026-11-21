import { useEffect, useRef, useState } from 'react';
import {
  CalendarClock,
  FastForward,
  Menu,
  Play,
  SlidersHorizontal,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { content } from '../content/content';
import { useLocalized } from '../content/useLocalized';
import { audioManager } from '../core/audio';
import { DEV_FLAGS } from '../core/devFlags';
import {
  PART_A_END_T,
  SCENE_COUNT,
  SCENE_META,
  SCENE_RANGES,
  sceneIndexOf,
  sceneStartT,
  type SceneKey,
} from '../core/layout';
import { useAppStore } from '../core/store';
import { DevOverlay } from './DevOverlay';
import { LanguageToggle } from './LanguageToggle';

const MENU_JUMPS: readonly { key: SceneKey; uiKey: 'date' | 'venue' | 'schedule' | 'families' | 'rsvp' }[] = [
  { key: 'date', uiKey: 'date' },
  { key: 'venue', uiKey: 'venue' },
  { key: 'schedule', uiKey: 'schedule' },
  { key: 'families', uiKey: 'families' },
  { key: 'rsvp', uiKey: 'rsvp' },
];

/**
 * Persistent DOM HUD above the 3D canvas (and shared with Lite Mode).
 * Minimal top bar keeps the central 3D viewport unobstructed:
 * - Left: brand monogram / title (single line)
 * - Right: Skip (during Part A), Sound toggle, Language toggle, Menu button
 * - Bottom: thin scroll progress bar + desktop keyboard navigation (ArrowUp/Down, PageUp/Down, Escape, M)
 */
export function Hud() {
  const stage = useAppStore((s) => s.stage);
  const activeScene = useAppStore((s) => s.activeScene);
  const muted = useAppStore((s) => s.muted);
  const quality = useAppStore((s) => s.quality);
  const detectedQuality = useAppStore((s) => s.detectedQuality);
  const reducedMotion = useAppStore((s) => s.reducedMotion);
  const weddingDayMode = useAppStore((s) => s.weddingDayMode);

  const toggleMuted = useAppStore((s) => s.toggleMuted);
  const setQuality = useAppStore((s) => s.setQuality);
  const setReducedMotion = useAppStore((s) => s.setReducedMotion);
  const setWeddingDayMode = useAppStore((s) => s.setWeddingDayMode);
  const startCinematic = useAppStore((s) => s.startCinematic);
  const jumpTo = useAppStore((s) => s.jumpTo);

  const l = useLocalized();
  const [menuOpen, setMenuOpen] = useState(false);
  const progressFillRef = useRef<HTMLDivElement>(null);

  const isLite = quality === 'lite';

  // Update the thin progress bar imperatively via store subscription (zero 60fps React re-renders)
  useEffect(() => {
    const syncBar = () => {
      const el = progressFillRef.current;
      if (!el) return;
      const t = useAppStore.getState().t;
      el.style.transform = `scaleX(${Math.max(0.02, Math.min(1, t))})`;
    };
    syncBar();
    return useAppStore.subscribe(syncBar);
  }, []);

  // Desktop keyboard navigation (ArrowDown / ArrowUp / PageDown / PageUp / Escape / M)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTyping =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);

      if (e.key === 'Escape' && menuOpen) {
        setMenuOpen(false);
        return;
      }
      if (isTyping) return;

      if (e.key === 'm' || e.key === 'M') {
        const nextMuted = !useAppStore.getState().muted;
        useAppStore.getState().setMuted(nextMuted);
        audioManager.setMuted(nextMuted);
        return;
      }

      const s = useAppStore.getState();
      if (s.stage !== 'journey' || s.quality === 'lite' || s.weddingDayMode) return;

      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        const nextIdx = Math.min(SCENE_COUNT - 1, s.activeScene + 1);
        const [start, end] = SCENE_RANGES[nextIdx];
        s.jumpTo(start + (end - start) * 0.35);
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        const minIdx = s.journeyFromT >= PART_A_END_T ? 4 : 0;
        const prevIdx = Math.max(minIdx, s.activeScene - 1);
        const [start, end] = SCENE_RANGES[prevIdx];
        s.jumpTo(start + (end - start) * 0.35);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  const handleToggleSound = () => {
    const next = !muted;
    toggleMuted();
    audioManager.setMuted(next);
  };

  const handleJump = (key: SceneKey) => {
    setMenuOpen(false);
    if (isLite) {
      setWeddingDayMode(false);
      const section = document.getElementById(`lite-${key}`);
      section?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
      return;
    }
    const idx = sceneIndexOf(key);
    const [start, end] = SCENE_RANGES[idx];
    // Aim at 35% into the scene where focusWeight & bloom/reveal look best
    jumpTo(start + (end - start) * 0.35);
  };

  const handleSkipIntro = () => {
    jumpTo(sceneStartT(4) + (SCENE_RANGES[4][1] - SCENE_RANGES[4][0]) * 0.35);
  };

  const handleToggleLite = () => {
    setMenuOpen(false);
    if (isLite) {
      setQuality(detectedQuality === 'lite' ? 'low' : detectedQuality);
    } else {
      setQuality('lite');
    }
  };

  if (stage === 'gate' && !weddingDayMode) {
    return DEV_FLAGS.showDebug ? <DevOverlay /> : null;
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-20">
      {/* Persistent minimal top navigation bar */}
      <header className="pointer-events-auto flex items-center justify-between gap-3 bg-gradient-to-b from-midnight/95 via-midnight/60 to-transparent px-3 pb-4 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-5">
        <button
          type="button"
          onClick={() => handleJump('date')}
          className="min-h-[44px] text-left font-display text-base font-semibold tracking-wide text-gold transition-colors hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold whitespace-nowrap shrink-0 sm:text-lg"
        >
          {l(content.couple.groom.name)} &amp; {l(content.couple.bride.name)}
        </button>

        <div className="flex items-center gap-2 shrink-0">
          {stage === 'cinematic' && !isLite && !weddingDayMode && (
            <button
              type="button"
              onClick={handleSkipIntro}
              className="flex min-h-[44px] items-center gap-1.5 rounded-lg bg-gold px-3.5 text-sm font-semibold text-midnight transition-colors hover:bg-[#E2B854] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream whitespace-nowrap shrink-0"
            >
              <FastForward className="h-4 w-4" />
              <span>{l(content.ui.skip)}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleToggleSound}
            aria-pressed={!muted}
            aria-label={muted ? l(content.ui.soundOff) : l(content.ui.soundOn)}
            className="flex h-11 w-11 items-center justify-center rounded-lg border border-gold/45 bg-[#0F1B3A] text-cream transition-colors hover:border-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold shrink-0"
          >
            {muted ? <VolumeX className="h-4 w-4 text-cream/70" /> : <Volume2 className="h-4 w-4 text-gold" />}
          </button>

          <div className="hidden sm:block">
            <LanguageToggle />
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            aria-controls="invitation-nav-drawer"
            aria-label={l(content.ui.menu)}
            className="flex min-h-[44px] items-center gap-1.5 rounded-lg border border-gold/45 bg-[#0F1B3A] px-3.5 text-sm font-medium text-cream transition-colors hover:border-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold whitespace-nowrap shrink-0"
          >
            {menuOpen ? <X className="h-4 w-4 text-gold" /> : <Menu className="h-4 w-4 text-gold" />}
            <span>{l(content.ui.menu)}</span>
          </button>
        </div>
      </header>

      {/* Navigation & Preferences Drawer */}
      {menuOpen && (
        <div
          id="invitation-nav-drawer"
          role="dialog"
          aria-label={l(content.ui.menu)}
          className="pointer-events-auto fixed right-3 top-[max(4.25rem,calc(env(safe-area-inset-top)+3.5rem))] z-30 w-72 max-w-[calc(100vw-1.5rem)] rounded-xl border border-gold/40 bg-[#0B1530] p-4 shadow-2xl sm:right-5"
        >
          <div className="mb-3 flex items-center justify-between sm:hidden">
            <span className="text-xs font-medium text-gold">{l(content.ui.language)}</span>
            <LanguageToggle />
          </div>

          <nav aria-label={l(content.ui.menu)} className="space-y-1">
            {MENU_JUMPS.map((item) => {
              const idx = sceneIndexOf(item.key);
              const isCurrent = !isLite && !weddingDayMode && activeScene === idx;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => handleJump(item.key)}
                  className={`flex min-h-[44px] w-full items-center justify-between rounded-lg px-3.5 text-left text-base transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                    isCurrent
                      ? 'bg-gold font-semibold text-midnight'
                      : 'text-cream hover:bg-[#16254A] hover:text-gold'
                  }`}
                >
                  <span>{l(content.ui[item.uiKey])}</span>
                </button>
              );
            })}
          </nav>

          <div className="mt-3 space-y-1.5 border-t border-gold/20 pt-3">
            {!isLite && (
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  startCinematic();
                }}
                className="flex min-h-[44px] w-full items-center gap-2 rounded-lg px-3.5 text-sm text-cream/90 hover:bg-[#16254A] hover:text-gold"
              >
                <Play className="h-4 w-4 text-gold" />
                <span>{l(content.ui.replayOpening)}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleToggleLite}
              aria-pressed={isLite}
              className="flex min-h-[44px] w-full items-center gap-2 rounded-lg px-3.5 text-sm text-cream/90 hover:bg-[#16254A] hover:text-gold"
            >
              <SlidersHorizontal className="h-4 w-4 text-gold" />
              <span>{isLite ? l(content.ui.full3dMode) : l(content.ui.liteMode)}</span>
            </button>

            <button
              type="button"
              onClick={() => setReducedMotion(!reducedMotion)}
              aria-pressed={reducedMotion}
              className="flex min-h-[44px] w-full items-center justify-between rounded-lg px-3.5 text-sm text-cream/90 hover:bg-[#16254A] hover:text-gold"
            >
              <span>{l(content.ui.reducedMotion)}</span>
              <span className="text-xs text-gold">{reducedMotion ? 'ON' : 'OFF'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                setWeddingDayMode(!weddingDayMode);
              }}
              aria-pressed={weddingDayMode}
              className="flex min-h-[44px] w-full items-center gap-2 rounded-lg px-3.5 text-sm text-cream/90 hover:bg-[#16254A] hover:text-gold"
            >
              <CalendarClock className="h-4 w-4 text-gold" />
              <span>{weddingDayMode ? l(content.ui.viewFullInvite) : l(content.ui.weddingDayMode)}</span>
            </button>
          </div>
        </div>
      )}

      {/* Compact Part B scene indicator & scroll progress bar at bottom edge (3D Part B only) */}
      {!isLite && !weddingDayMode && stage === 'journey' && activeScene >= 4 && (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 flex flex-col items-center">
          <div className="pointer-events-auto mb-1.5 flex items-center gap-2 rounded-lg border border-gold/25 bg-[#0B1530]/90 px-3 py-1 text-xs text-cream/85">
            {SCENE_META.slice(4).map((meta, idx) => {
              const sceneIdx = idx + 4;
              const active = activeScene === sceneIdx;
              const uiMap: Record<string, 'date' | 'venue' | 'schedule' | 'families' | 'rsvp'> = {
                date: 'date',
                venue: 'venue',
                schedule: 'schedule',
                families: 'families',
                rsvp: 'rsvp',
              };
              const labelKey = uiMap[meta.key] ?? 'date';
              return (
                <button
                  key={meta.key}
                  type="button"
                  onClick={() => handleJump(meta.key)}
                  className={`min-h-[32px] px-2 transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                    active ? 'font-semibold text-gold underline underline-offset-4' : 'text-cream/70 hover:text-cream'
                  }`}
                >
                  {l(content.ui[labelKey])}
                </button>
              );
            })}
          </div>
          <div className="h-1 w-full bg-cream/10">
            <div
              ref={progressFillRef}
              className="h-full origin-left bg-gold transition-transform duration-75"
              style={{ transform: 'scaleX(0.05)' }}
            />
          </div>
        </div>
      )}

      {DEV_FLAGS.showDebug && <DevOverlay />}
    </div>
  );
}

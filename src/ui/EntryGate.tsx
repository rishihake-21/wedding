import { useEffect, useState } from 'react';
import { useProgress } from '@react-three/drei';
import { Volume2, VolumeX } from 'lucide-react';
import { content } from '../content/content';
import { useLocalized } from '../content/useLocalized';
import { audioManager } from '../core/audio';
import { PART_A_END_T } from '../core/layout';
import { useAppStore } from '../core/store';
import { localizeDigits } from '../utils/invitation';
import { LanguageToggle } from './LanguageToggle';

/**
 * Scene 0 — Entry Gate & Diya Loader.
 * Renders a glowing ceremonial diya whose flame and lotus petals open with real loading progress.
 * Tapping Enter unlocks Web Audio / Howler and begins the Part A Vrindavan film (or scrolls into Lite mode).
 */
export function EntryGate() {
  const stage = useAppStore((s) => s.stage);
  const language = useAppStore((s) => s.language);
  const muted = useAppStore((s) => s.muted);
  const quality = useAppStore((s) => s.quality);
  const detectedQuality = useAppStore((s) => s.detectedQuality);
  const guestName = useAppStore((s) => s.guestName);
  const toggleMuted = useAppStore((s) => s.toggleMuted);
  const setQuality = useAppStore((s) => s.setQuality);
  const startCinematic = useAppStore((s) => s.startCinematic);
  const jumpTo = useAppStore((s) => s.jumpTo);
  const l = useLocalized();

  const { progress: dreiProgress, active: dreiLoading } = useProgress();
  const [displayProgress, setDisplayProgress] = useState(35);

  useEffect(() => {
    if (stage !== 'gate') return;
    const target = dreiLoading ? Math.max(25, Math.min(95, dreiProgress)) : 100;
    const id = window.setInterval(() => {
      setDisplayProgress((prev) => {
        if (prev >= target) {
          window.clearInterval(id);
          return target;
        }
        return Math.min(target, prev + 12);
      });
    }, 60);
    return () => window.clearInterval(id);
  }, [stage, dreiProgress, dreiLoading]);

  if (stage !== 'gate') return null;

  const ready = displayProgress >= 95;
  const flameScale = 0.45 + (displayProgress / 100) * 0.65;
  const petalSpread = 8 + (displayProgress / 100) * 24;
  const isLite = quality === 'lite';

  const handleEnter = () => {
    audioManager.setMuted(muted);
    audioManager.unlock();
    if (isLite) {
      useAppStore.getState().startJourney(0);
    } else {
      startCinematic();
    }
  };

  const handleSkipToDetails = () => {
    audioManager.setMuted(muted);
    audioManager.unlock();
    jumpTo(PART_A_END_T);
  };

  const handleToggleSound = () => {
    toggleMuted();
    audioManager.setMuted(!muted);
  };

  const handleToggleLite = () => {
    if (isLite) {
      setQuality(detectedQuality === 'lite' ? 'low' : detectedQuality);
    } else {
      setQuality('lite');
    }
  };

  return (
    <section
      aria-label={l(content.meta.title)}
      className="pointer-events-auto fixed inset-0 z-30 flex flex-col items-center justify-between overflow-y-auto bg-midnight px-6 py-8 text-center"
      style={{
        backgroundImage:
          'radial-gradient(circle at 50% 34%, rgba(212, 166, 64, 0.16) 0%, rgba(15, 110, 122, 0.12) 34%, rgba(11, 21, 48, 0.98) 72%)',
      }}
    >
      {/* Top quiet utility bar */}
      <div className="flex w-full max-w-xl items-center justify-between gap-3">
        <button
          type="button"
          onClick={handleToggleSound}
          aria-pressed={!muted}
          aria-label={muted ? l(content.ui.soundOff) : l(content.ui.soundOn)}
          className="flex min-h-[44px] items-center gap-2 rounded-lg border border-gold/30 bg-[#0F1B3A] px-3.5 text-sm text-cream transition-colors hover:border-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold whitespace-nowrap shrink-0"
        >
          {muted ? <VolumeX className="h-4 w-4 text-cream/70" /> : <Volume2 className="h-4 w-4 text-gold" />}
          <span>{muted ? l(content.ui.soundOff) : l(content.ui.soundOn)}</span>
        </button>

        <LanguageToggle />
      </div>

      {/* Center Diya & Lotus ceremonial focal anchor */}
      <div className="my-auto flex max-w-lg flex-col items-center py-6">
        <p className="font-marathi text-lg tracking-wide text-gold sm:text-xl">
          {l(content.invocation.primary)}
        </p>

        {guestName && (
          <p className="mt-2 text-base text-cream/90">
            {l(content.ui.dearGuest)} <span className="font-semibold text-gold">{guestName}</span>
          </p>
        )}

        {/* Ceremonial Diya + Opening Lotus SVG driven by loading progress */}
        <div className="relative my-6 flex h-44 w-44 items-center justify-center" aria-hidden="true">
          <svg viewBox="0 0 200 200" className="h-full w-full overflow-visible">
            <defs>
              <radialGradient id="diyaAura" cx="50%" cy="42%" r="50%">
                <stop offset="0%" stopColor="#FFF4DC" stopOpacity="0.65" />
                <stop offset="45%" stopColor="#F28C28" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#0B1530" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="flameGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFFDF4" />
                <stop offset="45%" stopColor="#D4A640" />
                <stop offset="100%" stopColor="#F28C28" />
              </linearGradient>
            </defs>

            <circle cx="100" cy="84" r={62 * flameScale} fill="url(#diyaAura)" />

            {/* Opening lotus petals behind the diya */}
            {[-2, -1, 0, 1, 2].map((slot) => (
              <ellipse
                key={slot}
                cx="100"
                cy="126"
                rx="13"
                ry="34"
                fill="#E8A0B4"
                fillOpacity={slot === 0 ? 0.4 : 0.28}
                stroke="#D4A640"
                strokeOpacity="0.4"
                strokeWidth="1"
                transform={`rotate(${slot * petalSpread} 100 144)`}
              />
            ))}

            {/* Diya flame scaling smoothly with load progress */}
            <g transform={`translate(100 112) scale(${flameScale}) translate(-100 -112)`}>
              <path
                d="M100 42 C118 72, 120 98, 100 112 C80 98, 82 72, 100 42 Z"
                fill="url(#flameGrad)"
              />
              <path
                d="M100 68 C109 85, 109 102, 100 109 C91 102, 91 85, 100 68 Z"
                fill="#FFFDF5"
              />
            </g>

            {/* Earthen diya vessel */}
            <path
              d="M52 122 Q100 156 148 122 Q132 158 100 162 Q68 158 52 122 Z"
              fill="#8D4925"
              stroke="#D4A640"
              strokeWidth="2"
            />
            <ellipse cx="100" cy="122" rx="48" ry="8" fill="#5A2B14" stroke="#D4A640" strokeWidth="1.5" />
          </svg>
        </div>

        {/* Couple Names */}
        <h1
          className={`text-balance text-3xl font-semibold tracking-wide text-cream sm:text-5xl ${
            language === 'mr' ? 'font-marathi leading-snug' : 'font-display'
          }`}
        >
          <span>{l(content.couple.groom.name)}</span>
          <span className="mx-3 text-gold">&amp;</span>
          <span>{l(content.couple.bride.name)}</span>
        </h1>

        <p className="mt-3 max-w-md text-base leading-relaxed text-cream/80">
          {l(content.meta.description)}
        </p>

        {/* Loading bar or Enter CTA */}
        <div className="mt-8 flex w-full max-w-xs flex-col items-center gap-3">
          {!ready ? (
            <div className="w-full" role="progressbar" aria-valuenow={Math.round(displayProgress)} aria-valuemin={0} aria-valuemax={100}>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-cream/15">
                <div
                  className="h-full bg-gold transition-all duration-150"
                  style={{ width: `${displayProgress}%` }}
                />
              </div>
              <p className="mt-2 text-sm tabular-nums text-cream/70">
                {l(content.ui.loading)} · {localizeDigits(Math.round(displayProgress), language)}%
              </p>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={handleEnter}
                className="min-h-[56px] w-full rounded-lg bg-gold px-8 py-3.5 text-lg font-semibold text-midnight shadow-lg transition-transform duration-150 hover:bg-[#E2B854] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream focus-visible:ring-offset-2 focus-visible:ring-offset-midnight whitespace-nowrap"
              >
                {l(content.ui.enter)}
              </button>
              <button
                type="button"
                onClick={handleSkipToDetails}
                className="min-h-[44px] px-4 text-sm text-cream/80 underline-offset-4 transition-colors hover:text-gold hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              >
                {l(content.ui.date)} · {l(content.ui.venue)} · {l(content.ui.rsvp)}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Bottom mode switch (Lite 2D vs 3D) */}
      <div className="flex items-center justify-center gap-4 text-sm text-cream/75">
        <button
          type="button"
          onClick={handleToggleLite}
          aria-pressed={isLite}
          className="min-h-[44px] rounded-lg border border-cream/20 px-4 py-2 transition-colors hover:border-gold/60 hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold whitespace-nowrap"
        >
          {isLite ? l(content.ui.full3dMode) : l(content.ui.liteMode)}
        </button>
      </div>
    </section>
  );
}

import { useEffect, useRef } from 'react';
import { content } from '../content/content';
import { useLocalized } from '../content/useLocalized';
import { SCENE_META, sceneProgressAt, type SceneKey } from '../core/layout';
import { useAppStore } from '../core/store';
import {
  DateRevealCard,
  FamiliesBlessingsCard,
  RsvpAndShareCard,
  ScheduleCarouselCard,
  VenueRevealCard,
} from './InvitationBlocks';

/**
 * DOM-side scene overlay registry keyed by `SceneKey`.
 * Renders Devanagari & English HTML typography and interactive Part B cards above the 3D canvas.
 * Part A narrative captions fade smoothly via a lightweight rAF reader of `t` (zero React re-renders per frame).
 */
export function SceneOverlays() {
  const stage = useAppStore((s) => s.stage);
  const activeScene = useAppStore((s) => s.activeScene);
  const language = useAppStore((s) => s.language);
  const l = useLocalized();

  const captionRef = useRef<HTMLDivElement>(null);
  const sceneKey: SceneKey = SCENE_META[activeScene]?.key ?? 'invocation';

  // Smoothly modulate Part A caption opacity with local scene progress without React re-renders
  useEffect(() => {
    if (stage === 'gate') return;
    let raf = 0;
    const tick = () => {
      const el = captionRef.current;
      if (el) {
        const s = useAppStore.getState();
        const p = sceneProgressAt(s.t, s.activeScene);
        if (s.activeScene < 4) {
          // Gentle fade-in (0.08 -> 0.25) and fade-out (0.82 -> 0.96)
          const fadeIn = Math.min(1, Math.max(0, (p - 0.05) / 0.18));
          const fadeOut = Math.min(1, Math.max(0, (0.98 - p) / 0.15));
          const alpha = s.reducedMotion ? 1 : Math.max(0.18, Math.min(fadeIn, fadeOut));
          el.style.opacity = String(alpha);
        } else {
          el.style.opacity = '1';
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [stage, activeScene]);

  if (stage === 'gate') return null;

  const displayFont = language === 'mr' ? 'font-marathi' : 'font-display';

  return (
    <div
      ref={captionRef}
      data-scene-overlay={sceneKey}
      className="pointer-events-none fixed inset-x-0 bottom-0 z-10 flex max-h-[82dvh] flex-col items-center justify-end overflow-y-auto px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-16 sm:px-6"
      style={{
        background:
          activeScene < 4
            ? 'linear-gradient(to top, rgba(11,21,48,0.88) 0%, rgba(11,21,48,0.45) 58%, rgba(11,21,48,0) 100%)'
            : 'linear-gradient(to top, rgba(11,21,48,0.84) 0%, rgba(11,21,48,0.28) 65%, rgba(11,21,48,0) 100%)',
      }}
    >
      {/* Part A: Narrative Cinematic Overlays (Scenes 1–4) */}
      {sceneKey === 'invocation' && (
        <div className="max-w-xl pb-4 text-center">
          <h1 className={`text-balance text-3xl font-semibold text-gold sm:text-5xl ${displayFont}`}>
            {l(content.invocation.primary)}
          </h1>
          {content.invocation.family && (
            <p className="mt-2 text-base text-cream/90 sm:text-lg">{l(content.invocation.family)}</p>
          )}
        </div>
      )}

      {sceneKey === 'groom' && (
        <div className="max-w-xl pb-4 text-center">
          <h2 className={`text-balance text-3xl font-semibold text-gold sm:text-5xl ${displayFont}`}>
            {l(content.radhaKrishna.title)}
          </h2>
          <p className="mt-2 text-base text-cream/90 sm:text-lg">
            {l(content.radhaKrishna.subtitle)}
          </p>
          <p className="mt-2 text-xs text-cream/70">{l(content.ui.tapFluteHint)}</p>
        </div>
      )}

      {sceneKey === 'bride' && (
        <div className="w-full max-w-3xl pb-3">
          <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-[1fr_auto_1fr] sm:gap-6">
            {/* Groom Info (Left — aligned under Groom's portrait) */}
            <div className="text-center sm:text-right">
              {content.couple.groom.prefix && l(content.couple.groom.prefix) && (
                <p className="text-sm font-medium tracking-wide text-gold/90 sm:text-base">
                  {l(content.couple.groom.prefix)}
                </p>
              )}
              <h2 className={`mt-0.5 text-3xl font-semibold text-gold sm:text-5xl ${displayFont}`}>
                {l(content.couple.groom.name)}
              </h2>
              <p className="mt-1.5 text-sm leading-snug text-cream/90 sm:text-base">
                {l(content.couple.groom.family)}
              </p>
            </div>

            {/* Golden Ornamental Ampersand Divider */}
            <div className="hidden flex-col items-center justify-center sm:flex" aria-hidden="true">
              <span className="h-6 w-px bg-gold/45" />
              <span className="my-1 font-display text-2xl text-gold">&amp;</span>
              <span className="h-6 w-px bg-gold/45" />
            </div>

            {/* Bride Info (Right — aligned under Bride's portrait) */}
            <div className="text-center sm:text-left">
              {content.couple.bride.prefix && l(content.couple.bride.prefix) && (
                <p className="text-sm font-medium tracking-wide text-lotus sm:text-base">
                  {l(content.couple.bride.prefix)}
                </p>
              )}
              <h2 className={`mt-0.5 text-3xl font-semibold text-gold sm:text-5xl ${displayFont}`}>
                {l(content.couple.bride.name)}
              </h2>
              <p className="mt-1.5 text-sm leading-snug text-cream/90 sm:text-base">
                {l(content.couple.bride.family)}
              </p>
            </div>
          </div>
        </div>
      )}

      {sceneKey === 'union' && (
        <div className="max-w-xl pb-4 text-center">
          <p className="font-display text-2xl tracking-[0.22em] text-gold">
            {l(content.couple.groom.initial)} · {l(content.couple.bride.initial)}
          </p>
          <h2 className={`mt-1 text-3xl font-semibold text-cream sm:text-5xl ${displayFont}`}>
            {l(content.couple.groom.name)} <span className="text-gold">&amp;</span>{' '}
            {l(content.couple.bride.name)}
          </h2>
          <p className="mt-2 text-base text-cream/90 sm:text-lg">{l(content.couple.unionLine)}</p>
        </div>
      )}

      {/* Part B: Interactive Scroll Journey Overlays (Scenes 5–9) */}
      {sceneKey === 'date' && (
        <div className="pointer-events-auto flex w-full justify-center pb-16">
          <DateRevealCard compact />
        </div>
      )}

      {sceneKey === 'venue' && (
        <div className="pointer-events-auto flex w-full justify-center pb-16">
          <VenueRevealCard />
        </div>
      )}

      {sceneKey === 'schedule' && (
        <div className="pointer-events-auto flex w-full justify-center pb-16">
          <ScheduleCarouselCard />
        </div>
      )}

      {sceneKey === 'families' && (
        <div className="pointer-events-auto flex w-full justify-center pb-16">
          <FamiliesBlessingsCard />
        </div>
      )}

      {sceneKey === 'rsvp' && (
        <div className="pointer-events-auto flex w-full justify-center pb-16">
          <RsvpAndShareCard />
        </div>
      )}
    </div>
  );
}

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { content } from '../content/content';
import { useLocalized } from '../content/useLocalized';
import { useAppStore } from '../core/store';
import {
  DateRevealCard,
  FamiliesBlessingsCard,
  RsvpAndShareCard,
  ScheduleCarouselCard,
  VenueRevealCard,
} from '../ui/InvitationBlocks';

/**
 * Phase 9 — Lite 2D Experience (Zero WebGL).
 * Selected automatically when WebGL is missing, data-saver is enabled, or GPU tier is low on mobile,
 * and manually toggleable anytime. Renders all 9 story chapters with subtle CSS/GSAP parallax
 * depth and 100% of the bilingual invitation details, countdown, calendar, venue, schedule & RSVP.
 */
export function LiteExperience() {
  const language = useAppStore((s) => s.language);
  const reducedMotion = useAppStore((s) => s.reducedMotion);
  const guestName = useAppStore((s) => s.guestName);
  const l = useLocalized();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reducedMotion || !containerRef.current) return;
    const container = containerRef.current;

    const onScroll = () => {
      const y = container.scrollTop;
      const moon = container.querySelector<HTMLElement>('[data-parallax="moon"]');
      const mist = container.querySelector<HTMLElement>('[data-parallax="mist"]');
      if (moon) gsap.set(moon, { y: y * 0.14 });
      if (mist) gsap.set(mist, { y: y * -0.06 });
    };

    container.addEventListener('scroll', onScroll, { passive: true });
    return () => container.removeEventListener('scroll', onScroll);
  }, [reducedMotion]);

  const displayFont = language === 'mr' ? 'font-marathi' : 'font-display';

  return (
    <main
      ref={containerRef}
      data-testid="lite-experience"
      className="relative h-full w-full overflow-y-auto overflow-x-hidden bg-midnight text-cream"
    >
      {/* Layered moonlit Vrindavan 2D parallax backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden"
        style={{
          background:
            'linear-gradient(180deg, #060D21 0%, #0B1530 42%, #0D2D3D 78%, #0B1530 100%)',
        }}
      >
        <div
          data-parallax="moon"
          className="absolute left-1/2 top-24 h-64 w-64 -translate-x-1/2 rounded-full opacity-35"
          style={{
            background:
              'radial-gradient(circle, rgba(255,244,220,0.85) 0%, rgba(212,166,64,0.28) 45%, rgba(11,21,48,0) 72%)',
          }}
        />
        <div
          data-parallax="mist"
          className="absolute inset-x-0 bottom-0 h-56 opacity-40"
          style={{
            background:
              'linear-gradient(to top, rgba(15,110,122,0.45), rgba(11,21,48,0))',
          }}
        />
      </div>

      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center gap-16 px-4 pb-24 pt-28 sm:gap-20 sm:px-6">
        {/* Scene 1: Invocation */}
        <section id="lite-invocation" className="w-full text-center">
          <p className="font-marathi text-2xl font-semibold text-gold sm:text-4xl">
            {l(content.invocation.primary)}
          </p>
          {content.invocation.family && (
            <p className="mt-2 text-base text-cream/85">{l(content.invocation.family)}</p>
          )}
          {guestName && (
            <p className="mt-3 text-base text-cream/90">
              {l(content.ui.dearGuest)} <span className="font-semibold text-gold">{guestName}</span>
            </p>
          )}
        </section>

        {/* Scene 2: Sacred Radha-Krishna Blessing */}
        <section id="lite-radha-krishna" className="w-full text-center">
          <div className="mx-auto mb-4 w-72 overflow-hidden rounded-2xl border border-gold/40 bg-white/95 p-3 shadow-xl sm:w-80">
            <img
              src="/assets/aistudio/radha_krishna_97671432.webp"
              alt={l(content.radhaKrishna.title)}
              className="h-auto w-full object-contain"
              loading="lazy"
            />
          </div>
          <h2 className={`text-2xl font-semibold text-gold sm:text-3xl ${displayFont}`}>
            {l(content.radhaKrishna.title)}
          </h2>
          <p className="mt-2 text-sm text-cream/85 sm:text-base">
            {l(content.radhaKrishna.subtitle)}
          </p>
        </section>

        {/* Scene 3: Groom & Bride Together */}
        <section id="lite-couple" className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2">
          <article className="rounded-xl border border-gold/30 bg-[#0D1A3B]/90 p-6 text-center">
            <p className="text-sm font-medium text-peacock">
              {content.couple.groom.prefix ? l(content.couple.groom.prefix) : ''}
            </p>
            <h2 className={`mt-1 text-3xl font-semibold text-gold sm:text-4xl ${displayFont}`}>
              {l(content.couple.groom.name)}
            </h2>
            <p className="mt-3 text-base leading-relaxed text-cream/85">
              {l(content.couple.groom.family)}
            </p>
          </article>

          <article className="rounded-xl border border-gold/30 bg-[#0D1A3B]/90 p-6 text-center">
            <p className="text-sm font-medium text-lotus">
              {content.couple.bride.prefix ? l(content.couple.bride.prefix) : ''}
            </p>
            <h2 className={`mt-1 text-3xl font-semibold text-gold sm:text-4xl ${displayFont}`}>
              {l(content.couple.bride.name)}
            </h2>
            <p className="mt-3 text-base leading-relaxed text-cream/85">
              {l(content.couple.bride.family)}
            </p>
          </article>
        </section>

        {/* Scene 4: Union Monogram & Real Couple Portrait */}
        <section id="lite-union" className="w-full border-y border-gold/25 py-8 text-center">
          <div className="mx-auto mb-6 w-56 overflow-hidden rounded-t-full rounded-b-xl border-2 border-gold/55 shadow-2xl sm:w-64">
            <img
              src="/assets/aistudio/DSC_7263.JPG_cbd053d6.jpeg"
              alt={`${l(content.couple.groom.name)} & ${l(content.couple.bride.name)}`}
              className="aspect-[3/4] w-full object-cover object-center"
              loading="lazy"
            />
          </div>
          <p className="font-display text-2xl tracking-[0.24em] text-gold">
            {l(content.couple.groom.initial)} · {l(content.couple.bride.initial)}
          </p>
          <h1 className={`mt-2 text-3xl font-semibold text-cream sm:text-5xl ${displayFont}`}>
            {l(content.couple.groom.name)} <span className="text-gold">&amp;</span>{' '}
            {l(content.couple.bride.name)}
          </h1>
          <p className="mt-2 text-base text-cream/80">{l(content.couple.unionLine)}</p>
        </section>

        {/* Scene 5: Date & Countdown */}
        <section id="lite-date" className="flex w-full justify-center">
          <DateRevealCard />
        </section>

        {/* Scene 6: Venue */}
        <section id="lite-venue" className="flex w-full justify-center">
          <VenueRevealCard />
        </section>

        {/* Scene 7: Schedule */}
        <section id="lite-schedule" className="flex w-full justify-center">
          <ScheduleCarouselCard />
        </section>

        {/* Scene 8: Families & Blessings */}
        <section id="lite-families" className="flex w-full justify-center">
          <FamiliesBlessingsCard />
        </section>

        {/* Scene 9: RSVP, Share & Helplines */}
        <section id="lite-rsvp" className="flex w-full justify-center">
          <RsvpAndShareCard />
        </section>
      </div>
    </main>
  );
}

import { MapPin, Phone, Radio, Sparkles } from 'lucide-react';
import { content } from '../content/content';
import { useLocalized } from '../content/useLocalized';
import { useAppStore } from '../core/store';
import { formatIstDateTime } from '../utils/invitation';

/**
 * Phase 9 — Wedding-Day Mode (FR-16).
 * Activates automatically on the wedding date (or via ?weddingday=1 / Menu toggle)
 * to put today's live ceremonies, one-tap Google Maps directions, helplines, and
 * live-stream link front and center for travelling guests.
 */
export function WeddingDayView() {
  const language = useAppStore((s) => s.language);
  const setWeddingDayMode = useAppStore((s) => s.setWeddingDayMode);
  const l = useLocalized();
  const displayFont = language === 'mr' ? 'font-marathi' : 'font-display';

  return (
    <main
      data-testid="wedding-day-view"
      className="relative h-full w-full overflow-y-auto bg-midnight px-4 pb-16 pt-24 text-cream sm:px-6"
      style={{
        backgroundImage:
          'radial-gradient(circle at 50% 0%, rgba(212,166,64,0.18) 0%, rgba(11,21,48,1) 58%)',
      }}
    >
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="text-center">
          <p className="font-marathi text-lg text-gold">{l(content.invocation.primary)}</p>
          <h1 className={`mt-2 text-3xl font-semibold text-cream sm:text-4xl ${displayFont}`}>
            {l(content.ui.weddingDayTitle)}
          </h1>
          <p className="mt-1.5 text-base text-cream/80">{l(content.ui.weddingDaySubtitle)}</p>
        </div>

        {/* Immediate venue directions & live stream actions */}
        <div className="flex flex-wrap justify-center gap-3">
          <a
            href={content.venue.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-[48px] items-center gap-2 rounded-lg bg-gold px-5 py-2.5 text-base font-semibold text-midnight hover:bg-[#E2B854] whitespace-nowrap"
          >
            <MapPin className="h-4 w-4" />
            <span>{l(content.ui.openInMaps)}</span>
          </a>

          {content.weddingDay.liveStreamUrl && (
            <a
              href={content.weddingDay.liveStreamUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-[48px] items-center gap-2 rounded-lg border border-marigold bg-[#2A1C16] px-5 py-2.5 text-base font-medium text-cream hover:bg-marigold hover:text-midnight whitespace-nowrap"
            >
              <Radio className="h-4 w-4" />
              <span>{l(content.ui.liveStreamButton)}</span>
            </a>
          )}

          <button
            type="button"
            onClick={() => setWeddingDayMode(false)}
            className="flex min-h-[48px] items-center gap-2 rounded-lg border border-gold/40 bg-[#122042] px-5 py-2.5 text-sm font-medium text-cream hover:border-gold whitespace-nowrap"
          >
            <Sparkles className="h-4 w-4 text-gold" />
            <span>{l(content.ui.viewFullInvite)}</span>
          </button>
        </div>

        {/* Full Chronological Schedule */}
        <section className="rounded-xl border border-gold/30 bg-[#0F1B3A] p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-gold">{l(content.ui.scheduleTitle)}</h2>
          <ol className="mt-4 divide-y divide-gold/15">
            {content.events.map((ev) => {
              const dt = formatIstDateTime(ev.startIso, language);
              return (
                <li key={ev.id} className="py-3.5">
                  <p className="text-xs font-medium text-gold">
                    {dt.fullDate} · {dt.time}
                  </p>
                  <p className="mt-0.5 text-lg font-semibold text-cream">{l(ev.name)}</p>
                  {ev.venue && <p className="text-sm text-cream/80">{l(ev.venue)}</p>}
                </li>
              );
            })}
          </ol>
        </section>

        {/* Venue & Helplines */}
        <section className="rounded-xl border border-gold/30 bg-[#0F1B3A] p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-gold">{l(content.venue.name)}</h2>
          <p className="mt-1 text-base text-cream/85">{l(content.venue.address)}</p>
          <div className="mt-4 flex flex-wrap gap-3 border-t border-gold/15 pt-4">
            {content.rsvp.helplines.map((h, i) => (
              <a
                key={i}
                href={`tel:${h.phone}`}
                className="flex min-h-[44px] items-center gap-2 rounded-lg border border-gold/35 px-3.5 py-2 text-sm text-cream hover:border-gold"
              >
                <Phone className="h-4 w-4 text-gold" />
                <span>{l(h.label)}</span>
              </a>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

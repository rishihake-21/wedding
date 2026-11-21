import { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import {
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  ExternalLink,
  Flame,
  MapPin,
  Phone,
  Share2,
} from 'lucide-react';
import { content } from '../content/content';
import { useLocalized } from '../content/useLocalized';
import { audioManager } from '../core/audio';
import { useAppStore } from '../core/store';
import {
  buildGoogleCalendarUrl,
  buildWhatsAppRsvpUrl,
  buildWhatsAppShareUrl,
  computeCountdown,
  downloadIcsFile,
  downloadSaveTheDateCard,
  formatIstDateTime,
  localizeDigits,
  submitRsvp,
  validateRsvpForm,
} from '../utils/invitation';

// ---------------------------------------------------------------------------
// Scene 5: Date, Digit-by-Digit Diya Reveal, IST Countdown & Calendar
// ---------------------------------------------------------------------------

export function DateRevealCard({ compact = false }: { compact?: boolean }) {
  const language = useAppStore((s) => s.language);
  const reducedMotion = useAppStore((s) => s.reducedMotion);
  const l = useLocalized();
  const digitsRef = useRef<HTMLDivElement>(null);

  const [countdown, setCountdown] = useState(() => computeCountdown(content.date.muhuratIso));

  useEffect(() => {
    const id = window.setInterval(() => {
      setCountdown(computeCountdown(content.date.muhuratIso));
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  const dt = useMemo(() => formatIstDateTime(content.date.muhuratIso, language), [language]);
  const googleCalUrl = useMemo(() => buildGoogleCalendarUrl(content, language), [language]);

  // GSAP stagger reveal of date characters like diyas lighting one by one
  useEffect(() => {
    if (reducedMotion || !digitsRef.current) return;
    const chars = digitsRef.current.querySelectorAll('[data-diya-char]');
    const ctx = gsap.context(() => {
      gsap.fromTo(
        chars,
        { opacity: 0.18, y: 6 },
        { opacity: 1, y: 0, duration: 0.45, stagger: 0.045, ease: 'power2.out' },
      );
    }, digitsRef);
    return () => ctx.revert();
  }, [language, reducedMotion]);

  const dateLine = `${dt.day} ${dt.month} ${dt.year}`;

  return (
    <div
      className={`w-full max-w-xl rounded-xl border border-gold/30 bg-midnight/95 text-center shadow-2xl ${
        compact ? 'p-5 sm:p-6' : 'p-6 sm:p-8'
      }`}
    >
      <p className="text-sm font-medium tracking-wide text-gold">
        {l(content.ui.muhuratTitle)} · {dt.weekday}
      </p>

      <div
        ref={digitsRef}
        className={`mt-2 text-3xl font-semibold text-cream sm:text-4xl ${
          language === 'mr' ? 'font-marathi' : 'font-display'
        }`}
      >
        {Array.from(dateLine).map((ch, idx) => (
          <span key={idx} data-diya-char className="inline-block whitespace-pre">
            {ch}
          </span>
        ))}
      </div>

      <p className="mt-2 text-base font-medium text-gold">{l(content.date.muhuratLabel)}</p>
      {content.date.tithi && (
        <p className="mt-1 text-sm text-cream/75">{l(content.date.tithi)}</p>
      )}

      {/* Live IST Countdown */}
      {countdown.isPast ? (
        <p className="mt-5 text-base font-semibold text-marigold">{l(content.ui.celebratingNow)}</p>
      ) : (
        <div
          aria-label="Countdown to muhurat"
          className="mt-5 grid grid-cols-4 gap-2 border-y border-gold/20 py-4"
        >
          {[
            { value: countdown.days, label: l(content.ui.countdownDays) },
            { value: countdown.hours, label: l(content.ui.countdownHours) },
            { value: countdown.minutes, label: l(content.ui.countdownMinutes) },
            { value: countdown.seconds, label: l(content.ui.countdownSeconds) },
          ].map((item) => (
            <div key={item.label} className="flex flex-col items-center">
              <span className="text-2xl font-semibold tabular-nums text-cream sm:text-3xl">
                {localizeDigits(String(item.value).padStart(2, '0'), language)}
              </span>
              <span className="mt-0.5 text-xs text-cream/70">{item.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Calendar actions */}
      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => downloadIcsFile(language)}
          className="flex min-h-[44px] items-center gap-2 rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-midnight transition-colors hover:bg-[#E2B854] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream whitespace-nowrap"
        >
          <Download className="h-4 w-4" />
          <span>{l(content.ui.downloadIcs)}</span>
        </button>

        <a
          href={googleCalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-[44px] items-center gap-2 rounded-lg border border-gold/45 bg-[#122042] px-4 py-2 text-sm font-medium text-cream transition-colors hover:border-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold whitespace-nowrap"
        >
          <Calendar className="h-4 w-4 text-gold" />
          <span>{l(content.ui.googleCalendar)}</span>
        </a>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Scene 6: Venue Details, Maps, Copy Address & Call
// ---------------------------------------------------------------------------

export function VenueRevealCard() {
  const language = useAppStore((s) => s.language);
  const l = useLocalized();
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = async () => {
    const full = `${content.venue.name[language]}, ${content.venue.address[language]}`;
    try {
      await navigator.clipboard.writeText(full);
    } catch {
      // Fallback copy via textarea
      const ta = document.createElement('textarea');
      ta.value = full;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2400);
  };

  return (
    <div className="w-full max-w-xl rounded-xl border border-gold/30 bg-midnight/95 p-5 text-left shadow-2xl sm:p-7">
      <p className="text-sm font-medium text-gold">{l(content.ui.venue)}</p>
      <h2
        className={`mt-1 text-2xl font-semibold text-cream sm:text-3xl ${
          language === 'mr' ? 'font-marathi' : 'font-display'
        }`}
      >
        {l(content.venue.name)}
      </h2>
      <p className="mt-2 text-base leading-relaxed text-cream/85">{l(content.venue.address)}</p>

      <div className="mt-4 space-y-1.5 border-t border-gold/20 pt-3 text-sm text-cream/75">
        {content.venue.landmark && (
          <p>
            <span className="font-medium text-gold">{l(content.ui.landmarkLabel)}:</span>{' '}
            {l(content.venue.landmark)}
          </p>
        )}
        {content.venue.parking && (
          <p>
            <span className="font-medium text-gold">{l(content.ui.parkingLabel)}:</span>{' '}
            {l(content.venue.parking)}
          </p>
        )}
        {content.venue.stay && (
          <p>
            <span className="font-medium text-gold">{l(content.ui.stayLabel)}:</span>{' '}
            {l(content.venue.stay)}
          </p>
        )}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <a
          href={content.venue.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-[44px] items-center gap-2 rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-midnight transition-colors hover:bg-[#E2B854] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream whitespace-nowrap"
        >
          <MapPin className="h-4 w-4" />
          <span>{l(content.ui.openInMaps)}</span>
        </a>

        <button
          type="button"
          onClick={handleCopyAddress}
          className="flex min-h-[44px] items-center gap-2 rounded-lg border border-gold/45 bg-[#122042] px-4 py-2 text-sm font-medium text-cream transition-colors hover:border-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold whitespace-nowrap"
        >
          {copied ? <Check className="h-4 w-4 text-peacock" /> : <Copy className="h-4 w-4 text-gold" />}
          <span>{copied ? l(content.ui.copied) : l(content.ui.copyAddress)}</span>
        </button>

        <a
          href={`tel:${content.venue.phone}`}
          className="flex min-h-[44px] items-center gap-2 rounded-lg border border-gold/45 bg-[#122042] px-4 py-2 text-sm font-medium text-cream transition-colors hover:border-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold whitespace-nowrap"
        >
          <Phone className="h-4 w-4 text-gold" />
          <span>{l(content.ui.callVenue)}</span>
        </a>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Scene 7: Ceremonies Raas Carousel
// ---------------------------------------------------------------------------

export function ScheduleCarouselCard() {
  const language = useAppStore((s) => s.language);
  const l = useLocalized();
  const [selectedIdx, setSelectedIdx] = useState(3); // default highlight Lagna or cycle cleanly
  const events = content.events;
  const activeEvent = events[selectedIdx] ?? events[0];
  const dt = formatIstDateTime(activeEvent.startIso, language);

  const prev = () => setSelectedIdx((i) => (i - 1 + events.length) % events.length);
  const next = () => setSelectedIdx((i) => (i + 1) % events.length);

  return (
    <div className="w-full max-w-2xl rounded-xl border border-gold/30 bg-midnight/95 p-5 shadow-2xl sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2
            className={`text-2xl font-semibold text-cream sm:text-3xl ${
              language === 'mr' ? 'font-marathi' : 'font-display'
            }`}
          >
            {l(content.ui.scheduleTitle)}
          </h2>
          <p className="mt-1 text-sm text-cream/70">{l(content.ui.scheduleSubtitle)}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={prev}
            aria-label={l(content.ui.prevEvent)}
            className="flex h-11 w-11 items-center justify-center rounded-lg border border-gold/35 bg-[#122042] text-cream transition-colors hover:border-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label={l(content.ui.nextEvent)}
            className="flex h-11 w-11 items-center justify-center rounded-lg border border-gold/35 bg-[#122042] text-cream transition-colors hover:border-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Interactive ceremony tabs */}
      <div
        role="tablist"
        aria-label={l(content.ui.scheduleTitle)}
        className="mt-4 flex gap-1.5 overflow-x-auto pb-1"
      >
        {events.map((ev, idx) => {
          const active = idx === selectedIdx;
          return (
            <button
              key={ev.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setSelectedIdx(idx)}
              className={`min-h-[44px] rounded-lg px-3.5 py-2 text-sm font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                active
                  ? 'bg-gold text-midnight'
                  : 'border border-gold/25 bg-[#122042] text-cream/85 hover:border-gold/60'
              }`}
            >
              {l(ev.name)}
            </button>
          );
        })}
      </div>

      {/* Active ceremony details */}
      <div className="mt-4 border-t border-gold/20 pt-4 text-left">
        <p className="text-sm font-medium text-gold">
          {dt.fullDate} · {dt.time}
        </p>
        <h3
          className={`mt-1 text-xl font-semibold text-cream sm:text-2xl ${
            language === 'mr' ? 'font-marathi' : 'font-display'
          }`}
        >
          {l(activeEvent.name)}
        </h3>
        {activeEvent.venue && (
          <p className="mt-2 text-base text-cream/85">{l(activeEvent.venue)}</p>
        )}
        {activeEvent.dressCode && (
          <p className="mt-1.5 text-sm text-cream/75">
            <span className="font-medium text-gold">{l(content.ui.dressCodeLabel)}:</span>{' '}
            {l(activeEvent.dressCode)}
          </p>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Scene 8: Families & Traditional Blessings
// ---------------------------------------------------------------------------

export function FamiliesBlessingsCard() {
  const language = useAppStore((s) => s.language);
  const l = useLocalized();

  return (
    <div className="w-full max-w-xl rounded-xl border border-gold/30 bg-midnight/95 p-6 text-center shadow-2xl sm:p-8">
      <p className="font-marathi text-base text-gold">{l(content.invocation.primary)}</p>
      <h2
        className={`mt-2 text-2xl font-semibold text-cream sm:text-3xl ${
          language === 'mr' ? 'font-marathi' : 'font-display'
        }`}
      >
        {l(content.families.invitationLine)}
      </h2>

      <dl className="mt-5 divide-y divide-gold/15 border-y border-gold/20">
        {content.families.hosts.map((host, idx) => (
          <div key={idx} className="py-3">
            <dt className="text-xs font-medium tracking-wide text-gold">{l(host.relation)}</dt>
            <dd className="mt-0.5 text-base font-medium text-cream sm:text-lg">{l(host.name)}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-5 text-base leading-relaxed text-cream/85">{l(content.families.closingLine)}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Scene 9: RSVP Form, Share Actions, Save-the-Date & Family Helplines
// ---------------------------------------------------------------------------

export function RsvpAndShareCard() {
  const language = useAppStore((s) => s.language);
  const diyaLitCount = useAppStore((s) => s.diyaLitCount);
  const lightBlessingDiya = useAppStore((s) => s.lightBlessingDiya);
  const setRsvpSubmitted = useAppStore((s) => s.setRsvpSubmitted);
  const l = useLocalized();

  const [name, setName] = useState(useAppStore.getState().guestName ?? '');
  const [guests, setGuests] = useState(2);
  const [selectedEvents, setSelectedEvents] = useState<string[]>(['lagna', 'reception']);
  const [message, setMessage] = useState('');
  const [website, setWebsite] = useState(''); // honeypot
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorText, setErrorText] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  const toggleEvent = (id: string) => {
    setSelectedEvents((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const whatsappRsvpUrl = useMemo(
    () => buildWhatsAppRsvpUrl({ name, guests, events: selectedEvents, message }, language),
    [name, guests, selectedEvents, message, language],
  );

  const shareUrl = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '';
  const whatsappShareUrl = useMemo(() => buildWhatsAppShareUrl(language, shareUrl), [language, shareUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText(null);

    const validation = validateRsvpForm({ name, guests, events: selectedEvents, message, website });
    if (validation.isBot) {
      setStatus('success');
      return;
    }
    if (!validation.valid && validation.errorKey) {
      setErrorText(l(content.ui[validation.errorKey]));
      return;
    }

    setStatus('submitting');
    try {
      await submitRsvp({ name, guests, events: selectedEvents, message, website }, language);
      setStatus('success');
      setRsvpSubmitted(true);
      lightBlessingDiya();
      audioManager.playCue('diya');
    } catch {
      setStatus('error');
      setErrorText(l(content.ui.rsvpErrorSubmit));
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      // ignore
    }
    setLinkCopied(true);
    window.setTimeout(() => setLinkCopied(false), 2400);
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share({
          title: content.meta.title[language],
          text: content.meta.description[language],
          url: shareUrl,
        });
      } catch {
        // User cancelled share sheet
      }
    } else {
      await handleCopyLink();
    }
  };

  const handleLightDiya = () => {
    lightBlessingDiya();
    audioManager.playCue('diya');
  };

  return (
    <div className="w-full max-w-2xl rounded-xl border border-gold/30 bg-midnight/95 p-5 text-left shadow-2xl sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2
            className={`text-2xl font-semibold text-cream sm:text-3xl ${
              language === 'mr' ? 'font-marathi' : 'font-display'
            }`}
          >
            {l(content.ui.rsvpTitle)}
          </h2>
          <p className="mt-1 text-sm text-cream/75">{l(content.ui.rsvpSubtitle)}</p>
        </div>

        <button
          type="button"
          onClick={handleLightDiya}
          className="flex min-h-[44px] items-center gap-2 rounded-lg border border-gold/40 bg-[#142347] px-3.5 py-2 text-sm text-gold transition-colors hover:border-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold whitespace-nowrap"
        >
          <Flame className="h-4 w-4 text-marigold" />
          <span>{l(content.ui.lightDiyaHint)}</span>
          {diyaLitCount > 0 && (
            <span className="font-semibold tabular-nums text-cream">
              ({localizeDigits(diyaLitCount, language)})
            </span>
          )}
        </button>
      </div>

      {status === 'success' ? (
        <div
          role="status"
          className="mt-5 rounded-lg border border-peacock/60 bg-[#102B2C] p-5 text-center"
        >
          <h3 className="text-xl font-semibold text-gold">{l(content.ui.rsvpSuccessTitle)}</h3>
          <p className="mt-1.5 text-base text-cream/90">{l(content.ui.rsvpSuccessBody)}</p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <a
              href={whatsappRsvpUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-[44px] items-center gap-2 rounded-lg bg-peacock px-4 py-2 text-sm font-semibold text-cream transition-colors hover:bg-[#22966D] whitespace-nowrap"
            >
              <ExternalLink className="h-4 w-4" />
              <span>{l(content.ui.rsvpWhatsapp)}</span>
            </a>
            <button
              type="button"
              onClick={() => setStatus('idle')}
              className="min-h-[44px] rounded-lg border border-gold/40 px-4 py-2 text-sm text-cream hover:border-gold whitespace-nowrap"
            >
              {l(content.ui.rsvpReset)}
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-4">
          {/* Honeypot field hidden from human users */}
          <div className="sr-only" aria-hidden="true">
            <label htmlFor="rsvp-website">Website</label>
            <input
              id="rsvp-website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label htmlFor="rsvp-name" className="block text-sm font-medium text-cream/90">
                {l(content.ui.rsvpNameLabel)}
              </label>
              <input
                id="rsvp-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={l(content.ui.rsvpNamePlaceholder)}
                className="mt-1.5 min-h-[44px] w-full rounded-lg border border-gold/35 bg-[#111D3B] px-3.5 py-2 text-base text-cream placeholder:text-cream/45 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/50"
              />
            </div>

            <div>
              <label htmlFor="rsvp-guests" className="block text-sm font-medium text-cream/90">
                {l(content.ui.rsvpGuestsLabel)}
              </label>
              <select
                id="rsvp-guests"
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="mt-1.5 min-h-[44px] w-full rounded-lg border border-gold/35 bg-[#111D3B] px-3 py-2 text-base text-cream focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/50"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <option key={n} value={n}>
                    {localizeDigits(n, language)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <fieldset>
            <legend className="text-sm font-medium text-cream/90">
              {l(content.ui.rsvpEventsLabel)}
            </legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {content.events.map((ev) => {
                const checked = selectedEvents.includes(ev.id);
                return (
                  <label
                    key={ev.id}
                    className={`flex min-h-[44px] cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                      checked
                        ? 'border-gold bg-gold/20 text-cream'
                        : 'border-gold/25 bg-[#111D3B] text-cream/75 hover:border-gold/50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleEvent(ev.id)}
                      className="h-4 w-4 accent-[#D4A640]"
                    />
                    <span>{l(ev.name)}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <div>
            <label htmlFor="rsvp-message" className="block text-sm font-medium text-cream/90">
              {l(content.ui.rsvpMessageLabel)}
            </label>
            <textarea
              id="rsvp-message"
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={l(content.ui.rsvpMessagePlaceholder)}
              className="mt-1.5 w-full rounded-lg border border-gold/35 bg-[#111D3B] px-3.5 py-2.5 text-base text-cream placeholder:text-cream/45 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/50"
            />
          </div>

          {errorText && (
            <p role="alert" className="text-sm font-medium text-marigold">
              {errorText}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="min-h-[48px] rounded-lg bg-gold px-6 py-2.5 text-base font-semibold text-midnight transition-colors hover:bg-[#E2B854] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream whitespace-nowrap"
            >
              {status === 'submitting' ? l(content.ui.rsvpSubmitting) : l(content.ui.rsvpSubmit)}
            </button>

            <a
              href={whatsappRsvpUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-[48px] items-center gap-2 rounded-lg border border-peacock bg-[#0E312B] px-4 py-2.5 text-sm font-medium text-cream transition-colors hover:bg-peacock focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold whitespace-nowrap"
            >
              <ExternalLink className="h-4 w-4" />
              <span>{l(content.ui.rsvpWhatsapp)}</span>
            </a>
          </div>
        </form>
      )}

      {/* Share, Save-the-Date & Family Helplines */}
      <div className="mt-6 border-t border-gold/20 pt-5">
        <p className="text-sm font-medium text-gold">{l(content.ui.shareTitle)}</p>
        <div className="mt-2.5 flex flex-wrap gap-2.5">
          <a
            href={whatsappShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-[44px] items-center gap-2 rounded-lg border border-gold/35 bg-[#122042] px-3.5 py-2 text-sm text-cream hover:border-gold whitespace-nowrap"
          >
            <Share2 className="h-4 w-4 text-gold" />
            <span>{l(content.ui.shareWhatsapp)}</span>
          </a>

          <button
            type="button"
            onClick={handleCopyLink}
            className="flex min-h-[44px] items-center gap-2 rounded-lg border border-gold/35 bg-[#122042] px-3.5 py-2 text-sm text-cream hover:border-gold whitespace-nowrap"
          >
            {linkCopied ? <Check className="h-4 w-4 text-peacock" /> : <Copy className="h-4 w-4 text-gold" />}
            <span>{linkCopied ? l(content.ui.linkCopied) : l(content.ui.copyLink)}</span>
          </button>

          <button
            type="button"
            onClick={handleNativeShare}
            className="flex min-h-[44px] items-center gap-2 rounded-lg border border-gold/35 bg-[#122042] px-3.5 py-2 text-sm text-cream hover:border-gold whitespace-nowrap"
          >
            <Share2 className="h-4 w-4 text-gold" />
            <span>{l(content.ui.nativeShare)}</span>
          </button>

          <button
            type="button"
            onClick={() => downloadSaveTheDateCard(language)}
            className="flex min-h-[44px] items-center gap-2 rounded-lg border border-gold/35 bg-[#122042] px-3.5 py-2 text-sm text-cream hover:border-gold whitespace-nowrap"
          >
            <Download className="h-4 w-4 text-gold" />
            <span>{l(content.ui.saveTheDate)}</span>
          </button>
        </div>

        {/* Family Helplines */}
        <div className="mt-5 border-t border-gold/15 pt-4">
          <p className="text-xs font-medium tracking-wide text-gold">
            {l(content.ui.helplinesTitle)}
          </p>
          <div className="mt-2 flex flex-wrap gap-3">
            {content.rsvp.helplines.map((line, idx) => (
              <a
                key={idx}
                href={`tel:${line.phone}`}
                className="flex min-h-[44px] items-center gap-2 text-sm text-cream/90 underline-offset-4 hover:text-gold hover:underline"
              >
                <Phone className="h-4 w-4 text-gold shrink-0" />
                <span>{l(line.label)}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

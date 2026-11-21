import { useMemo, useState } from 'react';
import { Check, Copy, X } from 'lucide-react';
import { content } from '../content/content';
import { useLocalized } from '../content/useLocalized';
import { useAppStore } from '../core/store';
import { detectInAppBrowser, formatIstDateTime } from '../utils/invitation';

/**
 * Dismissible banner shown only when opened inside Instagram / Facebook / Line / Snapchat
 * in-app browsers that restrict WebGL or audio autoplay (FR-17).
 */
export function InAppBrowserBanner() {
  const l = useLocalized();
  const [dismissed, setDismissed] = useState(false);
  const [copied, setCopied] = useState(false);

  const isInApp = useMemo(
    () => (typeof navigator !== 'undefined' ? detectInAppBrowser(navigator.userAgent) : false),
    [],
  );

  if (!isInApp || dismissed) return null;

  const copyCurrentUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      // ignore
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      role="region"
      aria-label="Browser recommendation"
      className="pointer-events-auto fixed inset-x-3 bottom-3 z-50 mx-auto flex max-w-xl items-center justify-between gap-3 rounded-lg border border-gold/50 bg-[#0F1B3A] px-4 py-3 text-sm text-cream shadow-xl"
    >
      <p className="leading-snug">{l(content.ui.inAppBanner)}</p>
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={copyCurrentUrl}
          className="flex min-h-[40px] items-center gap-1.5 rounded-md bg-gold px-3 text-xs font-semibold text-midnight whitespace-nowrap"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          <span>{copied ? l(content.ui.copied) : l(content.ui.inAppAction)}</span>
        </button>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label={l(content.ui.close)}
          className="flex h-10 w-10 items-center justify-center rounded-md text-cream/80 hover:text-gold"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/** Graceful WebGL context-loss recovery dialog with one-tap switch to Lite Mode. */
export function WebGLRecoveryModal() {
  const webglLost = useAppStore((s) => s.webglLost);
  const setQuality = useAppStore((s) => s.setQuality);
  const setWebglLost = useAppStore((s) => s.setWebglLost);
  const l = useLocalized();

  if (!webglLost) return null;

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="webgl-lost-title"
      className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center bg-midnight/95 p-6"
    >
      <div className="w-full max-w-md rounded-xl border border-gold/40 bg-[#0F1B3A] p-6 text-center shadow-2xl">
        <h2 id="webgl-lost-title" className="text-xl font-semibold text-gold">
          {l(content.ui.webglLostTitle)}
        </h2>
        <p className="mt-2 text-base text-cream/85">{l(content.ui.webglLostBody)}</p>
        <button
          type="button"
          onClick={() => {
            setWebglLost(false);
            setQuality('lite');
          }}
          className="mt-5 min-h-[48px] w-full rounded-lg bg-gold px-6 py-3 text-base font-semibold text-midnight hover:bg-[#E2B854]"
        >
          {l(content.ui.switchToLite)}
        </button>
      </div>
    </div>
  );
}

/**
 * Screen-reader semantic mirror (sr-only) ensuring names, date, muhurat, venue,
 * schedule, and contacts exist as immediately reachable real HTML text even when
 * the decorative 3D canvas is active.
 */
export function ScreenReaderMirror() {
  const language = useAppStore((s) => s.language);
  const l = useLocalized();
  const dt = formatIstDateTime(content.date.muhuratIso, language);

  return (
    <aside className="sr-only" aria-label="Complete Wedding Invitation Text Summary">
      <h1>{l(content.meta.title)}</h1>
      <p>{l(content.invocation.primary)}</p>
      <p>
        {l(content.couple.groom.name)} ({l(content.couple.groom.family)}) &amp;{' '}
        {l(content.couple.bride.name)} ({l(content.couple.bride.family)})
      </p>
      <p>
        {dt.fullDate} — {l(content.date.muhuratLabel)}
      </p>
      <p>
        {l(content.venue.name)}, {l(content.venue.address)}
      </p>
      <ul>
        {content.events.map((ev) => {
          const evDt = formatIstDateTime(ev.startIso, language);
          return (
            <li key={ev.id}>
              {l(ev.name)}: {evDt.fullDate} {evDt.time}
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

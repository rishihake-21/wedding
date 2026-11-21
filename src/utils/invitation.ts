/**
 * Pure domain utilities for the wedding invitation:
 * - Marathi numerals and IST (Asia/Kolkata) formatting
 * - Live countdown calculation
 * - .ics calendar file generation & Google Calendar URLs
 * - RSVP validation, Apps Script POST, and WhatsApp fallback links
 * - Personalized guest name parsing, in-app browser & wedding-day detection
 * - Client-side Save-the-Date image generation
 */

import { content, type EventEntry, type WeddingContent } from '../content/content';
import type { Lang } from '../core/types';
import { colors } from '../theme/tokens';

const MARATHI_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'] as const;

/** Converts ASCII digits 0-9 to Devanagari numerals ०-९. */
export function toMarathiDigits(input: string | number): string {
  return String(input).replace(/\d/g, (d) => MARATHI_DIGITS[Number(d)]);
}

/** Formats a number/string in Marathi numerals when `lang === 'mr'`. */
export function localizeDigits(input: string | number, lang: Lang): string {
  return lang === 'mr' ? toMarathiDigits(input) : String(input);
}

export interface CountdownParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

/** Computes remaining days, hours, minutes, seconds to target ISO timestamp. */
export function computeCountdown(targetIso: string, nowMs: number = Date.now()): CountdownParts {
  const targetMs = Date.parse(targetIso);
  if (Number.isNaN(targetMs) || nowMs >= targetMs) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  }
  const totalSeconds = Math.floor((targetMs - nowMs) / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds, isPast: false };
}

export interface FormattedDateParts {
  weekday: string;
  day: string;
  month: string;
  year: string;
  time: string;
  fullDate: string;
}

const MR_WEEKDAYS: Record<string, string> = {
  Sun: 'रविवार',
  Mon: 'सोमवार',
  Tue: 'मंगळवार',
  Wed: 'बुधवार',
  Thu: 'गुरुवार',
  Fri: 'शुक्रवार',
  Sat: 'शनिवार',
};

const MR_MONTHS: Record<string, string> = {
  '01': 'जानेवारी',
  '02': 'फेब्रुवारी',
  '03': 'मार्च',
  '04': 'एप्रिल',
  '05': 'मे',
  '06': 'जून',
  '07': 'जुलै',
  '08': 'ऑगस्ट',
  '09': 'सप्टेंबर',
  '10': 'ऑक्टोबर',
  '11': 'नोव्हेंबर',
  '12': 'डिसेंबर',
};

const EN_MONTHS: Record<string, string> = {
  '01': 'January',
  '02': 'February',
  '03': 'March',
  '04': 'April',
  '05': 'May',
  '06': 'June',
  '07': 'July',
  '08': 'August',
  '09': 'September',
  '10': 'October',
  '11': 'November',
  '12': 'December',
};

const EN_WEEKDAYS: Record<string, string> = {
  Sun: 'Sunday',
  Mon: 'Monday',
  Tue: 'Tuesday',
  Wed: 'Wednesday',
  Thu: 'Thursday',
  Fri: 'Friday',
  Sat: 'Saturday',
};

/**
 * Deterministically formats an ISO timestamp in `Asia/Kolkata` (IST) so results
 * never vary across browser ICU locales or device timezones.
 */
export function formatIstDateTime(iso: string, lang: Lang): FormattedDateParts {
  const date = new Date(iso);
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    weekday: 'short',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const parts: Record<string, string> = {};
  for (const part of formatter.formatToParts(date)) {
    if (part.type !== 'literal') parts[part.type] = part.value;
  }

  const dayNum = String(Number(parts.day ?? '1'));
  const monthCode = parts.month ?? '01';
  const yearNum = parts.year ?? '2027';
  const weekdayShort = parts.weekday ?? 'Sun';
  const hourNum = String(Number(parts.hour ?? '12'));
  const minuteStr = parts.minute ?? '00';
  const dayPeriod = (parts.dayPeriod ?? 'AM').toUpperCase();

  if (lang === 'mr') {
    const mrPeriod =
      dayPeriod === 'AM'
        ? 'सकाळी'
        : Number(hourNum) >= 7 && Number(hourNum) < 12
          ? 'संध्याकाळी'
          : 'दुपारी';
    const day = toMarathiDigits(dayNum);
    const month = MR_MONTHS[monthCode] ?? monthCode;
    const year = toMarathiDigits(yearNum);
    const weekday = MR_WEEKDAYS[weekdayShort] ?? weekdayShort;
    const time = `${mrPeriod} ${toMarathiDigits(hourNum)}:${toMarathiDigits(minuteStr)}`;
    return {
      weekday,
      day,
      month,
      year,
      time,
      fullDate: `${weekday}, ${day} ${month} ${year}`,
    };
  }

  const month = EN_MONTHS[monthCode] ?? monthCode;
  const weekday = EN_WEEKDAYS[weekdayShort] ?? weekdayShort;
  const time = `${hourNum}:${minuteStr} ${dayPeriod} IST`;
  return {
    weekday,
    day: dayNum,
    month,
    year: yearNum,
    time,
    fullDate: `${weekday}, ${dayNum} ${month} ${yearNum}`,
  };
}

/** Formats a UTC Date as YYYYMMDDTHHMMSSZ for RFC 5545 .ics and Google Calendar. */
export function toIcsUtcStamp(isoOrDate: string | Date): string {
  const d = typeof isoOrDate === 'string' ? new Date(isoOrDate) : isoOrDate;
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    d.getUTCFullYear().toString() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    'T' +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    'Z'
  );
}

function escapeIcsText(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

/** Builds a valid RFC 5545 VCALENDAR (.ics) string compatible with Google, Apple & Outlook. */
export function buildIcsContent(
  wedding: WeddingContent = content,
  lang: Lang = 'en',
  now: Date = new Date(),
): string {
  const summary = `${wedding.couple.groom.name[lang]} & ${wedding.couple.bride.name[lang]} — ${wedding.meta.title[lang]}`;
  const location = `${wedding.venue.name[lang]}, ${wedding.venue.address[lang]}`;
  const description = [
    wedding.date.muhuratLabel[lang],
    wedding.venue.landmark ? wedding.venue.landmark[lang] : '',
    wedding.venue.mapsUrl,
  ]
    .filter(Boolean)
    .join('\n');

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Vrindavan Wedding Invitation//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:wedding-${toIcsUtcStamp(wedding.date.muhuratIso)}@vrindavan-invite`,
    `DTSTAMP:${toIcsUtcStamp(now)}`,
    `DTSTART:${toIcsUtcStamp(wedding.date.muhuratIso)}`,
    `DTEND:${toIcsUtcStamp(wedding.date.endIso)}`,
    `SUMMARY:${escapeIcsText(summary)}`,
    `LOCATION:${escapeIcsText(location)}`,
    `DESCRIPTION:${escapeIcsText(description)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  return lines.join('\r\n') + '\r\n';
}

export function downloadIcsFile(lang: Lang): void {
  const ics = buildIcsContent(content, lang);
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'krushna-devika-wedding.ics';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Builds a Google Calendar event creation URL. */
export function buildGoogleCalendarUrl(wedding: WeddingContent = content, lang: Lang = 'en'): string {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: wedding.meta.title[lang],
    dates: `${toIcsUtcStamp(wedding.date.muhuratIso)}/${toIcsUtcStamp(wedding.date.endIso)}`,
    details: `${wedding.date.muhuratLabel[lang]}\n${wedding.venue.mapsUrl}`,
    location: `${wedding.venue.name[lang]}, ${wedding.venue.address[lang]}`,
    ctz: wedding.date.timeZone,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

// ---------------------------------------------------------------------------
// RSVP validation & submission
// ---------------------------------------------------------------------------

export interface RsvpPayload {
  name: string;
  guests: number;
  events: string[];
  message: string;
  /** Honeypot field — must stay empty for real guests. */
  website?: string;
}

export interface RsvpValidationResult {
  valid: boolean;
  errorKey?: 'rsvpErrorName' | 'rsvpErrorGuests';
  isBot?: boolean;
}

export function validateRsvpForm(payload: RsvpPayload): RsvpValidationResult {
  if (payload.website && payload.website.trim().length > 0) {
    return { valid: false, isBot: true };
  }
  if (!payload.name || payload.name.trim().length < 2) {
    return { valid: false, errorKey: 'rsvpErrorName' };
  }
  if (!Number.isInteger(payload.guests) || payload.guests < 1 || payload.guests > 10) {
    return { valid: false, errorKey: 'rsvpErrorGuests' };
  }
  return { valid: true };
}

/** Builds a pre-filled WhatsApp RSVP link (`wa.me`). */
export function buildWhatsAppRsvpUrl(
  payload: Pick<RsvpPayload, 'name' | 'guests' | 'events' | 'message'>,
  lang: Lang,
  eventsList: EventEntry[] = content.events,
  whatsappNumber: string = content.rsvp.whatsappNumber,
): string {
  const selectedNames = eventsList
    .filter((ev) => payload.events.includes(ev.id))
    .map((ev) => ev.name[lang]);

  const guestName = payload.name.trim() || (lang === 'mr' ? 'पाहुणे' : 'Guest');
  const text =
    lang === 'mr'
      ? [
          `नमस्कार! ${content.meta.title.mr} साठी उपस्थिती नोंद:`,
          `नाव: ${guestName}`,
          `पाहुणे: ${toMarathiDigits(payload.guests)}`,
          selectedNames.length > 0 ? `कार्यक्रम: ${selectedNames.join(', ')}` : '',
          payload.message.trim() ? `शुभेच्छा: ${payload.message.trim()}` : '',
        ]
          .filter(Boolean)
          .join('\n')
      : [
          `Namaskar! RSVP for ${content.meta.title.en}:`,
          `Name: ${guestName}`,
          `Guests: ${payload.guests}`,
          selectedNames.length > 0 ? `Events: ${selectedNames.join(', ')}` : '',
          payload.message.trim() ? `Message: ${payload.message.trim()}` : '',
        ]
          .filter(Boolean)
          .join('\n');

  const cleanNumber = whatsappNumber.replace(/[^\d]/g, '');
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(text)}`;
}

export function buildWhatsAppShareUrl(lang: Lang, shareUrl: string): string {
  const message =
    lang === 'mr'
      ? `${content.invocation.primary.mr}\n${content.meta.title.mr}\n${content.meta.description.mr}\n${shareUrl}`
      : `${content.meta.title.en}\n${content.meta.description.en}\n${shareUrl}`;
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

/**
 * Submits RSVP to the configured Google Apps Script endpoint using `text/plain`
 * so the browser skips the CORS preflight. When no endpoint is configured,
 * persists locally in localStorage so the family can test end-to-end offline.
 */
export async function submitRsvp(
  payload: RsvpPayload,
  lang: Lang,
  endpoint: string = content.rsvp.endpoint,
): Promise<{ ok: boolean; mode: 'remote' | 'local' }> {
  const record = {
    timestamp: new Date().toISOString(),
    name: payload.name.trim(),
    guests: payload.guests,
    events: payload.events,
    message: payload.message.trim(),
    language: lang,
  };

  try {
    const existingRaw = window.localStorage.getItem('wed.rsvps');
    const list = existingRaw ? (JSON.parse(existingRaw) as unknown[]) : [];
    list.push(record);
    window.localStorage.setItem('wed.rsvps', JSON.stringify(list));
  } catch {
    // Storage optional in private browsing.
  }

  if (!endpoint.trim()) {
    return { ok: true, mode: 'local' };
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(record),
  });

  if (!response.ok) {
    throw new Error(`RSVP HTTP ${response.status}`);
  }
  return { ok: true, mode: 'remote' };
}

// ---------------------------------------------------------------------------
// Personalization, Wedding-day mode, In-app browser detection
// ---------------------------------------------------------------------------

/** Sanitizes `?guest=` URL parameter for display (max 48 chars, plain text). */
export function parseGuestName(search: string): string | null {
  const params = new URLSearchParams(search);
  const raw = params.get('guest');
  if (!raw) return null;
  const cleaned = raw.replace(/[<>]/g, '').trim().slice(0, 48);
  return cleaned.length > 0 ? cleaned : null;
}

/** True when current timestamp is on or after 00:00 IST of the wedding day (up to +24h). */
export function isWeddingDay(muhuratIso: string, nowMs: number = Date.now()): boolean {
  const match = muhuratIso.match(/^(\d{4}-\d{2}-\d{2})/);
  if (!match) return false;
  const dayStartMs = Date.parse(`${match[1]}T00:00:00+05:30`);
  const dayEndMs = dayStartMs + 24 * 60 * 60 * 1000;
  return nowMs >= dayStartMs && nowMs < dayEndMs;
}

/** Detects Instagram, Facebook, Snapchat, or Line in-app browsers that throttle WebGL/audio. */
export function detectInAppBrowser(userAgent: string): boolean {
  return /FBAN|FBAV|Instagram|Line\/|Snapchat|MicroMessenger/i.test(userAgent);
}

/** Generates a crisp Save-the-Date PNG card on an offscreen canvas and triggers download. */
export function downloadSaveTheDateCard(lang: Lang): void {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 1500;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Deep midnight-indigo gradient sky
  const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
  bg.addColorStop(0, '#070E22');
  bg.addColorStop(0.55, colors.midnight);
  bg.addColorStop(1, '#092B36');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Moon glow
  const moonGlow = ctx.createRadialGradient(600, 310, 30, 600, 310, 360);
  moonGlow.addColorStop(0, 'rgba(255, 244, 220, 0.25)');
  moonGlow.addColorStop(0.5, 'rgba(212, 166, 64, 0.08)');
  moonGlow.addColorStop(1, 'rgba(11, 21, 48, 0)');
  ctx.fillStyle = moonGlow;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Ornamental double gold frame
  ctx.strokeStyle = colors.gold;
  ctx.lineWidth = 3;
  ctx.strokeRect(48, 48, canvas.width - 96, canvas.height - 96);
  ctx.strokeStyle = 'rgba(212, 166, 64, 0.45)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(66, 66, canvas.width - 132, canvas.height - 132);

  // Stylized lotus emblem at top
  ctx.save();
  ctx.translate(600, 225);
  for (let i = -3; i <= 3; i++) {
    ctx.save();
    ctx.rotate(i * 0.24);
    ctx.beginPath();
    ctx.ellipse(0, -34, 15, 42, 0, 0, Math.PI * 2);
    ctx.fillStyle = i === 0 ? colors.gold : 'rgba(232, 160, 180, 0.85)';
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();

  ctx.textAlign = 'center';
  ctx.fillStyle = colors.gold;
  ctx.font = '500 34px Georgia, serif';
  ctx.fillText(content.invocation.primary[lang], 600, 340);

  ctx.fillStyle = colors.cream;
  ctx.font = '600 92px Georgia, serif';
  ctx.fillText(content.couple.groom.name[lang], 600, 520);

  ctx.fillStyle = colors.gold;
  ctx.font = 'italic 44px Georgia, serif';
  ctx.fillText('&', 600, 600);

  ctx.fillStyle = colors.cream;
  ctx.font = '600 92px Georgia, serif';
  ctx.fillText(content.couple.bride.name[lang], 600, 705);

  // Divider
  ctx.strokeStyle = colors.gold;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(410, 785);
  ctx.lineTo(790, 785);
  ctx.stroke();

  const dt = formatIstDateTime(content.date.muhuratIso, lang);
  ctx.fillStyle = colors.gold;
  ctx.font = '600 44px Georgia, serif';
  ctx.fillText(dt.fullDate, 600, 880);

  ctx.fillStyle = colors.cream;
  ctx.font = '400 32px sans-serif';
  ctx.fillText(content.date.muhuratLabel[lang], 600, 945);

  ctx.fillStyle = 'rgba(255, 244, 220, 0.85)';
  ctx.font = '500 34px Georgia, serif';
  ctx.fillText(content.venue.name[lang], 600, 1085);

  ctx.fillStyle = 'rgba(255, 244, 220, 0.72)';
  ctx.font = '400 26px sans-serif';
  ctx.fillText(content.venue.address[lang], 600, 1140);

  ctx.fillStyle = colors.gold;
  ctx.font = '400 30px Georgia, serif';
  ctx.fillText(content.families.invitationLine[lang], 600, 1295);

  const link = document.createElement('a');
  link.download = `save-the-date-${lang}.png`;
  link.href = canvas.toDataURL('image/png');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

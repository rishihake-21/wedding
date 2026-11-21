import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildGoogleCalendarUrl,
  buildIcsContent,
  buildWhatsAppRsvpUrl,
  computeCountdown,
  detectInAppBrowser,
  formatIstDateTime,
  isWeddingDay,
  parseGuestName,
  toIcsUtcStamp,
  toMarathiDigits,
  validateRsvpForm,
} from './invitation';
import { content } from '../content/content';

test('toMarathiDigits converts ASCII numerals to Devanagari digits', () => {
  assert.equal(toMarathiDigits('24 January 2027, 11:32'), '२४ January २०२७, ११:३२');
  assert.equal(toMarathiDigits(0), '०');
  assert.equal(toMarathiDigits(9876543210), '९८७६५४३२१०');
});

test('computeCountdown calculates exact remaining days, hours, minutes, seconds', () => {
  const target = '2027-01-24T11:32:00+05:30';
  const targetMs = Date.parse(target);
  const deltaMs = (3 * 86400 + 4 * 3600 + 15 * 60 + 42) * 1000;
  const parts = computeCountdown(target, targetMs - deltaMs);
  assert.deepEqual(parts, { days: 3, hours: 4, minutes: 15, seconds: 42, isPast: false });

  const past = computeCountdown(target, targetMs + 1000);
  assert.equal(past.isPast, true);
  assert.equal(past.days, 0);
});

test('formatIstDateTime formats IST consistently in Marathi and English', () => {
  const iso = '2027-01-24T11:32:00+05:30';
  const en = formatIstDateTime(iso, 'en');
  assert.equal(en.weekday, 'Sunday');
  assert.equal(en.day, '24');
  assert.equal(en.month, 'January');
  assert.equal(en.year, '2027');
  assert.match(en.time, /11:32 AM IST/);

  const mr = formatIstDateTime(iso, 'mr');
  assert.equal(mr.weekday, 'रविवार');
  assert.equal(mr.day, '२४');
  assert.equal(mr.month, 'जानेवारी');
  assert.equal(mr.year, '२०२७');
  assert.match(mr.time, /११:३२/);
});

test('buildIcsContent produces RFC 5545 VCALENDAR with exact UTC conversion for IST', () => {
  const ics = buildIcsContent(content, 'en', new Date('2026-11-20T00:00:00Z'));
  assert.ok(ics.includes('BEGIN:VCALENDAR'));
  assert.ok(ics.includes('BEGIN:VEVENT'));
  assert.ok(ics.includes('END:VEVENT'));
  assert.ok(ics.includes('END:VCALENDAR'));
  // 2027-01-24T11:32:00+05:30 === 2027-01-24T06:02:00Z
  assert.equal(toIcsUtcStamp('2027-01-24T11:32:00+05:30'), '20270124T060200Z');
  assert.ok(ics.includes('DTSTART:20270124T060200Z'));
});

test('buildGoogleCalendarUrl includes IST timezone and event dates', () => {
  const url = buildGoogleCalendarUrl(content, 'en');
  assert.ok(url.startsWith('https://calendar.google.com/calendar/render?'));
  assert.ok(url.includes('ctz=Asia%2FKolkata'));
  assert.ok(url.includes('20270124T060200Z'));
});

test('validateRsvpForm rejects empty names, invalid guest counts, and honeypot bots', () => {
  assert.equal(validateRsvpForm({ name: '', guests: 2, events: ['lagna'], message: '' }).errorKey, 'rsvpErrorName');
  assert.equal(validateRsvpForm({ name: 'A', guests: 2, events: ['lagna'], message: '' }).errorKey, 'rsvpErrorName');
  assert.equal(validateRsvpForm({ name: 'Rohan', guests: 0, events: ['lagna'], message: '' }).errorKey, 'rsvpErrorGuests');
  assert.equal(validateRsvpForm({ name: 'Rohan', guests: 12, events: ['lagna'], message: '' }).errorKey, 'rsvpErrorGuests');
  assert.equal(
    validateRsvpForm({ name: 'Bot', guests: 2, events: ['lagna'], message: '', website: 'http://spam.example' }).isBot,
    true,
  );
  assert.equal(validateRsvpForm({ name: 'Rohan Patil', guests: 3, events: ['lagna'], message: 'Congrats!' }).valid, true);
});

test('buildWhatsAppRsvpUrl encodes guest details and localized event names', () => {
  const url = buildWhatsAppRsvpUrl(
    { name: 'Rohan', guests: 2, events: ['haldi', 'lagna'], message: 'See you!' },
    'en',
  );
  assert.ok(url.startsWith('https://wa.me/919822001008?text='));
  const decoded = decodeURIComponent(url.split('text=')[1]);
  assert.ok(decoded.includes('Rohan'));
  assert.ok(decoded.includes('Haldi Ceremony'));
  assert.ok(decoded.includes('Lagna'));
});

test('parseGuestName, isWeddingDay, and detectInAppBrowser behave predictably', () => {
  assert.equal(parseGuestName('?guest=Rohan+Patil'), 'Rohan Patil');
  assert.equal(parseGuestName('?guest=<b>Test</b>'), 'bTest/b');
  assert.equal(parseGuestName(''), null);

  assert.equal(isWeddingDay('2027-01-24T11:32:00+05:30', Date.parse('2027-01-24T09:00:00+05:30')), true);
  assert.equal(isWeddingDay('2027-01-24T11:32:00+05:30', Date.parse('2027-01-23T23:59:00+05:30')), false);

  assert.equal(detectInAppBrowser('Mozilla/5.0 Instagram 302.0'), true);
  assert.equal(detectInAppBrowser('Mozilla/5.0 Chrome/120.0.0.0 Safari/537.36'), false);
});

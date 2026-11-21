# Launch QA Checklist (Section 14)

## 1. Functional
- [ ] Entry Gate diya loader reaches 100%, unlocks audio on tap, and launches Part A.
- [ ] Language toggle (`मराठी` / `English`) translates 100% of copy and persists across reloads.
- [ ] Global mute toggle works and audio fades/pauses when the browser tab is hidden.
- [ ] Skip Intro jumps cleanly to Part B (Date) with diya-light flash.
- [ ] Menu jump links reach Date, Venue, Schedule, Families, and RSVP in under 10 seconds.
- [ ] Live countdown matches `content.date.muhuratIso` in `Asia/Kolkata` (IST).
- [ ] `.ics` download imports cleanly into Google Calendar, Apple Calendar, and Outlook.
- [ ] Google Calendar link opens with exact IST date, muhurat, and venue address.
- [ ] Venue Maps link, Copy Address button, and `tel:` call button all work on mobile.
- [ ] RSVP form validates empty name, rejects honeypot bots, submits to Google Apps Script Sheet, and offers WhatsApp fallback.
- [ ] Share on WhatsApp, Copy Link, Web Share API, and Save-the-Date PNG download all succeed.
- [ ] Personalized greeting (`?guest=Name`) and Wedding-Day mode (`?weddingday=1`) render accurately.

## 2. Content & Cultural Proofreading
- [ ] Marathi names, prefixes (`चि.` / `चि.सौ.कां.`), family lines, tithi, muhurat, and closing line proofread by a fluent reader and an elder.
- [ ] All conjunct characters (श्री, कृष्ण, सस्नेह, निमंत्रण, शुभमंगल, स्वागत) verified in Tiro Devanagari Marathi & Mukta.
- [ ] Venue address, landmark, parking, and helpline numbers verified against the printed invitation.

## 3. Performance & Fallbacks
- [ ] Hold 30+ fps on mid-range Android Chrome (4 GB RAM) at Medium tier; Enter screen interactive < 3s on 4G.
- [ ] Lite Mode (2D parallax) auto-activates on data-saver / no WebGL and delivers 100% of invitation details.
- [ ] `prefers-reduced-motion` replaces camera flights with calm crossfades.
- [ ] WebGL context-loss recovery dialog offers one-tap switch to Lite Mode.
- [ ] In-app browser banner ("Open in browser") appears in Instagram/Facebook webviews.

## 4. Accessibility & Link Preview
- [ ] Tap targets >= 44px; body text >= 16px; WCAG AA contrast >= 4.5:1 on overlays.
- [ ] Keyboard navigation (Tab, Enter, Escape, ArrowUp/Down, M) reaches all controls with visible focus rings.
- [ ] WhatsApp link preview displays title, description, and 1200×630 preview card (`og:image`).
- [ ] `<meta name="robots" content="noindex, nofollow">` verified in `index.html`.

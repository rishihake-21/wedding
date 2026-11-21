# Vrindavan Wedding Invitation — Cinematic 3D Website

*Requirements and direction · Maharashtrian wedding · Groom: Krushna · Draft v1 · 16 November 2026*

## 1. Overview

A shareable invitation link that plays like a short film. Guests open it from WhatsApp, step into a moonlit Vrindavan built in 3D, and watch the story unfold: an invocation, the groom’s and bride’s introductions, the date and time revealed, the venue revealed, and finally the schedule and RSVP.

The Vrindavan theme comes from the groom’s name, Krushna. The 3D world uses Vrindavan’s symbols (bansuri, peacock feather, kadamba tree, lotus, Yamuna, diyas), while the content, rituals and attire stay firmly Maharashtrian.

**Goals**

- Create a “wow” in the first 10 seconds and keep guests watching to the end.
- Deliver the essentials without friction: names, date, muhurat, venue, schedule, RSVP.
- Run smoothly on mid-range phones, because most guests will open the link on a phone.
- Work fully in Marathi and English.

**Non-goals (v1)**

- Gift registry, payments, seating charts or a full guest-management system.
- A native mobile app.
- Live streaming (a link can be added on the wedding day).

**Success criteria**

- The Enter screen is interactive in under 3 seconds on 4G.
- The 3D experience holds at least 30 fps (target 60) on a mid-range Android phone.
- At any moment, a guest can reach the date, venue or RSVP within 10 seconds using the skip and menu controls.
- RSVP responses land reliably in one place the family can read.

## 2. Audience and usage context

- Guests range from grandparents to friends: large tap targets, readable text, no hidden gestures.
- The primary device is a phone, opened from a WhatsApp link. The secondary device is a laptop.
- Networks can be weak (guests in towns and villages), so a lite mode is required.
- Most guests visit more than once: first for the story, later to look up the date, venue and directions. Repeat visits must be fast.
- Language: Marathi first, English alongside. Hindi is optional.

## 3. Creative direction

**Concept.** “Krushna’s Vrindavan”: a night journey from the Yamuna ghat, through a kadamba grove, to the wedding mandap. Story arc: Invocation → Two worlds → Union → Invitation.

**Mood.** Devotional, romantic, magical. Slow cinematic camera, warm lamp light against deep blue night. Never cartoonish or comedic.

**Vrindavan motifs:** bansuri, peacock feather (morpis), kadamba tree, lotus, Yamuna ripples, floating diyas, fireflies, cows, a flower-decked swing (jhula), the Raas circle, Pichwai-style painting aesthetic.

**Maharashtrian motifs:** Ganpati invocation, Paithani peacock borders, Nauvari saree, pheta, mundavalya (pearl forehead strings), nath, chandrakor bindi, green bangles, marigold torans, rangoli, haldi, and the antarpat (the cloth held between the couple during Mangalashtak). The peacock links both worlds: Krushna’s feather and the Paithani border.

**Palette (starting point):** midnight indigo #0B1530, Yamuna teal #0F6E7A, peacock green #1B7F5C, gold #D4A640, marigold #F28C28, lotus pink #E8A0B4, cream #FFF4DC.

**Typography:** a Devanagari display face for Marathi (for example Tiro Devanagari Marathi or Yatra One), an elegant serif for English (Cormorant Garamond or Cinzel), and Mukta or Noto Sans for body text. Self-host subsetted WOFF2 files and test every conjunct character used in the copy.

**Audio:** an ambient bansuri bed, a soft tabla or shehnai swell at the date reveal, and gentle bells at the venue reveal. Instrumental only. Use licensed or custom-recorded music, not ripped film or bhajan tracks (copyright takedown risk).

**Decisions to confirm with the family**

- Symbolic versus literal: show Vrindavan through symbols (flute, feather, kadamba) and depict the couple as stylised figures in Maharashtrian attire, rather than depicting the deity. This is the recommendation; elders should confirm.
- Marathi names, prefixes and order of names (for example चि. for the groom and चि.सौ.कां. for the bride, if the family follows that convention).
- Any family-specific invocations (for example the kuladevata).

## 4. Experience structure

The site has two parts. **Part A** is an auto-playing cinematic opening of about 40 seconds, skippable at any time. **Part B** is a scroll-driven journey of roughly 6–8 screens where the camera follows a path through the world. A minimal persistent menu lets guests jump straight to Date, Venue, Schedule or RSVP.

**Part A — Cinematic opening**

**Scene 0 — Entry gate (loader)**

- A single diya on a dark screen; loading progress shown as the flame growing or lotus petals opening.
- Language choice (मराठी / English) and a large Enter button. Tapping Enter unlocks audio (browsers block autoplay sound) and starts the film.
- Small toggles for sound and lite mode.

**Scene 1 — Invocation (about 8 s)**

- Night sky with moon and stars; the Yamuna with ripples and moon reflection; diyas floating past; fireflies; low mist.
- The camera glides slowly forward just above the water.
- Text fades in: ॥ श्री गणेशाय नमः ॥ plus any family invocation.
- Audio: the bansuri enters softly.

**Scene 2 — The groom’s world (about 10 s)**

- The camera rises onto the bank into a kadamba grove; peacock feathers drift; a flute melody is traced as a ribbon of light.
- A stylised groom figure appears; his name is revealed in gold (Krushna / कृष्ण) with the family line.
- The feathers dissolve into the next scene.

**Scene 3 — The bride’s world (about 10 s)**

- A mirrored composition: a lotus pond, drifting petals, and a Paithani border unfurling like a ribbon as the bride’s name is revealed.
- Anklet-bell sound; the family line appears.

**Scene 4 — Union (about 10 s)**

- Two light trails (the flute ribbon and a petal trail) spiral toward each other under the kadamba tree and the swing.
- An antarpat (silk cloth) parts to reveal the couple, as stylised figures or a pre-wedding photo with depth parallax. The names merge into a monogram.
- A soft flash of diya light carries the guest into Part B.

**Part B — Scroll journey**

**Scene 5 — Date and time reveal**

- A large lotus blooms; the date lights up digit by digit like diyas being lit, with a moon phase drifting behind.
- Show weekday, date and muhurat in Marathi and English (Marathi numerals in the Marathi version).
- A live countdown (days, hours, minutes) to the muhurat, and an Add to calendar button.

**Scene 6 — Venue reveal**

- The camera follows a glowing path (the flute’s light trail) toward the venue: a stylised 3D mandap or building with marigold torans and lamps turning on one by one.
- Venue name and address appear, with buttons for Open in Maps, Copy address and Call.
- Optional: landmark, parking and stay information for outstation guests.

**Scene 7 — Ceremonies timeline**

- Events (for example Sakharpuda, Haldi, Mehendi, Sangeet, Simant Pujan, Lagna, Reception) shown as cards on a circular Raas-style carousel or along the riverbank, each revealing as the camera passes.
- Each card carries the event name, date, time, venue and optional dress code. Include only the events the family wants to invite guests to.

**Scene 8 — Families and blessings**

- Names of parents, grandparents and hosts, with the traditional invitation lines (for example सस्नेह निमंत्रण). Final wording comes from the family.
- A soft blessing animation of falling marigold petals.

**Scene 9 — RSVP and actions**

- An RSVP form (name, number of guests, events attending, message), with a one-tap WhatsApp message to the host as an alternative.
- Actions: Share on WhatsApp, Copy link, Add to calendar, Download the save-the-date image.
- One or two family helpline numbers.

**Optional scene — Gallery.** Pre-wedding photos in a floating-lantern gallery.

## 5. Functional requirements

Priority: M = must have, S = should have, C = could have.

- FR-01 (M) Marathi/English toggle; 100% of copy translated; the choice persists.
- FR-02 (M) Enter gate that starts audio; global mute; audio fades and pauses when the tab is hidden.
- FR-03 (M) Skip intro at any time; menu to jump to Date, Venue, Schedule and RSVP.
- FR-04 (M) Camera driven by scroll and touch with a visible progress indicator; mouse wheel and arrow keys on desktop.
- FR-05 (M) Date and muhurat reveal with a countdown in IST.
- FR-06 (M) Venue block with a Maps link, copyable address and tap-to-call number.
- FR-07 (M) Event schedule.
- FR-08 (M) RSVP that stores responses where the family can read them (sheet or database), with a WhatsApp fallback.
- FR-09 (M) Add to calendar: an .ics file and a Google Calendar link.
- FR-10 (M) Share: WhatsApp share, native share sheet, copy link.
- FR-11 (M) Link preview: Open Graph title, description and image (1200×630, under about 300 KB) so the WhatsApp card looks right.
- FR-12 (M) Lite mode: automatic fallback (weak GPU, no WebGL, data saver) to a 2D parallax or video version with the same information, plus a manual toggle.
- FR-13 (M) Content lives in one editable file or CMS, so late changes to time or venue need no 3D rework.
- FR-14 (S) Personalised links (for example ?guest=name shows a “Dear …” greeting).
- FR-15 (S) Photo gallery.
- FR-16 (S) Wedding-day mode: after a set time the site opens on the live schedule, directions and a live-stream link.
- FR-17 (S) “Open in browser” banner when opened inside in-app browsers (Instagram, Facebook) that limit WebGL or audio.
- FR-18 (C) Playful interactions: tap diyas to light them, tap the flute to play notes, gyroscope parallax on phones.
- FR-19 (C) Blessing wall: guests leave a short message that appears as a floating diya (needs moderation).

## 6. 3D and animation requirements

**Engine and tools**

- Three.js through React Three Fiber and drei (WebGL2).
- GSAP or Theatre.js for the timeline (Theatre.js gives visual keyframing for camera and object choreography).
- Post-processing: selective bloom, subtle vignette and film grain, tone mapping. Depth of field on high-tier devices only.

**Camera**

- One camera rig following a spline path (CatmullRomCurve3) mapped to scroll progress, with eased look-at targets and gentle field-of-view changes.
- No fast movement, shake or roll. Reduced-motion mode replaces camera flights with crossfades.

**World building blocks**

- Sky: gradient or HDRI, stars, moon.
- Water: custom shader with ripples, fresnel and a faked reflection.
- Fireflies, petals and floating diyas: instanced meshes or GPU particles.
- Flames: emissive sprites or shaders with bloom, not real-time lights.
- Foliage: vertex-shader wind sway on instanced grass and trees.
- Light shafts: faked with sprites or additive cones.

**Lighting**

- Baked lightmaps for static scenery; at most one or two real-time lights; no real-time shadows on mobile (use baked or blob shadows).

**Characters (needs a decision)**

- A. Stylised silhouettes or cut-out illustrations in 3D space. Cheapest; recommended for v1.
- B. 2.5D photo parallax: the couple’s photos with depth maps displaced in 3D. Strong emotional impact.
- C. Low-poly rigged 3D characters. Highest effort; needs a 3D artist.

**Text**

- Render Devanagari as HTML/CSS overlays or pre-rendered textures. Many WebGL text renderers mis-shape conjuncts; verify before relying on one.

**Transitions**

- No hard cuts: scene changes happen through camera moves, mist or a diya-light flash.
- Each scene has enter and exit hooks. The next scene’s assets preload while the current one plays, and a scene’s assets are disposed when it exits.

## 7. Performance and device support

**Target devices**

- Android: Chrome on mid-range phones (about 4 GB RAM). Lower-end devices must at least get lite mode.
- iPhone: Safari on iPhone XR and newer.
- Desktop: the latest two versions of Chrome, Edge, Safari and Firefox.

**Budgets (starting points; tune on real devices)**

- Initial JavaScript up to about 500 KB gzipped.
- Enter screen interactive in under 3 s on 4G; assets loaded before the Enter tap up to 3–5 MB.
- Whole experience up to 15–20 MB, streamed per scene.
- Each GLB model up to 1–2 MB after compression; KTX2 textures, 1024 px maximum on mobile (2048 px for hero assets).
- Up to about 100 draw calls and 300k triangles on mobile.
- Pixel ratio capped at 1.5 on mobile (2 on desktop), with adaptive resolution when the frame rate drops.
- Audio up to 3 MB in total, compressed and looped.

**Quality tiers**

- High, medium and low (3D) plus lite (2D), chosen from GPU detection (for example the detect-gpu library), device memory, the data-saver flag and a live FPS monitor that steps quality down.

**Reliability**

- Handle WebGL context loss gracefully.
- Cache assets with a service worker so repeat visits are quick.
- Free GPU memory when leaving a scene.

## 8. Content checklist (collect from the family)

- **Couple:** full names in English and Marathi, prefixes (for example चि. / चि.सौ.कां.), 4–8 high-resolution photos (portrait and landscape), optional short “our story” lines.
- **Families:** parents’ and grandparents’ names, relationship lines, who is inviting.
- **Date and time:** wedding date (English and Marathi numerals), muhurat, optional tithi, and the date and time of every event.
- **Venue:** name, full address in both languages, Google Maps link, landmark, parking, nearby stay information.
- **Invitation text:** invocation, welcome paragraph and closing line in Marathi and English, reviewed by elders.
- **RSVP:** deadline, WhatsApp number, two helpline numbers.
- **Media:** music tracks with licences, any family symbol or logo, dress-code notes.

## 9. Asset pipeline

- **Moodboard and style frames first.** Lock the look (Pichwai, Paithani, moonlit Vrindavan) with 4–6 still frames before writing code.
- **3D models:** build in Blender or source from Sketchfab, Poly Pizza or Quaternius. Log every licence, keep credits for CC-BY assets, and confirm commercial use is allowed.
- **Export:** Blender → GLB → compress with gltf-transform (Draco or Meshopt, KTX2 textures) → convert to React components with gltfjsx.
- **2D art:** layered illustrations as transparent WebP or AVIF for parallax. Commission an illustrator, or use AI-assisted art with manual cleanup, following the cultural points above.
- **Depth maps** for photo parallax: generated with a depth-estimation model and corrected by hand.
- **Audio:** licensed or custom bansuri, shehnai, tabla and bells, edited into seamless loops and exported compressed.
- **Fonts:** self-hosted, subsetted WOFF2 (Devanagari plus Latin).
- **Repository:** Git, with large assets in Git LFS or a separate assets folder; back up the source .blend files.

## 10. Technical architecture

- **Frontend:** Next.js or Vite with React and TypeScript; React Three Fiber, drei and postprocessing; Zustand for global state (scene, audio, language, quality tier); Tailwind for the DOM UI; a simple JSON dictionary for Marathi/English.
- **Content:** one structured file for names, dates, venue, schedule and copy, as the single source of truth.
- **RSVP backend (pick one):** Google Sheets through Apps Script (fastest), Supabase or Firebase (a real database), or a form service. Add a honeypot field and basic rate limiting, store minimal data (name, guest count, events, optional phone), and delete it after the event.
- **Hosting:** Vercel, Netlify or Cloudflare Pages with a CDN, Brotli compression, long-lived cache headers for assets, HTTPS and a custom domain.
- **Privacy:** add noindex so the invitation stays out of search results; keep personal data out of URLs beyond a display name; use privacy-friendly analytics only if needed (for example Plausible).
- **Browser APIs:** Web Audio, Web Share, Clipboard and Intl (use the Asia/Kolkata time zone for the date and countdown).

## 11. UX, accessibility and localisation

- Tap targets of at least 44 px and body text of at least 16 px. Text over 3D backgrounds sits on a soft gradient scrim for contrast (at least 4.5:1).
- Respect prefers-reduced-motion, and never flash faster than 3 times per second.
- Always-visible minimal controls: sound, language, skip, menu.
- Key information (names, date, venue) also exists as real text in the page for screen readers and link previews; the 3D layer is decorative.
- Portrait-first layout with landscape handled; use dynamic viewport units (dvh) and safe-area insets for iOS Safari.
- Marathi typography: test conjuncts, line height and font fallbacks; use Marathi numerals in the Marathi version.

## 12. Delivery plan

Estimated 4–6 weeks for one developer working part-time, assuming assets are sourced rather than hand-modelled from scratch.

- **Phase 0 — Spike (3–4 days):** storyboard, moodboard, and a rough 3D scene (water, sky, camera path) tested on a real mid-range phone. This is the go/no-go on 3D ambition.
- **Phase 1 — Foundation (week 1):** project setup, loader and Enter gate, audio manager, language system, camera rig and scene manager, content file, lite-mode skeleton.
- **Phase 2 — Cinematic opening (week 2):** Scenes 0–4 and sound design.
- **Phase 3 — Scroll journey (week 3):** Scenes 5–9, RSVP, calendar, share, link preview.
- **Phase 4 — Polish and QA (week 4):** optimisation, device matrix, Marathi proofreading, family review, a soft launch to 5–10 people, fixes.
- **Launch:** send the link only after a content freeze, with a buffer week before invitations go out.

**MVP cut if time is short:** Enter gate, Scene 1 (invocation), a simple couple reveal, date reveal, venue reveal, RSVP and share. Everything else can be added later.

## 13. Risks and mitigations

- **Low-end phones cannot run the 3D** → test devices early, use quality tiers and lite mode.
- **Autoplay audio is blocked** → the tap-to-enter gate.
- **Scope creep on 3D characters** → choose approach A or B and freeze it.
- **Licensing problems** (models, music, fonts) → keep a licence log and use commercial-friendly assets only.
- **Wrong or changed details** (date, venue, spellings) → one content file, two-person proofreading, and an “updated” banner if details change after sending.
- **In-app browsers limit WebGL or audio** → detect them and show “Open in browser”.
- **Large downloads on weak networks** → per-scene streaming, data-saver detection, lite mode.
- **Cultural and religious sensitivity** → symbolic depiction, and elder review of imagery, wording and music before launch.

## 14. Acceptance criteria and QA

- **Functional:** every button and link works; RSVP rows appear in the sheet or database; the .ics file opens correctly in Google, Apple and Outlook calendars; the countdown matches the muhurat in IST.
- **Content:** Marathi and English fully proofread by a fluent reader and one elder; names, date, time and address checked against the final printed invitation.
- **Performance:** at least 30 fps through every scene on the reference mid-range Android; Enter screen interactive in under 3 s on throttled 4G; lite mode delivers the same information.
- **Device matrix:** Android Chrome (mid-range and low-end), iPhone Safari, opened from a WhatsApp link on both, and desktop Chrome, Edge, Safari and Firefox.
- **Accessibility:** reduced-motion mode works, contrast and tap targets pass, keyboard navigation works on desktop.
- **Link preview:** WhatsApp shows the correct title, description and image.

## 15. Open decisions

1. Interaction model: auto-playing cinematic followed by scroll (recommended), or fully scroll-driven.
2. Character approach: A, B or C.
3. Symbolic or literal depiction of Krishna imagery (recommended: symbolic).
4. RSVP method and where the data should live.
5. Languages: Marathi and English only, or add Hindi.
6. Venue visual: realistic 3D model, generic mandap, or photo parallax.
7. Who creates the assets (self, freelancer, or a mix) and the budget.
8. Domain name and the date the invitations go out.
9. Bride’s name, wedding date, muhurat, venue and event list (needed to start the content freeze).

## 16. Resources

- **Learning:** Three.js Journey (course), the React Three Fiber and drei docs, the Theatre.js docs, Codrops WebGL tutorials, the gltf-transform docs.
- **Inspiration:** Bruno Simon’s portfolio, Lusion, Active Theory.
- **Asset sources:** Sketchfab, Poly Pizza, Quaternius, Mixamo (animations). Always check each licence.

## 17. Claude build phases (prompt pack)

Section 12 is the human schedule. This section cuts the same project into 10 build phases that Claude can generate one at a time. Each phase is small enough for one session, ends in something you can run and test, and relies on contracts frozen in Phases 1 and 2 so scenes don’t break each other. Phases 3–8 depend only on Phases 1–2 (except Phase 5, which reuses the helpers from Phase 4), so they can run in any order or in parallel sessions.

**How to run the phases**

- One phase per chat (or per Claude Code task). Start every session with the context pack below, the current file tree, and the contract files (`types.ts`, `store.ts`, `layout.ts`). Do not paste the whole codebase.
- Claude Code is the best fit: it can create files, run the dev server and fix build errors itself. In normal chat, ask for complete files with their paths and paste them into your repo.
- Code first, assets later. Claude can write shaders, particles, procedural trees, camera paths and UI, but not GLB models, illustrations or audio. Phases 3–8 use procedural stand-ins; real assets swap in through one manifest in Phase 10.
- After each phase: run it, tick the Done when list, test on a real phone (`npm run dev -- --host`, then open the LAN address), and commit. If a phase goes wrong, revert and rerun the prompt with a correction instead of patching repeatedly.
- Ask for complete files when creating and minimal diffs when editing. Keep each generation to about 5 files or 600 lines; if the output gets cut off, split the phase in two.
- When something breaks, paste the exact error, console output and FPS numbers rather than describing it.
- Run the asset track in parallel (illustrations, music, venue photos, Marathi copy) so it is ready by Phase 10.

**Context pack (paste at the start of every phase)**

- Project: Vrindavan-themed Maharashtrian wedding invitation; a cinematic, scroll-driven 3D website, phone-first. Part A is an auto-playing opening (scenes 1–4); Part B is a scroll journey (scenes 5–9).
- Stack: Vite, React 18, TypeScript, three, @react-three/fiber, @react-three/drei, @react-three/postprocessing, zustand, gsap, howler, tailwindcss, detect-gpu.
- One master value `t` (0–1) drives the journey. The camera samples a spline at `t`; each scene receives its own local `progress` (0–1) from `SCENE_RANGES`. Part A auto-plays `t` with GSAP; Part B maps scroll to `t`.
- Each scene is one component in `src/scenes/` with props `{ progress, quality }`, authored in local coordinates around its origin from `src/core/layout.ts`.
- All copy comes from `src/content/content.ts` (Marathi and English). No hard-coded strings. Devanagari is always an HTML overlay, never WebGL text.
- Colours and fonts come only from `src/theme/tokens.ts` (midnight indigo, Yamuna teal, peacock green, gold, marigold, lotus pink, cream).
- Quality tiers: `high | medium | low | lite`. Particle counts, post-processing and pixel ratio all read from the quality store.
- Performance rules: no real-time shadows on mobile, at most 2 real-time lights, instanced meshes for repeated objects, dispose geometry and textures when a scene exits.
- Assets are referenced only through `src/assets/manifest.ts`; use procedural stand-ins until real files exist.
- Output format: complete files, each under its path, no pseudo-code, followed by a short list of what to test.

**Phase 1 — Scaffold, contracts and scroll camera**

- **Prompt:** “Using the context pack, scaffold the project. Create `src/core/store.ts` (zustand: language, muted, quality tier, `t`, stage = gate | cinematic | journey, reducedMotion), `src/core/layout.ts` (SCENE\_ORIGINS and SCENE\_RANGES for 9 scenes, plus the `t` value where Part A ends), `src/core/types.ts` (SceneProps), `CameraRig.tsx` (spline through placeholder waypoints, sampled at `t`, eased), `Experience.tsx` (Canvas, DPR capped at 1.5, Stats in dev, a scene manager that mounts only the current and next scene), nine placeholder scenes (coloured boxes labelled with their number), Part B scroll mapping with drei ScrollControls, a dev shortcut that starts directly in journey mode, `content.ts` with the schema and placeholder Marathi and English values, and a language toggle.”
- **Done when:** scrolling flies the camera smoothly through nine placeholder rooms; only two scenes are mounted at a time; the language toggle swaps text; no console errors; the FPS counter shows.
- **You do:** create the repo, deploy a blank preview, open it on your phone.

**Phase 2 — Entry gate, audio and controls**

- **Prompt:** “Add the entry gate and controls. Build a diya loader driven by real asset progress (drei useProgress); a language picker with a large Enter button that unlocks audio (Howler) and sets stage to cinematic; an audio manager with fades, a mute toggle and pause when the tab is hidden; always-visible controls (sound, language, skip intro, menu with jump links to Date, Venue, Schedule, RSVP); GPU tier detection with detect-gpu plus the data-saver flag feeding the quality tier; a reduced-motion flag; and the Part A driver, a GSAP timeline that animates `t` from 0 to the end of Part A and can be skipped.”
- **Done when:** tapping Enter starts sound and the camera auto-flies through the Part A placeholders, then hands over to scroll; Skip jumps to the end of Part A; mute works; the detected quality tier shows in a dev overlay.
- **You do:** add two test audio files; confirm audio unlocks on both an iPhone and an Android phone.

**Phase 3 — Scene 1: Invocation (Yamuna at night)**

- **Prompt:** “Build `SceneInvocation`, fully procedural. Night-sky gradient with stars and moon; the Yamuna as a water plane with a custom shader (ripples, fresnel, faked moon reflection); instanced floating diyas with flame sprites drifting along the water; instanced fireflies; low mist; selective bloom. The camera glide is handled by the rig. An HTML overlay fades in the invocation text from content (॥ श्री गणेशाय नमः ॥). Scale every count and effect by quality tier; lite = static gradient. Show draw calls and triangle count in the dev overlay.”
- **Done when:** 45+ fps on a laptop and 30+ fps on your phone at medium tier; no pop-in; the text is readable over the scene.

**Phase 4 — Scene 2: The groom’s world**

- **Prompt:** “Build `SceneGroom`. A kadamba grove from primitives (instanced trunks and leaf clusters with a wind-sway vertex shader); drifting peacock-feather particles (instanced planes with a feather texture drawn procedurally); a flute-melody ribbon (TubeGeometry along a curve with a travelling light shader); a stylised groom cut-out (a plane with an SVG silhouette as placeholder) with two or three parallax layers; and a gold name reveal as an HTML overlay with English, Marathi and the family line from content. Put reusable particle and shader helpers in `src/shared/`.”
- **Done when:** the scene plays smoothly from the previous scene’s end pose; the name reveals in sync with `progress`; the helpers are importable by other scenes.

**Phase 5 — Scene 3: The bride’s world**

- **Prompt:** “Build `SceneBride`, mirroring Scene 2’s structure and reusing the `src/shared/` helpers instead of duplicating code. A lotus pond (instanced lotus meshes with a petal shader, and lily pads); drifting petals; a Paithani-style border that unfurls like a ribbon (a ribbon plane with a procedural peacock-border pattern shader revealed by `progress`); a stylised bride cut-out placeholder; an audio cue hook for an anklet-bell sound; and the name and family-line overlay.”
- **Done when:** the Scene 2 to Scene 3 transition is seamless and performance matches Scene 2.

**Phase 6 — Scene 4: Union and the handover to scroll**

- **Prompt:** “Build `SceneUnion`. Two light trails (the flute ribbon and a petal trail) spiral toward each other under the kadamba tree and a procedural flower-decked swing. An antarpat silk cloth made of two planes with a vertex-shader wave parts with `progress` to reveal the couple (a photo plane with depth parallax using a placeholder depth map, or stylised figures). The two initials merge into a monogram. End with a diya-light flash that sets stage to journey so scroll takes over.”
- **Done when:** Part A runs about 40 seconds end to end and hands over to scroll cleanly; Skip works from any point.

**Phase 7 — Scenes 5–6: Date and venue reveal**

- **Prompt:** “Build `SceneDate` and `SceneVenue`. Date: a large procedural lotus that blooms with `progress`; weekday, date and muhurat revealed digit by digit like diyas lighting (HTML overlay with a GSAP stagger, Marathi numerals in the Marathi version); a countdown to the muhurat in Asia/Kolkata; Add to calendar (a client-side .ics download plus a Google Calendar link). Venue: a glowing path the camera follows; a stylised procedural mandap with marigold torans and lamps switching on in sequence; an overlay with venue name, address, Open in Maps, Copy address and Call. Take all values from content.”
- **Done when:** the countdown matches the muhurat; the .ics opens correctly in Google, Apple and Outlook calendars; the Maps link opens the right place. Run Date and Venue as two prompts if the output gets cut off.

**Phase 8 — Scenes 7–9: Schedule, families, RSVP and share**

- **Prompt:** “Build `SceneSchedule` (event cards on a circular Raas-style carousel, each revealing with `progress`), `SceneFamilies` (parents’ and grandparents’ names, invitation lines, falling marigold petals) and `SceneRsvp` (an HTML form with name, guest count, events attending and message; validation; a honeypot field; a POST to a Google Apps Script endpoint, and also write that Apps Script so it appends rows to a Sheet; clear success and error states). Add WhatsApp share, copy link, the Web Share API and tel: helpline links. Update `index.html` with title, description, Open Graph and Twitter tags, noindex and theme-color.”
- **Done when:** a test RSVP lands in the Sheet; sharing on WhatsApp shows the preview card; every button works on a phone. Tip: Apps Script works best with a simple POST (text/plain body) so the browser skips the CORS preflight.
- **You do:** create the Sheet, deploy the Apps Script, and produce the 1200×630 preview image.

**Phase 9 — Lite mode, accessibility and fallbacks**

- **Prompt:** “Build the lite experience: a 2D scroll-driven parallax version (CSS and GSAP, layered images, no WebGL) that reads the same content and shows every piece of information. Select it automatically by quality tier, missing WebGL or the data-saver flag, with a manual toggle. Add a prefers-reduced-motion mode (crossfades instead of camera flights), WebGL context-loss recovery, an in-app-browser banner (‘Open in browser’), keyboard navigation on desktop, focus states, aria labels, a real-text mirror of the key information for screen readers, and a stub for wedding-day mode.”
- **Done when:** lite mode shows the full invitation on a throttled low-end profile; reduced-motion mode has no camera flights; the keyboard can reach every control.

**Phase 10 — Optimise, swap in assets, QA and deploy**

- **Prompt:** “Prepare for launch. Lazy-load each scene and preload the next; code-split; add a service worker for repeat visits; write scripts to compress GLB files (gltf-transform with Draco or Meshopt and KTX2 textures) and images (WebP or AVIF); wire the real assets into `manifest.ts` with fallbacks to the procedural stand-ins; add automatic quality downgrade with drei PerformanceMonitor; produce a bundle-size report; write a QA checklist matching Section 14; and add deploy config with caching headers for Vercel or Netlify.”
- **Done when:** the budgets in Section 7 are met on the reference phone; the QA checklist passes; a soft launch to 5–10 people works from WhatsApp links.
- **You do:** drop in the Blender models, illustrations, music and final copy; run the device matrix; get family proofreading; freeze content; send.

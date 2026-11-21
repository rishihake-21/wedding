import { create } from 'zustand';
import { content } from '../content/content';
import { isWeddingDay } from '../utils/invitation';
import { DEV_FLAGS } from './devFlags';
import { clamp01, PART_A_END_T, SCENE_RANGES, sceneIndexAt } from './layout';
import type { Lang, QualityTier, Stage } from './types';

function computeInitialT(): number {
  if (DEV_FLAGS.initialScene === null) return 0;
  const [start, end] = SCENE_RANGES[DEV_FLAGS.initialScene];
  // Position right where camera approaches and frames the scene dead-center
  const local = DEV_FLAGS.initialScene === 3 ? 0.3 : 0.25;
  return clamp01(start + (end - start) * local);
}

const INITIAL_T = computeInitialT();
const INITIAL_SCENE = sceneIndexAt(INITIAL_T);

const LANG_STORAGE_KEY = 'wed.lang';

function readStoredLanguage(): Lang {
  try {
    const stored = window.localStorage.getItem(LANG_STORAGE_KEY);
    if (stored === 'mr' || stored === 'en') return stored;
  } catch {
    // Storage can be blocked (private mode, in-app browsers); fall through to the default.
  }
  return 'mr'; // Marathi first
}

function prefersReducedMotion(): boolean {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
}

/** A programmatic move of the journey (menu link, Skip, hand-over). `id` increases with every one. */
export interface JumpRequest {
  id: number;
  t: number;
}

function nextJump(prev: JumpRequest | null, t: number): JumpRequest {
  return { id: (prev?.id ?? 0) + 1, t };
}

/** Mutable non-reactive renderer stats updated inside useFrame for DevOverlay. */
export const RENDER_TELEMETRY = {
  drawCalls: 0,
  triangles: 0,
  fps: 60,
  gpuLabel: 'detecting…',
};

export interface AppState {
  language: Lang;
  muted: boolean;
  quality: QualityTier;
  detectedQuality: QualityTier;
  reducedMotion: boolean;
  stage: Stage;
  weddingDayMode: boolean;
  webglLost: boolean;
  /** Personalized guest name from ?guest= query param. */
  guestName: string | null;
  /** Incremented to trigger a warm diya-light crossfade flash on cuts/handovers. */
  flashId: number;
  /** Count of blessing diyas lit interactively by the guest. */
  diyaLitCount: number;
  /** Whether the guest has submitted an RSVP in this session. */
  rsvpSubmitted: boolean;

  /** Master journey time, 0–1. Written every frame during scroll/auto-play. */
  t: number;
  /** Index of the scene that owns `t`. Only changes at scene boundaries. */
  activeScene: number;
  /** `t` at which the scroll journey starts: 0 for the dev shortcut, PART_A_END_T after Part A. */
  journeyFromT: number;
  /**
   * The latest programmatic jump. CameraRig snaps to the new pose and JourneyScroll moves the
   * scroll position when `id` changes. Subscribe imperatively; it is not meant to drive renders.
   */
  jump: JumpRequest | null;

  setLanguage: (lang: Lang) => void;
  toggleLanguage: () => void;
  setMuted: (muted: boolean) => void;
  toggleMuted: () => void;
  setQuality: (quality: QualityTier) => void;
  setDetectedQuality: (quality: QualityTier) => void;
  setReducedMotion: (reduced: boolean) => void;
  setWeddingDayMode: (active: boolean) => void;
  setWebglLost: (lost: boolean) => void;
  triggerFlash: () => void;
  lightBlessingDiya: () => void;
  setRsvpSubmitted: (submitted: boolean) => void;

  /** Entering 'journey' goes through startJourney(t), so scroll starts where the camera is. */
  setStage: (stage: Stage) => void;
  /** Low-level write of `t`. In journey mode the scroll position overwrites it every frame; use jumpTo to move. */
  setT: (t: number) => void;
  /** Enter scroll mode with scroll offset 0 mapped to `fromT`. The camera snaps there. */
  startJourney: (fromT?: number) => void;
  /** Start the Part A cinematic film from t = 0. */
  startCinematic: () => void;
  /**
   * Move to master time `t` from anywhere (menu links, Skip). In journey mode it re-aims the
   * scroll position and snaps the camera; before that it starts the journey at `t`.
   */
  jumpTo: (t: number) => void;
}

export const useAppStore = create<AppState>()((set, get) => ({
  language: readStoredLanguage(),
  muted: false,
  quality: DEV_FLAGS.forcedQuality ?? 'medium',
  detectedQuality: DEV_FLAGS.forcedQuality ?? 'medium',
  reducedMotion: prefersReducedMotion(),
  stage: DEV_FLAGS.startInJourney ? 'journey' : 'gate',
  weddingDayMode: DEV_FLAGS.forceWeddingDay || isWeddingDay(content.date.muhuratIso),
  webglLost: false,
  guestName: DEV_FLAGS.guestName,
  flashId: 0,
  diyaLitCount: 0,
  rsvpSubmitted: false,

  t: INITIAL_T,
  activeScene: INITIAL_SCENE,
  journeyFromT: 0,
  jump: INITIAL_T > 0 ? { id: 1, t: INITIAL_T } : null,

  setLanguage: (language) => {
    try {
      window.localStorage.setItem(LANG_STORAGE_KEY, language);
    } catch {
      // Persisting is best-effort.
    }
    set({ language });
  },
  toggleLanguage: () => get().setLanguage(get().language === 'mr' ? 'en' : 'mr'),
  setMuted: (muted) => set({ muted }),
  toggleMuted: () => set((s) => ({ muted: !s.muted })),
  setQuality: (quality) => set({ quality }),
  setDetectedQuality: (detectedQuality) =>
    set((s) => ({
      detectedQuality,
      quality: DEV_FLAGS.forcedQuality ?? (s.quality === 'lite' ? 'lite' : detectedQuality),
    })),
  setReducedMotion: (reducedMotion) => set({ reducedMotion }),
  setWeddingDayMode: (weddingDayMode) => set({ weddingDayMode }),
  setWebglLost: (webglLost) => set({ webglLost }),
  triggerFlash: () => set((s) => ({ flashId: s.flashId + 1 })),
  lightBlessingDiya: () => set((s) => ({ diyaLitCount: s.diyaLitCount + 1 })),
  setRsvpSubmitted: (rsvpSubmitted) => set({ rsvpSubmitted }),

  setStage: (stage) => {
    if (stage === 'journey') get().startJourney(get().t);
    else set({ stage });
  },

  setT: (value) => {
    const t = clamp01(value);
    const activeScene = sceneIndexAt(t);
    set(activeScene === get().activeScene ? { t } : { t, activeScene });
  },

  startCinematic: () => {
    set((s) => ({
      stage: 'cinematic',
      weddingDayMode: false,
      t: 0,
      activeScene: 0,
      journeyFromT: 0,
      jump: nextJump(s.jump, 0),
    }));
  },

  startJourney: (fromT = 0) => {
    const t = clamp01(fromT);
    set((s) => ({
      stage: 'journey',
      weddingDayMode: false,
      journeyFromT: t,
      t,
      activeScene: sceneIndexAt(t),
      jump: nextJump(s.jump, t),
    }));
  },

  jumpTo: (target) => {
    const s = get();
    const clamped = clamp01(target);
    if (s.stage !== 'journey') {
      const fromT = clamped >= PART_A_END_T ? PART_A_END_T : 0;
      set({
        stage: 'journey',
        weddingDayMode: false,
        journeyFromT: fromT,
        t: clamped,
        activeScene: sceneIndexAt(clamped),
        jump: nextJump(s.jump, clamped),
        flashId: s.flashId + 1,
      });
      return;
    }
    const t = Math.max(clamped, s.journeyFromT);
    set({
      t,
      activeScene: sceneIndexAt(t),
      jump: nextJump(s.jump, t),
      flashId: s.flashId + 1,
    });
  },
}));

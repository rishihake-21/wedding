/** Shared contracts. Frozen in Phase 1 — later phases add to these, they don't reshape them. */

export type Lang = 'mr' | 'en';

/** gate = entry screen, cinematic = Part A auto-play, journey = Part B scroll. */
export type Stage = 'gate' | 'cinematic' | 'journey';

export type QualityTier = 'high' | 'medium' | 'low' | 'lite';

export type Vec3 = readonly [number, number, number];

/**
 * A scene's local progress (0–1), held in a mutable box that is updated once per frame.
 *
 * It is a ref-style object rather than a plain number on purpose: a number prop would
 * re-render every scene subtree on every frame. Read it inside `useFrame` (or a GSAP
 * ticker / rAF loop for HTML overlays): `progress.current`.
 */
export interface SceneProgress {
  current: number;
}

export interface SceneProps {
  progress: SceneProgress;
  quality: QualityTier;
}

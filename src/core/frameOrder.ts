/**
 * Order of per-frame work. R3F runs `useFrame` callbacks from the lowest priority number up,
 * then renders. Everything that feeds a frame uses a negative priority so it runs before
 * scene code (priority 0) and all of it sees the same `t`.
 *
 * Never use a POSITIVE priority: in R3F v8 that makes you responsible for rendering and the
 * automatic render stops.
 *
 * Order: input (scroll → t) → progress (t → each scene's local progress) → camera → scenes.
 */
export const FRAME_PRIORITY = {
  input: -3,
  progress: -2,
  camera: -1,
} as const;

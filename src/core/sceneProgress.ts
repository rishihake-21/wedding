import { SCENE_COUNT, sceneProgressAt } from './layout';
import type { SceneProgress } from './types';

/** One progress box per scene, created once. Scenes receive their own box as `progress`. */
export const SCENE_PROGRESS: readonly SceneProgress[] = Array.from({ length: SCENE_COUNT }, () => ({
  current: 0,
}));

/** Recompute every scene's local progress from master time. Cheap: nine subtractions. */
export function syncSceneProgress(t: number): void {
  for (let i = 0; i < SCENE_COUNT; i++) {
    SCENE_PROGRESS[i].current = sceneProgressAt(t, i);
  }
}

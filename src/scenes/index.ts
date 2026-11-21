import { lazy, type ComponentType, type LazyExoticComponent } from 'react';
import { SCENE_COUNT } from '../core/layout';
import type { SceneProps } from '../core/types';

type SceneLoader = () => Promise<{ default: ComponentType<SceneProps> }>;

/**
 * Lazy module loaders in journey order (index 0 = Scene 1).
 * Must match SCENE_META in src/core/layout.ts.
 */
const SCENE_LOADERS: readonly SceneLoader[] = [
  () => import('./SceneInvocation'),
  () => import('./SceneGroom'),
  () => import('./SceneBride'),
  () => import('./SceneUnion'),
  () => import('./SceneDate'),
  () => import('./SceneVenue'),
  () => import('./SceneSchedule'),
  () => import('./SceneFamilies'),
  () => import('./SceneRsvp'),
];

export const SCENES: readonly LazyExoticComponent<ComponentType<SceneProps>>[] =
  SCENE_LOADERS.map((loader) => lazy(loader));

const preloaded = new Set<number>();

/** Eagerly prefetches the JS chunk for scene `index` so transitions never stall. */
export function preloadScene(index: number): void {
  if (index < 0 || index >= SCENE_COUNT || preloaded.has(index)) return;
  preloaded.add(index);
  void SCENE_LOADERS[index]().catch(() => {
    preloaded.delete(index);
  });
}

if (SCENES.length !== SCENE_COUNT) {
  throw new Error(`SCENES has ${SCENES.length} entries but SCENE_COUNT is ${SCENE_COUNT}`);
}

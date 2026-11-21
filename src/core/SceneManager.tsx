import { Suspense, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { preloadScene, SCENES } from '../scenes';
import { FRAME_PRIORITY } from './frameOrder';
import { mountedSceneIndices, SCENE_ORIGINS } from './layout';
import { SCENE_PROGRESS, syncSceneProgress } from './sceneProgress';
import { useAppStore } from './store';

/**
 * Mounts only the active scene and the one after it (so the next can preload), each in a
 * group at its world origin. Everything else is unmounted, which frees its GPU resources.
 * Eagerly prefetches the lazy module for `active + 1` and `active + 2`.
 */
export function SceneManager() {
  const active = useAppStore((s) => s.activeScene);
  const quality = useAppStore((s) => s.quality);

  useEffect(() => {
    preloadScene(active);
    preloadScene(active + 1);
    preloadScene(active + 2);
  }, [active]);

  useFrame(() => {
    syncSceneProgress(useAppStore.getState().t);
  }, FRAME_PRIORITY.progress);

  return (
    <Suspense fallback={null}>
      {mountedSceneIndices(active).map((i) => {
        const Scene = SCENES[i];
        const [ox, oy, oz] = SCENE_ORIGINS[i];
        return (
          <group key={i} position={[ox, oy, oz]}>
            <Scene progress={SCENE_PROGRESS[i]} quality={quality} />
          </group>
        );
      })}
    </Suspense>
  );
}

import { useEffect } from 'react';
import gsap from 'gsap';
import { audioManager } from './audio';
import { PART_A_DURATION_S, PART_A_END_T, SCENE_RANGES } from './layout';
import { useAppStore } from './store';

/**
 * Part A cinematic driver.
 * Animates master time `t` from 0 to PART_A_END_T (~38s) using GSAP while `stage === 'cinematic'`,
 * triggers audio cues on scene boundaries, and hands over to Part B scroll with a warm diya-light flash.
 */
export function PartADriver() {
  const stage = useAppStore((s) => s.stage);
  const reducedMotion = useAppStore((s) => s.reducedMotion);

  useEffect(() => {
    if (stage !== 'cinematic') return;

    const proxy = { t: useAppStore.getState().t };
    let handedOver = false;
    let ankletPlayed = false;

    const handOverToJourney = () => {
      if (handedOver) return;
      handedOver = true;
      const store = useAppStore.getState();
      if (store.stage !== 'cinematic') return;
      store.triggerFlash();
      audioManager.playCue('shehnai');
      window.setTimeout(() => {
        if (useAppStore.getState().stage === 'cinematic') {
          useAppStore.getState().startJourney(PART_A_END_T);
        }
      }, 260);
    };

    if (reducedMotion) {
      // Calm crossfaded slides instead of continuous camera flight
      const tl = gsap.timeline({ onComplete: handOverToJourney });
      const stops = [0, 1, 2, 3].map((i) => {
        const [start, end] = SCENE_RANGES[i];
        return start + (end - start) * 0.45;
      });
      stops.forEach((targetT, idx) => {
        tl.call(() => {
          const store = useAppStore.getState();
          if (idx > 0) store.triggerFlash();
          store.setT(targetT);
          if (idx === 2) audioManager.playCue('anklet');
        });
        tl.to({}, { duration: 4.5 });
      });
      return () => {
        tl.kill();
      };
    }

    const tween = gsap.to(proxy, {
      t: PART_A_END_T,
      duration: PART_A_DURATION_S * (1 - proxy.t / PART_A_END_T),
      ease: 'none',
      onUpdate: () => {
        const store = useAppStore.getState();
        if (store.stage !== 'cinematic') return;
        store.setT(proxy.t);
        if (!ankletPlayed && proxy.t >= SCENE_RANGES[2][0] + 0.015) {
          ankletPlayed = true;
          audioManager.playCue('anklet');
        }
      },
      onComplete: handOverToJourney,
    });

    return () => {
      tween.kill();
    };
  }, [stage, reducedMotion]);

  return null;
}

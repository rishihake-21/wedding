import { useRef } from 'react';
import { ScrollControls, useScroll } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { FRAME_PRIORITY } from './frameOrder';
import { clamp01, SCENE_COUNT } from './layout';
import { useAppStore } from './store';

/** Scroll distance per scene, in viewport heights. */
const VIEWPORTS_PER_SCENE = 1;
/** Smooth exponential damping speed for user scrolling. */
const SCROLL_DAMP_LAMBDA = 9;
/** Cap frame delta so backgrounded tabs never cause a large scroll leap. */
const MAX_DELTA = 0.1;

/**
 * Copies the scroll container's position into master time: offset 0 → journeyFromT, offset 1 → 1.
 * Reads `scroll.el.scrollTop` directly (with smooth exponential damping) instead of drei's internal
 * damped `scroll.offset`, so programmatic jumps (menu links, Skip, keyboard, `?scene=`) always
 * land and stay exactly on target even on slow software WebGL frames.
 */
function ScrollToT() {
  const scroll = useScroll();
  const handledJump = useRef(0);
  const dampedOffset = useRef<number | null>(null);
  const pinFrames = useRef(0);
  const pinnedOffset = useRef(0);

  useFrame((_, delta) => {
    const state = useAppStore.getState();
    const { journeyFromT, jump } = state;
    const span = 1 - journeyFromT;
    const el = scroll.el;
    const scrollable = el.scrollHeight - el.clientHeight;

    // Initialize dampedOffset on first frame to match current store `t`
    if (dampedOffset.current === null) {
      const initOffset = span > 0 ? clamp01((state.t - journeyFromT) / span) : 0;
      dampedOffset.current = initOffset;
      if (scrollable > 1 && initOffset > 0) {
        el.scrollTop = initOffset * scrollable;
        el.dispatchEvent(new Event('scroll'));
        pinnedOffset.current = initOffset;
        pinFrames.current = 6;
      }
      if (jump) handledJump.current = jump.id;
      return;
    }

    // Carry out any new programmatic jump immediately
    if (jump && jump.id !== handledJump.current) {
      if (scrollable <= 1) return;
      handledJump.current = jump.id;
      const offset = span > 0 ? clamp01((jump.t - journeyFromT) / span) : 0;
      el.scrollTop = offset * scrollable;
      el.dispatchEvent(new Event('scroll'));
      dampedOffset.current = offset;
      pinnedOffset.current = offset;
      pinFrames.current = 6;
      return;
    }

    if (scrollable <= 1) return;

    // For a few frames after a jump/mount, keep scrollTop pinned in case browser layout resets it
    if (pinFrames.current > 0) {
      pinFrames.current -= 1;
      const expectedTop = pinnedOffset.current * scrollable;
      if (Math.abs(el.scrollTop - expectedTop) > 2) {
        el.scrollTop = expectedTop;
        el.dispatchEvent(new Event('scroll'));
      }
      return;
    }

    const rawOffset = clamp01(el.scrollTop / scrollable);
    const dt = Math.min(delta, MAX_DELTA);
    const alpha = 1 - Math.exp(-SCROLL_DAMP_LAMBDA * dt);
    dampedOffset.current += (rawOffset - dampedOffset.current) * alpha;
    if (Math.abs(rawOffset - dampedOffset.current) < 1e-4) {
      dampedOffset.current = rawOffset;
    }

    // Clamped: iOS rubber-banding can push the container's scroll position past either end.
    const next = journeyFromT + clamp01(dampedOffset.current) * span;
    if (Math.abs(next - state.t) > 1e-5) state.setT(next);
  }, FRAME_PRIORITY.input);

  return null;
}

/**
 * Part B: vertical scroll / touch drag drives `t`. Mount it only while stage === 'journey';
 * mounting creates a fresh scroll container, so scroll position starts at 0.
 */
export function JourneyScroll() {
  const journeyFromT = useAppStore((s) => s.journeyFromT);
  // drei's `pages` includes the first viewport, which isn't scrollable distance.
  const pages = 1 + (1 - journeyFromT) * SCENE_COUNT * VIEWPORTS_PER_SCENE;

  return (
    <ScrollControls pages={pages}>
      <ScrollToT />
    </ScrollControls>
  );
}

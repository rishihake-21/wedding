import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useAppStore } from '../core/store';

/**
 * Warm golden diya-light flash overlay that hides programmatic camera cuts
 * (Skip, Menu jumps, Part A → Part B handover, and reduced-motion crossfades).
 */
export function DiyaFlash() {
  const flashId = useAppStore((s) => s.flashId);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (flashId === 0 || !ref.current) return;
    const el = ref.current;
    gsap.killTweensOf(el);
    gsap.fromTo(
      el,
      { opacity: 0 },
      {
        opacity: 0.52,
        duration: 0.14,
        ease: 'power2.out',
        onComplete: () => {
          gsap.to(el, { opacity: 0, duration: 0.32, ease: 'power2.inOut' });
        },
      },
    );
  }, [flashId]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[5] opacity-0"
      style={{
        background:
          'radial-gradient(circle at 50% 50%, rgba(255, 244, 220, 0.9) 0%, rgba(212, 166, 64, 0.55) 45%, rgba(11, 21, 48, 0.85) 100%)',
      }}
    />
  );
}

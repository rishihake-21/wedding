import { useEffect, useRef } from 'react';
import { mountedSceneIndices, SCENE_COUNT, SCENE_META } from '../core/layout';
import { RENDER_TELEMETRY, useAppStore } from '../core/store';
import type { AppState } from '../core/store';

function format(s: AppState): string {
  const mounted = mountedSceneIndices(s.activeScene)
    .map((i) => i + 1)
    .join(', ');
  return [
    `stage    ${s.stage}`,
    `t        ${s.t.toFixed(4)}`,
    `scene    ${s.activeScene + 1}/${SCENE_COUNT} ${SCENE_META[s.activeScene].label}`,
    `mounted  [${mounted}]`,
    `quality  ${s.quality} (det: ${s.detectedQuality})`,
    `fps      ${RENDER_TELEMETRY.fps}`,
    `calls    ${RENDER_TELEMETRY.drawCalls}`,
    `tris     ${RENDER_TELEMETRY.triangles}`,
    `gpu      ${RENDER_TELEMETRY.gpuLabel.slice(0, 28)}`,
  ].join('\n');
}

/**
 * Debug readout (?debug only). Writes straight to the DOM via timer/store subscription
 * so it never triggers React re-renders while `t` changes every frame.
 */
export function DevOverlay() {
  const ref = useRef<HTMLPreElement>(null);

  useEffect(() => {
    const render = () => {
      if (ref.current) ref.current.textContent = format(useAppStore.getState());
    };
    render();
    const unsub = useAppStore.subscribe(render);
    const id = window.setInterval(render, 500);
    return () => {
      unsub();
      window.clearInterval(id);
    };
  }, []);

  return (
    <pre
      ref={ref}
      className="pointer-events-none fixed left-3 top-20 z-50 rounded border border-gold/30 bg-[#070E22]/90 p-2.5 font-mono text-xs leading-snug text-cream/90"
    />
  );
}

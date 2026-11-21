import { getGPUTier } from 'detect-gpu';
import { RENDER_TELEMETRY } from '../core/store';
import type { QualityTier } from '../core/types';

/** Detects CPU/software WebGL renderers (SwiftShader, llvmpipe, WARP) from the GPU renderer string. */
export const IS_SOFTWARE_GL: boolean = (() => {
  if (typeof document === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    const gl =
      (canvas.getContext('webgl2') as WebGL2RenderingContext | null) ||
      (canvas.getContext('webgl') as WebGLRenderingContext | null);
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) ?? '');
    RENDER_TELEMETRY.gpuLabel = gpu || 'WebGL';
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
})();

export function hasWebGLSupport(): boolean {
  if (typeof document === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return false;
    (gl as WebGLRenderingContext).getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch {
    return false;
  }
}

export interface QualityBudget {
  particleScale: number;
  bloom: boolean;
  dprMax: number;
  geometryDetail: 'high' | 'medium' | 'low';
}

export const QUALITY_BUDGETS: Record<QualityTier, QualityBudget> = {
  high: {
    particleScale: 1.0,
    bloom: !IS_SOFTWARE_GL,
    dprMax: IS_SOFTWARE_GL ? 1 : 2,
    geometryDetail: 'high',
  },
  medium: {
    particleScale: 0.65,
    bloom: !IS_SOFTWARE_GL,
    dprMax: IS_SOFTWARE_GL ? 1 : 1.5,
    geometryDetail: 'medium',
  },
  low: {
    particleScale: 0.35,
    bloom: false,
    dprMax: 1,
    geometryDetail: 'low',
  },
  lite: {
    particleScale: 0,
    bloom: false,
    dprMax: 1,
    geometryDetail: 'low',
  },
};

export function scaledCount(baseCount: number, quality: QualityTier): number {
  const scale = QUALITY_BUDGETS[quality].particleScale;
  return Math.max(4, Math.round(baseCount * scale));
}

/**
 * Determines the initial quality tier from WebGL availability, data-saver flag,
 * device memory, and `detect-gpu`. Never blocks rendering if benchmark lookup fails.
 */
export async function detectInitialQualityTier(): Promise<QualityTier> {
  if (!hasWebGLSupport()) {
    RENDER_TELEMETRY.gpuLabel = 'No WebGL (Lite)';
    return 'lite';
  }

  const nav = navigator as Navigator & {
    connection?: { saveData?: boolean; effectiveType?: string };
    deviceMemory?: number;
  };

  if (nav.connection?.saveData) {
    RENDER_TELEMETRY.gpuLabel = 'Data Saver (Lite)';
    return 'lite';
  }

  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (isMobile && typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 2) {
    RENDER_TELEMETRY.gpuLabel = `Low RAM ${nav.deviceMemory}GB (Lite)`;
    return 'lite';
  }

  // On desktop software WebGL (e.g. VDI / headless Chromium), keep 3D active at medium
  // while IS_SOFTWARE_GL disables expensive multi-pass bloom & high DPR.
  if (IS_SOFTWARE_GL && !isMobile) {
    return 'medium';
  }

  try {
    const result = await Promise.race([
      getGPUTier({ failIfMajorPerformanceCaveat: false }),
      new Promise<null>((resolve) => window.setTimeout(() => resolve(null), 1500)),
    ]);

    if (result) {
      if (result.gpu) RENDER_TELEMETRY.gpuLabel = `${result.gpu} (T${result.tier})`;
      if (result.tier <= 0) return isMobile ? 'lite' : 'low';
      if (result.tier === 1) return 'low';
      if (result.tier === 2) return 'medium';
      return 'high';
    }
  } catch {
    // Fall back cleanly if offline or GPU benchmark fetch is blocked.
  }

  return isMobile ? 'medium' : 'high';
}

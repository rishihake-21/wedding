/**
 * Central asset manifest.
 *
 * All external 3D models (GLB), 2D layered illustrations, couple photos, depth maps,
 * and audio tracks are referenced strictly through this file. When an entry is `null`,
 * scenes and the audio manager automatically render/synthesize their high-craft
 * procedural stand-ins — zero 404 requests and instant readiness.
 *
 * When real assets are ready (Phase 10 swap), drop them into `public/assets/` and
 * fill in their paths here (e.g. '/assets/models/mandap.glb').
 */

export interface AssetManifest {
  audio: {
    ambientBansuri: string | null;
    dateShehnai: string | null;
    venueBells: string | null;
    ankletCue: string | null;
  };
  models: {
    kadambaTree: string | null;
    lotusHero: string | null;
    mandap: string | null;
    jhulaSwing: string | null;
  };
  textures: {
    groomPortrait: string | null;
    bridePortrait: string | null;
    couplePhoto: string | null;
    coupleDepthMap: string | null;
    paithaniBorder: string | null;
    peacockFeather: string | null;
  };
  media: {
    ogImage: string;
  };
}

export const ASSET_MANIFEST: AssetManifest = {
  audio: {
    ambientBansuri: null,
    dateShehnai: null,
    venueBells: null,
    ankletCue: null,
  },
  models: {
    kadambaTree: null,
    lotusHero: null,
    mandap: null,
    jhulaSwing: null,
  },
  textures: {
    groomPortrait: null,
    bridePortrait: null,
    couplePhoto: null,
    coupleDepthMap: null,
    paithaniBorder: null,
    peacockFeather: null,
  },
  media: {
    ogImage: '/og-card.svg',
  },
};

export function hasRealAsset(url: string | null | undefined): url is string {
  return typeof url === 'string' && url.trim().length > 0;
}

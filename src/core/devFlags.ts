import { parseGuestName } from '../utils/invitation';
import type { QualityTier } from './types';

/**
 * URL-driven switches, read once at startup.
 *
 *   ?stage=journey   skip the gate and start in scroll mode over all nine scenes
 *   ?autostart=1     alias to skip the gate and enter Part B directly for automated checks
 *   ?quality=low     force a quality tier (high | medium | low | lite)
 *   ?debug           show FPS counter, draw calls, triangles and debug overlay
 *   ?guest=Name      personalized greeting on the entry gate & header
 *   ?weddingday=1    preview Wedding-Day live schedule mode
 */

const search = typeof window === 'undefined' ? '' : window.location.search;
const params = new URLSearchParams(search);

const TIERS: readonly QualityTier[] = ['high', 'medium', 'low', 'lite'];
const requestedQuality = params.get('quality');
const rawScene = params.get('scene');
const parsedScene = rawScene !== null ? Number.parseInt(rawScene, 10) : Number.NaN;

export const DEV_FLAGS = {
  startInJourney: params.get('stage') === 'journey' || params.get('autostart') === '1',
  initialScene: Number.isInteger(parsedScene) && parsedScene >= 0 && parsedScene <= 8 ? parsedScene : null,
  showDebug: params.has('debug'),
  forcedQuality: TIERS.find((tier) => tier === requestedQuality) ?? null,
  guestName: parseGuestName(search),
  forceWeddingDay: params.get('weddingday') === '1',
};

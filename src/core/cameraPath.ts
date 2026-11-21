import { CatmullRomCurve3, Vector3 } from 'three';
import {
  CAMERA_WAYPOINTS,
  FOCUS_HEIGHT,
  LOOK_AHEAD,
  SCENE_ORIGINS,
  focusWeight,
  sceneIndexAt,
  sceneProgressAt,
  tToPathU,
} from './layout';

/** Half-width of the window used to estimate the path direction, in spline units. */
const TANGENT_EPS = 1e-4;

// Centripetal Catmull-Rom: passes through every waypoint without looping or overshooting.
const CURVE = new CatmullRomCurve3(
  CAMERA_WAYPOINTS.map(([x, y, z]) => new Vector3(x, y, z)),
  false,
  'centripetal',
);

const before = new Vector3();
const after = new Vector3();
const tangent = new Vector3();
const focus = new Vector3();

/**
 * Samples the camera pose at master time `t`.
 *
 * Position is the spline at tToPathU(t). The gaze looks down the path, and is drawn toward
 * the active scene's origin by focusWeight(progress), which is 0 at both scene boundaries
 * so the view is continuous across them.
 */
export function sampleCameraPose(t: number, outPosition: Vector3, outLookAt: Vector3): void {
  const u = tToPathU(t);
  CURVE.getPoint(u, outPosition);

  // Same estimate as Curve.getTangent, but with scratch vectors: no allocation per frame.
  CURVE.getPoint(Math.max(u - TANGENT_EPS, 0), before);
  CURVE.getPoint(Math.min(u + TANGENT_EPS, 1), after);
  tangent.subVectors(after, before).normalize();
  outLookAt.copy(outPosition).addScaledVector(tangent, LOOK_AHEAD);

  const scene = sceneIndexAt(t);
  const [ox, oy, oz] = SCENE_ORIGINS[scene];
  focus.set(ox, oy + FOCUS_HEIGHT, oz);
  outLookAt.lerp(focus, focusWeight(sceneProgressAt(t, scene)));
}

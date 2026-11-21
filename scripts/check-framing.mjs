// Guards the camera framing: the numbered placeholder rooms must stay in view on phones, the
// camera must turn gently in Part A, and it must never clip a room. Needs Node 22.6+; no install.
//   npm run check
//
// It re-implements three.js CatmullRomCurve3 (centripetal) so it can run without three installed.
// The spline is sanity-checked to pass through every waypoint, and everything else (waypoints,
// origins, ranges, gaze weight, field of view) is imported from src/core/layout.ts.
import assert from 'node:assert/strict';
import * as L from '../src/core/layout.ts';

const sub = (a, b) => a.map((v, i) => v - b[i]);
const add = (a, b) => a.map((v, i) => v + b[i]);
const len = (a) => Math.hypot(...a);
const norm = (a) => { const l = len(a) || 1; return a.map((v) => v / l); };
const dot = (a, b) => a.reduce((s, v, i) => s + v * b[i], 0);
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const d2 = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;

function cubicPoly() {
  let c0 = 0, c1 = 0, c2 = 0, c3 = 0;
  return {
    nonuniform(x0, x1, x2, x3, dt0, dt1, dt2) {
      let t1 = (x1 - x0) / dt0 - (x2 - x0) / (dt0 + dt1) + (x2 - x1) / dt1;
      let t2 = (x2 - x1) / dt1 - (x3 - x1) / (dt1 + dt2) + (x3 - x2) / dt2;
      t1 *= dt1; t2 *= dt1;
      c0 = x1; c1 = t1; c2 = -3 * x1 + 3 * x2 - 2 * t1 - t2; c3 = 2 * x1 - 2 * x2 + t1 + t2;
    },
    calc(t) { const t2 = t * t; return c0 + c1 * t + c2 * t2 + c3 * t2 * t; },
  };
}
function makeCurve(points) {
  const l = points.length;
  const px = cubicPoly(), py = cubicPoly(), pz = cubicPoly();
  return (t) => {
    const p = (l - 1) * t;
    let i = Math.floor(p), w = p - i;
    if (w === 0 && i === l - 1) { i = l - 2; w = 1; }
    const p0 = i > 0 ? points[i - 1] : add(sub(points[0], points[1]), points[0]);
    const p1 = points[i], p2 = points[i + 1];
    const p3 = i + 2 < l ? points[i + 2] : add(sub(points[l - 1], points[l - 2]), points[l - 1]);
    let dt0 = d2(p0, p1) ** 0.25, dt1 = d2(p1, p2) ** 0.25, dt2 = d2(p2, p3) ** 0.25;
    if (dt1 < 1e-4) dt1 = 1; if (dt0 < 1e-4) dt0 = dt1; if (dt2 < 1e-4) dt2 = dt1;
    px.nonuniform(p0[0], p1[0], p2[0], p3[0], dt0, dt1, dt2);
    py.nonuniform(p0[1], p1[1], p2[1], p3[1], dt0, dt1, dt2);
    pz.nonuniform(p0[2], p1[2], p2[2], p3[2], dt0, dt1, dt2);
    return [px.calc(w), py.calc(w), pz.calc(w)];
  };
}

const curve = makeCurve(L.CAMERA_WAYPOINTS.map((p) => [...p]));
for (let k = 0; k <= L.SCENE_COUNT; k++) {
  const err = len(sub(curve(k / L.SCENE_COUNT), [...L.CAMERA_WAYPOINTS[k]]));
  assert.ok(err < 1e-6, `spline misses waypoint ${k} by ${err}`);
}

// Same pose as src/core/cameraPath.ts
function pose(t) {
  const u = L.tToPathU(t);
  const pos = curve(u);
  const tan = norm(sub(curve(Math.min(u + 1e-4, 1)), curve(Math.max(u - 1e-4, 0))));
  const scene = L.sceneIndexAt(t);
  const o = L.SCENE_ORIGINS[scene];
  const focus = [o[0], o[1] + L.FOCUS_HEIGHT, o[2]];
  let look = add(pos, tan.map((v) => v * L.LOOK_AHEAD));
  const wgt = L.focusWeight(L.sceneProgressAt(t, scene));
  look = look.map((v, i) => v + (focus[i] - v) * wgt);
  return { pos, look };
}
const basis = (ps) => {
  const f = norm(sub(ps.look, ps.pos));
  const r = norm(cross(f, [0, 1, 0]));
  return { f, r, u: cross(r, f) };
};

// Placeholder box (PlaceholderScene.tsx): 3 × 3 × 3, centred 1.5 above the scene origin, spinning
const BOX_Y = 1.5, BOX_HALF_DIAGONAL = 1.5 * Math.SQRT2;
const SCREENS = [
  ['phone 390x844', 390 / 844],
  ['phone 9:16', 9 / 16],
  ['tablet portrait', 3 / 4],
  ['laptop 16:9', 16 / 9],
];
const MIN_VISIBLE_PERCENT = 25; // every scene, every screen: the box is in view this much of its scroll
const MAX_PART_A_YAW = 30; // deg/s during the auto-played opening ("slow cinematic camera")
const MIN_CLEARANCE = 1.0; // world units between the camera and the box's bounding circle

const N = 500;
console.log('Box in view, % of each scene (scene 1 … 9):');
for (const [name, aspect] of SCREENS) {
  const tanV = Math.tan((L.fovForAspect(aspect) * Math.PI) / 360);
  const tanH = tanV * aspect;
  const row = [];
  for (let i = 0; i < L.SCENE_COUNT; i++) {
    const [s, e] = L.SCENE_RANGES[i];
    let visible = 0;
    for (let k = 0; k < N; k++) {
      const ps = pose(s + ((e - s) * (k + 0.5)) / N);
      const { f, r, u } = basis(ps);
      const v = sub([L.SCENE_ORIGINS[i][0], BOX_Y, L.SCENE_ORIGINS[i][2]], ps.pos);
      const z = dot(v, f);
      if (z > 0.1 && Math.abs(dot(v, r)) <= z * tanH && Math.abs(dot(v, u)) <= z * tanV) visible++;
    }
    row.push((100 * visible) / N);
  }
  console.log(`  ${name.padEnd(16)} ${row.map((v) => v.toFixed(0).padStart(3)).join(' ')}   (min ${Math.min(...row).toFixed(0)}%)`);
  assert.ok(Math.min(...row) >= MIN_VISIBLE_PERCENT, `${name}: a placeholder box is in view less than ${MIN_VISIBLE_PERCENT}% of its scene`);
}

// Turn rate during Part A (t advances at PART_A_END_T over PART_A_DURATION_S seconds)
const partARate = L.PART_A_END_T / L.PART_A_DURATION_S;
const STEPS = 4000;
let prevYaw = null, maxYaw = 0;
for (let k = 0; k <= STEPS; k++) {
  const t = (k / STEPS) * L.PART_A_END_T;
  const { f } = basis(pose(t));
  const yaw = (Math.atan2(f[0], -f[2]) * 180) / Math.PI;
  if (prevYaw !== null) maxYaw = Math.max(maxYaw, (Math.abs(yaw - prevYaw) * STEPS / L.PART_A_END_T) * partARate);
  prevYaw = yaw;
}
console.log(`Part A max turn rate: ${maxYaw.toFixed(1)} deg/s (limit ${MAX_PART_A_YAW})`);
assert.ok(maxYaw <= MAX_PART_A_YAW, `Part A turns too fast: ${maxYaw.toFixed(1)} deg/s`);

// Clearance: the camera never passes through a room's box
let clearance = Infinity;
for (let i = 0; i < L.SCENE_COUNT; i++) {
  const [s, e] = L.SCENE_RANGES[i];
  for (let k = 0; k < N; k++) {
    const ps = pose(s + ((e - s) * (k + 0.5)) / N);
    if (ps.pos[1] < -0.5 || ps.pos[1] > 3.5) continue;
    const d = Math.hypot(L.SCENE_ORIGINS[i][0] - ps.pos[0], L.SCENE_ORIGINS[i][2] - ps.pos[2]) - BOX_HALF_DIAGONAL;
    clearance = Math.min(clearance, d);
  }
}
console.log(`Closest the camera gets to a box: ${clearance.toFixed(1)} units (minimum ${MIN_CLEARANCE})`);
assert.ok(clearance >= MIN_CLEARANCE, `camera passes too close to a box: ${clearance.toFixed(2)}`);

console.log('framing checks passed');

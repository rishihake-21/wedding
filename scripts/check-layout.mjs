// Guards the frozen layout contract (src/core/layout.ts). Needs Node 22.6+; no install required.
//   npm run check
import assert from 'node:assert/strict';
import * as L from '../src/core/layout.ts';

const near = (a, b, msg, eps = 1e-12) => assert.ok(Math.abs(a - b) < eps, `${msg}: ${a} vs ${b}`);

// Counts line up
assert.equal(L.SCENE_META.length, L.SCENE_COUNT);
assert.equal(L.SCENE_RANGES.length, L.SCENE_COUNT);
assert.equal(L.SCENE_ORIGINS.length, L.SCENE_COUNT);
assert.equal(L.CAMERA_WAYPOINTS.length, L.SCENE_COUNT + 1);

// Ranges: start at 0, end at 1, contiguous, strictly increasing
assert.equal(L.SCENE_RANGES[0][0], 0);
assert.equal(L.SCENE_RANGES[L.SCENE_COUNT - 1][1], 1);
for (let i = 0; i < L.SCENE_COUNT; i++) {
  const [s, e] = L.SCENE_RANGES[i];
  assert.ok(e > s, `scene ${i} has non-positive width`);
  if (i > 0) assert.equal(L.SCENE_RANGES[i - 1][1], s, `gap before scene ${i}`);
}

// Part A ends exactly at PART_A_END_T; its scenes are sliced in proportion to their running time
assert.equal(L.SCENE_RANGES[L.PART_A_SCENES - 1][1], L.PART_A_END_T);
assert.equal(L.SCENE_RANGES[L.PART_A_SCENES][0], L.PART_A_END_T);
const w = L.SCENE_RANGES.slice(0, L.PART_A_SCENES).map(([s, e]) => e - s);
near(w[0] / w[1], 0.8, 'scene 1 : scene 2 width');
near(w[1], w[2], 'scene 2 = scene 3');
near(w[2], w[3], 'scene 3 = scene 4');

// sceneIndexAt: a scene's start belongs to it, just before belongs to the previous one, ends clamp
for (let i = 0; i < L.SCENE_COUNT; i++) {
  assert.equal(L.sceneIndexAt(L.sceneStartT(i)), i, `start of scene ${i}`);
  if (i > 0) assert.equal(L.sceneIndexAt(L.sceneStartT(i) - 1e-9), i - 1, `just before scene ${i}`);
}
assert.equal(L.sceneIndexAt(-5), 0);
assert.equal(L.sceneIndexAt(1), L.SCENE_COUNT - 1);
assert.equal(L.sceneIndexAt(7), L.SCENE_COUNT - 1);

// Local progress: 0 at start, 1 at end, 0.5 midway, clamped outside
for (let i = 0; i < L.SCENE_COUNT; i++) {
  const [s, e] = L.SCENE_RANGES[i];
  near(L.sceneProgressAt(s, i), 0, `progress at start ${i}`);
  near(L.sceneProgressAt(e, i), 1, `progress at end ${i}`);
  near(L.sceneProgressAt((s + e) / 2, i), 0.5, `progress mid ${i}`);
  assert.equal(L.sceneProgressAt(s - 0.1, i), 0);
  assert.equal(L.sceneProgressAt(e + 0.1, i), 1);
}

// Path parameter: monotonic, continuous, each scene owns exactly one spline segment
near(L.tToPathU(0), 0, 'u(0)');
near(L.tToPathU(1), 1, 'u(1)');
let prev = 0;
for (let k = 0; k <= 10000; k++) {
  const u = L.tToPathU(k / 10000);
  assert.ok(u >= prev, `u not monotonic at ${k}`);
  assert.ok(u - prev < 0.002, `u jumps at ${k}: ${prev} -> ${u}`);
  prev = u;
}
for (let i = 1; i < L.SCENE_COUNT; i++) {
  near(L.tToPathU(L.sceneStartT(i)), i / L.SCENE_COUNT, `u at boundary ${i}`);
}

// Mounted set: the active scene and the next, never more than two
assert.deepEqual(L.mountedSceneIndices(0), [0, 1]);
assert.deepEqual(L.mountedSceneIndices(7), [7, 8]);
assert.deepEqual(L.mountedSceneIndices(8), [8]);

// Gaze weight: zero at both ends of a scene (continuous across boundaries), peaks at 1/3, never above 1
near(L.focusWeight(0), 0, 'focusWeight(0)');
near(L.focusWeight(1), 0, 'focusWeight(1)');
let peakAt = 0, peak = 0;
for (let k = 0; k <= 1000; k++) {
  const v = L.focusWeight(k / 1000);
  assert.ok(v >= 0 && v <= 1, `focusWeight out of range at ${k}: ${v}`);
  if (v > peak) { peak = v; peakAt = k / 1000; }
}
near(peakAt, 1 / 3, 'focusWeight peak position', 2e-3);
assert.ok(peak > 0.4, `focusWeight peak too weak: ${peak}`);

// Field of view: 60° on landscape and square, 80° on tall phones, widening monotonically
near(L.fovForAspect(16 / 9), 60, 'fov 16:9');
near(L.fovForAspect(1), 60, 'fov square');
near(L.fovForAspect(0.75), 70, 'fov tablet portrait');
near(L.fovForAspect(390 / 844), 80, 'fov phone');
near(L.fovForAspect(0.3), 80, 'fov very tall');
for (let a = 2; a > 0.3; a -= 0.01) {
  assert.ok(L.fovForAspect(a - 0.01) >= L.fovForAspect(a) - 1e-12, `fov not monotonic at aspect ${a}`);
}

console.log('layout checks passed');

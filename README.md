# Vrindavan Wedding Invitation

A phone-first, cinematic 3D wedding invitation (Marathi + English). Vite, React 18, TypeScript, React Three Fiber.

**Status: Phase 1 of 10** — scaffold, frozen contracts, spline camera rig, scene manager and nine placeholder scenes.

## Run

```bash
npm install
npm run dev            # http://localhost:5173
npm run dev:host       # also reachable from your phone on the LAN address
npm run typecheck
npm run check          # layout + camera-framing guards; needs Node 22.6+, no other setup
```

Developer URL switches:

| URL | Effect |
| --- | --- |
| `?stage=journey` | Skip the gate and start scrolling through all nine placeholder scenes |
| `?quality=low` | Force a quality tier: `high`, `medium`, `low`, `lite` |
| `?debug` | Show the FPS counter and debug overlay (always on under `npm run dev`) |

## How it fits together

- One master value `t` (0–1) drives everything. Scene `i` owns a slice of `t` (`SCENE_RANGES` in `src/core/layout.ts`) and receives its own local `progress` (0–1).
- The camera follows one Catmull-Rom spline through `CAMERA_WAYPOINTS`; scene `i` covers the segment between waypoint `i` and `i + 1`.
- Only the active scene and the next one are mounted.
- Moving the camera on purpose (menu links, Skip) goes through `useAppStore.getState().jumpTo(t)`. In scroll mode the scroll position owns `t`, so writing `t` directly would be undone on the next frame.
- The vertical field of view widens on portrait screens (`fovForAspect`), so rooms stay in frame on phones. `npm run check` fails if that regresses.
- Part A will auto-play `t` (Phase 2); Part B maps scroll to `t`. In Phase 1 only scroll exists.
- All guest-facing copy lives in `src/content/content.ts` and is currently placeholder.

See `CLAUDE.md` for the rules every phase follows.

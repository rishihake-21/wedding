import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerformanceMonitor, Stats } from '@react-three/drei';
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing';
import {
  ACESFilmicToneMapping,
  Color,
  Fog,
  PerspectiveCamera,
  PMREMGenerator,
  SRGBColorSpace,
  type DirectionalLight,
  type HemisphereLight,
} from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { CelestialSky } from '../shared/geometry';
import { IS_SOFTWARE_GL, QUALITY_BUDGETS } from '../shared/quality';
import { colors } from '../theme/tokens';
import { audioManager } from './audio';
import { CameraRig } from './CameraRig';
import { DEV_FLAGS } from './devFlags';
import { JourneyScroll } from './JourneyScroll';
import { CAMERA_WAYPOINTS, FOV_LANDSCAPE, fovForAspect, SEGMENT_LENGTH } from './layout';
import { PartADriver } from './PartADriver';
import { SceneManager } from './SceneManager';
import { RENDER_TELEMETRY, useAppStore } from './store';

/**
 * Fog starts close and ends just beyond one scene-length away. The next room mounts one
 * scene-length ahead of the camera, so it emerges gently without pop-in.
 */
const FOG_NEAR = 11;
const FOG_FAR = SEGMENT_LENGTH - 3;

const [START_X, START_Y, START_Z] = CAMERA_WAYPOINTS[0];

interface AtmospherePreset {
  bg: string;
  fog: string;
  hemiSky: string;
  hemiGround: string;
  hemiIntensity: number;
  dirColor: string;
  dirIntensity: number;
}

/** Distinct environment atmospheres for every single one of the 9 scenes. */
const SCENE_ATMOSPHERES: readonly AtmospherePreset[] = [
  // 0: Invocation — Deep Yamuna Midnight Indigo
  {
    bg: '#061024',
    fog: '#08152C',
    hemiSky: '#6E8ED4',
    hemiGround: '#0C2538',
    hemiIntensity: 0.95,
    dirColor: '#FFF2D6',
    dirIntensity: 1.45,
  },
  // 1: Groom — Emerald-Teal Twilight Vrindavan Grove
  {
    bg: '#061E24',
    fog: '#08262C',
    hemiSky: '#6CC4B8',
    hemiGround: '#0A2922',
    hemiIntensity: 1.05,
    dirColor: '#F6E7C1',
    dirIntensity: 1.5,
  },
  // 2: Bride — INDOOR PALACE: Royal Rose-Gold Sheesh-Mahal Chamber
  {
    bg: '#230E1C',
    fog: '#281020',
    hemiSky: '#F4B8C8',
    hemiGround: '#4A1D2B',
    hemiIntensity: 1.25,
    dirColor: '#FFE4C2',
    dirIntensity: 1.65,
  },
  // 3: Union — INDOOR PALACE: Grand Rajwada Darbar Hall
  {
    bg: '#26140A',
    fog: '#2B170C',
    hemiSky: '#F8D49E',
    hemiGround: '#542414',
    hemiIntensity: 1.32,
    dirColor: '#FFE8BA',
    dirIntensity: 1.75,
  },
  // 4: Date — Starlit Moonlit Lotus Courtyard
  {
    bg: '#081633',
    fog: '#0B1D40',
    hemiSky: '#88AEE8',
    hemiGround: '#0E2D45',
    hemiIntensity: 1.0,
    dirColor: '#FFF6E0',
    dirIntensity: 1.5,
  },
  // 5: Venue — Royal Sunset-Plum Palace Mandap Terrace
  {
    bg: '#1A112E',
    fog: '#211538',
    hemiSky: '#D2A6E8',
    hemiGround: '#3E2218',
    hemiIntensity: 1.15,
    dirColor: '#FFD599',
    dirIntensity: 1.65,
  },
  // 6: Schedule — Festive Crimson & Gold Sangeet Palace Courtyard
  {
    bg: '#240C18',
    fog: '#2B101E',
    hemiSky: '#F2A8B4',
    hemiGround: '#3D1520',
    hemiIntensity: 1.18,
    dirColor: '#FFD6A5',
    dirIntensity: 1.6,
  },
  // 7: Families — INDOOR PALACE SANCTUM: Warm Sacred Devghar Temple Hall
  {
    bg: '#1F1208',
    fog: '#26160A',
    hemiSky: '#F4CE90',
    hemiGround: '#47250F',
    hemiIntensity: 1.28,
    dirColor: '#FFE0A3',
    dirIntensity: 1.7,
  },
  // 8: RSVP — Farewell Moonlit Yamuna Ghat
  {
    bg: '#061426',
    fog: '#091B30',
    hemiSky: '#75A5D8',
    hemiGround: '#0B2A38',
    hemiIntensity: 0.98,
    dirColor: '#FFF0D0',
    dirIntensity: 1.45,
  },
];

/** Keeps the vertical field of view matched to the screen shape (wider on portrait phones). */
function ResponsiveFov() {
  const camera = useThree((s) => s.camera);
  const width = useThree((s) => s.size.width);
  const height = useThree((s) => s.size.height);

  useLayoutEffect(() => {
    if (!(camera instanceof PerspectiveCamera)) return;
    camera.fov = fovForAspect(height > 0 ? width / height : 1);
    camera.updateProjectionMatrix();
  }, [camera, width, height]);

  return null;
}

/** Smoothly transitions background, fog, and key/fill lights to match each scene's environment. */
function SceneAtmosphere() {
  const scene = useThree((s) => s.scene);
  const hemiRef = useRef<HemisphereLight>(null);
  const dirRef = useRef<DirectionalLight>(null);
  const initialized = useRef(false);

  const targets = useMemo(
    () =>
      SCENE_ATMOSPHERES.map((p) => ({
        bg: new Color(p.bg),
        fog: new Color(p.fog),
        hemiSky: new Color(p.hemiSky),
        hemiGround: new Color(p.hemiGround),
        hemiIntensity: p.hemiIntensity,
        dirColor: new Color(p.dirColor),
        dirIntensity: p.dirIntensity,
      })),
    [],
  );

  useFrame((_, delta) => {
    const idx = Math.max(0, Math.min(targets.length - 1, useAppStore.getState().activeScene));
    const target = targets[idx];
    const alpha = initialized.current ? Math.min(1, delta * 4.5) : 1;
    initialized.current = true;

    if (scene.background instanceof Color) {
      scene.background.lerp(target.bg, alpha);
    }
    if (scene.fog instanceof Fog) {
      scene.fog.color.lerp(target.fog, alpha);
    }
    if (hemiRef.current) {
      hemiRef.current.color.lerp(target.hemiSky, alpha);
      hemiRef.current.groundColor.lerp(target.hemiGround, alpha);
      hemiRef.current.intensity += (target.hemiIntensity - hemiRef.current.intensity) * alpha;
    }
    if (dirRef.current) {
      dirRef.current.color.lerp(target.dirColor, alpha);
      dirRef.current.intensity += (target.dirIntensity - dirRef.current.intensity) * alpha;
    }
  });

  return (
    <>
      <hemisphereLight ref={hemiRef} args={['#6E8ED4', '#0C2538', 0.95]} />
      <directionalLight ref={dirRef} position={[-8, 22, 14]} intensity={1.45} color="#FFF2D6" />
    </>
  );
}

/** Sets up procedural RoomEnvironment PMREM so brass, gold zari, and marble gleam richly. */
function StudioEnvironment() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);

  useEffect(() => {
    const pmrem = new PMREMGenerator(gl);
    const env = new RoomEnvironment();
    const rt = pmrem.fromScene(env, 0.04);
    scene.environment = rt.texture;
    scene.environmentIntensity = 0.6;
    env.dispose();
    pmrem.dispose();
    return () => {
      scene.environment = null;
      rt.dispose();
    };
  }, [gl, scene]);

  return null;
}

/** Attaches WebGL context loss/restore listeners for graceful fallback recovery. */
function WebGLContextMonitor() {
  const gl = useThree((s) => s.gl);

  useEffect(() => {
    const canvas = gl.domElement;
    const onLost = (e: Event) => {
      e.preventDefault();
      useAppStore.getState().setWebglLost(true);
    };
    const onRestored = () => {
      useAppStore.getState().setWebglLost(false);
    };
    canvas.addEventListener('webglcontextlost', onLost, false);
    canvas.addEventListener('webglcontextrestored', onRestored, false);
    return () => {
      canvas.removeEventListener('webglcontextlost', onLost, false);
      canvas.removeEventListener('webglcontextrestored', onRestored, false);
    };
  }, [gl]);

  return null;
}

/** Updates draw-call & triangle metrics for ?debug DevOverlay and plays subtle venue bells cue. */
function SceneTelemetryAndCues() {
  const gl = useThree((s) => s.gl);
  const lastVenueBell = useRef(false);
  const frames = useRef(0);
  const lastFpsTime = useRef(performance.now());

  useFrame(() => {
    RENDER_TELEMETRY.drawCalls = gl.info.render.calls;
    RENDER_TELEMETRY.triangles = gl.info.render.triangles;

    frames.current++;
    const now = performance.now();
    if (now - lastFpsTime.current >= 500) {
      RENDER_TELEMETRY.fps = Math.round((frames.current * 1000) / (now - lastFpsTime.current));
      frames.current = 0;
      lastFpsTime.current = now;
    }

    const active = useAppStore.getState().activeScene;
    if (active === 5 && !lastVenueBell.current) {
      lastVenueBell.current = true;
      audioManager.playCue('bells');
    } else if (active !== 5) {
      lastVenueBell.current = false;
    }
  });

  return null;
}

export function Experience() {
  const stage = useAppStore((s) => s.stage);
  const quality = useAppStore((s) => s.quality);
  const budget = QUALITY_BUDGETS[quality];

  const handleDecline = () => {
    if (IS_SOFTWARE_GL || DEV_FLAGS.forcedQuality) return;
    const curr = useAppStore.getState().quality;
    if (curr === 'high') useAppStore.getState().setQuality('medium');
    else if (curr === 'medium') useAppStore.getState().setQuality('low');
  };

  return (
    <div className="absolute inset-0" data-testid="vrindavan-canvas-container">
      <PartADriver />
      <Canvas
        dpr={[1, budget.dprMax]}
        camera={{ fov: FOV_LANDSCAPE, near: 0.1, far: 160, position: [START_X, START_Y, START_Z] }}
        gl={{
          antialias: !IS_SOFTWARE_GL,
          powerPreference: 'high-performance',
          toneMapping: ACESFilmicToneMapping,
          toneMappingExposure: 1.18,
          outputColorSpace: SRGBColorSpace,
        }}
      >
        <color attach="background" args={[colors.midnight]} />
        <fog attach="fog" args={[colors.midnight, FOG_NEAR, FOG_FAR]} />

        <SceneAtmosphere />
        <StudioEnvironment />
        <CelestialSky quality={quality} />
        <WebGLContextMonitor />
        <SceneTelemetryAndCues />
        <ResponsiveFov />
        <CameraRig />
        <SceneManager />

        {!IS_SOFTWARE_GL && <PerformanceMonitor onDecline={handleDecline} />}

        {budget.bloom && (
          <EffectComposer multisampling={0}>
            <Bloom mipmapBlur luminanceThreshold={0.78} intensity={0.72} radius={0.62} />
            <Vignette eskil={false} offset={0.22} darkness={0.55} />
          </EffectComposer>
        )}

        {stage === 'journey' && <JourneyScroll />}
        {DEV_FLAGS.showDebug && <Stats />}
      </Canvas>
    </div>
  );
}

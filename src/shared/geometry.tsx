import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CatmullRomCurve3,
  CylinderGeometry,
  DoubleSide,
  InstancedMesh,
  LatheGeometry,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  PlaneGeometry,
  PointsMaterial,
  TubeGeometry,
  Vector2,
  Vector3,
} from 'three';
import type { Group, Points } from 'three';
import type { QualityTier } from '../core/types';
import { useAppStore } from '../core/store';
import { colors } from '../theme/tokens';
import { scaledCount } from './quality';
import { createFramedPortraitMaterial, createNightSkyMaterial } from './shaders';
import {
  createBarkTexture,
  createCroppedPhotoTexture,
  createFlameSpriteTexture,
  createFoliageClusterTexture,
  createLilyPadTexture,
  createLotusPetalTexture,
  createMoonSurfaceTexture,
  createSoftGlowTexture,
  type NormalizedCrop,
} from './textures';

/** Real couple photographs uploaded by the user (served from /public/assets/aistudio). */
export const COUPLE_PHOTO_EVENING = '/assets/aistudio/DSC_7553.JPG_210d7259.jpeg';
export const COUPLE_PHOTO_TRADITIONAL = '/assets/aistudio/DSC_7263.JPG_cbd053d6.jpeg';

/** Enclosed indoor palace scene indices (2 = Bride Sheesh-Mahal, 3 = Union Darbar, 7 = Families Devghar). */
export const INDOOR_SCENE_INDICES = new Set<number>([2, 3, 7]);

const _dummy = new Object3D();

/** Shared lunar direction vector matching sky atmospheric scatter and Yamuna water specular trail. */
export const MOON_DIRECTION = new Vector3(-0.14, 0.29, -0.946).normalize();

/**
 * Single unified Vrindavan Celestial Sky mounted once in Experience.tsx:
 * - Deep indigo-to-teal night sky dome
 * - Twinkling starfield across the vault
 * - Exactly ONE textured, luminous Full Moon with atmospheric corona
 * Follows the camera's XZ translation so the sky & moon stay seamless across all 9 scenes.
 */
export function CelestialSky({ quality }: { quality: QualityTier }) {
  const skyGroupRef = useRef<Group>(null);
  const starsRef = useRef<Points>(null);

  const skyMat = useMemo(() => createNightSkyMaterial(), []);
  const moonTex = useMemo(() => createMoonSurfaceTexture(), []);
  const glowTex = useMemo(() => createSoftGlowTexture(), []);

  const starCount = scaledCount(340, quality);
  const starGeo = useMemo(() => {
    const geo = new BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    let seed = 9001;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    for (let i = 0; i < starCount; i++) {
      const theta = rand() * Math.PI * 2;
      const phi = rand() * Math.PI * 0.44;
      const r = 74 + rand() * 8;
      positions[i * 3] = Math.sin(phi) * Math.cos(theta) * r;
      positions[i * 3 + 1] = Math.cos(phi) * r * 0.62 + 3;
      positions[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * r;
    }
    geo.setAttribute('position', new BufferAttribute(positions, 3));
    return geo;
  }, [starCount]);

  const starMat = useMemo(
    () =>
      new PointsMaterial({
        color: colors.cream,
        size: 0.32,
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
        fog: false,
      }),
    [],
  );

  const moonPos = useMemo(() => MOON_DIRECTION.clone().multiplyScalar(68), []);

  useEffect(() => {
    return () => {
      skyMat.dispose();
      moonTex.dispose();
      glowTex.dispose();
      starGeo.dispose();
      starMat.dispose();
    };
  }, [skyMat, moonTex, glowTex, starGeo, starMat]);

  useFrame(({ clock, camera }) => {
    const elapsed = clock.getElapsedTime();
    const activeScene = useAppStore.getState().activeScene;
    const isIndoor = INDOOR_SCENE_INDICES.has(activeScene);
    if (skyGroupRef.current) {
      skyGroupRef.current.visible = !isIndoor;
      if (!isIndoor) {
        skyGroupRef.current.position.set(camera.position.x, 0, camera.position.z);
      }
    }
    if (starsRef.current && !isIndoor) {
      starsRef.current.rotation.y = elapsed * 0.004;
    }
  });

  return (
    <group ref={skyGroupRef}>
      {/* Seamless Vrindavan night sky dome */}
      <mesh material={skyMat} renderOrder={-10}>
        <sphereGeometry args={[86, 32, 20]} />
      </mesh>

      {/* Twinkling starfield */}
      <points ref={starsRef} geometry={starGeo} material={starMat} />

      {/* The single Vrindavan Sharad Purnima Full Moon */}
      <group position={[moonPos.x, moonPos.y, moonPos.z]}>
        <mesh rotation={[0, -0.4, 0]}>
          <sphereGeometry args={[3.4, 32, 32]} />
          <meshBasicMaterial map={moonTex} color="#FFFDF5" fog={false} />
        </mesh>
        {/* Soft inner warm lunar rim */}
        <sprite scale={[12.5, 12.5, 1]}>
          <spriteMaterial
            map={glowTex}
            color="#FFF5D8"
            transparent
            opacity={0.48}
            depthWrite={false}
            blending={AdditiveBlending}
            fog={false}
          />
        </sprite>
        {/* Broad silver-indigo moonlight aura */}
        <sprite scale={[24, 24, 1]}>
          <spriteMaterial
            map={glowTex}
            color="#B8CCE8"
            transparent
            opacity={0.18}
            depthWrite={false}
            blending={AdditiveBlending}
            fog={false}
          />
        </sprite>
      </group>
    </group>
  );
}

/**
 * Instanced floating earthen diyas (terracotta bowl + flickering emissive flame sprite)
 * drifting serenely across the Yamuna water.
 */
export function FloatingDiyas({
  baseCount = 36,
  quality,
  spreadX = 16,
  spreadZ = 24,
  waterY = 0.04,
  onTapDiya,
}: {
  baseCount?: number;
  quality: QualityTier;
  spreadX?: number;
  spreadZ?: number;
  waterY?: number;
  onTapDiya?: () => void;
}) {
  const count = scaledCount(baseCount, quality);
  const bowlsRef = useRef<InstancedMesh>(null);
  const flamesRef = useRef<InstancedMesh>(null);

  const flameTex = useMemo(() => createFlameSpriteTexture(), []);
  const bowlGeo = useMemo(() => {
    const pts = [
      new Vector2(0.0, 0.0),
      new Vector2(0.14, 0.01),
      new Vector2(0.24, 0.08),
      new Vector2(0.26, 0.14),
      new Vector2(0.21, 0.14),
      new Vector2(0.14, 0.06),
      new Vector2(0.0, 0.05),
    ];
    return new LatheGeometry(pts, 16);
  }, []);
  const flameGeo = useMemo(() => new PlaneGeometry(0.26, 0.42), []);

  const bowlMat = useMemo(
    () => new MeshStandardMaterial({ color: '#8A4824', roughness: 0.78, metalness: 0.1 }),
    [],
  );
  const flameMat = useMemo(
    () =>
      new MeshBasicMaterial({
        map: flameTex,
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
        side: DoubleSide,
        fog: false,
      }),
    [flameTex],
  );

  const seeds = useMemo(() => {
    let s = 4201;
    const rand = () => {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
    return Array.from({ length: count }, () => ({
      x: (rand() - 0.5) * spreadX,
      z: (rand() - 0.5) * spreadZ,
      phase: rand() * Math.PI * 2,
      drift: 0.15 + rand() * 0.25,
      scale: 0.8 + rand() * 0.55,
    }));
  }, [count, spreadX, spreadZ]);

  useEffect(() => {
    return () => {
      flameTex.dispose();
      bowlGeo.dispose();
      flameGeo.dispose();
      bowlMat.dispose();
      flameMat.dispose();
    };
  }, [flameTex, bowlGeo, flameGeo, bowlMat, flameMat]);

  useFrame(({ clock, camera }) => {
    const bowls = bowlsRef.current;
    const flames = flamesRef.current;
    if (!bowls || !flames) return;
    const t = clock.getElapsedTime();

    for (let i = 0; i < count; i++) {
      const d = seeds[i];
      const x = d.x + Math.sin(t * 0.3 + d.phase) * 0.35;
      const z = d.z + Math.cos(t * 0.25 + d.phase) * 0.35;
      const bob = Math.sin(t * 1.4 + d.phase) * 0.03;

      _dummy.position.set(x, waterY + bob, z);
      _dummy.rotation.set(Math.sin(t + d.phase) * 0.04, d.phase, Math.cos(t + d.phase) * 0.04);
      _dummy.scale.setScalar(d.scale);
      _dummy.updateMatrix();
      bowls.setMatrixAt(i, _dummy.matrix);

      const flicker = 0.88 + 0.16 * Math.sin(t * 7.5 + d.phase * 3.0);
      _dummy.position.set(x, waterY + bob + 0.24 * d.scale, z);
      _dummy.quaternion.copy(camera.quaternion);
      _dummy.scale.set(d.scale * flicker, d.scale * (0.9 + 0.15 * flicker), 1);
      _dummy.updateMatrix();
      flames.setMatrixAt(i, _dummy.matrix);
    }
    bowls.instanceMatrix.needsUpdate = true;
    flames.instanceMatrix.needsUpdate = true;
  });

  return (
    <group
      onClick={
        onTapDiya
          ? (e) => {
              e.stopPropagation();
              onTapDiya();
            }
          : undefined
      }
    >
      <instancedMesh ref={bowlsRef} args={[bowlGeo, bowlMat, count]} frustumCulled={false} />
      <instancedMesh ref={flamesRef} args={[flameGeo, flameMat, count]} frustumCulled={false} />
    </group>
  );
}

/**
 * Sculpted Vrindavan Kadamba Tree:
 * Curved organic furrowed-bark trunk + buttress roots + 5 arching boughs (`TubeGeometry`),
 * lush instanced botanical leaf-cluster frond canopy swaying gently in the wind,
 * and glowing golden spherical Kadamba blossoms with soft halos.
 */
export function KadambaTree({
  position = [0, 0, 0],
  scale = 1,
  rotationY = 0,
}: {
  position?: readonly [number, number, number];
  scale?: number;
  rotationY?: number;
}) {
  const canopyRef = useRef<Group>(null);
  const foliageRef = useRef<InstancedMesh>(null);

  const barkTex = useMemo(() => createBarkTexture(), []);
  const leafTex = useMemo(() => createFoliageClusterTexture(), []);
  const glowTex = useMemo(() => createSoftGlowTexture(), []);

  const { trunkGeo, branches, leafGeo } = useMemo(() => {
    const trunkCurve = new CatmullRomCurve3([
      new Vector3(0, 0, 0),
      new Vector3(0.08, 1.15, 0.06),
      new Vector3(-0.07, 2.35, -0.05),
      new Vector3(0.04, 3.45, 0.03),
      new Vector3(0.0, 4.1, 0.0),
    ]);
    const tGeo = new TubeGeometry(trunkCurve, 18, 0.28, 10, false);

    const branchDefs: [Vector3[], number][] = [
      [
        [
          new Vector3(0, 3.1, 0),
          new Vector3(-0.95, 3.85, 0.4),
          new Vector3(-2.1, 4.35, 0.7),
          new Vector3(-2.75, 4.15, 0.9),
        ],
        0.12,
      ],
      [
        [
          new Vector3(0, 3.25, 0),
          new Vector3(1.05, 3.95, -0.3),
          new Vector3(2.2, 4.45, -0.55),
          new Vector3(2.8, 4.2, -0.75),
        ],
        0.12,
      ],
      [
        [
          new Vector3(0, 3.35, 0),
          new Vector3(0.25, 4.15, 1.05),
          new Vector3(0.5, 4.65, 2.05),
          new Vector3(0.65, 4.45, 2.55),
        ],
        0.1,
      ],
      [
        [
          new Vector3(0, 3.3, 0),
          new Vector3(-0.45, 4.2, -1.0),
          new Vector3(-0.85, 4.75, -1.95),
          new Vector3(-1.1, 4.5, -2.45),
        ],
        0.1,
      ],
      [
        [
          new Vector3(0, 3.6, 0),
          new Vector3(0.15, 4.55, 0.1),
          new Vector3(-0.1, 5.45, -0.15),
        ],
        0.09,
      ],
    ];
    const bGeos = branchDefs.map(([pts, rad]) => new TubeGeometry(new CatmullRomCurve3(pts), 14, rad, 8, false));

    return {
      trunkGeo: tGeo,
      branches: bGeos,
      leafGeo: new PlaneGeometry(1.45, 1.45),
    };
  }, []);

  const barkMat = useMemo(
    () =>
      new MeshStandardMaterial({
        map: barkTex,
        color: '#8D7362',
        roughness: 0.92,
        metalness: 0.04,
      }),
    [barkTex],
  );

  const leafMat = useMemo(
    () =>
      new MeshStandardMaterial({
        map: leafTex,
        alphaTest: 0.32,
        side: DoubleSide,
        roughness: 0.72,
        metalness: 0.06,
      }),
    [leafTex],
  );

  const leafCount = 86;
  const leafSeeds = useMemo(() => {
    let s = 3191;
    const rand = () => {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
    // Cluster leaves around the 5 branch tips + central crown dome
    const centers: [number, number, number, number][] = [
      [0, 5.15, 0, 1.65],
      [-2.15, 4.3, 0.75, 1.35],
      [2.25, 4.35, -0.6, 1.35],
      [0.5, 4.55, 1.95, 1.25],
      [-0.85, 4.6, -1.85, 1.25],
    ];
    return Array.from({ length: leafCount }, (_, i) => {
      const [cx, cy, cz, rad] = centers[i % centers.length];
      const theta = rand() * Math.PI * 2;
      const phi = rand() * Math.PI * 0.78;
      const r = (0.35 + rand() * 0.65) * rad;
      return {
        x: cx + Math.sin(phi) * Math.cos(theta) * r,
        y: cy + Math.cos(phi) * r * 0.65 - 0.15,
        z: cz + Math.sin(phi) * Math.sin(theta) * r,
        rx: (rand() - 0.5) * 1.4,
        ry: rand() * Math.PI * 2,
        rz: (rand() - 0.5) * 1.1,
        scale: 0.78 + rand() * 0.62,
        phase: rand() * Math.PI * 2,
      };
    });
  }, []);

  const blossoms = useMemo<[number, number, number][]>(
    () => [
      [-2.4, 3.85, 1.05],
      [-1.55, 4.55, 1.35],
      [2.45, 3.9, -0.35],
      [1.65, 4.7, 0.65],
      [0.55, 4.05, 2.45],
      [-0.45, 5.45, 1.05],
      [0.95, 5.55, -0.65],
      [-1.15, 4.15, -2.2],
      [0.2, 4.85, -1.45],
      [-2.05, 4.85, -0.3],
      [2.1, 4.85, -1.35],
      [0.05, 5.85, 0.25],
    ],
    [],
  );

  useEffect(() => {
    const mesh = foliageRef.current;
    if (mesh) {
      for (let i = 0; i < leafCount; i++) {
        const d = leafSeeds[i];
        _dummy.position.set(d.x, d.y, d.z);
        _dummy.rotation.set(d.rx, d.ry, d.rz);
        _dummy.scale.setScalar(d.scale);
        _dummy.updateMatrix();
        mesh.setMatrixAt(i, _dummy.matrix);
      }
      mesh.instanceMatrix.needsUpdate = true;
    }
    return () => {
      barkTex.dispose();
      leafTex.dispose();
      glowTex.dispose();
      trunkGeo.dispose();
      branches.forEach((g) => g.dispose());
      leafGeo.dispose();
      barkMat.dispose();
      leafMat.dispose();
    };
  }, [barkTex, leafTex, glowTex, trunkGeo, branches, leafGeo, barkMat, leafMat, leafSeeds]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (canopyRef.current) {
      canopyRef.current.rotation.z = Math.sin(t * 0.72 + position[0]) * 0.025;
      canopyRef.current.rotation.x = Math.cos(t * 0.58 + position[2]) * 0.018;
    }
  });

  return (
    <group position={[position[0], position[1], position[2]]} scale={scale} rotation={[0, rotationY, 0]}>
      {/* Flared root buttresses */}
      <mesh position={[0, 0.22, 0]} material={barkMat}>
        <cylinderGeometry args={[0.3, 0.68, 0.48, 12]} />
      </mesh>
      {[0, 1.3, 2.7, 4.1, 5.3].map((ang, idx) => (
        <mesh
          key={idx}
          position={[Math.cos(ang) * 0.34, 0.18, Math.sin(ang) * 0.34]}
          rotation={[Math.sin(ang) * 0.55, 0, -Math.cos(ang) * 0.55]}
          material={barkMat}
        >
          <cylinderGeometry args={[0.07, 0.16, 0.65, 7]} />
        </mesh>
      ))}

      {/* Sculpted curved main trunk & arching branches */}
      <mesh geometry={trunkGeo} material={barkMat} />
      {branches.map((geo, idx) => (
        <mesh key={idx} geometry={geo} material={barkMat} />
      ))}

      {/* Swaying layered botanical foliage & glowing golden Kadamba flowers */}
      <group ref={canopyRef}>
        <instancedMesh ref={foliageRef} args={[leafGeo, leafMat, leafCount]} frustumCulled={false} />

        {blossoms.map(([bx, by, bz], idx) => (
          <group key={idx} position={[bx, by, bz]}>
            <mesh>
              <sphereGeometry args={[0.14, 12, 12]} />
              <meshStandardMaterial
                color={colors.gold}
                emissive={colors.marigold}
                emissiveIntensity={0.85}
                roughness={0.42}
              />
            </mesh>
            <sprite scale={[0.58, 0.58, 1]}>
              <spriteMaterial
                map={glowTex}
                color={colors.gold}
                transparent
                opacity={0.45}
                depthWrite={false}
                blending={AdditiveBlending}
              />
            </sprite>
          </group>
        ))}
      </group>
    </group>
  );
}

/**
 * Builds a custom sculpted, spoon-cupped botanical sacred lotus petal mesh
 * with narrow stem base, broad curved belly, gentle S-curve spine, and acuminate tip.
 */
function createLotusPetalGeometry(length = 1.25, maxWidth = 0.52, cupDepth = 0.16): BufferGeometry {
  const segU = 10;
  const segV = 14;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let iv = 0; iv <= segV; iv++) {
    const v = iv / segV; // 0 = base, 1 = pointed tip
    // Botanical teardrop/lanceolate width profile: narrow base, wide belly at v=0.42, acuminate pointed tip
    const widthProfile = Math.pow(Math.sin(Math.pow(v, 0.72) * Math.PI), 0.82);
    const halfW = maxWidth * 0.5 * widthProfile;

    // Graceful spine arch: rises along Y, sweeps slightly outward then curls delicately inward/up at tip
    const y = v * length;
    const spineZ = Math.sin(v * Math.PI) * 0.14 - Math.pow(v, 2.4) * 0.08;

    for (let iu = 0; iu <= segU; iu++) {
      const u = iu / segU; // 0..1 across width
      const s = (u - 0.5) * 2; // -1..1
      const x = s * halfW;
      // Cupped cross-section (center curves slightly inward toward flower heart, edges curve out)
      const cup = (1 - s * s) * cupDepth * widthProfile;
      const z = spineZ + cup;

      positions.push(x, y, z);
      uvs.push(u, 1 - v);
    }
  }

  for (let iv = 0; iv < segV; iv++) {
    for (let iu = 0; iu < segU; iu++) {
      const a = iv * (segU + 1) + iu;
      const b = a + 1;
      const c = a + (segU + 1);
      const d = c + 1;
      indices.push(a, b, d, a, d, c);
    }
  }

  const geo = new BufferGeometry();
  geo.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
  geo.setAttribute('uv', new BufferAttribute(new Float32Array(uvs), 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/** Smooth cubic ease-out-back helper for lush organic petal unfurling. */
function easeOutBack(x: number): number {
  const t = Math.max(0, Math.min(1, x));
  const c1 = 1.15;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

/**
 * High-craft multi-ring sculpted 3D Sacred Lotus flower:
 * - Parametric cupped veined lotus petals in 4 concentric rings (sepals, outer, mid, inner = 28 petals)
 * - Golden Padma Karnika receptacle + 18 glowing stamen filaments
 * - Dramatic staggered ring-by-ring & petal-by-petal bloom animation with organic breathing
 * - Optional veined notched lily pad
 */
export function LotusFlower({
  position = [0, 0, 0],
  scale = 1,
  bloomRef,
  staticBloom = 0.85,
  withPad = true,
  onClick,
}: {
  position?: readonly [number, number, number];
  scale?: number;
  bloomRef?: { current: number };
  staticBloom?: number;
  withPad?: boolean;
  onClick?: () => void;
}) {
  const sepalRef = useRef<Group>(null);
  const outerRef = useRef<Group>(null);
  const midRef = useRef<Group>(null);
  const innerRef = useRef<Group>(null);
  const coreRef = useRef<Group>(null);

  const petalTex = useMemo(() => createLotusPetalTexture(), []);
  const padTex = useMemo(() => createLilyPadTexture(), []);
  const glowTex = useMemo(() => createSoftGlowTexture(), []);

  const sepalGeo = useMemo(() => createLotusPetalGeometry(1.12, 0.44, 0.14), []);
  const outerPetalGeo = useMemo(() => createLotusPetalGeometry(1.38, 0.62, 0.2), []);
  const midPetalGeo = useMemo(() => createLotusPetalGeometry(1.18, 0.54, 0.19), []);
  const innerPetalGeo = useMemo(() => createLotusPetalGeometry(0.95, 0.44, 0.18), []);

  const sepalMat = useMemo(
    () =>
      new MeshStandardMaterial({
        color: '#2B6E5B',
        emissive: '#133A31',
        emissiveIntensity: 0.25,
        roughness: 0.55,
        metalness: 0.06,
        side: DoubleSide,
      }),
    [],
  );
  const outerMat = useMemo(
    () =>
      new MeshStandardMaterial({
        map: petalTex,
        color: '#F7C6D6',
        emissive: '#9E3159',
        emissiveIntensity: 0.34,
        roughness: 0.34,
        metalness: 0.08,
        side: DoubleSide,
      }),
    [petalTex],
  );
  const midMat = useMemo(
    () =>
      new MeshStandardMaterial({
        map: petalTex,
        color: '#FFE0EA',
        emissive: '#C24D78',
        emissiveIntensity: 0.36,
        roughness: 0.3,
        metalness: 0.08,
        side: DoubleSide,
      }),
    [petalTex],
  );
  const innerMat = useMemo(
    () =>
      new MeshStandardMaterial({
        map: petalTex,
        color: '#FFF6E8',
        emissive: colors.gold,
        emissiveIntensity: 0.42,
        roughness: 0.26,
        metalness: 0.1,
        side: DoubleSide,
      }),
    [petalTex],
  );

  useEffect(() => {
    return () => {
      petalTex.dispose();
      padTex.dispose();
      glowTex.dispose();
      sepalGeo.dispose();
      outerPetalGeo.dispose();
      midPetalGeo.dispose();
      innerPetalGeo.dispose();
      sepalMat.dispose();
      outerMat.dispose();
      midMat.dispose();
      innerMat.dispose();
    };
  }, [
    petalTex,
    padTex,
    glowTex,
    sepalGeo,
    outerPetalGeo,
    midPetalGeo,
    innerPetalGeo,
    sepalMat,
    outerMat,
    midMat,
    innerMat,
  ]);

  const sepalAngles = useMemo(() => Array.from({ length: 6 }, (_, i) => (i * Math.PI * 2) / 6), []);
  const outerAngles = useMemo(() => Array.from({ length: 8 }, (_, i) => (i * Math.PI * 2) / 8), []);
  const midAngles = useMemo(() => Array.from({ length: 8 }, (_, i) => ((i + 0.5) * Math.PI * 2) / 8), []);
  const innerAngles = useMemo(() => Array.from({ length: 6 }, (_, i) => ((i + 0.25) * Math.PI * 2) / 6), []);
  const stamens = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => {
        const a = (i * Math.PI * 2) / 18;
        const r = i % 2 === 0 ? 0.22 : 0.15;
        return { x: Math.cos(a) * r, z: Math.sin(a) * r, a, h: i % 2 === 0 ? 0.34 : 0.26 };
      }),
    [],
  );

  useFrame(({ clock }) => {
    const rawBloom = bloomRef ? bloomRef.current : staticBloom;
    const b = Math.max(0, Math.min(1, rawBloom));
    const t = clock.getElapsedTime();

    // Cascading ring-by-ring & petal-by-petal spiral unfurling
    const animateRing = (
      group: Group | null,
      windowStart: number,
      windowSpan: number,
      closedAngle: number,
      openAngle: number,
      staggerStep: number,
    ) => {
      if (!group) return;
      const children = group.children;
      for (let i = 0; i < children.length; i++) {
        const petal = children[i].children[0];
        if (!petal) continue;
        const local = (b - (windowStart + i * staggerStep)) / windowSpan;
        const eased = easeOutBack(local);
        const breathe = Math.sin(t * 1.35 + i * 0.65) * 0.032 * (0.3 + 0.7 * b);
        petal.rotation.x = closedAngle + (openAngle - closedAngle) * eased + breathe;
        const petalScale = 0.82 + 0.18 * Math.max(0, Math.min(1, local));
        petal.scale.set(petalScale, 0.88 + 0.12 * Math.max(0, Math.min(1, local)), petalScale);
      }
    };

    // 1. Emerald sepals peel back first
    animateRing(sepalRef.current, 0.0, 0.36, 0.24, 1.48, 0.015);
    // 2. Outer rose petals sweep gracefully wide
    animateRing(outerRef.current, 0.1, 0.44, 0.14, 1.24, 0.022);
    // 3. Middle blush petals open in a lush spiral bowl
    animateRing(midRef.current, 0.28, 0.44, 0.08, 0.86, 0.024);
    // 4. Inner creamy-gold petals part last to reveal the luminous golden stamen crown
    animateRing(innerRef.current, 0.48, 0.42, 0.04, 0.48, 0.026);

    if (coreRef.current) {
      const pulse = 0.92 + b * 0.2 + Math.sin(t * 2.4) * 0.04;
      coreRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <group
      position={[position[0], position[1], position[2]]}
      scale={scale}
      onClick={
        onClick
          ? (e) => {
              e.stopPropagation();
              onClick();
            }
          : undefined
      }
    >
      {withPad && (
        <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0.4]}>
          <planeGeometry args={[2.8, 2.8]} />
          <meshStandardMaterial
            map={padTex}
            alphaTest={0.2}
            transparent
            roughness={0.62}
            metalness={0.08}
            side={DoubleSide}
          />
        </mesh>
      )}

      {/* Golden Padma Karnika receptacle + glowing stamen crown */}
      <group ref={coreRef} position={[0, 0.18, 0]}>
        <mesh position={[0, 0.04, 0]}>
          <cylinderGeometry args={[0.24, 0.14, 0.22, 16]} />
          <meshStandardMaterial
            color={colors.gold}
            emissive={colors.marigold}
            emissiveIntensity={1.15}
            roughness={0.3}
            metalness={0.25}
          />
        </mesh>
        {stamens.map((st, idx) => (
          <group key={idx} position={[st.x, 0.12, st.z]} rotation={[Math.sin(st.a) * 0.24, 0, -Math.cos(st.a) * 0.24]}>
            <mesh position={[0, st.h * 0.5, 0]}>
              <cylinderGeometry args={[0.011, 0.015, st.h, 6]} />
              <meshStandardMaterial
                color="#FFE599"
                emissive={colors.gold}
                emissiveIntensity={0.85}
                roughness={0.3}
              />
            </mesh>
            <mesh position={[0, st.h + 0.03, 0]}>
              <sphereGeometry args={[0.034, 8, 8]} />
              <meshBasicMaterial color="#FFF6D6" fog={false} />
            </mesh>
          </group>
        ))}
        <sprite position={[0, 0.35, 0]} scale={[1.65, 1.65, 1]}>
          <spriteMaterial
            map={glowTex}
            color={colors.gold}
            transparent
            opacity={0.55}
            depthWrite={false}
            blending={AdditiveBlending}
            fog={false}
          />
        </sprite>
      </group>

      {/* Ring 0: Outer emerald sepals */}
      <group ref={sepalRef} position={[0, 0.03, 0]}>
        {sepalAngles.map((a, idx) => (
          <group key={idx} rotation={[0, a, 0]}>
            <mesh geometry={sepalGeo} material={sepalMat} />
          </group>
        ))}
      </group>

      {/* Ring 1: Outer rose petals */}
      <group ref={outerRef} position={[0, 0.08, 0]}>
        {outerAngles.map((a, idx) => (
          <group key={idx} rotation={[0, a, 0]}>
            <mesh geometry={outerPetalGeo} material={outerMat} />
          </group>
        ))}
      </group>

      {/* Ring 2: Middle blush petals */}
      <group ref={midRef} position={[0, 0.13, 0]}>
        {midAngles.map((a, idx) => (
          <group key={idx} rotation={[0, a, 0]}>
            <mesh geometry={midPetalGeo} material={midMat} />
          </group>
        ))}
      </group>

      {/* Ring 3: Inner ivory-gold crown petals */}
      <group ref={innerRef} position={[0, 0.18, 0]}>
        {innerAngles.map((a, idx) => (
          <group key={idx} rotation={[0, a, 0]}>
            <mesh geometry={innerPetalGeo} material={innerMat} />
          </group>
        ))}
      </group>
    </group>
  );
}

/** Traditional Maharashtrian turned brass standing oil lamp (Samai). */
export function BrassSamaiLamp({
  position = [0, 0, 0],
  scale = 1,
  lit = true,
}: {
  position?: readonly [number, number, number];
  scale?: number;
  lit?: boolean;
}) {
  const flameRef = useRef<Group>(null);
  const flameTex = useMemo(() => createFlameSpriteTexture(), []);
  const bodyGeo = useMemo(() => {
    const pts = [
      new Vector2(0.0, 0.0),
      new Vector2(0.42, 0.02),
      new Vector2(0.36, 0.14),
      new Vector2(0.14, 0.28),
      new Vector2(0.08, 0.72),
      new Vector2(0.14, 0.84),
      new Vector2(0.07, 1.42),
      new Vector2(0.34, 1.56),
      new Vector2(0.38, 1.66),
      new Vector2(0.12, 1.64),
      new Vector2(0.04, 1.98),
      new Vector2(0.0, 2.08),
    ];
    return new LatheGeometry(pts, 18);
  }, []);

  useEffect(() => {
    return () => {
      flameTex.dispose();
      bodyGeo.dispose();
    };
  }, [flameTex, bodyGeo]);

  useFrame(({ clock, camera }) => {
    if (!flameRef.current || !lit) return;
    const t = clock.getElapsedTime();
    const s = 0.92 + Math.sin(t * 7.2 + position[0]) * 0.1;
    flameRef.current.quaternion.copy(camera.quaternion);
    flameRef.current.scale.setScalar(s);
  });

  return (
    <group position={[position[0], position[1], position[2]]} scale={scale}>
      <mesh geometry={bodyGeo}>
        <meshStandardMaterial color={colors.gold} metalness={0.86} roughness={0.22} />
      </mesh>
      {lit && (
        <group ref={flameRef} position={[0, 1.82, 0]}>
          <mesh>
            <planeGeometry args={[0.42, 0.64]} />
            <meshBasicMaterial
              map={flameTex}
              transparent
              depthWrite={false}
              blending={AdditiveBlending}
              side={DoubleSide}
              fog={false}
            />
          </mesh>
        </group>
      )}
    </group>
  );
}

/** Shared cylindrical pedestal / stone ghat column helper. */
export function StonePlinth({
  position = [0, 0, 0],
  radius = 2.6,
  height = 0.45,
}: {
  position?: readonly [number, number, number];
  radius?: number;
  height?: number;
}) {
  const geo = useMemo(() => new CylinderGeometry(radius * 0.94, radius, height, 32), [radius, height]);
  useEffect(() => () => geo.dispose(), [geo]);
  return (
    <group position={[position[0], position[1] + height / 2, position[2]]}>
      <mesh geometry={geo}>
        <meshStandardMaterial color="#182748" roughness={0.76} metalness={0.2} />
      </mesh>
      <mesh position={[0, height / 2 + 0.02, 0]}>
        <cylinderGeometry args={[radius * 0.96, radius * 0.96, 0.04, 32]} />
        <meshStandardMaterial color={colors.gold} roughness={0.28} metalness={0.85} />
      </mesh>
    </group>
  );
}

/**
 * Ornate sculpted 3D royal Pichwai portrait frame displaying a real cropped photograph
 * with gentle 2.5D pointer parallax, gilded arch columns, lotus finial, and warm backlight halo.
 */
export function RoyalPortraitFrame({
  src,
  crop,
  width = 2.6,
  height = 3.9,
  archMode = 'arch',
  haloColor = colors.gold,
  position = [0, 0, 0],
  outWidth = 640,
  outHeight = 960,
}: {
  src: string;
  crop: NormalizedCrop;
  width?: number;
  height?: number;
  archMode?: 'arch' | 'royalRect';
  haloColor?: string;
  position?: readonly [number, number, number];
  outWidth?: number;
  outHeight?: number;
}) {
  const photoTex = useMemo(
    () => createCroppedPhotoTexture(src, crop, outWidth, outHeight),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [src, crop.x, crop.y, crop.w, crop.h, outWidth, outHeight],
  );
  const portraitMat = useMemo(
    () => createFramedPortraitMaterial(photoTex, archMode),
    [photoTex, archMode],
  );
  const glowTex = useMemo(() => createSoftGlowTexture(), []);

  useEffect(() => {
    return () => {
      photoTex.dispose();
      portraitMat.dispose();
      glowTex.dispose();
    };
  }, [photoTex, portraitMat, glowTex]);

  useFrame(({ clock, pointer }) => {
    const t = clock.getElapsedTime();
    portraitMat.uniforms.uOffset.value = [
      Math.sin(t * 0.65) * 0.28 + pointer.x * 0.42,
      Math.cos(t * 0.52) * 0.18 + pointer.y * 0.3,
    ];
  });

  const halfW = width * 0.5;
  const halfH = height * 0.5;
  const pillarH = archMode === 'arch' ? height * 0.68 : height * 0.92;

  return (
    <group position={[position[0], position[1], position[2]]}>
      {/* Soft warm backlit aura behind portrait */}
      <mesh position={[0, 0.08, -0.22]}>
        <planeGeometry args={[width * 1.55, height * 1.35]} />
        <meshBasicMaterial
          map={glowTex}
          color={haloColor}
          transparent
          opacity={0.42}
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </mesh>

      {/* Velvet shadow backing plate so silhouette never bleeds through */}
      <mesh position={[0, -0.02, -0.05]}>
        <boxGeometry args={[width * 0.96, pillarH * 0.98, 0.06]} />
        <meshStandardMaterial color="#1A0E16" roughness={0.8} metalness={0.1} />
      </mesh>

      {/* Real cropped portrait with Pichwai arch mask & subtle 2.5D parallax */}
      <mesh position={[0, 0, 0.01]} material={portraitMat}>
        <planeGeometry args={[width, height]} />
      </mesh>

      {/* Ornate sculpted gold flanking colonnettes */}
      <mesh position={[-halfW - 0.04, -halfH + pillarH * 0.5, 0.02]}>
        <cylinderGeometry args={[0.055, 0.075, pillarH, 12]} />
        <meshStandardMaterial color={colors.gold} metalness={0.86} roughness={0.22} />
      </mesh>
      <mesh position={[halfW + 0.04, -halfH + pillarH * 0.5, 0.02]}>
        <cylinderGeometry args={[0.055, 0.075, pillarH, 12]} />
        <meshStandardMaterial color={colors.gold} metalness={0.86} roughness={0.22} />
      </mesh>

      {/* Base gilded sill bar */}
      <mesh position={[0, -halfH - 0.02, 0.03]}>
        <boxGeometry args={[width + 0.26, 0.12, 0.14]} />
        <meshStandardMaterial color={colors.gold} metalness={0.86} roughness={0.24} />
      </mesh>

      {/* Crown arch ring & golden Kalash finial */}
      <mesh position={[0, -halfH + pillarH, 0.02]}>
        <torusGeometry args={[halfW + 0.04, 0.065, 10, 32, Math.PI]} />
        <meshStandardMaterial color={colors.gold} metalness={0.88} roughness={0.2} />
      </mesh>
      <mesh position={[0, -halfH + pillarH + halfW + 0.22, 0.02]}>
        <sphereGeometry args={[0.11, 12, 12]} />
        <meshStandardMaterial
          color={colors.gold}
          emissive={colors.marigold}
          emissiveIntensity={0.45}
          metalness={0.9}
          roughness={0.18}
        />
      </mesh>
      <mesh position={[0, -halfH + pillarH + halfW + 0.42, 0.02]}>
        <coneGeometry args={[0.07, 0.26, 10]} />
        <meshStandardMaterial color={colors.gold} metalness={0.9} roughness={0.18} />
      </mesh>
    </group>
  );
}

/** Towering sculpted Indian palace fluted marble & gilded-capital column. */
export function PalaceColumn({
  position = [0, 0, 0],
  height = 6.2,
  radius = 0.34,
  shaftColor = '#E6D6C3',
}: {
  position?: readonly [number, number, number];
  height?: number;
  radius?: number;
  shaftColor?: string;
}) {
  return (
    <group position={[position[0], position[1], position[2]]}>
      {/* Octagonal marble plinth base */}
      <mesh position={[0, 0.22, 0]}>
        <cylinderGeometry args={[radius * 1.45, radius * 1.6, 0.44, 8]} />
        <meshStandardMaterial color="#8E6C54" roughness={0.55} metalness={0.22} />
      </mesh>
      {/* Gilded lotus base collar */}
      <mesh position={[0, 0.56, 0]}>
        <cylinderGeometry args={[radius * 1.1, radius * 1.38, 0.26, 12]} />
        <meshStandardMaterial color={colors.gold} metalness={0.84} roughness={0.24} />
      </mesh>
      {/* Fluted marble column shaft */}
      <mesh position={[0, height * 0.5, 0]}>
        <cylinderGeometry args={[radius * 0.9, radius, height - 1.25, 16]} />
        <meshStandardMaterial color={shaftColor} roughness={0.42} metalness={0.12} />
      </mesh>
      {/* Mid gilded decorative rings */}
      <mesh position={[0, height * 0.36, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius * 0.98, 0.045, 8, 20]} />
        <meshStandardMaterial color={colors.gold} metalness={0.86} roughness={0.22} />
      </mesh>
      <mesh position={[0, height * 0.72, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius * 0.95, 0.045, 8, 20]} />
        <meshStandardMaterial color={colors.gold} metalness={0.86} roughness={0.22} />
      </mesh>
      {/* Carved lotus capital & bracket cornice */}
      <mesh position={[0, height - 0.52, 0]}>
        <cylinderGeometry args={[radius * 1.5, radius * 0.94, 0.44, 12]} />
        <meshStandardMaterial color={colors.gold} metalness={0.84} roughness={0.24} />
      </mesh>
      <mesh position={[0, height - 0.16, 0]}>
        <boxGeometry args={[radius * 3.2, 0.3, radius * 3.2]} />
        <meshStandardMaterial color="#6D4B3A" roughness={0.52} metalness={0.25} />
      </mesh>
    </group>
  );
}

/** Tiered ornate brass & warm glowing crystal palace Jhoomar chandelier. */
export function PalaceChandelier({
  position = [0, 5.8, 0],
  scale = 1,
  glowColor = '#FFE4A8',
}: {
  position?: readonly [number, number, number];
  scale?: number;
  glowColor?: string;
}) {
  const ref = useRef<Group>(null);
  const glowTex = useMemo(() => createSoftGlowTexture(), []);
  useEffect(() => () => glowTex.dispose(), [glowTex]);

  useFrame(({ clock }) => {
    if (ref.current) {
      const t = clock.getElapsedTime();
      ref.current.rotation.y = Math.sin(t * 0.35 + position[0]) * 0.08;
    }
  });

  const candles = useMemo(
    () => Array.from({ length: 8 }, (_, i) => (i * Math.PI * 2) / 8),
    [],
  );

  return (
    <group ref={ref} position={[position[0], position[1], position[2]]} scale={scale}>
      {/* Suspension chain from palace ceiling */}
      <mesh position={[0, 1.1, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 2.2, 8]} />
        <meshStandardMaterial color={colors.gold} metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Central gilded brass body & lower crystal finial */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.14, 0.24, 0.65, 12]} />
        <meshStandardMaterial color={colors.gold} metalness={0.88} roughness={0.2} />
      </mesh>
      <mesh position={[0, -0.58, 0]}>
        <coneGeometry args={[0.24, 0.52, 10]} />
        <meshStandardMaterial
          color="#FFF3D6"
          emissive={glowColor}
          emissiveIntensity={0.85}
          roughness={0.18}
          metalness={0.2}
        />
      </mesh>
      {/* Ornate outer brass ring */}
      <mesh position={[0, -0.08, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.92, 0.045, 8, 28]} />
        <meshStandardMaterial color={colors.gold} metalness={0.88} roughness={0.2} />
      </mesh>
      {/* 8 glowing palace candles / crystal lamps */}
      {candles.map((a, idx) => (
        <group key={idx} position={[Math.cos(a) * 0.92, 0.06, Math.sin(a) * 0.92]}>
          <mesh position={[0, -0.06, 0]}>
            <cylinderGeometry args={[0.06, 0.04, 0.14, 8]} />
            <meshStandardMaterial color={colors.gold} metalness={0.88} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.12, 0]}>
            <sphereGeometry args={[0.09, 10, 10]} />
            <meshBasicMaterial color="#FFF9E6" />
          </mesh>
        </group>
      ))}
      {/* Warm indoor chandelier halo */}
      <sprite position={[0, -0.05, 0]} scale={[3.8, 3.8, 1]}>
        <spriteMaterial
          map={glowTex}
          color={glowColor}
          transparent
          opacity={0.48}
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </sprite>
    </group>
  );
}

/** Draped royal velvet palace curtain panel with gilded tassel tie-back. */
export function VelvetDrapery({
  position = [0, 0, 0],
  height = 5.8,
  color = '#6E1730',
}: {
  position?: readonly [number, number, number];
  height?: number;
  color?: string;
}) {
  return (
    <group position={[position[0], position[1], position[2]]}>
      {[-0.22, 0, 0.22].map((dx, idx) => (
        <mesh key={idx} position={[dx, height * 0.5, Math.abs(dx) * 0.2]}>
          <cylinderGeometry args={[0.16, 0.22, height, 10]} />
          <meshStandardMaterial color={color} roughness={0.84} metalness={0.08} />
        </mesh>
      ))}
      {/* Golden zari tie-back band */}
      <mesh position={[0, height * 0.36, 0.05]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.38, 0.05, 8, 18]} />
        <meshStandardMaterial color={colors.gold} metalness={0.86} roughness={0.22} />
      </mesh>
    </group>
  );
}

/** Hanging antique brass Indian temple bell (Ghanta) with gentle ceremonial sway. */
export function TempleBell({
  position = [0, 4.6, 0],
  scale = 1,
}: {
  position?: readonly [number, number, number];
  scale?: number;
}) {
  const ref = useRef<Group>(null);
  const bellGeo = useMemo(() => {
    const pts = [
      new Vector2(0.0, 0.0),
      new Vector2(0.32, 0.02),
      new Vector2(0.24, 0.16),
      new Vector2(0.18, 0.42),
      new Vector2(0.12, 0.56),
      new Vector2(0.05, 0.66),
      new Vector2(0.0, 0.7),
    ];
    return new LatheGeometry(pts, 18);
  }, []);
  useEffect(() => () => bellGeo.dispose(), [bellGeo]);

  useFrame(({ clock }) => {
    if (ref.current) {
      const t = clock.getElapsedTime();
      ref.current.rotation.z = Math.sin(t * 1.15 + position[0] * 1.7) * 0.06;
    }
  });

  return (
    <group ref={ref} position={[position[0], position[1], position[2]]} scale={scale}>
      {/* Brass suspension chain */}
      <mesh position={[0, 0.85, 0]}>
        <cylinderGeometry args={[0.022, 0.022, 1.7, 6]} />
        <meshStandardMaterial color={colors.gold} metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Turned brass bell body */}
      <mesh position={[0, -0.68, 0]} geometry={bellGeo}>
        <meshStandardMaterial color={colors.gold} metalness={0.88} roughness={0.22} />
      </mesh>
      {/* Clapper */}
      <mesh position={[0, -0.72, 0]}>
        <sphereGeometry args={[0.08, 10, 10]} />
        <meshStandardMaterial color="#B8872C" metalness={0.86} roughness={0.28} />
      </mesh>
    </group>
  );
}

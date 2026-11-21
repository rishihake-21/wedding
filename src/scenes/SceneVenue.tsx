import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  AdditiveBlending,
  CatmullRomCurve3,
  DoubleSide,
  TubeGeometry,
  Vector3,
  type Group,
} from 'three';
import type { SceneProps } from '../core/types';
import { DriftingParticles } from '../shared/particles';
import { createLightRibbonMaterial } from '../shared/shaders';
import {
  createFlameSpriteTexture,
  createPalaceMarbleTexture,
  createRangoliTexture,
  createSoftGlowTexture,
} from '../shared/textures';
import { colors } from '../theme/tokens';

const LAMP_POSITIONS: readonly [number, number, number][] = [
  [-1.9, 0.25, 5.8],
  [1.9, 0.25, 5.8],
  [-1.9, 0.25, 3.8],
  [1.9, 0.25, 3.8],
  [-2.35, 0.48, 2.35],
  [2.35, 0.48, 2.35],
];

const PILLAR_COORDS: readonly [number, number][] = [
  [-2.1, -2.1],
  [2.1, -2.1],
  [-2.1, 2.1],
  [2.1, 2.1],
];

/**
 * Scene 6 — Venue Reveal (Stylized Maharashtrian Wedding Mandap).
 * A glowing flute-light pathway leads up to a composite 3D mandap with carved columns,
 * tiered shikhara dome, Kalash finial, marigold torans, floor rangoli, and brass lamps
 * switching on in sequence with `progress`.
 */
export function SceneVenue({ progress, quality }: SceneProps) {
  const lampFlameRefs = useRef<(Group | null)[]>([]);

  const sandstoneTex = useMemo(
    () => createPalaceMarbleTexture('#CEB49D', '#9B7D68', colors.gold, 6),
    [],
  );
  const rangoliTex = useMemo(() => createRangoliTexture(), []);
  const flameTex = useMemo(() => createFlameSpriteTexture(), []);
  const glowTex = useMemo(() => createSoftGlowTexture(), []);

  const pathGeo = useMemo(() => {
    const curve = new CatmullRomCurve3([
      new Vector3(0, 0.14, 11.5),
      new Vector3(0.4, 0.14, 8.2),
      new Vector3(-0.3, 0.14, 5.0),
      new Vector3(0, 0.22, 2.4),
    ]);
    return new TubeGeometry(curve, 44, 0.12, 8, false);
  }, []);
  const pathMat = useMemo(() => createLightRibbonMaterial(colors.gold, colors.marigold), []);

  useEffect(() => {
    return () => {
      sandstoneTex.dispose();
      rangoliTex.dispose();
      flameTex.dispose();
      glowTex.dispose();
      pathGeo.dispose();
      pathMat.dispose();
    };
  }, [sandstoneTex, rangoliTex, flameTex, glowTex, pathGeo, pathMat]);

  useFrame(({ clock, camera }) => {
    const t = clock.getElapsedTime();
    const p = progress.current;
    pathMat.uniforms.uTime.value = t;
    pathMat.uniforms.uProgress.value = Math.min(1, p * 1.45 + 0.2);

    // Switch on pathway & mandap brass lamps one by one as progress advances
    LAMP_POSITIONS.forEach((_, idx) => {
      const grp = lampFlameRefs.current[idx];
      if (!grp) return;
      const threshold = 0.08 + idx * 0.09;
      const lit = Math.max(0, Math.min(1, (p - threshold) / 0.12));
      const flicker = 0.9 + Math.sin(t * 7.8 + idx * 1.7) * 0.12;
      grp.visible = lit > 0.02;
      grp.scale.setScalar(lit * flicker);
      grp.quaternion.copy(camera.quaternion);
    });
  });

  return (
    <group>
      {/* Warm royal terrace lantern glow */}
      <pointLight position={[0, 4.8, 2.5]} intensity={10} distance={22} decay={1.6} color="#FFD394" />

      {/* Royal Rajwada Inlaid Sandstone Terrace Courtyard */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <circleGeometry args={[18, 36]} />
        <meshStandardMaterial map={sandstoneTex} roughness={0.58} metalness={0.14} />
      </mesh>

      {/* Carved Palace Terrace Parapet Wall & Twin Domed Corner Chhatris framing the Mandap */}
      <group position={[0, 0, -5.6]}>
        <mesh position={[0, 0.65, 0]}>
          <boxGeometry args={[14.5, 1.3, 0.42]} />
          <meshStandardMaterial color="#4A2B36" roughness={0.62} metalness={0.18} />
        </mesh>
        <mesh position={[0, 1.36, 0]}>
          <boxGeometry args={[14.8, 0.12, 0.56]} />
          <meshStandardMaterial color={colors.gold} metalness={0.82} roughness={0.26} />
        </mesh>

        {([-6.2, 6.2] as const).map((cx, idx) => (
          <group key={idx} position={[cx, 0, 0.6]}>
            <mesh position={[0, 0.3, 0]}>
              <cylinderGeometry args={[1.45, 1.6, 0.6, 8]} />
              <meshStandardMaterial color="#59333E" roughness={0.6} metalness={0.18} />
            </mesh>
            {[0, 1, 2, 3].map((pIdx) => {
              const a = (pIdx * Math.PI) / 2 + Math.PI / 4;
              return (
                <mesh key={pIdx} position={[Math.cos(a) * 1.0, 1.85, Math.sin(a) * 1.0]}>
                  <cylinderGeometry args={[0.1, 0.12, 2.6, 10]} />
                  <meshStandardMaterial color="#E6D2BE" roughness={0.48} metalness={0.14} />
                </mesh>
              );
            })}
            <mesh position={[0, 3.25, 0]}>
              <cylinderGeometry args={[1.3, 1.5, 0.24, 8]} />
              <meshStandardMaterial color={colors.gold} metalness={0.84} roughness={0.24} />
            </mesh>
            <mesh position={[0, 3.55, 0]}>
              <sphereGeometry args={[1.22, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
              <meshStandardMaterial color="#6D2337" roughness={0.48} metalness={0.25} />
            </mesh>
            <mesh position={[0, 4.9, 0]}>
              <coneGeometry args={[0.12, 0.48, 8]} />
              <meshStandardMaterial color={colors.gold} metalness={0.88} roughness={0.2} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Glowing golden pathway leading to the mandap */}
      <mesh geometry={pathGeo} material={pathMat} />

      {/* Composite 3D Maharashtrian Wedding Mandap */}
      <group position={[0, 0, 0]}>
        {/* Lower stone platform */}
        <mesh position={[0, 0.16, 0]}>
          <boxGeometry args={[5.8, 0.32, 5.8]} />
          <meshStandardMaterial color="#1A2B4C" roughness={0.78} metalness={0.14} />
        </mesh>
        {/* Upper mandap dais */}
        <mesh position={[0, 0.39, 0]}>
          <boxGeometry args={[5.0, 0.18, 5.0]} />
          <meshStandardMaterial color="#25375C" roughness={0.72} metalness={0.18} />
        </mesh>
        {/* Traditional floor Rangoli medallion (offset +0.02 above dais to prevent Z-fighting) */}
        <mesh position={[0, 0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[3.4, 3.4]} />
          <meshBasicMaterial map={rangoliTex} transparent depthWrite={false} />
        </mesh>

        {/* Four ornate mandap pillars with brass base & capital */}
        {PILLAR_COORDS.map(([px, pz], idx) => (
          <group key={idx} position={[px, 0.48, pz]}>
            <mesh position={[0, 0.18, 0]}>
              <cylinderGeometry args={[0.26, 0.32, 0.36, 12]} />
              <meshStandardMaterial color={colors.gold} metalness={0.82} roughness={0.26} />
            </mesh>
            <mesh position={[0, 1.85, 0]}>
              <cylinderGeometry args={[0.16, 0.19, 3.0, 14]} />
              <meshStandardMaterial color={colors.cream} roughness={0.55} metalness={0.12} />
            </mesh>
            <mesh position={[0, 3.42, 0]}>
              <cylinderGeometry args={[0.3, 0.2, 0.28, 12]} />
              <meshStandardMaterial color={colors.gold} metalness={0.84} roughness={0.24} />
            </mesh>
          </group>
        ))}

        {/* Top gilded cornice beams */}
        <mesh position={[0, 4.05, 0]}>
          <boxGeometry args={[5.1, 0.28, 5.1]} />
          <meshStandardMaterial color={colors.gold} metalness={0.78} roughness={0.28} />
        </mesh>

        {/* Tiered shikhara canopy dome + golden Kalash finial */}
        <mesh position={[0, 4.55, 0]}>
          <cylinderGeometry args={[1.6, 2.7, 0.72, 8]} />
          <meshStandardMaterial color="#6B1E32" roughness={0.52} metalness={0.25} />
        </mesh>
        <mesh position={[0, 5.2, 0]}>
          <sphereGeometry args={[1.45, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
          <meshStandardMaterial color={colors.gold} metalness={0.86} roughness={0.22} />
        </mesh>
        {/* Kalash spire */}
        <mesh position={[0, 6.22, 0]}>
          <coneGeometry args={[0.16, 0.65, 10]} />
          <meshStandardMaterial
            color={colors.gold}
            emissive={colors.marigold}
            emissiveIntensity={0.45}
            metalness={0.9}
            roughness={0.18}
          />
        </mesh>

        {/* Marigold Toran garlands draped across the front and sides */}
        {Array.from({ length: 11 }, (_, idx) => {
          const x = -2.0 + idx * 0.4;
          const sag = Math.sin((idx / 10) * Math.PI) * 0.42;
          return (
            <group key={idx}>
              {/* Front toran */}
              <mesh position={[x, 3.85 - sag, 2.2]}>
                <sphereGeometry args={[0.14, 10, 10]} />
                <meshStandardMaterial
                  color={idx % 2 === 0 ? colors.marigold : colors.gold}
                  emissive={colors.marigold}
                  emissiveIntensity={0.35}
                  roughness={0.48}
                />
              </mesh>
              {/* Left & right side torans */}
              <mesh position={[-2.2, 3.85 - sag, x]}>
                <sphereGeometry args={[0.13, 8, 8]} />
                <meshStandardMaterial color={colors.marigold} roughness={0.5} />
              </mesh>
              <mesh position={[2.2, 3.85 - sag, x]}>
                <sphereGeometry args={[0.13, 8, 8]} />
                <meshStandardMaterial color={colors.marigold} roughness={0.5} />
              </mesh>
            </group>
          );
        })}
      </group>

      {/* Sequential brass pathway & mandap lamps */}
      {LAMP_POSITIONS.map(([lx, ly, lz], idx) => (
        <group key={idx} position={[lx, ly, lz]}>
          <mesh position={[0, 0.35, 0]}>
            <cylinderGeometry args={[0.08, 0.16, 0.7, 10]} />
            <meshStandardMaterial color={colors.gold} metalness={0.85} roughness={0.25} />
          </mesh>
          <group
            ref={(el) => {
              lampFlameRefs.current[idx] = el;
            }}
            position={[0, 0.88, 0]}
          >
            <mesh>
              <planeGeometry args={[0.42, 0.64]} />
              <meshBasicMaterial
                map={flameTex}
                transparent
                depthWrite={false}
                blending={AdditiveBlending}
                side={DoubleSide}
              />
            </mesh>
          </group>
        </group>
      ))}

      {/* Festive warm fireflies around mandap */}
      <DriftingParticles
        baseCount={36}
        quality={quality}
        texture={glowTex}
        spreadX={12}
        spreadY={5.5}
        spreadZ={14}
        baseY={0.7}
        size={0.2}
        motion="rise"
        additive
        opacity={0.85}
        color={colors.gold}
      />
    </group>
  );
}

export default SceneVenue;

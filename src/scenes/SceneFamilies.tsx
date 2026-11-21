import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { DoubleSide, type Group } from 'three';
import type { SceneProps } from '../core/types';
import {
  BrassSamaiLamp,
  PalaceChandelier,
  PalaceColumn,
  StonePlinth,
  TempleBell,
} from '../shared/geometry';
import { DriftingParticles } from '../shared/particles';
import {
  createPalaceMarbleTexture,
  createPalaceWallTexture,
  createPetalTexture,
  createSoftGlowTexture,
} from '../shared/textures';
import { colors } from '../theme/tokens';

/**
 * Scene 8 — Families & Blessings — INDOOR SACRED PALACE DEVGHAR TEMPLE SANCTUM.
 * Warm inlaid sandalwood-marble floor, carved glowing jali temple walls, enclosed coffered
 * sanctum ceiling, gently swaying antique brass temple bells (ghanta), twin tall Maharashtrian
 * Samai oil lamps, and a devotional blessing shower of falling marigold petals.
 */
export function SceneFamilies({ progress, quality }: SceneProps) {
  const archRef = useRef<Group>(null);
  const marbleTex = useMemo(() => createPalaceMarbleTexture('#E2D1B8', '#B89B75', colors.gold, 5), []);
  const wallTex = useMemo(() => createPalaceWallTexture('#361D0D', '#FFC66B', 3), []);
  const marigoldTex = useMemo(() => createPetalTexture(colors.marigold, colors.gold), []);
  const glowTex = useMemo(() => createSoftGlowTexture(), []);

  useEffect(() => {
    return () => {
      marbleTex.dispose();
      wallTex.dispose();
      marigoldTex.dispose();
      glowTex.dispose();
    };
  }, [marbleTex, wallTex, marigoldTex, glowTex]);

  useFrame(({ clock }) => {
    if (archRef.current) {
      archRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.35 + progress.current) * 0.04;
    }
  });

  return (
    <group>
      {/* Warm devotional diya & chandelier light inside the Devghar Sanctum */}
      <pointLight position={[0, 5.2, 1.4]} intensity={14} distance={20} decay={1.6} color="#FFD896" />

      {/* Warm Inlaid Sandalwood-Marble Sanctum Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[18, 22]} />
        <meshStandardMaterial map={marbleTex} roughness={0.38} metalness={0.18} />
      </mesh>

      {/* Carved Glowing Palace Temple Back & Left Walls (open right +X corridor for camera path) */}
      <mesh position={[-2.6, 3.55, -5.5]}>
        <planeGeometry args={[10.8, 7.2]} />
        <meshStandardMaterial
          map={wallTex}
          emissiveMap={wallTex}
          emissive="#965620"
          emissiveIntensity={0.48}
          roughness={0.55}
          metalness={0.16}
          side={DoubleSide}
        />
      </mesh>
      <mesh position={[-7.5, 3.55, 0.5]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[13.5, 7.2]} />
        <meshStandardMaterial
          map={wallTex}
          emissiveMap={wallTex}
          emissive="#7C4418"
          emissiveIntensity={0.38}
          roughness={0.58}
          side={DoubleSide}
        />
      </mesh>

      {/* Enclosed Coffered Temple Ceiling & Gilded Beams */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[-1.2, 6.9, 0]}>
        <planeGeometry args={[15.5, 14]} />
        <meshStandardMaterial color="#261409" roughness={0.7} metalness={0.16} />
      </mesh>
      {[-3.0, 0.6, 4.0].map((z, idx) => (
        <mesh key={idx} position={[-1.2, 6.65, z]}>
          <boxGeometry args={[14.2, 0.28, 0.34]} />
          <meshStandardMaterial color={colors.gold} metalness={0.84} roughness={0.26} />
        </mesh>
      ))}

      {/* Four Sanctum Temple Columns */}
      <PalaceColumn position={[-5.2, 0, -4.0]} height={6.6} shaftColor="#EAD9BC" />
      <PalaceColumn position={[2.6, 0, -4.6]} height={6.6} shaftColor="#EAD9BC" />
      <PalaceColumn position={[-5.2, 0, 2.0]} height={6.6} shaftColor="#EAD9BC" />
      <PalaceColumn position={[6.5, 0, -1.2]} height={6.6} shaftColor="#EAD9BC" />

      {/* Central Sacred Chandelier & Swaying Hanging Brass Temple Bells (Ghanta) */}
      <PalaceChandelier position={[0, 5.55, 1.4]} scale={0.95} glowColor="#FFE09E" />
      <TempleBell position={[-3.3, 4.85, -1.6]} scale={1.05} />
      <TempleBell position={[3.3, 4.85, -1.6]} scale={1.05} />
      <TempleBell position={[-1.9, 5.05, -2.5]} scale={0.85} />
      <TempleBell position={[1.9, 5.05, -2.5]} scale={0.85} />

      <StonePlinth position={[0, 0, 0]} radius={3.2} height={0.36} />

      {/* Ornate Golden Devghar Sanctum Arch */}
      <group ref={archRef} position={[0, 0.36, -0.6]}>
        <mesh position={[-2.4, 2.2, 0]}>
          <cylinderGeometry args={[0.1, 0.14, 4.4, 12]} />
          <meshStandardMaterial color={colors.gold} metalness={0.84} roughness={0.24} />
        </mesh>
        <mesh position={[2.4, 2.2, 0]}>
          <cylinderGeometry args={[0.1, 0.14, 4.4, 12]} />
          <meshStandardMaterial color={colors.gold} metalness={0.84} roughness={0.24} />
        </mesh>
        <mesh position={[0, 4.4, 0]}>
          <torusGeometry args={[2.4, 0.11, 10, 32, Math.PI]} />
          <meshStandardMaterial color={colors.gold} metalness={0.86} roughness={0.22} />
        </mesh>
      </group>

      {/* Twin tall brass Maharashtrian Samai lamps */}
      <BrassSamaiLamp position={[-2.5, 0.36, 0.9]} scale={0.95} />
      <BrassSamaiLamp position={[2.5, 0.36, 0.9]} scale={0.95} />

      {/* Soft blessing shower of falling marigold petals */}
      <DriftingParticles
        baseCount={56}
        quality={quality}
        texture={marigoldTex}
        spreadX={11}
        spreadY={6.2}
        spreadZ={11}
        baseY={0.4}
        size={0.26}
        motion="fall"
        opacity={0.92}
      />

      {/* Warm devotional golden motes */}
      <DriftingParticles
        baseCount={28}
        quality={quality}
        texture={glowTex}
        spreadX={10}
        spreadY={5.5}
        spreadZ={10}
        baseY={0.5}
        size={0.2}
        motion="rise"
        additive
        opacity={0.78}
        color={colors.gold}
      />
    </group>
  );
}

export default SceneFamilies;

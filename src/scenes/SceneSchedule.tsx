import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { AdditiveBlending, type Group } from 'three';
import { content } from '../content/content';
import type { SceneProps } from '../core/types';
import { PalaceColumn, StonePlinth } from '../shared/geometry';
import { DriftingParticles } from '../shared/particles';
import { createPalaceMarbleTexture, createSoftGlowTexture } from '../shared/textures';
import { colors } from '../theme/tokens';

const EVENT_COLORS = [
  colors.peacock,
  colors.marigold,
  colors.yamuna,
  colors.gold,
  colors.lotus,
];

/**
 * Scene 7 — Ceremonies Timeline (Festive Crimson Sangeet Palace Courtyard).
 * A royal palace courtyard with inlaid rose-gold marble floor, semi-circular festive colonnade
 * draped in warm fairy lights, and suspended stained-glass ceremony lanterns rotating gently.
 */
export function SceneSchedule({ progress, quality }: SceneProps) {
  const carouselRef = useRef<Group>(null);
  const floorTex = useMemo(() => createPalaceMarbleTexture('#D9C3C7', '#8F3C50', colors.gold, 5), []);
  const glowTex = useMemo(() => createSoftGlowTexture(), []);

  useEffect(() => {
    return () => {
      floorTex.dispose();
      glowTex.dispose();
    };
  }, [floorTex, glowTex]);

  const count = content.events.length;

  const colonnadeAngles = useMemo(
    () => [-2.25, -1.7, -1.15, -0.6, 0.6, 1.15, 1.7, 2.25].map((a) => a - Math.PI / 2),
    [],
  );

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (carouselRef.current) {
      carouselRef.current.rotation.y = progress.current * Math.PI * 1.4 + t * 0.08;
    }
  });

  return (
    <group>
      {/* Warm festive Sangeet courtyard glow */}
      <pointLight position={[0, 4.6, 1.5]} intensity={11} distance={20} decay={1.6} color="#FFCBA4" />

      {/* Checkered Rose-Crimson & Gold Palace Courtyard Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <circleGeometry args={[17, 36]} />
        <meshStandardMaterial map={floorTex} roughness={0.42} metalness={0.18} />
      </mesh>

      {/* Curved Royal Sangeet Colonnade Archway behind the Raas Carousel */}
      {colonnadeAngles.map((ang, idx) => {
        const r = 6.8;
        const cx = Math.cos(ang) * r;
        const cz = Math.sin(ang) * r;
        return (
          <group key={idx}>
            <PalaceColumn position={[cx, 0, cz]} height={5.6} radius={0.28} shaftColor="#EBD8D6" />
            {/* Warm glowing festive fairy-light bulb at column capital */}
            <mesh position={[cx, 5.1, cz]}>
              <sphereGeometry args={[0.14, 10, 10]} />
              <meshBasicMaterial color="#FFF3C8" fog={false} />
            </mesh>
          </group>
        );
      })}
      {/* Upper gilded colonnade arch ring */}
      <mesh position={[0, 5.45, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[6.8, 0.14, 10, 48, Math.PI * 1.15]} />
        <meshStandardMaterial color={colors.gold} metalness={0.84} roughness={0.24} />
      </mesh>

      {/* Circular Raas marble floor plinth */}
      <StonePlinth position={[0, 0, 0]} radius={4.4} height={0.34} />

      {/* Central flute & lotus brass finial column */}
      <mesh position={[0, 2.2, 0]}>
        <cylinderGeometry args={[0.14, 0.24, 3.8, 14]} />
        <meshStandardMaterial color={colors.gold} metalness={0.86} roughness={0.22} />
      </mesh>
      <mesh position={[0, 4.15, 0]}>
        <torusGeometry args={[3.4, 0.07, 10, 48]} />
        <meshStandardMaterial color={colors.gold} metalness={0.86} roughness={0.22} />
      </mesh>

      {/* Rotating Raas Lantern Carousel */}
      <group ref={carouselRef}>
        {content.events.map((ev, idx) => {
          const angle = (idx * Math.PI * 2) / count;
          const radius = 3.4;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;
          const lanternColor = EVENT_COLORS[idx % EVENT_COLORS.length];

          return (
            <group key={ev.id} position={[x, 2.45, z]}>
              {/* Suspension chain */}
              <mesh position={[0, 0.9, 0]}>
                <cylinderGeometry args={[0.02, 0.02, 1.5, 6]} />
                <meshStandardMaterial color={colors.gold} metalness={0.9} roughness={0.2} />
              </mesh>
              {/* Brass lantern cap */}
              <mesh position={[0, 0.38, 0]}>
                <coneGeometry args={[0.38, 0.32, 8]} />
                <meshStandardMaterial color={colors.gold} metalness={0.85} roughness={0.22} />
              </mesh>
              {/* Glowing stained-glass lantern body */}
              <mesh position={[0, 0, 0]}>
                <cylinderGeometry args={[0.28, 0.24, 0.56, 8]} />
                <meshStandardMaterial
                  color={lanternColor}
                  emissive={lanternColor}
                  emissiveIntensity={1.1}
                  roughness={0.25}
                />
              </mesh>
              {/* Brass base */}
              <mesh position={[0, -0.34, 0]}>
                <cylinderGeometry args={[0.26, 0.12, 0.16, 8]} />
                <meshStandardMaterial color={colors.gold} metalness={0.85} roughness={0.22} />
              </mesh>
              {/* Soft lantern aura */}
              <sprite scale={[2.2, 2.2, 1]}>
                <spriteMaterial
                  map={glowTex}
                  color={lanternColor}
                  transparent
                  opacity={0.45}
                  depthWrite={false}
                  blending={AdditiveBlending}
                />
              </sprite>
            </group>
          );
        })}
      </group>

      {/* Rising golden sparks */}
      <DriftingParticles
        baseCount={36}
        quality={quality}
        texture={glowTex}
        spreadX={11}
        spreadY={5.5}
        spreadZ={11}
        baseY={0.6}
        size={0.2}
        motion="rise"
        additive
        opacity={0.82}
        color={colors.gold}
      />
    </group>
  );
}

export default SceneSchedule;

import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { DoubleSide, PlaneGeometry, type Group } from 'three';
import type { SceneProps } from '../core/types';
import {
  BrassSamaiLamp,
  COUPLE_PHOTO_EVENING,
  COUPLE_PHOTO_TRADITIONAL,
  LotusFlower,
  PalaceChandelier,
  PalaceColumn,
  RoyalPortraitFrame,
  StonePlinth,
  VelvetDrapery,
} from '../shared/geometry';
import { DriftingParticles } from '../shared/particles';
import { createPaithaniRibbonMaterial, createYamunaWaterMaterial } from '../shared/shaders';
import {
  createPalaceMarbleTexture,
  createPalaceWallTexture,
  createPetalTexture,
  createSoftGlowTexture,
} from '../shared/textures';
import { colors } from '../theme/tokens';

/** Exact upright portrait crop for the Groom (right side of DSC_7553, 2:3 aspect). */
const GROOM_CROP = { x: 0.43, y: 0.15, w: 0.48, h: 0.48 } as const;

/** Exact upright portrait crop for the Bride (left side of DSC_7263 in pink silk saree, 2:3 aspect). */
const BRIDE_CROP = { x: 0.055, y: 0.255, w: 0.42, h: 0.42 } as const;

/**
 * Scene 3 — The Groom & Bride Palace Gallery (Krushna & Devika) — INDOOR ROYAL PALACE
 * (Rose-Gold Sheesh-Mahal Chamber).
 * Inlaid rose-cream marble palace floor, carved jali arched alcoves, fluted marble columns,
 * crimson-rose velvet drapes, glowing overhead brass & crystal chandeliers, recessed indoor
 * lotus basin, unfurling Paithani silk ribbon, and BOTH real Groom & Bride portraits side-by-side.
 */
export function SceneBride({ progress, quality }: SceneProps) {
  const figureGroupRef = useRef<Group>(null);

  const marbleTex = useMemo(() => createPalaceMarbleTexture('#E3CFCB', '#B89598', colors.gold, 5), []);
  const wallTex = useMemo(() => createPalaceWallTexture('#461A2C', '#FFD0A6', 3), []);
  const pondMat = useMemo(() => createYamunaWaterMaterial(), []);
  const paithaniMat = useMemo(() => createPaithaniRibbonMaterial(), []);
  const petalTex = useMemo(() => createPetalTexture(colors.lotus, colors.cream), []);
  const glowTex = useMemo(() => createSoftGlowTexture(), []);

  // Graceful curved Paithani silk ribbon framing the twin royal portraits
  const ribbonGeo = useMemo(() => {
    const geo = new PlaneGeometry(11.5, 1.15, 48, 4);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const t = (x + 5.75) / 11.5;
      const angle = (t - 0.5) * Math.PI * 1.05;
      const radius = 4.15;
      pos.setX(i, Math.sin(angle) * radius);
      pos.setZ(i, -Math.cos(angle) * radius + 1.35);
      pos.setY(i, pos.getY(i) + 2.45 + Math.sin(t * Math.PI * 2) * 0.45);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  useEffect(() => {
    return () => {
      marbleTex.dispose();
      wallTex.dispose();
      pondMat.dispose();
      paithaniMat.dispose();
      petalTex.dispose();
      glowTex.dispose();
      ribbonGeo.dispose();
    };
  }, [marbleTex, wallTex, pondMat, paithaniMat, petalTex, glowTex, ribbonGeo]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const p = progress.current;

    pondMat.uniforms.uTime.value = t * 0.65;
    paithaniMat.uniforms.uTime.value = t;
    paithaniMat.uniforms.uProgress.value = Math.min(1, p * 1.3 + 0.14);

    if (figureGroupRef.current) {
      figureGroupRef.current.position.y = 0.48 + Math.sin(t * 0.85 + 1.2) * 0.03;
      figureGroupRef.current.rotation.y = (0.32 - p) * 0.14;
    }
  });

  return (
    <group>
      {/* Warm indoor Sheesh-Mahal chandelier accent light */}
      <pointLight position={[0, 5.2, 1.8]} intensity={15} distance={22} decay={1.6} color="#FFD8B8" />

      {/* Inlaid Rose-Cream Palace Marble Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[18, 22]} />
        <meshStandardMaterial map={marbleTex} roughness={0.34} metalness={0.18} />
      </mesh>

      {/* Carved Palace Back Wall behind the Couple (open arched corridor on left -X for camera path) */}
      <mesh position={[2.6, 3.55, -5.6]}>
        <planeGeometry args={[10.8, 7.2]} />
        <meshStandardMaterial
          map={wallTex}
          emissiveMap={wallTex}
          emissive="#8F4C32"
          emissiveIntensity={0.44}
          roughness={0.55}
          metalness={0.16}
          side={DoubleSide}
        />
      </mesh>

      {/* Right Palace Jali Wall enclosing the royal chamber */}
      <mesh position={[7.6, 3.55, 0.5]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[13.5, 7.2]} />
        <meshStandardMaterial
          map={wallTex}
          emissiveMap={wallTex}
          emissive="#7A3C2A"
          emissiveIntensity={0.38}
          roughness={0.58}
          side={DoubleSide}
        />
      </mesh>

      {/* Coffered Rose-Plum Palace Ceiling & Gilded Beams */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[1.2, 6.9, 0]}>
        <planeGeometry args={[15.5, 14]} />
        <meshStandardMaterial color="#2C111E" roughness={0.68} metalness={0.16} />
      </mesh>
      {[-3.2, 0.4, 3.8].map((z, idx) => (
        <mesh key={idx} position={[1.2, 6.65, z]}>
          <boxGeometry args={[14.2, 0.28, 0.34]} />
          <meshStandardMaterial color={colors.gold} metalness={0.82} roughness={0.28} />
        </mesh>
      ))}

      {/* Four Towering Fluted Marble Palace Columns & Royal Velvet Drapes */}
      <PalaceColumn position={[-2.9, 0, -4.8]} height={6.6} shaftColor="#ECD9D3" />
      <PalaceColumn position={[5.6, 0, -4.4]} height={6.6} shaftColor="#ECD9D3" />
      <PalaceColumn position={[5.6, 0, 1.8]} height={6.6} shaftColor="#ECD9D3" />
      <PalaceColumn position={[-6.4, 0, -1.8]} height={6.6} shaftColor="#ECD9D3" />

      <VelvetDrapery position={[-2.3, 0, -4.9]} height={6.2} color="#7A1836" />
      <VelvetDrapery position={[4.8, 0, -4.5]} height={6.2} color="#7A1836" />

      {/* Hanging Ornate Palace Chandeliers */}
      <PalaceChandelier position={[-2.6, 5.25, -1.0]} scale={0.9} glowColor="#FFD2B8" />
      <PalaceChandelier position={[3.3, 5.25, -1.0]} scale={0.9} glowColor="#FFD2B8" />

      {/* Recessed Indoor Marble Lotus Reflection Basin around the Royal Dais */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]} material={pondMat}>
        <circleGeometry args={[5.05, 48]} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.08, 0]}>
        <ringGeometry args={[4.95, 5.32, 48]} />
        <meshStandardMaterial color={colors.gold} metalness={0.84} roughness={0.26} />
      </mesh>

      {/* Sculpted 3D Lotus Blooms floating inside the indoor marble lotus basin */}
      <LotusFlower position={[-3.75, 0.08, 2.2]} scale={0.76} staticBloom={0.88} />
      <LotusFlower position={[3.65, 0.08, 2.1]} scale={0.74} staticBloom={0.82} />
      <LotusFlower position={[-3.3, 0.08, -2.5]} scale={0.8} staticBloom={0.85} />
      <LotusFlower position={[3.4, 0.08, -2.3]} scale={0.76} staticBloom={0.9} />

      {/* Widened Royal Dais Plinth & Twin Flanking Brass Samai Lamps */}
      <StonePlinth position={[0, 0, 0]} radius={3.25} height={0.44} />
      <BrassSamaiLamp position={[-3.15, 0.04, 1.55]} scale={0.8} />
      <BrassSamaiLamp position={[3.15, 0.04, 1.55]} scale={0.8} />

      {/* Unfurling Paithani peacock-zari silk ribbon */}
      <mesh geometry={ribbonGeo} material={paithaniMat} />

      {/* Twin Real Portraits — Groom (Krushna, left) & Bride (Devika, right) angled toward camera */}
      <group ref={figureGroupRef} position={[0, 0.48, 0]}>
        <group rotation={[0, -0.34, 0]}>
          {/* Left Portrait: Groom (Krushna) */}
          <group position={[-1.46, 1.88, 0.08]} rotation={[0, 0.12, 0]}>
            <RoyalPortraitFrame
              src={COUPLE_PHOTO_EVENING}
              crop={GROOM_CROP}
              width={2.2}
              height={3.3}
              archMode="arch"
              haloColor={colors.gold}
            />
          </group>

          {/* Center gilded ceremonial crest uniting the twin frames */}
          <group position={[0, 0.32, 0.25]}>
            <mesh>
              <cylinderGeometry args={[0.24, 0.34, 0.16, 16]} />
              <meshStandardMaterial color={colors.gold} metalness={0.88} roughness={0.22} />
            </mesh>
            <mesh position={[0, 0.24, 0]}>
              <sphereGeometry args={[0.16, 14, 14]} />
              <meshStandardMaterial
                color={colors.gold}
                emissive={colors.marigold}
                emissiveIntensity={0.5}
                metalness={0.9}
                roughness={0.18}
              />
            </mesh>
          </group>

          {/* Right Portrait: Bride (Devika) */}
          <group position={[1.46, 1.88, 0.08]} rotation={[0, -0.12, 0]}>
            <RoyalPortraitFrame
              src={COUPLE_PHOTO_TRADITIONAL}
              crop={BRIDE_CROP}
              width={2.2}
              height={3.3}
              archMode="arch"
              haloColor={colors.lotus}
            />
          </group>
        </group>
      </group>

      {/* Drifting rose-lotus petals inside the Sheesh-Mahal */}
      <DriftingParticles
        baseCount={40}
        quality={quality}
        texture={petalTex}
        spreadX={11}
        spreadY={5.8}
        spreadZ={11}
        baseY={0.7}
        size={0.26}
        motion="fall"
        opacity={0.9}
      />

      {/* Warm golden candlelight motes */}
      <DriftingParticles
        baseCount={30}
        quality={quality}
        texture={glowTex}
        spreadX={10}
        spreadY={5.2}
        spreadZ={10}
        baseY={0.5}
        size={0.2}
        motion="rise"
        additive
        opacity={0.8}
        color={colors.lotus}
      />
    </group>
  );
}

export default SceneBride;

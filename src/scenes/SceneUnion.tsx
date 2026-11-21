import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { CatmullRomCurve3, DoubleSide, TubeGeometry, Vector3, type Group, type Mesh } from 'three';
import type { SceneProps } from '../core/types';
import {
  BrassSamaiLamp,
  COUPLE_PHOTO_EVENING,
  PalaceChandelier,
  PalaceColumn,
  RoyalPortraitFrame,
  StonePlinth,
  VelvetDrapery,
} from '../shared/geometry';
import { DriftingParticles } from '../shared/particles';
import { createAntarpatMaterial, createLightRibbonMaterial } from '../shared/shaders';
import {
  createPalaceMarbleTexture,
  createPalaceWallTexture,
  createPetalTexture,
  createRoyalCarpetTexture,
  createSoftGlowTexture,
} from '../shared/textures';
import { colors } from '../theme/tokens';

/** Full couple evening portrait crop (DSC_7553 upright, 0.84 aspect -> 3.15 x 3.75 Darbar frame). */
const COUPLE_CROP = { x: 0.09, y: 0.14, w: 0.82, h: 0.65 } as const;

/**
 * Scene 4 — Union & Handover to Scroll — INDOOR GRAND RAJWADA DARBAR HALL.
 * Inlaid warm ivory-gold marble floor, crimson royal zari aisle carpet, towering gilded palace
 * colonnade, glowing jali arched sanctuary walls, overhead palace chandeliers, flower-decked
 * golden jhula swing, and a parting Maharashtrian Antarpat cloth revealing the real Couple photo.
 */
export function SceneUnion({ progress, quality }: SceneProps) {
  const swingRef = useRef<Group>(null);
  const leftClothRef = useRef<Mesh>(null);
  const rightClothRef = useRef<Mesh>(null);

  const marbleTex = useMemo(() => createPalaceMarbleTexture('#E7D9C2', '#BDA88D', colors.gold, 5), []);
  const carpetTex = useMemo(() => createRoyalCarpetTexture(), []);
  const wallTex = useMemo(() => createPalaceWallTexture('#3D2212', '#FFCA74', 3), []);
  const petalTex = useMemo(() => createPetalTexture(colors.marigold, colors.gold), []);
  const glowTex = useMemo(() => createSoftGlowTexture(), []);

  const leftAntarpatMat = useMemo(() => createAntarpatMaterial(-1), []);
  const rightAntarpatMat = useMemo(() => createAntarpatMaterial(1), []);

  // Twin spiralling convergence ribbons inside the Darbar Hall
  const { fluteTube, petalTube } = useMemo(() => {
    const ptsA: Vector3[] = [];
    const ptsB: Vector3[] = [];
    for (let i = 0; i <= 28; i++) {
      const u = i / 28;
      const angle = u * Math.PI * 2.4;
      const radius = (1 - u) * 4.1 + 0.55;
      const y = 0.7 + u * 3.8;
      ptsA.push(new Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius + 1.3 - u * 1.4));
      ptsB.push(
        new Vector3(Math.cos(angle + Math.PI) * radius, y, Math.sin(angle + Math.PI) * radius + 1.3 - u * 1.4),
      );
    }
    return {
      fluteTube: new TubeGeometry(new CatmullRomCurve3(ptsA), 60, 0.06, 8, false),
      petalTube: new TubeGeometry(new CatmullRomCurve3(ptsB), 60, 0.06, 8, false),
    };
  }, []);

  const fluteMat = useMemo(() => createLightRibbonMaterial(colors.gold, colors.yamuna), []);
  const petalRibbonMat = useMemo(() => createLightRibbonMaterial(colors.lotus, colors.marigold), []);

  useEffect(() => {
    return () => {
      marbleTex.dispose();
      carpetTex.dispose();
      wallTex.dispose();
      petalTex.dispose();
      glowTex.dispose();
      leftAntarpatMat.dispose();
      rightAntarpatMat.dispose();
      fluteTube.dispose();
      petalTube.dispose();
      fluteMat.dispose();
      petalRibbonMat.dispose();
    };
  }, [
    marbleTex,
    carpetTex,
    wallTex,
    petalTex,
    glowTex,
    leftAntarpatMat,
    rightAntarpatMat,
    fluteTube,
    petalTube,
    fluteMat,
    petalRibbonMat,
  ]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const p = progress.current;

    fluteMat.uniforms.uTime.value = t;
    fluteMat.uniforms.uProgress.value = Math.min(1, p * 1.6 + 0.15);
    petalRibbonMat.uniforms.uTime.value = t;
    petalRibbonMat.uniforms.uProgress.value = Math.min(1, p * 1.6 + 0.15);

    // Antarpat parts gracefully as camera approaches peak focus (0.06 -> 0.28)
    const part = Math.max(0, Math.min(1, (p - 0.06) / 0.22));
    leftAntarpatMat.uniforms.uTime.value = t;
    leftAntarpatMat.uniforms.uPart.value = part;
    rightAntarpatMat.uniforms.uTime.value = t;
    rightAntarpatMat.uniforms.uPart.value = part;

    if (leftClothRef.current) {
      leftClothRef.current.position.x = -1.12 - part * 2.05;
    }
    if (rightClothRef.current) {
      rightClothRef.current.position.x = 1.12 + part * 2.05;
    }

    if (swingRef.current) {
      swingRef.current.rotation.x = Math.sin(t * 1.05) * 0.05;
    }
  });

  return (
    <group>
      {/* Warm golden Darbar Hall chandelier light */}
      <pointLight position={[0, 5.8, 1.8]} intensity={16} distance={22} decay={1.5} color="#FFE0A6" />

      {/* Inlaid Warm Marble Darbar Palace Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[19, 24]} />
        <meshStandardMaterial map={marbleTex} roughness={0.34} metalness={0.2} />
      </mesh>

      {/* Crimson Royal Velvet & Gold Zari Darbar Aisle Carpet */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 2.2]}>
        <planeGeometry args={[4.4, 15]} />
        <meshStandardMaterial map={carpetTex} roughness={0.78} metalness={0.14} />
      </mesh>

      {/* Grand Arched Carved Palace Back Wall behind the Darbar (open right +X corridor for camera) */}
      <mesh position={[-2.8, 3.7, -5.8]}>
        <planeGeometry args={[11.2, 7.5]} />
        <meshStandardMaterial
          map={wallTex}
          emissiveMap={wallTex}
          emissive="#8F5524"
          emissiveIntensity={0.45}
          roughness={0.54}
          metalness={0.18}
          side={DoubleSide}
        />
      </mesh>
      <mesh position={[-8.2, 3.7, 0.8]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[14.5, 7.5]} />
        <meshStandardMaterial
          map={wallTex}
          emissiveMap={wallTex}
          emissive="#7A441D"
          emissiveIntensity={0.38}
          roughness={0.58}
          side={DoubleSide}
        />
      </mesh>

      {/* Coffered Palace Darbar Ceiling & Gilded Transverse Beams */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[-1.2, 7.2, 0.5]}>
        <planeGeometry args={[16.5, 15]} />
        <meshStandardMaterial color="#2D150A" roughness={0.68} metalness={0.18} />
      </mesh>
      {[-3.8, -0.4, 3.0, 6.2].map((z, idx) => (
        <mesh key={idx} position={[-1.2, 6.95, z]}>
          <boxGeometry args={[15.5, 0.3, 0.36]} />
          <meshStandardMaterial color={colors.gold} metalness={0.84} roughness={0.26} />
        </mesh>
      ))}

      {/* Towering Royal Darbar Colonnade + Crimson Velvet Drapery */}
      <PalaceColumn position={[-5.8, 0, -4.4]} height={6.9} shaftColor="#EFE0C6" />
      <PalaceColumn position={[2.8, 0, -4.8]} height={6.9} shaftColor="#EFE0C6" />
      <PalaceColumn position={[-5.8, 0, 0.4]} height={6.9} shaftColor="#EFE0C6" />
      <PalaceColumn position={[-5.8, 0, 5.2]} height={6.9} shaftColor="#EFE0C6" />
      <PalaceColumn position={[6.8, 0, -1.6]} height={6.9} shaftColor="#EFE0C6" />
      <PalaceColumn position={[6.8, 0, 3.6]} height={6.9} shaftColor="#EFE0C6" />

      <VelvetDrapery position={[-4.8, 0, -4.6]} height={6.5} color="#741323" />
      <VelvetDrapery position={[2.2, 0, -4.9]} height={6.5} color="#741323" />

      {/* Three Grand Palace Jhoomar Chandeliers */}
      <PalaceChandelier position={[0, 5.85, 2.2]} scale={1.08} glowColor="#FFE29E" />
      <PalaceChandelier position={[-3.6, 5.5, -1.6]} scale={0.85} glowColor="#FFD48A" />
      <PalaceChandelier position={[2.6, 5.5, -1.6]} scale={0.85} glowColor="#FFD48A" />

      {/* Grounded Royal Dais Plinth & Twin Brass Samai Lamps */}
      <StonePlinth position={[0, 0, 0]} radius={2.9} height={0.44} />
      <BrassSamaiLamp position={[-2.7, 0.04, 1.35]} scale={0.82} />
      <BrassSamaiLamp position={[2.7, 0.04, 1.35]} scale={0.82} />

      {/* Procedural Flower-Decked Royal Jhula (Swing) Arch + Portrait angled subtly toward camera */}
      <group rotation={[0, 0.26, 0]}>
        <group position={[0, 0.44, -0.55]}>
          <mesh position={[-2.45, 2.35, 0]}>
            <cylinderGeometry args={[0.09, 0.13, 4.7, 12]} />
            <meshStandardMaterial color={colors.gold} metalness={0.84} roughness={0.24} />
          </mesh>
          <mesh position={[2.45, 2.35, 0]}>
            <cylinderGeometry args={[0.09, 0.13, 4.7, 12]} />
            <meshStandardMaterial color={colors.gold} metalness={0.84} roughness={0.24} />
          </mesh>
          <mesh position={[0, 4.68, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.1, 0.1, 5.3, 12]} />
            <meshStandardMaterial color={colors.gold} metalness={0.86} roughness={0.22} />
          </mesh>
          {Array.from({ length: 11 }, (_, idx) => {
            const x = -2.2 + idx * 0.44;
            const sag = Math.sin((idx / 10) * Math.PI) * 0.35;
            return (
              <mesh key={idx} position={[x, 4.55 - sag, 0.12]}>
                <sphereGeometry args={[0.13, 10, 10]} />
                <meshStandardMaterial
                  color={idx % 2 === 0 ? colors.marigold : colors.lotus}
                  emissive={idx % 2 === 0 ? colors.marigold : colors.lotus}
                  emissiveIntensity={0.38}
                  roughness={0.48}
                />
              </mesh>
            );
          })}

          <group ref={swingRef} position={[0, 4.65, 0]}>
            <mesh position={[-1.85, -1.9, 0]}>
              <cylinderGeometry args={[0.025, 0.025, 3.8, 8]} />
              <meshStandardMaterial color={colors.gold} metalness={0.9} roughness={0.2} />
            </mesh>
            <mesh position={[1.85, -1.9, 0]}>
              <cylinderGeometry args={[0.025, 0.025, 3.8, 8]} />
              <meshStandardMaterial color={colors.gold} metalness={0.9} roughness={0.2} />
            </mesh>
            <mesh position={[0, -3.75, 0]}>
              <boxGeometry args={[3.9, 0.18, 0.9]} />
              <meshStandardMaterial color="#5A1525" roughness={0.62} metalness={0.18} />
            </mesh>
          </group>
        </group>

        {/* Real Full Couple Evening Portrait in Royal Darbar Frame with 2.5D Parallax */}
        <RoyalPortraitFrame
          src={COUPLE_PHOTO_EVENING}
          crop={COUPLE_CROP}
          width={3.15}
          height={3.75}
          archMode="royalRect"
          haloColor={colors.gold}
          position={[0, 2.52, 0.25]}
          outWidth={840}
          outHeight={1000}
        />

        {/* Twin-plane Maharashtrian Antarpat silk cloth parting smoothly with progress */}
        <mesh ref={leftClothRef} position={[-1.12, 2.52, 0.9]} material={leftAntarpatMat}>
          <planeGeometry args={[2.3, 3.85, 16, 16]} />
        </mesh>
        <mesh ref={rightClothRef} position={[1.12, 2.52, 0.9]} material={rightAntarpatMat}>
          <planeGeometry args={[2.3, 3.85, 16, 16]} />
        </mesh>
      </group>

      {/* Spiralling flute & petal light trails */}
      <mesh geometry={fluteTube} material={fluteMat} />
      <mesh geometry={petalTube} material={petalRibbonMat} />

      {/* Festive falling marigold petals & Darbar golden embers */}
      <DriftingParticles
        baseCount={40}
        quality={quality}
        texture={petalTex}
        spreadX={12}
        spreadY={6.2}
        spreadZ={12}
        baseY={0.8}
        size={0.24}
        motion="fall"
        opacity={0.9}
      />
      <DriftingParticles
        baseCount={36}
        quality={quality}
        texture={glowTex}
        spreadX={11}
        spreadY={5.5}
        spreadZ={11}
        baseY={0.7}
        size={0.22}
        motion="rise"
        additive
        opacity={0.88}
        color={colors.gold}
      />
    </group>
  );
}

export default SceneUnion;

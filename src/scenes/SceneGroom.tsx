import { useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { CatmullRomCurve3, TubeGeometry, Vector3 } from 'three';
import { audioManager } from '../core/audio';
import type { SceneProps } from '../core/types';
import { BrassSamaiLamp, KadambaTree, StonePlinth } from '../shared/geometry';
import { DriftingParticles } from '../shared/particles';
import { RadhaKrishnaModel } from '../shared/radhaKrishna';
import { createLightRibbonMaterial } from '../shared/shaders';
import { createPeacockFeatherTexture, createSoftGlowTexture } from '../shared/textures';
import { colors } from '../theme/tokens';

/**
 * Scene 2 — Sacred Vrindavan Kadamba Grove (Radha-Krishna).
 * Emerald-teal twilight Vrindavan grove with the SINGLE grand Kadamba tree arching directly
 * over a sculpted 3D Radha-Krishna murti seated on a lotus Singhasan dais, accompanied by
 * travelling musical bansuri light ribbon, drifting peacock feathers, and fireflies.
 */
export function SceneGroom({ progress, quality }: SceneProps) {
  const featherTex = useMemo(() => createPeacockFeatherTexture(), []);
  const glowTex = useMemo(() => createSoftGlowTexture(), []);

  const ribbonGeo = useMemo(() => {
    const curve = new CatmullRomCurve3([
      new Vector3(4.5, 0.9, 8.0),
      new Vector3(2.2, 2.3, 4.2),
      new Vector3(-1.4, 3.0, 1.2),
      new Vector3(0.4, 2.2, -1.6),
      new Vector3(-2.6, 3.4, -5.2),
      new Vector3(1.8, 2.6, -9.5),
    ]);
    return new TubeGeometry(curve, 64, 0.085, 8, false);
  }, []);

  const ribbonMat = useMemo(() => createLightRibbonMaterial(colors.gold, colors.yamuna), []);

  useEffect(() => {
    return () => {
      featherTex.dispose();
      glowTex.dispose();
      ribbonGeo.dispose();
      ribbonMat.dispose();
    };
  }, [featherTex, glowTex, ribbonGeo, ribbonMat]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const p = progress.current;

    ribbonMat.uniforms.uTime.value = t;
    ribbonMat.uniforms.uProgress.value = Math.min(1, p * 1.25 + 0.15);
  });

  const handleTapRadhaKrishna = () => {
    audioManager.playCue('flute');
  };

  return (
    <group>
      {/* Emerald-teal moonlit Vrindavan grove meadow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <circleGeometry args={[18, 36]} />
        <meshStandardMaterial color="#0A2827" roughness={0.9} metalness={0.06} />
      </mesh>

      {/* Subtle carved emerald garden border ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[3.7, 3.96, 48]} />
        <meshStandardMaterial color={colors.gold} roughness={0.4} metalness={0.75} />
      </mesh>

      {/* THE ONLY Kadamba tree in the entire experience — grand canopy sheltering Radha & Krishna */}
      <KadambaTree position={[0, 0, -2.7]} scale={1.38} rotationY={0.22} />

      {/* Grounded stone plinth & twin brass samai lamps */}
      <StonePlinth position={[0, 0, 0]} radius={2.6} height={0.42} />
      <BrassSamaiLamp position={[-2.65, 0, 1.45]} scale={0.8} />
      <BrassSamaiLamp position={[2.65, 0, 1.45]} scale={0.8} />

      {/* Sculpted 3D Radha-Krishna Murti seated beneath the Kadamba tree (click to play Bansuri) */}
      <RadhaKrishnaModel
        position={[0, 0.42, 0.1]}
        rotationY={0.34}
        scale={1.04}
        onClick={handleTapRadhaKrishna}
      />

      {/* Musical flute light ribbon */}
      <mesh geometry={ribbonGeo} material={ribbonMat} />

      {/* Drifting peacock feathers (morpis) */}
      <DriftingParticles
        baseCount={28}
        quality={quality}
        texture={featherTex}
        spreadX={13}
        spreadY={6.5}
        spreadZ={15}
        baseY={0.9}
        size={0.48}
        motion="float"
        opacity={0.92}
      />

      {/* Warm grove fireflies */}
      <DriftingParticles
        baseCount={36}
        quality={quality}
        texture={glowTex}
        spreadX={12}
        spreadY={5.5}
        spreadZ={14}
        baseY={0.6}
        size={0.2}
        motion="rise"
        additive
        opacity={0.85}
        color={colors.gold}
      />
    </group>
  );
}

export default SceneGroom;

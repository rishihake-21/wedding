import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { DoubleSide, type Mesh } from 'three';
import { audioManager } from '../core/audio';
import { useAppStore } from '../core/store';
import type { SceneProps } from '../core/types';
import { BrassSamaiLamp, FloatingDiyas } from '../shared/geometry';
import { DriftingParticles } from '../shared/particles';
import { createYamunaWaterMaterial } from '../shared/shaders';
import { createSoftGlowTexture } from '../shared/textures';
import { colors } from '../theme/tokens';

/**
 * Scene 1 — Invocation (Yamuna at night).
 * High-detail multi-octave rippled Yamuna water shader reflecting the single global moon,
 * carved river ghat steps with brass samai lamps, instanced floating diyas, fireflies,
 * and serene low river mist.
 */
export function SceneInvocation({ progress, quality }: SceneProps) {
  const mistRef = useRef<Mesh>(null);

  const waterMat = useMemo(() => createYamunaWaterMaterial(), []);
  const glowTex = useMemo(() => createSoftGlowTexture(), []);

  useEffect(() => {
    return () => {
      waterMat.dispose();
      glowTex.dispose();
    };
  }, [waterMat, glowTex]);

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();
    waterMat.uniforms.uTime.value = elapsed;
    if (mistRef.current) {
      mistRef.current.position.x = Math.sin(elapsed * 0.22) * 1.4;
      mistRef.current.position.y = 0.65 + progress.current * 0.15;
    }
  });

  const handleTapDiya = () => {
    audioManager.playCue('diya');
    useAppStore.getState().lightBlessingDiya();
  };

  return (
    <group>
      {/* High-subdivision Yamuna river water plane with multi-octave specular moon trail */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-2, 0, -2]} material={waterMat}>
        <planeGeometry args={[54, 56, 72, 72]} />
      </mesh>

      {/* Subtle carved ghat stone steps & brass samai lamps on the right bank */}
      <group position={[2.8, 0, -1]}>
        <mesh position={[0, 0.12, 0]}>
          <boxGeometry args={[4.4, 0.24, 11]} />
          <meshStandardMaterial color="#182748" roughness={0.8} metalness={0.14} />
        </mesh>
        <mesh position={[0.7, 0.38, 0]}>
          <boxGeometry args={[3.0, 0.28, 10.5]} />
          <meshStandardMaterial color="#1E3056" roughness={0.76} metalness={0.16} />
        </mesh>
        {/* Gold brass rim along the water step */}
        <mesh position={[-2.18, 0.24, 0]}>
          <boxGeometry args={[0.06, 0.04, 11]} />
          <meshStandardMaterial color={colors.gold} roughness={0.35} metalness={0.8} />
        </mesh>
        <BrassSamaiLamp position={[-0.4, 0.24, 2.4]} scale={0.72} />
        <BrassSamaiLamp position={[-0.4, 0.24, -2.6]} scale={0.72} />
      </group>

      {/* Instanced floating diyas drifting along the Yamuna */}
      <FloatingDiyas
        baseCount={42}
        quality={quality}
        spreadX={16}
        spreadZ={26}
        waterY={0.05}
        onTapDiya={handleTapDiya}
      />

      {/* Rising golden fireflies */}
      <DriftingParticles
        baseCount={55}
        quality={quality}
        texture={glowTex}
        spreadX={15}
        spreadY={5.5}
        spreadZ={22}
        baseY={0.5}
        size={0.22}
        motion="rise"
        additive
        opacity={0.88}
        color={colors.gold}
      />

      {/* Low mist veil skimming above the Yamuna */}
      <mesh ref={mistRef} position={[-2, 0.65, -4]} rotation={[-Math.PI / 2.2, 0, 0]}>
        <planeGeometry args={[28, 18]} />
        <meshBasicMaterial
          map={glowTex}
          color={colors.yamuna}
          transparent
          opacity={0.12}
          depthWrite={false}
          side={DoubleSide}
        />
      </mesh>
    </group>
  );
}

export default SceneInvocation;

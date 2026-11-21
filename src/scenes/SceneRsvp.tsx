import { useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { audioManager } from '../core/audio';
import { useAppStore } from '../core/store';
import type { SceneProps } from '../core/types';
import { BrassSamaiLamp, FloatingDiyas, LotusFlower } from '../shared/geometry';
import { DriftingParticles } from '../shared/particles';
import { createYamunaWaterMaterial } from '../shared/shaders';
import { createSoftGlowTexture } from '../shared/textures';
import { colors } from '../theme/tokens';

/**
 * Scene 9 — RSVP, Blessings & Farewell Yamuna Ghat.
 * Returns full circle to the moonlit Yamuna river with floating blessing diyas
 * that guests can tap to light, plus glowing lotuses and gentle fireflies behind the RSVP overlay.
 */
export function SceneRsvp({ progress, quality }: SceneProps) {
  const diyaLitCount = useAppStore((s) => s.diyaLitCount);
  const waterMat = useMemo(() => createYamunaWaterMaterial(), []);
  const glowTex = useMemo(() => createSoftGlowTexture(), []);

  useEffect(() => {
    return () => {
      waterMat.dispose();
      glowTex.dispose();
    };
  }, [waterMat, glowTex]);

  useFrame(({ clock }) => {
    waterMat.uniforms.uTime.value = clock.getElapsedTime() + progress.current * 0.5;
  });

  const handleLightDiya = () => {
    audioManager.playCue('diya');
    useAppStore.getState().lightBlessingDiya();
  };

  return (
    <group>
      {/* Moonlit Yamuna waters returning full circle */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} material={waterMat}>
        <planeGeometry args={[48, 48, 64, 64]} />
      </mesh>

      {/* Framing ghat brass lamps & blooming lotuses */}
      <BrassSamaiLamp position={[-3.2, 0.05, 1.5]} scale={0.85} />
      <BrassSamaiLamp position={[3.2, 0.05, 1.5]} scale={0.85} />
      <LotusFlower position={[-2.2, 0.05, -2.4]} scale={0.95} staticBloom={0.92} />
      <LotusFlower position={[2.4, 0.05, -2.6]} scale={0.88} staticBloom={0.88} />

      {/* Interactive floating wish-diyas (grows slightly as guests light blessings) */}
      <FloatingDiyas
        baseCount={Math.min(64, 34 + diyaLitCount * 2)}
        quality={quality}
        spreadX={15}
        spreadZ={18}
        waterY={0.05}
        onTapDiya={handleLightDiya}
      />

      {/* Starlight fireflies */}
      <DriftingParticles
        baseCount={44}
        quality={quality}
        texture={glowTex}
        spreadX={14}
        spreadY={6}
        spreadZ={16}
        baseY={0.6}
        size={0.22}
        motion="rise"
        additive
        opacity={0.85}
        color={colors.gold}
      />
    </group>
  );
}

export default SceneRsvp;

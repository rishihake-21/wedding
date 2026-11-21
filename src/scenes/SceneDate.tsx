import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { AdditiveBlending, type Group } from 'three';
import { audioManager } from '../core/audio';
import type { SceneProps } from '../core/types';
import { LotusFlower } from '../shared/geometry';
import { DriftingParticles } from '../shared/particles';
import { createWaterRippleRingMaterial, createYamunaWaterMaterial } from '../shared/shaders';
import { createSoftGlowTexture } from '../shared/textures';
import { colors } from '../theme/tokens';

/**
 * Scene 5 — Date & Muhurat Reveal.
 * Elevates the sculpted multi-ring hero Lotus cleanly above the Date overlay card
 * on a shimmering moonlit mirror pond with expanding golden water ripples.
 * Plays a dramatic cascading bud-to-full-bloom entrance animation (and re-blooms on tap),
 * while the single global Full Moon shines serenely in the night sky above.
 */
export function SceneDate({ progress, quality }: SceneProps) {
  const bloomRef = useRef({ current: 0.05 });
  const enterClockRef = useRef(0);
  const lotusGroupRef = useRef<Group>(null);

  const waterMat = useMemo(() => createYamunaWaterMaterial(), []);
  const rippleMat = useMemo(() => createWaterRippleRingMaterial(colors.gold), []);
  const glowTex = useMemo(() => createSoftGlowTexture(), []);

  useEffect(() => {
    enterClockRef.current = 0;
    return () => {
      waterMat.dispose();
      rippleMat.dispose();
      glowTex.dispose();
    };
  }, [waterMat, rippleMat, glowTex]);

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime();
    const dt = Math.min(delta, 0.05);
    enterClockRef.current = Math.min(3.4, enterClockRef.current + dt);

    waterMat.uniforms.uTime.value = t * 0.72;
    rippleMat.uniforms.uTime.value = t;

    // Smooth dramatic ceremonial bloom from closed bud (0.04) -> radiant full blossom (1.0)
    // Driven by entrance choreography and enhanced subtly by scroll progress
    const enterNorm = Math.min(1, enterClockRef.current / 3.0);
    const smoothEnter = enterNorm * enterNorm * (3 - 2 * enterNorm);
    const p = progress.current;
    const targetBloom = Math.min(1, 0.04 + smoothEnter * 0.88 + Math.min(0.12, p * 0.25));
    bloomRef.current.current = targetBloom;

    if (lotusGroupRef.current) {
      // Graceful floating elevation & rotation tilted slightly toward camera so the golden stamen heart shines
      lotusGroupRef.current.position.y = 2.05 + Math.sin(t * 1.15) * 0.09 + smoothEnter * 0.28;
      lotusGroupRef.current.rotation.y = t * 0.22 + p * 0.8;
      lotusGroupRef.current.rotation.x = 0.28 + Math.sin(t * 0.7) * 0.03;
    }
  });

  const handleTapLotus = () => {
    // Re-trigger full cascading bud-to-bloom flourish with chime
    enterClockRef.current = 0;
    audioManager.playCue('diya');
  };

  return (
    <group>
      {/* Seamless shimmering moonlit mirror pond */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} material={waterMat}>
        <planeGeometry args={[46, 46, 56, 56]} />
      </mesh>

      {/* Expanding golden sacred water ripples radiating beneath the lotus */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0.2]} material={rippleMat}>
        <planeGeometry args={[10.5, 10.5]} />
      </mesh>

      {/* Elevated Hero Sculpted Lotus cleanly framed above the Date card */}
      <group ref={lotusGroupRef} position={[0, 2.25, 0.2]}>
        <LotusFlower scale={1.78} bloomRef={bloomRef.current} withPad={false} onClick={handleTapLotus} />
        {/* Warm sacred halo emanating from the blooming golden core */}
        <sprite position={[0, 0.8, 0]} scale={[4.4, 4.4, 1]}>
          <spriteMaterial
            map={glowTex}
            color={colors.gold}
            transparent
            opacity={0.42}
            depthWrite={false}
            blending={AdditiveBlending}
            fog={false}
          />
        </sprite>
      </group>

      {/* Companion floating lotuses resting softly on the pond surface */}
      <LotusFlower position={[-3.6, 0.06, -1.6]} scale={0.75} staticBloom={0.86} />
      <LotusFlower position={[3.8, 0.06, -1.9]} scale={0.72} staticBloom={0.82} />

      {/* Golden embers rising like lit diyas from the blooming heart */}
      <DriftingParticles
        baseCount={52}
        quality={quality}
        texture={glowTex}
        spreadX={9}
        spreadY={6.5}
        spreadZ={9}
        baseY={0.8}
        size={0.22}
        motion="rise"
        additive
        opacity={0.9}
        color={colors.gold}
      />
    </group>
  );
}

export default SceneDate;

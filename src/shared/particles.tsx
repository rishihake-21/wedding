import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  AdditiveBlending,
  DoubleSide,
  InstancedMesh,
  MeshBasicMaterial,
  NormalBlending,
  Object3D,
  PlaneGeometry,
  type Texture,
} from 'three';
import type { QualityTier } from '../core/types';
import { scaledCount } from './quality';

interface ParticleSeed {
  x: number;
  y: number;
  z: number;
  speedY: number;
  driftX: number;
  phase: number;
  scale: number;
  rotSpeed: number;
}

export interface DriftingParticlesProps {
  baseCount: number;
  quality: QualityTier;
  texture: Texture;
  spreadX?: number;
  spreadY?: number;
  spreadZ?: number;
  baseY?: number;
  size?: number;
  /** 'rise' for fireflies, 'fall' for petals, 'float' for peacock feathers. */
  motion?: 'rise' | 'fall' | 'float';
  additive?: boolean;
  opacity?: number;
  color?: string;
}

const _dummy = new Object3D();

/**
 * Reusable zero-GC instanced drifting particle field (fireflies, peacock feathers,
 * lotus petals, marigold petals) scaled cleanly by QualityTier.
 */
export function DriftingParticles({
  baseCount,
  quality,
  texture,
  spreadX = 14,
  spreadY = 7,
  spreadZ = 18,
  baseY = 1,
  size = 0.28,
  motion = 'float',
  additive = false,
  opacity = 0.9,
  color = '#ffffff',
}: DriftingParticlesProps) {
  const count = scaledCount(baseCount, quality);
  const meshRef = useRef<InstancedMesh>(null);

  const seeds = useMemo<ParticleSeed[]>(() => {
    const arr: ParticleSeed[] = [];
    // Deterministic pseudo-random distribution for repeatable framing
    let s = 1337 + baseCount * 17;
    const rand = () => {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
    for (let i = 0; i < count; i++) {
      arr.push({
        x: (rand() - 0.5) * spreadX,
        y: baseY + rand() * spreadY,
        z: (rand() - 0.5) * spreadZ,
        speedY: 0.25 + rand() * 0.45,
        driftX: 0.25 + rand() * 0.6,
        phase: rand() * Math.PI * 2,
        scale: size * (0.7 + rand() * 0.65),
        rotSpeed: (rand() - 0.5) * 1.1,
      });
    }
    return arr;
  }, [count, baseCount, spreadX, spreadY, spreadZ, baseY, size]);

  const geometry = useMemo(() => new PlaneGeometry(1, 1), []);
  const material = useMemo(
    () =>
      new MeshBasicMaterial({
        map: texture,
        color,
        transparent: true,
        opacity,
        depthWrite: false,
        side: DoubleSide,
        blending: additive ? AdditiveBlending : NormalBlending,
      }),
    [texture, color, opacity, additive],
  );

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const t = clock.getElapsedTime();

    for (let i = 0; i < count; i++) {
      const p = seeds[i];
      let y = p.y;
      if (motion === 'fall') {
        const span = spreadY;
        y = baseY + span - (((t * p.speedY + p.phase) % span) + span) % span;
      } else if (motion === 'rise') {
        const span = spreadY;
        y = baseY + ((((t * p.speedY * 0.4 + p.phase) % span) + span) % span);
      } else {
        y = p.y + Math.sin(t * p.speedY + p.phase) * 0.45;
      }

      const x = p.x + Math.sin(t * p.driftX + p.phase) * 0.65;
      const z = p.z + Math.cos(t * p.driftX * 0.7 + p.phase) * 0.45;

      _dummy.position.set(x, y, z);
      if (motion === 'rise') {
        _dummy.rotation.set(0, 0, 0);
        const pulse = 0.7 + 0.35 * Math.sin(t * 2.6 + p.phase);
        _dummy.scale.setScalar(p.scale * pulse);
      } else {
        _dummy.rotation.set(
          Math.sin(t * 0.7 + p.phase) * 0.5,
          t * p.rotSpeed + p.phase,
          Math.cos(t * 0.6 + p.phase) * 0.4,
        );
        _dummy.scale.set(p.scale, p.scale * (motion === 'float' ? 1.55 : 1.0), 1);
      }
      _dummy.updateMatrix();
      mesh.setMatrixAt(i, _dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, count]}
      frustumCulled={false}
    />
  );
}

import { AdditiveBlending, Color, DoubleSide, ShaderMaterial, type Texture } from 'three';
import { colors } from '../theme/tokens';

/** Night sky dome gradient: deep indigo zenith to luminous Yamuna horizon without duplicate moon hotspot. */
export function createNightSkyMaterial(): ShaderMaterial {
  return new ShaderMaterial({
    side: DoubleSide,
    depthWrite: false,
    fog: false,
    uniforms: {
      uZenith: { value: new Color('#040917') },
      uMid: { value: new Color(colors.midnight) },
      uHorizon: { value: new Color('#0F3344') },
      uMoonDir: { value: [-0.14, 0.29, -0.946] },
    },
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main() {
        vDir = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uZenith;
      uniform vec3 uMid;
      uniform vec3 uHorizon;
      uniform vec3 uMoonDir;
      varying vec3 vDir;

      void main() {
        float h = clamp(vDir.y * 0.5 + 0.5, 0.0, 1.0);
        vec3 col = mix(uHorizon, uMid, smoothstep(0.46, 0.64, h));
        col = mix(col, uZenith, smoothstep(0.64, 0.94, h));

        // Broad atmospheric moonlight scatter only (no sharp disc that could look like a second moon)
        float moonAlign = max(dot(normalize(vDir), normalize(uMoonDir)), 0.0);
        float scatter = pow(moonAlign, 6.0) * 0.16 + pow(moonAlign, 18.0) * 0.14;
        col += vec3(0.75, 0.84, 0.96) * scatter;

        // Subtle warm twilight horizon glow
        float horizonBand = exp(-pow((vDir.y - 0.02) * 8.5, 2.0)) * 0.12;
        col += vec3(0.14, 0.36, 0.44) * horizonBand;

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
}

/**
 * High-detail Yamuna river water shader:
 * Multi-octave directional swells, analytical micro-ripple normals, Schlick Fresnel sky/teal blend,
 * sparkling Blinn-Phong moon glitter path, warm diya reflections, and smooth horizon fade.
 */
export function createYamunaWaterMaterial(): ShaderMaterial {
  return new ShaderMaterial({
    transparent: true,
    depthWrite: true,
    fog: false,
    uniforms: {
      uTime: { value: 0 },
      uDeepColor: { value: new Color('#050D22') },
      uShallowColor: { value: new Color('#0D5A68') },
      uSkyColor: { value: new Color('#1B375E') },
      uMoonColor: { value: new Color(colors.cream) },
      uGoldColor: { value: new Color(colors.gold) },
      uMoonDir: { value: [-0.14, 0.29, -0.946] },
    },
    vertexShader: /* glsl */ `
      uniform float uTime;
      varying vec2 vUv;
      varying vec3 vWorldPos;
      varying float vElev;

      void main() {
        vUv = uv;
        vec3 pos = position;

        // Layered smooth physical swells
        float w1 = sin(pos.x * 0.42 + pos.y * 0.26 + uTime * 0.85) * 0.055;
        float w2 = cos(pos.x * 0.28 - pos.y * 0.52 + uTime * 0.68) * 0.045;
        float w3 = sin((pos.x * 0.9 - pos.y * 0.7) + uTime * 1.25) * 0.022;
        float w4 = cos((pos.x * 1.4 + pos.y * 1.1) - uTime * 1.55) * 0.012;
        float elev = w1 + w2 + w3 + w4;
        pos.z += elev;
        vElev = elev;

        vec4 worldPos = modelMatrix * vec4(pos, 1.0);
        vWorldPos = worldPos.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform vec3 uDeepColor;
      uniform vec3 uShallowColor;
      uniform vec3 uSkyColor;
      uniform vec3 uMoonColor;
      uniform vec3 uGoldColor;
      uniform vec3 uMoonDir;

      varying vec2 vUv;
      varying vec3 vWorldPos;
      varying float vElev;

      // Multi-octave directional capillary wave height & analytical slope
      vec2 waveSlope(vec2 p, float t) {
        vec2 slope = vec2(0.0);
        // 5 rotated wave octaves for organic water facets
        vec2 d1 = vec2(0.86, 0.51);
        float ph1 = dot(p, d1) * 1.35 + t * 1.15;
        slope += d1 * cos(ph1) * 0.09;

        vec2 d2 = vec2(-0.62, 0.78);
        float ph2 = dot(p, d2) * 2.15 - t * 1.45;
        slope += d2 * cos(ph2) * 0.075;

        vec2 d3 = vec2(0.32, -0.94);
        float ph3 = dot(p, d3) * 3.8 + t * 1.9;
        slope += d3 * cos(ph3) * 0.068;

        vec2 d4 = vec2(-0.92, -0.39);
        float ph4 = dot(p, d4) * 6.4 - t * 2.4;
        slope += d4 * cos(ph4) * 0.048;

        vec2 d5 = vec2(0.71, -0.70);
        float ph5 = dot(p, d5) * 11.2 + t * 3.1;
        slope += d5 * cos(ph5) * 0.032;

        return slope;
      }

      void main() {
        vec2 p = vWorldPos.xz;
        vec2 slope = waveSlope(p, uTime);
        vec3 N = normalize(vec3(-slope.x, 1.0, -slope.y));
        vec3 V = normalize(cameraPosition - vWorldPos);
        vec3 L = normalize(uMoonDir);

        // Schlick Fresnel reflection of deep indigo sky & teal depth
        float ndotv = max(dot(N, V), 0.0);
        float fresnel = 0.04 + 0.96 * pow(1.0 - ndotv, 4.2);

        // Deep river color with crest translucency
        float crest = smoothstep(-0.08, 0.11, vElev);
        vec3 waterBody = mix(uDeepColor, uShallowColor, 0.24 + crest * 0.36);
        vec3 skyRefl = mix(uShallowColor * 0.65, uSkyColor, clamp(fresnel * 1.15, 0.0, 1.0));
        vec3 col = mix(waterBody, skyRefl, clamp(fresnel * 0.85, 0.0, 0.85));

        // Delicate sparkling Blinn-Phong moonlight ripples across wavelets
        vec3 H = normalize(L + V);
        float ndoth = max(dot(N, H), 0.0);
        float broadSheen = pow(ndoth, 95.0) * 0.28;
        float crispGlint = pow(ndoth, 360.0) * 1.15;
        col += uMoonColor * (broadSheen + crispGlint);

        // Subtle warm golden diya shimmer scattered over foreground ripples
        float warmGlint = pow(max(0.0, sin(p.x * 2.7 + uTime * 1.1) * cos(p.y * 2.4 - uTime * 0.9) * (0.5 + 0.5 * N.x * 4.0)), 4.0);
        float nearWeight = smoothstep(26.0, 4.0, length(cameraPosition.xz - p));
        col += uGoldColor * warmGlint * 0.32 * nearWeight;

        // Smooth atmospheric distance blend into Vrindavan midnight mist (eliminates sharp water edge)
        float camDist = length(cameraPosition.xz - p);
        float fogFactor = smoothstep(14.0, 42.0, camDist);
        col = mix(col, vec3(0.043, 0.082, 0.188), fogFactor);

        // Soft circular perimeter alpha fade so plane edges never show
        float edgeDist = length((vUv - 0.5) * 2.0);
        float alpha = 1.0 - smoothstep(0.76, 1.0, edgeDist);

        gl_FragColor = vec4(col, alpha);
      }
    `,
  });
}

/** Expanding sacred concentric water ripple shader for lotus ponds and Date reveal. */
export function createWaterRippleRingMaterial(colorHex: string = colors.gold): ShaderMaterial {
  return new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    side: DoubleSide,
    fog: false,
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new Color(colorHex) },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform vec3 uColor;
      varying vec2 vUv;

      void main() {
        float r = length((vUv - 0.5) * 2.0);
        if (r > 1.0) discard;
        float rings = sin(r * 22.0 - uTime * 2.4) * 0.5 + 0.5;
        rings = pow(rings, 6.0);
        float mask = smoothstep(0.14, 0.28, r) * (1.0 - smoothstep(0.62, 1.0, r));
        gl_FragColor = vec4(uColor, rings * mask * 0.45);
      }
    `,
  });
}

/** Travelling luminous musical light ribbon along a TubeGeometry curve. */
export function createLightRibbonMaterial(
  colorA: string = colors.gold,
  colorB: string = colors.yamuna,
): ShaderMaterial {
  return new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    side: DoubleSide,
    uniforms: {
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uColorA: { value: new Color(colorA) },
      uColorB: { value: new Color(colorB) },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform float uProgress;
      uniform vec3 uColorA;
      uniform vec3 uColorB;
      varying vec2 vUv;

      void main() {
        float reveal = smoothstep(uProgress + 0.04, uProgress - 0.08, vUv.x);
        float pulse = 0.55 + 0.45 * sin(vUv.x * 24.0 - uTime * 4.2);
        float headGlow = exp(-pow((vUv.x - uProgress) * 14.0, 2.0)) * 1.3;
        float core = 1.0 - abs(vUv.y - 0.5) * 1.6;
        vec3 col = mix(uColorB, uColorA, pulse) + vec3(1.0, 0.94, 0.78) * headGlow;
        float alpha = clamp((reveal * (0.45 + 0.45 * pulse) + headGlow) * max(core, 0.2), 0.0, 0.95);
        gl_FragColor = vec4(col, alpha);
      }
    `,
  });
}

/** Procedural Maharashtrian Paithani silk peacock-and-zari ribbon shader unfurling with progress. */
export function createPaithaniRibbonMaterial(): ShaderMaterial {
  return new ShaderMaterial({
    transparent: true,
    side: DoubleSide,
    uniforms: {
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uPeacock: { value: new Color(colors.peacock) },
      uGold: { value: new Color(colors.gold) },
      uLotus: { value: new Color(colors.lotus) },
      uMarigold: { value: new Color(colors.marigold) },
    },
    vertexShader: /* glsl */ `
      uniform float uTime;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        vec3 pos = position;
        pos.y += sin(uv.x * 10.0 - uTime * 1.8) * 0.12;
        pos.z += cos(uv.x * 7.0 + uTime * 1.3) * 0.08;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform float uProgress;
      uniform vec3 uPeacock;
      uniform vec3 uGold;
      uniform vec3 uLotus;
      uniform vec3 uMarigold;
      varying vec2 vUv;

      void main() {
        // Unfurl along u axis with progress
        float mask = smoothstep(uProgress + 0.06, uProgress - 0.04, vUv.x);
        if (mask < 0.01) discard;

        // Wide golden zari borders top & bottom
        float edgeDist = min(vUv.y, 1.0 - vUv.y);
        float borderBand = smoothstep(0.22, 0.16, edgeDist);
        float innerPiping = smoothstep(0.025, 0.008, abs(edgeDist - 0.24));

        // Repeating Paithani lotus/peacock geometric diamond motif in center band
        vec2 cell = fract(vec2(vUv.x * 14.0, (vUv.y - 0.5) * 2.2 + 0.5)) - 0.5;
        float diamond = abs(cell.x) + abs(cell.y);
        float motif = smoothstep(0.32, 0.25, diamond);
        float dotCenter = smoothstep(0.11, 0.07, length(cell));

        // Subtle silk sheen
        float sheen = 0.85 + 0.15 * sin(vUv.x * 28.0 + uTime * 1.5);

        vec3 col = mix(uPeacock, uGold, borderBand * 0.9);
        col = mix(col, uLotus, motif * (1.0 - borderBand) * 0.75);
        col = mix(col, uMarigold, dotCenter * (1.0 - borderBand));
        col = mix(col, uGold, innerPiping);
        col *= sheen;

        gl_FragColor = vec4(col, mask * 0.95);
      }
    `,
  });
}

/**
 * Maharashtrian Antarpat silk cloth shader:
 * Two halves that wave gently in the breeze and part smoothly as `uPart` goes 0 -> 1.
 */
export function createAntarpatMaterial(side: -1 | 1): ShaderMaterial {
  return new ShaderMaterial({
    transparent: true,
    side: DoubleSide,
    uniforms: {
      uTime: { value: 0 },
      uPart: { value: 0 },
      uSide: { value: side },
      uSilk: { value: new Color(colors.cream) },
      uGold: { value: new Color(colors.gold) },
      uMarigold: { value: new Color(colors.marigold) },
    },
    vertexShader: /* glsl */ `
      uniform float uTime;
      uniform float uPart;
      uniform float uSide;
      varying vec2 vUv;

      void main() {
        vUv = uv;
        vec3 pos = position;
        float flutter = sin(pos.y * 2.6 + uTime * 2.1 + uSide) * 0.08 + cos(pos.x * 2.2 - uTime * 1.7) * 0.05;
        pos.z += flutter * (0.4 + uPart * 0.9);
        // Gather folds slightly as cloth parts
        pos.x *= mix(1.0, 0.42, uPart);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uPart;
      uniform vec3 uSilk;
      uniform vec3 uGold;
      uniform vec3 uMarigold;
      varying vec2 vUv;

      void main() {
        float border = step(vUv.y, 0.1) + step(0.9, vUv.y) + step(vUv.x, 0.06) + step(0.94, vUv.x);
        float innerLine = smoothstep(0.012, 0.003, abs(vUv.y - 0.14)) + smoothstep(0.012, 0.003, abs(vUv.y - 0.86));

        // Subtle silk weave & sunlit folds
        float weave = 0.94 + 0.06 * sin(vUv.x * 60.0) * sin(vUv.y * 60.0);
        vec3 col = mix(uSilk * 0.95, uMarigold, clamp(border, 0.0, 1.0) * 0.78);
        col = mix(col, uGold, clamp(innerLine, 0.0, 1.0));
        col *= weave;

        float alpha = (1.0 - smoothstep(0.72, 1.0, uPart)) * 0.94;
        gl_FragColor = vec4(col, alpha);
      }
    `,
  });
}

/** 2.5D depth-parallax shader for the couple reveal portrait. */
export function createDepthParallaxMaterial(colorMap: Texture, depthMap: Texture): ShaderMaterial {
  return new ShaderMaterial({
    transparent: true,
    uniforms: {
      uMap: { value: colorMap },
      uDepth: { value: depthMap },
      uOffset: { value: [0, 0] },
      uOpacity: { value: 1 },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D uMap;
      uniform sampler2D uDepth;
      uniform vec2 uOffset;
      uniform float uOpacity;
      varying vec2 vUv;

      void main() {
        float depth = texture2D(uDepth, vUv).r;
        vec2 displacedUv = clamp(vUv + uOffset * (depth - 0.45) * 0.05, 0.005, 0.995);
        vec4 tex = texture2D(uMap, displacedUv);
        gl_FragColor = vec4(tex.rgb, tex.a * uOpacity);
      }
    `,
  });
}

/**
 * Framed real-photo portrait shader for Groom, Bride, and Couple reveals:
 * - Preserves natural true-to-life skin tones (`toneMapped: false`)
 * - Clips smoothly to an ornate Indian Pichwai pointed arch (`archMode = 1`) or rounded royal frame (`0`)
 * - Adds subtle 2.5D pointer parallax & warm gilded inner rim highlight
 */
export function createFramedPortraitMaterial(
  colorMap: Texture,
  archMode: 'arch' | 'royalRect' = 'arch',
): ShaderMaterial {
  return new ShaderMaterial({
    transparent: true,
    toneMapped: false,
    side: DoubleSide,
    uniforms: {
      uMap: { value: colorMap },
      uOffset: { value: [0, 0] },
      uOpacity: { value: 1 },
      uArchMode: { value: archMode === 'arch' ? 1.0 : 0.0 },
      uGold: { value: new Color(colors.gold) },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      varying vec3 vWorldPos;
      void main() {
        vUv = uv;
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPos = worldPos.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D uMap;
      uniform vec2 uOffset;
      uniform float uOpacity;
      uniform float uArchMode;
      uniform vec3 uGold;
      varying vec2 vUv;
      varying vec3 vWorldPos;

      void main() {
        // Soft radial depth mask for subtle 2.5D parallax without distorting faces
        float centerDist = length((vUv - vec2(0.5, 0.55)) * vec2(1.15, 0.9));
        float depth = clamp(1.0 - centerDist, 0.0, 1.0);
        vec2 sampleUv = clamp(vUv + uOffset * (depth - 0.35) * 0.022, 0.008, 0.992);

        // Compute mask distance (negative = inside frame, positive = outside)
        float dist = -1.0;
        if (uArchMode > 0.5) {
          // Pointed Indian Mughal / Pichwai arch profile
          float dx = abs(vUv.x - 0.5) * 2.0; // 0..1
          float archTop = 1.0 - pow(dx, 1.85) * 0.34;
          float topDist = vUv.y - archTop;
          float sideDist = dx - 0.94;
          float bottomDist = 0.03 - vUv.y;
          dist = max(max(topDist, sideDist * 0.5), bottomDist);
        } else {
          // Slightly arched royal Darbar portrait frame
          float dx = abs(vUv.x - 0.5) * 2.0;
          float archTop = 1.0 - pow(dx, 2.8) * 0.12;
          float topDist = vUv.y - archTop;
          float sideDist = dx - 0.95;
          float bottomDist = 0.03 - vUv.y;
          dist = max(max(topDist, sideDist * 0.5), bottomDist);
        }

        float alphaMask = 1.0 - smoothstep(-0.012, 0.012, dist);
        if (alphaMask < 0.01) discard;

        // Smooth distance veil so portraits in the next scene do not pop out across rooms
        float camDist = length(cameraPosition - vWorldPos);
        float distFade = 1.0 - smoothstep(16.0, 25.5, camDist);
        if (distFade < 0.01) discard;

        vec3 photo = texture2D(uMap, sampleUv).rgb;

        // Delicate warm inner gold filigree rim just inside the border
        float rimBand = smoothstep(0.036, 0.012, abs(dist + 0.02));
        vec3 col = mix(photo, uGold * 1.15, rimBand * 0.72);

        // Soft warm candlelight vignette at outer edge
        float vig = smoothstep(0.95, 0.38, length((vUv - vec2(0.5, 0.52)) * vec2(1.1, 1.0)));
        col *= mix(0.84, 1.03, vig);

        gl_FragColor = vec4(col, alphaMask * uOpacity * distFade);
      }
    `,
  });
}

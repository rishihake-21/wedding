import { CanvasTexture, ClampToEdgeWrapping, RepeatWrapping, SRGBColorSpace } from 'three';
import { colors } from '../theme/tokens';

function makeCanvas(width: number, height: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  return [canvas, ctx];
}

function finalizeColorTexture(canvas: HTMLCanvasElement, repeat = false): CanvasTexture {
  const tex = new CanvasTexture(canvas);
  tex.colorSpace = SRGBColorSpace;
  tex.wrapS = repeat ? RepeatWrapping : ClampToEdgeWrapping;
  tex.wrapT = repeat ? RepeatWrapping : ClampToEdgeWrapping;
  tex.needsUpdate = true;
  return tex;
}

/** Soft radial glow texture for fireflies, lantern halos, and moon corona. */
export function createSoftGlowTexture(): CanvasTexture {
  const [canvas, ctx] = makeCanvas(128, 128);
  const grad = ctx.createRadialGradient(64, 64, 2, 64, 64, 62);
  grad.addColorStop(0, 'rgba(255, 248, 226, 1)');
  grad.addColorStop(0.28, 'rgba(242, 192, 86, 0.85)');
  grad.addColorStop(0.6, 'rgba(242, 140, 40, 0.25)');
  grad.addColorStop(1, 'rgba(242, 140, 40, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);
  return finalizeColorTexture(canvas);
}

/** Teardrop flickering diya flame sprite texture. */
export function createFlameSpriteTexture(): CanvasTexture {
  const [canvas, ctx] = makeCanvas(128, 192);
  const halo = ctx.createRadialGradient(64, 118, 6, 64, 118, 62);
  halo.addColorStop(0, 'rgba(255, 244, 220, 0.95)');
  halo.addColorStop(0.45, 'rgba(242, 140, 40, 0.45)');
  halo.addColorStop(1, 'rgba(242, 140, 40, 0)');
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, 128, 192);

  // Outer marigold flame tongue
  ctx.beginPath();
  ctx.moveTo(64, 24);
  ctx.bezierCurveTo(96, 84, 98, 142, 64, 162);
  ctx.bezierCurveTo(30, 142, 32, 84, 64, 24);
  const outerGrad = ctx.createLinearGradient(64, 24, 64, 162);
  outerGrad.addColorStop(0, '#FFF8DF');
  outerGrad.addColorStop(0.45, colors.gold);
  outerGrad.addColorStop(0.85, colors.marigold);
  outerGrad.addColorStop(1, 'rgba(242, 140, 40, 0.15)');
  ctx.fillStyle = outerGrad;
  ctx.fill();

  // Inner incandescent cream core
  ctx.beginPath();
  ctx.moveTo(64, 68);
  ctx.bezierCurveTo(80, 102, 78, 140, 64, 150);
  ctx.bezierCurveTo(50, 140, 48, 102, 64, 68);
  ctx.fillStyle = '#FFFDF4';
  ctx.fill();

  return finalizeColorTexture(canvas);
}

/** Procedural Vrindavan peacock feather (morpis) texture with iridescent eye and barbs. */
export function createPeacockFeatherTexture(): CanvasTexture {
  const [canvas, ctx] = makeCanvas(256, 512);

  // Central quill shaft
  ctx.strokeStyle = colors.gold;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(128, 495);
  ctx.quadraticCurveTo(134, 280, 128, 95);
  ctx.stroke();

  // Radiating fine iridescent barbs
  for (let i = 0; i < 64; i++) {
    const t = i / 63;
    const y = 440 - t * 340;
    const span = Math.sin(t * Math.PI) * 96 + 18;
    const hueShift = t > 0.55 ? colors.peacock : colors.yamuna;
    ctx.strokeStyle = i % 3 === 0 ? colors.gold : hueShift;
    ctx.globalAlpha = 0.55 + t * 0.35;
    ctx.lineWidth = 2.2;

    ctx.beginPath();
    ctx.moveTo(128, y);
    ctx.quadraticCurveTo(128 - span * 0.6, y - 28, 128 - span, y - 46);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(128, y);
    ctx.quadraticCurveTo(128 + span * 0.6, y - 28, 128 + span, y - 46);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Outer golden-green eye halo
  const eyeY = 148;
  ctx.save();
  ctx.translate(128, eyeY);

  ctx.beginPath();
  ctx.ellipse(0, 0, 56, 76, 0, 0, Math.PI * 2);
  ctx.fillStyle = colors.peacock;
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(0, -4, 42, 58, 0, 0, Math.PI * 2);
  ctx.fillStyle = colors.gold;
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(0, 2, 28, 38, 0, 0, Math.PI * 2);
  ctx.fillStyle = colors.yamuna;
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(0, 8, 15, 22, 0, 0, Math.PI * 2);
  ctx.fillStyle = colors.midnight;
  ctx.fill();

  // Subtle crescent highlight
  ctx.beginPath();
  ctx.arc(-5, 0, 5, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 244, 220, 0.75)';
  ctx.fill();
  ctx.restore();

  return finalizeColorTexture(canvas);
}

/** Tapered floral petal texture for lotus pink or marigold saffron particles. */
export function createPetalTexture(primaryHex: string, tipHex: string = colors.cream): CanvasTexture {
  const [canvas, ctx] = makeCanvas(128, 128);
  ctx.beginPath();
  ctx.moveTo(64, 10);
  ctx.bezierCurveTo(104, 38, 106, 94, 64, 118);
  ctx.bezierCurveTo(22, 94, 24, 38, 64, 10);
  const grad = ctx.createLinearGradient(64, 10, 64, 118);
  grad.addColorStop(0, tipHex);
  grad.addColorStop(0.55, primaryHex);
  grad.addColorStop(1, primaryHex);
  ctx.fillStyle = grad;
  ctx.fill();

  // Delicate center vein
  ctx.strokeStyle = 'rgba(255, 244, 220, 0.45)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(64, 24);
  ctx.lineTo(64, 108);
  ctx.stroke();

  return finalizeColorTexture(canvas);
}

/**
 * Stylized Pichwai-inspired Maharashtrian Groom illustration texture:
 * Pheta turban with kalgi & peacock feather, mundavalya pearl strings, sherwani/kurta & dhoti,
 * holding a golden bansuri flute.
 */
export function createGroomSilhouetteTexture(): CanvasTexture {
  const [canvas, ctx] = makeCanvas(512, 768);

  // Soft Pichwai arch aura behind figure
  const aura = ctx.createRadialGradient(256, 260, 20, 256, 300, 220);
  aura.addColorStop(0, 'rgba(212, 166, 64, 0.48)');
  aura.addColorStop(0.55, 'rgba(15, 110, 122, 0.22)');
  aura.addColorStop(1, 'rgba(11, 21, 48, 0)');
  ctx.fillStyle = aura;
  ctx.fillRect(0, 0, 512, 768);

  // Ornamental gold Pichwai arch border
  ctx.strokeStyle = 'rgba(212, 166, 64, 0.7)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(86, 720);
  ctx.lineTo(86, 260);
  ctx.quadraticCurveTo(86, 110, 256, 56);
  ctx.quadraticCurveTo(426, 110, 426, 260);
  ctx.lineTo(426, 720);
  ctx.stroke();

  // Dhoti lower drape (cream silk with gold border)
  ctx.fillStyle = '#EBD9B5';
  ctx.beginPath();
  ctx.moveTo(186, 470);
  ctx.lineTo(326, 470);
  ctx.lineTo(342, 710);
  ctx.lineTo(170, 710);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = colors.gold;
  ctx.lineWidth = 5;
  ctx.stroke();

  // Kurta / Sherwani torso (midnight indigo velvet with gold zari)
  const kurtaGrad = ctx.createLinearGradient(180, 290, 330, 510);
  kurtaGrad.addColorStop(0, '#162854');
  kurtaGrad.addColorStop(1, '#0E1C3D');
  ctx.fillStyle = kurtaGrad;
  ctx.beginPath();
  ctx.moveTo(212, 290);
  ctx.lineTo(300, 290);
  ctx.quadraticCurveTo(354, 326, 344, 495);
  ctx.lineTo(168, 495);
  ctx.quadraticCurveTo(158, 326, 212, 290);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = colors.gold;
  ctx.lineWidth = 4;
  ctx.stroke();

  // Gold zari stole (uparna) draped across shoulders
  ctx.strokeStyle = colors.marigold;
  ctx.lineWidth = 18;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(192, 304);
  ctx.quadraticCurveTo(256, 420, 322, 304);
  ctx.stroke();
  ctx.strokeStyle = colors.gold;
  ctx.lineWidth = 5;
  ctx.stroke();

  // Head silhouette
  ctx.fillStyle = '#2B1F2E';
  ctx.beginPath();
  ctx.ellipse(256, 232, 38, 46, 0, 0, Math.PI * 2);
  ctx.fill();

  // Maharashtrian Pheta (Marigold & gold turban)
  ctx.fillStyle = colors.marigold;
  ctx.beginPath();
  ctx.ellipse(256, 186, 56, 34, -0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = colors.gold;
  ctx.lineWidth = 4;
  ctx.stroke();

  // Pheta tail & peacock feather crest (morpis)
  ctx.fillStyle = colors.peacock;
  ctx.beginPath();
  ctx.ellipse(298, 134, 16, 36, 0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = colors.gold;
  ctx.beginPath();
  ctx.ellipse(300, 128, 7, 13, 0.35, 0, Math.PI * 2);
  ctx.fill();

  // Mundavalya (pearl forehead strings)
  ctx.strokeStyle = colors.cream;
  ctx.lineWidth = 3;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(212, 206);
  ctx.quadraticCurveTo(256, 224, 300, 206);
  ctx.moveTo(216, 210);
  ctx.lineTo(208, 280);
  ctx.moveTo(296, 210);
  ctx.lineTo(304, 280);
  ctx.stroke();
  ctx.setLineDash([]);

  // Golden Bansuri held diagonally
  ctx.strokeStyle = colors.gold;
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.moveTo(156, 362);
  ctx.lineTo(358, 332);
  ctx.stroke();

  return finalizeColorTexture(canvas);
}

/**
 * Stylized Pichwai-inspired Maharashtrian Bride illustration texture:
 * Paithani Nauvari saree in peacock green & gold, lotus pink drape,
 * chandrakor bindi, mundavalya pearls, nath & green bangles.
 */
export function createBrideSilhouetteTexture(): CanvasTexture {
  const [canvas, ctx] = makeCanvas(512, 768);

  // Soft lotus-gold Pichwai halo
  const aura = ctx.createRadialGradient(256, 270, 20, 256, 310, 220);
  aura.addColorStop(0, 'rgba(232, 160, 180, 0.45)');
  aura.addColorStop(0.55, 'rgba(212, 166, 64, 0.22)');
  aura.addColorStop(1, 'rgba(11, 21, 48, 0)');
  ctx.fillStyle = aura;
  ctx.fillRect(0, 0, 512, 768);

  // Ornamental gold arch
  ctx.strokeStyle = 'rgba(212, 166, 64, 0.7)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(86, 720);
  ctx.lineTo(86, 260);
  ctx.quadraticCurveTo(86, 110, 256, 56);
  ctx.quadraticCurveTo(426, 110, 426, 260);
  ctx.lineTo(426, 720);
  ctx.stroke();

  // Nauvari Paithani Saree drape (peacock green with wide gold zari border)
  const sareeGrad = ctx.createLinearGradient(160, 300, 350, 710);
  sareeGrad.addColorStop(0, colors.peacock);
  sareeGrad.addColorStop(0.65, '#115843');
  sareeGrad.addColorStop(1, '#0C3E31');
  ctx.fillStyle = sareeGrad;
  ctx.beginPath();
  ctx.moveTo(216, 296);
  ctx.lineTo(296, 296);
  ctx.quadraticCurveTo(340, 360, 362, 710);
  ctx.lineTo(150, 710);
  ctx.quadraticCurveTo(172, 360, 216, 296);
  ctx.closePath();
  ctx.fill();

  // Wide Paithani gold zari border at hem and diagonal pallu
  ctx.fillStyle = colors.gold;
  ctx.fillRect(154, 670, 204, 24);
  ctx.strokeStyle = colors.lotus;
  ctx.lineWidth = 4;
  ctx.strokeRect(156, 672, 200, 20);

  // Diagonal lotus-pink & gold pallu
  ctx.strokeStyle = colors.lotus;
  ctx.lineWidth = 22;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(202, 308);
  ctx.quadraticCurveTo(260, 440, 336, 590);
  ctx.stroke();
  ctx.strokeStyle = colors.gold;
  ctx.lineWidth = 6;
  ctx.stroke();

  // Hair ambada (bun) with mogra gajra flowers
  ctx.fillStyle = '#14111C';
  ctx.beginPath();
  ctx.arc(256, 188, 44, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = colors.cream;
  ctx.lineWidth = 7;
  ctx.setLineDash([7, 5]);
  ctx.beginPath();
  ctx.arc(256, 188, 47, Math.PI * 1.15, Math.PI * 1.85);
  ctx.stroke();
  ctx.setLineDash([]);

  // Face silhouette
  ctx.fillStyle = '#2B1F2E';
  ctx.beginPath();
  ctx.ellipse(256, 232, 35, 44, 0, 0, Math.PI * 2);
  ctx.fill();

  // Traditional Chandrakor (crescent bindi)
  ctx.strokeStyle = colors.marigold;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.arc(256, 218, 7, 0.25 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();

  // Mundavalya pearl forehead strings
  ctx.strokeStyle = colors.cream;
  ctx.lineWidth = 3;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(216, 206);
  ctx.quadraticCurveTo(256, 224, 296, 206);
  ctx.moveTo(218, 212);
  ctx.lineTo(210, 290);
  ctx.moveTo(294, 212);
  ctx.lineTo(302, 290);
  ctx.stroke();
  ctx.setLineDash([]);

  // Pearl Maharashtrian Nath hint & gold necklace (Mangalsutra / Kolhapuri Saaj)
  ctx.strokeStyle = colors.gold;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(256, 292, 34, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();

  // Green bangles (Hirva Chuda) accent at wrists
  ctx.strokeStyle = colors.peacock;
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(188, 430);
  ctx.lineTo(206, 438);
  ctx.moveTo(306, 438);
  ctx.lineTo(324, 430);
  ctx.stroke();

  return finalizeColorTexture(canvas);
}

/** Couple union portrait texture (stylized Pichwai tableau under kadamba & marigold garland). */
export function createCouplePortraitTexture(): CanvasTexture {
  const [canvas, ctx] = makeCanvas(768, 768);

  // Night moonlit radial backdrop
  const bg = ctx.createRadialGradient(384, 300, 30, 384, 384, 400);
  bg.addColorStop(0, 'rgba(255, 244, 220, 0.35)');
  bg.addColorStop(0.45, 'rgba(212, 166, 64, 0.24)');
  bg.addColorStop(0.8, 'rgba(15, 110, 122, 0.32)');
  bg.addColorStop(1, 'rgba(11, 21, 48, 0.92)');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 768, 768);

  // Ornate arch
  ctx.strokeStyle = colors.gold;
  ctx.lineWidth = 8;
  ctx.strokeRect(26, 26, 716, 716);
  ctx.strokeStyle = 'rgba(242, 140, 40, 0.65)';
  ctx.lineWidth = 3;
  ctx.strokeRect(44, 44, 680, 680);

  // Moon disc behind couple
  ctx.fillStyle = 'rgba(255, 244, 220, 0.28)';
  ctx.beginPath();
  ctx.arc(384, 260, 140, 0, Math.PI * 2);
  ctx.fill();

  // Groom (left)
  ctx.fillStyle = '#152754';
  ctx.beginPath();
  ctx.ellipse(290, 560, 74, 150, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = colors.gold;
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.fillStyle = '#241B29';
  ctx.beginPath();
  ctx.ellipse(292, 365, 36, 44, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = colors.marigold;
  ctx.beginPath();
  ctx.ellipse(288, 322, 52, 28, -0.1, 0, Math.PI * 2);
  ctx.fill();

  // Bride (right)
  ctx.fillStyle = colors.peacock;
  ctx.beginPath();
  ctx.ellipse(478, 570, 72, 145, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = colors.gold;
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.fillStyle = '#241B29';
  ctx.beginPath();
  ctx.ellipse(474, 382, 34, 42, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = colors.cream;
  ctx.lineWidth = 5;
  ctx.setLineDash([5, 4]);
  ctx.beginPath();
  ctx.arc(478, 345, 36, Math.PI * 1.1, Math.PI * 1.9);
  ctx.stroke();
  ctx.setLineDash([]);

  // Shared marigold & lotus varmaala (wedding garlands)
  ctx.strokeStyle = colors.marigold;
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.moveTo(292, 412);
  ctx.quadraticCurveTo(384, 498, 474, 424);
  ctx.stroke();
  ctx.strokeStyle = colors.lotus;
  ctx.lineWidth = 6;
  ctx.setLineDash([8, 8]);
  ctx.stroke();
  ctx.setLineDash([]);

  return finalizeColorTexture(canvas);
}

/** Matching smooth grayscale depth map for 2.5D parallax displacement on the couple portrait. */
export function createCoupleDepthTexture(): CanvasTexture {
  const [canvas, ctx] = makeCanvas(256, 256);
  ctx.fillStyle = '#181818';
  ctx.fillRect(0, 0, 256, 256);

  // Midground moon halo
  const mid = ctx.createRadialGradient(128, 90, 10, 128, 90, 80);
  mid.addColorStop(0, '#666666');
  mid.addColorStop(1, '#181818');
  ctx.fillStyle = mid;
  ctx.fillRect(0, 0, 256, 256);

  // Foreground couple silhouettes (bright = closer to camera)
  const drawDepthOval = (x: number, y: number, rx: number, ry: number) => {
    const g = ctx.createRadialGradient(x, y, 4, x, y, Math.max(rx, ry));
    g.addColorStop(0, '#ffffff');
    g.addColorStop(0.7, '#bdbdbd');
    g.addColorStop(1, '#202020');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
  };
  drawDepthOval(96, 175, 36, 70);
  drawDepthOval(160, 178, 36, 68);

  const tex = new CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

/** Traditional Maharashtrian floor Rangoli medallion texture for the wedding mandap. */
export function createRangoliTexture(): CanvasTexture {
  const [canvas, ctx] = makeCanvas(512, 512);
  ctx.translate(256, 256);

  // Outer marigold petal ring
  for (let i = 0; i < 16; i++) {
    ctx.save();
    ctx.rotate((i * Math.PI * 2) / 16);
    ctx.beginPath();
    ctx.ellipse(0, -180, 22, 46, 0, 0, Math.PI * 2);
    ctx.fillStyle = i % 2 === 0 ? colors.marigold : colors.gold;
    ctx.globalAlpha = 0.85;
    ctx.fill();
    ctx.restore();
  }

  // Middle lotus pink ring
  for (let i = 0; i < 12; i++) {
    ctx.save();
    ctx.rotate((i * Math.PI * 2) / 12 + 0.13);
    ctx.beginPath();
    ctx.ellipse(0, -112, 18, 42, 0, 0, Math.PI * 2);
    ctx.fillStyle = colors.lotus;
    ctx.globalAlpha = 0.9;
    ctx.fill();
    ctx.restore();
  }

  // Inner peacock & cream mandala circles
  ctx.globalAlpha = 1;
  ctx.beginPath();
  ctx.arc(0, 0, 74, 0, Math.PI * 2);
  ctx.fillStyle = colors.peacock;
  ctx.fill();
  ctx.strokeStyle = colors.cream;
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(0, 0, 32, 0, Math.PI * 2);
  ctx.fillStyle = colors.gold;
  ctx.fill();

  return finalizeColorTexture(canvas);
}

/** High-detail luminous full moon surface texture with subtle lunar maria and soft limb glow. */
export function createMoonSurfaceTexture(): CanvasTexture {
  const [canvas, ctx] = makeCanvas(512, 512);
  const base = ctx.createRadialGradient(236, 232, 24, 256, 256, 260);
  base.addColorStop(0, '#FFFDF5');
  base.addColorStop(0.55, '#FAF0D6');
  base.addColorStop(0.85, '#E8D8B5');
  base.addColorStop(1, '#CDB992');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, 512, 512);

  // Subtle lunar maria (seas)
  const maria: [number, number, number, number, number][] = [
    [175, 190, 92, 68, 0.14],
    [295, 165, 78, 56, 0.12],
    [330, 265, 86, 62, 0.15],
    [220, 305, 74, 52, 0.11],
    [145, 290, 52, 40, 0.1],
    [260, 225, 48, 36, 0.09],
  ];
  for (const [x, y, rx, ry, a] of maria) {
    const g = ctx.createRadialGradient(x, y, 4, x, y, Math.max(rx, ry));
    g.addColorStop(0, `rgba(148, 134, 114, ${a})`);
    g.addColorStop(0.65, `rgba(165, 152, 132, ${a * 0.5})`);
    g.addColorStop(1, 'rgba(165, 152, 132, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0.35, 0, Math.PI * 2);
    ctx.fill();
  }

  // Fine craters & highland speckles
  let s = 1337;
  const rand = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
  for (let i = 0; i < 65; i++) {
    const cx = 40 + rand() * 432;
    const cy = 40 + rand() * 432;
    const r = 3 + rand() * 14;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(140, 128, 110, ${0.04 + rand() * 0.06})`;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 252, 240, 0.08)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  return finalizeColorTexture(canvas, true);
}

/** Organic furrowed bark texture for Vrindavan Kadamba tree trunks and limbs. */
export function createBarkTexture(): CanvasTexture {
  const [canvas, ctx] = makeCanvas(256, 512);
  ctx.fillStyle = '#3A281E';
  ctx.fillRect(0, 0, 256, 512);

  let s = 4421;
  const rand = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };

  // Vertical bark ridges & dark fissures
  for (let i = 0; i < 140; i++) {
    const x = rand() * 256;
    const y = rand() * 512;
    const h = 40 + rand() * 120;
    const w = 2 + rand() * 7;
    ctx.fillStyle = i % 3 === 0 ? '#241711' : i % 3 === 1 ? '#523B2B' : '#433022';
    ctx.globalAlpha = 0.45 + rand() * 0.35;
    ctx.beginPath();
    ctx.ellipse(x, y, w, h * 0.5, (rand() - 0.5) * 0.14, 0, Math.PI * 2);
    ctx.fill();
  }

  // Subtle nocturnal peacock-moss streaks
  for (let i = 0; i < 36; i++) {
    const x = rand() * 256;
    const y = rand() * 512;
    ctx.fillStyle = 'rgba(22, 82, 68, 0.26)';
    ctx.beginPath();
    ctx.ellipse(x, y, 5 + rand() * 10, 16 + rand() * 28, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  return finalizeColorTexture(canvas, true);
}

/** Botanical Kadamba leaf-spray cluster texture with crisp feathered alpha silhouettes. */
export function createFoliageClusterTexture(): CanvasTexture {
  const [canvas, ctx] = makeCanvas(256, 256);
  ctx.clearRect(0, 0, 256, 256);

  // Fine radial twigs
  ctx.strokeStyle = 'rgba(66, 48, 34, 0.85)';
  ctx.lineWidth = 3;
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + 0.2;
    ctx.beginPath();
    ctx.moveTo(128, 128);
    ctx.lineTo(128 + Math.cos(a) * 76, 128 + Math.sin(a) * 76);
    ctx.stroke();
  }

  // Layered elliptical broad Kadamba leaves radiating outward with midrib veins
  const leafColors = ['#0E3E33', '#135243', '#1B6D57', '#248266', '#165F4D'];
  let s = 7711;
  const rand = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };

  for (let ring = 0; ring < 2; ring++) {
    const count = ring === 0 ? 14 : 10;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + ring * 0.3 + (rand() - 0.5) * 0.22;
      const dist = ring === 0 ? 48 + rand() * 24 : 20 + rand() * 20;
      const lx = 128 + Math.cos(angle) * dist;
      const ly = 128 + Math.sin(angle) * dist;
      const rx = 24 + rand() * 14;
      const ry = 11 + rand() * 6;

      ctx.save();
      ctx.translate(lx, ly);
      ctx.rotate(angle);

      const grad = ctx.createLinearGradient(-rx, 0, rx, 0);
      grad.addColorStop(0, '#0A2E26');
      grad.addColorStop(0.55, leafColors[i % leafColors.length]);
      grad.addColorStop(1, '#3CA182'); // subtle moonlit leaf edge
      ctx.fillStyle = grad;

      ctx.beginPath();
      ctx.moveTo(-rx, 0);
      ctx.quadraticCurveTo(0, -ry * 1.35, rx, 0);
      ctx.quadraticCurveTo(0, ry * 1.35, -rx, 0);
      ctx.closePath();
      ctx.fill();

      // Central botanical vein
      ctx.strokeStyle = 'rgba(148, 224, 198, 0.28)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-rx * 0.8, 0);
      ctx.lineTo(rx * 0.82, 0);
      ctx.stroke();

      ctx.restore();
    }
  }

  return finalizeColorTexture(canvas);
}

/** Rich veined sacred lotus petal texture (golden-cream base -> blush body -> luminous rose tip). */
export function createLotusPetalTexture(): CanvasTexture {
  const [canvas, ctx] = makeCanvas(256, 512);
  const grad = ctx.createLinearGradient(0, 512, 0, 0);
  grad.addColorStop(0, '#FFF1C2');
  grad.addColorStop(0.18, '#FDE0DF');
  grad.addColorStop(0.52, '#F29EB8');
  grad.addColorStop(0.84, '#DE6992');
  grad.addColorStop(1, '#C44577');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 512);

  // Soft longitudinal translucent botanical veins radiating from base to tip
  for (let i = -8; i <= 8; i++) {
    const offset = i / 8;
    ctx.strokeStyle =
      i === 0 ? 'rgba(255, 245, 224, 0.55)' : 'rgba(255, 232, 240, 0.26)';
    ctx.lineWidth = i === 0 ? 3.5 : 1.8;
    ctx.beginPath();
    ctx.moveTo(128 + offset * 30, 512);
    ctx.bezierCurveTo(
      128 + offset * 118,
      340,
      128 + offset * 105,
      170,
      128 + offset * 14,
      0,
    );
    ctx.stroke();
  }

  // Warm subsurface glow near base
  const glow = ctx.createRadialGradient(128, 470, 8, 128, 450, 175);
  glow.addColorStop(0, 'rgba(255, 238, 170, 0.72)');
  glow.addColorStop(1, 'rgba(255, 238, 170, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, 256, 512);

  return finalizeColorTexture(canvas);
}

/** Veined organic lotus lily pad texture with golden-emerald rim. */
export function createLilyPadTexture(): CanvasTexture {
  const [canvas, ctx] = makeCanvas(256, 256);
  ctx.translate(128, 128);
  const grad = ctx.createRadialGradient(0, 0, 6, 0, 0, 124);
  grad.addColorStop(0, '#2B8366');
  grad.addColorStop(0.45, '#175E49');
  grad.addColorStop(0.85, '#0F4335');
  grad.addColorStop(1, '#2E7D60');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(0, 0, 122, 0.14, Math.PI * 2 - 0.14);
  ctx.lineTo(0, 0);
  ctx.closePath();
  ctx.fill();

  // Radial botanical veins
  ctx.strokeStyle = 'rgba(130, 214, 178, 0.34)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 18; i++) {
    const a = 0.2 + (i / 17) * (Math.PI * 2 - 0.4);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(Math.cos(a + 0.08) * 60, Math.sin(a + 0.08) * 60, Math.cos(a) * 116, Math.sin(a) * 116);
    ctx.stroke();
  }

  return finalizeColorTexture(canvas);
}

/** Inlaid royal palace marble floor tiles with subtle veining and gold geometric borders. */
export function createPalaceMarbleTexture(
  tileHex = '#E9DDD0',
  veinHex = '#CBB9A6',
  inlayHex: string = colors.gold,
  repeatCount = 6,
): CanvasTexture {
  const [canvas, ctx] = makeCanvas(512, 512);
  ctx.fillStyle = tileHex;
  ctx.fillRect(0, 0, 512, 512);

  // Checkerboard subtle tone variation (2x2 tiles per repeat)
  ctx.fillStyle = 'rgba(20, 14, 24, 0.08)';
  ctx.fillRect(256, 0, 256, 256);
  ctx.fillRect(0, 256, 256, 256);

  // Subtle organic marble veins
  let s = 8821;
  const rand = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
  ctx.strokeStyle = veinHex;
  ctx.lineWidth = 1.6;
  ctx.globalAlpha = 0.32;
  for (let i = 0; i < 36; i++) {
    const x0 = rand() * 512;
    const y0 = rand() * 512;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.bezierCurveTo(
      x0 + (rand() - 0.5) * 180,
      y0 + (rand() - 0.5) * 140,
      x0 + (rand() - 0.5) * 180,
      y0 + (rand() - 0.5) * 140,
      x0 + (rand() - 0.5) * 240,
      y0 + (rand() - 0.5) * 180,
    );
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Tile grout & gold inlay border lines
  ctx.strokeStyle = 'rgba(42, 28, 22, 0.35)';
  ctx.lineWidth = 3;
  ctx.strokeRect(1.5, 1.5, 253, 253);
  ctx.strokeRect(257.5, 1.5, 253, 253);
  ctx.strokeRect(1.5, 257.5, 253, 253);
  ctx.strokeRect(257.5, 257.5, 253, 253);

  ctx.strokeStyle = inlayHex;
  ctx.globalAlpha = 0.58;
  ctx.lineWidth = 2;
  for (const [ox, oy] of [
    [0, 0],
    [256, 0],
    [0, 256],
    [256, 256],
  ]) {
    ctx.strokeRect(ox + 14, oy + 14, 228, 228);
    // Center inlaid brass/gold lotus diamond medallion
    ctx.beginPath();
    ctx.moveTo(ox + 128, oy + 86);
    ctx.lineTo(ox + 170, oy + 128);
    ctx.lineTo(ox + 128, oy + 170);
    ctx.lineTo(ox + 86, oy + 128);
    ctx.closePath();
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  const tex = finalizeColorTexture(canvas, true);
  tex.repeat.set(repeatCount, repeatCount);
  return tex;
}

/** Rich crimson royal velvet Darbar carpet with woven gold zari lotus borders. */
export function createRoyalCarpetTexture(): CanvasTexture {
  const [canvas, ctx] = makeCanvas(512, 1024);

  const baseGrad = ctx.createLinearGradient(0, 0, 512, 0);
  baseGrad.addColorStop(0, '#4B0E1D');
  baseGrad.addColorStop(0.18, '#6F1429');
  baseGrad.addColorStop(0.5, '#821A32');
  baseGrad.addColorStop(0.82, '#6F1429');
  baseGrad.addColorStop(1, '#4B0E1D');
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, 512, 1024);

  // Gold zari outer borders
  ctx.fillStyle = colors.gold;
  ctx.fillRect(16, 0, 14, 1024);
  ctx.fillRect(482, 0, 14, 1024);
  ctx.fillStyle = colors.marigold;
  ctx.fillRect(42, 0, 6, 1024);
  ctx.fillRect(464, 0, 6, 1024);

  // Woven paisley/diamond motif along borders & central medallions
  ctx.strokeStyle = 'rgba(242, 198, 96, 0.55)';
  ctx.lineWidth = 3;
  for (let y = 32; y < 1024; y += 64) {
    ctx.beginPath();
    ctx.moveTo(64, y);
    ctx.lineTo(80, y - 16);
    ctx.lineTo(96, y);
    ctx.lineTo(80, y + 16);
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(416, y);
    ctx.lineTo(432, y - 16);
    ctx.lineTo(448, y);
    ctx.lineTo(432, y + 16);
    ctx.closePath();
    ctx.stroke();
  }

  for (let y = 128; y < 1024; y += 256) {
    ctx.save();
    ctx.translate(256, y);
    ctx.strokeStyle = 'rgba(212, 166, 64, 0.42)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, -76);
    ctx.lineTo(68, 0);
    ctx.lineTo(0, 76);
    ctx.lineTo(-68, 0);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, 26, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  const tex = finalizeColorTexture(canvas, true);
  tex.repeat.set(1, 2);
  return tex;
}

/** Carved Indian palace wall panel with glowing scalloped jali arched alcoves. */
export function createPalaceWallTexture(
  wallHex = '#3D1E2B',
  archGlowHex = '#F6B86C',
  archCount = 3,
): CanvasTexture {
  const [canvas, ctx] = makeCanvas(1024, 512);
  const bg = ctx.createLinearGradient(0, 0, 0, 512);
  bg.addColorStop(0, '#1B0D14');
  bg.addColorStop(0.28, wallHex);
  bg.addColorStop(1, '#241119');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 1024, 512);

  // Horizontal carved palace cornice bands
  ctx.fillStyle = 'rgba(212, 166, 64, 0.45)';
  ctx.fillRect(0, 26, 1024, 8);
  ctx.fillRect(0, 44, 1024, 3);
  ctx.fillRect(0, 466, 1024, 10);

  // Glowing scalloped Mughal/Maratha arched jali alcoves
  const slotW = 1024 / archCount;
  for (let i = 0; i < archCount; i++) {
    const cx = slotW * (i + 0.5);
    const halfW = slotW * 0.34;
    const baseY = 445;
    const springY = 230;
    const apexY = 92;

    // Warm candlelight glow inside the arched alcove
    const glow = ctx.createRadialGradient(cx, 310, 16, cx, 290, halfW * 1.4);
    glow.addColorStop(0, archGlowHex);
    glow.addColorStop(0.55, 'rgba(242, 140, 40, 0.45)');
    glow.addColorStop(1, 'rgba(36, 17, 25, 0.05)');

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx - halfW, baseY);
    ctx.lineTo(cx - halfW, springY);
    ctx.quadraticCurveTo(cx - halfW, apexY + 35, cx, apexY);
    ctx.quadraticCurveTo(cx + halfW, apexY + 35, cx + halfW, springY);
    ctx.lineTo(cx + halfW, baseY);
    ctx.closePath();
    ctx.fillStyle = glow;
    ctx.fill();

    // Intricate carved jali lattice lines inside arch
    ctx.clip();
    ctx.strokeStyle = 'rgba(48, 22, 28, 0.52)';
    ctx.lineWidth = 3;
    for (let d = -400; d < 600; d += 26) {
      ctx.beginPath();
      ctx.moveTo(cx - halfW + d, apexY);
      ctx.lineTo(cx - halfW + d + 260, baseY);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx + halfW - d, apexY);
      ctx.lineTo(cx + halfW - d - 260, baseY);
      ctx.stroke();
    }
    ctx.restore();

    // Gilded cusped arch trim
    ctx.strokeStyle = colors.gold;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(cx - halfW, baseY);
    ctx.lineTo(cx - halfW, springY);
    ctx.quadraticCurveTo(cx - halfW, apexY + 35, cx, apexY);
    ctx.quadraticCurveTo(cx + halfW, apexY + 35, cx + halfW, springY);
    ctx.lineTo(cx + halfW, baseY);
    ctx.stroke();

    // Inner gold outline
    ctx.strokeStyle = 'rgba(255, 240, 200, 0.45)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - halfW + 10, baseY);
    ctx.lineTo(cx - halfW + 10, springY);
    ctx.quadraticCurveTo(cx - halfW + 10, apexY + 46, cx, apexY + 14);
    ctx.quadraticCurveTo(cx + halfW - 10, apexY + 46, cx + halfW - 10, springY);
    ctx.lineTo(cx + halfW - 10, baseY);
    ctx.stroke();
  }

  return finalizeColorTexture(canvas);
}

export interface NormalizedCrop {
  /** Left offset in upright portrait coordinates [0..1]. */
  x: number;
  /** Top offset in upright portrait coordinates [0..1]. */
  y: number;
  /** Width fraction [0..1]. */
  w: number;
  /** Height fraction [0..1]. */
  h: number;
}

/**
 * Loads a local high-resolution JPEG into a GPU-safe CanvasTexture with automatic EXIF
 * portrait orientation normalization and exact normalized cropping so real faces are crisp,
 * upright, and never stretched or oversized for WebGL.
 */
export function createCroppedPhotoTexture(
  src: string,
  crop: NormalizedCrop,
  outWidth = 640,
  outHeight = 960,
): CanvasTexture {
  const [canvas, ctx] = makeCanvas(outWidth, outHeight);

  // Elegant warm gold-velvet shimmer while the high-res photo streams in
  const placeholder = ctx.createRadialGradient(
    outWidth * 0.5,
    outHeight * 0.42,
    24,
    outWidth * 0.5,
    outHeight * 0.5,
    outHeight * 0.65,
  );
  placeholder.addColorStop(0, '#3B2820');
  placeholder.addColorStop(0.6, '#1D1422');
  placeholder.addColorStop(1, '#0F0E1B');
  ctx.fillStyle = placeholder;
  ctx.fillRect(0, 0, outWidth, outHeight);

  const tex = finalizeColorTexture(canvas);
  tex.generateMipmaps = true;

  const img = new Image();
  img.decoding = 'async';
  img.onload = () => {
    const nw = img.naturalWidth;
    const nh = img.naturalHeight;
    if (!nw || !nh) return;

    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    if (nw > nh) {
      // Browser did not apply EXIF orientation 8 (lower-left): normalize upright by rotating -90 deg CCW
      const uprightW = nh;
      const uprightH = nw;
      const tmp = document.createElement('canvas');
      const maxEdge = 1536;
      const scale = Math.min(1, maxEdge / Math.max(uprightW, uprightH));
      const tw = Math.round(uprightW * scale);
      const th = Math.round(uprightH * scale);
      tmp.width = tw;
      tmp.height = th;
      const tctx = tmp.getContext('2d')!;
      tctx.imageSmoothingEnabled = true;
      tctx.imageSmoothingQuality = 'high';
      tctx.translate(0, th);
      tctx.rotate(-Math.PI / 2);
      tctx.drawImage(img, 0, 0, th, tw);

      ctx.drawImage(
        tmp,
        crop.x * tw,
        crop.y * th,
        crop.w * tw,
        crop.h * th,
        0,
        0,
        outWidth,
        outHeight,
      );
    } else {
      // Browser already applied EXIF orientation -> image is upright portrait
      ctx.drawImage(
        img,
        crop.x * nw,
        crop.y * nh,
        crop.w * nw,
        crop.h * nh,
        0,
        0,
        outWidth,
        outHeight,
      );
    }

    // Subtle warm candlelight glaze along outer bottom/top border for seamless 3D integration
    const glaze = ctx.createRadialGradient(
      outWidth * 0.5,
      outHeight * 0.45,
      outWidth * 0.35,
      outWidth * 0.5,
      outHeight * 0.5,
      outHeight * 0.65,
    );
    glaze.addColorStop(0, 'rgba(255, 240, 210, 0)');
    glaze.addColorStop(1, 'rgba(18, 10, 14, 0.24)');
    ctx.fillStyle = glaze;
    ctx.fillRect(0, 0, outWidth, outHeight);

    ctx.restore();
    tex.needsUpdate = true;
  };
  img.src = src;

  return tex;
}

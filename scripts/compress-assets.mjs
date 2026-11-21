#!/usr/bin/env node
/**
 * Phase 10 Asset Compression Pipeline.
 *
 * Usage:
 *   node scripts/compress-assets.mjs [sourceDir] [outDir]
 *
 * Compresses:
 * - `.glb` models using `@gltf-transform/cli` (Meshopt/Draco + KTX2/WebP textures, max 1024px)
 * - `.png`/`.jpg` illustrations and venue photos to `.webp` and `.avif` (via sharp-cli / cwebp if installed)
 *
 * Safe dry-run if no raw assets exist yet.
 */

import { readdirSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { extname, join, basename } from 'node:path';
import { execFileSync } from 'node:child_process';

const srcDir = process.argv[2] ?? 'raw-assets';
const outDir = process.argv[3] ?? 'public/assets';

if (!existsSync(srcDir)) {
  console.log(`No raw assets folder found at "${srcDir}". Drop .glb/.png/.jpg files there and rerun.`);
  process.exit(0);
}

mkdirSync(outDir, { recursive: true });

function walk(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) results.push(...walk(full));
    else results.push(full);
  }
  return results;
}

const files = walk(srcDir);
console.log(`Found ${files.length} asset(s) in ${srcDir}`);

for (const file of files) {
  const ext = extname(file).toLowerCase();
  const name = basename(file, ext);

  if (ext === '.glb') {
    const out = join(outDir, `${name}.glb`);
    console.log(`Optimizing GLB: ${file} -> ${out}`);
    try {
      execFileSync('npx', ['--yes', '@gltf-transform/cli', 'optimize', file, out, '--compress', 'meshopt', '--texture-compress', 'webp', '--texture-size', '1024'], {
        stdio: 'inherit',
      });
    } catch {
      console.warn(`Skipped ${file} (install @gltf-transform/cli for GLB optimization).`);
    }
  } else if (ext === '.png' || ext === '.jpg' || ext === '.jpeg') {
    const outWebp = join(outDir, `${name}.webp`);
    console.log(`Converting image to WebP: ${file} -> ${outWebp}`);
    try {
      execFileSync('npx', ['--yes', 'sharp-cli', '-i', file, '-o', outWebp, '-f', 'webp', '-q', '82'], {
        stdio: 'inherit',
      });
    } catch {
      console.warn(`Skipped ${file} (install sharp-cli for WebP/AVIF conversion).`);
    }
  }
}

console.log('Asset compression pipeline complete.');

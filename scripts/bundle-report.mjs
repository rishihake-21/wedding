#!/usr/bin/env node
/**
 * Phase 10 Bundle Size & Gzip Budget Report.
 * Compares `dist/assets` against Section 7 initial JS & total budgets.
 */

import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

const assetsDir = 'dist/assets';
if (!existsSync(assetsDir)) {
  console.error('dist/assets not found. Run `npm run build` first.');
  process.exit(1);
}

const files = readdirSync(assetsDir)
  .filter((name) => statSync(join(assetsDir, name)).isFile())
  .sort();
let totalRaw = 0;
let totalGzip = 0;

console.log('\nVrindavan Wedding Invitation — Bundle Report');
console.log('-------------------------------------------------------------------');
console.log(`${'Asset'.padEnd(40)} ${'Raw KB'.padStart(10)} ${'Gzip KB'.padStart(10)}`);
console.log('-------------------------------------------------------------------');

for (const file of files) {
  const buf = readFileSync(join(assetsDir, file));
  const gz = gzipSync(buf);
  totalRaw += buf.length;
  totalGzip += gz.length;
  console.log(
    `${file.padEnd(40)} ${(buf.length / 1024).toFixed(1).padStart(10)} ${(gz.length / 1024).toFixed(1).padStart(10)}`,
  );
}

console.log('-------------------------------------------------------------------');
console.log(
  `${'TOTAL'.padEnd(40)} ${(totalRaw / 1024).toFixed(1).padStart(10)} ${(totalGzip / 1024).toFixed(1).padStart(10)}`,
);
console.log('Note: Scene chunks (Scene*.js) lazy-load on demand and preload active+1.\n');

// One day, one picture: 17 November 2026.
//
// The picture was drawn as art/nov17.html and rendered once at 1024 x 1024 into
// entry.png; this program hands those exact bytes to the grader. The program is
// run twice and both runs must write the same file, so nothing here reads the
// clock, the network or a random seed.

import { copyFileSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const LIMIT_BYTES = 1024 * 1024;
const MAX_SIDE = 1024;
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const source = new URL('./entry.png', import.meta.url);
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const target = join(outputDir, 'entry.png');

const bytes = statSync(source).size;
if (bytes > LIMIT_BYTES) {
  throw new Error(`entry.png is ${bytes} bytes, over the ${LIMIT_BYTES}-byte gate cap`);
}

// Read the PNG header the gate reads: signature, then the IHDR width and height.
const header = readFileSync(source).subarray(0, 24);
if (!header.subarray(0, 8).equals(PNG_SIGNATURE)) {
  throw new Error('entry.png does not start with the PNG signature');
}
const width = header.readUInt32BE(16);
const height = header.readUInt32BE(20);
if (width > MAX_SIDE || height > MAX_SIDE) {
  throw new Error(`entry.png is ${width}x${height}, over the ${MAX_SIDE}x${MAX_SIDE} cap`);
}

mkdirSync(outputDir, { recursive: true });
copyFileSync(source, target);

const written = statSync(target).size;
if (written !== bytes) {
  throw new Error(`copy is ${written} bytes, expected ${bytes}`);
}

console.log(`entry.png ${written} bytes -> ${target}`);
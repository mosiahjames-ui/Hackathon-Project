import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";

// Generate a solid-color square PNG with a simple "W" glyph block pattern.
function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = c & 1 ? (c >>> 1) ^ 0xedb88320 : c >>> 1;
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

function makePng(size, rgb) {
  const [r, g, b] = rgb;
  const raw = Buffer.alloc((size * 3 + 1) * size);
  for (let y = 0; y < size; y++) {
    const rowStart = y * (size * 3 + 1);
    raw[rowStart] = 0; // filter: none
    for (let x = 0; x < size; x++) {
      // draw a lighter border ring for a bit of visual interest
      const edge = x < size * 0.12 || x > size * 0.88 || y < size * 0.12 || y > size * 0.88;
      const px = rowStart + 1 + x * 3;
      if (edge) {
        raw[px] = Math.min(255, r + 40);
        raw[px + 1] = Math.min(255, g + 40);
        raw[px + 2] = Math.min(255, b + 40);
      } else {
        raw[px] = r;
        raw[px + 1] = g;
        raw[px + 2] = b;
      }
    }
  }

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type: truecolor
  const idat = deflateSync(raw);

  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

mkdirSync(new URL("../public/icons/", import.meta.url), { recursive: true });
const brand = [37, 99, 235]; // #2563eb
for (const size of [192, 512]) {
  const png = makePng(size, brand);
  const out = new URL(`../public/icons/icon-${size}.png`, import.meta.url);
  writeFileSync(out, png);
  console.log(`wrote icon-${size}.png (${png.length} bytes)`);
}

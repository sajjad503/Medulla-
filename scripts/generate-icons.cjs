const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    let byte = buf[i];
    for (let j = 0; j < 8; j++) {
      let bit = (byte ^ crc) & 1;
      crc = (crc >>> 1) ^ (bit ? 0xedb88320 : 0);
      byte >>>= 1;
    }
  }
  return (crc ^ -1) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  const toCrc = Buffer.concat([typeBuf, data]);
  crcBuf.writeUInt32BE(crc32(toCrc), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function createMentoraPng(size, isMaskable = false) {
  const width = size;
  const height = size;
  const rowLen = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowLen);

  const cx = width / 2;
  const cy = height / 2;
  const rBg = isMaskable ? width * 0.49 : width * 0.44;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowLen;
    rawData[rowOffset] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Default outer transparent (or dark for maskable)
      let r = 12, g = 29, b = 63, a = 255; // #0C1D3F

      // Gradient background
      const gradFactor = (x + y) / (width + height);
      r = Math.round(8 + gradFactor * 13);
      g = Math.round(18 + gradFactor * 24);
      b = Math.round(41 + gradFactor * 45);

      // Gold border ring
      if (Math.abs(dist - rBg) < (size > 200 ? 5 : 2)) {
        r = 230; g = 194; b = 135; // #E6C287
      }

      // Draw stylized 'M' geometry in center
      const nx = (x - cx) / (width * 0.35); // -1 to 1 normalized
      const ny = (y - cy) / (height * 0.35); // -1 to 1 normalized

      // Left bar
      const onLeftBar = (nx >= -0.7 && nx <= -0.45 && ny >= -0.55 && ny <= 0.65);
      // Right bar
      const onRightBar = (nx >= 0.45 && nx <= 0.7 && ny >= -0.55 && ny <= 0.65);
      // Left diagonal
      const onLeftDiag = (nx >= -0.45 && nx <= 0.0 && Math.abs(ny - (nx * 1.5 + 0.2)) < 0.22 && ny >= -0.55 && ny <= 0.45);
      // Right diagonal
      const onRightDiag = (nx >= 0.0 && nx <= 0.45 && Math.abs(ny - (-nx * 1.5 + 0.2)) < 0.22 && ny >= -0.55 && ny <= 0.45);
      // Top crest diamond
      const onDiamond = (Math.abs(nx) + Math.abs(ny + 0.8) < 0.18);

      if (onLeftBar || onRightBar || onLeftDiag || onRightDiag || onDiamond) {
        // Gold gradient
        const goldFactor = (nx + ny + 1.5) / 3;
        r = Math.round(200 + goldFactor * 45);
        g = Math.round(168 + goldFactor * 45);
        b = Math.round(128 + goldFactor * 20);
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const idatData = zlib.deflateSync(rawData);
  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', idatData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

const pubDir = path.resolve(process.cwd(), 'public');
if (!fs.existsSync(pubDir)) fs.mkdirSync(pubDir, { recursive: true });

fs.writeFileSync(path.join(pubDir, 'pwa-192x192.png'), createMentoraPng(192));
fs.writeFileSync(path.join(pubDir, 'pwa-512x512.png'), createMentoraPng(512));
fs.writeFileSync(path.join(pubDir, 'pwa-maskable-512x512.png'), createMentoraPng(512, true));
fs.writeFileSync(path.join(pubDir, 'apple-touch-icon.png'), createMentoraPng(180));
fs.writeFileSync(path.join(pubDir, 'favicon.ico'), createMentoraPng(64));

console.log('✅ PWA PNG and Apple icons generated successfully in public/');

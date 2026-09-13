import fs from 'fs';
import zlib from 'zlib';

function createPng(width, height, bgColor, drawSymbol) {
  // RGBA buffer
  const buffer = Buffer.alloc(width * height * 4);
  const [br, bg, bb] = bgColor;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      buffer[idx] = br;
      buffer[idx + 1] = bg;
      buffer[idx + 2] = bb;
      buffer[idx + 3] = 255;
    }
  }

  if (drawSymbol) {
    drawSymbol(buffer, width, height);
  }

  // PNG scanlines: each row has 1 filter byte (0) + width*4 bytes
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowSize);

  for (let y = 0; y < height; y++) {
    rawData[y * rowSize] = 0; // Filter: None
    buffer.copy(rawData, y * rowSize + 1, y * width * 4, (y + 1) * width * 4);
  }

  const compressed = zlib.deflateSync(rawData);

  // PNG chunks
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);
    
    // CRC calculation
    let crc = 0 ^ (-1);
    const combined = Buffer.concat([typeBuf, data]);
    for (let i = 0; i < combined.length; i++) {
      crc = (crc >>> 8) ^ crcTable[(crc ^ combined[i]) & 0xff];
    }
    crc = (crc ^ (-1)) >>> 0;
    crcBuf.writeUInt32BE(crc, 0);

    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  // CRC table
  const crcTable = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = ((c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1));
    }
    crcTable[n] = c;
  }

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth: 8
  ihdr[9] = 6; // Color type: RGBA
  ihdr[10] = 0; // Compression
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // Interlace

  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

// Drawing clipboard & checkmark for field survey
function drawBadge(buf, w, h) {
  const pad = Math.floor(w * 0.18);
  const cx = Math.floor(w / 2);
  const cy = Math.floor(h / 2);

  // Draw rounded card/clipboard in center
  for (let y = pad; y < h - pad; y++) {
    for (let x = pad; x < w - pad; x++) {
      const idx = (y * w + x) * 4;
      buf[idx] = 255;
      buf[idx + 1] = 255;
      buf[idx + 2] = 255;
      buf[idx + 3] = 255;
    }
  }

  // Draw clipboard header tab
  const tabW = Math.floor(w * 0.28);
  const tabH = Math.floor(h * 0.08);
  for (let y = pad - tabH; y < pad; y++) {
    for (let x = cx - Math.floor(tabW / 2); x < cx + Math.floor(tabW / 2); x++) {
      const idx = (y * w + x) * 4;
      buf[idx] = 241;
      buf[idx + 1] = 245;
      buf[idx + 2] = 249;
      buf[idx + 3] = 255;
    }
  }

  // Draw checkmark / VKU symbol in dark blue
  const stroke = Math.max(3, Math.floor(w * 0.035));
  // Simple stylized checkmark lines
  for (let i = 0; i < Math.floor(w * 0.12); i++) {
    const x = cx - Math.floor(w * 0.14) + i;
    const y = cy + i;
    for (let sx = -stroke; sx <= stroke; sx++) {
      for (let sy = -stroke; sy <= stroke; sy++) {
        const px = x + sx;
        const py = y + sy;
        if (px >= 0 && px < w && py >= 0 && py < h) {
          const idx = (py * w + px) * 4;
          buf[idx] = 2; // #0284c7
          buf[idx + 1] = 132;
          buf[idx + 2] = 199;
          buf[idx + 3] = 255;
        }
      }
    }
  }
  for (let i = 0; i < Math.floor(w * 0.28); i++) {
    const x = cx - Math.floor(w * 0.02) + i;
    const y = cy + Math.floor(w * 0.12) - i * 1.3;
    for (let sx = -stroke; sx <= stroke; sx++) {
      for (let sy = -stroke; sy <= stroke; sy++) {
        const px = Math.floor(x + sx);
        const py = Math.floor(y + sy);
        if (px >= 0 && px < w && py >= 0 && py < h) {
          const idx = (py * w + px) * 4;
          buf[idx] = 2;
          buf[idx + 1] = 132;
          buf[idx + 2] = 199;
          buf[idx + 3] = 255;
        }
      }
    }
  }
}

if (!fs.existsSync('public')) {
  fs.mkdirSync('public', { recursive: true });
}

// VKU primary color #0284c7 -> [2, 132, 199]
const icon192 = createPng(192, 192, [2, 132, 199], drawBadge);
fs.writeFileSync('public/icon-192.png', icon192);

const icon512 = createPng(512, 512, [2, 132, 199], drawBadge);
fs.writeFileSync('public/icon-512.png', icon512);

const iconMaskable = createPng(512, 512, [2, 132, 199], drawBadge);
fs.writeFileSync('public/icon-maskable.png', iconMaskable);

fs.writeFileSync('public/apple-touch-icon.png', icon192);
fs.writeFileSync('public/favicon.ico', icon192);

console.log('Icons generated successfully in public/');

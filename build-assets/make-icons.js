// make-icons.js — Generate icon.png + icon.ico tu icon.svg cho electron-builder
// Chay: node build-assets/make-icons.js
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const pngToIco = require('png-to-ico').default;

const HERE = __dirname;
const SVG = path.join(HERE, 'icon.svg');
const OUT_PNG = path.join(HERE, 'icon.png');
const OUT_ICO = path.join(HERE, 'icon.ico');

const SIZES = [16, 24, 32, 48, 64, 128, 256];

async function main() {
  const svgBuf = fs.readFileSync(SVG);

  // 256x256 PNG
  await sharp(svgBuf, { density: 384 })
    .resize(256, 256)
    .png()
    .toFile(OUT_PNG);
  console.log('wrote', OUT_PNG);

  // Multi-size buffers cho ICO
  const buffers = [];
  for (const s of SIZES) {
    const b = await sharp(svgBuf, { density: 384 })
      .resize(s, s)
      .png()
      .toBuffer();
    buffers.push(b);
  }
  const icoBuf = await pngToIco(buffers);
  fs.writeFileSync(OUT_ICO, icoBuf);
  console.log('wrote', OUT_ICO, '(' + icoBuf.length + ' bytes,', SIZES.length, 'sizes)');
}

main().catch(e => { console.error(e); process.exit(1); });

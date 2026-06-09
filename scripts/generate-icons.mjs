import sharp from 'sharp';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');
const source = join(publicDir, 'logo-source.png');

async function loadTransparentLogo() {
  const { data, info } = await sharp(source)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (r > 235 && g > 235 && b > 235) {
      data[i + 3] = 0;
    }
  }

  return sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  });
}

const logo = await loadTransparentLogo();

const sizes = [
  ['favicon-16.png', 16],
  ['favicon-32.png', 32],
  ['pwa-192.png', 192],
  ['pwa-512.png', 512],
  ['apple-touch-icon.png', 180],
  ['logo-opt.png', 64],
  ['logo.png', 256],
];

for (const [name, size] of sizes) {
  await logo
    .clone()
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(join(publicDir, name));
  console.log(`Wrote ${name}`);
}

await logo
  .clone()
  .resize(320, 320, { fit: 'contain', background: { r: 26, g: 77, b: 46, alpha: 1 } })
  .extend({
    top: 96,
    bottom: 96,
    left: 96,
    right: 96,
    background: { r: 26, g: 77, b: 46, alpha: 1 },
  })
  .png()
  .toFile(join(publicDir, 'maskable-512.png'));
console.log('Wrote maskable-512.png');

const ogLogo = await logo
  .clone()
  .resize(420, 420, { fit: 'contain', background: { r: 26, g: 77, b: 46, alpha: 1 } })
  .png()
  .toBuffer();

await sharp({
  create: {
    width: 1200,
    height: 630,
    channels: 4,
    background: { r: 26, g: 77, b: 46, alpha: 1 },
  },
})
  .composite([{ input: ogLogo, gravity: 'centre' }])
  .png()
  .toFile(join(publicDir, 'og-image.png'));
console.log('Wrote og-image.png');

await logo
  .clone()
  .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toFile(join(publicDir, 'favicon.ico'));
console.log('Wrote favicon.ico');

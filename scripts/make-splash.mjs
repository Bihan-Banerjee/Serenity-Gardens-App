// Replaces Capacitor's default splash images with the app logo on the brand background.
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const res = 'android/app/src/main/res';
const logo = fs.readFileSync('resources/icon-only.png');

for (const dir of fs.readdirSync(res).filter((d) => d.startsWith('drawable'))) {
  const file = path.join(res, dir, 'splash.png');
  if (!fs.existsSync(file)) continue;
  const { width, height } = await sharp(file).metadata();
  const side = Math.round(Math.min(width, height) * 0.28);
  const radius = Math.round(side * 0.22);
  const mask = Buffer.from(`<svg width="${side}" height="${side}"><rect width="${side}" height="${side}" rx="${radius}"/></svg>`);
  const rounded = await sharp(logo).resize(side, side).composite([{ input: mask, blend: 'dest-in' }]).png().toBuffer();
  const out = await sharp({ create: { width, height, channels: 4, background: '#F2EDE4' } })
    .composite([{ input: rounded, gravity: 'centre' }])
    .png()
    .toBuffer();
  fs.writeFileSync(file, out);
}
console.log('splash written');

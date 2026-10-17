// Generates Android launcher icons from resources/*.svg. Run: node scripts/make-icons.mjs
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const res = 'android/app/src/main/res';
const BG = '#1A3D1C';
const densities = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };

const fgSvg = fs.readFileSync('resources/icon-foreground.svg');
const bgSvg = fs.readFileSync('resources/icon-background.svg');

const render = (svg, size) => sharp(svg, { density: 384 }).resize(size, size).png().toBuffer();

for (const [name, scale] of Object.entries(densities)) {
  const dir = path.join(res, `mipmap-${name}`);
  fs.mkdirSync(dir, { recursive: true });
  for (const f of fs.readdirSync(dir)) if (f.startsWith('ic_launcher')) fs.rmSync(path.join(dir, f));

  // Legacy square and round icons (48dp)
  const size = Math.round(48 * scale);
  const square = await sharp(await render(bgSvg, size)).composite([{ input: await render(fgSvg, size) }]).png().toBuffer();
  fs.writeFileSync(path.join(dir, 'ic_launcher.png'), square);
  const mask = Buffer.from(`<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}"/></svg>`);
  fs.writeFileSync(path.join(dir, 'ic_launcher_round.png'), await sharp(square).composite([{ input: mask, blend: 'dest-in' }]).png().toBuffer());

  // Adaptive foreground (108dp canvas; artwork already sits inside the safe zone)
  fs.writeFileSync(path.join(dir, 'ic_launcher_foreground.png'), await render(fgSvg, Math.round(108 * scale)));
}

const anydpi = path.join(res, 'mipmap-anydpi-v26');
fs.mkdirSync(anydpi, { recursive: true });
const adaptive = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
`;
fs.writeFileSync(path.join(anydpi, 'ic_launcher.xml'), adaptive);
fs.writeFileSync(path.join(anydpi, 'ic_launcher_round.xml'), adaptive);

fs.writeFileSync(path.join(res, 'values/ic_launcher_background.xml'), `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">${BG}</color>
</resources>
`);
console.log('icons written');

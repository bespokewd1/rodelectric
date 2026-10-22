import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const output = new URL("../public/assets/", import.meta.url);
await mkdir(new URL("brand/", output), { recursive: true });
const icons = new URL("favicons/", output);
// This crop excludes the wordmark below the existing header logo.
const mark = await sharp(fileURLToPath(new URL("../src/assets/images/header-icon.png", import.meta.url)))
  .extract({ left: 110, top: 0, width: 710, height: 650 })
  .trim()
  .resize(512, 512, { fit: "contain", background: "#ffffff00" })
  .png()
  .toBuffer();
await writeFile(new URL("brand/rod-mark.png", output), mark);
await sharp("src/assets/images/gallery/installation/installation3.jpg")
  .rotate().resize({ width: 1200, withoutEnlargement: true }).jpeg({ quality: 85 })
  .toFile(fileURLToPath(new URL("brand/rod-at-work.jpg", output)));
const sizes = new Map([
  ["favicon-16x16.png", 16], ["favicon-32x32.png", 32], ["favicon-96x96.png", 96],
  ["apple-touch-icon.png", 180], ["mstile-150x150.png", 150],
  ["web-app-manifest-192x192.png", 192], ["web-app-manifest-512x512.png", 512],
]);
for (const [name, size] of sizes) {
  const padding = name.startsWith("web-app") ? Math.round(size * 0.14) : 0;
  const image = await sharp(mark).resize(size - padding * 2, size - padding * 2)
    .extend({ top: padding, bottom: padding, left: padding, right: padding, background: "#ffffff00" })
    .flatten({ background: "#ffffff" }).png().toBuffer();
  await writeFile(new URL(name, icons), image);
}
const icoSizes = [16, 32, 48];
const pngs = await Promise.all(icoSizes.map((size) => sharp(mark).resize(size, size).png().toBuffer()));
const header = Buffer.alloc(6 + 16 * pngs.length);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(pngs.length, 4);
let offset = header.length;
for (const [index, png] of pngs.entries()) {
  const start = 6 + index * 16;
  header[start] = header[start + 1] = icoSizes[index];
  header.writeUInt16LE(1, start + 4);
  header.writeUInt16LE(32, start + 6);
  header.writeUInt32LE(png.length, start + 8);
  header.writeUInt32LE(offset, start + 12);
  offset += png.length;
}
await writeFile(new URL("favicon.ico", icons), Buffer.concat([header, ...pngs]));
await writeFile(new URL("favicon.svg", icons), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><image width="512" height="512" href="data:image/png;base64,${mark.toString("base64")}"/></svg>\n`);
console.log("Generated Rod's brand mark, business photo, and favicon set.");

// One-off image optimization for the hero section's 4 model photos.
// Run: node scripts/optimize-hero-images.mjs
// Reads from src/assets/modelimg/, writes optimized WebP (+ JPG fallback)
// at desktop and mobile widths into src/assets/hero/.
import sharp from "sharp";
import { readdirSync, mkdirSync } from "fs";
import { join } from "path";

const SRC_DIR = join(import.meta.dirname, "../src/assets/modelimg");
const OUT_DIR = join(import.meta.dirname, "../src/assets/hero");

mkdirSync(OUT_DIR, { recursive: true });

const files = readdirSync(SRC_DIR)
  .filter((f) => /\.(png|jpe?g)$/i.test(f))
  .sort(); // filenames sort chronologically (timestamps in name) -> stable model-1..4 order

const SIZES = [
  { suffix: "", width: 2200 },
  { suffix: "-mobile", width: 1000 },
];

async function run() {
  if (files.length === 0) {
    console.error(`No source images found in ${SRC_DIR}`);
    process.exit(1);
  }

  for (let i = 0; i < files.length; i++) {
    const srcPath = join(SRC_DIR, files[i]);
    const modelNum = i + 1;
    console.log(`Processing ${files[i]} -> model-${modelNum}.*`);

    for (const size of SIZES) {
      const pipeline = () => sharp(srcPath).resize({ width: size.width, withoutEnlargement: true });

      await pipeline()
        .webp({ quality: 82 })
        .toFile(join(OUT_DIR, `model-${modelNum}${size.suffix}.webp`));

      await pipeline()
        .jpeg({ quality: 84, mozjpeg: true })
        .toFile(join(OUT_DIR, `model-${modelNum}${size.suffix}.jpg`));
    }
  }

  console.log(`\nDone. Optimized images written to ${OUT_DIR}`);
}

run();

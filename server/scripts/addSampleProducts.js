import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import Category from "../models/Category.js";
import Product from "../models/Product.js";

// Purely additive — unlike utils/seed.js, this NEVER deletes anything. It
// looks up the categories that already exist, skips any SKU that's already
// in the database (safe to re-run), and inserts new products alongside
// the current live catalog. Use this instead of `npm run seed` when you
// just want more sample inventory without wiping existing products,
// collections, reviews, or orders.

const img = (id, w = 900) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=75`;

function variantsFor(sku, colors, sizes, baseStock = 15) {
  const variants = [];
  colors.forEach((color, ci) => {
    sizes.forEach((size, si) => {
      variants.push({
        color: color.name,
        size,
        sku: `${sku}-${color.name.replace(/[^a-zA-Z]/g, "").slice(0, 3).toUpperCase()}-${size}`,
        inventory: Math.max(0, baseStock - ci * 3 - si * 2),
      });
    });
  });
  return variants;
}

const SIZES_APPAREL = ["XS", "S", "M", "L", "XL"];
const SIZES_MEN = ["S", "M", "L", "XL", "XXL"];
const SIZES_ONE = ["One Size"];

// Reuses the SAME Unsplash photo ids already proven-good in utils/seed.js,
// grouped by subject, so every new product's imagery is guaranteed to
// resolve and stay on-topic (shirt photos for new shirts, etc.) without
// having to verify brand-new, unvetted image ids.
const IMG = {
  shirt: [img("photo-1598033129183-c4f50c736f10"), img("photo-1598032895397-b9472444bf93")],
  linenTop: [img("photo-1489987707025-afc232f7ea0f"), img("photo-1485462537746-965f33f7f6a7")],
  trousers: [img("photo-1594633312681-425c7b97ccd1"), img("photo-1548624313-0396c75f65f7")],
  skirt: [img("photo-1583496661160-fb5886a13d77"), img("photo-1550614000-4895a10e1bfd")],
  dress: [img("photo-1595777457583-95e059d581b8"), img("photo-1496747611176-843222e1e57c")],
  eveningDress: [img("photo-1515372039744-b8f02a3ae446"), img("photo-1524758631624-e2822e304c36")],
  chino: [img("photo-1473966968600-fa801b869a1a"), img("photo-1473973266408-ed4e27abdd47")],
  blazer: [img("photo-1594938298603-c8148c4dae35"), img("photo-1520975954732-35dd22299614")],
  overcoat: [img("photo-1539533018447-63fcce2678e3"), img("photo-1544022613-e87ca75a784a")],
  bag: [img("photo-1548036328-c9fa89d128fa"), img("photo-1591561954557-26941169b49e")],
  belt: [img("photo-1553062407-98eeb64c6a62"), img("photo-1624222247344-550fb60583dc")],
  jewelry: [img("photo-1506630448388-4e683c67ddb0"), img("photo-1611591437281-460bfbe1220a")],
  scarf: [img("photo-1520903920243-00d872a2d1c9"), img("photo-1520006403909-838d6b92c22e")],
};

function buildNewProducts(cat) {
  return [
    // ── Women / Tops ──────────────────────────────────────────────────
    {
      name: "Striped Cotton Poplin Shirt",
      sku: "VEL-WSH-021",
      category: cat["women"]._id,
      subcategory: cat["women-tops"]._id,
      price: 75,
      shortDescription: "Crisp poplin in a soft seasonal palette.",
      description:
        "A relaxed poplin shirt with a clean point collar, cut for effortless layering. Finished with mother-of-pearl buttons.",
      images: IMG.shirt,
      colors: [
        { name: "Cornflower Blue", hex: "#6C8EBF" },
        { name: "Blush", hex: "#E8C4C4" },
        { name: "White", hex: "#FFFFFF" },
      ],
      sizes: SIZES_APPAREL,
      material: "100% cotton poplin",
      careInstructions: "Machine wash cold.",
      tags: ["shirt", "cotton", "casual"],
      isNewArrival: true,
    },
    {
      name: "Silk Blend Camisole",
      sku: "VEL-WTP-022",
      category: cat["women"]._id,
      subcategory: cat["women-tops"]._id,
      price: 65,
      shortDescription: "Fluid silk-blend cami with adjustable straps.",
      description:
        "A fluid silk-blend camisole that layers under blazers or wears alone. Adjustable straps and a bias-cut hem.",
      images: IMG.linenTop,
      colors: [
        { name: "Sage Green", hex: "#A8B79A" },
        { name: "Blush", hex: "#E8C4C4" },
        { name: "Black", hex: "#171717" },
      ],
      sizes: SIZES_APPAREL,
      material: "Silk-viscose blend",
      careInstructions: "Hand wash cold.",
      tags: ["top", "silk", "date"],
    },

    // ── Women / Trousers ─────────────────────────────────────────────
    {
      name: "High-Rise Straight Trousers",
      sku: "VEL-WTR-023",
      category: cat["women"]._id,
      subcategory: cat["women-trousers"]._id,
      price: 119,
      shortDescription: "Clean straight leg, high rise.",
      description:
        "A high-rise, straight-leg trouser in a structured twill. Sits cleanly at the waist with a tailored, uninterrupted line.",
      images: IMG.trousers,
      colors: [
        { name: "Olive", hex: "#6B7052" },
        { name: "Black", hex: "#171717" },
        { name: "Cream", hex: "#F0E9DA" },
      ],
      sizes: SIZES_APPAREL,
      material: "Cotton-twill blend",
      careInstructions: "Machine wash cold.",
      tags: ["trousers", "office", "casual"],
      isNewArrival: true,
    },
    {
      name: "Cropped Wide-Leg Trousers",
      sku: "VEL-WTR-024",
      category: cat["women"]._id,
      subcategory: cat["women-trousers"]._id,
      price: 135,
      shortDescription: "Cropped hem, fluid wide leg.",
      description:
        "A cropped, wide-leg trouser with a fluid drape and a hidden side zip. Designed to sit just above the ankle.",
      images: IMG.skirt,
      colors: [
        { name: "Burgundy", hex: "#6E2A35" },
        { name: "Navy", hex: "#2B3240" },
      ],
      sizes: SIZES_APPAREL,
      material: "Viscose-blend twill",
      careInstructions: "Dry clean only.",
      tags: ["trousers", "office"],
    },

    // ── Women / Dresses ──────────────────────────────────────────────
    {
      name: "Floral Wrap Midi Dress",
      sku: "VEL-WDR-025",
      category: cat["women"]._id,
      subcategory: cat["women-dresses"]._id,
      price: 159,
      shortDescription: "Wrap silhouette in a botanical print.",
      description:
        "A wrap-front midi dress in a soft botanical print. Self-tie waist, flutter sleeves, and a fluid, floor-skimming drape.",
      images: IMG.dress,
      colors: [
        { name: "Terracotta", hex: "#B5623A" },
        { name: "Forest Green", hex: "#2F4A3C" },
      ],
      sizes: SIZES_APPAREL,
      material: "Viscose crepe",
      careInstructions: "Hand wash cold.",
      tags: ["dress", "vacation", "wedding"],
      isNewArrival: true,
    },
    {
      name: "Ribbed Knit Bodycon Dress",
      sku: "VEL-WDR-026",
      category: cat["women"]._id,
      subcategory: cat["women-dresses"]._id,
      price: 129,
      shortDescription: "Second-skin ribbed knit, midi length.",
      description:
        "A body-skimming ribbed knit dress that falls to the midi length. Elevated enough for evening, easy enough for everyday.",
      images: IMG.eveningDress,
      colors: [
        { name: "Black", hex: "#171717" },
        { name: "Burgundy", hex: "#6E2A35" },
        { name: "Chocolate", hex: "#4A2E22" },
      ],
      sizes: SIZES_APPAREL,
      material: "Viscose-blend knit",
      careInstructions: "Hand wash cold.",
      tags: ["dress", "party", "date"],
      isBestSeller: true,
    },

    // ── Men / Shirts ─────────────────────────────────────────────────
    {
      name: "Slim Fit Linen Shirt",
      sku: "VEL-MSH-027",
      category: cat["men"]._id,
      subcategory: cat["men-shirts"]._id,
      price: 85,
      shortDescription: "Breathable linen, slim through the body.",
      description:
        "A slim-fit shirt in breathable linen with a soft, unfused collar. Built for warm-weather ease without sacrificing shape.",
      images: IMG.shirt,
      colors: [
        { name: "Sky Blue", hex: "#A9C6DE" },
        { name: "White", hex: "#FFFFFF" },
        { name: "Sage", hex: "#A8B79A" },
      ],
      sizes: SIZES_MEN,
      material: "100% linen",
      careInstructions: "Machine wash cold, hang dry.",
      tags: ["shirt", "linen", "vacation", "casual"],
      isNewArrival: true,
    },
    {
      name: "Flannel Check Shirt",
      sku: "VEL-MSH-028",
      category: cat["men"]._id,
      subcategory: cat["men-shirts"]._id,
      price: 79,
      shortDescription: "Brushed flannel in a classic check.",
      description:
        "A brushed cotton flannel shirt in a classic check, napped for extra warmth. Works layered or on its own.",
      images: IMG.shirt,
      colors: [
        { name: "Crimson Check", hex: "#8C2F2F" },
        { name: "Forest Check", hex: "#2F4A3C" },
        { name: "Navy Check", hex: "#2B3240" },
      ],
      sizes: SIZES_MEN,
      material: "Brushed cotton flannel",
      careInstructions: "Machine wash cold.",
      tags: ["shirt", "casual", "flannel"],
    },

    // ── Men / Jackets ────────────────────────────────────────────────
    {
      name: "Quilted Bomber Jacket",
      sku: "VEL-MBL-029",
      category: cat["men"]._id,
      subcategory: cat["men-jackets"]._id,
      price: 189,
      shortDescription: "Lightweight quilted shell, ribbed trims.",
      description:
        "A lightweight quilted bomber with ribbed collar, cuffs, and hem. An easy topper for transitional weather.",
      images: IMG.blazer,
      colors: [
        { name: "Olive", hex: "#6B7052" },
        { name: "Black", hex: "#171717" },
      ],
      sizes: SIZES_MEN,
      material: "Nylon shell, poly-fill",
      careInstructions: "Machine wash cold, hang dry.",
      tags: ["jacket", "casual", "outerwear"],
      isNewArrival: true,
    },
    {
      name: "Denim Trucker Jacket",
      sku: "VEL-MJK-030",
      category: cat["men"]._id,
      subcategory: cat["men-jackets"]._id,
      price: 129,
      shortDescription: "Rigid denim, classic trucker cut.",
      description:
        "A classic trucker jacket in rigid denim, built to soften and fade with wear. Chest flap pockets, button cuffs.",
      images: IMG.overcoat,
      colors: [
        { name: "Indigo Denim", hex: "#33465C" },
        { name: "Light Wash Denim", hex: "#7C93A8" },
      ],
      sizes: SIZES_MEN,
      material: "100% cotton denim",
      careInstructions: "Machine wash cold, inside out.",
      tags: ["jacket", "denim", "casual"],
      isBestSeller: true,
    },

    // ── Men / Trousers ───────────────────────────────────────────────
    {
      name: "Slim Fit Wool Trousers",
      sku: "VEL-MTR-031",
      category: cat["men"]._id,
      subcategory: cat["men-trousers"]._id,
      price: 109,
      shortDescription: "Sharp, slim-through wool trouser.",
      description:
        "A slim-through wool trouser with a flat front and clean hem break. Built for the office and beyond.",
      images: IMG.chino,
      colors: [
        { name: "Charcoal", hex: "#3A3A38" },
        { name: "Navy", hex: "#2B3240" },
      ],
      sizes: ["28", "30", "32", "34", "36"],
      material: "Wool-blend twill",
      careInstructions: "Dry clean only.",
      tags: ["trousers", "office", "wool"],
    },
    {
      name: "Cargo Utility Trousers",
      sku: "VEL-MTR-032",
      category: cat["men"]._id,
      subcategory: cat["men-trousers"]._id,
      price: 99,
      shortDescription: "Utility pockets, relaxed taper.",
      description:
        "A relaxed, tapered cargo trouser in washed cotton with functional utility pockets and an adjustable waist.",
      images: IMG.chino,
      colors: [
        { name: "Olive", hex: "#6B7052" },
        { name: "Black", hex: "#171717" },
        { name: "Sand", hex: "#C9B48C" },
      ],
      sizes: ["28", "30", "32", "34", "36"],
      material: "Washed cotton twill",
      careInstructions: "Machine wash cold.",
      tags: ["trousers", "casual", "streetwear"],
      isNewArrival: true,
    },

    // ── Accessories / Bags ───────────────────────────────────────────
    {
      name: "Mini Leather Shoulder Bag",
      sku: "VEL-ABG-033",
      category: cat["accessories"]._id,
      subcategory: cat["accessories-bags"]._id,
      price: 179,
      shortDescription: "Compact full-grain leather shoulder bag.",
      description:
        "A compact shoulder bag in full-grain leather with an adjustable, detachable strap. Sized for the essentials.",
      images: IMG.bag,
      colors: [
        { name: "Burgundy", hex: "#6E2A35" },
        { name: "Black", hex: "#171717" },
        { name: "Tan", hex: "#C2A278" },
      ],
      sizes: SIZES_ONE,
      material: "Full-grain leather",
      careInstructions: "Wipe clean, store in dust bag.",
      tags: ["bag", "leather", "date", "party"],
      isNewArrival: true,
    },
    {
      name: "Canvas & Leather Backpack",
      sku: "VEL-ABG-034",
      category: cat["accessories"]._id,
      subcategory: cat["accessories-bags"]._id,
      price: 199,
      shortDescription: "Durable canvas, leather trims.",
      description:
        "A durable canvas backpack with leather trims and a padded laptop sleeve. Built for daily commuting and travel.",
      images: IMG.bag,
      colors: [
        { name: "Olive Canvas", hex: "#6B7052" },
        { name: "Black", hex: "#171717" },
      ],
      sizes: SIZES_ONE,
      material: "Canvas, leather trim",
      careInstructions: "Spot clean.",
      tags: ["bag", "backpack", "casual"],
      isBestSeller: true,
    },

    // ── Accessories / Belts ──────────────────────────────────────────
    {
      name: "Reversible Leather Belt",
      sku: "VEL-ABL-035",
      category: cat["accessories"]._id,
      subcategory: cat["accessories-belts"]._id,
      price: 65,
      shortDescription: "Two colors in one, reversible buckle.",
      description:
        "A reversible belt with a rotating buckle — flip it for a second color option. Two belts in one.",
      images: IMG.belt,
      colors: [
        { name: "Black", hex: "#171717" },
        { name: "Cognac", hex: "#8A5A3B" },
      ],
      sizes: ["S", "M", "L"],
      material: "Leather, brass hardware",
      careInstructions: "Wipe clean.",
      tags: ["belt", "leather", "office"],
    },

    // ── Accessories / Jewelry ────────────────────────────────────────
    {
      name: "Beaded Gemstone Bracelet",
      sku: "VEL-AJW-036",
      category: cat["accessories"]._id,
      subcategory: cat["accessories-jewelry"]._id,
      price: 45,
      shortDescription: "Natural stone beads, elastic fit.",
      description:
        "A beaded bracelet in natural gemstones on a stretch cord. Designed to be worn solo or stacked.",
      images: IMG.jewelry,
      colors: [
        { name: "Turquoise", hex: "#3FA9A0" },
        { name: "Rose Quartz", hex: "#E8B4B8" },
        { name: "Onyx", hex: "#1C1C1C" },
      ],
      sizes: SIZES_ONE,
      material: "Natural gemstone, elastic cord",
      careInstructions: "Avoid contact with water.",
      tags: ["jewelry", "bracelet", "casual"],
      isNewArrival: true,
    },
    {
      name: "Statement Hoop Earrings",
      sku: "VEL-AJW-037",
      category: cat["accessories"]._id,
      subcategory: cat["accessories-jewelry"]._id,
      price: 39,
      shortDescription: "Lightweight oversized hoops.",
      description:
        "Lightweight oversized hoops in a polished finish. An easy way to dress up any outfit.",
      images: IMG.jewelry,
      colors: [
        { name: "Gold", hex: "#C9A24B" },
        { name: "Silver", hex: "#C7C7C7" },
      ],
      sizes: SIZES_ONE,
      material: "14k gold vermeil / rhodium-plated",
      careInstructions: "Avoid contact with perfume and water.",
      tags: ["jewelry", "earrings", "party", "date"],
    },

    // ── Accessories / Scarves ────────────────────────────────────────
    {
      name: "Silk Printed Scarf",
      sku: "VEL-AAC-038",
      category: cat["accessories"]._id,
      subcategory: cat["accessories-belts"]._id,
      price: 55,
      shortDescription: "Hand-rolled edges, silk twill print.",
      description:
        "A silk twill scarf with hand-rolled edges, printed in a botanical motif. Wear at the neck or knotted on a bag.",
      images: IMG.scarf,
      colors: [
        { name: "Emerald Print", hex: "#2E6F5E" },
        { name: "Blush Print", hex: "#E8C4C4" },
      ],
      sizes: SIZES_ONE,
      material: "100% silk twill",
      careInstructions: "Dry clean only.",
      tags: ["scarf", "silk", "accessories"],
      isNewArrival: true,
    },
  ];
}

async function run() {
  await connectDB();

  const categories = await Category.find().lean();
  const bySlug = Object.fromEntries(categories.map((c) => [c.slug, c]));

  const requiredSlugs = [
    "women",
    "women-tops",
    "women-trousers",
    "women-dresses",
    "men",
    "men-shirts",
    "men-jackets",
    "men-trousers",
    "accessories",
    "accessories-bags",
    "accessories-belts",
    "accessories-jewelry",
  ];
  const missing = requiredSlugs.filter((slug) => !bySlug[slug]);
  if (missing.length) {
    console.error("Missing expected categories, aborting:", missing.join(", "));
    await mongoose.disconnect();
    process.exit(1);
  }

  const candidates = buildNewProducts(bySlug);
  const existingSkus = new Set((await Product.distinct("sku")).map((s) => s.toUpperCase()));
  const toInsert = candidates.filter((p) => !existingSkus.has(p.sku.toUpperCase()));
  const skipped = candidates.length - toInsert.length;

  if (!toInsert.length) {
    console.log("Nothing to add — all sample SKUs already exist.");
    await mongoose.disconnect();
    process.exit(0);
  }

  const docs = toInsert.map((item) => {
    const variants = variantsFor(item.sku, item.colors, item.sizes);
    const images = item.images.map((url, i) => ({ url, isPrimary: i === 0 }));
    return { ...item, images, variants };
  });

  const inserted = await Product.insertMany(docs);
  console.log(`Inserted ${inserted.length} new products${skipped ? ` (skipped ${skipped} already-existing SKUs)` : ""}.`);
  inserted.forEach((p) => console.log(`  - ${p.name} (${p.sku})`));

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error("addSampleProducts failed:", err);
  process.exit(1);
});

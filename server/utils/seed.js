import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";
import Category from "../models/Category.js";
import Collection from "../models/Collection.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Review from "../models/Review.js";
import Coupon from "../models/Coupon.js";
import { recalculateProductRating } from "../services/reviewRatingService.js";

const img = (id, w = 900) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=75`;

async function seedCategories() {
  await Category.deleteMany({});

  const top = await Category.insertMany([
    { name: "Women", slug: "women", sortOrder: 0 },
    { name: "Men", slug: "men", sortOrder: 1 },
    { name: "Accessories", slug: "accessories", sortOrder: 2 },
  ]);
  const [women, men, accessories] = top;

  const sub = await Category.insertMany([
    { name: "Dresses", slug: "women-dresses", parent: women._id, sortOrder: 0 },
    { name: "Tops", slug: "women-tops", parent: women._id, sortOrder: 1 },
    { name: "Trousers", slug: "women-trousers", parent: women._id, sortOrder: 2 },
    { name: "Shirts", slug: "men-shirts", parent: men._id, sortOrder: 0 },
    { name: "Jackets", slug: "men-jackets", parent: men._id, sortOrder: 1 },
    { name: "Trousers", slug: "men-trousers", parent: men._id, sortOrder: 2 },
    { name: "Bags", slug: "accessories-bags", parent: accessories._id, sortOrder: 0 },
    { name: "Belts", slug: "accessories-belts", parent: accessories._id, sortOrder: 1 },
    { name: "Jewelry", slug: "accessories-jewelry", parent: accessories._id, sortOrder: 2 },
  ]);

  const bySlug = Object.fromEntries([...top, ...sub].map((c) => [c.slug, c]));
  return bySlug;
}

function variantsFor(sku, colors, sizes, baseStock = 15) {
  const variants = [];
  colors.forEach((color, ci) => {
    sizes.forEach((size, si) => {
      variants.push({
        color: color.name,
        size,
        sku: `${sku}-${color.name.slice(0, 3).toUpperCase()}-${size}`,
        inventory: Math.max(0, baseStock - ci * 3 - si * 2),
      });
    });
  });
  return variants;
}

const SIZES_APPAREL = ["XS", "S", "M", "L", "XL"];
const SIZES_MEN = ["S", "M", "L", "XL", "XXL"];
const SIZES_ONE = ["One Size"];

function buildProducts(cat) {
  const items = [
    {
      name: "Oversized Linen Shirt",
      sku: "VEL-WSH-001",
      category: cat["women"]._id,
      subcategory: cat["women-tops"]._id,
      price: 89,
      shortDescription: "Relaxed, breathable European linen.",
      description:
        "A relaxed, breathable silhouette cut from pure European linen. Designed to drape effortlessly, with dropped shoulders and a soft point collar.",
      images: [img("photo-1489987707025-afc232f7ea0f"), img("photo-1485462537746-965f33f7f6a7")],
      colors: [{ name: "Ecru", hex: "#EDE7DA" }, { name: "Black", hex: "#171717" }],
      sizes: SIZES_APPAREL,
      material: "100% European linen",
      careInstructions: "Machine wash cold, hang dry, cool iron if needed.",
      tags: ["shirt", "linen", "summer"],
      isNewArrival: true,
    },
    {
      name: "Relaxed Wool Trousers",
      sku: "VEL-WTR-002",
      category: cat["women"]._id,
      subcategory: cat["women-trousers"]._id,
      price: 129,
      shortDescription: "Wide-leg Italian wool-blend trousers.",
      description:
        "Wide-leg trousers tailored from Italian wool blend. A fluid drape, deep front pleats, and a high rise create an elongated, polished line.",
      images: [img("photo-1594633312681-425c7b97ccd1"), img("photo-1548624313-0396c75f65f7")],
      colors: [{ name: "Camel", hex: "#B89B72" }, { name: "Charcoal", hex: "#3A3A38" }],
      sizes: SIZES_APPAREL,
      material: "70% wool, 30% viscose",
      careInstructions: "Dry clean only.",
      tags: ["trousers", "wool"],
      isNewArrival: true,
      isBestSeller: true,
    },
    {
      name: "Minimal Cotton Dress",
      sku: "VEL-WDR-003",
      category: cat["women"]._id,
      subcategory: cat["women-dresses"]._id,
      price: 149,
      shortDescription: "Column silhouette in heavyweight cotton poplin.",
      description:
        "A column silhouette in heavyweight cotton poplin. Clean seaming and a covered-button placket keep the design pared-back and considered.",
      images: [img("photo-1595777457583-95e059d581b8"), img("photo-1496747611176-843222e1e57c")],
      colors: [{ name: "Ivory", hex: "#F3EFE6" }, { name: "Clay", hex: "#A97B5A" }],
      sizes: SIZES_APPAREL,
      material: "100% cotton poplin",
      careInstructions: "Machine wash cold, tumble dry low.",
      tags: ["dress", "cotton"],
      isBestSeller: true,
    },
    {
      name: "Structured Blazer",
      sku: "VEL-WBL-004",
      category: cat["women"]._id,
      subcategory: cat["women-tops"]._id,
      price: 189,
      compareAtPrice: 189,
      shortDescription: "Sharply tailored with a nipped waist.",
      description:
        "A sharply tailored blazer with a nipped waist and soft-padded shoulder. Fully lined in silk-touch viscose for a refined finish.",
      images: [img("photo-1591369822096-ffd140ec948f"), img("photo-1580913428023-02c429014349")],
      colors: [{ name: "Black", hex: "#171717" }, { name: "Stone", hex: "#C9C2B3" }],
      sizes: SIZES_APPAREL,
      material: "Wool blend, viscose lining",
      careInstructions: "Dry clean only.",
      tags: ["blazer", "tailoring"],
      isBestSeller: true,
      price_override_sale: 149,
    },
    {
      name: "Tailored Pleated Trousers",
      sku: "VEL-WTR-005",
      category: cat["women"]._id,
      subcategory: cat["women-trousers"]._id,
      price: 139,
      shortDescription: "Fluid pleats, tapered ankle.",
      description:
        "Tailored trousers with soft front pleats and a tapered ankle. Cut from a fluid twill that holds a crease without feeling stiff.",
      images: [img("photo-1548624313-0396c75f65f7"), img("photo-1594633312681-425c7b97ccd1")],
      colors: [{ name: "Black", hex: "#171717" }, { name: "Ecru", hex: "#EDE7DA" }],
      sizes: SIZES_APPAREL,
      material: "Cotton-twill blend",
      careInstructions: "Machine wash cold.",
      tags: ["trousers", "tailoring"],
    },
    {
      name: "Cashmere Knit Sweater",
      sku: "VEL-WKN-006",
      category: cat["women"]._id,
      subcategory: cat["women-tops"]._id,
      price: 219,
      shortDescription: "Pure cashmere, relaxed crew neck.",
      description:
        "A relaxed crewneck knit in pure cashmere. Lightweight and soft against the skin, with a ribbed hem and cuffs for structure.",
      images: [img("photo-1521572163474-6864f9cf17ab"), img("photo-1516762689617-e1cffcef479d")],
      colors: [{ name: "Oatmeal", hex: "#D9CFBB" }, { name: "Black", hex: "#171717" }],
      sizes: SIZES_APPAREL,
      material: "100% cashmere",
      careInstructions: "Hand wash cold or dry clean.",
      tags: ["knitwear", "cashmere"],
      isNewArrival: true,
    },
    {
      name: "Silk Evening Dress",
      sku: "VEL-WDR-007",
      category: cat["women"]._id,
      subcategory: cat["women-dresses"]._id,
      price: 259,
      shortDescription: "Bias-cut mulberry silk slip.",
      description:
        "Cut on the bias from mulberry silk, this dress skims the body with a quiet, liquid movement. Adjustable straps, a cowl back.",
      images: [img("photo-1515372039744-b8f02a3ae446"), img("photo-1524758631624-e2822e304c36")],
      colors: [{ name: "Champagne", hex: "#E8D9BE" }, { name: "Black", hex: "#171717" }],
      sizes: SIZES_APPAREL,
      material: "100% mulberry silk",
      careInstructions: "Dry clean only.",
      tags: ["dress", "silk", "evening"],
    },
    {
      name: "Knit Midi Skirt",
      sku: "VEL-WSK-008",
      category: cat["women"]._id,
      subcategory: cat["women-trousers"]._id,
      price: 99,
      shortDescription: "Body-skimming ribbed knit.",
      description:
        "A body-skimming ribbed knit skirt that falls to the midi length. Elasticated waist for movement, second-skin hand-feel.",
      images: [img("photo-1583496661160-fb5886a13d77"), img("photo-1550614000-4895a10e1bfd")],
      colors: [{ name: "Ecru", hex: "#EDE7DA" }, { name: "Black", hex: "#171717" }],
      sizes: SIZES_APPAREL,
      material: "Viscose-blend knit",
      careInstructions: "Hand wash cold.",
      tags: ["skirt", "knitwear"],
      isNewArrival: true,
    },
    {
      name: "Relaxed Oxford Shirt",
      sku: "VEL-MSH-009",
      category: cat["men"]._id,
      subcategory: cat["men-shirts"]._id,
      price: 79,
      compareAtPrice: 79,
      shortDescription: "Crisp poplin, close-to-body fit.",
      description:
        "A crisp poplin shirt with a clean point collar and single-needle stitching throughout. Tailored for a modern, close-to-body fit.",
      images: [img("photo-1598033129183-c4f50c736f10"), img("photo-1598032895397-b9472444bf93")],
      colors: [{ name: "White", hex: "#FFFFFF" }, { name: "Sky", hex: "#AEB9C4" }],
      sizes: SIZES_MEN,
      material: "100% cotton poplin",
      careInstructions: "Machine wash cold.",
      tags: ["shirt", "cotton"],
      price_override_sale: 59,
    },
    {
      name: "Merino Crewneck Sweater",
      sku: "VEL-MKN-010",
      category: cat["men"]._id,
      subcategory: cat["men-shirts"]._id,
      price: 119,
      shortDescription: "Fine-gauge merino wool knit.",
      description:
        "Fine-gauge merino wool knit with a close, refined rib at the cuff and hem. A foundational layer built for year-round wear.",
      images: [img("photo-1516762689617-e1cffcef479d"), img("photo-1521572163474-6864f9cf17ab")],
      colors: [{ name: "Navy", hex: "#2B3240" }, { name: "Oatmeal", hex: "#D9CFBB" }],
      sizes: SIZES_MEN,
      material: "100% merino wool",
      careInstructions: "Hand wash cold or dry clean.",
      tags: ["knitwear", "merino"],
      isBestSeller: true,
    },
    {
      name: "Relaxed Chino Trouser",
      sku: "VEL-MTR-011",
      category: cat["men"]._id,
      subcategory: cat["men-trousers"]._id,
      price: 99,
      shortDescription: "Tapered brushed-cotton chino.",
      description:
        "A tapered chino in brushed cotton twill with a soft mid-rise. Finished with a clean waistband and minimal hardware.",
      images: [img("photo-1473966968600-fa801b869a1a"), img("photo-1473973266408-ed4e27abdd47")],
      colors: [{ name: "Sand", hex: "#C9B48C" }, { name: "Black", hex: "#171717" }],
      sizes: ["28", "30", "32", "34", "36"],
      material: "Brushed cotton twill",
      careInstructions: "Machine wash cold.",
      tags: ["trousers", "chino"],
      isNewArrival: true,
    },
    {
      name: "Unstructured Wool Blazer",
      sku: "VEL-MBL-012",
      category: cat["men"]._id,
      subcategory: cat["men-jackets"]._id,
      price: 259,
      shortDescription: "Half-canvassed, natural shoulder line.",
      description:
        "Half-canvassed in soft wool twill, this blazer is built without heavy padding for a natural, unstructured line. Notch lapel.",
      images: [img("photo-1594938298603-c8148c4dae35"), img("photo-1520975954732-35dd22299614")],
      colors: [{ name: "Charcoal", hex: "#3A3A38" }, { name: "Camel", hex: "#B89B72" }],
      sizes: SIZES_MEN,
      material: "Wool twill",
      careInstructions: "Dry clean only.",
      tags: ["blazer", "tailoring"],
      isNewArrival: true,
    },
    {
      name: "Tailored Overcoat",
      sku: "VEL-MCT-013",
      category: cat["men"]._id,
      subcategory: cat["men-jackets"]._id,
      price: 329,
      shortDescription: "Double-breasted brushed wool.",
      description:
        "A double-breasted overcoat in brushed wool. Generous proportions and a fluid, unstructured shoulder for easy layering.",
      images: [img("photo-1539533018447-63fcce2678e3"), img("photo-1544022613-e87ca75a784a")],
      colors: [{ name: "Camel", hex: "#B89B72" }, { name: "Black", hex: "#171717" }],
      sizes: SIZES_MEN,
      material: "Brushed wool blend",
      careInstructions: "Dry clean only.",
      tags: ["coat", "outerwear"],
      isNewArrival: true,
    },
    {
      name: "Leather Derby Shoe",
      sku: "VEL-MSH-014",
      category: cat["men"]._id,
      subcategory: cat["men-shirts"]._id,
      price: 199,
      shortDescription: "Goodyear-welted, vegetable-tanned leather.",
      description:
        "Handcrafted from vegetable-tanned leather on a rounded last, with a Goodyear-welted sole built to be resoled and rewear.",
      images: [img("photo-1449505278894-297fdb3edbc1"), img("photo-1533867617858-e7b97e060509")],
      colors: [{ name: "Dark Brown", hex: "#4A3226" }, { name: "Black", hex: "#171717" }],
      sizes: ["40", "41", "42", "43", "44", "45"],
      material: "Vegetable-tanned leather",
      careInstructions: "Wipe clean, condition regularly.",
      tags: ["shoes", "leather"],
      isBestSeller: true,
    },
    {
      name: "Leather Crossbody Bag",
      sku: "VEL-ABG-015",
      category: cat["accessories"]._id,
      subcategory: cat["accessories-bags"]._id,
      price: 219,
      shortDescription: "Full-grain leather, hand-burnished edges.",
      description:
        "Full-grain leather with a hand-burnished edge finish. A single adjustable strap, interior card slots, magnetic closure.",
      images: [img("photo-1548036328-c9fa89d128fa"), img("photo-1591561954557-26941169b49e")],
      colors: [{ name: "Cognac", hex: "#8A5A3B" }, { name: "Black", hex: "#171717" }],
      sizes: SIZES_ONE,
      material: "Full-grain leather",
      careInstructions: "Wipe clean, store in dust bag.",
      tags: ["bag", "leather"],
      isBestSeller: true,
    },
    {
      name: "Leather Tote",
      sku: "VEL-ABG-016",
      category: cat["accessories"]._id,
      subcategory: cat["accessories-bags"]._id,
      price: 289,
      shortDescription: "Structured everyday leather tote.",
      description:
        "A structured tote in full-grain leather, sized for a laptop and daily essentials. Reinforced base, interior zip pocket.",
      images: [img("photo-1591561954557-26941169b49e"), img("photo-1548036328-c9fa89d128fa")],
      colors: [{ name: "Black", hex: "#171717" }, { name: "Cognac", hex: "#8A5A3B" }],
      sizes: SIZES_ONE,
      material: "Full-grain leather",
      careInstructions: "Wipe clean, store in dust bag.",
      tags: ["bag", "tote", "leather"],
      isNewArrival: true,
    },
    {
      name: "Fine Chain Necklace",
      sku: "VEL-AJW-017",
      category: cat["accessories"]._id,
      subcategory: cat["accessories-jewelry"]._id,
      price: 69,
      shortDescription: "14k gold vermeil, water-resistant.",
      description:
        "A delicate, water-resistant chain in 14k gold vermeil. Designed to be worn alone or layered with finer pieces.",
      images: [img("photo-1506630448388-4e683c67ddb0"), img("photo-1611591437281-460bfbe1220a")],
      colors: [{ name: "Gold", hex: "#C9A24B" }, { name: "Silver", hex: "#C7C7C7" }],
      sizes: SIZES_ONE,
      material: "14k gold vermeil",
      careInstructions: "Avoid contact with perfume and water.",
      tags: ["jewelry", "necklace"],
      isNewArrival: true,
    },
    {
      name: "Minimal Belt",
      sku: "VEL-ABL-018",
      category: cat["accessories"]._id,
      subcategory: cat["accessories-belts"]._id,
      price: 59,
      shortDescription: "3cm leather, brushed-brass buckle.",
      description:
        "A clean, 3cm leather belt with a matte brushed-brass buckle. Cut from the same hide as our leather goods.",
      images: [img("photo-1553062407-98eeb64c6a62"), img("photo-1624222247344-550fb60583dc")],
      colors: [{ name: "Black", hex: "#171717" }, { name: "Cognac", hex: "#8A5A3B" }],
      sizes: ["S", "M", "L"],
      material: "Leather, brass hardware",
      careInstructions: "Wipe clean.",
      tags: ["belt", "leather"],
    },
    {
      name: "Wool-Blend Scarf",
      sku: "VEL-AAC-019",
      category: cat["accessories"]._id,
      subcategory: cat["accessories-belts"]._id,
      price: 49,
      compareAtPrice: 49,
      shortDescription: "Soft wool-cashmere, fringed edge.",
      description:
        "Woven from a soft wool-cashmere blend with a fringed edge. Generously sized for wrapping.",
      images: [img("photo-1520903920243-00d872a2d1c9"), img("photo-1520006403909-838d6b92c22e")],
      colors: [{ name: "Camel", hex: "#B89B72" }, { name: "Charcoal", hex: "#3A3A38" }],
      sizes: SIZES_ONE,
      material: "Wool-cashmere blend",
      careInstructions: "Dry clean only.",
      tags: ["scarf", "accessories"],
      price_override_sale: 39,
    },
    {
      name: "Structured Leather Belt",
      sku: "VEL-ABL-020",
      category: cat["accessories"]._id,
      subcategory: cat["accessories-belts"]._id,
      price: 59,
      shortDescription: "Wide structured leather belt.",
      description:
        "A wider structured belt in vegetable-tanned leather with a polished silver-tone buckle for a sharper, statement finish.",
      images: [img("photo-1624222247344-550fb60583dc"), img("photo-1553062407-98eeb64c6a62")],
      colors: [{ name: "Black", hex: "#171717" }],
      sizes: ["S", "M", "L"],
      material: "Vegetable-tanned leather",
      careInstructions: "Wipe clean.",
      tags: ["belt", "leather"],
    },
  ];

  return items.map((item) => {
    const { price_override_sale, ...rest } = item;
    const variants = variantsFor(rest.sku, rest.colors, rest.sizes);
    const images = rest.images.map((url, i) => ({ url, isPrimary: i === 0 }));
    const compareAtPrice = price_override_sale
      ? rest.price
      : rest.compareAtPrice && rest.compareAtPrice > rest.price
        ? rest.compareAtPrice
        : undefined;
    const price = price_override_sale ?? rest.price;
    return { ...rest, price, compareAtPrice, images, variants };
  });
}

const SAMPLE_CUSTOMER_PASSWORD = "Password123";

async function seedSampleCustomers() {
  const samples = [
    { name: "Sarah Mitchell", email: "sarah.mitchell@example.com" },
    { name: "Daniel Reyes", email: "daniel.reyes@example.com" },
    { name: "Amara Okafor", email: "amara.okafor@example.com" },
  ];

  const customers = [];
  for (const sample of samples) {
    let user = await User.findOne({ email: sample.email });
    if (!user) {
      user = await User.create({ ...sample, password: SAMPLE_CUSTOMER_PASSWORD, role: "customer" });
    }
    customers.push(user);
  }
  console.log(`Seeded ${customers.length} sample customers (password: ${SAMPLE_CUSTOMER_PASSWORD}).`);
  return customers;
}

async function seedSampleCoupons() {
  await Coupon.deleteMany({ code: { $in: ["WELCOME10", "FREESHIP", "SUMMER25"] } });

  const inOneYear = new Date(Date.now() + 365 * 86400000);
  await Coupon.insertMany([
    { code: "WELCOME10", type: "percentage", value: 10, minimumOrder: 0, expiryDate: inOneYear },
    { code: "FREESHIP", type: "fixed", value: 8, minimumOrder: 50, expiryDate: inOneYear },
    { code: "SUMMER25", type: "percentage", value: 25, maximumDiscount: 75, minimumOrder: 150, expiryDate: inOneYear },
  ]);
  console.log("Seeded 3 sample coupons: WELCOME10, FREESHIP, SUMMER25.");
}

async function seedSampleReviews(customers) {
  await Review.deleteMany({});
  const products = await Product.find().limit(10);

  const comments = [
    { rating: 5, title: "Exceeded expectations", comment: "The quality is exceptional and the fit is perfect. Fabric feels incredible against the skin." },
    { rating: 4, title: "Great everyday piece", comment: "Wear this constantly. Considered, quiet, well made — exactly what I was hoping for." },
    { rating: 5, title: "Beautiful in person", comment: "Even better than the photos. Shipping was fast and the packaging felt like a luxury unboxing." },
    { rating: 4, title: "True to size", comment: "Sizing guide was spot on. Fits beautifully and the material has a lovely weight to it." },
  ];

  let count = 0;
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const customer = customers[i % customers.length];
    const review = comments[i % comments.length];
    await Review.create({
      product: product._id,
      user: customer._id,
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      isVerifiedPurchase: true,
      status: "approved",
    });
    await recalculateProductRating(product._id);
    count++;
  }
  console.log(`Seeded ${count} approved sample reviews.`);
}

async function seedSampleOrders(customers) {
  await Order.deleteMany({});
  const products = await Product.find().limit(12);
  const statuses = ["delivered", "shipped", "processing", "confirmed"];

  let count = 0;
  for (let i = 0; i < customers.length * 2; i++) {
    const customer = customers[i % customers.length];
    const product = products[(i * 3) % products.length];
    const variant = product.variants[0];
    const quantity = 1 + (i % 2);
    const subtotal = product.price * quantity;
    const shipping = subtotal >= 100 ? 0 : 8;
    const daysAgo = i * 6 + 3;

    await Order.create({
      createdAt: new Date(Date.now() - daysAgo * 86400000),
      user: customer._id,
      items: [
        {
          product: product._id,
          name: product.name,
          image: product.images[0]?.url,
          price: product.price,
          quantity,
          size: variant.size,
          color: variant.color,
        },
      ],
      subtotal,
      shipping,
      tax: 0,
      discount: 0,
      total: subtotal + shipping,
      shippingAddress: {
        fullName: customer.name,
        phone: "555-0100",
        line1: "123 Fashion Ave",
        city: "New York",
        state: "NY",
        postalCode: "10001",
        country: "United States",
      },
      billingAddress: {
        fullName: customer.name,
        phone: "555-0100",
        line1: "123 Fashion Ave",
        city: "New York",
        state: "NY",
        postalCode: "10001",
        country: "United States",
      },
      shippingMethod: "standard",
      paymentStatus: "paid",
      orderStatus: statuses[i % statuses.length],
      paymentIntentId: `seed_pi_${i}_${Date.now().toString(36)}`,
      statusHistory: [{ status: "confirmed", note: "Payment received" }],
    });
    count++;
  }
  console.log(`Seeded ${count} sample orders.`);
}

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.warn("ADMIN_EMAIL/ADMIN_PASSWORD not set — skipping admin seed.");
    return;
  }
  const existing = await User.findOne({ email });
  if (existing) {
    if (existing.role !== "admin") {
      existing.role = "admin";
      await existing.save();
    }
    console.log(`Admin already exists: ${email}`);
    return;
  }
  await User.create({ name: "Velora Admin", email, password, role: "admin" });
  console.log(`Admin created: ${email}`);
}

async function run() {
  await connectDB();

  console.log("Seeding categories...");
  const cat = await seedCategories();

  console.log("Seeding products...");
  await Product.deleteMany({});
  const products = buildProducts(cat);
  await Product.insertMany(products);
  console.log(`Seeded ${products.length} products.`);

  console.log("Seeding featured collection...");
  await Collection.deleteMany({});
  const allProducts = await Product.find({ tags: "linen" }).select("_id");
  await Collection.create({
    name: "The Summer Edit",
    slug: "summer-edit",
    tagline: "Lightweight. Effortless. Timeless.",
    description: "Warm-weather pieces built from natural, breathable fabrics.",
    image: { url: img("photo-1490114538077-0a7f8cb49889", 2000) },
    products: allProducts.map((p) => p._id),
    isFeatured: true,
  });

  await seedAdmin();
  const customers = await seedSampleCustomers();
  await seedSampleCoupons();
  await seedSampleReviews(customers);
  await seedSampleOrders(customers);

  console.log("Seed complete.");
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});

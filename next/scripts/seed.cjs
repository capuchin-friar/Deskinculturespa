#!/usr/bin/env node

const { randomBytes } = require("node:crypto");
const { loadEnvConfig } = require("@next/env");
const bcrypt = require("bcryptjs");
const { Pool } = require("pg");

loadEnvConfig(process.cwd());

const pool = new Pool(
  process.env.DB_URL?.trim()
    ? { connectionString: process.env.DB_URL.trim() }
    : {
        user: process.env.DB_USER || "postgres",
        password: process.env.DB_PASSWORD || "postgres",
        host: process.env.DB_HOST || "localhost",
        port: Number.parseInt(process.env.DB_PORT || "5432", 10),
        database: process.env.DB_NAME,
      },
);

const demoProducts = [
  {
    name: "Gentle Hydrating Cleanser",
    description: "A gentle daily cleanser for a simple, refreshing skincare routine.",
    price: 8500,
    stock: 24,
    category: "Face Care",
    subcategory: "Facial Cleansers",
    brand: "Demo Skincare",
    image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=85",
    specifications: { size: "150 ml", skin_type: "All skin types" },
  },
  {
    name: "Niacinamide Brightening Serum",
    description: "A lightweight serum for a bright, balanced-looking complexion.",
    price: 12500,
    stock: 18,
    category: "Face Care",
    subcategory: "Face Serums",
    brand: "Demo Skincare",
    image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=800&q=85",
    specifications: { size: "30 ml", skin_type: "All skin types" },
  },
  {
    name: "Daily Defense Sunscreen SPF 50",
    description: "A lightweight sunscreen for everyday sun protection.",
    price: 15000,
    stock: 30,
    category: "Sunscreens",
    subcategory: "Face Sunscreens",
    brand: "Demo Skincare",
    image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=800&q=85",
    specifications: { size: "50 ml", spf: "50" },
  },
  { name: "Ceramide Barrier Moisturizer", description: "A nourishing daily moisturizer that helps support the skin barrier.", price: 14000, stock: 20, category: "Face Care", subcategory: "Moisturizers", brand: "Demo Skincare", image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=800&q=85", specifications: { size: "50 ml", skin_type: "Dry and sensitive skin" } },
  { name: "Vitamin C Glow Serum", description: "A brightening serum for a radiant-looking complexion.", price: 16000, stock: 16, category: "Face Care", subcategory: "Face Serums", brand: "Demo Skincare", image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=800&q=85", specifications: { size: "30 ml", skin_type: "All skin types" } },
  { name: "Soothing Aloe Gel", description: "A cooling gel moisturizer for a refreshed feel.", price: 6500, stock: 28, category: "Face Care", subcategory: "Moisturizers", brand: "Demo Skincare", image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=85", specifications: { size: "100 ml", skin_type: "All skin types" } },
  { name: "Gentle Foaming Face Wash", description: "A mild foaming cleanser for everyday use.", price: 7500, stock: 25, category: "Face Care", subcategory: "Facial Cleansers", brand: "Demo Skincare", image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=85", specifications: { size: "150 ml", skin_type: "Combination skin" } },
  { name: "Hydrating Rose Toner", description: "A refreshing toner to add a light layer of hydration.", price: 9000, stock: 19, category: "Face Care", subcategory: "Toners", brand: "Demo Skincare", image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=800&q=85", specifications: { size: "120 ml", skin_type: "All skin types" } },
  { name: "Overnight Repair Face Cream", description: "A rich night cream for a comfortable evening skincare routine.", price: 18000, stock: 14, category: "Face Care", subcategory: "Night Creams", brand: "Demo Skincare", image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=800&q=85", specifications: { size: "50 ml", skin_type: "Normal to dry skin" } },
  { name: "Exfoliating Face Scrub", description: "A gentle exfoliating scrub for smoother-feeling skin.", price: 9500, stock: 17, category: "Face Care", subcategory: "Exfoliators", brand: "Demo Skincare", image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=85", specifications: { size: "100 ml", skin_type: "Normal skin" } },
  { name: "Vitamin E Body Lotion", description: "A daily body lotion that leaves skin feeling soft and moisturized.", price: 11000, stock: 22, category: "Body Care", subcategory: "Body Lotions", brand: "Demo Skincare", image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=800&q=85", specifications: { size: "250 ml", skin_type: "All skin types" } },
  { name: "Nourishing Hair Oil", description: "A lightweight oil for adding shine to dry hair lengths.", price: 8500, stock: 15, category: "Hair Care", subcategory: "Hair Oils", brand: "Demo Skincare", image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=85", specifications: { size: "100 ml", hair_type: "All hair types" } },
  { name: "Repairing Hair Mask", description: "A weekly conditioning mask for soft, manageable hair.", price: 12000, stock: 12, category: "Hair Care", subcategory: "Hair Treatments", brand: "Demo Skincare", image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=85", specifications: { size: "200 ml", hair_type: "Dry or damaged hair" } },
  { name: "Shea Butter Hand Cream", description: "A compact hand cream for everyday moisture.", price: 5500, stock: 30, category: "Body Care", subcategory: "Hand Care", brand: "Demo Skincare", image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=800&q=85", specifications: { size: "60 ml", skin_type: "All skin types" } },
  { name: "Gentle Micellar Cleanser", description: "A no-rinse micellar cleanser for a quick face cleanse.", price: 8000, stock: 21, category: "Face Care", subcategory: "Makeup Removers", brand: "Demo Skincare", image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=85", specifications: { size: "200 ml", skin_type: "Sensitive skin" } },
  { name: "Clay Purifying Mask", description: "A wash-off clay mask for a fresh, clean-feeling complexion.", price: 10500, stock: 13, category: "Face Care", subcategory: "Face Masks", brand: "Demo Skincare", image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=800&q=85", specifications: { size: "75 ml", skin_type: "Oily and combination skin" } },
  { name: "Daily Lip Balm", description: "A moisturizing lip balm for everyday comfort.", price: 3500, stock: 40, category: "Face Care", subcategory: "Lip Care", brand: "Demo Skincare", image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=800&q=85", specifications: { size: "15 g", skin_type: "All skin types" } },
  { name: "Gentle Body Wash", description: "A mild, lightly scented body wash for daily bathing.", price: 7000, stock: 26, category: "Body Care", subcategory: "Body Wash", brand: "Demo Skincare", image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=800&q=85", specifications: { size: "250 ml", skin_type: "All skin types" } },
  { name: "Cuticle and Nail Oil", description: "A conditioning oil for nails and cuticles.", price: 4500, stock: 18, category: "Body Care", subcategory: "Nail Care", brand: "Demo Skincare", image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=800&q=85", specifications: { size: "15 ml", use: "Nails and cuticles" } },
  { name: "Refreshing Eye Gel", description: "A lightweight gel for a refreshed-feeling eye area.", price: 9000, stock: 16, category: "Face Care", subcategory: "Eye Care", brand: "Demo Skincare", image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=800&q=85", specifications: { size: "20 ml", skin_type: "All skin types" } },
];

const demoServices = [
  {
    category: "Facial Treatment",
    subcategory: "Facial Polish",
    description: "A refreshing facial polish treatment for smoother-feeling skin.",
    price: 20000,
    duration: 45,
    image: "/spa.png",
  },
  {
    category: "Facial Treatment",
    subcategory: "Acne Facials",
    description: "A personalized facial service tailored to acne-prone skin concerns.",
    price: 30000,
    duration: 60,
    image: "/spa.png",
  },
  {
    category: "Body Massage",
    subcategory: "Full Body Massage",
    description: "A relaxing full-body massage to support rest and relaxation.",
    price: 35000,
    duration: 60,
    image: "/spa.png",
  },
  {
    category: "Body Treatments",
    subcategory: "Body Polish",
    description: "A full-body exfoliation treatment for soft, refreshed-feeling skin.",
    price: 50000,
    duration: 50,
    image: "/spa.png",
  },
  { category: "Facial Treatment", subcategory: "Instant Brightening Facials", description: "A facial treatment focused on a brighter, refreshed-looking complexion.", price: 25000, duration: 50, image: "/spa.png" },
  { category: "Facial Treatment", subcategory: "Barrier Repair Facials", description: "A calming facial designed for skin that needs extra barrier support.", price: 30000, duration: 60, image: "/spa.png" },
  { category: "Body Massage", subcategory: "Feet Massage", description: "A relaxing massage focused on tired feet.", price: 10000, duration: 30, image: "/spa.png" },
  { category: "Body Massage", subcategory: "Back Massage", description: "A targeted massage to help ease tension in the back.", price: 15000, duration: 30, image: "/spa.png" },
  { category: "Pedicures", subcategory: "Pedicure", description: "A foot care service including nail shaping and finishing.", price: 8000, duration: 45, image: "/spa.png" },
  { category: "Waxing", subcategory: "Armpit Waxing", description: "A professional underarm waxing service.", price: 10000, duration: 20, image: "/spa.png" },
];

const demoConsultations = [
  { slug: "skincare", mode: "video", duration: 30, price: 10000 },
  { slug: "haircare", mode: "video", duration: 30, price: 10000 },
  { slug: "wellness", mode: "audio", duration: 30, price: 10000 },
  { slug: "body", mode: "physical", duration: 30, price: 10000 },
  { slug: "nutrition", mode: "video", duration: 30, price: 10000 },
  { slug: "skincare", mode: "audio", duration: 30, price: 10000 },
  { slug: "haircare", mode: "audio", duration: 30, price: 10000 },
  { slug: "wellness", mode: "video", duration: 30, price: 10000 },
  { slug: "body", mode: "video", duration: 30, price: 10000 },
  { slug: "nutrition", mode: "audio", duration: 30, price: 10000 },
];

async function seed() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock($1, $2)", [72631, 2]);

    const migrationTable = await client.query(
      "SELECT to_regclass('public.schema_migrations') AS table_name",
    );
    if (!migrationTable.rows[0].table_name) {
      throw new Error("Run `npm run migrate` before seeding data.");
    }

    const demoPassword = randomBytes(48).toString("base64url");
    const passwordHash = await bcrypt.hash(demoPassword, 12);
    const ownerResult = await client.query(
      `INSERT INTO users (role, fname, lname, email, password, isactive, accountstatus)
       VALUES ('admin', 'Demo', 'Seed Owner', 'demo-owner@seed.invalid', $1, FALSE, 'suspended')
       ON CONFLICT (email) DO UPDATE
       SET role = 'admin', isactive = FALSE, accountstatus = 'suspended'
       RETURNING id`,
      [passwordHash],
    );
    const ownerId = ownerResult.rows[0].id;
    let productCount = 0;
    let serviceCount = 0;
    let consultationCount = 0;

    for (const product of demoProducts) {
      const result = await client.query(
        `INSERT INTO products
           (admin_id, name, price, stock, description, category, subcategory, brand,
            images, thumbnail_url, specifications, status, is_published, published_at)
         SELECT $1::varchar, $2::varchar, $3::bigint, $4::integer, $5::text, $6::varchar, $7::varchar, $8::varchar, $9::text[], $10::text, $11::jsonb, 'active', TRUE, NOW()
         WHERE NOT EXISTS (
           SELECT 1 FROM products WHERE admin_id = $1 AND name = $2
         )
         RETURNING id`,
        [
          String(ownerId),
          product.name,
          product.price,
          product.stock,
          product.description,
          product.category,
          product.subcategory,
          product.brand,
          [product.image],
          product.image,
          JSON.stringify(product.specifications),
        ],
      );
      productCount += result.rowCount;
    }

    for (const service of demoServices) {
      const result = await client.query(
        `INSERT INTO services
           (admin_id, description, category, subcategory, price, duration_minutes,
            specifications, image_url, is_active)
         SELECT $1::bigint, $2::text, $3::varchar, $4::varchar, $5::numeric, $6::integer, '{}'::jsonb, $7::text, TRUE
         WHERE NOT EXISTS (
           SELECT 1 FROM services
           WHERE admin_id = $1::bigint AND category = $3::varchar AND subcategory = $4::varchar
         )
         RETURNING id`,
        [ownerId, service.description, service.category, service.subcategory, service.price, service.duration, service.image],
      );
      serviceCount += result.rowCount;
    }

    for (const consultation of demoConsultations) {
      const result = await client.query(
        `INSERT INTO consultations
           (slug, thumbnail_url, consultant_id, mode, duration_minutes, price, is_active)
         SELECT $1::varchar, '/consultation.png', $2::integer, $3::consultation_mode, $4, $5, TRUE
         WHERE NOT EXISTS (
           SELECT 1 FROM consultations WHERE consultant_id = $2 AND slug = $1 AND mode = $3::consultation_mode
         )
         RETURNING id`,
        [consultation.slug, ownerId, consultation.mode, consultation.duration, consultation.price],
      );
      consultationCount += result.rowCount;
    }

    await client.query("COMMIT");
    console.log(`Seed complete (owner user id ${ownerId}).`);
    console.log(`Inserted ${productCount} product(s), ${serviceCount} service(s), and ${consultationCount} consultation(s).`);
    console.log("The demo owner is suspended and has no usable login password.");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((error) => {
  console.error("Seed failed:", error.message, error.code ? `(PostgreSQL ${error.code})` : "");
  if (error.position) console.error(`Query position: ${error.position}`);
  process.exitCode = 1;
});

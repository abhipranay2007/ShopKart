const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Product = require("../models/product.model");

const path = require("path");
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const sampleProducts = [
  // Electronics
  {
    name: "Sony WH-1000XM5 Wireless Headphones",
    description: "Industry-leading active noise canceling headphones with dual processors, 8 microphones, and up to 30 hours of battery life.",
    price: 26990,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
    stock: 15,
  },
  {
    name: "Apple iPad Air M2",
    description: "11-inch Liquid Retina display, powered by Apple M2 chip with 128GB storage, stereo speakers, and Wi-Fi 6E connectivity.",
    price: 59900,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=80",
    stock: 8,
  },
  {
    name: "Logitech MX Master 3S Wireless Mouse",
    description: "Ergonomic wireless mouse with Quiet Clicks, 8K DPI track-on-glass sensor, and MagSpeed electromagnetic scrolling.",
    price: 8995,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80",
    stock: 25,
  },
  {
    name: "Dell UltraSharp 27-inch 4K Monitor",
    description: "Brilliant 4K UHD resolution with IPS Black panel, 98% DCI-P3 color gamut, USB-C 90W power delivery, and ultra-thin bezel.",
    price: 44999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80",
    stock: 5,
  },

  // Fashion
  {
    name: "Levi's Men's Vintage Denim Jacket",
    description: "Classic trucker jacket made from 100% heavyweight cotton denim with button flap chest pockets and adjustable waist tabs.",
    price: 4999,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&auto=format&fit=crop&q=80",
    stock: 20,
  },
  {
    name: "Bellroy Classic Leather Backpack",
    description: "Modern silhouette with clean lines, dedicated 15-inch laptop compartment, water-resistant zippers, and premium leather accents.",
    price: 12499,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80",
    stock: 12,
  },
  {
    name: "Ray-Ban Classic Aviator Sunglasses",
    description: "Iconic gold metal frames with polarized green classic G-15 lenses, 100% UV protection, and timeless aviator styling.",
    price: 8590,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80",
    stock: 18,
  },

  // Books
  {
    name: "Atomic Habits by James Clear",
    description: "An easy & proven way to build good habits and break bad ones. Over 15 million copies sold worldwide.",
    price: 650,
    category: "Books",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80",
    stock: 50,
  },
  {
    name: "Designing Data-Intensive Applications",
    description: "The definitive guide by Martin Kleppmann on the principles and practical architectures behind reliable, scalable data systems.",
    price: 1850,
    category: "Books",
    image: "https://images.unsplash.com/photo-1532012164546-f432f2e3777f?w=800&auto=format&fit=crop&q=80",
    stock: 30,
  },

  // Home
  {
    name: "Nespresso Vertuo Pop Coffee Machine",
    description: "Single-serve coffee and espresso machine featuring Centrifusion technology for rich, aromatic crema at the touch of a button.",
    price: 14999,
    category: "Home",
    image: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&auto=format&fit=crop&q=80",
    stock: 10,
  },
  {
    name: "Philips Smart LED Ambient Desk Lamp",
    description: "Tunable white and color ambiance smart lamp with voice assistant integration, preset focus scenes, and gentle wake-up mode.",
    price: 4299,
    category: "Home",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80",
    stock: 22,
  },

  // Sports
  {
    name: "Nike Air Zoom Pegasus 40 Running Shoes",
    description: "Responsive cushioning for everyday road running with dual Zoom Air units and engineered breathable mesh upper.",
    price: 9995,
    category: "Sports",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80",
    stock: 16,
  },
  {
    name: "Manduka PRO Yoga & Pilates Mat",
    description: "High-density cushion and non-slip grip yoga mat made from sustainable OEKO-TEX certified material, built to last a lifetime.",
    price: 7490,
    category: "Sports",
    image: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&auto=format&fit=crop&q=80",
    stock: 25,
  },

  // Beauty
  {
    name: "Dyson Supersonic Hair Dryer",
    description: "Fast drying with intelligent heat control to protect natural shine. Includes magnetic styling attachments and flyaway smoother.",
    price: 34900,
    category: "Beauty",
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80",
    stock: 7,
  },
  {
    name: "Kiehl's Ultra Facial Cream (50ml)",
    description: "Lightweight 24-hour daily face moisturizer formulated with Squalane and Glacial Glycoprotein for softer, healthier skin.",
    price: 2850,
    category: "Beauty",
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop&q=80",
    stock: 35,
  },
];

async function seed() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI not found in environment variables");
    }

    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB for seeding...");

    // Insert only items that don't already exist by name
    let addedCount = 0;
    for (const prod of sampleProducts) {
      const exists = await Product.findOne({ name: prod.name });
      if (!exists) {
        await Product.create(prod);
        addedCount++;
        console.log(`+ Added: ${prod.name}`);
      } else {
        console.log(`- Exists: ${prod.name}`);
      }
    }

    console.log(`\n🎉 Seeding complete! Added ${addedCount} new products.`);
    const totalCount = await Product.countDocuments();
    console.log(`Total products in catalog: ${totalCount}`);
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err.message);
    process.exit(1);
  }
}

seed();

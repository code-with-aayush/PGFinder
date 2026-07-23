// PGFinder Seed Script
// Run: node scripts/seed.js
// Populates the database with 15 sample PG listings, users, inquiries, and saved items

const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

// Load .env.local
try {
  require("dotenv").config({ path: ".env.local" });
} catch {
  const envPath = path.join(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, "utf8");
    envFile.split("\n").forEach((line) => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || "";
        if (value.length > 0 && value.startsWith('"') && value.endsWith('"')) {
          value = value.substring(1, value.length - 1);
        }
        process.env[key] = value.trim();
      }
    });
  }
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI not found in .env.local");
  process.exit(1);
}

// ── Schemas ────────────────────────────────────────────────────────────
const ListingSchema = new mongoose.Schema(
  {
    ownerId: String,
    title: String,
    description: String,
    price: Number,
    type: { type: String, enum: ["PG", "Hostel", "Flat Share"] },
    gender: { type: String, enum: ["male", "female", "any"] },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
    },
    location: {
      type: { type: String, default: "Point" },
      coordinates: [Number],
    },
    amenities: {
      ac: Boolean,
      wifi: Boolean,
      meals: Boolean,
      laundry: Boolean,
      parking: Boolean,
      hotWater: Boolean,
      powerBackup: Boolean,
      security: Boolean,
    },
    rules: {
      vegOnly: Boolean,
      noSmoking: Boolean,
      noAlcohol: Boolean,
      guestPolicy: String,
      curfewTime: String,
    },
    photos: [String],
    isVerified: Boolean,
    isActive: Boolean,
  },
  { timestamps: true }
);
ListingSchema.index({ location: "2dsphere" });

const UserSchema = new mongoose.Schema({
  clerkId: { type: String, unique: true },
  name: String,
  email: String,
  role: { type: String, enum: ["student", "owner"] },
  phone: String,
  createdAt: { type: Date, default: Date.now },
});

const InquirySchema = new mongoose.Schema({
  listingId: mongoose.Schema.Types.ObjectId,
  listingTitle: String,
  studentId: String,
  ownerId: String,
  message: String,
  status: { type: String, enum: ["pending", "responded"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

const SavedSchema = new mongoose.Schema({
  studentId: String,
  listingId: mongoose.Schema.Types.ObjectId,
  savedAt: { type: Date, default: Date.now },
});
SavedSchema.index({ studentId: 1, listingId: 1 }, { unique: true });

const Listing =
  mongoose.models.Listing || mongoose.model("Listing", ListingSchema);
const User = mongoose.models.User || mongoose.model("User", UserSchema);
const Inquiry =
  mongoose.models.Inquiry || mongoose.model("Inquiry", InquirySchema);
const Saved = mongoose.models.Saved || mongoose.model("Saved", SavedSchema);

// ── Sample Photos (Cloudinary placeholder URLs) ────────────────────────
const PHOTOS = [
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&h=600&fit=crop",
];

// ── Seed Data ──────────────────────────────────────────────────────────
const OWNER_ID = "seed_owner_001";
const STUDENT_ID = "seed_student_001";

const listings = [
  {
    title: "Sunshine PG for Girls",
    description: "Well-maintained girls PG with home-cooked meals. Located near DTU campus. Spacious rooms with attached bathrooms. 24/7 security and CCTV surveillance. Walking distance to metro station.",
    price: 8500,
    type: "PG",
    gender: "female",
    address: { street: "A-45, Rohini Sector 7", city: "Delhi", state: "Delhi", pincode: "110085" },
    location: { type: "Point", coordinates: [77.1025, 28.7041] },
    amenities: { ac: true, wifi: true, meals: true, laundry: true, parking: false, hotWater: true, powerBackup: true, security: true },
    rules: { vegOnly: true, noSmoking: true, noAlcohol: true, guestPolicy: "Guests allowed till 8 PM", curfewTime: "10:00 PM" },
    isVerified: true,
  },
  {
    title: "Royal Boys Hostel",
    description: "Premium boys hostel with modern amenities. AC rooms, high-speed WiFi, and gym access. Located in the heart of South Delhi with excellent connectivity.",
    price: 12000,
    type: "Hostel",
    gender: "male",
    address: { street: "C-12, Hauz Khas", city: "Delhi", state: "Delhi", pincode: "110016" },
    location: { type: "Point", coordinates: [77.2090, 28.5494] },
    amenities: { ac: true, wifi: true, meals: true, laundry: true, parking: true, hotWater: true, powerBackup: true, security: true },
    rules: { vegOnly: false, noSmoking: true, noAlcohol: false, guestPolicy: "No restrictions", curfewTime: "No curfew" },
    isVerified: true,
  },
  {
    title: "Green Valley PG",
    description: "Budget-friendly PG for students. Clean rooms, filtered water, home-style food. Close to North Campus DU colleges.",
    price: 6000,
    type: "PG",
    gender: "any",
    address: { street: "University Road, Kamla Nagar", city: "Delhi", state: "Delhi", pincode: "110007" },
    location: { type: "Point", coordinates: [77.2065, 28.6824] },
    amenities: { ac: false, wifi: true, meals: true, laundry: false, parking: false, hotWater: true, powerBackup: false, security: true },
    rules: { vegOnly: true, noSmoking: true, noAlcohol: true, guestPolicy: "Guests allowed till 7 PM", curfewTime: "9:30 PM" },
    isVerified: false,
  },
  {
    title: "Koramangala Student Hub",
    description: "Modern co-living space in Koramangala, 5th Block. Perfect for students of Christ University and PES. Fully furnished rooms with study tables.",
    price: 9500,
    type: "Flat Share",
    gender: "any",
    address: { street: "5th Block, Koramangala", city: "Bangalore", state: "Karnataka", pincode: "560095" },
    location: { type: "Point", coordinates: [77.6245, 12.9352] },
    amenities: { ac: false, wifi: true, meals: false, laundry: true, parking: true, hotWater: true, powerBackup: true, security: true },
    rules: { vegOnly: false, noSmoking: true, noAlcohol: true, guestPolicy: "Guests allowed", curfewTime: "11:00 PM" },
    isVerified: true,
  },
  {
    title: "BTM Layout Girls PG",
    description: "Safe and secure girls PG in BTM Layout. Homelike atmosphere with strict security. Near Silk Board junction with bus connectivity to all tech parks.",
    price: 7500,
    type: "PG",
    gender: "female",
    address: { street: "2nd Stage, BTM Layout", city: "Bangalore", state: "Karnataka", pincode: "560076" },
    location: { type: "Point", coordinates: [77.6101, 12.9166] },
    amenities: { ac: true, wifi: true, meals: true, laundry: true, parking: false, hotWater: true, powerBackup: true, security: true },
    rules: { vegOnly: true, noSmoking: true, noAlcohol: true, guestPolicy: "No male guests", curfewTime: "9:00 PM" },
    isVerified: false,
  },
  {
    title: "HSR Layout Boys Hostel",
    description: "Affordable boys hostel in HSR Layout. Triple and double sharing available. Walking distance to HSR BDA Complex for food and shopping.",
    price: 6500,
    type: "Hostel",
    gender: "male",
    address: { street: "Sector 2, HSR Layout", city: "Bangalore", state: "Karnataka", pincode: "560102" },
    location: { type: "Point", coordinates: [77.6412, 12.9116] },
    amenities: { ac: false, wifi: true, meals: false, laundry: false, parking: true, hotWater: true, powerBackup: false, security: true },
    rules: { vegOnly: false, noSmoking: false, noAlcohol: false, guestPolicy: "No restrictions", curfewTime: "No curfew" },
    isVerified: false,
  },
  {
    title: "Indiranagar Premium PG",
    description: "Premium PG accommodation in Indiranagar. Walking distance to 100 Feet Road. Fully furnished rooms with AC and premium interiors.",
    price: 15000,
    type: "PG",
    gender: "any",
    address: { street: "12th Main, Indiranagar", city: "Bangalore", state: "Karnataka", pincode: "560038" },
    location: { type: "Point", coordinates: [77.6408, 12.9716] },
    amenities: { ac: true, wifi: true, meals: true, laundry: true, parking: true, hotWater: true, powerBackup: true, security: true },
    rules: { vegOnly: false, noSmoking: true, noAlcohol: false, guestPolicy: "Guests allowed till 10 PM", curfewTime: "No curfew" },
    isVerified: true,
  },
  {
    title: "Kothrud Student PG",
    description: "Affordable PG near MIT Pune and Cummins College. Home-cooked Maharashtrian meals. Spacious rooms with balcony.",
    price: 5500,
    type: "PG",
    gender: "male",
    address: { street: "Paud Road, Kothrud", city: "Pune", state: "Maharashtra", pincode: "411038" },
    location: { type: "Point", coordinates: [73.8077, 18.5074] },
    amenities: { ac: false, wifi: true, meals: true, laundry: false, parking: true, hotWater: true, powerBackup: false, security: false },
    rules: { vegOnly: false, noSmoking: true, noAlcohol: true, guestPolicy: "Guests allowed till 8 PM", curfewTime: "10:00 PM" },
    isVerified: false,
  },
  {
    title: "Viman Nagar Girls Hostel",
    description: "Premium girls hostel near Symbiosis and SIMC. AC rooms, gym, rooftop study area. Full meals with veg and non-veg options.",
    price: 11000,
    type: "Hostel",
    gender: "female",
    address: { street: "Viman Nagar Road", city: "Pune", state: "Maharashtra", pincode: "411014" },
    location: { type: "Point", coordinates: [73.9148, 18.5679] },
    amenities: { ac: true, wifi: true, meals: true, laundry: true, parking: false, hotWater: true, powerBackup: true, security: true },
    rules: { vegOnly: false, noSmoking: true, noAlcohol: true, guestPolicy: "Female guests only", curfewTime: "10:30 PM" },
    isVerified: true,
  },
  {
    title: "Hinjewadi IT Hub PG",
    description: "Budget PG for working professionals and students in Hinjewadi Phase 1. Walking distance to Rajiv Gandhi IT Park.",
    price: 7000,
    type: "PG",
    gender: "male",
    address: { street: "Phase 1, Hinjewadi", city: "Pune", state: "Maharashtra", pincode: "411057" },
    location: { type: "Point", coordinates: [73.7378, 18.5912] },
    amenities: { ac: false, wifi: true, meals: true, laundry: false, parking: true, hotWater: true, powerBackup: true, security: true },
    rules: { vegOnly: false, noSmoking: true, noAlcohol: true, guestPolicy: "No restrictions", curfewTime: "11:00 PM" },
    isVerified: false,
  },
  {
    title: "FC Road Co-Living Space",
    description: "Modern co-living flat share on Ferguson College Road. Ideal for COEP and Ferguson College students. Fully furnished with common kitchen.",
    price: 8000,
    type: "Flat Share",
    gender: "any",
    address: { street: "FC Road, Deccan Gymkhana", city: "Pune", state: "Maharashtra", pincode: "411004" },
    location: { type: "Point", coordinates: [73.8413, 18.5236] },
    amenities: { ac: false, wifi: true, meals: false, laundry: true, parking: false, hotWater: true, powerBackup: false, security: true },
    rules: { vegOnly: false, noSmoking: true, noAlcohol: false, guestPolicy: "Guests allowed", curfewTime: "No curfew" },
    isVerified: false,
  },
  {
    title: "Dwarka PG for Boys",
    description: "Spacious boys PG in Dwarka Sector 12. Close to Dwarka metro station. Furnished rooms with attached washroom. Breakfast and dinner included.",
    price: 7500,
    type: "PG",
    gender: "male",
    address: { street: "Sector 12, Dwarka", city: "Delhi", state: "Delhi", pincode: "110078" },
    location: { type: "Point", coordinates: [77.0266, 28.5921] },
    amenities: { ac: false, wifi: true, meals: true, laundry: false, parking: true, hotWater: true, powerBackup: true, security: true },
    rules: { vegOnly: false, noSmoking: true, noAlcohol: true, guestPolicy: "Guests allowed till 9 PM", curfewTime: "10:30 PM" },
    isVerified: false,
  },
  {
    title: "Whitefield Executive PG",
    description: "Executive PG accommodation in Whitefield near ITPL. Ideal for IT professionals. Single and double sharing rooms with premium furnishing.",
    price: 13000,
    type: "PG",
    gender: "any",
    address: { street: "ITPL Main Road, Whitefield", city: "Bangalore", state: "Karnataka", pincode: "560066" },
    location: { type: "Point", coordinates: [77.7500, 12.9698] },
    amenities: { ac: true, wifi: true, meals: true, laundry: true, parking: true, hotWater: true, powerBackup: true, security: true },
    rules: { vegOnly: false, noSmoking: true, noAlcohol: false, guestPolicy: "No restrictions", curfewTime: "No curfew" },
    isVerified: false,
  },
  {
    title: "Noida Sector 62 Hostel",
    description: "Student hostel near Amity University and JIIT. AC and non-AC rooms available. Common study hall and recreation room.",
    price: 9000,
    type: "Hostel",
    gender: "any",
    address: { street: "Sector 62", city: "Noida", state: "Uttar Pradesh", pincode: "201301" },
    location: { type: "Point", coordinates: [77.3630, 28.6270] },
    amenities: { ac: true, wifi: true, meals: true, laundry: true, parking: false, hotWater: true, powerBackup: true, security: true },
    rules: { vegOnly: false, noSmoking: true, noAlcohol: true, guestPolicy: "Guests allowed till 7 PM", curfewTime: "10:00 PM" },
    isVerified: false,
  },
  {
    title: "Hadapsar Budget PG",
    description: "Most affordable PG in Hadapsar area. Clean rooms, basic amenities. Near EON IT Park and Magarpatta City.",
    price: 4500,
    type: "PG",
    gender: "male",
    address: { street: "Hadapsar Industrial Estate", city: "Pune", state: "Maharashtra", pincode: "411028" },
    location: { type: "Point", coordinates: [73.9260, 18.5089] },
    amenities: { ac: false, wifi: true, meals: false, laundry: false, parking: false, hotWater: true, powerBackup: false, security: false },
    rules: { vegOnly: false, noSmoking: false, noAlcohol: false, guestPolicy: "No restrictions", curfewTime: "No curfew" },
    isVerified: false,
  },
];

// ── Main seed function ─────────────────────────────────────────────────
async function seed() {
  try {
    console.log("🌱 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    console.log("🧹 Clearing existing data...");
    await Promise.all([
      Listing.deleteMany({}),
      User.deleteMany({}),
      Inquiry.deleteMany({}),
      Saved.deleteMany({}),
    ]);

    // Create users
    console.log("👤 Creating seed users...");
    await User.create([
      {
        clerkId: OWNER_ID,
        name: "Rajesh Kumar",
        email: "rajesh.owner@pgfinder.in",
        role: "owner",
        phone: "9876543210",
      },
      {
        clerkId: STUDENT_ID,
        name: "Priya Sharma",
        email: "priya.student@pgfinder.in",
        role: "student",
        phone: "9876543211",
      },
    ]);

    // Create listings
    console.log("🏠 Creating 15 PG listings...");
    const createdListings = await Listing.create(
      listings.map((listing) => ({
        ...listing,
        ownerId: OWNER_ID,
        photos: [
          PHOTOS[Math.floor(Math.random() * PHOTOS.length)],
          PHOTOS[Math.floor(Math.random() * PHOTOS.length)],
          PHOTOS[Math.floor(Math.random() * PHOTOS.length)],
        ],
        isActive: true,
      }))
    );

    // Create saved items
    console.log("❤️ Creating saved listings for student...");
    await Saved.create([
      { studentId: STUDENT_ID, listingId: createdListings[0]._id },
      { studentId: STUDENT_ID, listingId: createdListings[3]._id },
      { studentId: STUDENT_ID, listingId: createdListings[6]._id },
    ]);

    // Create inquiries
    console.log("💬 Creating sample inquiries...");
    await Inquiry.create([
      {
        listingId: createdListings[0]._id,
        listingTitle: createdListings[0].title,
        studentId: STUDENT_ID,
        ownerId: OWNER_ID,
        message:
          "Hi, I am a 2nd year student at DTU. Is there availability for a single room from next month? I am looking for a veg-only PG with AC.",
        status: "responded",
      },
      {
        listingId: createdListings[3]._id,
        listingTitle: createdListings[3].title,
        studentId: STUDENT_ID,
        ownerId: OWNER_ID,
        message:
          "Hello! I will be joining Christ University in August. Do you have any double-sharing rooms available? What is the security deposit?",
        status: "pending",
      },
      {
        listingId: createdListings[8]._id,
        listingTitle: createdListings[8].title,
        studentId: STUDENT_ID,
        ownerId: OWNER_ID,
        message:
          "I am interested in your hostel near Symbiosis. Can I visit this weekend to see the room and facilities?",
        status: "pending",
      },
    ]);

    console.log("\n✅ Seed completed successfully!");
    console.log(`   📍 ${createdListings.length} listings created`);
    console.log(`   👤 2 users created (1 owner, 1 student)`);
    console.log(`   ❤️ 3 saved listings created`);
    console.log(`   💬 3 inquiries created`);
    console.log(`\n   🔑 Owner ID: ${OWNER_ID}`);
    console.log(`   🔑 Student ID: ${STUDENT_ID}`);
    console.log(`\n   Cities: Delhi, Bangalore, Pune, Noida`);
    console.log(`   Verified: ${createdListings.filter((l) => l.isVerified).length} listings`);
  } catch (error) {
    console.error("❌ Seed failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\n🔌 Disconnected from MongoDB");
  }
}

seed();

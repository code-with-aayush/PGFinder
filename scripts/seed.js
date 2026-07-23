// PGFinder Fresh Seed Script
// Run: node scripts/seed.js
// Cleans all collections and populates 20 sample PG listings for Test PG Owner

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
    ownerPhone: String,
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

const ConversationSchema = new mongoose.Schema({
  studentId: String,
  studentName: String,
  studentEmail: String,
  ownerId: String,
  listingId: mongoose.Schema.Types.ObjectId,
  listingTitle: String,
  lastMessage: String,
  lastMessageAt: Date,
  unreadCountStudent: Number,
  unreadCountOwner: Number,
  createdAt: Date,
  updatedAt: Date,
});

const MessageSchema = new mongoose.Schema({
  conversationId: mongoose.Schema.Types.ObjectId,
  senderId: String,
  senderRole: String,
  content: String,
  read: Boolean,
  createdAt: Date,
});

const Listing = mongoose.models.Listing || mongoose.model("Listing", ListingSchema);
const User = mongoose.models.User || mongoose.model("User", UserSchema);
const Inquiry = mongoose.models.Inquiry || mongoose.model("Inquiry", InquirySchema);
const Saved = mongoose.models.Saved || mongoose.model("Saved", SavedSchema);
const Conversation = mongoose.models.Conversation || mongoose.model("Conversation", ConversationSchema);
const Message = mongoose.models.Message || mongoose.model("Message", MessageSchema);

const OWNER_ID = null;
const OWNER_EMAIL = "spidertech1515@gmail.com";
const OWNER_PHONE = "9876543210";

async function resolveOwner() {
  const secret = process.env.CLERK_SECRET_KEY;
  if (!secret) throw new Error("CLERK_SECRET_KEY is required to resolve the owner account");
  const response = await fetch(`https://api.clerk.com/v1/users?email_address=${encodeURIComponent(OWNER_EMAIL)}`, { headers: { Authorization: `Bearer ${secret}` } });
  if (!response.ok) throw new Error(`Clerk lookup failed: ${response.status}`);
  const users = await response.json();
  if (!Array.isArray(users) || users.length !== 1) throw new Error(`Expected exactly one Clerk user for ${OWNER_EMAIL}`);
  const owner = users[0];
  const metadataResponse = await fetch(`https://api.clerk.com/v1/users/${owner.id}/metadata`, {
    method: "PATCH", headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
    body: JSON.stringify({ public_metadata: { ...(owner.public_metadata || {}), role: "owner" } }),
  });
  if (!metadataResponse.ok) throw new Error(`Unable to assign owner role in Clerk: ${metadataResponse.status}`);
  return { id: owner.id, name: `${owner.first_name || ""} ${owner.last_name || ""}`.trim() || "PG Owner" };
}
const PHOTOS = [
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&h=600&fit=crop",
];

const listings = [
  {
    title: "Sunshine PG for Girls",
    description: "Well-maintained girls PG with home-cooked meals. Located near DTU campus. Spacious rooms with attached bathrooms, 24/7 security and CCTV surveillance.",
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
    description: "Premium boys hostel with modern amenities. AC rooms, high-speed WiFi, and gym access. Located in Hauz Khas with excellent metro connectivity.",
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
    description: "Budget-friendly PG for DU North Campus students. Clean rooms, filtered RO water, and home-style food.",
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
    description: "Modern co-living space in Koramangala 5th Block. Perfect for Christ University and PES students. Fully furnished rooms.",
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
    description: "Safe and secure girls PG in BTM Layout 2nd Stage. Strict biometric security and homely environment.",
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
    description: "Affordable boys hostel in HSR Sector 2. Double and triple sharing available with gaming lounge.",
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
    title: "Indiranagar Premium Co-Living",
    description: "Luxury co-living accommodation in Indiranagar. Walking distance to 100 Feet Road with weekly room cleaning.",
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
    description: "Affordable PG near MIT Pune and Cummins College. Authentic Maharashtrian meals included.",
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
    title: "Viman Nagar Executive PG",
    description: "Premium student accommodation near Symbiosis International University. High-speed 300Mbps WiFi and AC.",
    price: 11000,
    type: "PG",
    gender: "female",
    address: { street: "Near Symbiosis Campus, Viman Nagar", city: "Pune", state: "Maharashtra", pincode: "411014" },
    location: { type: "Point", coordinates: [73.9143, 18.5679] },
    amenities: { ac: true, wifi: true, meals: true, laundry: true, parking: true, hotWater: true, powerBackup: true, security: true },
    rules: { vegOnly: false, noSmoking: true, noAlcohol: true, guestPolicy: "Guests allowed till 9 PM", curfewTime: "10:30 PM" },
    isVerified: true,
  },
  {
    title: "Powai Lake View PG for Boys",
    description: "Scenic Lake view PG near IIT Bombay campus. Fully furnished rooms with balcony, desk, and daily housekeeping.",
    price: 14500,
    type: "PG",
    gender: "male",
    address: { street: "Hiranandani Gardens, Powai", city: "Mumbai", state: "Maharashtra", pincode: "400076" },
    location: { type: "Point", coordinates: [72.9116, 19.1176] },
    amenities: { ac: true, wifi: true, meals: true, laundry: true, parking: true, hotWater: true, powerBackup: true, security: true },
    rules: { vegOnly: false, noSmoking: true, noAlcohol: false, guestPolicy: "Guests allowed", curfewTime: "11:30 PM" },
    isVerified: true,
  },
  {
    title: "Andheri West Girls PG",
    description: "Prime location girls PG near Mithibai and NMIMS colleges. Modern security system with female warden.",
    price: 13000,
    type: "PG",
    gender: "female",
    address: { street: "JVPD Scheme, Andheri West", city: "Mumbai", state: "Maharashtra", pincode: "400049" },
    location: { type: "Point", coordinates: [72.8347, 19.1072] },
    amenities: { ac: true, wifi: true, meals: true, laundry: true, parking: false, hotWater: true, powerBackup: true, security: true },
    rules: { vegOnly: true, noSmoking: true, noAlcohol: true, guestPolicy: "No male guests", curfewTime: "10:00 PM" },
    isVerified: true,
  },
  {
    title: "Gachibowli Tech Hub PG",
    description: "Spacious PG accommodation near IIIT Hyderabad and ISB. Quiet study atmosphere with high-speed fiber internet.",
    price: 8000,
    type: "Hostel",
    gender: "male",
    address: { street: "Near IIIT Junction, Gachibowli", city: "Hyderabad", state: "Telangana", pincode: "500032" },
    location: { type: "Point", coordinates: [78.3489, 17.4435] },
    amenities: { ac: true, wifi: true, meals: true, laundry: true, parking: true, hotWater: true, powerBackup: true, security: true },
    rules: { vegOnly: false, noSmoking: true, noAlcohol: true, guestPolicy: "Guests allowed till 8 PM", curfewTime: "10:00 PM" },
    isVerified: false,
  },
  {
    title: "Madhapur Luxury Co-Living",
    description: "Modern co-living space near Hitech City metro. 3 times buffet meal plan included.",
    price: 10500,
    type: "Flat Share",
    gender: "any",
    address: { street: "Image Gardens Road, Madhapur", city: "Hyderabad", state: "Telangana", pincode: "500081" },
    location: { type: "Point", coordinates: [78.3888, 17.4483] },
    amenities: { ac: true, wifi: true, meals: true, laundry: true, parking: true, hotWater: true, powerBackup: true, security: true },
    rules: { vegOnly: false, noSmoking: true, noAlcohol: false, guestPolicy: "Guests allowed", curfewTime: "No curfew" },
    isVerified: true,
  },
  {
    title: "Noida Sector 62 Student PG",
    description: "Comfortable student PG near Jaypee Institute and Noida Electronic City metro station.",
    price: 7000,
    type: "PG",
    gender: "any",
    address: { street: "Block B, Sector 62", city: "Noida", state: "Uttar Pradesh", pincode: "201309" },
    location: { type: "Point", coordinates: [77.3639, 28.6270] },
    amenities: { ac: true, wifi: true, meals: true, laundry: true, parking: true, hotWater: true, powerBackup: true, security: true },
    rules: { vegOnly: true, noSmoking: true, noAlcohol: true, guestPolicy: "Guests allowed till 8 PM", curfewTime: "10:00 PM" },
    isVerified: true,
  },
  {
    title: "Cyber City Boys PG",
    description: "Premium boys PG near Cyber Hub and Phase 3 Rapid Metro. Gym, pool table, and delicious food.",
    price: 12500,
    type: "PG",
    gender: "male",
    address: { street: "DLF Phase 3, Near Cyber Hub", city: "Gurgaon", state: "Haryana", pincode: "122002" },
    location: { type: "Point", coordinates: [77.0882, 28.4950] },
    amenities: { ac: true, wifi: true, meals: true, laundry: true, parking: true, hotWater: true, powerBackup: true, security: true },
    rules: { vegOnly: false, noSmoking: true, noAlcohol: false, guestPolicy: "No restrictions", curfewTime: "No curfew" },
    isVerified: true,
  },
  {
    title: "Golf Course Road Co-Living",
    description: "Luxury student & professional co-living space on Golf Course Road. Fully serviced suites.",
    price: 16000,
    type: "Flat Share",
    gender: "any",
    address: { street: "Sector 54, Golf Course Road", city: "Gurgaon", state: "Haryana", pincode: "122011" },
    location: { type: "Point", coordinates: [77.1052, 28.4398] },
    amenities: { ac: true, wifi: true, meals: true, laundry: true, parking: true, hotWater: true, powerBackup: true, security: true },
    rules: { vegOnly: false, noSmoking: true, noAlcohol: false, guestPolicy: "Guests allowed", curfewTime: "No curfew" },
    isVerified: true,
  },
  {
    title: "Satya Niketan DU South Campus PG",
    description: "Popular PG in Satya Niketan for South Campus DU students (Venky, ARSD, RLA colleges).",
    price: 9000,
    type: "PG",
    gender: "female",
    address: { street: "Main Market, Satya Niketan", city: "Delhi", state: "Delhi", pincode: "110021" },
    location: { type: "Point", coordinates: [77.1691, 28.5885] },
    amenities: { ac: true, wifi: true, meals: true, laundry: true, parking: false, hotWater: true, powerBackup: true, security: true },
    rules: { vegOnly: true, noSmoking: true, noAlcohol: true, guestPolicy: "Guests allowed till 7 PM", curfewTime: "9:30 PM" },
    isVerified: true,
  },
  {
    title: "Electronic City Phase 1 PG",
    description: "Affordable PG near Infosys Gate 1 and Wipro. Clean rooms with attached balcony and food.",
    price: 6800,
    type: "PG",
    gender: "male",
    address: { street: "Phase 1, Electronic City", city: "Bangalore", state: "Karnataka", pincode: "560100" },
    location: { type: "Point", coordinates: [77.6648, 12.8452] },
    amenities: { ac: false, wifi: true, meals: true, laundry: true, parking: true, hotWater: true, powerBackup: true, security: true },
    rules: { vegOnly: false, noSmoking: true, noAlcohol: true, guestPolicy: "Guests allowed till 8 PM", curfewTime: "10:00 PM" },
    isVerified: false,
  },
  {
    title: "Baner Road Boys Hostel",
    description: "Budget boys hostel on Baner Road near Cummins and Indira college campuses.",
    price: 7200,
    type: "Hostel",
    gender: "male",
    address: { street: "Baner Road, Near Balewadi High Street", city: "Pune", state: "Maharashtra", pincode: "411045" },
    location: { type: "Point", coordinates: [73.7868, 18.5590] },
    amenities: { ac: false, wifi: true, meals: true, laundry: false, parking: true, hotWater: true, powerBackup: true, security: true },
    rules: { vegOnly: false, noSmoking: true, noAlcohol: true, guestPolicy: "Guests allowed till 9 PM", curfewTime: "10:30 PM" },
    isVerified: false,
  },
  {
    title: "Bandra West Luxury PG",
    description: "Exclusive luxury PG in Bandra West near St. Xavier's and National College. Fully serviced luxury apartment.",
    price: 18000,
    type: "PG",
    gender: "any",
    address: { street: "Hill Road, Bandra West", city: "Mumbai", state: "Maharashtra", pincode: "400050" },
    location: { type: "Point", coordinates: [72.8311, 19.0596] },
    amenities: { ac: true, wifi: true, meals: true, laundry: true, parking: true, hotWater: true, powerBackup: true, security: true },
    rules: { vegOnly: false, noSmoking: true, noAlcohol: false, guestPolicy: "Guests allowed", curfewTime: "No curfew" },
    isVerified: true,
  },
];

// ── Main seed function ─────────────────────────────────────────────────
async function seed() {
  try {
    console.log("🌱 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Verify the real Clerk owner before any destructive database action.
    const owner = await resolveOwner();
    const ownerId = owner.id;
    // Clear existing data
    console.log("🧹 Clearing all existing database collections...");
    await Promise.all([
      Listing.deleteMany({}),
      User.deleteMany({}),
      Inquiry.deleteMany({}),
      Saved.deleteMany({}),
      Conversation.deleteMany({}),
      Message.deleteMany({}),
    ]);


    console.log("Creating the real PG owner user...");
    await User.create({
      clerkId: ownerId,
      name: owner.name,
      email: OWNER_EMAIL,
      role: "owner",
      phone: OWNER_PHONE,
    });
    // Create 20 listings
    console.log("🏠 Creating 20 fresh PG listings...");
    const createdListings = await Listing.create(
      listings.map((listing, idx) => ({
        ...listing,
        ownerId: ownerId,
        ownerPhone: OWNER_PHONE,
        photos: [
          PHOTOS[idx % PHOTOS.length],
          PHOTOS[(idx + 1) % PHOTOS.length],
          PHOTOS[(idx + 2) % PHOTOS.length],
        ],
        isActive: true,
      }))
    );

    console.log("\n=======================================================");
    console.log("  🎉 FRESH DATABASE SEED COMPLETED SUCCESSFULLY!");
    console.log("=======================================================");
    console.log(`   📍 ${createdListings.length} PG Listings Created`);
    console.log(`   👤 1 Test Owner User Created`);
    console.log(`\n   🔑 TEST PG OWNER CREDENTIALS:`);
    console.log(`      • Email: ${OWNER_EMAIL}`);
    console.log(`      • Owner ID: ${ownerId}`);
    console.log(`      • Phone: ${OWNER_PHONE}`);
    console.log(`\n   🎓 STUDENT ID:`);
    console.log(`      • Use your own personal login/sign-up account!`);
    console.log(`\n   Cities: Delhi, Bangalore, Pune, Mumbai, Hyderabad, Noida, Gurgaon`);
    console.log(`   Verified: ${createdListings.filter((l) => l.isVerified).length} listings`);
    console.log("=======================================================\n");
  } catch (error) {
    console.error("❌ Seed failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

seed();

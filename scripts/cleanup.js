const mongoose = require("mongoose");
require("dotenv").config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI || MONGODB_URI.includes("placeholder")) {
  console.error("❌ Invalid or missing MONGODB_URI in .env.local");
  process.exit(1);
}

async function cleanup() {
  try {
    console.log("🌱 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB.");

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();

    for (const col of collections) {
      await db.collection(col.name).deleteMany({});
      console.log(`🧹 Cleared collection: ${col.name}`);
    }

    console.log("✅ Database cleanup complete! All collections cleared.");
  } catch (error) {
    console.error("❌ Cleanup failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

cleanup();

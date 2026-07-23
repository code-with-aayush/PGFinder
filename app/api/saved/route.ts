import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Saved from "@/models/Saved";
import Listing from "@/models/Listing";
import User from "@/models/User";

async function requireStudent(userId: string) {
  const clerkUser = await currentUser();
  if (!clerkUser || clerkUser.publicMetadata?.role !== "student") return false;
  await User.findOneAndUpdate(
    { clerkId: userId },
    { $set: { name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || "Student", email: clerkUser.primaryEmailAddress?.emailAddress || "", role: "student" } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  return true;
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await connectToDatabase();
    if (!(await requireStudent(userId))) return NextResponse.json({ error: "Only students can access saved listings" }, { status: 403 });
    const savedItems = await Saved.find({ studentId: userId }).sort({ savedAt: -1 }).lean();
    const listings = await Listing.find({ _id: { $in: savedItems.map((item) => item.listingId) } }).lean();
    return NextResponse.json({ saved: savedItems.map((item) => ({ ...item, listing: listings.find((listing) => listing._id.toString() === item.listingId.toString()) })) });
  } catch (error) {
    console.error("Unable to load saved listings", error);
    return NextResponse.json({ error: "Unable to load saved listings. Please try again." }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { listingId } = await request.json();
    if (!listingId) return NextResponse.json({ error: "listingId is required" }, { status: 400 });
    await connectToDatabase();
    if (!(await requireStudent(userId))) return NextResponse.json({ error: "Only students can save listings" }, { status: 403 });
    if (!(await Listing.exists({ _id: listingId, isActive: true }))) return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    const saved = await Saved.findOneAndUpdate({ studentId: userId, listingId }, { $setOnInsert: { studentId: userId, listingId, savedAt: new Date() } }, { upsert: true, new: true });
    return NextResponse.json({ saved }, { status: 201 });
  } catch (error) {
    console.error("Unable to save listing", error);
    return NextResponse.json({ error: "Unable to save listing. Please try again." }, { status: 503 });
  }
}
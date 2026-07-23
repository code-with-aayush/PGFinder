import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Saved from "@/models/Saved";
import Listing from "@/models/Listing";
import User from "@/models/User";
import { mockDb } from "@/lib/mockDb";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      if (!process.env.MONGODB_URI || process.env.MONGODB_URI.includes("placeholder")) {
        throw new Error("No MongoDB URI");
      }
      await connectToDatabase();

      const user = await User.findOne({ clerkId: userId });
      if (!user || user.role !== "student") {
        return NextResponse.json(
          { error: "Only students can access saved listings" },
          { status: 403 }
        );
      }

      const savedItems = await Saved.find({ studentId: userId })
        .sort({ savedAt: -1 })
        .lean();

      const listingIds = savedItems.map((item) => item.listingId);
      const listings = await Listing.find({ _id: { $in: listingIds } }).lean();

      const savedListings = savedItems.map((item) => ({
        ...item,
        listing: listings.find(
          (l) => l._id.toString() === item.listingId.toString()
        ),
      }));

      return NextResponse.json({ saved: savedListings });
    } catch {
      // Mock fallback
      const savedItems = mockDb.getSaved(userId);
      const savedListings = savedItems.map((item) => ({
        ...item,
        listing: mockDb.getListingById(item.listingId),
      }));
      return NextResponse.json({ saved: savedListings });
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch saved listings";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { listingId } = body;

    if (!listingId) {
      return NextResponse.json(
        { error: "listingId is required" },
        { status: 400 }
      );
    }

    try {
      if (!process.env.MONGODB_URI || process.env.MONGODB_URI.includes("placeholder")) {
        throw new Error("No MongoDB URI");
      }
      await connectToDatabase();

      const user = await User.findOne({ clerkId: userId });
      if (!user || user.role !== "student") {
        return NextResponse.json(
          { error: "Only students can save listings" },
          { status: 403 }
        );
      }

      const listing = await Listing.findById(listingId);
      if (!listing) {
        return NextResponse.json(
          { error: "Listing not found" },
          { status: 404 }
        );
      }

      try {
        const saved = await Saved.create({
          studentId: userId,
          listingId,
        });

        return NextResponse.json({ saved }, { status: 201 });
      } catch (err) {
        if (
          err instanceof Error &&
          "code" in err &&
          (err as { code: number }).code === 11000
        ) {
          return NextResponse.json(
            { error: "Listing already saved" },
            { status: 409 }
          );
        }
        throw err;
      }
    } catch {
      // Mock fallback
      try {
        const saved = mockDb.saveListing(userId, listingId);
        return NextResponse.json({ saved }, { status: 201 });
      } catch {
        return NextResponse.json(
          { error: "Listing already saved" },
          { status: 409 }
        );
      }
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to save listing";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

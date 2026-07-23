import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Listing from "@/models/Listing";
import Saved from "@/models/Saved";
import Inquiry from "@/models/Inquiry";
import { updateListingSchema } from "@/lib/validations";
import { isValidObjectId } from "@/lib/utils";
import { mockDb } from "@/lib/mockDb";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    try {
      if (!process.env.MONGODB_URI || process.env.MONGODB_URI.includes("placeholder")) {
        throw new Error("No MongoDB URI");
      }
      if (!isValidObjectId(id)) {
        throw new Error("Invalid ObjectId format");
      }
      await connectToDatabase();
      const listing = await Listing.findById(id).lean();
      if (!listing) {
        return NextResponse.json(
          { error: "Listing not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ listing });
    } catch {
      // Mock fallback
      const listing = mockDb.getListingById(id);
      if (!listing) {
        return NextResponse.json(
          { error: "Listing not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ listing });
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch listing";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const validation = updateListingSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    try {
      if (!process.env.MONGODB_URI || process.env.MONGODB_URI.includes("placeholder")) {
        throw new Error("No MongoDB URI");
      }
      if (!isValidObjectId(id)) {
        throw new Error("Invalid ObjectId format");
      }
      await connectToDatabase();

      const listing = await Listing.findById(id);
      if (!listing) {
        return NextResponse.json(
          { error: "Listing not found" },
          { status: 404 }
        );
      }

      if (listing.ownerId !== userId) {
        return NextResponse.json(
          { error: "You can only edit your own listings" },
          { status: 403 }
        );
      }

      const updatedListing = await Listing.findByIdAndUpdate(
        id,
        { $set: validation.data },
        { new: true, runValidators: true }
      ).lean();

      return NextResponse.json({ listing: updatedListing });
    } catch {
      // Mock fallback
      const listing = mockDb.getListingById(id);
      if (!listing) {
        return NextResponse.json(
          { error: "Listing not found" },
          { status: 404 }
        );
      }
      if (listing.ownerId !== userId) {
        return NextResponse.json(
          { error: "You can only edit your own listings" },
          { status: 403 }
        );
      }
      const updatedListing = mockDb.updateListing(id, validation.data);
      return NextResponse.json({ listing: updatedListing });
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update listing";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    try {
      if (!process.env.MONGODB_URI || process.env.MONGODB_URI.includes("placeholder")) {
        throw new Error("No MongoDB URI");
      }
      if (!isValidObjectId(id)) {
        throw new Error("Invalid ObjectId format");
      }
      await connectToDatabase();

      const listing = await Listing.findById(id);
      if (!listing) {
        return NextResponse.json(
          { error: "Listing not found" },
          { status: 404 }
        );
      }

      if (listing.ownerId !== userId) {
        return NextResponse.json(
          { error: "You can only delete your own listings" },
          { status: 403 }
        );
      }

      await Promise.all([
        Listing.findByIdAndDelete(id),
        Saved.deleteMany({ listingId: id }),
        Inquiry.deleteMany({ listingId: id }),
      ]);

      return NextResponse.json({ message: "Listing deleted successfully" });
    } catch {
      // Mock fallback
      const listing = mockDb.getListingById(id);
      if (listing && listing.ownerId !== userId) {
        return NextResponse.json(
          { error: "You can only delete your own listings" },
          { status: 403 }
        );
      }
      mockDb.deleteListing(id);
      return NextResponse.json({ message: "Listing deleted successfully" });
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete listing";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

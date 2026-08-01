import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Inquiry from "@/models/Inquiry";
import Listing from "@/models/Listing";
import User from "@/models/User";
import { inquirySchema } from "@/lib/validations";
import { mockDb } from "@/lib/mockDb";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUserRecord = await currentUser();
    const userEmail = (currentUserRecord?.primaryEmailAddress?.emailAddress ?? currentUserRecord?.emailAddresses?.[0]?.emailAddress)?.toLowerCase();

    const { searchParams } = new URL(request.url);
    const roleParam = searchParams.get("role");

    try {
      if (!process.env.MONGODB_URI || process.env.MONGODB_URI.includes("placeholder")) {
        throw new Error("No MongoDB URI");
      }
      await connectToDatabase();

      const user = await User.findOne({ clerkId: userId });
      const targetRole = roleParam || user?.role || "student";

      let inquiries;
      if (targetRole === "student") {
        inquiries = await Inquiry.find({ studentId: userId })
          .sort({ createdAt: -1 })
          .lean();
      } else if (targetRole === "owner") {
        inquiries = await Inquiry.find({ ownerId: userId })
          .sort({ createdAt: -1 })
          .lean();
      } else {
        return NextResponse.json({ error: "Invalid role" }, { status: 403 });
      }

      return NextResponse.json({ inquiries });
    } catch {
      // Mock fallback strictly respecting requested or user role
      const targetRole = (roleParam === "owner" ? "owner" : "student") as "student" | "owner";
      const inquiries = mockDb.getInquiries(targetRole, userId, userEmail);
      return NextResponse.json({ inquiries });
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch inquiries";
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
    const validation = inquirySchema.safeParse(body);

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
      await connectToDatabase();

      const user = await User.findOne({ clerkId: userId });
      const studentName = user?.name || "Student User";
      const studentEmail = user?.email || "";

      const listing = await Listing.findById(validation.data.listingId);
      if (!listing) {
        return NextResponse.json(
          { error: "Listing not found" },
          { status: 404 }
        );
      }

      const inquiry = await Inquiry.create({
        listingId: validation.data.listingId,
        listingTitle: listing.title,
        studentId: userId,
        studentName,
        studentEmail,
        ownerId: listing.ownerId,
        message: validation.data.message,
      });

      return NextResponse.json({ inquiry }, { status: 201 });
    } catch {
      // Mock fallback
      const listing = mockDb.getListingById(validation.data.listingId);
      const inquiry = mockDb.createInquiry({
        listingId: validation.data.listingId,
        listingTitle: listing ? listing.title : "Mock PG Listing",
        studentId: userId,
        studentName: "Student User",
        studentEmail: "student@example.com",
        ownerId: listing ? listing.ownerId : "seed_owner_001",
        message: validation.data.message,
        status: "pending",
      });
      return NextResponse.json({ inquiry }, { status: 201 });
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create inquiry";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Inquiry from "@/models/Inquiry";
import User from "@/models/User";
import { isValidObjectId } from "@/lib/utils";
import { mockDb } from "@/lib/mockDb";

export async function PATCH(
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
        return NextResponse.json(
          { error: "Invalid inquiry ID" },
          { status: 400 }
        );
      }
      await connectToDatabase();

      const user = await User.findOne({ clerkId: userId });
      if (!user || user.role !== "owner") {
        return NextResponse.json(
          { error: "Only owners can update inquiry status" },
          { status: 403 }
        );
      }

      const inquiry = await Inquiry.findById(id);
      if (!inquiry) {
        return NextResponse.json(
          { error: "Inquiry not found" },
          { status: 404 }
        );
      }

      if (inquiry.ownerId !== userId) {
        return NextResponse.json(
          { error: "You can only update your own inquiries" },
          { status: 403 }
        );
      }

      inquiry.status = "responded";
      await inquiry.save();

      return NextResponse.json({ inquiry });
    } catch {
      // Mock fallback
      mockDb.respondInquiry(id, userId);
      return NextResponse.json({ message: "Inquiry responded" });
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update inquiry";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

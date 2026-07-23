import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Saved from "@/models/Saved";
import User from "@/models/User";
import { isValidObjectId } from "@/lib/utils";
import { mockDb } from "@/lib/mockDb";

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

    await connectToDatabase();
    const clerkUser = await currentUser();
    if (!clerkUser || clerkUser.publicMetadata?.role !== "student") return NextResponse.json({ error: "Only students can unsave listings" }, { status: 403 });
    if (!isValidObjectId(id)) return NextResponse.json({ error: "Invalid listing ID" }, { status: 400 });
    const result = await Saved.findOneAndDelete({ studentId: userId, listingId: id });
    if (!result) return NextResponse.json({ error: "Saved listing not found" }, { status: 404 });
    return NextResponse.json({ message: "Listing unsaved successfully" });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to unsave listing";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

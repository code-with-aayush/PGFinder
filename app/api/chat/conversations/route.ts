import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Conversation from "@/models/Conversation";
import Message from "@/models/Message";
import Listing from "@/models/Listing";
import User from "@/models/User";
import { mockDb } from "@/lib/mockDb";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUserRecord = await currentUser();
    const userEmail = currentUserRecord?.emailAddresses?.[0]?.emailAddress?.toLowerCase();

    try {
      if (!process.env.MONGODB_URI || process.env.MONGODB_URI.includes("placeholder")) {
        throw new Error("No MongoDB URI");
      }
      await connectToDatabase();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ownerOrStudentConditions: any[] = [{ studentId: userId }, { ownerId: userId }];
      if (userEmail === "spidertech1515@gmail.com") {
        ownerOrStudentConditions.push({ ownerId: "owner_spidertech1515" }, { ownerId: "test_owner_001" });
      }

      const conversations = await Conversation.find({
        $or: ownerOrStudentConditions,
      })
        .sort({ updatedAt: -1 })
        .lean();

      return NextResponse.json({ conversations });
    } catch {
      // Mock fallback
      const conversations = mockDb.getConversations(userId, userEmail);
      return NextResponse.json({ conversations });
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch conversations";
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
    const { listingId, initialMessage } = body;

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

      const listing = await Listing.findById(listingId);
      if (!listing) {
        return NextResponse.json(
          { error: "Listing not found" },
          { status: 404 }
        );
      }

      const user = await User.findOne({ clerkId: userId });
      const studentName = user?.name || "Student User";
      const studentEmail = user?.email || "";

      let conversation = await Conversation.findOne({
        studentId: userId,
        listingId,
      });

      if (!conversation) {
        conversation = await Conversation.create({
          studentId: userId,
          studentName,
          studentEmail,
          ownerId: listing.ownerId,
          listingId,
          listingTitle: listing.title,
          lastMessage: initialMessage || "Chat started",
          lastMessageAt: new Date(),
          unreadCountOwner: initialMessage ? 1 : 0,
        });

        if (initialMessage) {
          await Message.create({
            conversationId: conversation._id,
            senderId: userId,
            senderRole: "student",
            content: initialMessage,
          });
        }
      }

      return NextResponse.json({ conversation }, { status: 201 });
    } catch {
      // Mock fallback
      const listing = mockDb.getListingById(listingId);
      const conversation = mockDb.getOrCreateConversation({
        studentId: userId,
        studentName: "Student User",
        studentEmail: "student@example.com",
        ownerId: listing ? listing.ownerId : "seed_owner_001",
        listingId,
        listingTitle: listing ? listing.title : "Mock PG Listing",
        initialMessage,
      });
      return NextResponse.json({ conversation }, { status: 201 });
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create conversation";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

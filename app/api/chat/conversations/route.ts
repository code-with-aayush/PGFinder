import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Conversation from "@/models/Conversation";
import Message from "@/models/Message";
import Listing from "@/models/Listing";
import User from "@/models/User";

const MAX_MESSAGE_LENGTH = 2000;

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await connectToDatabase();
    const conversations = await Conversation.find({ $or: [{ studentId: userId }, { ownerId: userId }] }).sort({ lastMessageAt: -1, _id: -1 }).lean();
    return NextResponse.json({ conversations });
  } catch (error) {
    console.error("Unable to load chat conversations", error);
    return NextResponse.json({ error: "Chat is temporarily unavailable. Please try again." }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { listingId, initialMessage } = await request.json();
    const content = typeof initialMessage === "string" ? initialMessage.trim() : "";
    if (!listingId || typeof listingId !== "string") return NextResponse.json({ error: "listingId is required" }, { status: 400 });
    if (content.length > MAX_MESSAGE_LENGTH) return NextResponse.json({ error: `Messages must be ${MAX_MESSAGE_LENGTH} characters or fewer` }, { status: 400 });
    await connectToDatabase();
    const listing = await Listing.findById(listingId).lean();
    if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    if (listing.ownerId === userId) return NextResponse.json({ error: "You cannot start a chat about your own listing" }, { status: 400 });
    const [profile, clerkUser] = await Promise.all([User.findOne({ clerkId: userId }).lean(), currentUser()]);
    let conversation = await Conversation.findOne({ studentId: userId, listingId });
    if (!conversation) conversation = await Conversation.create({ studentId: userId, studentName: profile?.name || clerkUser?.fullName || "Student User", studentEmail: profile?.email || clerkUser?.emailAddresses[0]?.emailAddress || "", ownerId: listing.ownerId, listingId, listingTitle: listing.title, lastMessage: "", lastMessageAt: new Date() });
    let message = null;
    if (content) {
      message = await Message.create({ conversationId: conversation._id, senderId: userId, senderRole: "student", content });
      conversation.lastMessage = content; conversation.lastMessageAt = message.createdAt; conversation.unreadCountOwner += 1;
      await conversation.save();
    }
    return NextResponse.json({ conversation, message }, { status: 201 });
  } catch (error) {
    console.error("Unable to create chat conversation", error);
    return NextResponse.json({ error: "Unable to start this conversation. Please try again." }, { status: 503 });
  }
}
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Conversation from "@/models/Conversation";
import Message from "@/models/Message";

const MAX_MESSAGE_LENGTH = 2000;

async function getParticipantConversation(id: string, userId: string) {
  return Conversation.findOne({ _id: id, $or: [{ studentId: userId }, { ownerId: userId }] });
}

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await connectToDatabase();
    const conversation = await getParticipantConversation(params.id, userId);
    if (!conversation) return NextResponse.json({ error: "Conversation not found or access is denied" }, { status: 404 });
    const messages = await Message.find({ conversationId: conversation._id }).sort({ createdAt: 1, _id: 1 }).lean();
    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Unable to load chat messages", error);
    return NextResponse.json({ error: "Unable to load messages. Please try again." }, { status: 503 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { content: rawContent } = await request.json();
    const content = typeof rawContent === "string" ? rawContent.trim() : "";
    if (!content) return NextResponse.json({ error: "Message content cannot be empty" }, { status: 400 });
    if (content.length > MAX_MESSAGE_LENGTH) return NextResponse.json({ error: `Messages must be ${MAX_MESSAGE_LENGTH} characters or fewer` }, { status: 400 });
    await connectToDatabase();
    const conversation = await getParticipantConversation(params.id, userId);
    if (!conversation) return NextResponse.json({ error: "Conversation not found or access is denied" }, { status: 404 });
    const senderRole = conversation.ownerId === userId ? "owner" : "student";
    const message = await Message.create({ conversationId: conversation._id, senderId: userId, senderRole, content });
    conversation.lastMessage = content; conversation.lastMessageAt = message.createdAt;
    if (senderRole === "owner") conversation.unreadCountStudent += 1;
    else conversation.unreadCountOwner += 1;
    await conversation.save();
    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error("Unable to send chat message", error);
    return NextResponse.json({ error: "Unable to send message. Please try again." }, { status: 503 });
  }
}
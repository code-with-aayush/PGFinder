import mongoose, { Schema, Document, Model } from "mongoose";

export interface IConversation extends Document {
  studentId: string;
  studentName?: string;
  studentEmail?: string;
  ownerId: string;
  listingId: mongoose.Types.ObjectId;
  listingTitle: string;
  lastMessage: string;
  lastMessageAt: Date;
  unreadCountStudent: number;
  unreadCountOwner: number;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>(
  {
    studentId: { type: String, required: true, index: true },
    studentName: { type: String, default: "Student User" },
    studentEmail: { type: String, default: "" },
    ownerId: { type: String, required: true, index: true },
    listingId: {
      type: Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },
    listingTitle: { type: String, required: true },
    lastMessage: { type: String, default: "" },
    lastMessageAt: { type: Date, default: Date.now },
    unreadCountStudent: { type: Number, default: 0 },
    unreadCountOwner: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

ConversationSchema.index({ studentId: 1, ownerId: 1, listingId: 1 }, { unique: true });

const Conversation: Model<IConversation> =
  mongoose.models.Conversation ||
  mongoose.model<IConversation>("Conversation", ConversationSchema);

export default Conversation;

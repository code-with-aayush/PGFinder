import mongoose, { Schema, Document, Model } from "mongoose";

export interface IInquiry extends Document {
  listingId: mongoose.Types.ObjectId;
  listingTitle: string;
  studentId: string;
  studentName?: string;
  studentEmail?: string;
  ownerId: string;
  message: string;
  status: "pending" | "responded";
  createdAt: Date;
}

const InquirySchema = new Schema<IInquiry>(
  {
    listingId: {
      type: Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },
    listingTitle: { type: String, required: true },
    studentId: { type: String, required: true, index: true },
    studentName: { type: String },
    studentEmail: { type: String },
    ownerId: { type: String, required: true, index: true },
    message: { type: String, required: true, maxlength: 2000 },
    status: {
      type: String,
      enum: ["pending", "responded"],
      default: "pending",
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

const Inquiry: Model<IInquiry> =
  mongoose.models.Inquiry ||
  mongoose.model<IInquiry>("Inquiry", InquirySchema);

export default Inquiry;

import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISaved extends Document {
  studentId: string;
  listingId: mongoose.Types.ObjectId;
  savedAt: Date;
}

const SavedSchema = new Schema<ISaved>({
  studentId: { type: String, required: true },
  listingId: {
    type: Schema.Types.ObjectId,
    ref: "Listing",
    required: true,
  },
  savedAt: { type: Date, default: Date.now },
});

SavedSchema.index({ studentId: 1, listingId: 1 }, { unique: true });

const Saved: Model<ISaved> =
  mongoose.models.Saved || mongoose.model<ISaved>("Saved", SavedSchema);

export default Saved;

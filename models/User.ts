import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  clerkId: string;
  name: string;
  email: string;
  role: "student" | "owner";
  phone: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    clerkId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, maxlength: 100 },
    email: { type: String, required: true, maxlength: 254 },
    role: {
      type: String,
      required: true,
      enum: ["student", "owner"],
    },
    phone: { type: String, default: "", maxlength: 20 },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;

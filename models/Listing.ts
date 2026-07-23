import mongoose, { Schema, Document, Model } from "mongoose";

export interface IListing extends Document {
  ownerId: string;
  title: string;
  description: string;
  price: number;
  type: "PG" | "Hostel" | "Flat Share";
  gender: "male" | "female" | "any";
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  location: {
    type: "Point";
    coordinates: [number, number];
  };
  amenities: {
    ac: boolean;
    wifi: boolean;
    meals: boolean;
    laundry: boolean;
    parking: boolean;
    hotWater: boolean;
    powerBackup: boolean;
    security: boolean;
  };
  rules: {
    vegOnly: boolean;
    noSmoking: boolean;
    noAlcohol: boolean;
    guestPolicy: string;
    curfewTime: string;
  };
  photos: string[];
  isVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ListingSchema = new Schema<IListing>(
  {
    ownerId: { type: String, required: true, index: true },
    title: { type: String, required: true, maxlength: 100 },
    description: { type: String, required: true, maxlength: 2000 },
    price: { type: Number, required: true, min: 0 },
    type: {
      type: String,
      required: true,
      enum: ["PG", "Hostel", "Flat Share"],
    },
    gender: {
      type: String,
      required: true,
      enum: ["male", "female", "any"],
    },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    amenities: {
      ac: { type: Boolean, default: false },
      wifi: { type: Boolean, default: false },
      meals: { type: Boolean, default: false },
      laundry: { type: Boolean, default: false },
      parking: { type: Boolean, default: false },
      hotWater: { type: Boolean, default: false },
      powerBackup: { type: Boolean, default: false },
      security: { type: Boolean, default: false },
    },
    rules: {
      vegOnly: { type: Boolean, default: false },
      noSmoking: { type: Boolean, default: false },
      noAlcohol: { type: Boolean, default: false },
      guestPolicy: { type: String, default: "No restrictions" },
      curfewTime: { type: String, default: "No curfew" },
    },
    photos: {
      type: [String],
      validate: {
        validator: (v: string[]) => v.length <= 10,
        message: "Maximum 10 photos allowed",
      },
    },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

ListingSchema.index({ location: "2dsphere" });
ListingSchema.index({ "address.city": "text" });

const Listing: Model<IListing> =
  mongoose.models.Listing || mongoose.model<IListing>("Listing", ListingSchema);

export default Listing;

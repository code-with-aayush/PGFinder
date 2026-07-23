import { z } from "zod";

export const createListingSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be under 100 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description must be under 2000 characters"),
  price: z
    .number()
    .min(500, "Price must be at least ₹500")
    .max(100000, "Price must be under ₹1,00,000"),
  type: z.enum(["PG", "Hostel", "Flat Share"]),
  gender: z.enum(["male", "female", "any"]),
  address: z.object({
    street: z.string().min(1, "Street is required").max(200),
    city: z.string().min(1, "City is required").max(100),
    state: z.string().min(1, "State is required").max(100),
    pincode: z
      .string()
      .regex(/^\d{6}$/, "Pincode must be 6 digits"),
  }),
  location: z.object({
    type: z.literal("Point"),
    coordinates: z.tuple([
      z.number().min(-180).max(180),
      z.number().min(-90).max(90),
    ]),
  }),
  amenities: z.object({
    ac: z.boolean().default(false),
    wifi: z.boolean().default(false),
    meals: z.boolean().default(false),
    laundry: z.boolean().default(false),
    parking: z.boolean().default(false),
    hotWater: z.boolean().default(false),
    powerBackup: z.boolean().default(false),
    security: z.boolean().default(false),
  }),
  rules: z.object({
    vegOnly: z.boolean().default(false),
    noSmoking: z.boolean().default(false),
    noAlcohol: z.boolean().default(false),
    guestPolicy: z.string().max(200).default("No restrictions"),
    curfewTime: z.string().max(50).default("No curfew"),
  }),
  photos: z
    .array(z.string().url("Invalid photo URL"))
    .min(1, "At least 1 photo is required")
    .max(10, "Maximum 10 photos allowed"),
  ownerPhone: z
    .string()
    .regex(/^\d{10}$/, "Phone number must be a 10-digit mobile number")
    .optional()
    .or(z.literal("")),
});

export const updateListingSchema = createListingSchema.partial();

export const inquirySchema = z.object({
  listingId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid listing ID"),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message must be under 2000 characters"),
});

export const savedSchema = z.object({
  listingId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid listing ID"),
});

export const userSyncSchema = z.object({
  role: z.enum(["student", "owner"]),
});

export type CreateListingInput = z.infer<typeof createListingSchema>;
export type UpdateListingInput = z.infer<typeof updateListingSchema>;
export type InquiryInput = z.infer<typeof inquirySchema>;
export type SavedInput = z.infer<typeof savedSchema>;
export type UserSyncInput = z.infer<typeof userSyncSchema>;

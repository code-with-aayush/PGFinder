import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Listing from "@/models/Listing";
import User from "@/models/User";
import { createListingSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ownerId = searchParams.get("ownerId");
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") || 12)));
    const sort = searchParams.get("sort") || "newest";
    const query: Record<string, unknown> = ownerId ? { ownerId } : { isActive: true };

    if (ownerId) {
      const { userId } = await auth();
      if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      if (userId !== ownerId) return NextResponse.json({ error: "You can only view your own listings" }, { status: 403 });
    }
    const city = searchParams.get("city");
    if (city) query["address.city"] = { $regex: city, $options: "i" };
    const gender = searchParams.get("gender");
    if (gender && ["male", "female", "any"].includes(gender)) query.gender = gender;
    const type = searchParams.get("type");
    if (type && ["PG", "Hostel", "Flat Share"].includes(type)) query.type = type;
    for (const amenity of ["ac", "wifi", "meals"] as const) if (searchParams.get(amenity) === "true") query[`amenities.${amenity}`] = true;
    if (searchParams.get("veg") === "true") query["rules.vegOnly"] = true;
    if (searchParams.get("verified") === "true") query.isVerified = true;
    const minPrice = searchParams.get("minPrice"); const maxPrice = searchParams.get("maxPrice");
    if (minPrice || maxPrice) query.price = { ...(minPrice ? { $gte: Number(minPrice) } : {}), ...(maxPrice ? { $lte: Number(maxPrice) } : {}) };

    await connectToDatabase();
    const sortQuery: Record<string, 1 | -1> = sort === "price_asc" ? { price: 1 } : sort === "price_desc" ? { price: -1 } : { createdAt: -1 };
    const [listings, total] = await Promise.all([Listing.find(query).sort(sortQuery).skip((page - 1) * limit).limit(limit).lean(), Listing.countDocuments(query)]);
    return NextResponse.json({ listings, pagination: { page, limit, total, totalPages: Math.ceil(total / limit), hasMore: page * limit < total } });
  } catch (error) {
    console.error("Unable to load listings", error);
    return NextResponse.json({ error: "Unable to load listings. Please try again." }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const validation = createListingSchema.safeParse(await request.json());
  if (!validation.success) return NextResponse.json({ error: "Validation failed", details: validation.error.flatten() }, { status: 400 });
  try {
    await connectToDatabase();
    const clerkUser = await currentUser();
    if (!clerkUser || clerkUser.publicMetadata?.role !== "owner") {
      return NextResponse.json({ error: "Only owners can create listings" }, { status: 403 });
    }
    await User.findOneAndUpdate(
      { clerkId: userId },
      { $set: { name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || "Owner", email: clerkUser.primaryEmailAddress?.emailAddress || "", role: "owner" } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    const listing = await Listing.create({ ...validation.data, ownerId: userId, isActive: true, isVerified: false });
    return NextResponse.json({ listing }, { status: 201 });
  } catch (error) {
    console.error("Unable to create listing", error);
    return NextResponse.json({ error: "Unable to create listing. Please try again." }, { status: 503 });
  }
}
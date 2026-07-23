import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Listing from "@/models/Listing";
import User from "@/models/User";
import { createListingSchema } from "@/lib/validations";
import { mockDb } from "@/lib/mockDb";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const gender = searchParams.get("gender");
  const ac = searchParams.get("ac");
  const wifi = searchParams.get("wifi");
  const meals = searchParams.get("meals");
  const veg = searchParams.get("veg");
  const verified = searchParams.get("verified");
  const type = searchParams.get("type");
  const ownerId = searchParams.get("ownerId");
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const radius = searchParams.get("radius") || "5000";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = Math.min(parseInt(searchParams.get("limit") || "12", 10), 50);
  const sort = searchParams.get("sort") || "newest";

  try {
    if (!process.env.MONGODB_URI || process.env.MONGODB_URI.includes("placeholder")) {
      throw new Error("No MongoDB URI");
    }
    await connectToDatabase();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = { isActive: true };

    if (ownerId) {
      query.ownerId = ownerId;
      delete query.isActive;
    }

    if (lat && lng) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      const maxDistMeters = parseInt(radius, 10);
      if (!isNaN(latitude) && !isNaN(longitude)) {
        query.location = {
          $nearSphere: {
            $geometry: {
              type: "Point",
              coordinates: [longitude, latitude],
            },
            $maxDistance: maxDistMeters,
          },
        };
      }
    }

    if (city) {
      query["address.city"] = { $regex: city, $options: "i" };
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseInt(minPrice, 10);
      if (maxPrice) query.price.$lte = parseInt(maxPrice, 10);
    }

    if (gender && ["male", "female", "any"].includes(gender)) {
      query.gender = gender;
    }

    if (ac === "true") query["amenities.ac"] = true;
    if (wifi === "true") query["amenities.wifi"] = true;
    if (meals === "true") query["amenities.meals"] = true;
    if (veg === "true") query["rules.vegOnly"] = true;
    if (verified === "true") query.isVerified = true;

    if (type && ["PG", "Hostel", "Flat Share"].includes(type)) {
      query.type = type;
    }

    let sortQuery: Record<string, 1 | -1> = {};
    switch (sort) {
      case "price_asc":
        sortQuery = { price: 1 };
        break;
      case "price_desc":
        sortQuery = { price: -1 };
        break;
      case "newest":
      default:
        sortQuery = { createdAt: -1 };
        break;
    }

    const skip = (page - 1) * limit;

    const [listings, total] = await Promise.all([
      Listing.find(query).sort(sortQuery).skip(skip).limit(limit).lean(),
      Listing.countDocuments(query),
    ]);

    return NextResponse.json({
      listings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    });
  } catch {
    // DB offline or placeholder -> fallback to mockDb
    let mockListings = mockDb.getListings();

    if (ownerId) {
      mockListings = mockListings.filter((l) => l.ownerId === ownerId);
    } else {
      mockListings = mockListings.filter((l) => l.isActive);
    }

    if (city) {
      mockListings = mockListings.filter((l) =>
        l.address.city.toLowerCase().includes(city.toLowerCase())
      );
    }

    if (minPrice) {
      mockListings = mockListings.filter((l) => l.price >= parseInt(minPrice, 10));
    }
    if (maxPrice) {
      mockListings = mockListings.filter((l) => l.price <= parseInt(maxPrice, 10));
    }

    if (gender && gender !== "any") {
      mockListings = mockListings.filter((l) => l.gender === gender);
    }

    if (ac === "true") mockListings = mockListings.filter((l) => l.amenities.ac);
    if (wifi === "true") mockListings = mockListings.filter((l) => l.amenities.wifi);
    if (meals === "true") mockListings = mockListings.filter((l) => l.amenities.meals);
    if (veg === "true") mockListings = mockListings.filter((l) => l.rules.vegOnly);
    if (verified === "true") mockListings = mockListings.filter((l) => l.isVerified);
    if (type) mockListings = mockListings.filter((l) => l.type === type);

    if (sort === "price_asc") {
      mockListings.sort((a, b) => a.price - b.price);
    } else if (sort === "price_desc") {
      mockListings.sort((a, b) => b.price - a.price);
    } else {
      mockListings.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    const total = mockListings.length;
    const startIndex = (page - 1) * limit;
    const paginatedListings = mockListings.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      listings: paginatedListings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = createListingSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    try {
      if (!process.env.MONGODB_URI || process.env.MONGODB_URI.includes("placeholder")) {
        throw new Error("No MongoDB URI");
      }
      await connectToDatabase();

      const user = await User.findOne({ clerkId: userId });
      if (!user || user.role !== "owner") {
        return NextResponse.json(
          { error: "Only owners can create listings" },
          { status: 403 }
        );
      }

      const listing = await Listing.create({
        ...validation.data,
        ownerId: userId,
      });

      return NextResponse.json({ listing }, { status: 201 });
    } catch {
      // Mock creation fallback
      const listing = mockDb.createListing({
        ...validation.data,
        ownerId: userId,
        isVerified: false,
        isActive: true,
      });
      return NextResponse.json({ listing }, { status: 201 });
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create listing";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

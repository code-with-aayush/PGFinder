import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { role } = body;

    if (!role || !["student", "owner"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be 'student' or 'owner'." },
        { status: 400 }
      );
    }

    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 1. Always update Clerk publicMetadata FIRST so role is guaranteed in auth session
    try {
      const client = await clerkClient();
      await client.users.updateUserMetadata(userId, {
        publicMetadata: { role },
      });
    } catch (clerkErr) {
      console.error("Failed to update Clerk metadata:", clerkErr);
    }

    // 2. Try syncing to MongoDB if available
    let dbUser = null;
    try {
      if (process.env.MONGODB_URI && !process.env.MONGODB_URI.includes("placeholder")) {
        await connectToDatabase();
        const existingUser = await User.findOne({ clerkId: userId });
        if (existingUser) {
          dbUser = existingUser;
        } else {
          dbUser = await User.create({
            clerkId: userId,
            name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || "User",
            email: clerkUser.emailAddresses[0]?.emailAddress || "",
            role,
            phone: "",
          });
        }
      }
    } catch (dbErr) {
      console.warn("MongoDB user sync skipped/failed:", dbErr);
    }

    return NextResponse.json(
      { message: "User synced successfully", role, user: dbUser },
      { status: 200 }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      if (!process.env.MONGODB_URI || process.env.MONGODB_URI.includes("placeholder")) {
        throw new Error("No MongoDB URI");
      }
      await connectToDatabase();

      const user = await User.findOne({ clerkId: userId }).lean();
      if (!user) {
        return NextResponse.json({ user: null });
      }

      return NextResponse.json({ user });
    } catch {
      return NextResponse.json({ user: null });
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch user profile";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

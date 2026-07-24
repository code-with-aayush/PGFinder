import { NextResponse } from "next/server";

export async function PATCH() {
  return NextResponse.json({ error: "Inquiry statuses are no longer supported. Use chat to manage conversations." }, { status: 410 });
}
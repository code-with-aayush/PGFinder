import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/listings(.*)",
  "/map",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/onboarding",
  "/api/(.*)",
]);

const isOwnerRoute = createRouteMatcher([
  "/dashboard(.*)",
]);

const isStudentRoute = createRouteMatcher([
  "/saved(.*)",
  "/compare(.*)",
  "/inquiries(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();

  // 1. Unauthenticated user trying to access protected route
  if (!userId && !isPublicRoute(req)) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("redirect_url", req.url);
    return NextResponse.redirect(signInUrl);
  }

  if (userId) {
    const role = (sessionClaims?.publicMetadata as any)?.role as string | undefined;

    // 2. Enforce Owner Route protection (only block if explicitly student)
    if (isOwnerRoute(req) && role === "student") {
      return NextResponse.redirect(new URL("/listings", req.url));
    }

    // 3. Enforce Student Route protection (only block if explicitly owner)
    if (isStudentRoute(req) && role === "owner") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};

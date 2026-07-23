"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Building2, ArrowRight } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

export default function OnboardingPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<"student" | "owner" | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isLoaded) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    router.push("/sign-in");
    return null;
  }

  const existingRole = user.publicMetadata?.role as string | undefined;
  if (existingRole) {
    router.push(existingRole === "owner" ? "/dashboard" : "/listings");
    return null;
  }

  async function handleContinue() {
    if (!selectedRole || !user) return;

    setLoading(true);
    try {
      await axios.post("/api/users/sync", {
        role: selectedRole,
      });

      try {
        await user.reload();
      } catch {
        /* ignore reload errors */
      }

      toast.success(
        selectedRole === "owner"
          ? "Welcome! You can now list your PG accommodations."
          : "Welcome! Start exploring PG listings near your college."
      );

      // Force full reload so middleware and navigation pick up the new Clerk claims instantly
      window.location.href = selectedRole === "owner" ? "/dashboard" : "/listings";
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Welcome to PGFinder</h1>
          <p className="text-muted-foreground">
            Tell us who you are so we can personalize your experience
          </p>
        </div>

        <div className="grid gap-4">
          <Card
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedRole === "student"
                ? "border-primary ring-2 ring-primary ring-offset-2"
                : "hover:border-primary/50"
            }`}
            onClick={() => setSelectedRole("student")}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                  <GraduationCap className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">I&apos;m a Student</CardTitle>
                  <CardDescription>
                    Looking for PG accommodation near my college
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Search and filter PG listings</li>
                <li>• Save and compare your favorites</li>
                <li>• Contact owners directly via WhatsApp</li>
              </ul>
            </CardContent>
          </Card>

          <Card
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedRole === "owner"
                ? "border-primary ring-2 ring-primary ring-offset-2"
                : "hover:border-primary/50"
            }`}
            onClick={() => setSelectedRole("owner")}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
                  <Building2 className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">I&apos;m a PG Owner</CardTitle>
                  <CardDescription>
                    I want to list my PG accommodation
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• List your PG with photos and details</li>
                <li>• Receive student inquiries</li>
                <li>• Manage listings from your dashboard</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <Button
          onClick={handleContinue}
          disabled={!selectedRole || loading}
          className="w-full gap-2"
          size="lg"
        >
          {loading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Setting up your account...
            </>
          ) : (
            <>
              Continue
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

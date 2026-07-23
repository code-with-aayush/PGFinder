"use client";

import Link from "next/link";
import {
  Search,
  Shield,
  MapPin,
  ArrowRight,
  Star,
  Wifi,
  UtensilsCrossed,
  Building2,
  Plus,
  MessageSquare,
  TrendingUp,
  CheckCircle2,
  DollarSign,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useUserRole } from "@/lib/useUserRole";
import { useState } from "react";

export default function HomePage() {
  const { isOwner, isLoggedIn } = useUserRole();
  const [cityInput, setCityInput] = useState("");

  // ==================== OWNER MODE HOME PAGE ====================
  if (isOwner) {
    return (
      <>
        {/* Owner Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-primary/5 py-20 md:py-28">
          <div className="container relative z-10">
            <div className="mx-auto max-w-3xl text-center">
              <Badge variant="default" className="mb-4 px-4 py-1.5 text-sm bg-primary text-primary-foreground shadow-sm">
                🏢 PG Owner Portal
              </Badge>
              <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl">
                Grow Your PG Business &{" "}
                <span className="text-primary">Rent Out Rooms Faster</span>
              </h1>
              <p className="mb-8 text-lg text-muted-foreground md:text-xl">
                List your accommodations, receive direct student inquiries via WhatsApp, manage listings, and fill your rooms with 0% brokerage fees.
              </p>

              {/* Owner Action Buttons */}
              <div className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row justify-center">
                <Link href="/dashboard">
                  <Button size="lg" className="h-12 gap-2 px-8 w-full sm:w-auto shadow-md">
                    <Building2 className="h-5 w-5" />
                    Go to Owner Control Panel
                  </Button>
                </Link>
                <Link href="/dashboard/create">
                  <Button size="lg" variant="outline" className="h-12 gap-2 px-8 w-full sm:w-auto">
                    <Plus className="h-5 w-5" />
                    Add New PG Listing
                  </Button>
                </Link>
              </div>

              {/* Highlights Bar */}
              <div className="mt-10 flex flex-wrap items-center justify-center gap-4 text-sm font-medium text-foreground/80">
                <span className="flex items-center gap-2 rounded-full bg-accent/60 px-3.5 py-1.5 text-accent-foreground border border-border/50">
                  <Zap className="h-4 w-4 text-primary" /> Direct WhatsApp Student Leads
                </span>
                <span className="flex items-center gap-2 rounded-full bg-accent/60 px-3.5 py-1.5 text-accent-foreground border border-border/50">
                  <DollarSign className="h-4 w-4 text-primary" /> 0% Brokerage Commission
                </span>
                <span className="flex items-center gap-2 rounded-full bg-accent/60 px-3.5 py-1.5 text-accent-foreground border border-border/50">
                  <Shield className="h-4 w-4 text-primary" /> Verified Property Badging
                </span>
              </div>
            </div>
          </div>

          <div className="absolute -top-40 right-0 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-40 left-0 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        </section>

        {/* Owner How It Works */}
        <section className="py-20">
          <div className="container">
            <div className="mb-12 text-center">
              <h2 className="mb-3 text-3xl font-bold">How PGFinder Works for Owners</h2>
              <p className="text-muted-foreground">
                Three simple steps to list your property and get verified student tenants
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {[
                {
                  step: "01",
                  icon: Plus,
                  title: "List Your Property",
                  description:
                    "Add photos, rent prices, amenities, house rules, and pin your location in under 2 minutes.",
                },
                {
                  step: "02",
                  icon: MessageSquare,
                  title: "Receive Direct Leads",
                  description:
                    "Students contact you directly on WhatsApp or submit inquiries straight to your Owner Inbox.",
                },
                {
                  step: "03",
                  icon: CheckCircle2,
                  title: "Fill Vacancies Fast",
                  description:
                    "Welcome student tenants to your PG with zero brokerage cuts and full rental income retention.",
                },
              ].map((item) => (
                <Card
                  key={item.step}
                  className="relative border-none bg-muted/50 transition-shadow hover:shadow-md"
                >
                  <CardContent className="pt-8 pb-6">
                    <span className="absolute right-6 top-4 text-5xl font-bold text-primary/10">
                      {item.step}
                    </span>
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                      <item.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="mb-2 text-xl font-semibold">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Owner Benefits Grid */}
        <section className="border-t bg-muted/30 py-20">
          <div className="container">
            <div className="mb-12 text-center">
              <h2 className="mb-3 text-3xl font-bold">Why List Your PG With Us?</h2>
              <p className="text-muted-foreground">
                Built specifically to give PG owners maximum control and maximum bookings
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: DollarSign,
                  title: "Zero Commission",
                  description: "Keep 100% of your rent. No listing fees or booking cuts",
                  color: "text-primary bg-primary/10",
                },
                {
                  icon: MessageSquare,
                  title: "Direct WhatsApp Leads",
                  description: "Students chat directly with you — no agent interference",
                  color: "text-primary bg-primary/10",
                },
                {
                  icon: Shield,
                  title: "Verified Badging",
                  description: "Build student trust with platform-verified listing badges",
                  color: "text-primary bg-primary/10",
                },
                {
                  icon: TrendingUp,
                  title: "Full Control",
                  description: "Activate, deactivate, or edit prices anytime with 1-click",
                  color: "text-primary bg-primary/10",
                },
              ].map((feature) => (
                <Card
                  key={feature.title}
                  className="text-center transition-shadow hover:shadow-md"
                >
                  <CardContent className="pt-6">
                    <div
                      className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${feature.color}`}
                    >
                      <feature.icon className="h-7 w-7" />
                    </div>
                    <h3 className="mb-1 font-semibold">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Owner Bottom CTA */}
        <section className="py-20">
          <div className="container">
            <div className="mx-auto max-w-2xl rounded-2xl bg-primary p-8 text-center text-primary-foreground md:p-12 shadow-lg">
              <h2 className="mb-4 text-3xl font-bold">
                Ready to Add a New Accommodation?
              </h2>
              <p className="mb-6 text-primary-foreground/90">
                Post your PG listing now and start receiving student inquiries within minutes.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link href="/dashboard/create">
                  <Button size="lg" variant="secondary" className="gap-2 px-8 font-semibold">
                    <Plus className="h-5 w-5" />
                    Create New PG Listing
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button size="lg" variant="outline" className="gap-2 px-8 bg-transparent text-primary-foreground border-primary-foreground/40 hover:bg-primary-foreground/10">
                    <Building2 className="h-5 w-5" />
                    Open Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

  // ==================== STUDENT / GUEST HOME PAGE ====================
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10 py-20 md:py-32">
        <div className="container relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-4 px-4 py-1.5 text-sm">
              🎓 Trusted by 1000+ Students & PG Owners
            </Badge>
            <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl">
              Find Your Perfect{" "}
              <span className="text-primary">PG</span> Near College
            </h1>
            <p className="mb-8 text-lg text-muted-foreground md:text-xl">
              Verified PG listings with real photos, amenities, and direct
              owner contact. No scams, no middlemen — just your next home.
            </p>

            {/* Search Bar */}
            <div className="mx-auto flex max-w-xl flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Enter city name (e.g., Delhi, Bangalore)"
                  className="h-12 pl-10 text-base"
                  value={cityInput}
                  onChange={(e) => setCityInput(e.target.value)}
                />
              </div>
              <Link href={cityInput.trim() ? `/listings?city=${encodeURIComponent(cityInput.trim())}` : "/listings"}>
                <Button size="lg" className="h-12 gap-2 px-8 w-full sm:w-auto">
                  Search PGs
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" /> Delhi
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" /> Bangalore
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" /> Pune
              </span>
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute -top-40 right-0 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 left-0 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold">How It Works</h2>
            <p className="text-muted-foreground">
              Three simple steps to find your ideal PG accommodation
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                icon: Search,
                title: "Search & Filter",
                description:
                  "Enter your college or city, set your budget, and filter by amenities like AC, WiFi, and meals.",
              },
              {
                step: "02",
                icon: Star,
                title: "Compare & Save",
                description:
                  "Save your favorite listings and compare up to 3 PGs side by side to make the right choice.",
              },
              {
                step: "03",
                icon: MapPin,
                title: "Connect & Move In",
                description:
                  "Contact the owner directly via WhatsApp or send an inquiry. No middlemen, no hidden fees.",
              },
            ].map((item) => (
              <Card
                key={item.step}
                className="relative border-none bg-muted/50 transition-shadow hover:shadow-md"
              >
                <CardContent className="pt-8 pb-6">
                  <span className="absolute right-6 top-4 text-5xl font-bold text-primary/10">
                    {item.step}
                  </span>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="border-t bg-muted/30 py-20">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold">Why Choose PGFinder?</h2>
            <p className="text-muted-foreground">
              Everything you need to find and secure your perfect accommodation
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Shield,
                title: "Verified Listings",
                description: "Every verified PG is checked for authenticity",
                color: "text-emerald-600 bg-emerald-100",
              },
              {
                icon: MapPin,
                title: "Map Search",
                description: "Find PGs near your college on an interactive map",
                color: "text-blue-600 bg-blue-100",
              },
              {
                icon: Wifi,
                title: "Smart Filters",
                description: "Filter by AC, WiFi, meals, budget, and more",
                color: "text-purple-600 bg-purple-100",
              },
              {
                icon: UtensilsCrossed,
                title: "Direct Contact",
                description: "Message owners directly via WhatsApp — no fees",
                color: "text-orange-600 bg-orange-100",
              },
            ].map((feature) => (
              <Card
                key={feature.title}
                className="text-center transition-shadow hover:shadow-md"
              >
                <CardContent className="pt-6">
                  <div
                    className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${feature.color}`}
                  >
                    <feature.icon className="h-7 w-7" />
                  </div>
                  <h3 className="mb-1 font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container">
          <div className="mx-auto max-w-2xl rounded-2xl bg-primary p-8 text-center text-primary-foreground md:p-12">
            <h2 className="mb-4 text-3xl font-bold">
              {isLoggedIn ? "Explore PG Accommodations" : "Are You a PG Owner?"}
            </h2>
            <p className="mb-6 text-primary-foreground/80">
              {isLoggedIn
                ? "Search, filter, and compare thousands of student PGs near top colleges."
                : "List your PG on PGFinder and connect with thousands of students looking for accommodation. It's free to list!"}
            </p>
            {isLoggedIn ? (
              <Link href="/listings">
                <Button size="lg" variant="secondary" className="gap-2 px-8">
                  Explore PG Listings
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Link href="/sign-up">
                <Button size="lg" variant="secondary" className="gap-2 px-8">
                  List Your PG for Free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ListingCard } from "@/components/listings/ListingCard";
import {
  MapPin,
  Heart,
  MessageSquare,
  Phone,
  Shield,
  Wind,
  Wifi,
  UtensilsCrossed,
  Car,
  Droplets,
  Zap,
  ShieldCheck,
  Shirt,
  Leaf,
  Ban,
  Wine,
  Clock,
  Users,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Send,
  Edit,
  Trash2,
  Building2,
} from "lucide-react";
import { formatPrice, getWhatsAppUrl } from "@/lib/utils";
import type { IListing } from "@/models/Listing";
import type { Document } from "mongoose";
import { useUserRole } from "@/lib/useUserRole";

interface ListingDetail extends Omit<IListing, "_id" | keyof Document> {
  _id: string;
}

const AMENITY_ICONS: Record<string, { icon: typeof Wind; label: string }> = {
  ac: { icon: Wind, label: "Air Conditioning" },
  wifi: { icon: Wifi, label: "WiFi" },
  meals: { icon: UtensilsCrossed, label: "Meals Included" },
  laundry: { icon: Shirt, label: "Laundry" },
  parking: { icon: Car, label: "Parking" },
  hotWater: { icon: Droplets, label: "Hot Water" },
  powerBackup: { icon: Zap, label: "Power Backup" },
  security: { icon: ShieldCheck, label: "24/7 Security" },
};

const RULE_ICONS: Record<string, { icon: typeof Ban; label: string }> = {
  vegOnly: { icon: Leaf, label: "Vegetarian Only" },
  noSmoking: { icon: Ban, label: "No Smoking" },
  noAlcohol: { icon: Wine, label: "No Alcohol" },
};

export default function ListingDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { role, isStudent, isOwner, isLoggedIn, user } = useUserRole();

  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [sendingInquiry, setSendingInquiry] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [similarListings, setSimilarListings] = useState<ListingDetail[]>([]);

  const isMyListing = isOwner && user?.id && listing?.ownerId === user.id;

  useEffect(() => {
    fetchListing();
  }, [id]);

  useEffect(() => {
    if (isLoggedIn && isStudent && listing) {
      checkIfSaved();
    }
  }, [isLoggedIn, isStudent, listing]);

  async function fetchListing() {
    try {
      const res = await axios.get(`/api/listings/${id}`);
      setListing(res.data.listing);

      const similarRes = await axios.get(
        `/api/listings?city=${res.data.listing.address.city}&limit=4`
      );
      setSimilarListings(
        (similarRes.data.listings || []).filter(
          (l: ListingDetail) => l._id !== id
        ).slice(0, 3)
      );
    } catch {
      toast.error("Listing not found");
      router.push("/listings");
    } finally {
      setLoading(false);
    }
  }

  async function checkIfSaved() {
    try {
      const res = await axios.get("/api/saved");
      const saved = res.data.saved || [];
      setIsSaved(saved.some((s: { listingId: string }) => s.listingId.toString() === id));
    } catch {
      /* ignore */
    }
  }

  async function toggleSave() {
    if (!isLoggedIn) {
      router.push("/sign-in");
      return;
    }

    // Optimistic UI Update: Instant state flip before HTTP response
    const previousSavedState = isSaved;
    const nextSavedState = !previousSavedState;

    setIsSaved(nextSavedState);
    if (nextSavedState) {
      toast.success("Saved to your favorites! (Optimistic)");
    } else {
      toast.success("Removed from saved PGs (Optimistic)");
    }

    setSaving(true);
    try {
      if (previousSavedState) {
        await axios.delete(`/api/saved/${id}`);
      } else {
        await axios.post("/api/saved", { listingId: id });
      }
    } catch {
      // Rollback UI state on API failure
      setIsSaved(previousSavedState);
      toast.error("Failed to update saved status. Action rolled back.");
    } finally {
      setSaving(false);
    }
  }

  async function sendInquiry() {
    if (!isLoggedIn) {
      router.push("/sign-in");
      return;
    }
    if (message.trim().length < 5) {
      toast.error("Message must be at least 5 characters");
      return;
    }
    setSendingInquiry(true);
    try {
      const convRes = await axios.post("/api/chat/conversations", {
        listingId: id,
        initialMessage: message.trim(),
      });
      
      await axios.post("/api/inquiries", {
        listingId: id,
        message: message.trim(),
      });

      const convId = convRes.data?.conversation?._id;
      toast.success("Message sent! Opening in-app chat...");
      setMessage("");
      if (convId) {
        router.push(`/chat?id=${convId}`);
      } else {
        router.push("/chat");
      }
    } catch {
      toast.error("Failed to send message");
    } finally {
      setSendingInquiry(false);
    }
  }

  async function handleDeleteListing() {
    if (!confirm("Are you sure you want to delete this listing? This action cannot be undone.")) {
      return;
    }
    setDeleting(true);
    try {
      await axios.delete(`/api/listings/${id}`);
      toast.success("Listing deleted successfully");
      router.push("/dashboard");
    } catch {
      toast.error("Failed to delete listing");
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="container py-8">
        <div className="skeleton h-96 rounded-lg mb-6" />
        <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
          <div className="space-y-4">
            <div className="skeleton h-8 w-64 rounded" />
            <div className="skeleton h-4 w-32 rounded" />
            <div className="skeleton h-32 rounded-lg" />
          </div>
          <div className="skeleton h-64 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!listing) return null;

  return (
    <div className="container py-8">
      {/* Top Banner & Navigation */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          variant="ghost"
          className="gap-2 self-start"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        {isMyListing && (
          <div className="flex items-center gap-2 rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 text-xs text-amber-700 font-medium">
            <Building2 className="h-4 w-4" />
            You own this listing
          </div>
        )}
      </div>

      {/* Photo Gallery */}
      <div className="relative mb-8 overflow-hidden rounded-xl bg-muted shadow">
        <div className="relative aspect-[16/9] md:aspect-[21/9]">
          {listing.photos.length > 0 ? (
            <img
              src={listing.photos[currentPhoto]}
              alt={`${listing.title} - Photo ${currentPhoto + 1}`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <MapPin className="h-16 w-16 text-muted-foreground/30" />
            </div>
          )}

          {listing.photos.length > 1 && (
            <>
              <button
                onClick={() =>
                  setCurrentPhoto((p) =>
                    p === 0 ? listing.photos.length - 1 : p - 1
                  )
                }
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors"
                aria-label="Previous photo"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() =>
                  setCurrentPhoto((p) =>
                    p === listing.photos.length - 1 ? 0 : p + 1
                  )
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors"
                aria-label="Next photo"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
                <Badge variant="secondary" className="bg-black/50 text-white">
                  {currentPhoto + 1} / {listing.photos.length}
                </Badge>
              </div>
            </>
          )}
        </div>

        {/* Thumbnail strip */}
        {listing.photos.length > 1 && (
          <div className="flex gap-2 overflow-x-auto p-3">
            {listing.photos.map((photo, i) => (
              <button
                key={i}
                onClick={() => setCurrentPhoto(i)}
                className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border-2 transition-colors ${
                  i === currentPhoto
                    ? "border-primary"
                    : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                <img
                  src={photo}
                  alt={`Thumbnail ${i + 1}`}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
        {/* Main Content */}
        <div className="space-y-8">
          {/* Title & Price */}
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              {listing.isVerified && (
                <Badge className="bg-emerald-600 text-white gap-1">
                  <Shield className="h-3 w-3" />
                  Verified Listing
                </Badge>
              )}
              <Badge variant="secondary">{listing.type}</Badge>
              <Badge variant="outline">
                {listing.gender === "any"
                  ? "Co-ed"
                  : listing.gender === "female"
                  ? "Girls Only"
                  : "Boys Only"}
              </Badge>
            </div>
            <h1 className="mb-2 text-3xl font-bold">{listing.title}</h1>
            <div className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {listing.address.street}, {listing.address.city},{" "}
              {listing.address.state} - {listing.address.pincode}
            </div>
            <Link href={`/map?lat=${listing.location.coordinates[1]}&lng=${listing.location.coordinates[0]}&listing=${listing._id}`} className="mt-3 inline-flex">
              <Button variant="outline" size="sm" className="gap-2">
                <MapPin className="h-4 w-4 text-primary" /> View exact location on map
              </Button>
            </Link>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-primary">
                {formatPrice(listing.price)}
              </span>
              <span className="text-muted-foreground">/month</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h2 className="mb-3 text-xl font-semibold">About This PG</h2>
            <p className="leading-relaxed text-muted-foreground whitespace-pre-line">
              {listing.description}
            </p>
          </div>

          {/* Amenities */}
          <div>
            <h2 className="mb-3 text-xl font-semibold">Amenities</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {Object.entries(listing.amenities).map(([key, value]) => {
                const config = AMENITY_ICONS[key];
                if (!config) return null;
                return (
                  <div
                    key={key}
                    className={`flex items-center gap-2 rounded-lg border p-3 ${
                      value
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700 font-medium"
                        : "border-muted text-muted-foreground opacity-50"
                    }`}
                  >
                    <config.icon className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm">{config.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rules */}
          <div>
            <h2 className="mb-3 text-xl font-semibold">House Rules</h2>
            <div className="space-y-2">
              {Object.entries(RULE_ICONS).map(([key, config]) => {
                const value = listing.rules[key as keyof typeof listing.rules];
                if (!value) return null;
                return (
                  <div
                    key={key}
                    className="flex items-center gap-2 text-sm font-medium"
                  >
                    <config.icon className="h-4 w-4 text-amber-600" />
                    {config.label}
                  </div>
                );
              })}
              {listing.rules.guestPolicy &&
                listing.rules.guestPolicy !== "No restrictions" && (
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-blue-600" />
                    Guest Policy: {listing.rules.guestPolicy}
                  </div>
                )}
              {listing.rules.curfewTime &&
                listing.rules.curfewTime !== "No curfew" && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-red-600" />
                    Curfew: {listing.rules.curfewTime}
                  </div>
                )}
            </div>
          </div>
        </div>

        {/* Sidebar Controls (Role Specific) */}
        <div className="space-y-4">
          {/* Owner Management Box */}
          {isMyListing && (
            <Card className="border-primary/40 bg-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2 text-primary">
                  <Building2 className="h-4 w-4" />
                  Owner Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href={`/dashboard/edit/${listing._id}`} className="block">
                  <Button variant="outline" className="w-full gap-2 justify-start">
                    <Edit className="h-4 w-4" />
                    Edit Listing Details
                  </Button>
                </Link>
                <Button
                  variant="destructive"
                  className="w-full gap-2 justify-start"
                  onClick={handleDeleteListing}
                  disabled={deleting}
                >
                  <Trash2 className="h-4 w-4" />
                  {deleting ? "Deleting..." : "Delete Listing"}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Student Actions */}
          {(!isLoggedIn || isStudent) && (
            <>
              {/* Save Button */}
              <Button
                onClick={toggleSave}
                disabled={saving}
                variant={isSaved ? "secondary" : "outline"}
                className="w-full gap-2 shadow-sm"
              >
                {isSaved ? (
                  <>
                    <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                    Saved to Favorites
                  </>
                ) : (
                  <>
                    <Heart className="h-4 w-4" />
                    Save This PG
                  </>
                )}
              </Button>

              {/* WhatsApp Button */}
              <a
                href={getWhatsAppUrl(listing.ownerPhone || "9876543210", listing.title)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-md bg-[#25D366] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#20BD5A] transition-colors shadow-sm"
              >
                <Phone className="h-4 w-4" />
                Chat on WhatsApp
              </a>

              {/* Inquiry Form */}
              {isLoggedIn ? (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <MessageSquare className="h-4 w-4" />
                      Send Inquiry to Owner
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Textarea
                      placeholder="Hi, I'm interested in this PG. Is there availability for next month?"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={4}
                    />
                    <Button
                      onClick={sendInquiry}
                      disabled={sendingInquiry || message.trim().length < 10}
                      className="w-full gap-2"
                    >
                      {sendingInquiry ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      Send Inquiry
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-muted/50">
                  <CardContent className="pt-6 text-center">
                    <p className="mb-3 text-sm text-muted-foreground">
                      Sign in to contact the owner and save this listing
                    </p>
                    <Link href="/sign-in">
                      <Button className="w-full">Sign In to Inquire</Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>

      {/* Similar Listings */}
      {similarListings.length > 0 && (
        <div className="mt-12 border-t pt-8">
          <h2 className="mb-6 text-2xl font-bold">Similar PGs in {listing.address.city}</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {similarListings.map((similar) => (
              <ListingCard key={similar._id} listing={similar} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

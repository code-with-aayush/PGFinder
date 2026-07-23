"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { toast } from "sonner";
import { ListingCard } from "@/components/listings/ListingCard";
import { Button } from "@/components/ui/button";
import { Heart, ArrowRight, Search } from "lucide-react";

import { useUserRole } from "@/lib/useUserRole";

interface SavedItem {
  _id: string;
  listingId: string;
  listing: {
    _id: string;
    title: string;
    price: number;
    type: string;
    gender: string;
    address: { city: string; state: string };
    amenities: { ac: boolean; wifi: boolean; meals: boolean };
    photos: string[];
    isVerified: boolean;
  } | null;
}

export default function SavedPage() {
  const router = useRouter();
  const { isOwner, loading: roleLoading } = useUserRole();
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);

  useEffect(() => {
    if (!roleLoading) {
      if (isOwner) {
        toast.info("Owners do not have saved PGs. Redirecting to your dashboard.");
        router.push("/dashboard");
        return;
      }
      fetchSaved();
    }
  }, [roleLoading, isOwner, router]);

  async function fetchSaved() {
    try {
      const res = await axios.get("/api/saved");
      setSavedItems(res.data.saved || []);
    } catch {
      toast.error("Failed to load saved listings");
    } finally {
      setLoading(false);
    }
  }

  async function handleUnsave(listingId: string) {
    try {
      await axios.delete(`/api/saved/${listingId}`);
      setSavedItems((prev) =>
        prev.filter((item) => item.listingId.toString() !== listingId)
      );
      setSelectedForCompare((prev) => prev.filter((id) => id !== listingId));
      toast.success("Removed from saved");
    } catch {
      toast.error("Failed to remove listing");
    }
  }

  function toggleCompare(id: string) {
    setSelectedForCompare((prev) => {
      if (prev.includes(id)) {
        return prev.filter((x) => x !== id);
      }
      if (prev.length >= 3) {
        toast.error("You can compare up to 3 listings at a time");
        return prev;
      }
      return [...prev, id];
    });
  }

  function goToCompare() {
    if (selectedForCompare.length < 2) {
      toast.error("Select at least 2 listings to compare");
      return;
    }
    const params = selectedForCompare.map((id) => `id=${id}`).join("&");
    router.push(`/compare?${params}`);
  }

  if (loading) {
    return (
      <div className="container py-8">
        <div className="skeleton h-10 w-48 mb-6 rounded" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-80 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const validItems = savedItems.filter((item) => item.listing);

  return (
    <div className="container py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Saved Listings</h1>
          <p className="text-muted-foreground">
            {validItems.length} saved PG{validItems.length !== 1 ? "s" : ""}
          </p>
        </div>

        {selectedForCompare.length > 0 && (
          <Button onClick={goToCompare} className="gap-2">
            Compare ({selectedForCompare.length})
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      {validItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Heart className="mb-4 h-16 w-16 text-muted-foreground/30" />
          <h3 className="mb-2 text-xl font-semibold">No Saved Listings</h3>
          <p className="mb-4 text-muted-foreground">
            Save PGs you like and compare them side by side
          </p>
          <Link href="/listings">
            <Button className="gap-2">
              <Search className="h-4 w-4" />
              Browse PGs
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {validItems.map((item) => (
            <div key={item._id} className="relative">
              <ListingCard
                listing={item.listing!}
                showSelectCheckbox
                isSelected={selectedForCompare.includes(
                  item.listing!._id
                )}
                onSelect={toggleCompare}
              />
              <button
                onClick={() => handleUnsave(item.listingId.toString())}
                className="absolute right-2 top-2 z-10 rounded-full bg-white/90 p-1.5 text-red-500 hover:bg-white transition-colors"
                title="Remove from saved"
              >
                <Heart className="h-4 w-4 fill-current" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

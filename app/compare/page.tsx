"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Check,
  X,
  MapPin,
  Wind,
  Wifi,
  UtensilsCrossed,
  Car,
  Droplets,
  Zap,
  ShieldCheck,
  Shirt,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface CompareListing {
  _id: string;
  title: string;
  price: number;
  type: string;
  gender: string;
  address: { city: string; street: string; state: string };
  amenities: {
    ac: boolean;
    wifi: boolean;
    meals: boolean;
    laundry: boolean;
    parking: boolean;
    hotWater: boolean;
    powerBackup: boolean;
    security: boolean;
  };
  rules: {
    vegOnly: boolean;
    noSmoking: boolean;
    noAlcohol: boolean;
    curfewTime: string;
  };
  photos: string[];
  isVerified: boolean;
}

const AMENITY_LABELS: Record<string, { label: string; icon: typeof Wind }> = {
  ac: { label: "Air Conditioning", icon: Wind },
  wifi: { label: "WiFi", icon: Wifi },
  meals: { label: "Meals", icon: UtensilsCrossed },
  laundry: { label: "Laundry", icon: Shirt },
  parking: { label: "Parking", icon: Car },
  hotWater: { label: "Hot Water", icon: Droplets },
  powerBackup: { label: "Power Backup", icon: Zap },
  security: { label: "Security", icon: ShieldCheck },
};

function CompareContent() {
  const searchParams = useSearchParams();
  const [listings, setListings] = useState<CompareListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ids = searchParams.getAll("id");
    if (ids.length < 2) {
      toast.error("Select at least 2 listings to compare");
      setLoading(false);
      return;
    }
    fetchListings(ids);
  }, [searchParams]);

  async function fetchListings(ids: string[]) {
    try {
      const results = await Promise.all(
        ids.map((id) => axios.get(`/api/listings/${id}`))
      );
      setListings(results.map((r) => r.data.listing));
    } catch {
      toast.error("Failed to load listings for comparison");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="container py-8">
        <div className="skeleton h-10 w-64 mb-6 rounded" />
        <div className="skeleton h-96 rounded-lg" />
      </div>
    );
  }

  if (listings.length < 2) {
    return (
      <div className="container py-8 text-center">
        <h1 className="mb-4 text-2xl font-bold">Compare PG Listings</h1>
        <p className="mb-4 text-muted-foreground">
          Select at least 2 listings from your saved page to compare them side by side.
        </p>
        <Link href="/saved">
          <Button className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Go to Saved Listings
          </Button>
        </Link>
      </div>
    );
  }

  const BoolCell = ({ value }: { value: boolean }) =>
    value ? (
      <Check className="h-5 w-5 text-emerald-600" />
    ) : (
      <X className="h-5 w-5 text-muted-foreground/30" />
    );

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Link href="/saved">
          <Button variant="ghost" className="gap-2 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Saved
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Compare PG Listings</h1>
        <p className="text-muted-foreground">
          Side-by-side comparison of {listings.length} listings
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] border-collapse">
          <thead>
            <tr>
              <th className="w-40 border-b p-3 text-left text-sm font-medium text-muted-foreground">
                Feature
              </th>
              {listings.map((listing) => (
                <th key={listing._id} className="border-b p-3 text-center">
                  <Link href={`/listings/${listing._id}`}>
                    <div className="space-y-2">
                      {listing.photos[0] && (
                        <img
                          src={listing.photos[0]}
                          alt={listing.title}
                          className="mx-auto h-24 w-full rounded-lg object-cover"
                        />
                      )}
                      <p className="font-semibold text-sm hover:text-primary transition-colors">
                        {listing.title}
                      </p>
                    </div>
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Price */}
            <tr className="bg-muted/30">
              <td className="border-b p-3 text-sm font-medium">Price</td>
              {listings.map((l) => (
                <td
                  key={l._id}
                  className="border-b p-3 text-center font-bold text-primary"
                >
                  {formatPrice(l.price)}/mo
                </td>
              ))}
            </tr>

            {/* Type */}
            <tr>
              <td className="border-b p-3 text-sm font-medium">Type</td>
              {listings.map((l) => (
                <td key={l._id} className="border-b p-3 text-center text-sm">
                  {l.type}
                </td>
              ))}
            </tr>

            {/* Gender */}
            <tr className="bg-muted/30">
              <td className="border-b p-3 text-sm font-medium">Gender</td>
              {listings.map((l) => (
                <td key={l._id} className="border-b p-3 text-center text-sm">
                  <Badge variant="outline">
                    {l.gender === "any"
                      ? "Co-ed"
                      : l.gender === "female"
                      ? "Girls"
                      : "Boys"}
                  </Badge>
                </td>
              ))}
            </tr>

            {/* City */}
            <tr>
              <td className="border-b p-3 text-sm font-medium">City</td>
              {listings.map((l) => (
                <td key={l._id} className="border-b p-3 text-center text-sm">
                  {l.address.city}
                </td>
              ))}
            </tr>

            {/* Verified */}
            <tr className="bg-muted/30">
              <td className="border-b p-3 text-sm font-medium">Verified</td>
              {listings.map((l) => (
                <td
                  key={l._id}
                  className="border-b p-3 text-center"
                >
                  <div className="flex justify-center">
                    <BoolCell value={l.isVerified} />
                  </div>
                </td>
              ))}
            </tr>

            {/* Amenities */}
            {Object.entries(AMENITY_LABELS).map(([key, { label }], i) => (
              <tr key={key} className={i % 2 === 0 ? "bg-muted/30" : ""}>
                <td className="border-b p-3 text-sm font-medium">{label}</td>
                {listings.map((l) => (
                  <td
                    key={l._id}
                    className="border-b p-3 text-center"
                  >
                    <div className="flex justify-center">
                      <BoolCell
                        value={
                          l.amenities[key as keyof typeof l.amenities]
                        }
                      />
                    </div>
                  </td>
                ))}
              </tr>
            ))}

            {/* Rules */}
            <tr>
              <td className="border-b p-3 text-sm font-medium">Veg Only</td>
              {listings.map((l) => (
                <td key={l._id} className="border-b p-3 text-center">
                  <div className="flex justify-center">
                    <BoolCell value={l.rules.vegOnly} />
                  </div>
                </td>
              ))}
            </tr>

            <tr className="bg-muted/30">
              <td className="border-b p-3 text-sm font-medium">Curfew</td>
              {listings.map((l) => (
                <td key={l._id} className="border-b p-3 text-center text-sm">
                  {l.rules.curfewTime || "No curfew"}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense
      fallback={
        <div className="container py-8">
          <div className="skeleton h-10 w-64 mb-6 rounded" />
          <div className="skeleton h-96 rounded-lg" />
        </div>
      }
    >
      <CompareContent />
    </Suspense>
  );
}

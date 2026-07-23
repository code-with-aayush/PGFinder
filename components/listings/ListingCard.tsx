import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Wifi,
  Wind,
  UtensilsCrossed,
  Shield,
  Sparkles,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface ListingCardProps {
  listing: {
    _id: string;
    title: string;
    price: number;
    type: string;
    gender: string;
    address: { city: string; state: string };
    amenities: {
      ac: boolean;
      wifi: boolean;
      meals: boolean;
    };
    photos: string[];
    isVerified: boolean;
  };
  showSelectCheckbox?: boolean;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
}

export function ListingCard({
  listing,
  showSelectCheckbox,
  isSelected,
  onSelect,
}: ListingCardProps) {
  return (
    <Card className="group overflow-hidden rounded-2xl border border-border/70 bg-card card-hover-effect shadow-sm">
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        <Link href={`/listings/${listing._id}`}>
          {listing.photos[0] ? (
            <img
              src={listing.photos[0]}
              alt={listing.title}
              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted/60">
              <MapPin className="h-10 w-10 text-muted-foreground/40" />
            </div>
          )}
        </Link>

        {/* Badges overlay */}
        <div className="absolute left-3 top-3 flex flex-wrap items-center gap-1.5 z-10">
          {listing.isVerified && (
            <Badge className="bg-emerald-600/90 text-white backdrop-blur-md shadow-sm border border-emerald-400/30 gap-1 px-2.5 py-0.5 text-xs font-semibold">
              <Shield className="h-3 w-3" />
              Verified
            </Badge>
          )}
          <Badge variant="secondary" className="bg-background/85 text-foreground backdrop-blur-md border border-border/50 text-xs font-semibold px-2.5 py-0.5 shadow-sm">
            {listing.type}
          </Badge>
        </div>

        {/* Gender badge */}
        <div className="absolute right-3 top-3 z-10">
          <Badge
            className={`backdrop-blur-md text-xs font-semibold px-2.5 py-0.5 shadow-sm ${
              listing.gender === "female"
                ? "bg-rose-500/90 text-white"
                : listing.gender === "male"
                ? "bg-blue-600/90 text-white"
                : "bg-purple-600/90 text-white"
            }`}
          >
            {listing.gender === "any"
              ? "Co-ed"
              : listing.gender === "female"
              ? "Girls PG"
              : "Boys PG"}
          </Badge>
        </div>

        {showSelectCheckbox && (
          <div className="absolute left-3 bottom-3 z-10">
            <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-background/90 backdrop-blur-md px-2.5 py-1 text-xs font-semibold text-foreground shadow-sm border border-border/60">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onSelect?.(listing._id)}
                className="rounded accent-primary"
              />
              Compare
            </label>
          </div>
        )}
      </div>

      <CardContent className="p-5">
        <Link href={`/listings/${listing._id}`}>
          <h3 className="mb-1.5 text-base font-bold line-clamp-1 text-foreground hover:text-primary transition-colors">
            {listing.title}
          </h3>
        </Link>

        <div className="mb-3 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 text-primary/70 shrink-0" />
          <span>{listing.address.city}, {listing.address.state}</span>
        </div>

        <div className="mb-4 flex items-baseline gap-1">
          <span className="text-2xl font-extrabold text-primary tracking-tight">
            {formatPrice(listing.price)}
          </span>
          <span className="text-xs font-medium text-muted-foreground">/month</span>
        </div>

        {/* Amenity chips */}
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border/50">
          {listing.amenities.ac && (
            <span className="flex items-center gap-1 rounded-full bg-accent/60 px-2.5 py-1 text-[11px] font-medium text-accent-foreground">
              <Wind className="h-3 w-3 text-primary" /> AC
            </span>
          )}
          {listing.amenities.wifi && (
            <span className="flex items-center gap-1 rounded-full bg-accent/60 px-2.5 py-1 text-[11px] font-medium text-accent-foreground">
              <Wifi className="h-3 w-3 text-primary" /> WiFi
            </span>
          )}
          {listing.amenities.meals && (
            <span className="flex items-center gap-1 rounded-full bg-accent/60 px-2.5 py-1 text-[11px] font-medium text-accent-foreground">
              <UtensilsCrossed className="h-3 w-3 text-primary" /> Meals
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, LocateFixed } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface MapListing {
  _id: string;
  title: string;
  price: number;
  type: string;
  gender: string;
  location: { coordinates: [number, number] };
  address: { city: string };
  photos: string[];
  isVerified: boolean;
}

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

export default function MapPage() {
  const searchParams = useSearchParams();
  const [listings, setListings] = useState<MapListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [college, setCollege] = useState("");
  const [radius, setRadius] = useState(5000);
  const [center, setCenter] = useState<[number, number]>([28.6139, 77.209]);
  const [zoom, setZoom] = useState(12);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [customIcon, setCustomIcon] = useState<L.Icon | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      import("leaflet")
        .then((L) => {
          const icon = new L.Icon({
            iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
            iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
            shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41],
          });
          setCustomIcon(icon);
          setLeafletLoaded(true);
        })
        .catch(() => {
          setLeafletLoaded(true);
        });
    }
  }, []);

  useEffect(() => {
    const listingId = searchParams.get("listing");
    if (!listingId) {
      fetchListings();
      return;
    }

    async function openExactListing() {
      setLoading(true);
      try {
        const response = await axios.get(`/api/listings/${listingId}`);
        const listing: MapListing = response.data.listing;
        const [longitude, latitude] = listing.location.coordinates;
        setCenter([latitude, longitude]);
        setZoom(18);
        setListings([listing]);
      } catch {
        toast.error("Unable to open this listing on the map");
        fetchListings();
      } finally {
        setLoading(false);
      }
    }
    openExactListing();
  }, [searchParams]);

  async function fetchListings(lat?: number, lng?: number) {
    setLoading(true);
    try {
      let url = "/api/listings?limit=50";
      if (lat && lng) {
        url += `&lat=${lat}&lng=${lng}&radius=${radius}`;
      }
      const res = await axios.get(url);
      setListings(res.data.listings || []);
    } catch {
      toast.error("Failed to load listings");
    } finally {
      setLoading(false);
    }
  }

  async function searchCollege() {
    if (!college.trim()) return;

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(college)}&countrycodes=in&limit=1`
      );
      const data = await res.json();

      if (data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        setCenter([lat, lng]);
        setZoom(14);
        fetchListings(lat, lng);
        toast.success(`Found: ${data[0].display_name.slice(0, 50)}...`);
      } else {
        toast.error("College not found. Try a different name or city.");
      }
    } catch {
      toast.error("Geocoding failed. Please try again.");
    }
  }

  function handleUseMyLocation() {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    toast.info("Detecting your location...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCenter([lat, lng]);
        setZoom(14);
        fetchListings(lat, lng);
        toast.success("Center set to your current location");
      },
      () => {
        toast.error("Could not access your location. Please check browser permissions.");
      }
    );
  }

  return (
    <div className="flex h-[calc(100dvh-4rem)] min-h-[560px] flex-col sm:h-[calc(100vh-4rem)]">
      {/* Controls */}
      <div className="border-b bg-background px-0 py-3 sm:p-4">
        <div className="container flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search college or area (e.g., IIT Delhi, Koramangala)"
              className="pl-9"
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchCollege()}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium whitespace-nowrap">
                Radius: {(radius / 1000).toFixed(0)} km
              </label>
              <input
                type="range"
                min={1000}
                max={20000}
                step={1000}
                value={radius}
                onChange={(e) => setRadius(parseInt(e.target.value, 10))}
                className="w-24"
              />
            </div>

            <Button onClick={searchCollege} className="gap-2">
              <Search className="h-4 w-4" />
              Search
            </Button>

            <Button onClick={handleUseMyLocation} variant="secondary" className="gap-2">
              <LocateFixed className="h-4 w-4" />
              Near Me
            </Button>

            <Link href="/listings">
              <Button variant="outline" size="sm">
                List View
              </Button>
            </Link>
          </div>
        </div>

        <div className="container mt-2">
          <p className="text-sm text-muted-foreground">
            {loading
              ? "Loading..."
              : `${listings.length} PGs found on the map`}
          </p>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1">
        {leafletLoaded && customIcon ? (
          <MapContainer
            center={center}
            zoom={zoom}
            className="h-full w-full"
            key={`${center[0]}-${center[1]}-${zoom}`}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {listings.map((listing) => {
              const [lng, lat] = listing.location.coordinates;
              return (
                <Marker
                  key={listing._id}
                  position={[lat, lng]}
                  icon={customIcon}
                >
                  <Popup>
                    <div className="w-48">
                      {listing.photos[0] && (
                        <img
                          src={listing.photos[0]}
                          alt={listing.title}
                          className="mb-2 h-24 w-full rounded object-cover"
                        />
                      )}
                      <h3 className="mb-1 font-semibold text-sm">
                        {listing.title}
                      </h3>
                      <p className="text-primary font-bold">
                        {formatPrice(listing.price)}/mo
                      </p>
                      <p className="text-xs text-gray-500 mb-2">
                        {listing.type} · {listing.gender === "any" ? "Co-ed" : listing.gender === "female" ? "Girls" : "Boys"}
                      </p>
                      <Link
                        href={`/listings/${listing._id}`}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        View Details →
                      </Link>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        )}
      </div>
    </div>
  );
}

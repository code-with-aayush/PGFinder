"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";

export function FilterSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  // Debounced City Search State
  const [cityInput, setCityInput] = useState(searchParams.get("city") || "");
  const debouncedCity = useDebounce(cityInput, 350);

  // 1. Search State Persistence: Restore filters from sessionStorage on initial load if URL is empty
  useEffect(() => {
    if (typeof window !== "undefined") {
      const currentQs = searchParams.toString();
      if (!currentQs) {
        const savedQs = sessionStorage.getItem("pgfinder_active_filters");
        if (savedQs) {
          router.replace(`${pathname}?${savedQs}`, { scroll: false });
        }
      }
    }
  }, []);

  // 2. Debounced City API Trigger
  useEffect(() => {
    const currentCityInUrl = searchParams.get("city") || "";
    if (debouncedCity !== currentCityInUrl) {
      updateFilter("city", debouncedCity.trim() || null);
    }
  }, [debouncedCity]);

  const createQueryString = useCallback(
    (params: Record<string, string | null>) => {
      const current = new URLSearchParams(searchParams.toString());

      Object.entries(params).forEach(([key, value]) => {
        if (value === null || value === "" || value === "false") {
          current.delete(key);
        } else {
          current.set(key, value);
        }
      });

      current.delete("page");
      return current.toString();
    },
    [searchParams]
  );

  function updateFilter(key: string, value: string | null) {
    const qs = createQueryString({ [key]: value });
    if (typeof window !== "undefined") {
      sessionStorage.setItem("pgfinder_active_filters", qs);
    }
    router.push(`${pathname}?${qs}`, { scroll: false });
  }

  function clearAll() {
    setCityInput("");
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("pgfinder_active_filters");
    }
    router.push(pathname);
  }

  const hasFilters = searchParams.toString().length > 0;

  const filterContent = (
    <>
      {/* City (Debounced) */}
      <div>
        <label className="mb-1.5 block text-sm font-medium">City</label>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="e.g., Delhi"
            className="pl-8"
            value={cityInput}
            onChange={(e) => setCityInput(e.target.value)}
          />
        </div>
      </div>

      {/* Budget */}
      <div>
        <label className="mb-1.5 block text-sm font-medium">Budget (₹/month)</label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            placeholder="Min"
            defaultValue={searchParams.get("minPrice") || ""}
            onChange={(e) => updateFilter("minPrice", e.target.value || null)}
          />
          <Input
            type="number"
            placeholder="Max"
            defaultValue={searchParams.get("maxPrice") || ""}
            onChange={(e) => updateFilter("maxPrice", e.target.value || null)}
          />
        </div>
      </div>

      {/* Gender */}
      <div>
        <label className="mb-1.5 block text-sm font-medium">Gender</label>
        <select
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={searchParams.get("gender") || ""}
          onChange={(e) => updateFilter("gender", e.target.value || null)}
        >
          <option value="">All</option>
          <option value="male">Boys</option>
          <option value="female">Girls</option>
          <option value="any">Co-ed</option>
        </select>
      </div>

      {/* Type */}
      <div>
        <label className="mb-1.5 block text-sm font-medium">Type</label>
        <select
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={searchParams.get("type") || ""}
          onChange={(e) => updateFilter("type", e.target.value || null)}
        >
          <option value="">All Types</option>
          <option value="PG">PG</option>
          <option value="Hostel">Hostel</option>
          <option value="Flat Share">Flat Share</option>
        </select>
      </div>

      {/* Toggle Filters */}
      <div>
        <label className="mb-1.5 block text-sm font-medium">Amenities</label>
        <div className="space-y-2">
          {[
            { key: "ac", label: "Air Conditioning" },
            { key: "wifi", label: "WiFi" },
            { key: "meals", label: "Meals Included" },
            { key: "veg", label: "Veg Only" },
            { key: "verified", label: "Verified Only" },
          ].map((filter) => (
            <label
              key={filter.key}
              className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                searchParams.get(filter.key) === "true"
                  ? "border-primary bg-primary/5 text-primary"
                  : "hover:border-primary/50"
              }`}
            >
              <input
                type="checkbox"
                checked={searchParams.get(filter.key) === "true"}
                onChange={(e) =>
                  updateFilter(filter.key, e.target.checked ? "true" : null)
                }
                className="rounded"
              />
              {filter.label}
            </label>
          ))}
        </div>
      </div>

      {hasFilters && (
        <Button variant="outline" onClick={clearAll} className="w-full gap-2">
          <X className="h-4 w-4" />
          Clear All Filters
        </Button>
      )}
    </>
  );

  return (
    <>
      {/* Mobile filter toggle */}
      <div className="mb-4 lg:hidden">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full gap-2"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {hasFilters && (
            <Badge variant="default" className="ml-1">
              Active
            </Badge>
          )}
        </Button>
      </div>

      {/* Mobile filter drawer */}
      {isOpen && (
        <Card className="mb-4 lg:hidden">
          <CardContent className="space-y-4 pt-4">{filterContent}</CardContent>
        </Card>
      )}

      {/* Desktop sidebar */}
      <Card className="hidden lg:block">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-base">
            Filters
            {hasFilters && (
              <button
                onClick={clearAll}
                className="text-xs font-normal text-primary hover:underline"
              >
                Clear all
              </button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">{filterContent}</CardContent>
      </Card>
    </>
  );
}

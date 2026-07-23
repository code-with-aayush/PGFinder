"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { ListingCard } from "@/components/listings/ListingCard";
import { FilterSidebar } from "@/components/listings/FilterSidebar";
import { GridListingSkeleton } from "@/components/ui/skeleton-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Search,
  LayoutGrid,
} from "lucide-react";

interface Listing {
  _id: string;
  title: string;
  price: number;
  type: string;
  gender: string;
  address: { city: string; state: string; street: string; pincode: string };
  amenities: { ac: boolean; wifi: boolean; meals: boolean };
  photos: string[];
  isVerified: boolean;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

function ListingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [listings, setListings] = useState<Listing[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState(searchParams.get("sort") || "newest");

  useEffect(() => {
    fetchListings();
  }, [searchParams.toString(), sort]);

  async function fetchListings() {
    setLoading(true);
    try {
      const params = new URLSearchParams(searchParams.toString());
      params.set("sort", sort);

      const res = await axios.get(`/api/listings?${params.toString()}`);
      setListings(res.data.listings || []);
      setPagination(res.data.pagination);
    } catch {
      setListings([]);
    } finally {
      setLoading(false);
    }
  }

  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Find PG Accommodations</h1>
          <p className="text-muted-foreground">
            {loading
              ? "Searching..."
              : `${pagination?.total ?? listings.length} PGs found`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="newest">Newest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
          <Link href="/map">
            <Button variant="outline" size="icon" title="Map View">
              <MapPin className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Sidebar */}
        <aside>
          <FilterSidebar />
        </aside>

        {/* Listings Grid */}
        <div>
          {loading ? (
            <GridListingSkeleton count={6} />
          ) : listings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Search className="mb-4 h-16 w-16 text-muted-foreground/30" />
              <h3 className="mb-2 text-xl font-semibold">No PGs Found</h3>
              <p className="mb-4 text-muted-foreground">
                Try adjusting your filters or search in a different city
              </p>
              <Button
                variant="outline"
                onClick={() =>
                  (window.location.href = "/listings")
                }
              >
                Clear All Filters
              </Button>
            </div>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {listings.map((listing) => (
                  <ListingCard key={listing._id} listing={listing} />
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={currentPage <= 1}
                    onClick={() => goToPage(currentPage - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  {Array.from(
                    { length: Math.min(5, pagination.totalPages) },
                    (_, i) => {
                      let pageNum: number;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (
                        currentPage >= pagination.totalPages - 2
                      ) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={
                            pageNum === currentPage ? "default" : "outline"
                          }
                          size="icon"
                          onClick={() => goToPage(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    }
                  )}

                  <Button
                    variant="outline"
                    size="icon"
                    disabled={!pagination.hasMore}
                    onClick={() => goToPage(currentPage + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ListingsPage() {
  return (
    <Suspense
      fallback={
        <div className="container py-8">
          <div className="skeleton h-10 w-64 mb-6 rounded" />
          <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
            <div className="skeleton h-96 rounded-lg" />
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton h-80 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      }
    >
      <ListingsContent />
    </Suspense>
  );
}

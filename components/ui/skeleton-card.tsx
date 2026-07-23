import { Card, CardContent } from "@/components/ui/card";

export function ListingCardSkeleton() {
  return (
    <Card className="overflow-hidden border border-border/60 shadow-sm">
      {/* Image Skeleton */}
      <div className="skeleton aspect-[16/10] w-full rounded-none" />

      <CardContent className="p-4 space-y-3">
        {/* Title & Badges */}
        <div className="flex items-center justify-between">
          <div className="skeleton h-5 w-3/4 rounded" />
          <div className="skeleton h-4 w-12 rounded-full" />
        </div>

        {/* Location */}
        <div className="skeleton h-4 w-1/2 rounded" />

        {/* Amenities badges */}
        <div className="flex items-center gap-2 pt-1">
          <div className="skeleton h-6 w-16 rounded-md" />
          <div className="skeleton h-6 w-16 rounded-md" />
          <div className="skeleton h-6 w-16 rounded-md" />
        </div>

        {/* Footer Price & CTA */}
        <div className="flex items-center justify-between border-t pt-3 mt-2">
          <div className="space-y-1">
            <div className="skeleton h-5 w-20 rounded" />
            <div className="skeleton h-3 w-12 rounded" />
          </div>
          <div className="skeleton h-9 w-28 rounded-lg" />
        </div>
      </CardContent>
    </Card>
  );
}

export function GridListingSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <ListingCardSkeleton key={i} />
      ))}
    </div>
  );
}

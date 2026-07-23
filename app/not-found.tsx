import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MapPin, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-20 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <MapPin className="h-10 w-10 text-muted-foreground" />
      </div>
      <h1 className="mb-2 text-4xl font-bold">404</h1>
      <h2 className="mb-4 text-xl text-muted-foreground">Page Not Found</h2>
      <p className="mb-8 max-w-md text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
        Let&apos;s get you back on track.
      </p>
      <div className="flex gap-3">
        <Link href="/">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Go Home
          </Button>
        </Link>
        <Link href="/listings">
          <Button className="gap-2">
            <Search className="h-4 w-4" />
            Browse PGs
          </Button>
        </Link>
      </div>
    </div>
  );
}

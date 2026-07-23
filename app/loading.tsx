import { MapPin } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-background/50 px-4">
      {/* Animated Top Progress Line */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-muted overflow-hidden">
        <div className="h-full bg-gradient-to-r from-primary via-violet-500 to-indigo-500 animate-pulse w-full" />
      </div>

      <div className="relative flex flex-col items-center justify-center space-y-6 text-center">
        {/* Glow & Ripple Rings */}
        <div className="relative flex items-center justify-center">
          <div className="absolute h-24 w-24 rounded-full bg-primary/20 animate-ping opacity-75" />
          <div className="absolute h-16 w-16 rounded-full bg-primary/30 animate-pulse" />
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-violet-600 text-white shadow-xl shadow-primary/30 animate-float">
            <MapPin className="h-7 w-7 animate-bounce" />
          </div>
        </div>

        {/* Brand & Loading Text */}
        <div className="space-y-2">
          <h2 className="text-xl font-bold tracking-tight">
            PG<span className="text-primary font-extrabold">Finder</span>
          </h2>
          <p className="text-sm font-medium text-muted-foreground animate-pulse">
            Loading accommodations & verified details...
          </p>
        </div>

        {/* Skeleton Pulsing Bar */}
        <div className="h-1.5 w-36 rounded-full bg-muted overflow-hidden">
          <div className="h-full bg-primary rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
}

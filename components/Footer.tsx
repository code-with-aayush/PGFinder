import Link from "next/link";
import { MapPin, Mail, Phone, ShieldCheck, Heart, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-slate-950 text-slate-200">
      <div className="container py-14">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-4">
          {/* Brand Column */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-violet-500 text-white shadow-md shadow-primary/30">
                <MapPin className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                PG<span className="text-primary font-extrabold">Finder</span>
              </span>
            </Link>
            <p className="text-xs leading-relaxed text-slate-400">
              India&apos;s trusted PG accommodation portal. Direct owner contact, 
              verified listings, interactive map search, and 0% brokerage.
            </p>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-slate-800 bg-slate-900 text-slate-300 text-[11px] gap-1 px-2.5 py-1">
                <ShieldCheck className="h-3 w-3 text-emerald-400" /> 100% Verified
              </Badge>
              <Badge variant="outline" className="border-slate-800 bg-slate-900 text-slate-300 text-[11px] gap-1 px-2.5 py-1">
                <Sparkles className="h-3 w-3 text-amber-400" /> 0% Commission
              </Badge>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">Quick Explore</h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li>
                <Link href="/listings" className="hover:text-primary transition-colors flex items-center gap-1.5">
                  <span className="h-1 w-1 rounded-full bg-primary" />
                  Search PG Accommodations
                </Link>
              </li>
              <li>
                <Link href="/map" className="hover:text-primary transition-colors flex items-center gap-1.5">
                  <span className="h-1 w-1 rounded-full bg-primary" />
                  Interactive Map View
                </Link>
              </li>
              <li>
                <Link href="/onboarding" className="hover:text-primary transition-colors flex items-center gap-1.5">
                  <span className="h-1 w-1 rounded-full bg-primary" />
                  List Your Property
                </Link>
              </li>
            </ul>
          </div>

          {/* Student Hub */}
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">Student Hub</h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li>
                <Link href="/listings?verified=true" className="hover:text-primary transition-colors">
                  Verified PGs Near College
                </Link>
              </li>
              <li>
                <Link href="/listings?gender=female" className="hover:text-primary transition-colors">
                  Girls Only PGs
                </Link>
              </li>
              <li>
                <Link href="/listings?gender=male" className="hover:text-primary transition-colors">
                  Boys Only PGs
                </Link>
              </li>
              <li>
                <Link href="/listings?ac=true" className="hover:text-primary transition-colors">
                  AC Accommodations
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">Direct Support</h4>
            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-center gap-2.5 text-slate-300">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 border border-slate-800 text-primary">
                  <Mail className="h-3.5 w-3.5" />
                </div>
                <span>support@pgfinder.in</span>
              </li>
              <li className="flex items-center gap-2.5 text-slate-300">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 border border-slate-800 text-emerald-400">
                  <Phone className="h-3.5 w-3.5" />
                </div>
                <span>+91 98765 43210</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-900 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>&copy; {new Date().getFullYear()} PGFinder Platform. Built for Students & PG Owners.</p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Made with</span>
            <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />
            <span>for College Students</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

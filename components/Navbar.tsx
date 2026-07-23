"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Home,
  Search,
  MapPin,
  Heart,
  LayoutDashboard,
  Menu,
  X,
  MessageSquare,
  Plus,
  Building2,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useUserRole } from "@/lib/useUserRole";

export function Navbar() {
  const pathname = usePathname();
  const { role, isStudent, isOwner, isLoggedIn } = useUserRole();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) { setHasUnreadMessages(false); return; }
    const refreshUnread = async () => {
      try {
        const response = await fetch("/api/chat/conversations", { cache: "no-store" });
        if (!response.ok) return;
        const data = await response.json();
        const field = isOwner ? "unreadCountOwner" : "unreadCountStudent";
        setHasUnreadMessages((data.conversations || []).some((conversation: Record<string, number>) => (conversation[field] || 0) > 0));
      } catch { /* Leave the existing indicator untouched during transient failures. */ }
    };
    refreshUnread();
    const timer = window.setInterval(refreshUnread, 15000);
    return () => window.clearInterval(timer);
  }, [isLoggedIn, isOwner]);

  const publicLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/listings", label: "Search PGs", icon: Search },
    { href: "/map", label: "Map View", icon: MapPin },
  ];

  const studentLinks = [
    { href: "/saved", label: "Saved PGs", icon: Heart },
    { href: "/chat", label: "Messages", icon: MessageSquare },
  ];

  const ownerLinks = [
    { href: "/dashboard", label: "Owner Dashboard", icon: LayoutDashboard },
    { href: "/chat", label: "Messages", icon: MessageSquare },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <nav className="sticky top-0 z-50 w-full glass-nav shadow-sm transition-all duration-300">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-violet-500 text-primary-foreground shadow-md shadow-primary/20 group-hover:scale-105 transition-transform duration-300">
            <MapPin className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            PG<span className="text-primary font-extrabold">Finder</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden items-center gap-1 md:flex bg-muted/50 p-1 rounded-full border border-border/50">
          {publicLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link key={link.href} href={link.href}>
                <Button
                  variant={active ? "default" : "ghost"}
                  size="sm"
                  className={`gap-2 rounded-full px-4 text-xs font-semibold transition-all duration-200 ${
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/80"
                  }`}
                >
                  <link.icon className="h-3.5 w-3.5" />
                  {link.label}{link.href === "/chat" && hasUnreadMessages && <span aria-label="Unread messages" className="ml-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-background" />}
                </Button>
              </Link>
            );
          })}

          {isLoggedIn && (
            <>
              {isStudent &&
                studentLinks.map((link) => {
                  const active = isActive(link.href);
                  return (
                    <Link key={link.href} href={link.href}>
                      <Button
                        variant={active ? "default" : "ghost"}
                        size="sm"
                        className={`gap-2 rounded-full px-4 text-xs font-semibold transition-all duration-200 ${
                          active
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground hover:bg-background/80"
                        }`}
                      >
                        <link.icon className="h-3.5 w-3.5" />
                        {link.label}{link.href === "/chat" && hasUnreadMessages && <span aria-label="Unread messages" className="ml-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-background" />}
                      </Button>
                    </Link>
                  );
                })}

              {isOwner &&
                ownerLinks.map((link) => {
                  const active = isActive(link.href);
                  return (
                    <Link key={link.href} href={link.href}>
                      <Button
                        variant={active ? "default" : "ghost"}
                        size="sm"
                        className={`gap-2 rounded-full px-4 text-xs font-semibold transition-all duration-200 ${
                          active
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground hover:bg-background/80"
                        }`}
                      >
                        <link.icon className="h-3.5 w-3.5" />
                        {link.label}{link.href === "/chat" && hasUnreadMessages && <span aria-label="Unread messages" className="ml-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-background" />}
                      </Button>
                    </Link>
                  );
                })}
            </>
          )}
        </div>

        {/* Auth & Action Section */}
        <div className="flex items-center gap-3">
          {isOwner && (
            <Link href="/dashboard/create" className="hidden sm:block">
              <Button size="sm" className="gap-1.5 rounded-full shadow-md shadow-primary/20">
                <Plus className="h-4 w-4" />
                Add Listing
              </Button>
            </Link>
          )}

          <SignedOut>
            <Link href="/sign-in">
              <Button variant="ghost" size="sm" className="rounded-full text-xs font-semibold">
                Sign In
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm" className="rounded-full gap-1.5 shadow-md shadow-primary/20 text-xs font-semibold">
                <Sparkles className="h-3.5 w-3.5" />
                Get Started
              </Button>
            </Link>
          </SignedOut>

          <SignedIn>
            <div className="flex items-center gap-2.5 border-l pl-3 border-border/60">
              {role && (
                <Badge
                  variant="secondary"
                  className="hidden md:flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-medium shadow-sm bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
                >
                  {isOwner ? (
                    <>
                      <Building2 className="h-3 w-3" /> Owner Mode
                    </>
                  ) : (
                    <>
                      <GraduationCap className="h-3 w-3" /> Student Mode
                    </>
                  )}
                </Badge>
              )}
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "h-9 w-9 border-2 border-primary/20 shadow-sm rounded-full hover:scale-105 transition-transform",
                  },
                }}
              />
            </div>
          </SignedIn>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden rounded-full p-2 hover:bg-muted transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-foreground" />
            ) : (
              <Menu className="h-6 w-6 text-foreground" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-border/60 bg-background/95 backdrop-blur-xl p-4 md:hidden animate-in slide-in-from-top-2 duration-300">
          <div className="flex flex-col gap-2">
            {role && (
              <div className="mb-2 px-3 py-2 rounded-xl bg-muted/60 flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-medium">Logged in as:</span>
                <Badge variant={isOwner ? "default" : "secondary"} className={isOwner ? "bg-emerald-600 text-white" : ""}>
                  {isOwner ? "PG Owner" : "Student"}
                </Badge>
              </div>
            )}

            {publicLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Button
                  variant={isActive(link.href) ? "default" : "ghost"}
                  className="w-full justify-start gap-2.5 rounded-xl font-medium"
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}{link.href === "/chat" && hasUnreadMessages && <span aria-label="Unread messages" className="ml-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-background" />}
                </Button>
              </Link>
            ))}

            <SignedIn>
              {isStudent &&
                studentLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button
                      variant={isActive(link.href) ? "default" : "ghost"}
                      className="w-full justify-start gap-2.5 rounded-xl font-medium"
                    >
                      <link.icon className="h-4 w-4" />
                      {link.label}{link.href === "/chat" && hasUnreadMessages && <span aria-label="Unread messages" className="ml-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-background" />}
                    </Button>
                  </Link>
                ))}

              {isOwner && (
                <>
                  {ownerLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button
                        variant={isActive(link.href) ? "default" : "ghost"}
                        className="w-full justify-start gap-2.5 rounded-xl font-medium"
                      >
                        <link.icon className="h-4 w-4" />
                        {link.label}{link.href === "/chat" && hasUnreadMessages && <span aria-label="Unread messages" className="ml-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-background" />}
                      </Button>
                    </Link>
                  ))}
                  <Link
                    href="/dashboard/create"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button className="w-full justify-start gap-2.5 rounded-xl mt-2">
                      <Plus className="h-4 w-4" />
                      Add New Listing
                    </Button>
                  </Link>
                </>
              )}
            </SignedIn>
          </div>
        </div>
      )}
    </nav>
  );
}

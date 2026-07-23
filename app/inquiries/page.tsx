"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, ExternalLink, Search } from "lucide-react";
import { getRelativeTime } from "@/lib/utils";

import { useRouter } from "next/navigation";
import { useUserRole } from "@/lib/useUserRole";

interface InquiryItem {
  _id: string;
  listingId: string;
  listingTitle: string;
  message: string;
  status: "pending" | "responded";
  createdAt: string;
}

export default function InquiriesPage() {
  const router = useRouter();
  const { isOwner, loading: roleLoading } = useUserRole();
  const [inquiries, setInquiries] = useState<InquiryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roleLoading) {
      if (isOwner) {
        toast.info("Owners access inquiries on their dashboard. Redirecting...");
        router.push("/dashboard");
        return;
      }
      fetchInquiries();
    }
  }, [roleLoading, isOwner, router]);

  async function fetchInquiries() {
    try {
      const res = await axios.get("/api/inquiries?role=student");
      setInquiries(res.data.inquiries || []);
    } catch {
      toast.error("Failed to load inquiries");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="container py-8">
        <div className="skeleton h-10 w-48 mb-6 rounded" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-24 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">My Sent Inquiries</h1>
        <p className="text-muted-foreground">
          Track messages and inquiries you have sent to PG property owners ({inquiries.length} total)
        </p>
      </div>

      {inquiries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <MessageSquare className="mb-4 h-16 w-16 text-muted-foreground/30" />
          <h3 className="mb-2 text-xl font-semibold">No Inquiries Yet</h3>
          <p className="mb-4 text-muted-foreground">
            Browse PG listings and send inquiries to owners you&apos;re interested in
          </p>
          <Link href="/listings">
            <Button className="gap-2">
              <Search className="h-4 w-4" />
              Browse PGs
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {inquiries.map((inquiry) => (
            <Card key={inquiry._id}>
              <CardContent className="flex items-start gap-4 pt-6">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="mb-1 flex items-center gap-2 flex-wrap">
                    <Link
                      href={`/listings/${inquiry.listingId}`}
                      className="font-semibold hover:text-primary transition-colors"
                    >
                      {inquiry.listingTitle}
                    </Link>
                    <Badge
                      variant={
                        inquiry.status === "pending" ? "warning" : "success"
                      }
                    >
                      {inquiry.status === "pending" ? "Pending" : "Responded"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {inquiry.message}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Sent {getRelativeTime(inquiry.createdAt)}
                  </p>
                </div>
                <Link href={`/listings/${inquiry.listingId}`}>
                  <Button variant="ghost" size="icon">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Plus,
  MessageSquare,
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  ShieldCheck,
} from "lucide-react";
import { formatPrice, getRelativeTime } from "@/lib/utils";
import type { Document } from "mongoose";
import type { IListing } from "@/models/Listing";
import type { IInquiry } from "@/models/Inquiry";
import { useUserRole } from "@/lib/useUserRole";

interface ListingWithId extends Omit<IListing, "_id" | keyof Document> {
  _id: string;
}

interface InquiryWithId extends Omit<IInquiry, "_id" | keyof Document> {
  _id: string;
  studentName?: string;
  studentEmail?: string;
}

export default function DashboardPage() {
  const { user, role, isOwner, loading: roleLoading } = useUserRole();
  const router = useRouter();
  const [listings, setListings] = useState<ListingWithId[]>([]);
  const [inquiries, setInquiries] = useState<InquiryWithId[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roleLoading) {
      if (!isOwner) {
        router.push("/listings");
        return;
      }
      fetchDashboardData();
    }
  }, [roleLoading, isOwner, router, user]);

  async function fetchDashboardData() {
    try {
      const ownerId = user?.id;
      const listingsUrl = ownerId ? `/api/listings?ownerId=${ownerId}` : "/api/listings";
      const [listingsRes, inquiriesRes] = await Promise.all([
        axios.get(listingsUrl),
        axios.get("/api/inquiries?role=owner"),
      ]);
      setListings(listingsRes.data.listings || []);
      setInquiries(inquiriesRes.data.inquiries || []);
    } catch {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this listing? This action cannot be undone.")) {
      return;
    }

    try {
      await axios.delete(`/api/listings/${id}`);
      setListings((prev) => prev.filter((l) => l._id !== id));
      toast.success("Listing deleted successfully");
    } catch {
      toast.error("Failed to delete listing");
    }
  }

  async function handleToggleActive(listing: ListingWithId) {
    try {
      const newStatus = !listing.isActive;
      await axios.put(`/api/listings/${listing._id}`, { isActive: newStatus });
      setListings((prev) =>
        prev.map((l) => (l._id === listing._id ? { ...l, isActive: newStatus } : l))
      );
      toast.success(newStatus ? "Listing activated" : "Listing deactivated");
    } catch {
      toast.error("Failed to update listing status");
    }
  }

  async function handleMarkResponded(id: string) {
    try {
      await axios.patch(`/api/inquiries/${id}`);
      setInquiries((prev) =>
        prev.map((inq) =>
          inq._id === id ? { ...inq, status: "responded" as const } : inq
        )
      );
      toast.success("Inquiry marked as responded");
    } catch {
      toast.error("Failed to update inquiry");
    }
  }

  if (loading || roleLoading) {
    return (
      <div className="container py-8">
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-32 rounded-lg" />
          ))}
        </div>
        <div className="skeleton h-64 rounded-lg" />
      </div>
    );
  }

  const activeListings = listings.filter((l) => l.isActive).length;
  const pendingInquiries = inquiries.filter((i) => i.status === "pending").length;

  return (
    <div className="container py-8 space-y-8">
      {/* Dashboard Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">Owner Control Panel</h1>
            <Badge variant="default" className="gap-1">
              <Building2 className="h-3 w-3" /> PG Owner
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            Manage your accommodations, edit details, and respond to student inquiries
          </p>
        </div>
        <Link href="/dashboard/create">
          <Button className="gap-2 shadow">
            <Plus className="h-4 w-4" />
            Add New Listing
          </Button>
        </Link>
      </div>

      {/* Overview Metrics Cards */}
      <div className="grid gap-5 md:grid-cols-3">
        <Card className="border-l-4 border-l-primary shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Accommodations
            </CardTitle>
            <Building2 className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{listings.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="font-semibold text-emerald-600">{activeListings} active</span> listings visible to students
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Student Inquiries
            </CardTitle>
            <MessageSquare className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{inquiries.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="font-semibold text-amber-600">{pendingInquiries} pending</span> response
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Response Rate
            </CardTitle>
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {inquiries.length > 0
                ? Math.round(
                    ((inquiries.length - pendingInquiries) / inquiries.length) *
                      100
                  )
                : 100}
              %
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              High response rates attract more students
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Listings Table */}
      <Card className="shadow-sm">
        <CardHeader className="border-b bg-muted/20">
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Your PG Listings
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {listings.length === 0 ? (
            <div className="py-16 text-center">
              <Building2 className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
              <h3 className="mb-2 text-lg font-semibold">No listings created yet</h3>
              <p className="mb-4 text-sm text-muted-foreground max-w-sm mx-auto">
                Add your PG accommodations so thousands of students can search and contact you.
              </p>
              <Link href="/dashboard/create">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create First Listing
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-left border-b">
                  <tr>
                    <th className="p-4 font-semibold text-muted-foreground">PG Details</th>
                    <th className="p-4 font-semibold text-muted-foreground">Monthly Rent</th>
                    <th className="p-4 font-semibold text-muted-foreground">Status</th>
                    <th className="p-4 font-semibold text-muted-foreground">Location</th>
                    <th className="p-4 text-right font-semibold text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {listings.map((listing) => (
                    <tr key={listing._id} className="hover:bg-muted/10 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {listing.photos[0] ? (
                            <img
                              src={listing.photos[0]}
                              alt={listing.title}
                              className="h-12 w-12 rounded-lg object-cover border"
                            />
                          ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted border">
                              <Building2 className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <Link
                              href={`/listings/${listing._id}`}
                              className="font-semibold hover:text-primary transition-colors text-base"
                            >
                              {listing.title}
                            </Link>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                              <span>{listing.type}</span>
                              <span>•</span>
                              <span className="capitalize">{listing.gender}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-bold text-primary">
                        {formatPrice(listing.price)}/mo
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1 items-start">
                          <button
                            onClick={() => handleToggleActive(listing)}
                            className="cursor-pointer"
                            title="Click to toggle active status"
                          >
                            <Badge
                              variant={listing.isActive ? "success" : "secondary"}
                              className="gap-1 cursor-pointer hover:opacity-80"
                            >
                              {listing.isActive ? (
                                <>
                                  <CheckCircle2 className="h-3 w-3" /> Active
                                </>
                              ) : (
                                <>
                                  <XCircle className="h-3 w-3" /> Inactive
                                </>
                              )}
                            </Badge>
                          </button>
                          {listing.isVerified && (
                            <Badge className="bg-emerald-600 text-white text-[10px] gap-1 px-1.5 py-0">
                              <ShieldCheck className="h-3 w-3" /> Verified
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {listing.address.city}, {listing.address.state}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/listings/${listing._id}`}>
                            <Button variant="ghost" size="icon" title="View Listing Page">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/dashboard/edit/${listing._id}`}>
                            <Button variant="ghost" size="icon" title="Edit Listing">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Delete Listing"
                            onClick={() => handleDelete(listing._id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Inquiry Inbox */}
      <Card className="shadow-sm">
        <CardHeader className="border-b bg-muted/20">
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-amber-500" />
            Inquiries Received from Students
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {inquiries.length === 0 ? (
            <div className="py-8 text-center">
              <MessageSquare className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">
                No student inquiries received yet. When students contact you, their messages will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {inquiries.map((inquiry) => (
                <div
                  key={inquiry._id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border p-4 gap-4 hover:border-primary/40 transition-colors"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
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
                        {inquiry.status}
                      </Badge>
                    </div>
                    <div className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded inline-block w-fit border border-emerald-200">
                      Inquirer: {inquiry.studentName || "Student User"} {inquiry.studentEmail ? `(${inquiry.studentEmail})` : ""}
                    </div>
                    <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded border mt-1">
                      &quot;{inquiry.message}&quot;
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Received {getRelativeTime(inquiry.createdAt)}
                    </p>
                  </div>
                  {inquiry.status === "pending" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMarkResponded(inquiry._id)}
                      className="self-start sm:self-center gap-1.5"
                    >
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      Mark Responded
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

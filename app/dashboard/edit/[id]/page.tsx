"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import ListingForm from "@/components/dashboard/ListingForm";
import type { CreateListingInput } from "@/lib/validations";

export default function EditListingPage() {
  const { id } = useParams();
  const router = useRouter();
  const [listing, setListing] = useState<(Partial<CreateListingInput> & { _id: string }) | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchListing() {
      try {
        const res = await axios.get(`/api/listings/${id}`);
        setListing(res.data.listing);
      } catch {
        toast.error("Failed to load listing");
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchListing();
    }
  }, [id, router]);

  if (loading) {
    return (
      <div className="container max-w-3xl py-8">
        <div className="skeleton h-12 w-48 mb-4 rounded" />
        <div className="skeleton h-96 rounded-lg" />
      </div>
    );
  }

  if (!listing) return null;

  return <ListingForm initialData={listing} mode="edit" />;
}

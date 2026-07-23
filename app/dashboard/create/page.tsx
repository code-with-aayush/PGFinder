import type { Metadata } from "next";
import ListingForm from "@/components/dashboard/ListingForm";

export const metadata: Metadata = {
  title: "Create New Listing",
  description: "List your PG accommodation on PGFinder. Add photos, amenities, and location details.",
};

export default function CreateListingPage() {
  return <ListingForm mode="create" />;
}

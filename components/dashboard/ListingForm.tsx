"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Upload,
  X,
  MapPin,
  Search,
  LocateFixed,
} from "lucide-react";
import { createListingSchema, type CreateListingInput } from "@/lib/validations";
import { formatPrice } from "@/lib/utils";

interface ListingFormProps {
  initialData?: Partial<CreateListingInput> & { _id?: string };
  mode: "create" | "edit";
}

const STEPS = [
  "Basic Info",
  "Amenities & Rules",
  "Photos",
  "Location",
  "Review",
];

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export default function ListingForm({ initialData, mode }: ListingFormProps) {
  const router = useRouter();
  const { user } = useUser();
  const [step, setStep] = useState(0);
  const [photos, setPhotos] = useState<string[]>(initialData?.photos || []);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [locationSearch, setLocationSearch] = useState("");
  const [geocoding, setGeocoding] = useState(false);
  const [locationVerified, setLocationVerified] = useState(!!initialData?.location);

  async function searchLocationQuery(query: string) {
    if (!query.trim()) {
      toast.error("Please enter a landmark or address to search");
      return;
    }
    setGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`
      );
      const data = await res.json();
      if (data.length > 0) {
        const lng = parseFloat(data[0].lon);
        const lat = parseFloat(data[0].lat);
        setValue("location.coordinates.0", lng);
        setValue("location.coordinates.1", lat);
        setLocationVerified(true);
        toast.success(`Pin set: ${data[0].display_name.slice(0, 50)}...`);
      } else {
        toast.error("Location not found. Try adding a city name.");
      }
    } catch {
      toast.error("Failed to fetch coordinates for this location");
    } finally {
      setGeocoding(false);
    }
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) { toast.error("Location is not supported by this browser"); return; }
    setGeocoding(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setValue("location.coordinates.0", coords.longitude);
        setValue("location.coordinates.1", coords.latitude);
        setLocationVerified(true);
        toast.success("Your current location has been pinned. Please confirm it matches the property.");
        setGeocoding(false);
      },
      () => { toast.error("Unable to access location. Search the property address instead."); setGeocoding(false); },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<CreateListingInput>({
    resolver: zodResolver(createListingSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      ownerPhone: (initialData as any)?.ownerPhone || "",
      price: initialData?.price || 5000,
      type: initialData?.type || "PG",
      gender: initialData?.gender || "any",
      address: {
        street: initialData?.address?.street || "",
        city: initialData?.address?.city || "",
        state: initialData?.address?.state || "",
        pincode: initialData?.address?.pincode || "",
      },
      location: initialData?.location || {
        type: "Point",
        coordinates: [77.2090, 28.6139],
      },
      amenities: {
        ac: initialData?.amenities?.ac || false,
        wifi: initialData?.amenities?.wifi || false,
        meals: initialData?.amenities?.meals || false,
        laundry: initialData?.amenities?.laundry || false,
        parking: initialData?.amenities?.parking || false,
        hotWater: initialData?.amenities?.hotWater || false,
        powerBackup: initialData?.amenities?.powerBackup || false,
        security: initialData?.amenities?.security || false,
      },
      rules: {
        vegOnly: initialData?.rules?.vegOnly || false,
        noSmoking: initialData?.rules?.noSmoking || false,
        noAlcohol: initialData?.rules?.noAlcohol || false,
        guestPolicy: initialData?.rules?.guestPolicy || "No restrictions",
        curfewTime: initialData?.rules?.curfewTime || "No curfew",
      },
      photos: initialData?.photos || [],
    },
  });

  const watchAll = watch();

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (photos.length + files.length > 10) {
      toast.error("Maximum 10 photos allowed");
      return;
    }

    setUploading(true);

    for (const file of Array.from(files)) {
      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await axios.post("/api/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (res.data?.url) {
          setPhotos((prev) => {
            const updated = [...prev, res.data.url];
            setValue("photos", updated, { shouldValidate: true });
            return updated;
          });
          toast.success(`Uploaded to Cloudinary: ${file.name}`);
        }
      } catch (err) {
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    setUploading(false);
    e.target.value = "";
  }

  function removePhoto(index: number) {
    setPhotos((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      setValue("photos", updated);
      return updated;
    });
  }

  async function nextStep() {
    let fieldsToValidate: (keyof CreateListingInput)[] = [];

    switch (step) {
      case 0:
        fieldsToValidate = ["title", "description", "price", "type", "gender", "address"];
        break;
      case 1:
        fieldsToValidate = ["amenities", "rules"];
        break;
      case 2:
        setValue("photos", photos);
        fieldsToValidate = ["photos"];
        break;
      case 3:
        fieldsToValidate = ["location"];
        break;
    }

    const valid = await trigger(fieldsToValidate);
    if (valid) {
      setStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    }
  }

  function prevStep() {
    setStep((prev) => Math.max(prev - 1, 0));
  }

  async function onSubmit(data: CreateListingInput) {
    setSubmitting(true);
    try {
      if (mode === "edit" && initialData?._id) {
        await axios.put(`/api/listings/${initialData._id}`, data);
        toast.success("Listing updated successfully!");
      } else {
        await axios.post("/api/listings", data);
        toast.success("Listing created successfully!");
      }
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      const apiError = axios.isAxiosError(error) ? error.response?.data?.error : null;
      toast.error(apiError || `Failed to ${mode} listing. Please try again.`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container max-w-3xl py-8">
      {/* Step Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                  i < step
                    ? "bg-primary text-primary-foreground"
                    : i === step
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`mx-2 hidden h-0.5 w-8 sm:block md:w-16 ${
                    i < step ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between">
          {STEPS.map((label, i) => (
            <span
              key={label}
              className={`hidden text-xs sm:block ${
                i === step ? "text-primary font-medium" : "text-muted-foreground"
              }`}
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Step 1: Basic Info */}
        {step === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">PG Name</label>
                <Input
                  {...register("title")}
                  placeholder="e.g., Sunshine PG for Girls"
                />
                {errors.title && (
                  <p className="mt-1 text-xs text-destructive">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Description</label>
                <Textarea
                  {...register("description")}
                  placeholder="Describe your PG — rooms, neighborhood, nearby landmarks..."
                  rows={4}
                />
                {errors.description && (
                  <p className="mt-1 text-xs text-destructive">{errors.description.message}</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Owner WhatsApp / Contact Number</label>
                <Input
                  {...register("ownerPhone")}
                  placeholder="e.g., 9876543210 (10-digit mobile number)"
                />
                {errors.ownerPhone && (
                  <p className="mt-1 text-xs text-destructive">{errors.ownerPhone.message}</p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Monthly Rent (₹)
                  </label>
                  <Input
                    type="number"
                    {...register("price", { valueAsNumber: true })}
                    placeholder="8000"
                  />
                  {errors.price && (
                    <p className="mt-1 text-xs text-destructive">{errors.price.message}</p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">Type</label>
                  <select
                    {...register("type")}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="PG">PG</option>
                    <option value="Hostel">Hostel</option>
                    <option value="Flat Share">Flat Share</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">Gender</label>
                  <select
                    {...register("gender")}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="any">Any</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="mb-3 font-medium">Address</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-sm font-medium">Street</label>
                    <Input
                      {...register("address.street")}
                      placeholder="123, Main Street"
                    />
                    {errors.address?.street && (
                      <p className="mt-1 text-xs text-destructive">{errors.address.street.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">City</label>
                    <Input
                      {...register("address.city")}
                      placeholder="Delhi"
                    />
                    {errors.address?.city && (
                      <p className="mt-1 text-xs text-destructive">{errors.address.city.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">State</label>
                    <Input
                      {...register("address.state")}
                      placeholder="Delhi"
                    />
                    {errors.address?.state && (
                      <p className="mt-1 text-xs text-destructive">{errors.address.state.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Pincode</label>
                    <Input
                      {...register("address.pincode")}
                      placeholder="110001"
                    />
                    {errors.address?.pincode && (
                      <p className="mt-1 text-xs text-destructive">{errors.address.pincode.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Amenities & Rules */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Amenities & House Rules</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="mb-3 font-medium">Amenities</h3>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { key: "ac" as const, label: "Air Conditioning" },
                    { key: "wifi" as const, label: "WiFi" },
                    { key: "meals" as const, label: "Meals Included" },
                    { key: "laundry" as const, label: "Laundry" },
                    { key: "parking" as const, label: "Parking" },
                    { key: "hotWater" as const, label: "Hot Water" },
                    { key: "powerBackup" as const, label: "Power Backup" },
                    { key: "security" as const, label: "Security" },
                  ].map((amenity) => (
                    <label
                      key={amenity.key}
                      className={`flex cursor-pointer items-center gap-2 rounded-lg border p-3 transition-colors ${
                        watchAll.amenities?.[amenity.key]
                          ? "border-primary bg-primary/5"
                          : "hover:border-primary/50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        {...register(`amenities.${amenity.key}`)}
                        className="rounded border-input"
                      />
                      <span className="text-sm">{amenity.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="mb-3 font-medium">House Rules</h3>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {[
                    { key: "vegOnly" as const, label: "Veg Only" },
                    { key: "noSmoking" as const, label: "No Smoking" },
                    { key: "noAlcohol" as const, label: "No Alcohol" },
                  ].map((rule) => (
                    <label
                      key={rule.key}
                      className={`flex cursor-pointer items-center gap-2 rounded-lg border p-3 transition-colors ${
                        watchAll.rules?.[rule.key]
                          ? "border-primary bg-primary/5"
                          : "hover:border-primary/50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        {...register(`rules.${rule.key}`)}
                        className="rounded border-input"
                      />
                      <span className="text-sm">{rule.label}</span>
                    </label>
                  ))}
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Guest Policy
                    </label>
                    <Input
                      {...register("rules.guestPolicy")}
                      placeholder="e.g., Guests allowed till 9 PM"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Curfew Time
                    </label>
                    <Input
                      {...register("rules.curfewTime")}
                      placeholder="e.g., 10:00 PM"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Photos */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Photos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">
                Upload up to 10 photos of your PG. At least 1 photo is required.
              </p>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {photos.map((url, index) => (
                  <div key={index} className="group relative aspect-square">
                    <img
                      src={url}
                      alt={`Photo ${index + 1}`}
                      className="h-full w-full rounded-lg object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}

                {photos.length < 10 && (
                  <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors">
                    {uploading ? (
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    ) : (
                      <>
                        <Upload className="mb-2 h-6 w-6 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          Add Photo
                        </span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                )}
              </div>

              {errors.photos && (
                <p className="mt-2 text-xs text-destructive">
                  {errors.photos.message}
                </p>
              )}

              <p className="mt-3 text-xs text-muted-foreground">
                {photos.length}/10 photos uploaded
              </p>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Location */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Pin PG Location on Map
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <p className="text-sm text-muted-foreground">
                Set your PG&apos;s location so students can easily find your property on the map.
              </p>

              {/* Landmark / Area Search */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Search Nearby Landmark / College</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="e.g., DTU Main Gate, Koramangala 5th Block, Kamla Nagar Delhi"
                      className="pl-9"
                      value={locationSearch}
                      onChange={(e) => setLocationSearch(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          searchLocationQuery(locationSearch);
                        }
                      }}
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={() => searchLocationQuery(locationSearch)}
                    disabled={geocoding}
                    className="gap-1.5"
                  >
                    {geocoding ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                    Find Location
                  </Button>
                </div>
              </div>

              {/* Quick Auto-Detect Button */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/40 p-4">
                <div>
                  <h4 className="text-sm font-semibold">Auto-Pin from Address</h4>
                  <p className="text-xs text-muted-foreground">
                    {watchAll.address?.city
                      ? `Uses "${watchAll.address?.street ? watchAll.address.street + ", " : ""}${watchAll.address.city}" from Step 1`
                      : "Uses the street & city entered in Step 1"}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2 bg-background"
                  onClick={() => {
                    const query = `${watchAll.address?.street || ""}, ${watchAll.address?.city || ""}, ${watchAll.address?.state || ""}, ${watchAll.address?.pincode || ""}`.trim();
                    if (!query) {
                      toast.error("Please fill in city and street in Step 1 first");
                      return;
                    }
                    searchLocationQuery(query);
                  }}
                  disabled={geocoding}
                >
                  <MapPin className="h-4 w-4 text-primary" />
                  Detect Pin from Address
                </Button>
              </div>

              <Button type="button" variant="outline" className="w-full gap-2" onClick={useCurrentLocation} disabled={geocoding}> <LocateFixed className="h-4 w-4" /> Use my current property location </Button>

              {/* Selected Location Summary */}
              <div className={`rounded-lg border p-4 text-sm ${locationVerified ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-900" : "border-amber-500/20 bg-amber-500/5 text-amber-900"}`}>
                <div className="flex items-center gap-2 font-semibold">
                  <Check className="h-4 w-4 text-emerald-600" />
{locationVerified ? "Map location confirmed" : "Location still needs confirmation"}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Latitude: <span className="font-mono font-medium text-foreground">{watchAll.location?.coordinates?.[1] || 28.6139}</span>, Longitude: <span className="font-mono font-medium text-foreground">{watchAll.location?.coordinates?.[0] || 77.2090}</span>
                </p>
              </div>

              {/* Advanced Collapsible Lat/Lng Manual Override */}
              <details className="text-xs text-muted-foreground">
                <summary className="cursor-pointer font-medium hover:text-foreground transition-colors">
                  Advanced: Edit Latitude & Longitude numbers manually
                </summary>
                <div className="mt-3 grid gap-3 sm:grid-cols-2 pt-2 border-t">
                  <div>
                    <label className="mb-1 block font-medium">Longitude</label>
                    <Input
                      type="number"
                      step="any"
                      {...register("location.coordinates.0", { valueAsNumber: true })}
                      placeholder="77.2090"
                      className="text-xs"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-medium">Latitude</label>
                    <Input
                      type="number"
                      step="any"
                      {...register("location.coordinates.1", { valueAsNumber: true })}
                      placeholder="28.6139"
                      className="text-xs"
                    />
                  </div>
                </div>
              </details>
            </CardContent>
          </Card>
        )}

        {/* Step 5: Review */}
        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>Review Your Listing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="mb-2 font-medium text-muted-foreground">Basic Info</h3>
                <div className="rounded-lg border p-4 space-y-2">
                  <p><strong>Title:</strong> {watchAll.title}</p>
                  <p><strong>Price:</strong> {formatPrice(watchAll.price || 0)}/month</p>
                  <p><strong>Type:</strong> {watchAll.type} · <strong>Gender:</strong> {watchAll.gender}</p>
                  <p><strong>Address:</strong> {watchAll.address?.street}, {watchAll.address?.city}, {watchAll.address?.state} - {watchAll.address?.pincode}</p>
                </div>
              </div>

              <div>
                <h3 className="mb-2 font-medium text-muted-foreground">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(watchAll.amenities || {})
                    .filter(([, v]) => v)
                    .map(([k]) => (
                      <Badge key={k} variant="secondary">
                        {k.replace(/([A-Z])/g, " $1").trim()}
                      </Badge>
                    ))}
                  {Object.entries(watchAll.amenities || {}).filter(([, v]) => v).length === 0 && (
                    <span className="text-sm text-muted-foreground">None selected</span>
                  )}
                </div>
              </div>

              <div>
                <h3 className="mb-2 font-medium text-muted-foreground">Photos</h3>
                <div className="flex gap-2 overflow-x-auto">
                  {photos.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt={`Photo ${i + 1}`}
                      className="h-20 w-20 flex-shrink-0 rounded-md object-cover"
                    />
                  ))}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {photos.length} photo(s)
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={step === 0 ? () => router.push("/dashboard") : prevStep}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {step === 0 ? "Cancel" : "Back"}
          </Button>

          {step < STEPS.length - 1 ? (
            <Button type="button" onClick={nextStep} className="gap-2">
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button type="submit" disabled={submitting} className="gap-2">
              {submitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  {mode === "edit" ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  {mode === "edit" ? "Update Listing" : "Create Listing"}
                </>
              )}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

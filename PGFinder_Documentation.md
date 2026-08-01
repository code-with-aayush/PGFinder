# PGFinder — Complete Technical Project Documentation & Viva Guide

> **Target Audience**: Student Developer / Viva Candidate / Project Reviewer

---
## 1. PROJECT OVERVIEW

### 1.1 What Problem Does PGFinder Solve?
Users moving to new cities face a chaotic, unsafe housing search. Most hunt for PG (Paying Guest) accommodations through social media groups, local brokers, or general classified platforms. This causes three major issues:
* **Zero Verification** — Unverified listings, fake photos, and advance-payment scams.
* **No Relevant Filters** — No way to filter by commute distance, AC/non-AC, food preference (veg/non-veg), or gender rules.
* **Broker Interference** — High brokerage fees charged by middlemen.

### 1.2 The PGFinder Solution
PGFinder is a full-stack web application with two types of users — **Students** and **PG Owners** — each getting a tailored experience:

* **For Students**: Search and filter PGs by city, min/max budget, gender, amenities (AC, WiFi, meals), veg-only rules, and verification status. Sort by newest, price low-to-high, or price high-to-low. Browse listings on an interactive map. Save favorites. Send inquiries that open in-app chat threads. Contact owners on WhatsApp with 1 click.
* **For PG Owners**: Use the Owner Control Panel (`/dashboard`) to create, edit, and manage PG listings through a **5-step wizard** (`ListingForm.tsx`). The wizard includes address search, current-location detection, and interactive map pin placement. Owners receive student inquiries in the dashboard and communicate via in-app messaging. They can activate/deactivate listings and delete them.

### 1.3 Why This Project Stands Out in a Viva
* **Marketplace Architecture** — Dual-actor role-based access control (RBAC) powered by Clerk metadata.
* **Geospatial Engineering** — MongoDB `2dsphere` spatial indexing with GeoJSON coordinates `[lng, lat]` supporting `$nearSphere` radius distance queries.
* **Resilient System Design** — Hybrid database architecture featuring a fallback database (`mockDb.ts`) that serves mock data when MongoDB Atlas is unreachable.
* **Optimized Web Architecture** — Debounced search inputs, optimistic UI updates with automatic rollback on failure, tab-visibility-aware periodic chat polling, and paginated API responses.

---

## 2. TECH STACK — EVERY TOOL EXPLAINED

> **Simple Explanation**: A "tech stack" is the collection of tools and libraries a project uses. Below is every tool in PGFinder and why it was chosen.

| Tool / Library | Category | Why Chosen For THIS Project | File References |
| :--- | :--- | :--- | :--- |
| **Next.js 14 (App Router)** | Framework | Provides unified full-stack architecture with React Server Components, serverless API routes, and file-system routing. One framework replaces what would otherwise need separate frontend and backend setups. | `app/layout.tsx`, `app/page.tsx`, `app/api/*` |
| **TypeScript** | Language | Strict typing catches bugs at compile time instead of runtime. Every file uses `.ts` or `.tsx` extensions. | All source files |
| **MongoDB Atlas + Mongoose** | Database | Native support for GeoJSON spatial indexing (`2dsphere`) for map-based searches, flexible document schemas for varying property attributes, and Atlas cloud hosting. | `lib/mongodb.ts`, `models/*` |
| **mockDb.ts** | Resilience Layer | Custom in-memory fallback database that prevents app crashes if MongoDB Atlas encounters network timeouts or IP whitelist issues during live demos. | `lib/mockDb.ts` |
| **Clerk v5** | Auth & RBAC | Handles OAuth, email sign-up, session management, and role metadata storage (`publicMetadata.role`). Uses asynchronous server patterns (`await auth()`). | `middleware.ts`, `lib/useUserRole.ts`, `app/api/users/sync/route.ts` |
| **Cloudinary v2 SDK** | Media CDN | Offloads heavy image storage from the server. The API route converts uploaded files to base64 and calls `cloudinary.uploader.upload()` with server-side credentials. | `lib/cloudinary.ts`, `app/api/upload/route.ts` |
| **Leaflet.js + React-Leaflet** | Maps | Lightweight, open-source client-side map rendering. Selected over Google Maps to avoid paid API keys and mandatory billing setup. | `app/map/page.tsx`, `components/dashboard/LocationPicker.tsx` |
| **Nominatim (OpenStreetMap)** | Geocoding API | Free REST API for resolving college names, street addresses, and coordinates into map pins. No API key required. | `components/dashboard/ListingForm.tsx`, `app/map/page.tsx` |
| **Tailwind CSS + shadcn/ui** | UI Styling | Utility-first CSS framework with accessible, customizable component primitives (Button, Card, Badge, Input, etc.). | `app/globals.css`, `components/ui/*` |
| **Poppins (Google Font)** | Typography | Loaded via `next/font` for optimized font delivery. Applied as the default font across all pages. | `app/layout.tsx` |
| **Zod + React Hook Form** | Form Validation | Schema-based validation for listing forms, inquiry messages, phone numbers, and API request bodies. Same schemas used on both client and server. | `lib/validations.ts`, `components/dashboard/ListingForm.tsx` |
| **Axios** | HTTP Client | Promise-based HTTP client used for all frontend-to-API communication. | Throughout client components |
| **Sonner** | Toast Notifications | Elegant toast notification library for success/error feedback throughout the app. | `components/ui/sonner.tsx`, used everywhere |
| **Lucide React** | Icons | Modern icon library providing all UI icons (MapPin, Search, Heart, Shield, etc.). | Throughout components |
| **Vercel** | Hosting | Zero-configuration serverless deployment platform for Next.js applications. | `next.config.js` |

---

## 3. SYSTEM ARCHITECTURE & DATA FLOWS

```
                                +------------------------+
                                |  Client (Browser UI)   |
                                +-----------+------------+
                                            |
         +----------------------------------+----------------------------------+
         |                                  |                                  |
         v                                  v                                  v
+------------------+              +-------------------+              +-------------------+
|  Clerk Auth v5   |              |  Next.js 14 APIs  |              | Nominatim / Cloud |
| (publicMetadata) |              |  (/app/api/*)     |              | (Geocoding/Media) |
+------------------+              +---------+---------+              +-------------------+
                                            |
                         +------------------+------------------+
                         |                                     |
                         v                                     v
              +----------------------+               +--------------------+
              | MongoDB Atlas        |               | lib/mockDb.ts      |
              | (2dsphere Spatial)   |               | (Fallback DB)      |
              +----------------------+               +--------------------+
```

### 3.1 Search & Filter Request Lifecycle (Step-by-Step)
1. **User Types in City**: Student types `"Bangalore"` into the city field in `FilterSidebar.tsx`.
2. **Debounce Waits**: The `useDebounce` hook holds execution for `350ms`. If no further typing occurs, it triggers the search.
3. **URL Update**: `FilterSidebar` updates URL search parameters via `router.push('/listings?city=Bangalore')`. The URL acts as a single source of truth for all active filters.
4. **API Fetch**: `app/listings/page.tsx` detects the URL change and calls `GET /api/listings?city=Bangalore&sort=newest`.
5. **Database Query**: The API route builds a MongoDB query with `{ "address.city": { $regex: "Bangalore", $options: "i" } }` and executes `Listing.find(query).sort(sortQuery).skip(...).limit(...)`.
6. **Skeleton → Real Cards**: While fetching, `GridListingSkeleton` renders shimmer placeholders matching the card layout. Once data arrives, real `ListingCard` components render.

### 3.2 Authentication & Role Assignment Lifecycle
1. **Sign Up**: User signs up via Clerk at `/sign-up`.
2. **Onboarding Redirect**: New users land on `/onboarding` and select either `"Student"` or `"PG Owner"`.
3. **Role Sync**: The page sends `POST /api/users/sync` with `{ role: "owner" }` (or `"student"`).
4. **Clerk Metadata Update**: The API calls `clerkClient().users.updateUserMetadata(userId, { publicMetadata: { role } })`.
5. **MongoDB User Create**: If MongoDB is available, a `User` document is created/found in the database.
6. **Session Refresh**: The page calls `await user.reload()` and then does a hard browser redirect (`window.location.href`) to `/dashboard` (for owners) or `/listings` (for students) to ensure the new claims propagate immediately.

### 3.3 Server-Side Image Upload Flow
1. **File Selection**: Owner selects image files in the 5-step listing wizard (`ListingForm.tsx`).
2. **Multipart POST**: Client sends the file as `FormData` to `POST /api/upload`.
3. **Authentication Guard**: The API verifies `const { userId } = await auth()`. If null, rejects with `401 Unauthorized`.
4. **Base64 Conversion & Upload**: The server reads the file as an `ArrayBuffer`, converts it to a base64 data URI, and calls `cloudinary.uploader.upload(base64Data, { folder: "pgfinder" })`.
5. **URL Return**: Cloudinary returns a `secure_url` (HTTPS image URL), which is sent back to the client and appended to the form's `photos` array.

### 3.4 In-App Messaging & Polling Engine
1. **Thread Selection**: User opens `/chat?id=conv_123`. The component sets `selectedConvId = "conv_123"`.
2. **Polling Loop**: A React `useEffect` starts a `setInterval` that calls `GET /api/chat/conversations/{id}/messages` every **4 seconds**.
3. **Tab Visibility Check**: If `document.visibilityState !== 'visible'`, polling skips the fetch call to conserve resources.
4. **Deep Array Diffing**: Incoming messages are compared against the current state. If `prev.length === newMsgs.length && prevLastId === newLastId`, React skips the state update entirely — preventing message flicker and scroll resets.
5. **Send Message**: When a user sends a message, the API response is added to the messages array (deduplication check prevents duplicates). Conversation list is silently re-fetched in the background.

---

## 4. DATABASE DESIGN & SCHEMAS

> **Simple Explanation**: "Schemas" define what data each database collection stores and what types each field must be. Think of them as table definitions in a spreadsheet.

### 4.1 Schema Definitions & Data Types

#### `models/User.ts` (Users Collection)
```typescript
interface IUser {
  clerkId: string;         // Unique Clerk Auth Identifier (Indexed, Unique)
  name: string;            // Full name (max 100 chars)
  email: string;           // User email address (max 254 chars)
  role: "student" | "owner"; // Enum: exactly one of these two strings
  phone: string;           // Contact phone number (max 20 chars, defaults to "")
  createdAt: Date;         // Auto-generated timestamp
}
```

#### `models/Listing.ts` (Listings Collection)
```typescript
interface IListing {
  ownerId: string;         // Clerk ID of the property owner (Indexed)
  title: string;           // PG Name (e.g., "Sunshine PG for Girls") (max 100 chars)
  description: string;     // Detailed property description (max 2000 chars)
  price: number;           // Monthly rent in INR (min: 0)
  type: "PG" | "Hostel" | "Flat Share"; // Accommodation type
  gender: "male" | "female" | "any";     // Who can stay
  address: {
    street: string;        // Street address
    city: string;          // City name (Indexed for fast filtering)
    state: string;         // State name
    pincode: string;       // 6-digit postal code
  };
  location: {
    type: "Point";         // Always 'Point' (GeoJSON spec)
    coordinates: [number, number]; // [Longitude, Latitude] — GeoJSON order!
  };
  amenities: {
    ac: boolean;           // Air conditioning
    wifi: boolean;         // WiFi available
    meals: boolean;        // Meals included
    laundry: boolean;      // Laundry service
    parking: boolean;      // Parking space
    hotWater: boolean;     // Hot water supply
    powerBackup: boolean;  // Power backup / inverter
    security: boolean;     // 24/7 security
  };
  rules: {
    vegOnly: boolean;      // Vegetarian-only kitchen
    noSmoking: boolean;    // Smoking prohibited
    noAlcohol: boolean;    // Alcohol prohibited
    guestPolicy: string;   // e.g., "Guests allowed till 9 PM" (default: "No restrictions")
    curfewTime: string;    // e.g., "10:00 PM" (default: "No curfew")
  };
  photos: string[];        // Array of Cloudinary image HTTPS URLs (max 10)
  ownerPhone?: string;     // Optional 10-digit phone for WhatsApp connect
  isVerified: boolean;     // Trust verification badge (default: false)
  isActive: boolean;       // Active listing toggle (default: true)
  createdAt: Date;         // Auto-generated
  updatedAt: Date;         // Auto-updated on changes
}
// INDEXES:
// ListingSchema.index({ location: "2dsphere" });  — Enables geo queries
// ListingSchema.index({ "address.city": "text" }); — Enables city text search
```

#### `models/Inquiry.ts` (Inquiries Collection)
```typescript
interface IInquiry {
  listingId: ObjectId;     // Reference to Listing document
  listingTitle: string;    // Denormalized listing title (avoids joins)
  studentId: string;       // Clerk ID of the student (Indexed)
  studentName?: string;    // Optional denormalized student name
  studentEmail?: string;   // Optional denormalized student email
  ownerId: string;         // Clerk ID of the PG owner (Indexed)
  message: string;         // Initial inquiry text (max 2000 chars)
  status: "pending" | "responded"; // Lead tracking status (default: "pending")
  createdAt: Date;         // Auto-generated timestamp
}
```

#### `models/Saved.ts` (Saved Favorites Collection)
```typescript
interface ISaved {
  studentId: string;       // Clerk ID of the student
  listingId: ObjectId;     // Reference to Listing document
  savedAt: Date;           // Timestamp when the listing was saved (default: Date.now)
}
// COMPOUND UNIQUE INDEX:
// SavedSchema.index({ studentId: 1, listingId: 1 }, { unique: true });
// → Prevents a student from bookmarking the same PG twice at the database level.
```

#### `models/Conversation.ts` & `models/Message.ts` (Chat Collections)
```typescript
interface IConversation {
  studentId: string;            // Clerk ID of student (Indexed)
  studentName?: string;         // Denormalized student name (default: "Student User")
  studentEmail?: string;        // Denormalized student email
  ownerId: string;              // Clerk ID of owner (Indexed)
  listingId: ObjectId;          // Reference to Listing
  listingTitle: string;         // Denormalized listing title for inbox header
  lastMessage: string;          // Preview text for conversation list
  lastMessageAt: Date;          // Sorting timestamp
  unreadCountStudent: number;   // Unread count for the student side
  unreadCountOwner: number;     // Unread count for the owner side
  createdAt: Date;              // Auto-generated
  updatedAt: Date;              // Auto-updated
}
// COMPOUND UNIQUE INDEX:
// ConversationSchema.index({ studentId: 1, ownerId: 1, listingId: 1 }, { unique: true });
// → One conversation per student-owner-listing combination.

interface IMessage {
  conversationId: ObjectId;     // Reference to Conversation
  senderId: string;             // Clerk ID of the sender
  senderRole: "student" | "owner"; // Identifies which side sent the message
  content: string;              // Chat message body (max 2000 chars)
  read: boolean;                // Whether the recipient has read this message (default: false)
  createdAt: Date;              // Auto-generated timestamp
}
```

---

## 5. AUTHENTICATION & ROLES — STEP BY STEP

### 5.1 Clerk v5 Asynchronous Auth Patterns
> **Simple Explanation**: In Clerk v5, checking "who is logged in?" is an **asynchronous** operation (it returns a Promise). You MUST use `await` to get the result.

```typescript
// Correct Clerk v5 API Route Pattern
import { auth } from "@clerk/nextjs/server";

export async function GET(request: Request) {
  const { userId } = await auth(); // MUST be awaited!
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // ... proceed with authenticated logic
}
```

### 5.2 How Middleware Protects Routes (`middleware.ts`)
The middleware uses Clerk's `clerkMiddleware` with three route matchers:

1. **Public Routes** — `/`, `/listings(*)`, `/map`, `/sign-in(*)`, `/sign-up(*)`, `/onboarding`, `/api/(*)` — accessible without login.
2. **Owner Routes** — `/dashboard(*)` — if a logged-in user has `role === "student"`, they get redirected to `/listings`.
3. **Student Routes** — `/saved(*)`, `/compare(*)`, `/inquiries(*)` — if a logged-in user has `role === "owner"`, they get redirected to `/dashboard`.

Unauthenticated users trying to access protected routes are redirected to `/sign-in` with the original URL preserved in `redirect_url`.

### 5.3 Why the Original Middleware Had an Infinite Redirect Bug (Historical Context)
* **Problem**: An earlier version tried to read `auth().sessionClaims?.publicMetadata?.role` and redirect users without a role to `/onboarding`.
* **Root Cause**: By default, Clerk session JWT tokens do NOT include `publicMetadata` unless manually configured in the Clerk Dashboard JWT Claims editor. On fresh logins, `sessionClaims.publicMetadata` was `undefined`, so middleware kept redirecting to `/onboarding` in an infinite loop.
* **Solution**: The current middleware only blocks cross-role access (students can't access owner routes and vice versa) and doesn't redirect based on role assignment. Role detection on the client is handled by `lib/useUserRole.ts`, which first checks Clerk metadata and falls back to querying `/api/users/me`.

---

## 6. EVERY PAGE — FULL EXPLANATION

| Page Path | Purpose | Access Level | Key Logic |
| :--- | :--- | :--- | :--- |
| **`app/page.tsx`** | Dual Landing Page | Public | Checks `isOwner` from `useUserRole()`. Renders Owner Portal Hero (with links to dashboard/create) for owners, or Student Search Hero (with city search bar and featured listings fetched from API) for students/guests. |
| **`app/listings/page.tsx`** | Main Search Grid | Public | Uses `FilterSidebar` with debounced city input (350ms), min/max price, gender, type, amenity toggles, and sort dropdown (`newest`, `price_asc`, `price_desc`). Supports pagination. Renders `GridListingSkeleton` while loading. Includes compare-select checkboxes on each card. |
| **`app/listings/[id]/page.tsx`** | PG Detail View | Public | Photo gallery with thumbnails, amenity badges, house rules (curfew, guest policy, veg status), dynamic WhatsApp link (`wa.me/<ownerPhone>`), inquiry form that creates both an Inquiry record and a Chat conversation, optimistic save/unsave, owner controls (edit/delete) if viewing own listing, and a "Similar PGs" section fetching listings from the same city. |
| **`app/map/page.tsx`** | Interactive Map View | Public | Client-rendered Leaflet map (`ssr: false` via `next/dynamic`). Includes college/landmark geocoding search via Nominatim, radius slider (1-20km), "Near Me" geolocation button, and map marker popups with listing preview cards. |
| **`app/saved/page.tsx`** | Saved Favorites | Protected (Student) | Displays bookmarked PGs fetched from `GET /api/saved`. Allows 1-click unsave. Compare-select checkboxes let students select 2-3 listings and navigate to `/compare?id=...&id=...`. |
| **`app/inquiries/page.tsx`** | Sent Inquiries | Protected (Student) | Displays student's sent inquiry history (`GET /api/inquiries?role=student`) with `Pending` or `Responded` status badges. If an owner visits, shows a toast and redirects to `/dashboard`. |
| **`app/compare/page.tsx`** | Side-by-Side Comparison | Protected (Student) | Reads `id` query parameters (`/compare?id=id1&id=id2`), fetches each listing in parallel via `Promise.all()`, and renders a comparison table evaluating: price, type, gender, city, verified status, all 8 amenities, veg-only rule, and curfew time. |
| **`app/chat/page.tsx`** | In-App Messaging Inbox | Protected | Dual-panel interface: left panel lists all conversations (sorted by `lastMessageAt`), right panel shows active chat thread. Uses 4-second background polling with visibility-aware pausing. Supports `window.history.replaceState` for URL syncing without page reloads. |
| **`app/onboarding/page.tsx`** | Role Selection Setup | Protected | Role selection cards (`Student` or `PG Owner`). Sends `POST /api/users/sync`, calls `await user.reload()`, then does a hard redirect via `window.location.href` to the appropriate destination. |
| **`app/dashboard/page.tsx`** | Owner Control Panel | Protected (Owner) | Overview metrics (total accommodations, active count, student inquiries). Listings table with view/edit/delete actions and active/inactive toggle buttons. Fetches with `limit=100` to show all owner listings. |
| **`app/dashboard/create/page.tsx`** | 5-Step Creation Wizard | Protected (Owner) | Renders `ListingForm` in `mode="create"`. The form has 5 steps: (1) Basic Info, (2) Amenities & Rules, (3) Photos, (4) Location with Nominatim search + current location + map pin, (5) Review & Submit. |
| **`app/dashboard/edit/[id]/page.tsx`** | Edit Existing Listing | Protected (Owner) | Fetches existing listing data, then renders `ListingForm` in `mode="edit"` with `initialData` pre-populated. Allows owners to modify any listing field and re-submit. |
| **`app/sign-in/[[...sign-in]]/page.tsx`** | Sign In Page | Public | Clerk's catch-all sign-in route using Clerk's built-in UI components. |
| **`app/sign-up/[[...sign-up]]/page.tsx`** | Sign Up Page | Public | Clerk's catch-all sign-up route using Clerk's built-in UI components. |
| **`app/loading.tsx`** | Global Page Loader | Public | App Router loading screen with animated progress bar, glowing pulse rings, and a floating PGFinder map pin icon. Shows while route segments load. |
| **`app/error.tsx`** | Error Boundary | Public | Custom error page with "Go Home" and "Try Again" buttons. Catches runtime errors in any route segment. |
| **`app/not-found.tsx`** | 404 Page | Public | Custom 404 page with "Go Home" and "Browse PGs" buttons. Renders for any URL that doesn't match a route. |

---

## 7. EVERY API ROUTE — FULL EXPLANATION

### `GET /api/listings` — Search & List PGs
* **Query Params**: `city`, `gender`, `type`, `minPrice`, `maxPrice`, `ac`, `wifi`, `meals`, `veg`, `verified`, `lat`, `lng`, `radius`, `sort`, `ownerId`, `page`, `limit`.
* **Sorting**: `sort=newest` → `{ createdAt: -1 }`, `sort=price_asc` → `{ price: 1 }`, `sort=price_desc` → `{ price: -1 }`. When geo coordinates are provided, sorting is disabled (results are ordered by distance).
* **City Filtering**: Case-insensitive regex — `{ $regex: city, $options: "i" }`.
* **Veg Filter**: `veg=true` sets `query["rules.vegOnly"] = true`.
* **Geo Query**: If `lat` and `lng` are provided (non-zero, finite numbers), executes `$nearSphere`:
  ```typescript
  query.location = {
    $nearSphere: {
      $geometry: { type: "Point", coordinates: [lng, lat] },
      $maxDistance: radius, // meters (default: 5000, min: 500, max: 50000)
    },
  };
  ```
* **Pagination**: Returns `{ listings, pagination: { page, limit, total, totalPages, hasMore } }`.
* **Owner Isolation**: If `ownerId` is provided, verifies authenticated user matches `ownerId` (returns 403 if mismatch).
* **Default Limit**: 12 per page (max 50).

### `POST /api/listings` — Create New Listing
* **Auth**: Requires authenticated owner (`publicMetadata.role === "owner"`).
* **Validation**: Full Zod schema validation via `createListingSchema`.
* **User Sync**: Automatically upserts the owner's User document in MongoDB.

### `GET /api/listings/[id]` — Get Single Listing
* **Validation**: Checks if `id` is a valid 24-character hex ObjectId using `isValidObjectId()` from `lib/utils.ts`.
* **Fallback**: If MongoDB is unavailable or ID is invalid, falls back to `mockDb.getListingById(id)`.

### `PUT /api/listings/[id]` — Update Listing
* **Auth**: Requires authenticated user. Verifies `listing.ownerId === userId` (returns 403 if non-owner).
* **Validation**: Partial Zod validation via `updateListingSchema` (all fields optional).
* **Fallback**: Falls back to `mockDb.updateListing()` if MongoDB is unavailable.

### `DELETE /api/listings/[id]` — Delete Listing
* **Auth**: Same owner verification as PUT.
* **Cascade Cleanup**: Deletes related `Saved` and `Inquiry` documents via `Promise.all()`.

### `GET /api/inquiries` — List Inquiries
* **Query Param**: `role` — determines whether to return inquiries sent by the student (`role=student`) or received by the owner (`role=owner`).
* **Auth**: Requires authenticated user.
* **Fallback**: Falls back to mockDb when MongoDB is unavailable.

### `POST /api/inquiries` — Create Inquiry
* **Validation**: Validates `listingId` (24-char hex) and `message` (10-2000 chars) via Zod.
* **Denormalization**: Automatically copies `listingTitle`, `studentName`, `studentEmail`, and `ownerId` from related records.

### `PATCH /api/inquiries/[id]` — (Deprecated)
* Returns HTTP `410 Gone` with message: "Inquiry statuses are no longer supported. Use chat to manage conversations."

### `GET /api/saved` — Get Saved Listings
* **Auth**: Requires authenticated student (`publicMetadata.role === "student"`).
* **Response**: Returns saved items with the full listing data populated for each.

### `POST /api/saved` — Save a Listing
* **Auth**: Student-only. Uses `findOneAndUpdate` with `$setOnInsert` and `upsert: true` to prevent duplicates.

### `DELETE /api/saved/[id]` — Unsave a Listing
* **Auth**: Student-only. Deletes the matching `{ studentId, listingId }` document.

### `GET /api/chat/conversations` — List All Conversations
* **Auth**: Returns conversations where the user is either the `studentId` or `ownerId`.
* **Sorting**: Ordered by `lastMessageAt` descending (newest first).

### `POST /api/chat/conversations` — Start a Chat Thread
* **Input**: `{ listingId, initialMessage }`.
* **Duplicate Prevention**: Checks for existing conversation with same `studentId` + `listingId`. If found, reuses it.
* **Initial Message**: If `initialMessage` is provided, creates a `Message` document and updates conversation metadata.

### `GET /api/chat/conversations/[id]/messages` — Fetch Messages
* **Auth**: Verifies user is a participant in the conversation.
* **Read Receipts**: Marks all unread messages from the other party as `read: true` and resets the user's unread counter.

### `POST /api/chat/conversations/[id]/messages` — Send a Message
* **Auth**: Verifies user is a participant.
* **Unread Tracking**: Increments the other party's unread counter.
* **Max Length**: 2000 characters.

### `POST /api/upload` — Upload Image to Cloudinary
* **Auth**: Requires authenticated user.
* **Process**: Receives file via `FormData`, converts to base64, uploads to Cloudinary's `pgfinder` folder.
* **Response**: Returns `{ url: "https://res.cloudinary.com/..." }`.

### `POST /api/users/sync` — Sync User Role
* **Input**: `{ role: "student" | "owner" }`.
* **Process**: Updates Clerk `publicMetadata` first (guaranteed), then tries to create/find MongoDB User document (best-effort).

### `GET /api/users/me` — Get Current User Profile
* **Auth**: Returns the MongoDB User document for the authenticated user, or `{ user: null }` if not found.

---

## 8. FEATURES — HOW EACH IS BUILT

### 8.1 Side-by-Side Comparison Engine (`app/compare/page.tsx`)
Students select PGs from the saved page or listings page using checkboxes (up to 3). The compare page reads `id` query parameters (`/compare?id=id1&id=id2&id=id3`), fetches each listing in parallel via `Promise.all()`, and renders a comparison table evaluating: **price, type, gender, city, verified status, all 8 amenities (ac, wifi, meals, laundry, parking, hotWater, powerBackup, security), veg-only rule, and curfew time.**

### 8.2 Debounced Search Engine
The custom `useDebounce(value, delay)` hook in `hooks/useDebounce.ts` delays value updates. `FilterSidebar.tsx` calls it with `useDebounce(cityInput, 350)`. Typing `"Bangalore"` (9 keystrokes) triggers only **1 API request** instead of 9, reducing unnecessary server queries. The default delay in the hook is `300ms`, but the sidebar overrides it to `350ms`.

### 8.3 Optimistic Favoriting with Rollback
When a student clicks the heart icon on a listing detail page (`app/listings/[id]/page.tsx`), the UI immediately flips the saved state (zero perceived latency). If the subsequent API call (`POST /api/saved` or `DELETE /api/saved/[id]`) fails, the `catch` block rolls back the state and shows an error toast.

### 8.4 Map Search & Geocoding
`app/map/page.tsx` imports Leaflet dynamically (`ssr: false`) to avoid server-side `window is not defined` errors. The map supports three search modes:
1. **College/Landmark Search** — Nominatim API resolves query strings into coordinates.
2. **"Near Me" Geolocation** — Uses `navigator.geolocation.getCurrentPosition()`.
3. **Deep Link from Listing** — A listing detail page links to `/map?listing=<id>`, which centers the map on that specific listing at zoom level 18.

### 8.5 5-Step Listing Wizard with Edit Support
`components/dashboard/ListingForm.tsx` supports two modes: `create` and `edit`. In edit mode, it receives `initialData` and pre-populates all form fields. Step 4 (Location) allows owners to search via Nominatim, detect coordinates from the address entered in Step 1, use current location, or manually adjust the map pin.

### 8.6 Filter State Persistence
`FilterSidebar.tsx` persists active filters to `sessionStorage` under the key `pgfinder_active_filters`. When a user navigates away and returns, filters are restored from session storage if the URL has no query parameters.

---

## 9. FOLDER & FILE STRUCTURE

```text
PGFinder/
├── app/
│   ├── api/
│   │   ├── chat/conversations/[id]/messages/route.ts  — GET/POST messages
│   │   ├── chat/conversations/route.ts                — GET/POST conversations
│   │   ├── inquiries/[id]/route.ts                    — PATCH (deprecated, returns 410)
│   │   ├── inquiries/route.ts                         — GET/POST inquiries
│   │   ├── listings/[id]/route.ts                     — GET/PUT/DELETE single listing
│   │   ├── listings/route.ts                          — GET/POST listings
│   │   ├── saved/[id]/route.ts                        — DELETE (unsave)
│   │   ├── saved/route.ts                             — GET/POST saved
│   │   ├── upload/route.ts                            — POST image upload
│   │   ├── users/me/route.ts                          — GET current user
│   │   └── users/sync/route.ts                        — POST role sync
│   ├── chat/page.tsx                — In-app messaging inbox
│   ├── compare/page.tsx             — Side-by-side comparison table
│   ├── dashboard/
│   │   ├── create/page.tsx          — 5-step listing creation wizard
│   │   ├── edit/[id]/page.tsx       — Edit existing listing (reuses ListingForm)
│   │   └── page.tsx                 — Owner control panel
│   ├── inquiries/page.tsx           — Student sent inquiries tracker
│   ├── listings/
│   │   ├── [id]/page.tsx            — PG detail view
│   │   └── page.tsx                 — Search & filter grid
│   ├── map/page.tsx                 — Interactive Leaflet map view
│   ├── onboarding/page.tsx          — Role selection (Student / Owner)
│   ├── saved/page.tsx               — Saved favorites
│   ├── sign-in/[[...sign-in]]/page.tsx  — Clerk sign-in
│   ├── sign-up/[[...sign-up]]/page.tsx  — Clerk sign-up
│   ├── error.tsx                    — Custom error boundary page
│   ├── not-found.tsx                — Custom 404 page
│   ├── globals.css                  — Global styles & Tailwind base
│   ├── layout.tsx                   — Root layout (ClerkProvider, Navbar, Footer, Toaster)
│   ├── loading.tsx                  — Global loading animation
│   └── page.tsx                     — Dual home page (Student vs Owner)
├── components/
│   ├── dashboard/
│   │   ├── ListingForm.tsx          — 5-step wizard (create + edit modes)
│   │   └── LocationPicker.tsx       — Map pin selector component
│   ├── listings/
│   │   ├── FilterSidebar.tsx        — Debounced filter panel
│   │   └── ListingCard.tsx          — Listing preview card
│   ├── ui/
│   │   ├── badge.tsx                — Badge component (shadcn/ui)
│   │   ├── button.tsx               — Button component (shadcn/ui)
│   │   ├── card.tsx                 — Card components (shadcn/ui)
│   │   ├── input.tsx                — Input component (shadcn/ui)
│   │   ├── skeleton-card.tsx        — Shimmer skeleton loader
│   │   ├── sonner.tsx               — Toast notification config
│   │   └── textarea.tsx             — Textarea component (shadcn/ui)
│   ├── Footer.tsx                   — Site footer
│   └── Navbar.tsx                   — Navigation bar
├── hooks/
│   └── useDebounce.ts               — Generic debounce hook
├── lib/
│   ├── cloudinary.ts                — Cloudinary SDK configuration
│   ├── mockDb.ts                    — In-memory fallback database
│   ├── mongodb.ts                   — MongoDB connection with caching
│   ├── useUserRole.ts               — Client-side role detection hook
│   ├── utils.ts                     — Utility functions (formatPrice, getWhatsAppUrl, etc.)
│   └── validations.ts              — Zod schemas for all forms and API inputs
├── models/
│   ├── Conversation.ts              — Chat conversation schema
│   ├── Inquiry.ts                   — Student inquiry schema
│   ├── Listing.ts                   — PG listing schema (with 2dsphere index)
│   ├── Message.ts                   — Chat message schema
│   ├── Saved.ts                     — Saved favorites schema (compound unique index)
│   └── User.ts                      — User profile schema
├── scripts/
│   ├── seed.js                      — Seed script: creates 20 sample listings
│   └── cleanup.js                   — Database cleanup: clears all collections
├── middleware.ts                     — Clerk route protection middleware
├── next.config.js                   — Next.js config (image domains, security headers)
├── package.json                     — Dependencies and scripts
├── tailwind.config.js               — Tailwind CSS configuration
├── tsconfig.json                    — TypeScript configuration
└── README.md                        — Project readme
```

---

## 10. ENVIRONMENT VARIABLES (`.env.local`)

```env
# Clerk Authentication Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# Database Connection
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/pgfinder?retryWrites=true&w=majority

# Cloudinary Storage Credentials
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Cloudinary Upload Preset (for reference, used as default folder name in upload)
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=pgfinder_unsigned

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Seed Script (only needed for `node scripts/seed.js`)
SEED_OWNER_EMAIL=your-email@example.com
SEED_OWNER_PHONE=9876543210
```

---

## 11. WHAT IS REAL vs SEEDED vs PLACEHOLDER

```
+-----------------------------------------------------------------------+
|                             FEATURE STATUS                            |
+------------------------------------+----------------------------------+
| REAL (100% Production Code)        | SEEDED & SIMULATED               |
+------------------------------------+----------------------------------+
| • Clerk Auth & RBAC Roles          | • 20 Seeded PG Listings          |
| • MongoDB Spatial Indexing ($near) | • 1 Seeded Owner Account         |
| • Server-Side Image Uploads       | • Verified Badges (Manual Flag)  |
| • Nominatim Address Geocoding      | • Static Marketing Copy Stats    |
| • In-App Messenger (HTTP Polling)  | • Placeholder Support Contact    |
| • Leaflet Interactive Map          |                                  |
| • Side-by-Side Comparison Engine   |                                  |
| • 5-Step Property Creator Wizard   |                                  |
| • Edit Existing Listing Flow       |                                  |
| • Optimistic Save/Unsave Rollback  |                                  |
| • MockDB Fallback System           |                                  |
| • Filter State Persistence         |                                  |
+------------------------------------+----------------------------------+
```

### **The 20 Seeded Property Listings**
All 20 listings are bound to the owner account configured via the `SEED_OWNER_EMAIL` environment variable in `.env.local`. The seed script resolves the Clerk user ID dynamically via the Clerk API.

```text
 1. Sunshine PG for Girls — Rohini Sector 7, Delhi (₹8,500/mo) | Girls | AC, WiFi, Meals
 2. Royal Boys Hostel — Hauz Khas, Delhi (₹12,000/mo) | Boys | AC, WiFi, Meals
 3. Green Valley PG — Kamla Nagar, Delhi (₹6,000/mo) | Co-ed | WiFi, Meals
 4. Koramangala Student Hub — Koramangala 5th Block, Bangalore (₹9,500/mo) | Co-ed | WiFi
 5. BTM Layout Girls PG — BTM Layout 2nd Stage, Bangalore (₹7,500/mo) | Girls | AC, WiFi, Meals
 6. HSR Layout Boys Hostel — HSR Layout Sector 2, Bangalore (₹6,500/mo) | Boys | WiFi
 7. Indiranagar Premium Co-Living — 12th Main, Indiranagar, Bangalore (₹15,000/mo) | Co-ed | AC, WiFi, Meals
 8. Kothrud Student PG — Paud Road, Pune (₹5,500/mo) | Boys | WiFi, Meals
 9. Viman Nagar Executive PG — Near Symbiosis, Pune (₹11,000/mo) | Girls | AC, WiFi, Meals
10. Powai Lake View PG for Boys — Hiranandani Powai, Mumbai (₹14,500/mo) | Boys | AC, WiFi, Meals
11. Andheri West Girls PG — JVPD Scheme, Andheri West, Mumbai (₹13,000/mo) | Girls | AC, WiFi, Meals
12. Gachibowli Tech Hub PG — Near IIIT, Hyderabad (₹8,000/mo) | Boys | AC, WiFi, Meals
13. Madhapur Luxury Co-Living — Hitech City, Hyderabad (₹10,500/mo) | Co-ed | AC, WiFi, Meals
14. Noida Sector 62 Student PG — Near Jaypee Institute, Noida (₹7,000/mo) | Co-ed | AC, WiFi, Meals
15. Cyber City Boys PG — Near Cyber Hub, Gurgaon (₹12,500/mo) | Boys | AC, WiFi, Meals
16. Golf Course Road Co-Living — Sector 54, Gurgaon (₹16,000/mo) | Co-ed | AC, WiFi, Meals
17. Satya Niketan DU South Campus PG — Main Market, Satya Niketan, Delhi (₹9,000/mo) | Girls | AC, WiFi, Meals
18. Electronic City Phase 1 PG — Near Infosys Gate 1, Bangalore (₹6,800/mo) | Boys | WiFi, Meals
19. Baner Road Boys Hostel — Baner Road, Near Balewadi, Pune (₹7,200/mo) | Boys | WiFi, Meals
20. Bandra West Luxury PG — Hill Road, Bandra West, Mumbai (₹18,000/mo) | Co-ed | AC, WiFi, Meals
```

---

## 12. MOCKDB FALLBACK SYSTEM

`lib/mockDb.ts` implements the **Graceful Degradation** design pattern:
* It stores an in-memory array of mock listing objects that mirror the real Listing schema.
* API routes wrap their MongoDB calls in `try/catch` blocks. If MongoDB throws (network timeout, invalid URI, etc.), the `catch` block serves data from `mockDb` instead.
* This ensures the UI never shows a blank screen or crashes during live demos even if the database connection fails.
* The mock database supports CRUD operations: `getListingById()`, `updateListing()`, `deleteListing()`, `getInquiries()`, `createInquiry()`.

---

## 13. PROBLEMS FACED & HOW THEY WERE SOLVED

### **Bug 1: `POST /api/users/sync` 500 Error & 30-Second Timeout**
* **Symptom**: New sign-ups hung on onboarding before crashing with 500 Error.
* **Root Cause**: The Clerk client initialization and MongoDB connection were timing out.
* **Fix**: Updated the sync route to use `await clerkClient()` (function call, not property access) and added `serverSelectionTimeoutMS: 5000` to `lib/mongodb.ts` connection options.

### **Bug 2: Infinite Redirect Loop on Onboarding**
* **Symptom**: Browser got stuck in an endless redirect loop between `/` and `/onboarding`.
* **Root Cause**: Middleware was reading `sessionClaims.publicMetadata.role`, which was `undefined` because Clerk doesn't include `publicMetadata` in JWTs by default.
* **Fix**: Redesigned middleware to only enforce cross-role access control (students can't access owner routes, vice versa). Role assignment detection now happens client-side via `useUserRole.ts`.

### **Bug 3: Blank White Screen After Role Selection**
* **Symptom**: Selecting a role saved to DB but rendered a blank white page.
* **Root Cause**: `router.push()` navigated before Clerk's session claims were refreshed.
* **Fix**: Added `await user.reload()` in onboarding, then used `window.location.href` (hard browser redirect) instead of `router.push()` to force a full page reload with fresh Clerk session data.

### **Bug 4: Cloudinary Image Upload 400 Bad Request**
* **Symptom**: Submitting photos threw HTTP 400.
* **Root Cause**: Whitespace in `.env.local` values and incorrect upload method.
* **Fix**: Cleaned environment variables and implemented base64 encoding upload via `cloudinary.uploader.upload()`.

### **Bug 5: "Listing Not Found" 400 Error on Detail Page**
* **Symptom**: Newly created listing detail pages displayed "Listing not found".
* **Root Cause**: The `mockDb` was generating invalid IDs, and the route wasn't handling non-hex ID formats.
* **Fix**: Added `isValidObjectId()` validation in the route handler. Invalid IDs gracefully fall back to mockDb.

### **Bug 6: Hardcoded WhatsApp Phone Number**
* **Symptom**: Clicking "Chat on WhatsApp" always opened the fallback number `9876543210`.
* **Root Cause**: The `ownerPhone` field didn't exist on the Listing schema yet.
* **Fix**: Added optional `ownerPhone` field to `Listing.ts` schema and `ListingForm.tsx`. The detail page generates dynamic `wa.me/<ownerPhone>` URLs via `getWhatsAppUrl()` in `lib/utils.ts`.

### **Bug 7: Chat Thread Disappearing & Scroll Jitter**
* **Symptom**: In `/chat`, opening a conversation caused the thread to disappear or jump-scroll every 4 seconds.
* **Root Cause**: Polling was replacing the entire conversations array, causing React to re-render and lose the selected thread reference.
* **Fix**: Switched to primitive ID tracking (`selectedConvId: string | null`), deep array diffing for messages (`prev[last]._id === newMsgs[last]._id`), and `window.history.replaceState` for URL syncing.

### **Bug 8: Owner Dashboard Showing Only 12 Listings**
* **Symptom**: Dashboard displayed "12 Total Accommodations" despite 20 existing.
* **Root Cause**: The default API pagination limit was 12.
* **Fix**: Updated `app/dashboard/page.tsx` to pass `limit=100` in the API request.

### **Bug 9: Multi-Owner Data Leakage**
* **Symptom**: New owner accounts saw test listings and inquiries from other owners.
* **Root Cause**: Missing owner-specific filtering on API queries.
* **Fix**: Enforced strict `ownerId === userId` isolation across all listing, inquiry, and chat API routes.

---

## 14. TRANSFER & LOCAL SETUP GUIDE

### Step-by-Step Setup
```bash
# 1. Clone the repository
git clone <your-repository-url>
cd PGFinder

# 2. Install dependencies
npm install

# 3. Create environment file
# Copy .env.example to .env.local and fill in your credentials:
#   - Clerk keys (from clerk.com dashboard)
#   - MongoDB Atlas URI (from mongodb.com)
#   - Cloudinary credentials (from cloudinary.com)

# 4. (Optional) Seed the database with 20 sample listings
# Requires MONGODB_URI and CLERK_SECRET_KEY in .env.local
node scripts/seed.js

# 5. Start the development server
npm run dev
```

### About `scripts/seed.js`
The seed script connects to MongoDB Atlas, resolves the real owner Clerk account via the Clerk API using `CLERK_SECRET_KEY`, clears ALL existing collections (listings, users, inquiries, saved, conversations, messages), creates 1 owner user, and inserts 20 realistic PG listings across 7 Indian cities. It uses Unsplash placeholder images for photos.

### About `scripts/cleanup.js`
A utility script that connects to MongoDB and clears all documents from every collection. Useful for resetting the database to a clean state.

---

## 15. EDGE CASES HANDLED

1. **Nominatim Geocoding in Listing Form** — Step 4 auto-populates coordinates using the street & city entered in Step 1 via a "Detect Pin from Address" button.
2. **Map Pin + Current Location** — Step 4 lets owners detect address pins, use browser geolocation, or manually drag the map pin.
3. **Visibility-Aware Polling** — Chat polling pauses when browser tab is hidden (`visibilityState !== 'visible'`), saving battery and bandwidth.
4. **Invalid ObjectId Validation** — `isValidObjectId()` in `lib/utils.ts` prevents 400 Bad Request crashes when non-hex IDs are passed to MongoDB.
5. **Single-Owner Isolation** — Owner A can never view or modify Owner B's listings, inquiries, or chat messages.
6. **Optimistic Favoriting Rollback** — Heart icon flips state instantly. If the API call fails, state rolls back and an error toast appears.
7. **Debounced Search Inputs** — 350ms delay on city keystrokes prevents flooding the API.
8. **MockDB Fallback** — All listing and inquiry API routes fall back to in-memory mock data if MongoDB is unreachable.
9. **Compound Unique Index on Saved** — `{ studentId: 1, listingId: 1 }` prevents duplicate bookmarks at the database level.
10. **Dashboard Limit Expansion** — Owner dashboard fetches with `limit=100` to show all listings without pagination truncation.
11. **Inquiry → Chat Auto-Thread** — Sending an inquiry from a listing detail page automatically creates a conversation thread and redirects to the chat inbox.
12. **Similar Listings** — The listing detail page fetches up to 3 other PGs from the same city.
13. **Filter Persistence** — Active filters are saved to `sessionStorage` and restored when returning to the listings page.

---

## 16. UTILITY FUNCTIONS (`lib/utils.ts`)

| Function | Purpose |
| :--- | :--- |
| `cn(...inputs)` | Merges Tailwind CSS classes using `clsx` + `tailwind-merge`. |
| `formatPrice(price)` | Formats a number as Indian currency: `₹8,500`. |
| `isValidObjectId(id)` | Validates a string against the 24-character hex MongoDB ObjectId regex. |
| `truncateText(text, maxLength)` | Truncates text with `...` suffix. |
| `getWhatsAppUrl(phone, title)` | Generates a `wa.me/91<phone>?text=...` deep link. |
| `getRelativeTime(date)` | Returns human-readable relative timestamps: "Just now", "5m ago", "3d ago". |

---

## 17. VALIDATION SCHEMAS (`lib/validations.ts`)

| Schema | Used For |
| :--- | :--- |
| `createListingSchema` | Validates all fields when creating a new listing (title 3-100 chars, description 10-2000 chars, price ₹500-₹1,00,000, 6-digit pincode, coordinates in range, 1-10 photos, optional 10-digit phone). |
| `updateListingSchema` | Partial version of `createListingSchema` — all fields optional, used for PUT updates. |
| `inquirySchema` | Validates `listingId` (24-char hex) and `message` (10-2000 chars). |
| `savedSchema` | Validates `listingId` (24-char hex). |
| `userSyncSchema` | Validates `role` as either `"student"` or `"owner"`. |

---

## 18. VIVA PREPARATION — 30 QUESTIONS & ANSWERS

### Q1: What is PGFinder and why did you build it?
**Answer**: "PGFinder is a full-stack PG discovery and property management platform built with Next.js 14, MongoDB, and Clerk Auth. We built it to solve the housing search problems students face when moving to new cities — scams, brokers, and no relevant filters. PGFinder offers verified listings, map-based search, direct WhatsApp contact, in-app messaging, and side-by-side comparison, all with 0% brokerage."

### Q2: Why did you choose Next.js 14 App Router over plain React (Vite)?
**Answer**: "Next.js 14 App Router gives us Server Components for fast initial page loads, SEO metadata via `generateMetadata()`, built-in serverless API routes under `/app/api`, file-system based routing, and automatic code splitting. With plain React (Vite), we'd need a separate Express or Fastify backend server."

### Q3: Why did you choose MongoDB over SQL databases like PostgreSQL?
**Answer**: "PG accommodation listings have highly variable attributes — amenities (8 boolean fields), house rules (5 fields), nested address objects, and GeoJSON location data. MongoDB's document model handles nested objects without rigid schema migrations. Additionally, MongoDB offers native `2dsphere` spatial indexing for geographic `$nearSphere` queries, which is essential for our map search feature."

### Q4: How does the map proximity search work technically?
**Answer**: "We store property locations as GeoJSON Points `{ type: 'Point', coordinates: [longitude, latitude] }` and index the field with a `2dsphere` index in Mongoose. When a student searches near a location, `GET /api/listings` executes a `$nearSphere` query with `$maxDistance` in meters, returning properties ordered by geographic distance."

### Q5: What is the GeoJSON coordinate ordering rule?
**Answer**: "GeoJSON specification mandates **[Longitude, Latitude]** ordering (`[77.2090, 28.6139]`). If you store them in reverse as `[Latitude, Longitude]`, MongoDB calculates distances across the wrong hemisphere and returns zero results!"

### Q6: How does Clerk authentication work in your application?
**Answer**: "We use Clerk v5 for authentication. User roles (`student` or `owner`) are stored in `user.publicMetadata.role`. During sign-up, users select a role on `/onboarding`, which calls `POST /api/users/sync`. The API updates Clerk metadata using `clerkClient().users.updateUserMetadata()` and also creates a MongoDB User document. On the frontend, our custom hook `useUserRole.ts` reads Clerk metadata first and falls back to querying `/api/users/me` if metadata isn't available yet."

### Q7: How does your middleware protect routes?
**Answer**: "Our `middleware.ts` uses Clerk's `clerkMiddleware` with three route matchers. Unauthenticated users accessing protected routes get redirected to `/sign-in`. Authenticated students trying to access owner routes (`/dashboard`) get redirected to `/listings`. Authenticated owners trying to access student routes (`/saved`, `/compare`, `/inquiries`) get redirected to `/dashboard`. This prevents cross-role access."

### Q8: How does image uploading work in PGFinder?
**Answer**: "Image uploading is handled via `ListingForm.tsx` posting to `POST /api/upload`. The API route verifies `auth().userId`, reads the uploaded file from `FormData`, converts it to a base64 data URI string, and calls `cloudinary.uploader.upload()` with server-side credentials (`CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`). Cloudinary returns a secure HTTPS URL that gets added to the listing's `photos` array."

### Q9: How does the in-app messaging feature work technically?
**Answer**: "We implemented an HTTP polling engine with a 4-second interval. The chat page polls `GET /api/chat/conversations/{id}/messages` inside a `setInterval`. Before updating React state, we compare the last message ID of the incoming data with the current state. If they match, we skip the update — preventing unnecessary re-renders. This provides a smooth messaging experience while staying 100% serverless-compatible on Vercel."

### Q10: How does chat polling avoid unnecessary re-renders?
**Answer**: "We implemented deep array diffing. On every poll, we check `prev.length === newMsgs.length && prevLastId === newLastId`. If both match, we return the previous state reference (`return prev`), which tells React nothing changed. This prevents message list re-renders, scroll position resets, and visual flicker."

### Q11: What is `mockDb.ts` and why does it exist?
**Answer**: "`mockDb.ts` is an in-memory fallback database implementing the Graceful Degradation pattern. If MongoDB Atlas encounters network timeouts, missing environment variables, or IP whitelist issues, our API routes catch the exception and serve data from `mockDb.ts` instead. This guarantees the UI always renders something meaningful."

### Q12: What is debouncing and where is it used?
**Answer**: "Debouncing delays function execution until a user stops performing an action for a specified duration. We created `useDebounce(value, 350)` for the city search filter in `FilterSidebar.tsx`. Typing `'Bangalore'` (9 keystrokes) triggers only 1 API request instead of 9, reducing server load significantly."

### Q13: What is Optimistic UI and where did you implement it?
**Answer**: "Optimistic UI updates local state immediately before server confirmation. We used it for the save/unsave feature in `app/listings/[id]/page.tsx`. Clicking the heart icon flips the state instantly (zero perceived latency). If the backend API call fails, the `catch` block rolls back the state to its previous value and shows an error toast to the user."

### Q14: How is single-owner data isolation enforced?
**Answer**: "In `GET /api/listings` (when `ownerId` is provided), the route verifies `userId !== ownerId` and returns 403. In `PUT/DELETE /api/listings/[id]`, it checks `listing.ownerId !== userId`. In `GET /api/inquiries`, it filters by `ownerId === userId`. In chat conversations, it queries `{ $or: [{ studentId: userId }, { ownerId: userId }] }`. Owner A can never view or modify Owner B's data."

### Q15: What is the compound unique index on the `Saved` collection?
**Answer**: "In `models/Saved.ts`, we created `SavedSchema.index({ studentId: 1, listingId: 1 }, { unique: true })`. This prevents a student from bookmarking the same property twice at the database level — even if two concurrent requests arrive, only one will succeed."

### Q16: Why did you use Leaflet over Google Maps?
**Answer**: "Google Maps requires a mandatory billing account and API key setup, which poses risks during college demos if the free tier gets exceeded. Leaflet.js combined with OpenStreetMap tiles is fully open-source, lightweight, and requires no API keys."

### Q17: How does address geocoding work in the listing form?
**Answer**: "In Step 4 of the 5-step wizard, owners can search landmarks or click 'Detect Pin from Address' (which uses the street and city from Step 1), click 'Use Current Location' (which calls `navigator.geolocation`), or manually drag the map pin. All geocoding uses OpenStreetMap's Nominatim API (`nominatim.openstreetmap.org/search?q=...`), which returns latitude and longitude."

### Q18: What is denormalization and where did you use it?
**Answer**: "Denormalization means storing duplicate data to avoid expensive joins. We store `listingTitle` directly inside `Inquiry` and `Conversation` documents, and `studentName`/`studentEmail` inside `Conversation` documents. This lets inbox lists display names without performing `$lookup` joins on every fetch — a big performance win."

### Q19: What is the Dual Home Page feature?
**Answer**: "`app/page.tsx` checks `isOwner` from `useUserRole()`. If logged in as a PG Owner, it renders the Owner Portal Hero with quick-action buttons to manage listings or create new ones. If logged in as a student or visiting as a guest, it renders the Student Search Hero with a city search bar and a 'Featured PG Accommodations' section that fetches 3 real listings from the API."

### Q20: How do you handle invalid ObjectIds in API routes?
**Answer**: "We have a utility function `isValidObjectId(id)` in `lib/utils.ts` that tests against the regex `/^[0-9a-fA-F]{24}$/`. In `app/api/listings/[id]/route.ts`, if validation fails, instead of letting MongoDB throw an error, the route gracefully falls back to querying `mockDb`."

### Q21: How does the side-by-side comparison feature work?
**Answer**: "From `app/saved/page.tsx` or `app/listings/page.tsx`, students can select up to 3 PGs via checkboxes. Clicking 'Compare' navigates to `/compare?id=id1&id=id2&id=id3`. The page reads all `id` params with `searchParams.getAll('id')`, fetches each listing in parallel via `Promise.all()`, and renders a comparison table covering price, type, gender, city, verified status, all 8 amenities, veg-only, and curfew."

### Q22: How do students connect with owners on WhatsApp?
**Answer**: "We store an optional `ownerPhone` on the `Listing` model. On the listing detail page, clicking 'Chat on WhatsApp' calls `getWhatsAppUrl(ownerPhone, title)` from `lib/utils.ts`, which opens `https://wa.me/91<phone>?text=<encoded message>` in a new tab."

### Q23: What does `app/loading.tsx` do?
**Answer**: "`app/loading.tsx` is an App Router convention built on React Suspense. It automatically renders while route segments are fetching server data. Our loading screen shows an animated progress bar, glowing pulse rings, and a floating PGFinder branded icon."

### Q24: How do you prevent Cumulative Layout Shift (CLS) on the listings page?
**Answer**: "We built `GridListingSkeleton` in `components/ui/skeleton-card.tsx`. While fetching listing data, the UI renders shimmer skeleton cards matching the approximate dimensions of real listing cards, preventing visual jumping when data loads."

### Q25: How did you fix the owner dashboard query limit bug?
**Answer**: "By default, `GET /api/listings` paginated results to 12 per page. The dashboard originally showed only 12 out of 20 listings. We updated `app/dashboard/page.tsx` to pass `limit=100` in the API request, ensuring all owner properties load on one screen."

### Q26: What security headers does the app set?
**Answer**: "In `next.config.js`, we configure security headers for all routes: `X-Frame-Options: DENY` (prevents clickjacking), `X-Content-Type-Options: nosniff` (prevents MIME sniffing), `Referrer-Policy: strict-origin-when-cross-origin` (controls referrer data), and `Permissions-Policy: camera=(), microphone=(), geolocation=()` (restricts browser APIs)."

### Q27: How should you explain the '1000+ Students & PG Owners' statistic?
**Answer**: "The '1000+ Students & PG Owners' badge on the student hero section is static marketing placeholder copy for UI presentation purposes. It demonstrates how a production marketplace landing page would present platform branding, rather than representing live database metrics."

### Q28: How do inquiries connect to the chat feature?
**Answer**: "When a student submits an inquiry from the listing detail page, the code first creates a conversation thread via `POST /api/chat/conversations` (with the inquiry message as the initial message), then also creates an `Inquiry` record via `POST /api/inquiries`. The user is then redirected to `/chat?id=<conversationId>` to continue the conversation."

### Q29: How many steps does the property creation wizard have and where does it live?
**Answer**: "The wizard has **5 steps** — (1) Basic Info: title, description, price, type, gender, address, phone; (2) Amenities & Rules: toggles for all amenities and rules; (3) Photos: image upload with Cloudinary; (4) Location: Nominatim search, current location detection, and map pin; (5) Review: read-only summary before submission. The page `/dashboard/create` renders `components/dashboard/ListingForm.tsx` in `create` mode. The same component is reused at `/dashboard/edit/[id]` in `edit` mode with pre-populated data."

### Q30: How would you scale PGFinder for 100,000 active users?
**Answer**: "To scale PGFinder, I would: (1) Replace HTTP chat polling with WebSockets via Pusher or AWS API Gateway for real-time messaging; (2) Add Redis (Upstash) for caching listing query responses and rate-limiting API endpoints; (3) Use MongoDB Atlas auto-scaling clusters with horizontal sharding on `address.city`; (4) Implement CDN edge caching with `Cache-Control` headers on the listings API for repeated search queries."

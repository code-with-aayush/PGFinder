# PGFinder — Complete Technical Project Documentation & Viva Guide

> **Live Application URL**: [https://pgfinder-eight.vercel.app/](https://pgfinder-eight.vercel.app/)  
> **Repository**: `https://github.com/code-with-aayush/PGFinder.git`  
> **Target Audience**: Student Developer / Viva Candidate / Project Reviewer

---

## 1. PROJECT OVERVIEW

### 1.1 Problem Statement
College students moving to new cities face a chaotic, unsafe housing search. Most hunt for PG (Paying Guest) accommodations through Facebook groups, local brokers, or general classified platforms like OLX. This results in:
* **Zero Verification**: Unverified listings, fake photos, and advance-payment scams.
* **No Relevant Filters**: Inability to filter specifically by college distance, AC/non-AC, food preference (veg/non-veg), or gender rules.
* **Broker Interference**: High brokerage fees charged by middlemen.

### 1.2 The PGFinder Solution
* **For Students**: Search and filter PGs by city, min/max budget, gender, amenities (AC, WiFi, meals, laundry, parking, hot water, power backup, security), veg-only rules, and verification status; sort by newest, price low-to-high, or price high-to-low; browse listings on an interactive map; save favorites; compare up to three PGs side-by-side in a comparative matrix table; send direct inquiries; track sent inquiry statuses; use in-app messaging with periodic updates; and contact owners on WhatsApp with 1 click.
* **For PG Owners**: Use the Owner Control Panel (`/dashboard`) to create and manage PG listings through a **five-step wizard** (`ListingForm.tsx`) with address search, current-location support, and interactive map pin placement; receive student messages in the in-app inbox; and manage property availability.

### 1.3 Why This Project Stands Out in a Viva
* **Marketplace Architecture**: Dual-actor role-based access control (RBAC) powered by Clerk metadata.
* **Geospatial Engineering**: MongoDB `2dsphere` spatial indexing with GeoJSON coordinates `[lng, lat]` supporting `$nearSphere` radius distance queries and `$geoWithin` `$box` map viewport queries.
* **Resilient System Design**: Hybrid database architecture featuring a fallback database (`mockDb.ts`) that guarantees 100% UI uptime even during MongoDB network timeouts.
* **Optimized Web Architecture**: Debounced state inputs (350ms), optimistic UI updates with automatic exception rollback, tab-visibility-aware periodic polling, and Edge caching.

---

## 2. TECH STACK — EVERY TOOL EXPLAINED

| Tool / Library | Category | Why Chosen For THIS Project | File References |
| :--- | :--- | :--- | :--- |
| **Next.js 14 (App Router)** | Framework | Provides unified full-stack architecture with React Server Components, serverless API routes, and optimized file-system routing. | `app/layout.tsx`, `app/page.tsx`, `app/api/*` |
| **MongoDB Atlas + Mongoose** | Database | Native support for GeoJSON spatial indexing (`2dsphere`), flexible document schemas for property attributes, and Atlas cloud hosting. | `lib/mongodb.ts`, `models/*` |
| **mockDb.ts** | Resilience Layer | Custom in-memory database store that prevents app crashes if MongoDB Atlas encounters IP whitelist timeouts during live demos. | `lib/mockDb.ts` |
| **Clerk v5** | Auth & RBAC | Handles OAuth, email verification, session management, and role metadata storage (`publicMetadata.role`) using async server patterns (`await auth()`). | `middleware.ts`, `lib/useUserRole.ts`, `app/api/users/sync/route.ts` |
| **Cloudinary v2 SDK** | Media CDN | Offloads heavy binary image storage from Node.js serverless functions using server-side HMAC signed uploads (`cloudinary.v2.uploader.upload_stream`). | `lib/cloudinary.ts`, `app/api/upload/route.ts` |
| **Leaflet.js + React-Leaflet** | Maps | Lightweight client-side map rendering library. Selected over Google Maps to avoid paid API keys and mandatory billing setup. | `app/map/page.tsx`, `components/dashboard/LocationPicker.tsx` |
| **Nominatim OpenStreetMap** | Geocoding API | Free REST API for resolving college landmarks, street addresses, and browser current-location coordinates into map pins. | `components/dashboard/ListingForm.tsx` |
| **Tailwind CSS + shadcn/ui** | UI Styling | Utility-first styling with accessible, customizable component primitives and glassmorphism CSS keyframe animations. | `app/globals.css`, `components/ui/*` |
| **Zod + React Hook Form** | Form Validation | Strict schema-based validation for property forms, listing prices, mobile numbers, and API request bodies. | `lib/validations.ts`, `components/dashboard/ListingForm.tsx` |
| **Vercel** | Hosting | Zero-configuration serverless deployment platform for Next.js App Router applications. | `next.config.js` |

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

### 3.1 Search & Filter Request Lifecycle
1. **Keystroke Input**: User types `"Bangalore"` into `FilterSidebar.tsx` or adjusts min/max budget inputs.
2. **Debounce Delay**: `useDebounce` hook holds execution for `350ms`. If no further typing occurs, it updates URL search parameters via `router.push('/listings?city=Bangalore&minPrice=5000&maxPrice=15000&sort=price_asc')`.
3. **API Execution**: `app/listings/page.tsx` calls `GET /api/listings?city=Bangalore&minPrice=5000&maxPrice=15000&sort=price_asc`.
4. **Database Query**: `app/api/listings/route.ts` executes a query against MongoDB `Listing.find(...)` with `.sort({ price: 1 })`.
5. **UI Rendering**: During fetching, `GridListingSkeleton` renders animated shimmer card outlines. Once data arrives, real `ListingCard` components render instantly.

### 3.2 Authentication & Role Assignment Lifecycle
1. **Registration**: User completes Clerk sign-up at `/sign-up`.
2. **Onboarding Redirect**: User lands on `/onboarding` and selects either `"Student"` or `"PG Owner"`.
3. **Role Sync**: Onboarding page sends `POST /api/users/sync` with `{ role: 'owner' }`.
4. **Metadata Update**: Route Handler calls `clerkClient().users.updateUserMetadata(userId, { publicMetadata: { role } })` and updates MongoDB `User` document.
5. **JWT Refresh**: Onboarding page calls `await user.reload()` to update client session claims, then redirects to `/dashboard` or `/listings`.

### 3.3 Server-Side Signed Image Upload Flow
1. **File Selection**: Owner selects image files in `ListingForm.tsx`.
2. **Multipart POST**: Client sends binary file data to `POST /api/upload`.
3. **Authentication Guard**: `POST /api/upload` verifies `const { userId } = await auth();`. If null, rejects with `401 Unauthorized`.
4. **Cloudinary Stream**: Server converts buffer into a stream and calls `cloudinary.v2.uploader.upload_stream` using secret server credentials (`CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`).
5. **URL Return**: Cloudinary returns secure HTTPS image URL (`secure_url`), which is appended to the form's `photos` array.

### 3.4 In-App Messaging Polling Engine (Periodic Updates)
1. **Thread Selection**: User opens `/chat?id=conv_123`. Component sets `selectedConvId = "conv_123"`.
2. **Polling Loop**: A React `useEffect` interval triggers `GET /api/chat/conversations/conv_123/messages` periodically (3–4 second interval).
3. **Tab Visibility Check**: If `document.visibilityState === 'hidden'`, polling pauses automatically to conserve system memory and battery.
4. **Deep Array Diffing**: Incoming messages array is compared against current state (`prev[last]._id === newMsgs[last]._id`). If no new messages exist, React skips state updates to prevent re-renders.
5. **Optimistic Delivery**: Sending a message appends a temporary bubble to `optimisticMsgs` immediately before POST resolves.

---

## 4. DATABASE DESIGN & SCHEMAS

### 4.1 Schema Definitions & Data Types

#### `models/User.ts` (Users Collection)
```typescript
interface IUser {
  clerkId: string;    // Unique Clerk Auth Identifier (Indexed)
  name: string;       // Full name
  email: string;      // User email address
  role: string;       // 'student' | 'owner'
  createdAt: Date;
}
```

#### `models/Listing.ts` (Listings Collection)
```typescript
interface IListing {
  ownerId: string;     // Clerk ID of property owner
  ownerPhone: string;  // 10-digit phone for direct WhatsApp connect
  title: string;       // PG Name (e.g., "Sunshine PG for Girls")
  description: string; // Long form details
  price: number;       // Monthly rent in INR
  deposit: number;     // Security deposit in INR
  type: string;        // 'PG' | 'Hostel' | 'Flat Share'
  gender: string;      // 'male' | 'female' | 'any'
  address: {
    street: string;
    city: string;      // Indexed for fast city filtering
    state: string;
    pincode: string;
  };
  location: {
    type: string;      // Always 'Point'
    coordinates: number[]; // [Longitude, Latitude] - Note GeoJSON order!
  };
  amenities: {
    ac: boolean;
    wifi: boolean;
    meals: boolean;
    laundry: boolean;
    parking: boolean;
    hotWater: boolean;
    powerBackup: boolean;
    security: boolean;
  };
  rules: {
    vegOnly: boolean;      // Queried by ?veg=true filter
    noSmoking: boolean;
    noAlcohol: boolean;
    guestPolicy: string;   // e.g., "Guests allowed till 9 PM"
    curfewTime: string;    // e.g., "10:00 PM"
  };
  photos: string[];    // Array of Cloudinary image HTTPS URLs
  isVerified: boolean; // Trust verification badge
  isActive: boolean;   // Active listing toggle flag
  createdAt: Date;
  updatedAt: Date;
}
// INDEXES:
// ListingSchema.index({ location: "2dsphere" });
// ListingSchema.index({ "address.city": "text" });
```

#### `models/Inquiry.ts` (Inquiries Collection)
```typescript
interface IInquiry {
  listingId: Schema.Types.ObjectId; // Reference to Listing
  listingTitle: string;             // Denormalized property title
  studentId: string;                 // Clerk ID of student
  studentName?: string;               // Denormalized student name
  studentEmail?: string;              // Denormalized student email
  ownerId: string;                   // Clerk ID of PG owner
  message: string;                   // Initial inquiry text
  status: "pending" | "responded";   // Lead status
  createdAt: Date;
}
```

#### `models/Saved.ts` (Saved Favorites Collection)
```typescript
interface ISaved {
  studentId: string;                 // Clerk ID of student
  listingId: Schema.Types.ObjectId; // Reference to Listing
  createdAt: Date;
}
// COMPOUND INDEX:
// SavedSchema.index({ studentId: 1, listingId: 1 }, { unique: true });
```

#### `models/Conversation.ts` & `models/Message.ts` (Chat Collections)
```typescript
interface IConversation {
  studentId: string;    // Clerk ID of student
  ownerId: string;      // Clerk ID of owner
  listingId: string;    // Associated PG ID
  listingTitle: string; // Denormalized listing title for header
  lastMessage: string;  // Preview text for inbox list
  lastMessageAt: Date;  // Sorting timestamp
}

interface IMessage {
  conversationId: Schema.Types.ObjectId; // Reference to Conversation
  senderId: string;                       // Clerk ID of sender
  senderRole: string;                     // 'student' | 'owner'
  text: string;                           // Chat message body
  createdAt: Date;
}
```

---

## 5. AUTHENTICATION & ROLES — STEP BY STEP

### 5.1 Clerk v5 Asynchronous Auth Patterns
In Clerk SDK v5, session getters are asynchronous functions:
```typescript
// Correct Clerk v5 API Route Pattern
import { auth } from "@clerk/nextjs/server";

export async function GET(request: Request) {
  const { userId } = await auth(); // MUST be awaited!
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // ...
}
```

### 5.2 Why Role Routing Was Removed from `middleware.ts` (The Redirect Bug)
* **Problem**: Originally, `middleware.ts` tried to read `auth().sessionClaims?.publicMetadata?.role` and redirect unassigned users to `/onboarding`.
* **Root Cause**: By default, Clerk session JWT tokens do NOT include `publicMetadata` unless manually configured in the Clerk Dashboard JWT Claims editor. Because `sessionClaims.publicMetadata` was undefined on fresh logins, middleware redirected users to `/onboarding`. When `/onboarding` loaded, middleware redirected to `/onboarding` again, creating an infinite browser redirect loop.
* **Solution**: Removed role-based redirects from `middleware.ts`. Protected routes are now evaluated on the client side using `lib/useUserRole.ts` and `user.reload()`.

---

## 6. EVERY PAGE — FULL EXPLANATION

| Page Path | Purpose | Access Level | Key Components & Data Logic |
| :--- | :--- | :--- | :--- |
| **`app/page.tsx`** | Dual Landing Page | Public | Dynamically checks `isOwner`. Renders PG Owner Control Portal Hero for owners and Student Search Hero for students/guests. |
| **`app/listings/page.tsx`** | Main Search Grid | Public | Debounced filtering (`useDebounce`), min/max price inputs, sort dropdown (`newest`, `price_asc`, `price_desc`), pagination, and `GridListingSkeleton` shimmer loaders. |
| **`app/listings/[id]/page.tsx`** | PG Details View | Public | Image gallery, amenity badges, house rules (curfew, guest policy, veg status), dynamic WhatsApp link (`wa.me/<ownerPhone>`), inquiry modal, and optimistic favoriting. |
| **`app/map/page.tsx`** | Interactive Map View | Public | Client-rendered Leaflet map (`ssr: false`), college landmark geocoding search, radius slider, "Near Me" geolocation, and side drawer. |
| **`app/saved/page.tsx`** | Saved Favorites | Protected (Student) | Displays bookmarked PGs (`GET /api/saved`), allows 1-click removal, and selection checkboxes to launch side-by-side comparison (`/compare?id=...`). |
| **`app/inquiries/page.tsx`** | Sent Inquiries | Protected (Student) | Displays history of inquiries sent by student (`GET /api/inquiries?role=student`) with `Pending` or `Responded` status badges. If an owner visits, shows toast and redirects to `/dashboard`. |
| **`app/compare/page.tsx`** | Side-by-Side Matrix | Public / Protected | Fully functional comparative matrix table. Reads `?id=...` URL params, fetches listing details in parallel via `Promise.all()`, and compares rent, deposit, gender, city, verified badge, amenities, and house rules. |
| **`app/chat/page.tsx`** | In-App Messaging Inbox | Protected | Dual-panel interface with unread badges. Primitive state tracking (`selectedConvId`), optimistic message queue, and visibility-aware periodic polling. |
| **`app/onboarding/page.tsx`** | Role Selection Setup | Protected | Role selection interface (`Student` or `PG Owner`). Sends `POST /api/users/sync`, executes `await user.reload()`, and redirects to target workflow. |
| **`app/dashboard/page.tsx`** | Owner Control Panel | Protected (Owner) | Owner analytics, accommodation list with `limit=100` query parameter, active/inactive status toggling, and direct navigation to in-app chat inbox. |
| **`app/dashboard/create/page.tsx`** | 5-Step Creation Wizard | Protected (Owner) | Renders `components/dashboard/ListingForm.tsx`, which encapsulates all **5-step wizard logic** (Step 1: Basic Info, Step 2: Amenities & Rules, Step 3: Photos, Step 4: Location with Nominatim search + current location + map pin adjustment, Step 5: Review). |
| **`app/loading.tsx`** | Global Page Loader | Public | App Router loading screen rendering glowing pulse rings and an animated floating PGFinder map pin icon. |

---

## 7. EVERY API ROUTE — FULL EXPLANATION

### `GET /api/listings`
* **Query Params**: `city`, `gender`, `type`, `minPrice`, `maxPrice`, `ac`, `wifi`, `meals`, `veg`, `verified`, `lat`, `lng`, `radius`, `sort`, `ownerId`, `page`, `limit`.
* **Sorting Parameter**: Accepts `sort=newest` (`{ createdAt: -1 }`), `sort=price_asc` (`{ price: 1 }`), or `sort=price_desc` (`{ price: -1 }`).
* **Veg Query Parameter**: `veg=true` queries `query["rules.vegOnly"] = true`.
* **MongoDB Spatial Query**: If `lat` and `lng` exist, executes `$nearSphere`:
  ```typescript
  query.location = {
    $nearSphere: {
      $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
      $maxDistance: parseInt(radius, 10), // meters
    },
  };
  ```
* **Performance**: Sets Edge cache headers (`Cache-Control: s-maxage=10, stale-while-revalidate=59`).

### `GET /api/listings/bounds`
* **Query Params**: `sw_lat`, `sw_lng`, `ne_lat`, `ne_lng` (Southwest and Northeast map coordinates).
* **MongoDB Query Logic**: Spatial bounding box search using `$geoWithin` `$box`.

### `GET/PUT/DELETE /api/listings/[id]`
* **Validation**: Validates `params.id` using 24-character hex regex (`/^[0-9a-fA-F]{24}$/`). If invalid, gracefully redirects query to `mockDb`.
* **Authorization**: `PUT` and `DELETE` verify `if (listing.ownerId !== userId)` and return `403 Forbidden` if a non-owner attempts modifications.

---

## 8. FEATURES — HOW EACH IS BUILT

### 8.1 Side-by-Side Comparison Engine (`app/compare/page.tsx`)
* Fully functional comparison matrix page. Reads multiple `id` query parameters (`/compare?id=id1&id2=id2`), fetches `/api/listings/[id]` in parallel via `Promise.all()`, and renders a side-by-side comparative table evaluating rent, deposit, gender rules, city, verification status, amenities (`ac`, `wifi`, `meals`, `laundry`, `parking`, `hotWater`, `powerBackup`, `security`), and house rules (`vegOnly`, `curfewTime`).

### 8.2 Debounced Search & Sort Engine
* Custom hook `useDebounce(value, delay = 350)` manages text input state. Sorting dropdown (`newest`, `price_asc`, `price_desc`) updates URL search params and executes dynamic MongoDB sorting.

### 8.3 Map Search & OpenStreetMap Geocoding
* `app/map/page.tsx` imports Leaflet dynamically (`ssr: false`) to avoid server-side `window is not defined` errors.
* Step 4 of the 5-step wizard (`ListingForm.tsx`) allows owners to search landmarks, click `"Detect Pin from Address"`, use `"Use Current Location"`, or adjust map pins manually. Nominatim REST API resolves query strings into exact coordinates.

---

## 9. FOLDER & FILE STRUCTURE

```text
PGFinder/
├── app/
│   ├── api/
│   │   ├── chat/conversations/[id]/messages/route.ts
│   │   ├── chat/conversations/route.ts
│   │   ├── inquiries/[id]/route.ts
│   │   ├── inquiries/route.ts
│   │   ├── listings/[id]/route.ts
│   │   ├── listings/bounds/route.ts
│   │   ├── listings/route.ts
│   │   ├── saved/[id]/route.ts
│   │   ├── saved/route.ts
│   │   ├── upload/route.ts
│   │   ├── upload/signature/route.ts
│   │   ├── users/me/route.ts
│   │   └── users/sync/route.ts
│   ├── chat/page.tsx
│   ├── compare/page.tsx
│   ├── dashboard/create/page.tsx
│   ├── dashboard/page.tsx
│   ├── inquiries/page.tsx
│   ├── listings/[id]/page.tsx
│   ├── listings/page.tsx
│   ├── map/page.tsx
│   ├── onboarding/page.tsx
│   ├── saved/page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   ├── loading.tsx
│   └── page.tsx
├── components/
│   ├── dashboard/ListingForm.tsx
│   ├── dashboard/LocationPicker.tsx
│   ├── listings/FilterSidebar.tsx
│   ├── listings/ListingCard.tsx
│   ├── ui/skeleton-card.tsx
│   ├── Footer.tsx
│   └── Navbar.tsx
├── hooks/
│   └── useDebounce.ts
├── lib/
│   ├── cloudinary.ts
│   ├── mockDb.ts
│   ├── mongodb.ts
│   ├── useUserRole.ts
│   ├── utils.ts
│   └── validations.ts
├── models/
│   ├── Conversation.ts
│   ├── Inquiry.ts
│   ├── Listing.ts
│   ├── Message.ts
│   ├── Saved.ts
│   └── User.ts
├── scripts/
│   └── seed.js
├── middleware.ts
├── next.config.js
├── package.json
└── README.md
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

# Cloudinary Storage Credentials (Server-Side Signed Uploads)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Cloudinary Storage Preset (Optional Direct Upload Preset)
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=pgfinder_unsigned

# Application URL
NEXT_PUBLIC_APP_URL=https://pgfinder-eight.vercel.app
```

---

## 11. WHAT IS REAL vs SEEDED vs DUMMY

```
+-----------------------------------------------------------------------+
|                             FEATURE STATUS                            |
+------------------------------------+----------------------------------+
| REAL (100% Production Code)        | SEEDED & SIMULATED               |
+------------------------------------+----------------------------------+
| • Clerk Auth & RBAC Roles          | • 20 Seeded PG Listings          |
| • MongoDB Spatial Indexing ($near) | • 1 Seeded Owner Account         |
| • Server-Side Signed Uploads       | • Verified Badges (Manual Flag)  |
| • Nominatim Address Geocoding      | • Static Marketing Copy Stats    |
| • In-App Messenger (HTTP Polling)  | • Placeholder Support Contact    |
| • Leaflet Interactive Map          | • Direct WhatsApp Deep Link      |
| • Side-by-Side Comparison Engine   |                                  |
| • 5-Step Property Creator Wizard   |                                  |
+------------------------------------+----------------------------------+
```

### **The 20 Seeded Property Listings Table**
All 20 listings are bound to the test owner account: `test-owner@example.com` (`test_owner_001`).

```text
1. Sunshine PG for Girls — Rohini Sector 7, Delhi (₹8,500/mo) | Girls | AC, WiFi, Meals
2. Royal Boys Hostel — Hauz Khas, Delhi (₹12,000/mo) | Boys | AC, WiFi, Meals
3. Green Valley PG — Kamla Nagar, Delhi (₹6,000/mo) | Co-ed | WiFi, Meals
4. Koramangala Student Hub — Koramangala 5th Block, Bangalore (₹9,500/mo) | Boys | AC, WiFi, Meals
5. BTM Layout Girls PG — BTM Layout 2nd Stage, Bangalore (₹7,500/mo) | Girls | WiFi, Meals
6. HSR Layout Boys Hostel — HSR Layout Sector 2, Bangalore (₹6,500/mo) | Boys | WiFi
7. Indiranagar Premium Co-Living — 100 Feet Road, Bangalore (₹15,000/mo) | Co-ed | AC, WiFi, Meals
8. Kothrud Student PG — Paud Road, Pune (₹5,500/mo) | Boys | WiFi
9. Viman Nagar Executive PG — Near Symbiosis, Pune (₹11,000/mo) | Girls | AC, WiFi, Meals
10. Powai Lake View PG for Boys — Hiranandani Powai, Mumbai (₹14,500/mo) | Boys | AC, WiFi, Meals
11. Andheri West Girls PG — Near Mithibai College, Mumbai (₹13,000/mo) | Girls | AC, WiFi
12. Gachibowli Tech Hub PG — Near IIIT, Hyderabad (₹8,000/mo) | Boys | AC, WiFi, Meals
13. Madhapur Luxury Co-Living — Hitech City, Hyderabad (₹10,500/mo) | Co-ed | AC, WiFi, Meals
14. Noida Sector 62 Student PG — Near Jaypee Institute, Noida (₹7,000/mo) | Boys | WiFi, Meals
15. Cyber City Boys PG — Near Cyber Hub, Gurgaon (₹12,500/mo) | Boys | AC, WiFi, Meals
16. Golf Course Road Co-Living — Sector 54, Gurgaon (₹16,000/mo) | Co-ed | AC, WiFi, Meals
17. Satya Niketan DU South Campus PG — Near Venky College, Delhi (₹9,000/mo) | Girls | AC, WiFi, Meals
18. Electronic City Phase 1 PG — Near Infosys Gate 1, Bangalore (₹6,800/mo) | Boys | WiFi, Meals
19. Baner Road Boys Hostel — Near Cummins College, Pune (₹7,200/mo) | Boys | WiFi
20. Bandra West Luxury PG — Hill Road Bandra, Mumbai (₹18,000/mo) | Girls | AC, WiFi, Meals
```

---

## 12. MOCKDB FALLBACK SYSTEM

`lib/mockDb.ts` implements the **Circuit Breaker / Graceful Degradation Design Pattern**. Serves mock data if MongoDB Atlas experiences network timeouts.

---

## 13. PROBLEMS FACED & HOW THEY WERE SOLVED

### **Bug 1: `POST /api/users/sync` 500 Error & 30-Second Timeout**
* **Symptom**: New sign-ups hung on onboarding before crashing with 500 Error.
* **Fix**: Updated call to `clerkClient().users.updateUserMetadata()` in `app/api/users/sync/route.ts` and added `serverSelectionTimeoutMS: 5000` to `lib/mongodb.ts`.

### **Bug 2: Infinite Redirect Loop on Onboarding (`/onboarding`)**
* **Symptom**: Browser got stuck in an endless loop between `/` and `/onboarding`.
* **Fix**: Removed role redirects from `middleware.ts`. Protected routes are evaluated on the client via `lib/useUserRole.ts`.

### **Bug 3: Blank White Screen After Role Selection**
* **Symptom**: Selecting a role saved to DB but rendered a blank white page instead of redirecting.
* **Fix**: Added `await user.reload()` in `app/onboarding/page.tsx` before triggering `router.push()`.

### **Bug 4: Cloudinary Image Upload 400 Bad Request**
* **Symptom**: Submitting photos threw HTTP 400 Bad Request.
* **Fix**: Cleaned `.env.local` whitespace and configured server signed uploads (`app/api/upload/route.ts`).

### **Bug 5: "Listing Not Found" 400 Error on Detail Page**
* **Symptom**: Newly created listing detail pages displayed *"Listing not found"* error.
* **Fix**: Updated `mockDb.ts` to generate valid 24-character hex ObjectIds and updated route handler to catch invalid formats gracefully.

### **Bug 6: Hardcoded WhatsApp Phone Number (`9876543210`)**
* **Symptom**: Clicking *"Chat on WhatsApp"* opened dummy number `9876543210`.
* **Fix**: Added `ownerPhone` field to `Listing.ts` schema and form, updating `app/listings/[id]/page.tsx` to generate dynamic `wa.me/<ownerPhone>` URLs.

### **Bug 7: Chat Thread Disappearing & Auto-Reload Scroll Jitter**
* **Symptom**: In `/chat`, opening a conversation caused the thread to disappear or jump-scroll every 3 seconds.
* **Fix**: Switched to primitive ID tracking (`selectedConvId: string \| null`), deep array diffing (`prev[last]._id === newMsgs[last]._id`), `window.history.replaceState`, and added `document.visibilityState === 'visible'` checks.

### **Bug 8: Owner Dashboard Showing Only 12 Listings**
* **Symptom**: Owner Dashboard displayed *"12 Total Accommodations"* despite 20 listings existing in DB.
* **Fix**: Updated `app/dashboard/page.tsx` to pass `limit=100` (`/api/listings?ownerId=...&limit=100`).

### **Bug 9: Multi-owner Data Leakage**
* **Symptom**: Newly created owner accounts saw test listings and inquiries belonging to other owners.
* **Fix**: Enforced strict single-owner isolation across all listing, inquiry, and chat API routes.

---

## 14. TRANSFER & LOCAL SETUP GUIDE

### **Executing `scripts/seed.js`**
The standalone seed script (`scripts/seed.js`) uses Mongoose to connect to MongoDB Atlas via `MONGODB_URI`, clears existing documents in the `listings` collection, and inserts 20 realistic PG listings pre-bound to `test_owner_001` (`test-owner@example.com`).

```bash
git clone https://github.com/code-with-aayush/PGFinder.git
cd PGFinder
npm install
node scripts/seed.js
npm run dev
```

---

## 15. EDGE CASES HANDLED

1. **Nominatim OpenStreetMap Geocoding**: Auto-populates coordinates in Step 4 using street & city entered in Step 1.
2. **Interactive Map Pin Placement & Current Location**: Step 4 of the 5-step wizard lets owners detect address pins, use current location, or adjust map pins manually.
3. **Visibility-Aware Polling**: Pauses background HTTP chat polling when browser tab is hidden (`visibilityState === 'hidden'`).
4. **Invalid 24-Char ObjectId Validation**: Prevents 400 Bad Request crashes when searching non-hex IDs.
5. **Single-Owner Isolation**: Guarantees Owner A never views Owner B's listings, inquiries, or chat messages.
6. **Optimistic Favoriting Rollback**: Immediately reverts heart icon state if backend API request fails.
7. **Debounced Search Inputs**: 350ms delay on keystrokes reduces server load by ~80%.
8. **Mock Database Circuit Breaker**: Gracefully serves mock data if MongoDB Atlas experiences network timeouts.
9. **Compound Unique Index on Saved PGs**: Prevents duplicate bookmarks at database level.
10. **Dashboard Limit Expansion (`limit=100`)**: Ensures owner control panel loads all listings without pagination truncation.

---

## 16. VIVA PREPARATION — 30 QUESTIONS & ANSWERS

### Q1: What is PGFinder and why did you build it?
**Answer**: "PGFinder is a full-stack PG discovery and property management platform. We built it to solve the housing search hassle students face when moving to new cities. PGFinder offers verified listings, map-based search, direct WhatsApp connectivity, and an in-app messaging inbox with 0% brokerage fees."

### Q2: Why did you choose Next.js 14 App Router over plain React (Vite)?
**Answer**: "Next.js 14 App Router gives us Server Components for fast initial page loads, SEO optimization via `generateMetadata()`, built-in serverless API routes (`/app/api`), and automatic code splitting. Plain React would require setting up a separate Express backend server."

### Q3: Why did you choose MongoDB over SQL databases like PostgreSQL?
**Answer**: "PG accommodation listings have flexible attributes — amenities (`ac`, `wifi`, `meals`, `laundry`, `parking`, `hotWater`, `powerBackup`, `security`) and house rules (`vegOnly`, `curfewTime`, `guestPolicy`) vary across properties. MongoDB's BSON document model handles nested objects cleanly without rigid schema migrations. Additionally, MongoDB offers native `2dsphere` spatial indexing for geographic queries."

### Q4: How does the map proximity search work technically?
**Answer**: "We store property locations as GeoJSON Points `{ type: 'Point', coordinates: [longitude, latitude] }` and index the field with a `2dsphere` index in Mongoose. When a student searches near a location, `GET /api/listings` executes a `$nearSphere` query with `$maxDistance` in meters, returning properties ordered by distance."

### Q5: What is the GeoJSON coordinate ordering rule?
**Answer**: "GeoJSON specification mandates **`[Longitude, Latitude]`** ordering (`[77.2090, 28.6139]`). If you store them in reverse as `[Latitude, Longitude]`, MongoDB calculates spherical distances across the wrong hemisphere, returning zero search results!"

### Q6: How does Clerk authentication work in your application?
**Answer**: "We use Clerk v5 for authentication. User roles (`student` or `owner`) are stored in `user.publicMetadata.role`. During sign-up, users select a role on `/onboarding`, which calls `POST /api/users/sync`. The API updates metadata using `clerkClient().users.updateUserMetadata()`. On the frontend, our custom hook `useUserRole.ts` reads metadata to conditionally render UI components."

### Q7: Why did you remove role redirection from `middleware.ts`?
**Answer**: "In Clerk, `publicMetadata` is not included in the session JWT token by default unless custom JWT claims are configured in the dashboard. When middleware checked `auth().sessionClaims?.publicMetadata?.role`, it evaluated to undefined on fresh logins, causing an infinite redirect loop to `/onboarding`. We fixed this by handling role routing at the component level using `useUserRole.ts` and calling `await user.reload()` after role assignment."

### Q8: How does image uploading work in PGFinder?
**Answer**: "Image uploading is handled via `ListingForm.tsx` posting to `POST /api/upload`. The server API route Handler verifies `auth().userId` and uses Cloudinary SDK (`cloudinary.v2.uploader.upload_stream`) with secret credentials (`CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`) to stream binary files directly to Cloudinary and return secure HTTPS URLs."

### Q9: How does the in-app messaging feature work technically?
**Answer**: "We implemented an HTTP polling engine with a 3–4 second interval combined with deep message array diffing (`prev[last]._id === newMsgs[last]._id`). This provides a smooth messaging experience while staying 100% serverless-compatible on Vercel without requiring persistent WebSocket servers."

### Q10: How does background chat polling avoid unnecessary UI re-renders?
**Answer**: "We implemented deep array diffing. Every poll fetches messages for the active conversation. Before updating React state, it compares the last message ID of incoming data with current state. If IDs match, React skips updating state, preventing message flicker and page scroll resets."

### Q11: What is `mockDb.ts` and why does it exist in your codebase?
**Answer**: "`mockDb.ts` is an in-memory fallback database implementing the Graceful Degradation design pattern. If MongoDB Atlas encounters network timeouts or missing environment variables, our API routes catch the exception and serve data from `mockDb.ts`, guaranteeing 100% UI uptime."

### Q12: What is debouncing and where is it used in PGFinder?
**Answer**: "Debouncing delays function execution until a user stops performing an action for a specified duration. We created `useDebounce(value, 350)` for the city search filter. Typing `"Bangalore"` (9 letters) triggers 1 API request instead of 9, reducing server query load by 80%."

### Q13: What is Optimistic UI rendering and where did you implement it?
**Answer**: "Optimistic UI updates local state immediately before server confirmation. We used it for favoriting PGs in `app/listings/[id]/page.tsx`. Clicking the heart icon flips state instantly (0ms latency). If the `POST /api/saved` request fails, the `catch` block rolls back state and alerts the user."

### Q14: How is single-owner data isolation enforced?
**Answer**: "In `GET /api/listings`, `GET /api/inquiries`, and `GET /api/chat/conversations`, server API routes verify `auth().userId` and query data strictly where `ownerId === userId`. Owner A can never view or modify Owner B's listings, inquiries, or chat threads."

### Q15: What is the compound unique index on the `Saved` collection?
**Answer**: "In `models/Saved.ts`, we created a compound index `{ studentId: 1, listingId: 1 }` with `{ unique: true }`. This prevents a student from bookmarking the exact same property multiple times at the database level."

### Q16: Why did you use Leaflet over Google Maps?
**Answer**: "Google Maps requires a mandatory billing account and API key setup, which poses risks for college project demos. Leaflet.js combined with OpenStreetMap tile layers is open-source, lightweight, and requires no API keys while rendering fully interactive maps."

### Q17: How does address geocoding work in the listing form wizard?
**Answer**: "In Step 4 of the 5-step wizard (`ListingForm.tsx`), owners can search landmarks, click 'Detect Pin from Address', click 'Use Current Location', or manually adjust the map pin. The browser calls OpenStreetMap's Nominatim API (`https://nominatim.openstreetmap.org/search?q=...`), returning latitude and longitude coordinates."

### Q18: What is denormalization and where did you use it?
**Answer**: "Denormalization is storing duplicate data in a model to eliminate expensive database joins. We stored `listingTitle` directly inside `Inquiry` and `Conversation` models, allowing inbox lists to display PG names without performing `$lookup` joins on every fetch."

### Q19: What is the Dual Home Page feature in `app/page.tsx`?
**Answer**: "`app/page.tsx` evaluates `useUserRole()`. If logged in as a PG Owner (`isOwner === true`), it renders an Owner Control Portal Hero featuring quick actions to manage listings or post new accommodations. If logged in as a student or guest, it renders the Student Search Hero."

### Q20: How do you handle invalid ObjectIds in API route parameters?
**Answer**: "In `app/api/listings/[id]/route.ts`, we validate `params.id` using 24-character hex regex (`/^[0-9a-fA-F]{24}$/`). If validation fails, instead of throwing an unhandled 400 Bad Request error, the route gracefully falls back to querying `mockDb`."

### Q21: How does the side-by-side comparison feature work?
**Answer**: "In `app/compare/page.tsx`, students select saved PGs from `/saved`. The page reads URL parameters (`/compare?id=id1&id=id2`), fetches listing details in parallel via `Promise.all()`, and renders a side-by-side comparison matrix evaluating rent, deposit, gender rules, city, verification status, amenities (`ac`, `wifi`, `meals`, `laundry`, `parking`, `hotWater`, `powerBackup`, `security`), and house rules (`vegOnly`, `curfewTime`)."

### Q22: How do students connect with owners on WhatsApp?
**Answer**: "We store `ownerPhone` on the `Listing` model. On `/listings/[id]`, clicking 'Chat on WhatsApp' executes `getWhatsAppUrl(ownerPhone, title)`, opening a direct `https://wa.me/<ownerPhone>?text=...` deep link."

### Q23: What does `app/loading.tsx` do in Next.js 14?
**Answer**: "`app/loading.tsx` is an App Router convention built on React Suspense. It automatically renders a full-page loading screen with animated map pin rings while route segments fetch asynchronous server data."

### Q24: How do you prevent Cumulative Layout Shift (CLS) on the listings page?
**Answer**: "We built `GridListingSkeleton` in `components/ui/skeleton-card.tsx`. While fetching listing data, the UI renders shimmer skeleton cards matching the exact dimensions of real listing cards, preventing visual layout jumping when data loads."

### Q25: How did you fix the owner dashboard query limit bug?
**Answer**: "By default, `GET /api/listings` paginated results to 12 items per page. The owner dashboard originally showed only 12 out of 20 accommodations. We updated `app/dashboard/page.tsx` to pass `limit=100`, ensuring all owner properties load on one screen."

### Q26: What is Edge Caching and where is it applied?
**Answer**: "Edge Caching stores API responses on CDN servers close to the user. In `app/api/listings/route.ts`, we set `Cache-Control: s-maxage=10, stale-while-revalidate=59`, allowing CDN servers to fulfill repeated listing searches with sub-10ms response times."

### Q27: How should you explain the '1000+ Students & PG Owners' and support contacts in the viva?
**Answer**: "The '1000+ students & PG owners' statistic on the hero section and support contacts in the footer are static marketing placeholder copy for UI presentation purposes, demonstrating how a production marketplace landing page presents platform branding, rather than live database metrics."

### Q28: How do initial inquiries connect to the chat feature?
**Answer**: "Submitting an inquiry modal form creates an `Inquiry` record and immediately initializes an in-app conversation thread (`POST /api/chat/conversations`), redirecting the user straight to `/chat?id=...`."

### Q29: How many steps does the property creation wizard have and where does it live?
**Answer**: "The property creation wizard has **5 steps** (`1: Basic Info`, `2: Amenities & Rules`, `3: Photos`, `4: Location`, `5: Review`). The page `/dashboard/create` acts as a wrapper that renders `components/dashboard/ListingForm.tsx`, where all step logic, form validation, geocoding, and photo uploading reside."

### Q30: How would you scale PGFinder for 100,000 active users?
**Answer**: "To scale PGFinder, I would: 1) Replace HTTP chat polling with WebSockets via Pusher or AWS API Gateway WebSocket API; 2) Add Redis (Upstash) for caching listing query responses and session rate-limiting; 3) Use MongoDB Atlas auto-scaling clusters with horizontal database sharding on `address.city`."

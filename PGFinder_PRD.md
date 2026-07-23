# PGFinder — Product Requirements Document

**PG & Hostel Listing Platform**
*Version 1.0 · July 2025 · Confidential Client Deliverable*

| Field | Details |
|---|---|
| Version | 1.0 |
| Date | July 2025 |
| Type | College Project — Client Deliverable |
| Stack | Next.js 14 · MongoDB Atlas · Cloudinary · Clerk · Leaflet.js · Vercel |
| Deployment | Vercel (Free Tier) |
| Transfer Method | GitHub Repo / ZIP — fully portable via .env |

> 📌 **Purpose of this document:** This PRD defines every feature, page, API route, database collection, and design decision for the PGFinder project. It serves as the single source of truth for the AI model building this project and for the student understanding and presenting it.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Reality Classification](#3-reality-classification)
4. [Pages & Routes](#4-pages--routes)
5. [API Routes](#5-api-routes)
6. [Database Design](#6-database-design)
7. [Features — Detailed Spec](#7-features--detailed-spec)
8. [Folder & File Structure](#8-folder--file-structure)
9. [Environment Variables](#9-environment-variables)
10. [Transfer & Handoff Plan](#10-transfer--handoff-plan)
11. [Build Phases](#11-build-phases)
12. [Edge Cases](#12-edge-cases)
13. [npm Packages](#13-npm-packages)
14. [Viva Preparation](#14-viva-preparation)

---

## 1. Project Overview

### 1.1 Problem Statement

Students relocating to new cities for college currently rely on Facebook groups, OLX, and word-of-mouth to find paying guest accommodations. These channels have zero verification, no structured filters, and are riddled with scams. There is no trusted, student-focused platform for PG discovery.

### 1.2 Solution

PGFinder is a web-based marketplace where PG owners list their accommodations with photos, amenities, pricing, and house rules. Students search, filter, save, compare, and reach out to owners — all in one verified, trustworthy platform.

### 1.3 Target Users

- **PG Owners** — List and manage their PG accommodations, receive student inquiries
- **Students** — Search, filter, save, compare PGs and contact owners directly

### 1.4 Project Goals

- Provide a trusted, verified listing platform for students
- Enable structured search with meaningful filters
- Support direct student-to-owner communication
- Be fully deployable and transferable to the client with zero cost

---

## 2. Tech Stack

Every tool in this stack is on a free tier. No credit card is required for any service.

| Tool | Purpose | Why Chosen | Cost |
|---|---|---|---|
| Next.js 14 | Full-stack framework | App Router, SSR, API routes in one repo | ✅ Free |
| MongoDB Atlas | Cloud database | 512MB free cluster, geospatial query support | ✅ Free tier |
| Cloudinary | Image storage & delivery | 25GB free, on-the-fly transformations | ✅ Free tier |
| Clerk | Authentication | 10,000 MAU free, role support, prebuilt UI | ✅ Free tier |
| Leaflet.js + OpenStreetMap | Maps & geolocation | No API key, no billing, open source | ✅ Forever free |
| Nominatim | Geocoding (address → lat/lng) | OpenStreetMap geocoder, no key needed | ✅ Forever free |
| Tailwind CSS | Styling | Utility-first, fast development | ✅ Always free |
| shadcn/ui | UI components | Free component library on Tailwind | ✅ Always free |
| Vercel | Deployment & hosting | Built for Next.js, hobby plan is free | ✅ Free tier |
| GitHub | Source code & transfer | Private repo for delivery to client | ✅ Free |

### 2.1 Why NOT Google Maps

Google Maps API requires a credit card on Google Cloud Platform even for free-tier usage. For a college project with zero budget, this introduces billing risk. Leaflet.js with OpenStreetMap provides identical functionality — markers, popups, geolocation, radius filtering — with no account, no API key, and no billing. It is used in production by Wikipedia, Craigslist, and thousands of other platforms.

---

## 3. Reality Classification

This section explicitly defines what is fully real, what is seeded sample data, and what is simulated. The AI model building this project must follow these classifications precisely.

---

### ✅ REAL — Fully Functional

The following features must be built to work end-to-end with no mocking or placeholders:

| Feature | What "Real" Means |
|---|---|
| Authentication (Clerk) | Real signup, login, sessions, role assignment, protected routes |
| MongoDB Database | All data actually stored and retrieved from Atlas cloud |
| Image Upload (Cloudinary) | Owner uploads real photos, stored on Cloudinary, served as real URLs |
| Leaflet Map | Real interactive map, markers from DB coordinates, clickable popups |
| Search Filters | Every filter actually runs a MongoDB query — no hardcoded results |
| Save Listings | Saves to DB against student account, persists across sessions |
| Compare Feature | Pulls up to 3 real listings from DB, real side-by-side UI |
| Inquiry System | Message stored in DB, owner sees it in dashboard — real flow |
| WhatsApp Button | Real wa.me/ link that opens WhatsApp with owner's number |
| Owner Dashboard | Real CRUD — create/edit/delete actually hits MongoDB |
| Deployment | Actually live on Vercel with a real shareable URL |
| Role-based Access | Middleware enforces owner vs student routes — not visual only |

---

### 🟡 SEEDED — Realistic Sample Data

These are not fake — they are real data inserted into the database to make the project look populated and functional for demo/viva purposes.

| What | Details |
|---|---|
| 15 PG Listings | Realistic names, addresses, prices in Delhi/Bangalore/Pune. Real coordinates plotted on map. |
| Mixed listing types | Mix of male/female/any, AC/non-AC, veg/non-veg so all filters return results |
| 3–5 listings marked Verified | So the verified badge UI is visible and functional |
| Photos | Stock PG-style images uploaded to Cloudinary — real URLs, real images |
| 1 Owner account | Seeded owner with real Clerk account — owns all seed listings |
| 1 Student account | Seeded student with saved listings and sent inquiries |
| Sample inquiries | 2–3 inquiries so inbox UI has real content to display |
| Seed script | One command: `node scripts/seed.js` — populates entire DB instantly |

---

### ❌ DUMMY / SIMULATED

These are out of scope for this project. Each has a clear explanation the student can use in their viva.

| Feature | Why Simulated | Viva Explanation |
|---|---|---|
| Verified badge process | Real verification needs physical checks, legal ops | Admin-controlled trust system. In production: field agent visits + document check |
| Payment / Rent | Needs payment gateway, legal compliance, bank setup | Platform is discovery + inquiry only. Payment handled offline between owner and student |
| Email notifications | Needs SendGrid or similar paid service | In production: SendGrid triggers on new inquiry. Out of scope for v1 |
| SMS / OTP | Needs Twilio — costs money | Clerk handles OTP for auth. SMS alerts are a v2 feature |
| Admin panel UI | Out of scope — single deliverable | Verified badge toggled via MongoDB directly. Admin dashboard is v2 |
| Real PG owner signups | Would need actual PG owners | Demonstrated with seeded owner account. Real platform would have onboarding flow |
| WhatsApp phone numbers | Seed data uses placeholder numbers | Button logic is real — real owner phone number would work perfectly |

---

## 4. Pages & Routes

All pages are built with Next.js 14 App Router. Server Components are used for SEO-critical pages (listings, detail). Client Components are used for interactive elements (filters, map, compare panel).

---

### 4.1 Public Pages (No login required)

#### `GET /` — Home Page
- **Purpose:** Landing page, first impression, entry point to search
- **Sections:** Hero with search bar, How It Works (3 steps), Featured listings carousel, Verified badge explanation, Footer
- **Data:** Fetches 6 featured/verified listings from MongoDB on server
- **SEO:** Server Component — fully rendered HTML for search engines

#### `GET /listings` — Search & Listings Page
- **Purpose:** Main search results page with filters
- **Sections:** Filter sidebar (all filters), PG card grid, Sort controls, Pagination, Grid/Map toggle
- **Data:** `GET /api/listings` with query params from URL — all filtering done server-side in MongoDB
- **State:** All filter state lives in URL params — shareable, bookmarkable, browser-back friendly

#### `GET /listings/[id]` — PG Detail Page
- **Purpose:** Full information page for a single PG listing
- **Sections:** Photo gallery, Price & details, Amenities grid, House rules, Owner card, WhatsApp button, Inquiry form, Save button, Similar listings
- **Data:** `GET /api/listings/[id]` — single listing fetch by MongoDB `_id`
- **Auth logic:** WhatsApp button and inquiry form only shown to logged-in students

#### `GET /map` — Full Map View
- **Purpose:** See all PGs plotted on a map near a college
- **Sections:** Full-screen Leaflet map, College search input (Nominatim geocoding), Radius slider, Marker popups with mini PG card
- **Data:** `GET /api/listings` with coordinates — MongoDB `$near` geospatial query

---

### 4.2 Protected Pages — Student

#### `GET /saved` — Saved Listings
- **Purpose:** Student's bookmarked PG listings
- **Auth:** Clerk middleware — redirects to `/sign-in` if not logged in
- **Data:** `GET /api/saved` — fetches saved listing IDs, then populates listing details
- **Actions:** Remove from saved, Select for compare (max 3), Link to detail page

#### `GET /compare` — Side-by-Side Comparison
- **Purpose:** Compare up to 3 PG listings side by side
- **Auth:** Must be logged in
- **Data:** Listing IDs passed via URL params, fetched from DB
- **UI:** Table with every field compared — price, AC, veg, amenities, rules, distance

#### `GET /inquiries` — Inquiry History (Student)
- **Purpose:** All inquiries the student has sent
- **Data:** `GET /api/inquiries?role=student` — filtered by studentId from Clerk session
- **Shows:** Listing name, message preview, date sent, status (pending/responded)

---

### 4.3 Protected Pages — Owner

#### `GET /dashboard` — Owner Dashboard
- **Purpose:** Owner's control centre for managing listings and viewing inquiries
- **Auth:** Clerk middleware — only users with `role=owner` can access
- **Sections:** Stats cards (total listings, total inquiries, active listings), Listings table with edit/delete, Recent inquiries
- **Data:** `GET /api/listings?ownerId=X` and `GET /api/inquiries?role=owner`

#### `GET /dashboard/create` — Create New Listing
- **Purpose:** Multi-step form for owner to list a new PG
- **Steps:**
  - Step 1: Basic info (name, address, price, type, gender)
  - Step 2: Amenities & Rules (checkboxes)
  - Step 3: Photo upload (Cloudinary widget, up to 10 photos)
  - Step 4: Location pin (Leaflet map, owner drops pin)
  - Step 5: Review & Submit
- **Upload:** Cloudinary unsigned upload widget — photos uploaded directly to Cloudinary from browser
- **Submit:** `POST /api/listings` — creates document in MongoDB

#### `GET /dashboard/edit/[id]` — Edit Listing
- **Purpose:** Edit an existing listing
- **Auth:** Verifies listing belongs to the logged-in owner before showing form
- **Data:** `GET /api/listings/[id]` to pre-fill, `PUT /api/listings/[id]` to save

---

### 4.4 Auth Pages (Clerk-managed)

- `/sign-in` — Clerk prebuilt sign-in UI
- `/sign-up` — Clerk prebuilt sign-up UI with role selection (Student or Owner) saved to Clerk `publicMetadata`

---

## 5. API Routes

All API routes live in `/app/api/`. They use Next.js Route Handlers. Auth is verified on every protected route using Clerk's `auth()` helper.

### 5.1 Listings API

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/listings` | None | Fetch listings with filters. Accepts query params: `city`, `minPrice`, `maxPrice`, `gender`, `ac`, `veg`, `wifi`, `meals`, `verified`, `type`, `lat`, `lng`, `radius`, `page`, `limit`, `sort` |
| POST | `/api/listings` | Owner | Create new listing. Body: full listing object. Returns created listing with `_id` |
| GET | `/api/listings/[id]` | None | Fetch single listing by MongoDB `_id`. Returns 404 if not found |
| PUT | `/api/listings/[id]` | Owner | Update listing. Verifies `ownerId` matches session user before updating |
| DELETE | `/api/listings/[id]` | Owner | Delete listing. Verifies ownership. Also deletes related saved records and inquiries |

### 5.2 Saved Listings API

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/saved` | Student | Returns all saved listings for logged-in student with populated listing data |
| POST | `/api/saved` | Student | Body: `{ listingId }`. Saves listing. Returns 409 if already saved |
| DELETE | `/api/saved/[id]` | Student | Removes saved listing by `listingId`. Verifies `studentId` matches session |

### 5.3 Inquiries API

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/inquiries` | Both | Returns inquiries filtered by role. Owner sees received. Student sees sent. Filtered by Clerk userId |
| POST | `/api/inquiries` | Student | Body: `{ listingId, message }`. Creates inquiry, sets `status: pending` |
| PATCH | `/api/inquiries/[id]` | Owner | Update status to `responded`. Verifies `ownerId` matches session |

### 5.4 Upload API

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/upload` | Owner | Returns a signed Cloudinary upload URL. Client uploads directly to Cloudinary using this signature. Keeps API secret server-side only |

### 5.5 Users API

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/users/sync` | Any | Called on first login. Creates user doc in MongoDB if not exists. Stores `clerkId`, `name`, `email`, `role`, `phone` |

---

## 6. Database Design

**Database:** MongoDB Atlas
**ODM:** Mongoose
All collections use MongoDB's default `_id` (ObjectId). Geospatial queries use GeoJSON Point format on `listings.location`.

---

### 6.1 `listings` Collection

```js
{
  _id:          ObjectId,          // auto-generated
  ownerId:      String,            // Clerk user ID of the owner
  title:        String,            // e.g. "Sunshine PG for Girls"
  description:  String,            // full description text
  price:        Number,            // monthly rent in ₹
  type:         String,            // "PG" | "Hostel" | "Flat Share"
  gender:       String,            // "male" | "female" | "any"
  address: {
    street:     String,
    city:       String,
    state:      String,
    pincode:    String,
  },
  location: {
    type:         "Point",         // GeoJSON type — required for $near queries
    coordinates:  [Number, Number] // [longitude, latitude]
  },
  amenities: {
    ac:           Boolean,
    wifi:         Boolean,
    meals:        Boolean,
    laundry:      Boolean,
    parking:      Boolean,
    hotWater:     Boolean,
    powerBackup:  Boolean,
    security:     Boolean,
  },
  rules: {
    vegOnly:      Boolean,
    noSmoking:    Boolean,
    noAlcohol:    Boolean,
    guestPolicy:  String,
    curfewTime:   String,
  },
  photos:       [String],          // Cloudinary URLs array (max 10)
  isVerified:   Boolean,           // manually set true by admin in DB
  isActive:     Boolean,           // owner can deactivate without deleting
  createdAt:    Date,
  updatedAt:    Date,
}
```

**Indexes:**
- `location`: `2dsphere` index — required for MongoDB geospatial `$near` queries
- `address.city`: text index — for fast city-based filtering
- `ownerId`: regular index — for owner dashboard queries

---

### 6.2 `users` Collection

```js
{
  _id:        ObjectId,
  clerkId:    String,   // Clerk user ID (unique, indexed)
  name:       String,
  email:      String,
  role:       String,   // "student" | "owner"
  phone:      String,   // used for WhatsApp button (owners only)
  createdAt:  Date,
}
```

---

### 6.3 `inquiries` Collection

```js
{
  _id:           ObjectId,
  listingId:     ObjectId,  // ref → listings._id
  listingTitle:  String,    // denormalized for display without join
  studentId:     String,    // Clerk user ID of student
  ownerId:       String,    // Clerk user ID of owner
  message:       String,
  status:        String,    // "pending" | "responded"
  createdAt:     Date,
}
```

> **Note:** `listingTitle` is intentionally denormalized (duplicated) to avoid a JOIN when displaying the inquiry list. This is a standard MongoDB pattern.

---

### 6.4 `saved` Collection

```js
{
  _id:        ObjectId,
  studentId:  String,    // Clerk user ID
  listingId:  ObjectId,  // ref → listings._id
  savedAt:    Date,
}
```

**Indexes:**
- Compound unique index on `{ studentId, listingId }` — prevents duplicate saves

---

## 7. Features — Detailed Spec

### 7.1 Search & Filters

All filters are applied as MongoDB query parameters. Filter state lives in the URL as query params (e.g. `?city=Delhi&ac=true&minPrice=5000`) so results are shareable and bookmarkable.

| Filter | Input Type | MongoDB Query |
|---|---|---|
| City | Text input | `{ "address.city": { $regex: city, $options: "i" } }` |
| Budget Min/Max | Range slider | `{ price: { $gte: min, $lte: max } }` |
| Gender preference | Select dropdown | `{ gender: selectedGender }` |
| AC | Toggle | `{ "amenities.ac": true }` |
| Veg Only | Toggle | `{ "rules.vegOnly": true }` |
| WiFi | Toggle | `{ "amenities.wifi": true }` |
| Meals Included | Toggle | `{ "amenities.meals": true }` |
| Verified Only | Toggle | `{ isVerified: true }` |
| Type | Select | `{ type: "PG" \| "Hostel" \| "Flat Share" }` |
| Proximity | Radius slider + college input | Nominatim geocodes college → MongoDB `$near` with `$maxDistance` |

---

### 7.2 Map Feature

- Leaflet.js renders the map. Tiles served from OpenStreetMap (free, no key needed)
- On page load: fetch all active listings with coordinates from `/api/listings`
- Each listing plotted as a custom marker on the map
- Clicking a marker opens a popup with: PG name, price, gender type, link to detail page
- Student enters college name → Nominatim API returns coordinates → map centers and zooms
- Radius filter: MongoDB `$near` query with `$maxDistance` in meters
- Owner drops a pin during listing creation → `[lng, lat]` saved as GeoJSON Point in DB

---

### 7.3 Authentication & Roles

- Clerk handles all auth UI — sign-in, sign-up, sessions, tokens
- At sign-up: user selects role (Student or Owner) — saved to Clerk `publicMetadata.role`
- On first login: `/api/users/sync` creates user doc in MongoDB with role
- `middleware.ts` uses Clerk's `auth()` to protect routes:
  - `/dashboard/*` — only `owner` role can access
  - `/saved`, `/compare`, `/inquiries` — only logged-in users
- API routes verify role server-side using Clerk `auth()` — not just client-side
- WhatsApp button and inquiry form only rendered for logged-in students

---

### 7.4 Image Upload Flow

1. Owner opens Create Listing form → Step 3: Photo Upload
2. Cloudinary unsigned upload preset configured in Cloudinary dashboard
3. Browser uploads image directly to Cloudinary (file never passes through our server)
4. Cloudinary returns a `secure_url`
5. URL pushed to `photos[]` array in form state
6. On submit, `photos` array (URLs) saved to MongoDB listing document
7. Images served from Cloudinary CDN with transformations (thumbnails auto-generated)
8. Max 10 photos per listing — enforced client-side and server-side

---

### 7.5 Save & Compare

- **Save:** Student clicks Save on listing detail page → `POST /api/saved`
- Save state shown visually (filled heart icon) — checked against `/api/saved` on page load
- Saved page shows all bookmarked listings in a grid
- Student selects up to 3 listings via checkboxes → Compare button activates
- Compare page: listing IDs passed as URL params → fetched → displayed in comparison table
- **Comparison table rows:** Price, Type, Gender, AC, WiFi, Meals, Laundry, Veg, Security, Curfew, Distance

---

### 7.6 Inquiry System

- Student visits listing detail page → fills inquiry form (name auto-filled from Clerk, message textarea)
- `POST /api/inquiries` → stored in MongoDB with `status: pending`
- Student sees sent inquiries at `/inquiries` with status badge
- Owner sees received inquiries in `/dashboard` → can mark as responded
- `PATCH /api/inquiries/[id]` updates status to `responded`

---

### 7.7 WhatsApp Connect

- Owner phone number stored in `users` collection
- On listing detail page — if user is logged in: WhatsApp button rendered
- Button href: `https://wa.me/91{phone}?text=Hi, I saw your listing {title} on PGFinder`
- Opens WhatsApp web or app with a pre-filled message
- In seed data: placeholder phone number used. Real owner phone works perfectly

---

## 8. Folder & File Structure

```
pgfinder/
├── app/
│   ├── page.tsx                          ← Home page
│   ├── listings/
│   │   ├── page.tsx                      ← Search + filter page
│   │   └── [id]/page.tsx                 ← PG detail page
│   ├── map/page.tsx                      ← Full map view
│   ├── compare/page.tsx                  ← Side-by-side compare
│   ├── saved/page.tsx                    ← Student saved listings
│   ├── inquiries/page.tsx                ← Student inquiry history
│   ├── dashboard/
│   │   ├── page.tsx                      ← Owner dashboard
│   │   ├── create/page.tsx               ← Create new listing
│   │   └── edit/[id]/page.tsx            ← Edit existing listing
│   ├── sign-in/[[...sign-in]]/page.tsx   ← Clerk sign-in
│   ├── sign-up/[[...sign-up]]/page.tsx   ← Clerk sign-up
│   ├── api/
│   │   ├── listings/
│   │   │   ├── route.ts                  ← GET all, POST create
│   │   │   └── [id]/route.ts             ← GET one, PUT update, DELETE
│   │   ├── saved/
│   │   │   ├── route.ts                  ← GET all, POST save
│   │   │   └── [id]/route.ts             ← DELETE unsave
│   │   ├── inquiries/
│   │   │   ├── route.ts                  ← GET all, POST create
│   │   │   └── [id]/route.ts             ← PATCH status
│   │   ├── upload/route.ts               ← Cloudinary signed URL
│   │   └── users/sync/route.ts           ← Clerk → MongoDB sync
│   ├── layout.tsx                        ← Root layout, Clerk provider
│   └── globals.css
├── components/
│   ├── listings/
│   │   ├── ListingCard.tsx
│   │   ├── ListingGrid.tsx
│   │   ├── FilterSidebar.tsx
│   │   └── PhotoGallery.tsx
│   ├── map/
│   │   ├── MapView.tsx                   ← Leaflet map wrapper
│   │   ├── ListingMarker.tsx
│   │   └── LocationPin.tsx               ← Owner drops pin on create
│   ├── dashboard/
│   │   ├── ListingForm.tsx               ← Multi-step create/edit form
│   │   ├── PhotoUploader.tsx             ← Cloudinary upload widget
│   │   └── InquiryList.tsx
│   └── ui/                               ← shadcn/ui components
├── lib/
│   ├── mongodb.ts                        ← DB connection singleton
│   ├── cloudinary.ts                     ← Cloudinary config
│   └── utils.ts                          ← Shared helpers
├── models/
│   ├── Listing.ts                        ← Mongoose schema + model
│   ├── User.ts
│   ├── Inquiry.ts
│   └── Saved.ts
├── middleware.ts                         ← Clerk route protection
├── scripts/
│   └── seed.js                           ← DB seeder (node scripts/seed.js)
├── .env.local                            ← All secrets (never committed)
├── .env.example                          ← Template with empty values
├── .gitignore
├── README.md                             ← Setup + deploy instructions
├── next.config.js
├── tailwind.config.js
└── package.json
```

---

## 9. Environment Variables

All secrets and config live in `.env.local`. This file is never committed to Git (add to `.gitignore`). The `.env.example` file with all keys empty is committed so the client knows exactly what to fill in.

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pgfinder

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=pgfinder_unsigned

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 10. Transfer & Handoff Plan

### 10.1 What Gets Delivered

- Private GitHub repository with complete source code
- `.env.example` file listing all required environment variables
- `README.md` with step-by-step setup instructions
- `seed.js` script for instant DB population
- This PRD document

### 10.2 Client Setup Steps

| Step | Action | Time |
|---|---|---|
| 1 | Create free MongoDB Atlas account → create cluster → copy connection string | 5 min |
| 2 | Create free Cloudinary account → copy cloud name, API key, secret → create unsigned upload preset named `pgfinder_unsigned` | 5 min |
| 3 | Create free Clerk account → create application → copy publishable key and secret key | 5 min |
| 4 | Clone/download the repo → copy `.env.example` to `.env.local` → fill in all keys | 3 min |
| 5 | Run: `npm install` | 2 min |
| 6 | Run: `node scripts/seed.js` → populates DB with 15 sample listings | 1 min |
| 7 | Run: `npm run dev` → app runs at `localhost:3000` | 1 min |
| 8 | Deploy to Vercel: connect GitHub repo → add env vars in Vercel dashboard → deploy | 5 min |

### 10.3 Nothing Is Tied to the Seller's Accounts

Every service (Clerk, MongoDB Atlas, Cloudinary, Vercel) requires the client to create their own free account. After transfer, the seller has zero ongoing responsibility for the client's infrastructure. The project is fully portable.

---

## 11. Build Phases

The project is built in this order. Each phase is independently testable before moving to the next.

| Phase | What Gets Built | Deliverable |
|---|---|---|
| 1 — Setup | Next.js project, Tailwind, shadcn, Clerk, MongoDB connection, folder structure, middleware | Running app with auth working |
| 2 — Listings CRUD | Mongoose models, all `/api/listings` routes, owner dashboard, create/edit forms, Cloudinary upload | Owner can create listings with photos |
| 3 — Student Search | `/listings` page with all filters, FilterSidebar, ListingCard, pagination, URL state | Students can search and filter |
| 4 — Detail Page | `/listings/[id]` with gallery, amenities, inquiry form, WhatsApp button, save button | Full detail view working |
| 5 — Map View | Leaflet integration, `/map` page, markers, popups, Nominatim geocoding, radius filter | Interactive map with all PGs plotted |
| 6 — Save & Compare | `/saved` page, `/compare` page, save API, compare URL logic | Students can save and compare |
| 7 — Inquiries | Inquiry API, student inquiry history, owner inquiry inbox | Full inquiry flow working |
| 8 — Seed & Polish | `seed.js` script, responsive design, loading states, error handling, edge cases | Production-ready, demo-ready |
| 9 — Deployment | Vercel deployment, env vars, README, `.env.example` | Live URL + transfer-ready repo |

---

## 12. Edge Cases

| Edge Case | Where | How to Handle |
|---|---|---|
| Listing not found | `/listings/[id]` | Return 404 page with back to listings link |
| No listings match filters | `/listings` | Empty state UI with "Try adjusting your filters" message |
| Owner tries to edit another owner's listing | `PUT /api/listings/[id]` | Server checks `ownerId === auth().userId` → return 403 |
| Student tries to access `/dashboard` | `middleware.ts` | Redirect to `/` with error message |
| Duplicate save | `POST /api/saved` | Compound unique index throws error → return 409 Already Saved |
| Image upload fails | `PhotoUploader.tsx` | Show error toast, allow retry, don't block form submission |
| Nominatim geocoding fails | Map page | Show "College not found" message, allow manual map pan |
| MongoDB connection drops | `lib/mongodb.ts` | Singleton pattern with reconnection, return 500 with user-friendly error |
| No photos uploaded | Create listing form | Require at least 1 photo — client-side and server-side validation |
| Compare with fewer than 2 listings | `/compare` | Show message: "Select at least 2 listings to compare" |
| Invalid ObjectId in URL | `/listings/[id]` | Catch Mongoose CastError → return 400 Bad Request |
| Owner deletes listing with saved/inquiries | `DELETE /api/listings/[id]` | Cascade delete related saved records and inquiries in same operation |

---

## 13. npm Packages

| Package | Purpose |
|---|---|
| `next` | Core framework |
| `react`, `react-dom` | UI library |
| `mongoose` | MongoDB ODM — schemas, queries, validation |
| `@clerk/nextjs` | Authentication — provider, hooks, middleware |
| `cloudinary` | Server-side Cloudinary SDK for signed URLs |
| `next-cloudinary` | Client-side Cloudinary upload widget for Next.js |
| `leaflet` | Map rendering library |
| `react-leaflet` | React wrapper for Leaflet |
| `tailwindcss` | Utility CSS framework |
| `shadcn/ui` | Prebuilt accessible UI components |
| `react-hook-form` | Form state management |
| `zod` | Schema validation for forms and API inputs |
| `axios` | HTTP client for API calls |
| `@types/leaflet` | TypeScript types for Leaflet |
| `lucide-react` | Icon library (used by shadcn) |

---

## 14. Viva Preparation

These are the most likely questions a professor will ask during the viva, with answers tailored to this specific project.

---

**Q: Why did you use Next.js instead of plain React?**

Next.js gives us Server-Side Rendering (SSR) for listing pages, which means search engines can index PG listings — critical for a marketplace. It also lets us write API routes in the same project instead of needing a separate backend server. The App Router in Next.js 14 also lets us mix server and client components for optimal performance.

---

**Q: Why MongoDB instead of a relational database like MySQL?**

PG listings have variable amenities and rules — not every listing has the same fields. MongoDB's flexible document model handles this naturally without needing to ALTER TABLE every time. More importantly, MongoDB has native geospatial support with the `2dsphere` index and `$near` operator, which is exactly what we need for proximity-based filtering on the map.

---

**Q: How does the map work without Google Maps?**

We use Leaflet.js, an open-source JavaScript mapping library, with OpenStreetMap tiles — both completely free with no API key. Leaflet renders the map in the browser, plots markers from our MongoDB coordinates, and shows popup cards. For geocoding (converting a college name to coordinates), we use Nominatim, OpenStreetMap's free geocoding service.

---

**Q: How does the proximity filter work technically?**

Each listing stores coordinates as a GeoJSON Point in MongoDB. We add a `2dsphere` index on the `location` field. When a student enters a college name and radius, we geocode the college to coordinates using Nominatim, then run a MongoDB `$near` query with `$maxDistance` in meters. This returns listings sorted by distance from that point.

---

**Q: How is authentication handled? How do you know if someone is an owner or student?**

We use Clerk for authentication. At sign-up, the user selects their role (Student or Owner). This role is saved in Clerk's `publicMetadata`. On every API request, we call Clerk's `auth()` function server-side to get the `userId` and read the role from session claims. `middleware.ts` checks the role before allowing access to `/dashboard` (owners only) or student-only pages.

---

**Q: Where are images stored? How does upload work?**

Images are stored on Cloudinary's CDN. The upload flow is: owner selects photos in the form → browser sends image directly to Cloudinary using an unsigned upload preset → Cloudinary returns a `secure_url` → that URL is saved in the `photos` array in MongoDB. The image file never touches our server, which keeps it fast and avoids storage costs.

---

**Q: How does the verified badge system work?**

The `isVerified` field is a boolean on each listing document in MongoDB. It defaults to `false`. In a production system, this would be set by an admin after physically verifying the property. For this implementation, it is toggled directly in MongoDB by the platform admin. The badge is displayed on listing cards and detail pages whenever `isVerified` is `true`. The filtering system lets students filter to only see verified listings.

---

**Q: What happens if two students try to save the same listing simultaneously?**

The `saved` collection has a compound unique index on `{ studentId, listingId }`. If a duplicate save is attempted, MongoDB throws a duplicate key error. The API catches this and returns a 409 Conflict response. The frontend handles this gracefully by updating the UI state without making a second API call if the listing is already saved.

---

**Q: How is the project deployed and transferred to the client?**

The project is deployed on Vercel, which has native Next.js support. All configuration — database URL, API keys, auth secrets — is stored in environment variables, never hardcoded. The client creates their own free accounts on MongoDB Atlas, Cloudinary, and Clerk, fills in their keys in a `.env` file, and the entire project runs under their own accounts. Transfer is via GitHub repo or ZIP file.

---

*— End of PRD —*
*PGFinder · Version 1.0 · Confidential Client Deliverable*
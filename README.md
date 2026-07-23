# 🏠 PGFinder — Premium PG & Hostel Discovery Platform

> A full-stack, production-grade Next.js marketplace connecting students with verified PG & Hostel accommodation owners with real-time search, interactive map routing, side-by-side comparison, and direct inquiry management.

---

## 🌟 Key Features

### 🎓 For Students
- 🔍 **Advanced Multi-Filter Search:** Filter listings by city, budget slider, gender preference (Boys/Girls/Co-ed), room sharing type (Single/Double/Triple), and specific amenities (AC, Wi-Fi, Food, Gym, etc.).
- 🗺️ **Interactive Leaflet Map View:** Geospatial property visualization with custom map markers, popup previews, and location-based discovery.
- ⚖️ **Side-by-Side Comparison:** Compare up to 3 PG properties on key metrics (rent, deposit, food included, security, rules, distance).
- ❤️ **Saved Favorites:** One-click bookmarking of properties for quick access and price tracking.
- 💬 **Instant Inquiry & WhatsApp Connect:** Direct in-app lead messaging to property owners plus one-tap direct WhatsApp connection.
- ⚡ **Real-Time Responsiveness:** Mobile-first, pixel-perfect UX with fast skeleton loader states.

### 🏢 For PG Owners
- 📊 **Owner Management Dashboard:** Centralized panel to monitor total listings, active inquiries, saved bookmarks count, and listing status.
- 📝 **Comprehensive Property CRUD:** Create, update, and manage PG listings with multi-photo uploading via Cloudinary integration.
- 📬 **Inquiry Tracker:** Manage student leads with status tracking (`Pending`, `Contacted`, `Closed`) and direct contact actions.
- 🛡️ **Verification Status:** Verified badges for listings that pass safety and quality standard checks.

---

## 🛠️ Tech Stack & Architecture

- **Framework:** Next.js 14 (App Router, Server & Client Components)
- **Language:** TypeScript (Strict Mode)
- **Database & ORM:** MongoDB Atlas with Mongoose Schemas & Aggregation Pipelines
- **Authentication & Authorization:** Clerk (Role-based metadata: `student` | `owner`)
- **Media Storage:** Cloudinary (Unsigned Image Upload Preset)
- **Maps & Geocoding:** Leaflet.js, React-Leaflet & OpenStreetMap
- **Styling:** Tailwind CSS + Radix UI Primitives + Lucide Icons + Sonner Toasts
- **Form Management:** React Hook Form + Zod Schema Validation

---

## 📁 Repository Structure

```
PGFinder/
├── app/                  # Next.js App Router (Pages, Layouts & API Routes)
│   ├── api/              # Backend REST API Endpoints (Listings, Inquiries, Saved)
│   ├── dashboard/        # Owner Management Dashboard
│   ├── listings/         # Listing Directory, Search & Detailed View
│   ├── map/              # Fullscreen Interactive Map
│   ├── saved/            # Student Saved Properties
│   ├── compare/          # Property Comparison Engine
│   ├── inquiries/        # Student & Owner Inquiry History
│   └── onboarding/       # Role Selection Setup
├── components/           # Modular UI Components (Cards, Modals, Filters, Layout)
├── hooks/                # Custom React Hooks
├── lib/                  # MongoDB Connection, Auth helpers, Utilities
├── models/               # Mongoose Schemas (User, Listing, Inquiry, Saved)
└── scripts/              # Database Seeding & Maintenance Scripts
```

---

## 🚀 Getting Started

### 1. Prerequisites

- **Node.js:** `v18.x` or higher
- **Package Manager:** `npm` / `yarn` / `pnpm`
- **Cloud Services Accounts:** MongoDB Atlas, Clerk Auth, Cloudinary

### 2. Installation

```bash
git clone https://github.com/code-with-aayush/PGFinder.git
cd PGFinder
npm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory and copy the contents from `.env.example`:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# MongoDB Connection
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/pgfinder

# Cloudinary Storage
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=pgfinder_unsigned

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Database Seeding (Optional)

To seed your MongoDB database with sample PG listings across major student hubs:

```bash
node scripts/seed.js
```

### 5. Run Development Server

```bash
npm run dev
```

Navigate to `http://localhost:3000` to view the app in action.

---

## 📦 Deployment on Vercel

This repository is optimized for one-click deployment on **Vercel**:

1. Push code to your GitHub repository: `https://github.com/code-with-aayush/PGFinder.git`
2. Import the project into your Vercel Dashboard.
3. Configure the environment variables in Vercel project settings (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `MONGODB_URI`, `CLOUDINARY` keys, etc.).
4. Click **Deploy**. Vercel will automatically build and publish your Next.js app.

---

## 🔒 Security & Best Practices

- All database connections are cached and managed using connection pooling.
- Input data is sanitized and validated on both client and server side via Zod schemas.
- Environment keys and secrets are protected and omitted from version control (`.gitignore`).
- Role-based middleware ensures access control for protected routes (`/dashboard`, `/onboarding`).

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.


# PGFinder — Setup Guide

> Follow these steps to get PGFinder running on your own accounts. Setup time: ~25 minutes.

---

## Step 1: Create Your Cloud Service Accounts (15 minutes)

You need **3 free accounts**. Don't skip any — the app won't work without all three.

### 1A. Clerk (Authentication)
1. Go to [clerk.com](https://clerk.com) → Sign up for a free account
2. Click **"Add application"** → Name it `PGFinder`
3. Enable **Email** and **Google** sign-in methods
4. Go to **API Keys** in the sidebar
5. Copy these two values:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (starts with `pk_test_`)
   - `CLERK_SECRET_KEY` (starts with `sk_test_`)

### 1B. MongoDB Atlas (Database)
1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) → Sign up for a free account
2. Create a **Free Shared Cluster** (M0 tier — costs ₹0)
3. Under **Database Access** → Add a database user (remember the username & password)
4. Under **Network Access** → Click **"Allow Access from Anywhere"** (adds `0.0.0.0/0`)
5. Go to **Clusters** → Click **"Connect"** → Choose **"Drivers"** → Copy the connection string
6. Replace `<password>` in the connection string with your actual password
7. Add `/pgfinder` before the `?` to set the database name:
   ```
   mongodb+srv://youruser:yourpassword@cluster0.abc123.mongodb.net/pgfinder?retryWrites=true&w=majority
   ```

### 1C. Cloudinary (Image Storage)
1. Go to [cloudinary.com](https://cloudinary.com) → Sign up for a free account
2. From the **Dashboard**, copy:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

---

## Step 2: Configure Environment Variables (5 minutes)

1. In the project root, copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Open `.env.local` and fill in your values:
   ```env
   # Clerk Authentication (from Step 1A)
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
   CLERK_SECRET_KEY=sk_test_your_key_here
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

   # MongoDB Atlas (from Step 1B)
   MONGODB_URI=mongodb+srv://youruser:yourpassword@cluster0.abc123.mongodb.net/pgfinder?retryWrites=true&w=majority

   # Cloudinary (from Step 1C)
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=pgfinder_unsigned

   # App URL
   NEXT_PUBLIC_APP_URL=http://localhost:3000

   # Seed Script (for Step 4)
   SEED_OWNER_EMAIL=your-email@example.com
   SEED_OWNER_PHONE=98xxxxxxxx
   ```

---

## Step 3: Install & Run (2 minutes)

```bash
# Install all dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The app will work but will have no listings yet.

---

## Step 4: Create Your Owner Account & Seed Data (3 minutes)

### 4A. Create Your Owner Account
1. Open [http://localhost:3000/sign-up](http://localhost:3000/sign-up)
2. Sign up using the **same email** you put in `SEED_OWNER_EMAIL`
3. On the onboarding page, select **"I'm a PG Owner"**
4. You should see the empty Owner Dashboard

### 4B. Seed 20 Sample Listings
```bash
node scripts/seed.js
```

This script will:
- Find your Clerk account by email
- Assign the "owner" role to your account
- Create 20 realistic PG listings across 7 Indian cities (Delhi, Bangalore, Pune, Mumbai, Hyderabad, Noida, Gurgaon)
- All 20 listings will be owned by YOUR account

### 4C. Test as a Student
1. Open an **incognito/private** browser window
2. Go to [http://localhost:3000/sign-up](http://localhost:3000/sign-up)
3. Sign up with a **different email**
4. Select **"I'm a Student"** on onboarding
5. Now you can browse, filter, save, compare, and send inquiries

---

## Step 5: Deploy to Vercel (5 minutes)

1. Push the code to your own GitHub repository
2. Go to [vercel.com](https://vercel.com) → Connect your Github Account → Import your repository
3. In the **Environment Variables** section, add ALL variables from your `.env.local`
   - ⚠️ **Important**: Change `NEXT_PUBLIC_APP_URL` to your Vercel URL (e.g., `https://your-project.vercel.app`)
4. Click **Deploy**


## Troubleshooting

| Problem | Solution |
|---|---|
| `SEED_OWNER_EMAIL not found` | Add `SEED_OWNER_EMAIL=your-email@gmail.com` to `.env.local` |
| `Clerk lookup failed: 401` | Check that `CLERK_SECRET_KEY` is correct |
| `Expected exactly one Clerk user` | Sign up on the app first (Step 4A) before running the seed |
| `MONGODB_URI not found` | Add your MongoDB connection string to `.env.local` |
| Blank white screen after sign-up | Hard refresh the browser (`Ctrl+Shift+R`) |
| Images not uploading | Check all 3 Cloudinary values in `.env.local` |
| Map not loading | This is normal on first load — Leaflet takes a moment to initialize |


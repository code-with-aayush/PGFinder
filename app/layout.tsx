import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Poppins } from "next/font/google";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import "leaflet/dist/leaflet.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "PGFinder — Find Your Perfect PG Near College",
    template: "%s | PGFinder",
  },
  description:
    "Discover verified PG accommodations near your college. Search, filter, compare listings and contact owners directly on PGFinder.",
  keywords: [
    "PG",
    "paying guest",
    "hostel",
    "student accommodation",
    "PG near college",
    "PG finder",
  ],
  openGraph: {
    title: "PGFinder — Find Your Perfect PG Near College",
    description:
      "Discover verified PG accommodations near your college. Search, filter, compare and contact owners directly.",
    type: "website",
    locale: "en_IN",
    siteName: "PGFinder",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className={poppins.variable}>
        <body className="min-h-screen font-sans antialiased">
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster position="top-right" richColors />
        </body>
      </html>
    </ClerkProvider>
  );
}

import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import StructuredData from "@/components/StructuredData";
import "./globals.css";

const DOMAIN = "https://crystalkey.ca";

export const metadata: Metadata = {
  metadataBase: new URL(DOMAIN),

  title: {
    default: "Canadian Mortgage Calculator — CrystalKey",
    template: "%s | CrystalKey",
  },
  description:
    "Canada's most complete mortgage calculator. Instantly calculate payments, CMHC insurance, land transfer tax, amortization schedule, GDS/TDS qualification, and stress test. Free, accurate, and built for Canadians.",

  keywords: [
    "mortgage calculator canada",
    "canadian mortgage calculator",
    "CMHC calculator",
    "mortgage payment calculator",
    "land transfer tax calculator",
    "mortgage amortization canada",
    "GDS TDS calculator",
    "mortgage stress test canada",
    "home buying calculator canada",
    "calculateur hypothèque canada",
  ],

  authors: [{ name: "CrystalKey", url: DOMAIN }],
  creator: "CrystalKey",
  publisher: "CrystalKey",

  alternates: {
    canonical: "/",
    languages: { "en-CA": "/" },
  },

  openGraph: {
    type: "website",
    locale: "en_CA",
    url: DOMAIN,
    siteName: "CrystalKey",
    title: "Canadian Mortgage Calculator — CrystalKey",
    description:
      "Calculate your Canadian mortgage payment in seconds. Includes CMHC, land transfer tax, amortization schedule, stress test, and GDS/TDS qualification.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CrystalKey — Canadian Mortgage Calculator",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Canadian Mortgage Calculator — CrystalKey",
    description:
      "Calculate your Canadian mortgage payment in seconds. CMHC, LTT, amortization schedule, stress test and more.",
    images: ["/og-image.png"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  verification: {
    google: "", // Add Google Search Console verification token here when ready
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-CA">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <StructuredData />
      </head>
      <body>{children}</body>
      <GoogleAnalytics gaId="G-JWCF7ERGJE" />
    </html>
  );
}

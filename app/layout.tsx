import type { Metadata } from "next";
import "./globals.css";
import { GoogleAnalytics } from "@next/third-parties/google";

const SITE_URL = "https://crystalkey.ca";
const SITE_NAME = "CrystalKey";
const TITLE = "Canadian Mortgage Calculator | CrystalKey";
const DESCRIPTION =
  "Canada's most comprehensive mortgage calculator. Calculate payments, CMHC insurance, land transfer tax, amortization schedule, stress test, and total upfront costs — free and accurate.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: `%s | ${SITE_NAME}` },
  description: DESCRIPTION,
  keywords: [
    "mortgage calculator canada",
    "canadian mortgage calculator",
    "mortgage payment calculator",
    "CMHC calculator",
    "land transfer tax calculator",
    "mortgage amortization calculator",
    "mortgage stress test",
    "calculatrice hypothèque canada",
    "hypothèque calculateur",
    "mortgage affordability calculator canada",
    "crystalkey mortgage",
  ],
  authors: [{ name: "CrystalKey", url: SITE_URL }],
  creator: "CrystalKey",
  publisher: "CrystalKey",
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
  alternates: {
    canonical: SITE_URL,
    languages: { "en-CA": SITE_URL },
  },
  openGraph: {
    type: "website",
    locale: "en_CA",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: TITLE,
    description: DESCRIPTION,
    images: [{
      url: `${SITE_URL}/og-image.png`,
      width: 1200,
      height: 630,
      alt: "CrystalKey — Canadian Mortgage Calculator",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [`${SITE_URL}/og-image.png`],
    creator: "@crystalkey_ca",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    other: [
      { rel: "mask-icon", url: "/favicon.svg", color: "#1068A8" },
    ],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-CA">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="theme-color" content="#0B1927" />
      </head>
      <body>{children}</body>
      <GoogleAnalytics gaId="G-JWCF7ERGJE" />
    </html>
  );
}

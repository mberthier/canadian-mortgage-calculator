import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Canadian Mortgage Calculator",
  description: "Canada's most complete mortgage calculator. CMHC, land transfer tax, GDS/TDS qualification, lump sums, stress test, and full amortization schedule.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}

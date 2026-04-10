import { MetadataRoute } from "next";

const PAGES = [
  { path: "/",                     priority: 1.0, freq: "weekly" as const  },
  { path: "/affordability",        priority: 0.9, freq: "monthly" as const },
  { path: "/cmhc-calculator",      priority: 0.9, freq: "monthly" as const },
  { path: "/land-transfer-tax",    priority: 0.9, freq: "monthly" as const },
  { path: "/mortgage-stress-test", priority: 0.9, freq: "monthly" as const },
  { path: "/first-time-buyer",     priority: 0.8, freq: "monthly" as const },
  { path: "/mortgage-rates",       priority: 0.8, freq: "weekly" as const  },
  { path: "/glossary",             priority: 0.7, freq: "monthly" as const },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.map(({ path, priority, freq }) => ({
    url: `https://crystalkey.ca${path}`,
    lastModified: new Date(),
    changeFrequency: freq,
    priority,
  }));
}

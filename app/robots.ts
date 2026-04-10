import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "https://crystalkey.ca/sitemap.xml",
    host: "https://crystalkey.ca",
  };
}

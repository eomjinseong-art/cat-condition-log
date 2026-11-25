import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["", "/login", "/register", "/disclaimer"];
  return paths.map((path) => ({ url: `${SITE_URL}${path}`, changeFrequency: path === "" ? "weekly" : "monthly", priority: path === "" ? 1 : 0.6 }));
}

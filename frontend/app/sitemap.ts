import type { MetadataRoute } from "next";

import { getMartyrs } from "@/lib/api";
import { SITE_URL } from "@/lib/constants";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/martyrs`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/contact`, changeFrequency: "monthly", priority: 0.6 }
  ];

  const response = await getMartyrs({ page: 1, page_size: 500 }).catch(() => ({
    items: [],
    total: 0,
    page: 1,
    page_size: 500,
    pages: 1
  }));

  const martyrRoutes = response.items.map((item) => ({
    url: `${SITE_URL}/martyrs/${item.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.8
  }));

  return [...staticRoutes, ...martyrRoutes];
}

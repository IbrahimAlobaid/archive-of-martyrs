import type { Metadata } from "next";

import { SITE_URL } from "@/lib/constants";

export const defaultMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "أرشيف الشهداء | Martyrs Archive",
  description: "منصة تذكارية هادئة لحفظ صور وسير شهداء القرى والبلدات في ريف حلب الجنوبي.",
  openGraph: {
    title: "أرشيف الشهداء",
    description: "منصة تذكارية هادئة مخصصة لشهداء القرى والبلدات في ريف حلب الجنوبي.",
    url: SITE_URL,
    siteName: "Martyrs Archive",
    type: "website",
    locale: "ar"
  },
  alternates: {
    canonical: "/"
  }
};

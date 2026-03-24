import Link from "next/link";

import { MartyrCard } from "@/components/ui/MartyrCard";
import { SearchBar } from "@/components/ui/SearchBar";
import { StatCard } from "@/components/ui/StatCard";
import { getMartyrs, getMartyrStats } from "@/lib/api";
import { formatArabicDate } from "@/lib/utils";

export default async function HomePage() {
  const [statsResponse, featuredResponse] = await Promise.all([
    getMartyrStats().catch(() => ({
      total_martyrs: 0,
      villages_represented: 0,
      latest_added_name: null,
      latest_added_date: null
    })),
    getMartyrs({ featured: true, page_size: 6, sort: "newest" }).catch(() => ({
      items: [],
      total: 0,
      page: 1,
      page_size: 6,
      pages: 1
    }))
  ]);

  return (
    <div className="space-y-14">
      <section className="rounded-3xl border border-stone bg-white/90 p-8 shadow-soft md:p-12">
        <p className="mb-3 text-sm text-muted">أرشيف تذكاري مخصص لريف حلب الجنوبي</p>
        <h1 className="mb-4 text-3xl font-semibold leading-tight text-ink md:text-5xl">
          أرشيف الشهداء
        </h1>
        <p className="mb-8 max-w-2xl text-base text-muted md:text-lg">
          نُوثّق سير وصور شهداء القرى والبلدات في ريف حلب الجنوبي بقدرٍ عالٍ من الاحترام والدقة،
          حفاظًا على الذاكرة الإنسانية وتكريمًا لأصحابها.
        </p>

        <SearchBar />

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <StatCard label="إجمالي الشهداء" value={String(statsResponse.total_martyrs)} />
          <StatCard label="القرى والبلدات الممثلة" value={String(statsResponse.villages_represented)} />
          <StatCard
            label="آخر إضافة"
            value={
              statsResponse.latest_added_name
                ? `${statsResponse.latest_added_name} (${formatArabicDate(statsResponse.latest_added_date)})`
                : "-"
            }
          />
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-ink">شهداء مميزون</h2>
            <p className="text-sm text-muted">نماذج من السير المنشورة حديثًا</p>
          </div>
          <Link href="/martyrs" className="rounded-lg border border-stone px-4 py-2 text-sm text-ink">
            تصفح الأرشيف كاملًا
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredResponse.items.map((martyr) => (
            <MartyrCard key={martyr.id} martyr={martyr} />
          ))}
        </div>
      </section>
    </div>
  );
}

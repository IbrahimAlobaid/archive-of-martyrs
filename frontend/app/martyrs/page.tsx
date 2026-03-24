import { EmptyState } from "@/components/ui/EmptyState";
import { FilterPanel } from "@/components/ui/FilterPanel";
import { MartyrCard } from "@/components/ui/MartyrCard";
import { Pagination } from "@/components/ui/Pagination";
import { getMartyrs, getVillages } from "@/lib/api";

type MartyrsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function MartyrsPage({ searchParams }: MartyrsPageProps) {
  const resolvedSearchParams = await searchParams;
  const q = firstValue(resolvedSearchParams.q);
  const village = firstValue(resolvedSearchParams.village);
  const year = firstValue(resolvedSearchParams.year);
  const sort = firstValue(resolvedSearchParams.sort) as
    | "newest"
    | "oldest"
    | "alphabetical"
    | undefined;
  const page = Number(firstValue(resolvedSearchParams.page) ?? "1");
  const featured = firstValue(resolvedSearchParams.featured);

  const [villages, martyrs] = await Promise.all([
    getVillages().catch(() => []),
    getMartyrs({
      q,
      village,
      year: year ? Number(year) : undefined,
      sort: sort ?? "newest",
      page,
      featured: featured === "true" ? true : undefined,
      page_size: 12
    }).catch(() => ({ items: [], total: 0, page: 1, page_size: 12, pages: 1 }))
  ]);

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-ink">أرشيف الشهداء</h1>
        <p className="text-muted">بحث وتصفية حسب الاسم والقرية أو البلدة وتاريخ الاستشهاد.</p>
      </header>

      <FilterPanel villages={villages} />

      {martyrs.items.length ? (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {martyrs.items.map((martyr) => (
              <MartyrCard key={martyr.id} martyr={martyr} />
            ))}
          </div>
          <Pagination
            currentPage={martyrs.page}
            totalPages={martyrs.pages}
            pathname="/martyrs"
            query={{
              q,
              village,
              year,
              featured,
              sort
            }}
          />
        </>
      ) : (
        <EmptyState
          title="لا توجد نتائج"
          description="لم نتمكن من العثور على نتائج وفق المرشحات الحالية. حاول تعديل البحث أو إزالة بعض المرشحات."
          actionHref="/martyrs"
          actionLabel="عرض كل السجلات"
        />
      )}
    </div>
  );
}

import Link from "next/link";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  pathname: string;
  query: Record<string, string | undefined>;
};

function buildHref(
  pathname: string,
  query: Record<string, string | undefined>,
  page: number
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (!value || key === "page") continue;
    params.set(key, value);
  }
  params.set("page", String(page));
  return `${pathname}?${params.toString()}`;
}

export function Pagination({ currentPage, totalPages, pathname, query }: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = [];
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);

  for (let page = start; page <= end; page += 1) {
    pages.push(page);
  }

  return (
    <nav aria-label="ترقيم الصفحات" className="mt-8 flex items-center justify-center gap-2">
      {currentPage > 1 ? (
        <Link href={buildHref(pathname, query, currentPage - 1)} className="rounded-lg border px-3 py-2 text-sm">
          السابق
        </Link>
      ) : null}

      {pages.map((page) => (
        <Link
          key={page}
          href={buildHref(pathname, query, page)}
          className={`rounded-lg border px-3 py-2 text-sm ${
            page === currentPage ? "bg-accent text-white" : "bg-white"
          }`}
        >
          {page}
        </Link>
      ))}

      {currentPage < totalPages ? (
        <Link href={buildHref(pathname, query, currentPage + 1)} className="rounded-lg border px-3 py-2 text-sm">
          التالي
        </Link>
      ) : null}
    </nav>
  );
}

"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Village } from "@/lib/types";

type FilterPanelProps = {
  villages: Village[];
};

function getStringParam(value: string | null) {
  return value ?? "";
}

export function FilterPanel({ villages }: FilterPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialState = useMemo(
    () => ({
      q: getStringParam(searchParams.get("q")),
      village: getStringParam(searchParams.get("village")),
      year: getStringParam(searchParams.get("year")),
      sort: getStringParam(searchParams.get("sort")) || "newest",
      featured: searchParams.get("featured") === "true"
    }),
    [searchParams]
  );

  const [q, setQ] = useState(initialState.q);
  const [village, setVillage] = useState(initialState.village);
  const [year, setYear] = useState(initialState.year);
  const [sort, setSort] = useState(initialState.sort);
  const [featured, setFeatured] = useState(initialState.featured);

  useEffect(() => {
    setQ(initialState.q);
    setVillage(initialState.village);
    setYear(initialState.year);
    setSort(initialState.sort);
    setFeatured(initialState.featured);
  }, [initialState]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();

    if (q) params.set("q", q);
    if (village) params.set("village", village);
    if (year) params.set("year", year);
    if (sort) params.set("sort", sort);
    if (featured) params.set("featured", "true");

    router.push(`${pathname}?${params.toString()}`);
  }

  function onReset() {
    setQ("");
    setVillage("");
    setYear("");
    setSort("newest");
    setFeatured(false);
    router.push(pathname);
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-stone bg-white p-4 shadow-soft md:p-5">
      <div className="grid gap-3 md:grid-cols-5">
        <input
          value={q}
          onChange={(event) => setQ(event.target.value)}
          placeholder="الاسم"
          className="rounded-xl border border-stone px-3 py-2 text-sm outline-none focus:border-accent"
          aria-label="بحث بالاسم"
        />

        <select
          value={village}
          onChange={(event) => setVillage(event.target.value)}
          className="rounded-xl border border-stone px-3 py-2 text-sm outline-none focus:border-accent"
          aria-label="القرية أو البلدة"
        >
          <option value="">كل القرى والبلدات</option>
          {villages.map((item) => (
            <option key={item.id} value={item.slug}>
              {item.name_ar}
            </option>
          ))}
        </select>

        <input
          type="number"
          min={1900}
          max={2100}
          value={year}
          onChange={(event) => setYear(event.target.value)}
          placeholder="سنة الاستشهاد"
          className="rounded-xl border border-stone px-3 py-2 text-sm outline-none focus:border-accent"
          aria-label="سنة الاستشهاد"
        />

        <select
          value={sort}
          onChange={(event) => setSort(event.target.value)}
          className="rounded-xl border border-stone px-3 py-2 text-sm outline-none focus:border-accent"
          aria-label="الترتيب"
        >
          <option value="newest">الأحدث</option>
          <option value="oldest">الأقدم</option>
          <option value="alphabetical">أبجدي</option>
        </select>

        <label className="flex items-center gap-2 rounded-xl border border-stone px-3 py-2 text-sm">
          <input
            type="checkbox"
            checked={featured}
            onChange={(event) => setFeatured(event.target.checked)}
          />
          <span>المميزون فقط</span>
        </label>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button type="submit" className="rounded-lg bg-accent px-4 py-2 text-sm text-white">
          تطبيق
        </button>
        <button
          type="button"
          onClick={onReset}
          className="rounded-lg border border-stone px-4 py-2 text-sm text-muted"
        >
          إعادة ضبط
        </button>
      </div>
    </form>
  );
}

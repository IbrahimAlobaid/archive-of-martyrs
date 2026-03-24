type SearchBarProps = {
  defaultValue?: string;
};

export function SearchBar({ defaultValue = "" }: SearchBarProps) {
  return (
    <form action="/martyrs" method="GET" className="flex flex-col gap-3 md:flex-row md:items-center">
      <label htmlFor="q" className="sr-only">
        البحث عن شهيد
      </label>
      <input
        id="q"
        name="q"
        defaultValue={defaultValue}
        placeholder="ابحث بالاسم"
        className="w-full rounded-xl border border-stone bg-white px-4 py-3 text-ink shadow-sm outline-none transition focus:border-accent"
      />
      <button
        type="submit"
        className="rounded-xl bg-accent px-5 py-3 text-sm font-medium text-white transition hover:opacity-95"
      >
        بحث
      </button>
    </form>
  );
}

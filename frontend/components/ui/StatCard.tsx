type StatCardProps = {
  label: string;
  value: string;
};

export function StatCard({ label, value }: StatCardProps) {
  return (
    <article className="rounded-2xl border border-stone bg-white p-5 shadow-soft">
      <p className="mb-2 text-sm text-muted">{label}</p>
      <p className="text-2xl font-semibold text-ink">{value}</p>
    </article>
  );
}

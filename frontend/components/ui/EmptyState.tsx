import Link from "next/link";

type EmptyStateProps = {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
};

export function EmptyState({ title, description, actionHref, actionLabel }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-stone bg-white p-8 text-center">
      <h3 className="mb-2 text-lg font-semibold text-ink">{title}</h3>
      <p className="mx-auto max-w-xl text-sm text-muted">{description}</p>
      {actionHref && actionLabel ? (
        <div className="mt-4">
          <Link
            href={actionHref}
            className="inline-flex rounded-lg bg-accent px-4 py-2 text-sm text-white"
          >
            {actionLabel}
          </Link>
        </div>
      ) : null}
    </div>
  );
}

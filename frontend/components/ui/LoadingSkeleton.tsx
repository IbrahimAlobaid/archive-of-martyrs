type LoadingSkeletonProps = {
  cards?: number;
};

export function LoadingSkeleton({ cards = 6 }: LoadingSkeletonProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: cards }).map((_, index) => (
        <div key={index} className="animate-pulse rounded-2xl border border-stone bg-white p-4">
          <div className="mb-3 aspect-[4/3] w-full rounded-xl bg-stone/60" />
          <div className="mb-2 h-4 w-2/3 rounded bg-stone/60" />
          <div className="mb-2 h-3 w-1/2 rounded bg-stone/50" />
          <div className="h-3 w-full rounded bg-stone/40" />
        </div>
      ))}
    </div>
  );
}

import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";

export default function MartyrsLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 animate-pulse rounded bg-stone/70" />
      <div className="h-28 animate-pulse rounded-2xl bg-stone/60" />
      <LoadingSkeleton cards={9} />
    </div>
  );
}

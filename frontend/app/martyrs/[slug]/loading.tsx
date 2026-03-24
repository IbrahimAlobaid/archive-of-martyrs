import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";

export default function MartyrDetailLoading() {
  return (
    <div className="space-y-6">
      <div className="h-72 animate-pulse rounded-3xl bg-stone/60" />
      <div className="h-56 animate-pulse rounded-2xl bg-stone/50" />
      <LoadingSkeleton cards={3} />
    </div>
  );
}

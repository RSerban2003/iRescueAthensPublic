import { cn } from "@/lib/cn";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-lg bg-slate-200", className)} aria-hidden="true" />;
}

/** Card-shaped skeleton used by grids while data loads. */
export function CardSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-card">
      <Skeleton className="mb-4 h-40 w-full" />
      <Skeleton className="mb-2 h-4 w-2/3" />
      <Skeleton className="mb-4 h-3 w-1/2" />
      <Skeleton className="h-8 w-full" />
    </div>
  );
}

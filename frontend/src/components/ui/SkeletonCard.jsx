export function SkeletonCard() {
  return (
    <div className="rounded-lg border border-slate-200 p-4 shadow-soft dark:border-slate-800">
      <div className="h-10 w-10 animate-pulse rounded-md bg-slate-200 dark:bg-slate-800" />
      <div className="mt-4 h-4 w-3/4 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
      <div className="mt-3 h-4 w-1/2 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
      <div className="mt-5 h-9 animate-pulse rounded-md bg-slate-200 dark:bg-slate-800" />
    </div>
  );
}

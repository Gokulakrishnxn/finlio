// Shown for the moment before this browser's saved data has loaded.
export function PageSkeleton() {
  return (
    <div aria-hidden className="animate-pulse">
      <div className="h-10 w-56 rounded-xl bg-line/70" />
      <div className="mt-3 h-10 w-72 rounded-xl bg-line/40" />
      <div className="mt-10 h-40 rounded-3xl bg-white ring-1 ring-line" />
      <div className="mt-4 h-64 rounded-3xl bg-white ring-1 ring-line" />
    </div>
  );
}

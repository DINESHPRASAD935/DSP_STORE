export function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-800/70 bg-gray-900/40 overflow-hidden animate-pulse">
      <div className="aspect-square bg-gray-800/60" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-gray-800 rounded w-4/5" />
        <div className="h-4 bg-gray-800 rounded w-2/3" />
        <div className="h-4 bg-gray-800 rounded w-1/3" />
        <div className="h-10 bg-gray-800 rounded-xl w-full" />
      </div>
    </div>
  );
}


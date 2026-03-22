export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 animate-pulse">
      <div className="h-8 w-48 rounded-lg bg-white/5 mb-8" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-64 rounded-2xl bg-white/3 border border-white/5" />
        ))}
      </div>
    </div>
  );
}

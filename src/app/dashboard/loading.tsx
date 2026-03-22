export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 animate-pulse">
      <div className="h-8 w-40 rounded-lg bg-white/5 mb-8" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-white/3 border border-white/5" />
        ))}
      </div>
      <div className="h-64 rounded-2xl bg-white/3 border border-white/5" />
    </div>
  );
}

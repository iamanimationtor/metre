export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="shimmer-line h-8 w-64 rounded-xl" />
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-56 rounded-3xl bg-slate-100 p-6">
            <div className="shimmer-line h-6 w-24 rounded-md" />
            <div className="mt-5 shimmer-line h-5 w-3/4 rounded-md" />
            <div className="mt-3 shimmer-line h-4 w-1/2 rounded-md" />
            <div className="mt-8 shimmer-line h-10 w-full rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}

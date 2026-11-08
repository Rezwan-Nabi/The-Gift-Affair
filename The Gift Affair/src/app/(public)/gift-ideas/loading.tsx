export default function Loading() {
  return (
    <div className="container-page py-16" aria-busy="true" aria-label="Loading gifts">
      <div className="h-12 w-72 animate-pulse rounded-full bg-plum/8" />
      <ul className="mt-12 grid grid-cols-1 gap-x-6 gap-y-10 min-[420px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <li key={i}>
            <div className="aspect-[4/5] animate-pulse rounded-[var(--radius-card)] bg-plum/8" />
            <div className="mt-4 h-5 w-3/4 animate-pulse rounded bg-plum/8" />
            <div className="mt-2 h-4 w-full animate-pulse rounded bg-plum/6" />
          </li>
        ))}
      </ul>
    </div>
  );
}

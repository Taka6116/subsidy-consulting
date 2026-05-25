export default function LoadingSubsidiesLpIndex() {
  return (
    <div className="min-h-[100svh] bg-[#F4F7FB] pt-20 font-body">
      <div className="mx-auto max-w-6xl animate-pulse px-4 py-10 sm:px-6 lg:px-8">
        <div className="h-10 w-2/3 max-w-lg rounded-lg bg-slate-200" />
        <div className="mt-4 h-5 w-full max-w-2xl rounded bg-slate-100" />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 rounded-2xl bg-white shadow-sm ring-1 ring-slate-100" />
          ))}
        </div>
      </div>
    </div>
  );
}

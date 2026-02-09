export default function Loading() {
  return (
    <div className="p-6 max-w-6xl mx-auto font-inter animate-pulse">
      <div className="flex flex-col md:flex-row items-start justify-between gap-8">
        <div className="flex-1 w-full">
          <div className="h-10 w-3/4 rounded-xl bg-slate-200" />
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div className="h-6 w-56 rounded-full bg-slate-200" />
            <div className="h-6 w-32 rounded-full bg-slate-200" />
          </div>
        </div>
        <div className="h-12 w-40 rounded-xl bg-indigo-100" />
      </div>

      <div className="mt-8 aspect-video w-full rounded-xl bg-slate-200" />

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="h-24 rounded-xl bg-slate-200" />
        <div className="h-24 rounded-xl bg-slate-200" />
      </div>

      <div className="mt-10">
        <div className="h-8 w-36 rounded-xl bg-slate-200" />
        <div className="mt-4 h-28 rounded-xl bg-slate-200" />
      </div>

      <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-8 w-40 rounded-xl bg-slate-200" />
          <div className="h-72 rounded-xl bg-slate-200" />
        </div>
        <div className="space-y-4">
          <div className="h-8 w-32 rounded-xl bg-slate-200" />
          <div className="h-40 rounded-xl bg-slate-200" />
        </div>
      </div>

      <div className="mt-16">
        <div className="h-8 w-44 rounded-xl bg-slate-200" />
        <div className="mt-4 h-32 rounded-xl bg-slate-200" />
      </div>
    </div>
  );
}

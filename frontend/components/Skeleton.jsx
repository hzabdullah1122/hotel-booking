// Shimmering placeholders shaped like the real content, shown while data loads.

export const Sk = ({ className = "", style }) => <div style={style} className={`sk rounded-md ${className}`} aria-hidden="true" />;

const Busy = ({ children, className = "" }) => (
  <div className={className} role="status" aria-busy="true" aria-label="Loading">
    {children}
  </div>
);

// home page grid card
export function HotelCardSkeleton() {
  return (
    <div className="card overflow-hidden" aria-hidden="true">
      <Sk className="aspect-[16/11] !rounded-none" />
      <div className="p-4">
        <div className="flex justify-between gap-3">
          <Sk className="h-5 w-2/3" />
          <Sk className="h-6 w-9" />
        </div>
        <Sk className="h-4 w-1/3 mt-3" />
        <div className="flex items-end justify-between mt-5">
          <Sk className="h-3.5 w-20" />
          <Sk className="h-6 w-24" />
        </div>
      </div>
    </div>
  );
}

// search results row
export function ResultSkeleton() {
  return (
    <article className="card overflow-hidden grid sm:grid-cols-[280px_1fr]" aria-hidden="true">
      <Sk className="h-52 sm:h-full sm:min-h-[210px] !rounded-none" />
      <div className="p-5 grid md:grid-cols-[1fr_auto] gap-5">
        <div className="space-y-3">
          <Sk className="h-3.5 w-24" />
          <Sk className="h-6 w-2/3" />
          <Sk className="h-4 w-1/2" />
          <Sk className="h-4 w-2/5 mt-4" />
          <Sk className="h-4 w-1/3" />
        </div>
        <div className="flex md:flex-col justify-between md:items-end gap-3 md:min-w-[150px]">
          <Sk className="h-9 w-28" />
          <div className="space-y-2 md:flex md:flex-col md:items-end">
            <Sk className="h-7 w-28" />
            <Sk className="h-3 w-16" />
            <Sk className="h-10 w-36 mt-2" />
          </div>
        </div>
      </div>
    </article>
  );
}

export function ResultsSkeleton({ count = 3 }) {
  return (
    <Busy className="space-y-5">
      {[...Array(count)].map((_, i) => <ResultSkeleton key={i} />)}
    </Busy>
  );
}

export function TripsSkeleton({ count = 2 }) {
  return (
    <Busy className="mt-8 space-y-5">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="card overflow-hidden grid sm:grid-cols-[200px_1fr]" aria-hidden="true">
          <Sk className="h-40 sm:h-full !rounded-none" />
          <div className="p-5 space-y-3">
            <Sk className="h-5 w-1/2" />
            <Sk className="h-4 w-1/3" />
            <Sk className="h-4 w-2/5" />
            <div className="flex justify-between pt-3">
              <Sk className="h-6 w-24" />
              <Sk className="h-8 w-20" />
            </div>
          </div>
        </div>
      ))}
    </Busy>
  );
}

export function HotelDetailSkeleton() {
  return (
    <Busy className="mx-auto max-w-7xl 2xl:max-w-[1480px] px-5 sm:px-8 py-8">
      <Sk className="h-4 w-56" />
      <div className="mt-5 flex justify-between gap-4">
        <div className="space-y-3 flex-1">
          <Sk className="h-4 w-24" />
          <Sk className="h-9 w-2/3 max-w-md" />
          <Sk className="h-4 w-1/3 max-w-xs" />
        </div>
        <Sk className="h-11 w-32" />
      </div>
      <div className="mt-6 grid gap-2 md:grid-cols-4 md:grid-rows-2 md:h-[430px] rounded-2xl overflow-hidden">
        <Sk className="h-64 md:h-full md:col-span-2 md:row-span-2 !rounded-none" />
        <Sk className="hidden md:block !rounded-none" />
        <Sk className="hidden md:block !rounded-none" />
        <Sk className="hidden md:block md:col-span-2 !rounded-none" />
      </div>
      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <Sk className="h-7 w-56" />
          <Sk className="h-4 w-full" />
          <Sk className="h-4 w-full" />
          <Sk className="h-4 w-3/4" />
          <div className="grid sm:grid-cols-2 gap-3 pt-4">
            {[...Array(6)].map((_, i) => <Sk key={i} className="h-4 w-2/3" />)}
          </div>
          <Sk className="h-7 w-40 mt-10" />
          <Sk className="h-28 w-full !rounded-xl" />
          <Sk className="h-28 w-full !rounded-xl" />
        </div>
        <div className="card p-6 self-start space-y-3">
          <Sk className="h-4 w-24" />
          <Sk className="h-9 w-40" />
          <Sk className="h-4 w-20" />
          <Sk className="h-4 w-3/4 mt-4" />
          <Sk className="h-4 w-2/3" />
          <Sk className="h-11 w-full mt-4" />
        </div>
      </div>
    </Busy>
  );
}

export function ReviewsSkeleton() {
  return (
    <Busy className="mt-5 grid md:grid-cols-3 gap-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="card p-5 space-y-3" aria-hidden="true">
          <div className="flex justify-between">
            <Sk className="h-4 w-24" />
            <Sk className="h-6 w-9" />
          </div>
          <Sk className="h-3.5 w-full" />
          <Sk className="h-3.5 w-5/6" />
        </div>
      ))}
    </Busy>
  );
}

export function DashboardSkeleton() {
  return (
    <Busy className="mx-auto max-w-7xl 2xl:max-w-[1480px] px-5 sm:px-8 py-10 grid gap-8 lg:grid-cols-[230px_1fr]">
      <div className="card p-3 self-start space-y-2">
        {[...Array(4)].map((_, i) => <Sk key={i} className="h-11 w-full !rounded-lg" />)}
      </div>
      <div className="min-w-0">
        <Sk className="h-4 w-28" />
        <Sk className="h-8 w-64 mt-3" />
        <div className="mt-7 grid grid-cols-2 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-5 space-y-3">
              <Sk className="h-3 w-24" />
              <Sk className="h-7 w-20" />
            </div>
          ))}
        </div>
        <div className="card p-6 mt-5">
          <Sk className="h-4 w-48" />
          <div className="mt-6 flex items-end gap-3 h-40">
            {[60, 30, 80, 45, 100, 55, 70].map((h, i) => <Sk key={i} className="flex-1 !rounded-t-md" style={{ height: `${h}%` }} />)}
          </div>
        </div>
        <Sk className="h-6 w-44 mt-8" />
        <div className="card mt-4 divide-y divide-line">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="px-5 py-4 flex gap-6">
              <Sk className="h-4 w-16" />
              <Sk className="h-4 w-1/4" />
              <Sk className="h-4 w-1/5" />
              <Sk className="h-4 flex-1" />
            </div>
          ))}
        </div>
      </div>
    </Busy>
  );
}

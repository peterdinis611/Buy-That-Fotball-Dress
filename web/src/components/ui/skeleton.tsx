import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-none bg-[var(--ink)]/10", className)}
      {...props}
    />
  )
}

function PegSkeleton({ count = 4, label = "Loading lots" }: { count?: number; label?: string }) {
  return (
    <div
      className="peg-wall grid grid-cols-2 gap-px bg-[var(--stud)] sm:grid-cols-3 lg:grid-cols-4"
      aria-busy="true"
      aria-label={label}
    >
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="flex flex-col items-center bg-[var(--tape)] px-3 pt-7 pb-5">
          <Skeleton className="size-2.5 rounded-full bg-[var(--hook)]/35" />
          <Skeleton className="mt-3 h-28 w-24" />
          <Skeleton className="mt-4 h-3 w-16" />
          <Skeleton className="mt-2 h-6 w-24" />
        </div>
      ))}
    </div>
  )
}

function SlipSkeleton({ label }: { label: string }) {
  return (
    <div
      className="border border-dashed border-[var(--ink)]/18 bg-[var(--tape)] px-5 py-8"
      aria-busy="true"
      aria-label={label}
    >
      <Skeleton className="h-4 w-20" />
      <Skeleton className="mt-3 h-8 w-48" />
      <Skeleton className="mt-2 h-4 w-full max-w-md" />
    </div>
  )
}

export { PegSkeleton, Skeleton, SlipSkeleton }

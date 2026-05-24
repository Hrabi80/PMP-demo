import { Brain } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
      <div className="flex w-full max-w-sm flex-col items-center gap-5 rounded-lg border bg-card px-8 py-10 text-center shadow-xl shadow-primary/10">
        <div className="relative flex h-24 w-24 items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-primary/10" />
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-primary border-r-primary/60" />
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Brain className="h-7 w-7" />
          </div>
        </div>
        <div>
          <p className="text-xl font-bold">Loading MedQCM</p>
          <p className="mt-1 text-base text-muted-foreground">Preparing your workspace...</p>
        </div>
        <div className="flex w-full gap-2" aria-hidden="true">
          <span className="h-2 flex-1 animate-pulse rounded-full bg-primary/80" />
          <span className="h-2 flex-1 animate-pulse rounded-full bg-primary/50 delay-150" />
          <span className="h-2 flex-1 animate-pulse rounded-full bg-primary/30 delay-300" />
        </div>
      </div>
    </div>
  )
}

import type { Metadata } from "next"
import Link from "next/link"
import { routes } from "@/lib/routes"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Brain, FlaskConical, ArrowRight, Clock } from "lucide-react"

export const metadata: Metadata = {
  title: "MedQCM – Medical Quiz Platform",
  description: "Practice medical QCMs and improve your knowledge with our interactive quiz platform.",
}

export default function HomePage() {
  return (
    <div className="flex flex-col items-center py-12">
      <div className="mb-12 text-center">
        <div className="mb-4 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
            <Brain className="h-8 w-8" />
          </div>
        </div>
        <h1 className="text-4xl font-bold tracking-tight">MedQCM</h1>
        <p className="mt-3 max-w-lg text-muted-foreground">
          The interactive quiz platform for medical students. Practice with curated QCMs from your professors.
        </p>
      </div>

      <div className="grid w-full max-w-2xl gap-6 sm:grid-cols-2">
        {/* QCM Module */}
        <div className="flex flex-col rounded-2xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Brain className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-semibold">QCM</h2>
          <p className="mt-2 flex-1 text-sm text-muted-foreground">
            Multiple-choice questions across all medical specialities. Practice at your own pace.
          </p>
          <Link href={routes.qcm.browse} className="mt-5">
            <Button className="w-full gap-1">
              Start practicing <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* PMP Module – Coming Soon */}
        <div className="relative flex flex-col rounded-2xl border bg-card p-6 opacity-60">
          <div className="mb-2 flex items-center gap-2">
            <Badge variant="secondary" className="gap-1 text-xs">
              <Clock className="h-3 w-3" /> Coming soon
            </Badge>
          </div>
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <FlaskConical className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-semibold">PMP</h2>
          <p className="mt-2 flex-1 text-sm text-muted-foreground">
            Patient Management Problems — complex clinical scenarios with structured answers.
          </p>
          <Button className="mt-5 w-full" disabled>
            Not available yet
          </Button>
        </div>
      </div>
    </div>
  )
}

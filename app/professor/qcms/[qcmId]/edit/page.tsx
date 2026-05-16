import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { routes } from "@/lib/routes"
import { getSpecialities } from "@/features/specialities/actions"
import { getClassLevels } from "@/features/class-levels/actions"
import { getQcmById } from "@/features/qcms/actions"
import { QcmForm } from "@/components/professor/qcm-form"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "Edit QCM – Professor – MedQCM",
}

export default async function EditQcmPage({ params }: { params: Promise<{ qcmId: string }> }) {
  const { qcmId } = await params
  const [specialities, classLevels, qcm] = await Promise.all([
    getSpecialities(),
    getClassLevels(),
    getQcmById(qcmId),
  ])

  if (!qcm) notFound()

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href={routes.professor.dashboard}>
          <Button variant="ghost" size="sm" className="gap-1">
            <ChevronLeft className="h-4 w-4" /> Back
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Edit QCM</h1>
      </div>
      <QcmForm specialities={specialities} classLevels={classLevels} existingQcm={qcm} />
    </div>
  )
}

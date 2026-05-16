import type { Metadata } from "next"
import { getSpecialities } from "@/features/specialities/actions"
import { getClassLevels } from "@/features/class-levels/actions"
import { getQcms } from "@/features/qcms/actions"
import { QcmBrowser } from "@/components/qcm/qcm-browser"

export const metadata: Metadata = {
  title: "Browse QCMs – MedQCM",
  description: "Browse and practice medical QCMs across all specialities.",
}

export default async function QcmPage() {
  const [specialities, classLevels, qcms] = await Promise.all([
    getSpecialities(),
    getClassLevels(),
    getQcms(),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">QCM Library</h1>
        <p className="text-sm text-muted-foreground">Browse and practice quizzes from all specialities.</p>
      </div>
      <QcmBrowser specialities={specialities} classLevels={classLevels} qcms={qcms} />
    </div>
  )
}

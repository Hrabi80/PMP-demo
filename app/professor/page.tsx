import type { Metadata } from "next"
import { getProfessorQcms } from "@/features/qcms/actions"
import { ProfessorQcmList } from "@/components/professor/qcm-list"

export const metadata: Metadata = {
  title: "Professor Dashboard – MedQCM",
}

export default async function ProfessorPage() {
  const qcms = await getProfessorQcms()
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Professor Dashboard</h1>
      <ProfessorQcmList initialQcms={qcms} />
    </div>
  )
}

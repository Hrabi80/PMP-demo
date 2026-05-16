import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getQcmById } from "@/features/qcms/actions"
import { getSession } from "@/lib/auth"
import { QcmPlayer } from "@/components/qcm/qcm-player"

export async function generateMetadata({ params }: { params: Promise<{ qcmId: string }> }): Promise<Metadata> {
  const { qcmId } = await params
  const qcm = await getQcmById(qcmId)
  return { title: qcm ? `${qcm.title} – MedQCM` : "QCM – MedQCM" }
}

export default async function QcmTakePage({ params }: { params: Promise<{ qcmId: string }> }) {
  const { qcmId } = await params
  const [qcm, session] = await Promise.all([getQcmById(qcmId), getSession()])

  if (!qcm) notFound()

  const isStudent = session?.role === "STUDENT"

  return (
    <div className="mx-auto max-w-2xl">
      <QcmPlayer qcm={qcm} />
    </div>
  )
}

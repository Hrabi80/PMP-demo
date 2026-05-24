import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getQcmById } from "@/features/qcms/actions"
import { QcmPlayer } from "@/components/qcm/qcm-player"

export async function generateMetadata({ params }: { params: Promise<{ qcmId: string }> }): Promise<Metadata> {
  const { qcmId } = await params
  const qcm = await getQcmById(qcmId)
  return { title: qcm ? `${qcm.title} – MedQCM` : "QCM – MedQCM" }
}

export default async function QcmTakePage({ params }: { params: Promise<{ qcmId: string }> }) {
  const { qcmId } = await params
  const qcm = await getQcmById(qcmId)

  if (!qcm) notFound()

  return (
    <div className="mx-auto max-w-4xl">
      <QcmPlayer qcm={qcm} />
    </div>
  )
}

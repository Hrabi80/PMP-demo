import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getAttemptResult } from "@/features/attempts/actions"
import { getQcmById } from "@/features/qcms/actions"
import { QcmResult } from "@/components/qcm/qcm-result"

export const metadata: Metadata = {
  title: "Result – MedQCM",
}

type SearchParams = Promise<{
  attemptId?: string
  score?: string
  total?: string
  pct?: string
  answers?: string
  qcmId?: string
}>

export default async function QcmResultPage({
  params,
  searchParams,
}: {
  params: Promise<{ qcmId: string }>
  searchParams: SearchParams
}) {
  const { qcmId } = await params
  const sp = await searchParams

  // Case 1: Persisted attempt (logged-in student)
  if (sp.attemptId) {
    const attempt = await getAttemptResult(sp.attemptId)
    if (!attempt) notFound()

    const answers = attempt.answers.map((a) => ({
      questionText: a.question.questionText,
      options: a.question.options,
      selectedOptionIds: a.selectedOptionIds as string[],
    }))

    return (
      <div className="mx-auto max-w-2xl">
        <QcmResult
          qcmId={qcmId}
          qcmTitle={attempt.qcm.title}
          score={attempt.score}
          total={attempt.totalQuestions}
          percentage={attempt.percentage}
          answers={answers}
        />
      </div>
    )
  }

  // Case 2: Guest result via query params
  if (sp.score !== undefined && sp.answers) {
    const qcm = await getQcmById(qcmId)
    if (!qcm) notFound()

    const guestAnswers = JSON.parse(decodeURIComponent(sp.answers)) as Array<{
      questionId: string
      selectedOptionIds: string[]
    }>

    const answers = qcm.questions.map((q) => {
      const found = guestAnswers.find((a) => a.questionId === q.id)
      return {
        questionText: q.questionText,
        options: q.options,
        selectedOptionIds: found?.selectedOptionIds ?? [],
      }
    })

    return (
      <div className="mx-auto max-w-2xl">
        <QcmResult
          qcmId={qcmId}
          qcmTitle={qcm.title}
          score={parseInt(sp.score)}
          total={parseInt(sp.total ?? "0")}
          percentage={parseFloat(sp.pct ?? "0")}
          answers={answers}
        />
      </div>
    )
  }

  notFound()
}

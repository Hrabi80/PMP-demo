"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { submitAttempt } from "@/features/attempts/actions"
import { routes } from "@/lib/routes"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import { CheckCircle2, Send } from "lucide-react"
import { QuestionType } from "@prisma/client"

type Option = { id: string; text: string; isCorrect: boolean; order: number }
type Question = { id: string; questionText: string; type: QuestionType; order: number; options: Option[] }
type Qcm = {
  id: string
  title: string
  description: string
  professor: { fullName: string }
  questions: Question[]
}

export function QcmPlayer({ qcm }: { qcm: Qcm }) {
  const router = useRouter()
  const [answers, setAnswers] = useState<Record<string, string[]>>({})
  const [submitting, setSubmitting] = useState(false)

  function selectOption(questionId: string, optionId: string, type: QuestionType) {
    if (type === "SINGLE_CHOICE") {
      setAnswers((prev) => ({ ...prev, [questionId]: [optionId] }))
    } else {
      setAnswers((prev) => {
        const current = prev[questionId] ?? []
        const exists = current.includes(optionId)
        return {
          ...prev,
          [questionId]: exists ? current.filter((id) => id !== optionId) : [...current, optionId],
        }
      })
    }
  }

  async function handleSubmit() {
    setSubmitting(true)
    const answerList = qcm.questions.map((q) => ({
      questionId: q.id,
      selectedOptionIds: answers[q.id] ?? [],
    }))

    const result = await submitAttempt(qcm.id, answerList)

    if (result && "attemptId" in result && result.attemptId) {
      router.push(`${routes.qcm.result(qcm.id)}?attemptId=${result.attemptId}`)
    } else if (result) {
      // Guest: pass result via query params
      router.push(
        `${routes.qcm.result(qcm.id)}?score=${result.score}&total=${result.totalQuestions}&pct=${Math.round(result.percentage)}&answers=${encodeURIComponent(JSON.stringify(answerList))}&qcmId=${qcm.id}`
      )
    }
  }

  const answeredCount = qcm.questions.filter((q) => (answers[q.id]?.length ?? 0) > 0).length

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-card p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">{qcm.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{qcm.description}</p>
          </div>
          <Badge variant="secondary">by {qcm.professor.fullName}</Badge>
        </div>
        <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
          <CheckCircle2 className="h-4 w-4" />
          {answeredCount} / {qcm.questions.length} answered
        </div>
      </div>

      {qcm.questions.map((q, idx) => (
        <Card key={q.id}>
          <CardHeader className="pb-3">
            <div className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                {idx + 1}
              </span>
              <div>
                <CardTitle className="text-base leading-snug">{q.questionText}</CardTitle>
                <Badge variant="outline" className="mt-1 text-xs">
                  {q.type === "SINGLE_CHOICE" ? "Single answer" : "Multiple answers"}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {q.options.map((o) => {
                const selected = (answers[q.id] ?? []).includes(o.id)
                return (
                  <button
                    key={o.id}
                    onClick={() => selectOption(q.id, o.id, q.type)}
                    className={`w-full rounded-lg border px-4 py-2.5 text-left text-sm transition-colors ${
                      selected
                        ? "border-primary bg-primary/10 text-primary"
                        : "hover:border-primary/40 hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-${q.type === "SINGLE_CHOICE" ? "full" : "sm"} border ${selected ? "border-primary bg-primary" : "border-muted-foreground"}`}>
                        {selected && <span className="block h-2 w-2 rounded-full bg-white" />}
                      </span>
                      {o.text}
                    </div>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="flex items-center justify-between rounded-xl border bg-card px-5 py-4">
        <p className="text-sm text-muted-foreground">
          {answeredCount < qcm.questions.length
            ? `${qcm.questions.length - answeredCount} question(s) unanswered`
            : "All questions answered ✓"}
        </p>
        <Button onClick={handleSubmit} disabled={submitting} className="gap-1">
          <Send className="h-4 w-4" />
          {submitting ? "Submitting…" : "Submit answers"}
        </Button>
      </div>
    </div>
  )
}

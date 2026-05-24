"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { submitAttempt } from "@/features/attempts/actions"
import { routes } from "@/lib/routes"
import { cn } from "@/lib/utils"
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
      <div className="rounded-lg border bg-card p-6 shadow-lg shadow-primary/5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold leading-tight">{qcm.title}</h1>
            <p className="mt-2 text-lg leading-relaxed text-muted-foreground">{qcm.description}</p>
          </div>
          <Badge variant="secondary">by {qcm.professor.fullName}</Badge>
        </div>
        <div className="mt-4 flex items-center gap-2 text-base font-medium text-muted-foreground">
          <CheckCircle2 className="h-5 w-5" />
          {answeredCount} / {qcm.questions.length} answered
        </div>
      </div>

      {qcm.questions.map((q, idx) => (
        <Card key={q.id}>
          <CardHeader className="pb-3">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-base font-bold text-primary-foreground shadow-sm">
                {idx + 1}
              </span>
              <div>
                <CardTitle className="text-2xl leading-snug">{q.questionText}</CardTitle>
                <Badge variant="outline" className="mt-2">
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
                    className={`w-full rounded-lg border px-5 py-4 text-left text-lg font-medium leading-relaxed shadow-sm transition-colors ${
                      selected
                        ? "border-primary bg-primary/10 text-primary shadow-primary/10"
                        : "bg-background hover:border-primary/40 hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "flex h-6 w-6 shrink-0 items-center justify-center border-2",
                          q.type === "SINGLE_CHOICE" ? "rounded-full" : "rounded-sm",
                          selected ? "border-primary bg-primary" : "border-muted-foreground/60 bg-card"
                        )}
                      >
                        {selected && <span className="block h-3 w-3 rounded-full bg-white" />}
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

      <div className="flex items-center justify-between rounded-lg border bg-card px-6 py-5 shadow-lg shadow-primary/5">
        <p className="text-base font-medium text-muted-foreground">
          {answeredCount < qcm.questions.length
            ? `${qcm.questions.length - answeredCount} question(s) unanswered`
            : "All questions answered"}
        </p>
        <Button onClick={handleSubmit} disabled={submitting} className="gap-1">
          <Send className="h-4 w-4" />
          {submitting ? "Submitting…" : "Submit answers"}
        </Button>
      </div>
    </div>
  )
}

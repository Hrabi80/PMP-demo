"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { submitAttempt } from "@/features/attempts/actions"
import { routes } from "@/lib/routes"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import { CheckCircle2, ChevronLeft, ChevronRight, Send } from "lucide-react"
import { QuestionType } from "@prisma/client"

type Option = { id: string; text: string; isCorrect: boolean; order: number }
type Question = { id: string; questionText: string; type: QuestionType; points: number; order: number; options: Option[] }
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
  const [currentIndex, setCurrentIndex] = useState(0)
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
        `${routes.qcm.result(qcm.id)}?score=${result.score}&total=${result.totalPoints}&pct=${Math.round(result.percentage)}&answers=${encodeURIComponent(JSON.stringify(answerList))}&qcmId=${qcm.id}`
      )
    } else {
      setSubmitting(false)
    }
  }

  const currentQuestion = qcm.questions[currentIndex]
  const answeredCount = qcm.questions.filter((q) => (answers[q.id]?.length ?? 0) > 0).length
  const totalPoints = qcm.questions.reduce((sum, q) => sum + q.points, 0)
  const currentAnswerCount = currentQuestion ? (answers[currentQuestion.id]?.length ?? 0) : 0
  const isLastQuestion = currentIndex === qcm.questions.length - 1

  if (!currentQuestion) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          This QCM does not have any questions yet.
        </CardContent>
      </Card>
    )
  }

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
        <div className="mt-4 flex flex-wrap items-center gap-3 text-base font-medium text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            {answeredCount} / {qcm.questions.length} answered
          </span>
          <Badge variant="outline">{totalPoints} total points</Badge>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="mb-2 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {qcm.questions.map((q, idx) => {
                const answered = (answers[q.id]?.length ?? 0) > 0
                const active = idx === currentIndex
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    aria-label={`Go to question ${idx + 1}`}
                    className={cn(
                      "h-2.5 rounded-full transition-all",
                      active ? "w-8 bg-primary" : answered ? "w-2.5 bg-primary/50" : "w-2.5 bg-muted-foreground/30"
                    )}
                  />
                )
              })}
            </div>
            <Badge variant="outline">
              Question {currentIndex + 1} of {qcm.questions.length}
            </Badge>
          </div>

          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-base font-bold text-primary-foreground shadow-sm">
              {currentIndex + 1}
            </span>
            <div>
              <CardTitle className="text-2xl leading-snug">{currentQuestion.questionText}</CardTitle>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant="outline">
                  {currentQuestion.type === "SINGLE_CHOICE" ? "Single answer" : "Multiple answers"}
                </Badge>
                <Badge variant="secondary">
                  {currentQuestion.points} {currentQuestion.points === 1 ? "point" : "points"}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {currentQuestion.options.map((o) => {
              const selected = (answers[currentQuestion.id] ?? []).includes(o.id)
              return (
                <button
                  key={o.id}
                  onClick={() => selectOption(currentQuestion.id, o.id, currentQuestion.type)}
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
                        currentQuestion.type === "SINGLE_CHOICE" ? "rounded-full" : "rounded-sm",
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

      <div className="flex flex-col gap-3 rounded-lg border bg-card px-6 py-5 shadow-lg shadow-primary/5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-base font-medium text-muted-foreground">
          {isLastQuestion
            ? answeredCount < qcm.questions.length
              ? `${qcm.questions.length - answeredCount} question(s) unanswered`
              : "All questions answered"
            : currentAnswerCount > 0
              ? "Current question answered"
              : "Current question unanswered"}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setCurrentIndex((idx) => Math.max(0, idx - 1))}
            disabled={currentIndex === 0}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>

          {isLastQuestion ? (
            <Button onClick={handleSubmit} disabled={submitting} className="gap-1">
              <Send className="h-4 w-4" />
              {submitting ? "Submitting..." : "Submit answers"}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() => setCurrentIndex((idx) => Math.min(qcm.questions.length - 1, idx + 1))}
              className="gap-1"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

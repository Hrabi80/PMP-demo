"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { submitAttempt } from "@/features/attempts/actions"
import { routes } from "@/lib/routes"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import { Award, CheckCircle2, ChevronLeft, ChevronRight, Send, UserRound } from "lucide-react"
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
  const [transitionDirection, setTransitionDirection] = useState<"forward" | "backward">("forward")
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

  function goToQuestion(nextIndex: number) {
    setTransitionDirection(nextIndex >= currentIndex ? "forward" : "backward")
    setCurrentIndex(nextIndex)
  }

  const currentQuestion = qcm.questions[currentIndex]
  const answeredCount = qcm.questions.filter((q) => (answers[q.id]?.length ?? 0) > 0).length
  const totalPoints = qcm.questions.reduce((sum, q) => sum + q.points, 0)
  const currentAnswerCount = currentQuestion ? (answers[currentQuestion.id]?.length ?? 0) : 0
  const isLastQuestion = currentIndex === qcm.questions.length - 1
  const completionPercent = Math.round((answeredCount / qcm.questions.length) * 100)

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
    <div className="grid gap-5 lg:grid-cols-[19rem_minmax(0,1fr)] lg:items-start">
      <aside className="rounded-lg border bg-card p-5 shadow-lg shadow-primary/5 lg:sticky lg:top-24">
        <div className="space-y-4">
          <div className="space-y-2">
            <Badge variant="secondary" className="gap-1.5">
              <UserRound className="h-3.5 w-3.5" />
              {qcm.professor.fullName}
            </Badge>
            <h1 className="text-2xl font-bold leading-tight lg:text-3xl">{qcm.title}</h1>
            <p className="line-clamp-4 text-base leading-relaxed text-muted-foreground">
              {qcm.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
            <div className="rounded-lg border bg-background px-4 py-3">
              <p className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <CheckCircle2 className="h-4 w-4" />
                Answered
              </p>
              <p className="mt-1 text-2xl font-bold leading-none">
                {answeredCount}
                <span className="text-base font-semibold text-muted-foreground"> / {qcm.questions.length}</span>
              </p>
            </div>
            <div className="rounded-lg border bg-background px-4 py-3">
              <p className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <Award className="h-4 w-4" />
                Points
              </p>
              <p className="mt-1 text-2xl font-bold leading-none">{totalPoints}</p>
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-3 text-sm font-semibold text-muted-foreground">
              <span>Completion</span>
              <span>{completionPercent}%</span>
            </div>
            <div
              className="h-3 w-full overflow-hidden rounded-full bg-muted"
              aria-label={`${completionPercent}% answered`}
              role="progressbar"
              aria-valuenow={completionPercent}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
          </div>
        </div>
      </aside>

      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-base font-semibold text-muted-foreground">
                  Question {currentIndex + 1} of {qcm.questions.length}
                </p>
                <Badge variant={currentAnswerCount > 0 ? "secondary" : "outline"}>
                  {currentAnswerCount > 0 ? "Answered" : "Unanswered"}
                </Badge>
              </div>
              <div
                className="grid w-full gap-1.5"
                style={{ gridTemplateColumns: "repeat(auto-fit, minmax(0.75rem, 1fr))" }}
              >
                {qcm.questions.map((q, idx) => {
                  const answered = (answers[q.id]?.length ?? 0) > 0
                  const active = idx === currentIndex
                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => goToQuestion(idx)}
                      aria-label={`Go to question ${idx + 1}`}
                      aria-current={active ? "step" : undefined}
                      className={cn(
                        "h-3 min-w-0 rounded-full transition-colors duration-200",
                        active
                          ? "bg-primary ring-2 ring-primary/30 ring-offset-2 ring-offset-card"
                          : answered
                            ? "bg-primary/55"
                            : "bg-muted-foreground/25"
                      )}
                    />
                  )
                })}
              </div>
            </div>
          </CardHeader>

          <div
            key={currentQuestion.id}
            className={cn(
              "motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-300",
              transitionDirection === "forward"
                ? "motion-safe:slide-in-from-right-4"
                : "motion-safe:slide-in-from-left-4"
            )}
          >
            <CardHeader className="pt-0 pb-3">
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
          </div>
        </Card>

        <div className="flex flex-col gap-3 rounded-lg border bg-card px-5 py-4 shadow-lg shadow-primary/5 sm:flex-row sm:items-center sm:justify-between">
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
              onClick={() => goToQuestion(Math.max(0, currentIndex - 1))}
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
                onClick={() => goToQuestion(Math.min(qcm.questions.length - 1, currentIndex + 1))}
                className="gap-1"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

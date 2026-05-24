"use client"

import Link from "next/link"
import { routes } from "@/lib/routes"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import { CheckCircle2, XCircle, MinusCircle, Trophy, RotateCcw } from "lucide-react"

type Option = { id: string; text: string; isCorrect: boolean }
type AnswerResult = {
  questionText: string
  points: number
  options: Option[]
  selectedOptionIds: string[]
}

type ResultProps = {
  qcmId: string
  qcmTitle: string
  score: number
  total: number
  percentage: number
  answers: AnswerResult[]
}

export function QcmResult({ qcmId, qcmTitle, score, total, percentage, answers }: ResultProps) {
  const pct = Math.round(percentage)
  const passed = pct >= 50

  return (
    <div className="space-y-6">
      {/* Score card */}
      <Card className={`border-2 ${passed ? "border-green-500/30 bg-green-50/80" : "border-red-500/30 bg-red-50/80"}`}>
        <CardContent className="py-8 text-center">
          <div className={`mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full ${passed ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
            <Trophy className="h-8 w-8" />
          </div>
          <h2 className="text-3xl font-bold">
            {score}/{total} pts
          </h2>
          <p className="mt-1 text-lg font-medium text-muted-foreground">{pct}%</p>
          <p className={`mt-2 text-base font-semibold ${passed ? "text-green-600" : "text-red-500"}`}>
            {pct >= 80 ? "Excellent" : pct >= 60 ? "Good job" : pct >= 50 ? "Passed" : "Keep studying"}
          </p>
          <p className="mt-1 text-base text-muted-foreground">{qcmTitle}</p>
        </CardContent>
      </Card>

      {/* Correction */}
      <div>
        <h3 className="mb-3 text-2xl font-semibold">Correction</h3>
        <div className="space-y-4">
          {answers.map((a, idx) => {
            const correctIds = a.options.filter((o) => o.isCorrect).map((o) => o.id)
            const selectedIds = a.selectedOptionIds

            const isFullyCorrect =
              correctIds.length === selectedIds.length &&
              correctIds.every((id) => selectedIds.includes(id))

            return (
              <Card key={idx}>
                <CardHeader className="pb-2">
                  <div className="flex items-start gap-2">
                    {isFullyCorrect ? (
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                    ) : (
                      <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
                    )}
                    <div className="space-y-2">
                      <CardTitle className="text-xl font-semibold leading-snug">
                        Q{idx + 1}. {a.questionText}
                      </CardTitle>
                      <Badge variant="secondary">
                        {a.points} {a.points === 1 ? "point" : "points"}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1.5">
                    {a.options.map((o) => {
                      const isSelected = selectedIds.includes(o.id)
                      const isCorrect = o.isCorrect

                      let className = "flex items-center gap-3 rounded-lg px-4 py-3 text-lg font-medium leading-relaxed "
                      let Icon = MinusCircle
                      let iconClass = "text-muted-foreground"

                      if (isCorrect && isSelected) {
                        className += "bg-green-100"
                        Icon = CheckCircle2
                        iconClass = "text-green-500"
                      } else if (!isCorrect && isSelected) {
                        className += "bg-red-100"
                        Icon = XCircle
                        iconClass = "text-red-500"
                      } else if (isCorrect && !isSelected) {
                        className += "bg-yellow-50"
                        Icon = CheckCircle2
                        iconClass = "text-yellow-500"
                      } else {
                        className += "bg-muted/30"
                      }

                      return (
                        <div key={o.id} className={className}>
                          <Icon className={`h-5 w-5 shrink-0 ${iconClass}`} />
                          <span>{o.text}</span>
                          {isCorrect && !isSelected && (
                            <Badge variant="outline" className="ml-auto text-yellow-600">Missed</Badge>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      <div className="flex gap-3">
        <Link href={routes.qcm.take(qcmId)}>
          <Button variant="outline" className="gap-1">
            <RotateCcw className="h-4 w-4" /> Try again
          </Button>
        </Link>
        <Link href={routes.qcm.browse}>
          <Button variant="outline">Browse QCMs</Button>
        </Link>
      </div>
    </div>
  )
}

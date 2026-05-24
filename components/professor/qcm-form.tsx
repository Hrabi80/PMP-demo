"use client"

import { useState } from "react"

import { createQcm, updateQcm } from "@/features/qcms/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Plus, Trash2, ChevronLeft, ChevronRight, Save } from "lucide-react"
import { QuestionType } from "@prisma/client"

type Option = { text: string; isCorrect: boolean; order: number }
type Question = { questionText: string; type: QuestionType; points: number; order: number; options: Option[] }

type Speciality = { id: string; name: string }
type ClassLevel = { id: string; name: string; specialityId: string }

type ExistingQcm = {
  id: string
  title: string
  description: string
  year: number
  specialityId: string
  classLevelId: string
  questions: Array<{
    id: string
    questionText: string
    type: QuestionType
    points: number
    order: number
    options: Array<{ id: string; text: string; isCorrect: boolean; order: number }>
  }>
}

function emptyOption(order: number): Option {
  return { text: "", isCorrect: false, order }
}

const FIXED_OPTION_COUNT = 5

function fixedOptions(options: Option[] = []) {
  const normalized = options
    .slice(0, FIXED_OPTION_COUNT)
    .map((option, index) => ({ ...option, order: index + 1 }))

  while (normalized.length < FIXED_OPTION_COUNT) {
    normalized.push(emptyOption(normalized.length + 1))
  }

  return normalized
}

function emptyQuestion(order: number): Question {
  return {
    questionText: "",
    type: "SINGLE_CHOICE",
    points: 1,
    order,
    options: fixedOptions(),
  }
}

export function QcmForm({
  specialities,
  classLevels,
  existingQcm,
  enforceFiveOptions = true,
}: {
  specialities: Speciality[]
  classLevels: ClassLevel[]
  existingQcm?: ExistingQcm
  enforceFiveOptions?: boolean
}) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Step 1 fields
  const [title, setTitle] = useState(existingQcm?.title ?? "")
  const [description, setDescription] = useState(existingQcm?.description ?? "")
  const [year, setYear] = useState(existingQcm?.year?.toString() ?? new Date().getFullYear().toString())
  const [specialityId, setSpecialityId] = useState(existingQcm?.specialityId ?? "")
  const [classLevelId, setClassLevelId] = useState(existingQcm?.classLevelId ?? "")

  // Step 2 fields
  const [questions, setQuestions] = useState<Question[]>(
    existingQcm
      ? existingQcm.questions.map((q) => ({
          questionText: q.questionText,
          type: q.type,
          points: q.points,
          order: q.order,
          options: enforceFiveOptions
            ? fixedOptions(q.options.map((o) => ({ text: o.text, isCorrect: o.isCorrect, order: o.order })))
            : q.options.map((o) => ({ text: o.text, isCorrect: o.isCorrect, order: o.order })),
        }))
      : [emptyQuestion(1)]
  )

  const filteredClassLevels = classLevels.filter((cl) => cl.specialityId === specialityId)
  const specialityItems = specialities.map((s) => ({ value: s.id, label: s.name }))
  const classLevelItems = filteredClassLevels.map((cl) => ({ value: cl.id, label: cl.name }))
  const questionTypeItems = [
    { value: "SINGLE_CHOICE", label: "Single choice" },
    { value: "MULTIPLE_CHOICE", label: "Multiple choice" },
  ]

  function addQuestion() {
    setQuestions((prev) => [...prev, emptyQuestion(prev.length + 1)])
  }

  function removeQuestion(idx: number) {
    setQuestions((prev) => prev.filter((_, i) => i !== idx).map((q, i) => ({ ...q, order: i + 1 })))
  }

  function updateQuestion(idx: number, field: keyof Question, value: string | number | QuestionType) {
    setQuestions((prev) => prev.map((q, i) => (i === idx ? { ...q, [field]: value } : q)))
  }

  function updateQuestionPoints(idx: number, value: string) {
    const parsed = Number.parseInt(value, 10)
    updateQuestion(idx, "points", Number.isFinite(parsed) ? Math.max(1, parsed) : 1)
  }

  function addOption(qIdx: number) {
    if (enforceFiveOptions) return

    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIdx
          ? { ...q, options: [...q.options, emptyOption(q.options.length + 1)] }
          : q
      )
    )
  }

  function removeOption(qIdx: number, oIdx: number) {
    if (enforceFiveOptions) return

    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIdx
          ? { ...q, options: q.options.filter((_, j) => j !== oIdx).map((o, j) => ({ ...o, order: j + 1 })) }
          : q
      )
    )
  }

  function updateOption(qIdx: number, oIdx: number, field: keyof Option, value: string | boolean) {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIdx
          ? { ...q, options: q.options.map((o, j) => (j === oIdx ? { ...o, [field]: value } : o)) }
          : q
      )
    )
  }

  function toggleCorrect(qIdx: number, oIdx: number) {
    const q = questions[qIdx]
    if (q.type === "SINGLE_CHOICE") {
      // Only one can be correct
      setQuestions((prev) =>
        prev.map((q, i) =>
          i === qIdx
            ? { ...q, options: q.options.map((o, j) => ({ ...o, isCorrect: j === oIdx })) }
            : q
        )
      )
    } else {
      updateOption(qIdx, oIdx, "isCorrect", !q.options[oIdx].isCorrect)
    }
  }

  async function handleSubmit() {
    setError("")
    setLoading(true)

    const data = {
      title,
      description,
      year: parseInt(year),
      specialityId,
      classLevelId,
      questions: enforceFiveOptions
        ? questions.map((q) => ({ ...q, options: fixedOptions(q.options) }))
        : questions,
    }

    if (enforceFiveOptions) {
      const invalidQuestionIndex = data.questions.findIndex((q) => q.options.length !== FIXED_OPTION_COUNT)
      if (invalidQuestionIndex !== -1) {
        setError(`Question ${invalidQuestionIndex + 1} must have exactly ${FIXED_OPTION_COUNT} options.`)
        setLoading(false)
        return
      }
    }

    const invalidPointsIndex = data.questions.findIndex((q) => !Number.isFinite(q.points) || q.points <= 0)
    if (invalidPointsIndex !== -1) {
      setError(`Question ${invalidPointsIndex + 1} must have a positive point value.`)
      setLoading(false)
      return
    }

    const result = existingQcm
      ? await updateQcm(existingQcm.id, data)
      : await createQcm(data)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    setLoading(false)
  }

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center gap-3">
        <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${step === 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>1</div>
        <div className="h-px flex-1 bg-border" />
        <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${step === 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>2</div>
      </div>

      {step === 1 && (
        <Card>
          <CardHeader><CardTitle className="text-xl">QCM Details</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-1">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Cardiac Anatomy Basics" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief overview…" rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Speciality</Label>
                <Select items={specialityItems} value={specialityId} onValueChange={(v) => { setSpecialityId(v || ""); setClassLevelId("") }}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>
                    {specialities.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Class Level</Label>
                <Select items={classLevelItems} value={classLevelId} onValueChange={(v) => setClassLevelId(v || "")} disabled={!specialityId}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Select speciality first" /></SelectTrigger>
                  <SelectContent>
                    {filteredClassLevels.map((cl) => <SelectItem key={cl.id} value={cl.id}>{cl.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="year">Year</Label>
              <Input id="year" type="number" value={year} onChange={(e) => setYear(e.target.value)} min={2000} max={2099} />
            </div>
            <div className="flex justify-end">
              <Button
                onClick={() => setStep(2)}
                disabled={!title || !specialityId || !classLevelId || !year}
                className="gap-1"
              >
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <div className="space-y-4">
          {error && <p className="text-sm text-destructive">{error}</p>}

          {questions.map((q, qIdx) => (
            <Card key={qIdx}>
              <CardHeader className="pb-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <CardTitle className="text-xl">Question {qIdx + 1}</CardTitle>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2">
                      <Label htmlFor={`question-${qIdx}-points`} className="text-sm text-muted-foreground">
                        Points
                      </Label>
                      <Input
                        id={`question-${qIdx}-points`}
                        type="number"
                        min={1}
                        max={100}
                        value={q.points}
                        onChange={(e) => updateQuestionPoints(qIdx, e.target.value)}
                        className="h-8 w-20 px-2 text-center text-base"
                      />
                    </div>
                    <Select items={questionTypeItems} value={q.type} onValueChange={(v) => updateQuestion(qIdx, "type", (v as QuestionType) || "SINGLE_CHOICE")}>
                      <SelectTrigger className="h-10 w-44 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SINGLE_CHOICE">Single choice</SelectItem>
                        <SelectItem value="MULTIPLE_CHOICE">Multiple choice</SelectItem>
                      </SelectContent>
                    </Select>
                    {questions.length > 1 && (
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => removeQuestion(qIdx)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={q.questionText}
                  onChange={(e) => updateQuestion(qIdx, "questionText", e.target.value)}
                  placeholder="Enter question text…"
                  rows={3}
                  className="text-lg leading-relaxed"
                />
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm text-muted-foreground">Options</Label>
                    <Badge variant="outline" className="text-xs">
                      {enforceFiveOptions
                        ? "Exactly 5 options"
                        : q.type === "SINGLE_CHOICE"
                          ? "Toggle correct answer"
                          : "Toggle all correct answers"}
                    </Badge>
                  </div>
                  {q.options.map((o, oIdx) => (
                    <div key={oIdx} className="flex items-center gap-3 rounded-lg border bg-background p-2">
                      <Switch
                        checked={o.isCorrect}
                        onCheckedChange={() => toggleCorrect(qIdx, oIdx)}
                        className="data-checked:bg-green-500"
                      />
                      <Input
                        value={o.text}
                        onChange={(e) => updateOption(qIdx, oIdx, "text", e.target.value)}
                        placeholder={`Option ${oIdx + 1}`}
                        className="h-11 flex-1 text-base"
                      />
                      {!enforceFiveOptions && q.options.length > 2 && (
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground" onClick={() => removeOption(qIdx, oIdx)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  ))}
                  {!enforceFiveOptions && (
                    <Button variant="outline" size="sm" className="gap-1" onClick={() => addOption(qIdx)}>
                      <Plus className="h-3.5 w-3.5" /> Add option
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          <Button variant="outline" className="w-full gap-1" onClick={addQuestion}>
            <Plus className="h-4 w-4" /> Add question
          </Button>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)} className="gap-1">
              <ChevronLeft className="h-4 w-4" /> Back
            </Button>
            <Button onClick={handleSubmit} disabled={loading} className="gap-1">
              <Save className="h-4 w-4" />
              {loading ? "Saving…" : existingQcm ? "Save changes" : "Create QCM"}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

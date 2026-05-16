"use client"

import { useState, useEffect } from "react"

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
type Question = { questionText: string; type: QuestionType; order: number; options: Option[] }

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
    order: number
    options: Array<{ id: string; text: string; isCorrect: boolean; order: number }>
  }>
}

function emptyOption(order: number): Option {
  return { text: "", isCorrect: false, order }
}

function emptyQuestion(order: number): Question {
  return {
    questionText: "",
    type: "SINGLE_CHOICE",
    order,
    options: [emptyOption(1), emptyOption(2), emptyOption(3), emptyOption(4)],
  }
}

export function QcmForm({
  specialities,
  classLevels,
  existingQcm,
}: {
  specialities: Speciality[]
  classLevels: ClassLevel[]
  existingQcm?: ExistingQcm
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
          order: q.order,
          options: q.options.map((o) => ({ text: o.text, isCorrect: o.isCorrect, order: o.order })),
        }))
      : [emptyQuestion(1)]
  )

  const filteredClassLevels = classLevels.filter((cl) => cl.specialityId === specialityId)


  function addQuestion() {
    setQuestions((prev) => [...prev, emptyQuestion(prev.length + 1)])
  }

  function removeQuestion(idx: number) {
    setQuestions((prev) => prev.filter((_, i) => i !== idx).map((q, i) => ({ ...q, order: i + 1 })))
  }

  function updateQuestion(idx: number, field: keyof Question, value: string | QuestionType) {
    setQuestions((prev) => prev.map((q, i) => (i === idx ? { ...q, [field]: value } : q)))
  }

  function addOption(qIdx: number) {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIdx
          ? { ...q, options: [...q.options, emptyOption(q.options.length + 1)] }
          : q
      )
    )
  }

  function removeOption(qIdx: number, oIdx: number) {
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
      questions,
    }

    if (existingQcm) {
      await updateQcm(existingQcm.id, data)
    } else {
      await createQcm(data)
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
          <CardHeader><CardTitle>QCM Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
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
                <Select value={specialityId} onValueChange={(v) => { setSpecialityId(v || ""); setClassLevelId("") }}>
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>
                    {specialities.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Class Level</Label>
                <Select value={classLevelId} onValueChange={(v) => setClassLevelId(v || "")} disabled={!specialityId}>
                  <SelectTrigger><SelectValue placeholder="Select speciality first" /></SelectTrigger>
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
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Question {qIdx + 1}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Select value={q.type} onValueChange={(v) => updateQuestion(qIdx, "type", (v as QuestionType) || "SINGLE_CHOICE")}>
                      <SelectTrigger className="h-7 w-40 text-xs">
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
              <CardContent className="space-y-3">
                <Textarea
                  value={q.questionText}
                  onChange={(e) => updateQuestion(qIdx, "questionText", e.target.value)}
                  placeholder="Enter question text…"
                  rows={2}
                />
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-muted-foreground">Options</Label>
                    <Badge variant="outline" className="text-xs">
                      {q.type === "SINGLE_CHOICE" ? "Toggle correct answer" : "Toggle all correct answers"}
                    </Badge>
                  </div>
                  {q.options.map((o, oIdx) => (
                    <div key={oIdx} className="flex items-center gap-2">
                      <Switch
                        checked={o.isCorrect}
                        onCheckedChange={() => toggleCorrect(qIdx, oIdx)}
                        className="data-[state=checked]:bg-green-500"
                      />
                      <Input
                        value={o.text}
                        onChange={(e) => updateOption(qIdx, oIdx, "text", e.target.value)}
                        placeholder={`Option ${oIdx + 1}`}
                        className="flex-1"
                      />
                      {q.options.length > 2 && (
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground" onClick={() => removeOption(qIdx, oIdx)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="gap-1" onClick={() => addOption(qIdx)}>
                    <Plus className="h-3.5 w-3.5" /> Add option
                  </Button>
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

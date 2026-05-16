"use client"

import Link from "next/link"
import { useState } from "react"
import { deleteQcm } from "@/features/qcms/actions"
import { routes } from "@/lib/routes"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2, Plus, BookOpen } from "lucide-react"

type Qcm = {
  id: string
  title: string
  description: string
  year: number
  speciality: { name: string }
  classLevel: { name: string }
  _count: { questions: number }
}

export function ProfessorQcmList({ initialQcms }: { initialQcms: Qcm[] }) {
  const [qcms, setQcms] = useState(initialQcms)

  async function handleDelete(id: string) {
    if (!confirm("Delete this QCM and all its questions?")) return
    await deleteQcm(id)
    setQcms((prev) => prev.filter((q) => q.id !== id))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">My QCMs</h2>
        <Link href={routes.professor.newQcm}>
          <Button size="sm" className="gap-1">
            <Plus className="h-4 w-4" /> New QCM
          </Button>
        </Link>
      </div>

      {qcms.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground">No QCMs yet. Create your first one!</p>
            <Link href={routes.professor.newQcm} className="mt-4 inline-block">
              <Button size="sm">Create QCM</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {qcms.map((qcm) => (
            <Card key={qcm.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base leading-snug">{qcm.title}</CardTitle>
                  <Badge variant="secondary">{qcm.year}</Badge>
                </div>
                <CardDescription className="line-clamp-2">{qcm.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-3 flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-xs">{qcm.speciality.name}</Badge>
                  <Badge variant="outline" className="text-xs">{qcm.classLevel.name}</Badge>
                  <Badge variant="outline" className="text-xs">{qcm._count.questions} questions</Badge>
                </div>
                <div className="flex gap-2">
                  <Link href={routes.professor.editQcm(qcm.id)} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full gap-1">
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </Button>
                  </Link>
                  <Button
                    variant="outline" size="sm"
                    className="gap-1 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(qcm.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

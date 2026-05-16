"use client"

import { useState } from "react"
import Link from "next/link"

import { routes } from "@/lib/routes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Search, User, BookOpen, ArrowRight } from "lucide-react"

type Speciality = { id: string; name: string }
type ClassLevel = { id: string; name: string; specialityId: string }
type Qcm = {
  id: string
  title: string
  description: string
  year: number
  professor: { fullName: string }
  speciality: { id: string; name: string }
  classLevel: { id: string; name: string }
  _count: { questions: number }
}

export function QcmBrowser({
  specialities,
  classLevels,
  qcms,
}: {
  specialities: Speciality[]
  classLevels: ClassLevel[]
  qcms: Qcm[]
}) {
  const [selectedSpeciality, setSelectedSpeciality] = useState("all")
  const [selectedClassLevel, setSelectedClassLevel] = useState("all")
  const [search, setSearch] = useState("")
  const [yearFilter, setYearFilter] = useState("all")

  const filteredClassLevels = classLevels.filter(
    (cl) => selectedSpeciality === "all" || cl.specialityId === selectedSpeciality
  )

  const years = [...new Set(qcms.map((q) => q.year))].sort((a, b) => b - a)

  const filtered = qcms.filter((q) => {
    if (selectedSpeciality !== "all" && q.speciality.id !== selectedSpeciality) return false
    if (selectedClassLevel !== "all" && q.classLevel.id !== selectedClassLevel) return false
    if (yearFilter !== "all" && q.year.toString() !== yearFilter) return false
    if (search) {
      const s = search.toLowerCase()
      if (!q.title.toLowerCase().includes(s) && !q.professor.fullName.toLowerCase().includes(s)) return false
    }
    return true
  })

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="rounded-xl border bg-card p-4 space-y-3">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Speciality</Label>
            <Select value={selectedSpeciality} onValueChange={(v) => { setSelectedSpeciality(v || "all"); setSelectedClassLevel("all") }}>
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All specialities</SelectItem>
                {specialities.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Class Level</Label>
            <Select value={selectedClassLevel} onValueChange={(v) => setSelectedClassLevel(v || "all")} disabled={selectedSpeciality === "all"}>
              <SelectTrigger className="h-8">
                <SelectValue placeholder="All levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All levels</SelectItem>
                {filteredClassLevels.map((cl) => <SelectItem key={cl.id} value={cl.id}>{cl.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Year</Label>
            <Select value={yearFilter} onValueChange={(v) => setYearFilter(v || "all")}>
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All years</SelectItem>
                {years.map((y) => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Search</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="h-8 pl-8 text-sm"
                placeholder="Title or professor…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filtered.length} QCM{filtered.length !== 1 ? "s" : ""} found
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="py-16 text-center">
          <BookOpen className="mx-auto mb-3 h-12 w-12 text-muted-foreground/40" />
          <p className="text-muted-foreground">No QCMs match your filters.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((qcm) => (
            <Card key={qcm.id} className="flex flex-col transition-shadow hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base leading-snug">{qcm.title}</CardTitle>
                  <Badge variant="secondary" className="shrink-0">{qcm.year}</Badge>
                </div>
                <CardDescription className="line-clamp-2 text-xs">{qcm.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col justify-between gap-3">
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="outline" className="gap-1 text-xs">
                    <User className="h-3 w-3" /> {qcm.professor.fullName}
                  </Badge>
                  <Badge variant="outline" className="text-xs">{qcm.speciality.name}</Badge>
                  <Badge variant="outline" className="text-xs">{qcm.classLevel.name}</Badge>
                  <Badge variant="outline" className="gap-1 text-xs">
                    <BookOpen className="h-3 w-3" /> {qcm._count.questions} questions
                  </Badge>
                </div>
                <Link href={routes.qcm.take(qcm.id)} className="mt-auto">
                  <Button size="sm" className="w-full gap-1">
                    Start QCM <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

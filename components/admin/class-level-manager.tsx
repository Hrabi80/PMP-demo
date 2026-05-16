"use client"

import { useState } from "react"
import { createClassLevel, updateClassLevel, deleteClassLevel } from "@/features/class-levels/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pencil, Trash2, Plus, Check, X } from "lucide-react"

type Speciality = { id: string; name: string }
type ClassLevel = { id: string; name: string; specialityId: string; speciality: Speciality }

export function ClassLevelManager({
  initialClassLevels,
  specialities,
}: {
  initialClassLevels: ClassLevel[]
  specialities: Speciality[]
}) {
  const [classLevels, setClassLevels] = useState(initialClassLevels)
  const [newName, setNewName] = useState("")
  const [newSpecialityId, setNewSpecialityId] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editSpecialityId, setEditSpecialityId] = useState("")
  const [error, setError] = useState("")

  async function handleCreate() {
    setError("")
    if (!newName.trim() || !newSpecialityId) { setError("Name and speciality are required"); return }
    const fd = new FormData()
    fd.set("name", newName)
    fd.set("specialityId", newSpecialityId)
    const result = await createClassLevel(fd)
    if (result?.error) { setError(result.error); return }
    setNewName("")
    setNewSpecialityId("")
    window.location.reload()
  }

  async function handleUpdate(id: string) {
    setError("")
    const fd = new FormData()
    fd.set("name", editName)
    fd.set("specialityId", editSpecialityId)
    const result = await updateClassLevel(id, fd)
    if (result?.error) { setError(result.error); return }
    setClassLevels((prev) =>
      prev.map((cl) =>
        cl.id === id
          ? { ...cl, name: editName, specialityId: editSpecialityId, speciality: specialities.find((s) => s.id === editSpecialityId)! }
          : cl
      )
    )
    setEditingId(null)
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this class level?")) return
    await deleteClassLevel(id)
    setClassLevels((prev) => prev.filter((cl) => cl.id !== id))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Class Levels</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex gap-2">
          <Input
            placeholder="New level name…"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="flex-1"
          />
          <Select value={newSpecialityId} onValueChange={(v) => setNewSpecialityId(v || "")}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Speciality" />
            </SelectTrigger>
            <SelectContent>
              {specialities.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleCreate} size="sm" className="gap-1">
            <Plus className="h-4 w-4" /> Add
          </Button>
        </div>

        <div className="space-y-2">
          {classLevels.map((cl) => (
            <div key={cl.id} className="flex items-center gap-2 rounded-lg border px-3 py-2">
              {editingId === cl.id ? (
                <>
                  <Input
                    className="h-7 flex-1"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    autoFocus
                  />
                  <Select value={editSpecialityId} onValueChange={(v) => setEditSpecialityId(v || "")}>
                    <SelectTrigger className="h-7 w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {specialities.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleUpdate(cl.id)}>
                    <Check className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingId(null)}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-sm font-medium">{cl.name}</span>
                  <Badge variant="outline" className="text-xs">{cl.speciality.name}</Badge>
                  <Button
                    size="icon" variant="ghost" className="h-7 w-7"
                    onClick={() => { setEditingId(cl.id); setEditName(cl.name); setEditSpecialityId(cl.specialityId) }}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(cl.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </>
              )}
            </div>
          ))}
          {classLevels.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">No class levels yet.</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

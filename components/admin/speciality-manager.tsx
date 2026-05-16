"use client"

import { useState } from "react"
import { createSpeciality, updateSpeciality, deleteSpeciality } from "@/features/specialities/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2, Plus, Check, X } from "lucide-react"

type Speciality = { id: string; name: string }

export function SpecialityManager({ initialSpecialities }: { initialSpecialities: Speciality[] }) {
  const [specialities, setSpecialities] = useState(initialSpecialities)
  const [newName, setNewName] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [error, setError] = useState("")

  async function handleCreate() {
    setError("")
    const fd = new FormData()
    fd.set("name", newName)
    const result = await createSpeciality(fd)
    if (result?.error) { setError(result.error); return }
    setSpecialities((prev) => [...prev, { id: Date.now().toString(), name: newName }])
    setNewName("")
    window.location.reload()
  }

  async function handleUpdate(id: string) {
    setError("")
    const fd = new FormData()
    fd.set("name", editName)
    const result = await updateSpeciality(id, fd)
    if (result?.error) { setError(result.error); return }
    setSpecialities((prev) => prev.map((s) => (s.id === id ? { ...s, name: editName } : s)))
    setEditingId(null)
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this speciality? This will also delete related class levels.")) return
    await deleteSpeciality(id)
    setSpecialities((prev) => prev.filter((s) => s.id !== id))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Medical Specialities</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex gap-2">
          <Input
            placeholder="New speciality name…"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          />
          <Button onClick={handleCreate} disabled={!newName.trim()} size="sm" className="gap-1">
            <Plus className="h-4 w-4" /> Add
          </Button>
        </div>

        <div className="space-y-2">
          {specialities.map((s) => (
            <div key={s.id} className="flex items-center gap-2 rounded-lg border px-3 py-2">
              {editingId === s.id ? (
                <>
                  <Input
                    className="h-7 flex-1"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleUpdate(s.id)}
                    autoFocus
                  />
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleUpdate(s.id)}>
                    <Check className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingId(null)}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-sm font-medium">{s.name}</span>
                  <Badge variant="secondary" className="text-xs">Speciality</Badge>
                  <Button
                    size="icon" variant="ghost" className="h-7 w-7"
                    onClick={() => { setEditingId(s.id); setEditName(s.name) }}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(s.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </>
              )}
            </div>
          ))}
          {specialities.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">No specialities yet.</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

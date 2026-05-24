"use client"

import { useState } from "react"
import { SlidersHorizontal } from "lucide-react"

import { updateEnforceFiveQcmOptions } from "@/features/settings/actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"

export function QcmOptionSettings({
  enforceFiveQcmOptions,
}: {
  enforceFiveQcmOptions: boolean
}) {
  const [enabled, setEnabled] = useState(enforceFiveQcmOptions)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  async function handleChange(nextEnabled: boolean) {
    const previous = enabled
    setEnabled(nextEnabled)
    setSaving(true)
    setError("")

    const result = await updateEnforceFiveQcmOptions(nextEnabled)
    if (result?.error) {
      setEnabled(previous)
      setError(result.error)
    }

    setSaving(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5 text-primary" />
          QCM Options
        </CardTitle>
        <CardDescription>
          Control whether professor-created questions are locked to exactly five answer options.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between gap-4 rounded-lg border bg-background px-4 py-3">
          <div>
            <p className="text-sm font-semibold">Five options only</p>
            <p className="text-xs text-muted-foreground">
              {enabled ? "Enabled: professors see exactly 5 options." : "Disabled: professors can add more options."}
            </p>
          </div>
          <Switch checked={enabled} disabled={saving} onCheckedChange={handleChange} size="sm" />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  )
}

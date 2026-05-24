"use client"

import { useState } from "react"
import Link from "next/link"
import { signup } from "@/features/auth/actions"
import { routes } from "@/lib/routes"
import { Role } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

type Speciality = { id: string; name: string }

export function SignupForm({ specialities }: { specialities: Speciality[] }) {
  const [role, setRole] = useState<Role>("STUDENT")
  const [specialityId, setSpecialityId] = useState("")
  const [specialityOther, setSpecialityOther] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)


  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    formData.set("role", role)
    if (role === "PROFESSOR") {
      formData.set("specialityId", specialityId === "other" ? "" : specialityId)
      formData.set("specialityOther", specialityId === "other" ? specialityOther : "")
    }

    const result = await signup(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Create account</CardTitle>
        <CardDescription>Join MedQCM as a student, professor, or admin</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-1">
            <Label htmlFor="fullName">Full name</Label>
            <Input id="fullName" name="fullName" required placeholder="Dr. Jane Smith" />
          </div>

          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required placeholder="you@example.com" />
          </div>

          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required minLength={6} />
          </div>

          <div className="space-y-1">
            <Label>Role</Label>
            <Select value={role} onValueChange={(v) => setRole((v as Role) || "STUDENT")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="STUDENT">Student</SelectItem>
                <SelectItem value="PROFESSOR">Professor</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {role === "PROFESSOR" && (
            <>
              <div className="space-y-1">
                <Label>Speciality</Label>
                <Select value={specialityId} onValueChange={(v) => setSpecialityId(v || "")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your speciality" />
                  </SelectTrigger>
                  <SelectContent>
                    {specialities.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {specialityId === "other" && (
                <div className="space-y-1">
                  <Label htmlFor="specialityOther">Specify speciality</Label>
                  <Input
                    id="specialityOther"
                    value={specialityOther}
                    onChange={(e) => setSpecialityOther(e.target.value)}
                    placeholder="Your speciality"
                    required
                  />
                </div>
              )}
            </>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account…" : "Sign up"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href={routes.login} className="text-primary hover:underline">Log in</Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Role } from "@prisma/client"
import { CheckCircle2, Mail, Shield, UserRound } from "lucide-react"

import { updateProfile } from "@/features/profile/actions"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type ProfileFormProps = {
  user: {
    email: string
    fullName: string
    role: Role
  }
}

function splitFullName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" "),
  }
}

export function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter()
  const initialName = splitFullName(user.fullName)
  const [firstName, setFirstName] = useState(initialName.firstName)
  const [lastName, setLastName] = useState(initialName.lastName)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await updateProfile(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    setSuccess("Profile updated")
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <UserRound className="h-6 w-6 text-primary" />
            Edit profile
          </CardTitle>
          <CardDescription>Update the name displayed across MedQCM.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="border-primary/30 bg-primary/5 text-primary">
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription className="text-primary">{success}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                />
              </div>
            </div>

            <Button type="submit" disabled={loading || !firstName.trim()} className="w-full sm:w-auto">
              {loading ? "Saving..." : "Save profile"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Account</CardTitle>
          <CardDescription>Your login details and role.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border bg-background px-4 py-3">
            <p className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <Mail className="h-4 w-4" />
              Email
            </p>
            <p className="mt-1 break-words text-lg font-semibold">{user.email}</p>
          </div>
          <div className="rounded-lg border bg-background px-4 py-3">
            <p className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <Shield className="h-4 w-4" />
              Role
            </p>
            <Badge variant="secondary" className="mt-2 capitalize">
              {user.role.toLowerCase()}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

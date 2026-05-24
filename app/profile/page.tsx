import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { ProfileForm } from "@/components/profile/profile-form"
import { getSession } from "@/lib/auth"
import { routes } from "@/lib/routes"

export const metadata: Metadata = {
  title: "Profile – MedQCM",
}

export default async function ProfilePage() {
  const session = await getSession()
  if (!session) redirect(routes.login)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-lg text-muted-foreground">Manage the name shown in your account.</p>
      </div>
      <ProfileForm user={session} />
    </div>
  )
}

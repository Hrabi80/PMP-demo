import type { Metadata } from "next"
import Link from "next/link"
import { routes } from "@/lib/routes"
import { getPlatformSettings } from "@/features/settings/actions"
import { QcmOptionSettings } from "@/components/admin/qcm-option-settings"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Settings, GraduationCap } from "lucide-react"

export const metadata: Metadata = {
  title: "Admin Dashboard – MedQCM",
}

export default async function AdminPage() {
  const settings = await getPlatformSettings()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" /> Specialities
            </CardTitle>
            <CardDescription>Create and manage medical specialities available in the platform.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={routes.admin.specialities}>
              <Button size="sm" className="w-full">Manage specialities</Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" /> Class Levels
            </CardTitle>
            <CardDescription>Manage class levels linked to each speciality (e.g. First Year, Second Year).</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={routes.admin.classLevels}>
              <Button size="sm" className="w-full">Manage class levels</Button>
            </Link>
          </CardContent>
        </Card>
        <QcmOptionSettings enforceFiveQcmOptions={settings.enforceFiveQcmOptions} />
      </div>
    </div>
  )
}

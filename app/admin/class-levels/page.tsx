import type { Metadata } from "next"
import Link from "next/link"
import { routes } from "@/lib/routes"
import { getSpecialities } from "@/features/specialities/actions"
import { getClassLevels } from "@/features/class-levels/actions"
import { ClassLevelManager } from "@/components/admin/class-level-manager"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "Class Levels – Admin – MedQCM",
}

export default async function ClassLevelsPage() {
  const [specialities, classLevels] = await Promise.all([getSpecialities(), getClassLevels()])
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={routes.admin.dashboard}>
          <Button variant="ghost" size="sm" className="gap-1">
            <ChevronLeft className="h-4 w-4" /> Back
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Class Levels</h1>
      </div>
      <ClassLevelManager initialClassLevels={classLevels} specialities={specialities} />
    </div>
  )
}

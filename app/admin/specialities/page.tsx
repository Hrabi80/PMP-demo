import type { Metadata } from "next"
import Link from "next/link"
import { routes } from "@/lib/routes"
import { getSpecialities } from "@/features/specialities/actions"
import { SpecialityManager } from "@/components/admin/speciality-manager"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "Specialities – Admin – MedQCM",
}

export default async function SpecialitiesPage() {
  const specialities = await getSpecialities()
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={routes.admin.dashboard}>
          <Button variant="ghost" size="sm" className="gap-1">
            <ChevronLeft className="h-4 w-4" /> Back
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Specialities</h1>
      </div>
      <SpecialityManager initialSpecialities={specialities} />
    </div>
  )
}

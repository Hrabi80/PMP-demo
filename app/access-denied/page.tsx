import type { Metadata } from "next"
import Link from "next/link"
import { routes } from "@/lib/routes"
import { Button } from "@/components/ui/button"
import { ShieldX } from "lucide-react"

export const metadata: Metadata = {
  title: "Access Denied – MedQCM",
}

export default function AccessDeniedPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <ShieldX className="h-8 w-8" />
      </div>
      <h1 className="text-2xl font-bold">Access Denied</h1>
      <p className="mt-2 text-muted-foreground">You don&apos;t have permission to view this page.</p>
      <div className="mt-6 flex gap-3">
        <Link href={routes.home}>
          <Button variant="outline">Go home</Button>
        </Link>
        <Link href={routes.login}>
          <Button>Log in</Button>
        </Link>
      </div>
    </div>
  )
}

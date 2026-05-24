"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { logout } from "@/features/auth/actions"
import { routes } from "@/lib/routes"
import { Role } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Brain, LogOut, LayoutDashboard, BookOpen, Settings, UserRound } from "lucide-react"

type NavbarProps = {
  user: { fullName: string; role: Role } | null
}

export function Navbar({ user }: NavbarProps) {
  const router = useRouter()

  async function handleLogout() {
    await logout()
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href={routes.home} className="flex items-center gap-2 font-semibold text-primary">
          <Brain className="h-5 w-5" />
          <span>MedQCM</span>
        </Link>

        <nav className="flex items-center gap-2">
          <Link href={routes.qcm.browse}>
            <Button variant="ghost" size="sm" className="gap-1">
              <BookOpen className="h-4 w-4" />
              QCM
            </Button>
          </Link>

          {user?.role === "ADMIN" && (
            <Link href={routes.admin.dashboard}>
              <Button variant="ghost" size="sm" className="gap-1">
                <Settings className="h-4 w-4" />
                Admin
              </Button>
            </Link>
          )}

          {user?.role === "PROFESSOR" && (
            <Link href={routes.professor.dashboard}>
              <Button variant="ghost" size="sm" className="gap-1">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-2">
              <Link href={routes.profile}>
                <Button variant="ghost" size="sm" className="gap-1">
                  <UserRound className="h-4 w-4" />
                  <span className="hidden sm:inline">{user.fullName}</span>
                </Button>
              </Link>
              <Badge variant="secondary" className="hidden sm:inline-flex capitalize">
                {user.role.toLowerCase()}
              </Badge>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-1">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href={routes.login}>
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link href={routes.signup}>
                <Button size="sm">Sign Up</Button>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}

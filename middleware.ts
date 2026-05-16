import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

const SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET || "demo-secret-key-change-in-production"
)

async function getSessionFromRequest(request: NextRequest) {
  const token = request.cookies.get("session")?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, SECRET)
    return (payload as { user: { role: string } }).user
  } catch {
    return null
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const user = await getSessionFromRequest(request)

  if (pathname.startsWith("/admin")) {
    if (!user) return NextResponse.redirect(new URL("/login", request.url))
    if (user.role !== "ADMIN")
      return NextResponse.redirect(new URL("/access-denied", request.url))
  }

  if (pathname.startsWith("/professor")) {
    if (!user) return NextResponse.redirect(new URL("/login", request.url))
    if (user.role !== "PROFESSOR")
      return NextResponse.redirect(new URL("/access-denied", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/professor/:path*"],
}

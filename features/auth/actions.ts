"use server"

import { redirect } from "next/navigation"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { createSession, destroySession } from "@/lib/auth"
import { routes } from "@/lib/routes"
import { Role } from "@prisma/client"

export async function signup(formData: FormData) {
  const fullName = formData.get("fullName") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const role = formData.get("role") as Role
  const specialityId = formData.get("specialityId") as string | null
  const specialityOther = formData.get("specialityOther") as string | null

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return { error: "Email already in use" }
  }

  const passwordHash = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: {
      fullName,
      email,
      passwordHash,
      role,
      specialityId: specialityId || null,
      specialityOther: specialityOther || null,
    },
  })

  await createSession({
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
  })

  if (role === "ADMIN") redirect(routes.admin.dashboard)
  if (role === "PROFESSOR") redirect(routes.professor.dashboard)
  redirect(routes.qcm.browse)
}

export async function login(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    return { error: "Invalid email or password" }
  }

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) {
    return { error: "Invalid email or password" }
  }

  await createSession({
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
  })

  if (user.role === "ADMIN") redirect(routes.admin.dashboard)
  if (user.role === "PROFESSOR") redirect(routes.professor.dashboard)
  redirect(routes.qcm.browse)
}

export async function logout() {
  await destroySession()
  redirect(routes.login)
}

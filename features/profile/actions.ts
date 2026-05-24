"use server"

import { revalidatePath } from "next/cache"

import { createSession, getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { routes } from "@/lib/routes"

export async function updateProfile(formData: FormData) {
  const session = await getSession()
  if (!session) return { error: "Unauthorized" }

  const firstName = (formData.get("firstName") as string | null)?.trim() ?? ""
  const lastName = (formData.get("lastName") as string | null)?.trim() ?? ""
  const fullName = [firstName, lastName].filter(Boolean).join(" ")

  if (!fullName) return { error: "Name is required" }

  const user = await prisma.user.update({
    where: { id: session.id },
    data: { fullName },
  })

  await createSession({
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
  })

  revalidatePath(routes.profile)
  revalidatePath(routes.home)
  return { success: true, fullName: user.fullName }
}

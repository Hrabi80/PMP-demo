"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { routes } from "@/lib/routes"

export async function getSpecialities() {
  return prisma.speciality.findMany({ orderBy: { name: "asc" } })
}

export async function createSpeciality(formData: FormData) {
  const session = await getSession()
  if (!session || session.role !== "ADMIN") return { error: "Unauthorized" }

  const name = (formData.get("name") as string).trim()
  if (!name) return { error: "Name is required" }

  const existing = await prisma.speciality.findUnique({ where: { name } })
  if (existing) return { error: "Speciality already exists" }

  await prisma.speciality.create({ data: { name } })
  revalidatePath(routes.admin.specialities)
  return { success: true }
}

export async function updateSpeciality(id: string, formData: FormData) {
  const session = await getSession()
  if (!session || session.role !== "ADMIN") return { error: "Unauthorized" }

  const name = (formData.get("name") as string).trim()
  if (!name) return { error: "Name is required" }

  await prisma.speciality.update({ where: { id }, data: { name } })
  revalidatePath(routes.admin.specialities)
  return { success: true }
}

export async function deleteSpeciality(id: string) {
  const session = await getSession()
  if (!session || session.role !== "ADMIN") return { error: "Unauthorized" }

  await prisma.speciality.delete({ where: { id } })
  revalidatePath(routes.admin.specialities)
  return { success: true }
}

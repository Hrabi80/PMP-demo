"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { routes } from "@/lib/routes"

export async function getClassLevels(specialityId?: string) {
  return prisma.classLevel.findMany({
    where: specialityId ? { specialityId } : undefined,
    include: { speciality: true },
    orderBy: { name: "asc" },
  })
}

export async function createClassLevel(formData: FormData) {
  const session = await getSession()
  if (!session || session.role !== "ADMIN") return { error: "Unauthorized" }

  const name = (formData.get("name") as string).trim()
  const specialityId = formData.get("specialityId") as string

  if (!name || !specialityId) return { error: "Name and speciality are required" }

  await prisma.classLevel.create({ data: { name, specialityId } })
  revalidatePath(routes.admin.classLevels)
  return { success: true }
}

export async function updateClassLevel(id: string, formData: FormData) {
  const session = await getSession()
  if (!session || session.role !== "ADMIN") return { error: "Unauthorized" }

  const name = (formData.get("name") as string).trim()
  const specialityId = formData.get("specialityId") as string

  if (!name || !specialityId) return { error: "Name and speciality are required" }

  await prisma.classLevel.update({ where: { id }, data: { name, specialityId } })
  revalidatePath(routes.admin.classLevels)
  return { success: true }
}

export async function deleteClassLevel(id: string) {
  const session = await getSession()
  if (!session || session.role !== "ADMIN") return { error: "Unauthorized" }

  await prisma.classLevel.delete({ where: { id } })
  revalidatePath(routes.admin.classLevels)
  return { success: true }
}

"use server"

import { revalidatePath } from "next/cache"

import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { routes } from "@/lib/routes"

const SETTINGS_ID = "global"

export async function getPlatformSettings() {
  return prisma.platformSettings.upsert({
    where: { id: SETTINGS_ID },
    update: {},
    create: { id: SETTINGS_ID },
  })
}

export async function getEnforceFiveQcmOptions() {
  const settings = await getPlatformSettings()
  return settings.enforceFiveQcmOptions
}

export async function updateEnforceFiveQcmOptions(enabled: boolean) {
  const session = await getSession()
  if (!session || session.role !== "ADMIN") return { error: "Unauthorized" }

  await prisma.platformSettings.upsert({
    where: { id: SETTINGS_ID },
    update: { enforceFiveQcmOptions: enabled },
    create: { id: SETTINGS_ID, enforceFiveQcmOptions: enabled },
  })

  revalidatePath(routes.admin.dashboard)
  revalidatePath(routes.professor.newQcm)
  revalidatePath(routes.professor.dashboard)

  return { success: true }
}

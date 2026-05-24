"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { routes } from "@/lib/routes"
import { getEnforceFiveQcmOptions } from "@/features/settings/actions"
import { QuestionType } from "@prisma/client"

type OptionInput = {
  id?: string
  text: string
  isCorrect: boolean
  order: number
}

type QuestionInput = {
  id?: string
  questionText: string
  type: QuestionType
  points: number
  order: number
  options: OptionInput[]
}

type QcmInput = {
  title: string
  description: string
  year: number
  specialityId: string
  classLevelId: string
  questions: QuestionInput[]
}

const FIXED_OPTION_COUNT = 5

async function validateQcmOptions(data: QcmInput) {
  const enforceFiveOptions = await getEnforceFiveQcmOptions()

  if (!enforceFiveOptions) return null

  const invalidQuestionIndex = data.questions.findIndex((q) => q.options.length !== FIXED_OPTION_COUNT)
  if (invalidQuestionIndex === -1) return null

  return `Question ${invalidQuestionIndex + 1} must have exactly ${FIXED_OPTION_COUNT} options.`
}

function validateQcmPoints(data: QcmInput) {
  const invalidQuestionIndex = data.questions.findIndex(
    (q) => !Number.isFinite(Number(q.points)) || Number(q.points) <= 0
  )

  if (invalidQuestionIndex === -1) return null

  return `Question ${invalidQuestionIndex + 1} must have a positive point value.`
}

function normalizePoints(points: number) {
  return Math.max(1, Math.round(Number(points)))
}

export async function getQcms(specialityId?: string, classLevelId?: string) {
  return prisma.qcm.findMany({
    where: {
      ...(specialityId && { specialityId }),
      ...(classLevelId && { classLevelId }),
    },
    include: {
      professor: { select: { fullName: true } },
      speciality: true,
      classLevel: true,
      _count: { select: { questions: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getProfessorQcms() {
  const session = await getSession()
  if (!session || session.role !== "PROFESSOR") return []

  return prisma.qcm.findMany({
    where: { professorId: session.id },
    include: {
      speciality: true,
      classLevel: true,
      _count: { select: { questions: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getQcmById(id: string) {
  return prisma.qcm.findUnique({
    where: { id },
    include: {
      professor: { select: { fullName: true } },
      speciality: true,
      classLevel: true,
      questions: {
        orderBy: { order: "asc" },
        include: {
          options: { orderBy: { order: "asc" } },
        },
      },
    },
  })
}

export async function createQcm(data: QcmInput) {
  const session = await getSession()
  if (!session || session.role !== "PROFESSOR") return { error: "Unauthorized" }

  const optionError = await validateQcmOptions(data)
  if (optionError) return { error: optionError }

  const pointsError = validateQcmPoints(data)
  if (pointsError) return { error: pointsError }

  await prisma.qcm.create({
    data: {
      title: data.title,
      description: data.description,
      year: data.year,
      specialityId: data.specialityId,
      classLevelId: data.classLevelId,
      professorId: session.id,
      questions: {
        create: data.questions.map((q) => ({
          questionText: q.questionText,
          type: q.type,
          points: normalizePoints(q.points),
          order: q.order,
          options: {
            create: q.options.map((o) => ({
              text: o.text,
              isCorrect: o.isCorrect,
              order: o.order,
            })),
          },
        })),
      },
    },
  })

  revalidatePath(routes.professor.dashboard)
  redirect(routes.professor.dashboard)
}

export async function updateQcm(id: string, data: QcmInput) {
  const session = await getSession()
  if (!session || session.role !== "PROFESSOR") return { error: "Unauthorized" }

  const existing = await prisma.qcm.findUnique({ where: { id } })
  if (!existing || existing.professorId !== session.id) return { error: "Not found" }

  const optionError = await validateQcmOptions(data)
  if (optionError) return { error: optionError }

  const pointsError = validateQcmPoints(data)
  if (pointsError) return { error: pointsError }

  // Delete existing questions (cascade deletes options)
  await prisma.qcmQuestion.deleteMany({ where: { qcmId: id } })

  await prisma.qcm.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description,
      year: data.year,
      specialityId: data.specialityId,
      classLevelId: data.classLevelId,
      questions: {
        create: data.questions.map((q) => ({
          questionText: q.questionText,
          type: q.type,
          points: normalizePoints(q.points),
          order: q.order,
          options: {
            create: q.options.map((o) => ({
              text: o.text,
              isCorrect: o.isCorrect,
              order: o.order,
            })),
          },
        })),
      },
    },
  })

  revalidatePath(routes.professor.dashboard)
  redirect(routes.professor.dashboard)
}

export async function deleteQcm(id: string) {
  const session = await getSession()
  if (!session || session.role !== "PROFESSOR") return { error: "Unauthorized" }

  const existing = await prisma.qcm.findUnique({ where: { id } })
  if (!existing || existing.professorId !== session.id) return { error: "Not found" }

  await prisma.qcm.delete({ where: { id } })
  revalidatePath(routes.professor.dashboard)
  return { success: true }
}

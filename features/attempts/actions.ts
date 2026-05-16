"use server"

import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

type AnswerInput = {
  questionId: string
  selectedOptionIds: string[]
}

export async function submitAttempt(
  qcmId: string,
  answers: AnswerInput[],
  guestName?: string
) {
  const session = await getSession()

  // Calculate score
  const questions = await prisma.qcmQuestion.findMany({
    where: { qcmId },
    include: { options: true },
  })

  let score = 0
  for (const question of questions) {
    const answer = answers.find((a) => a.questionId === question.id)
    if (!answer) continue

    const correctIds = question.options
      .filter((o) => o.isCorrect)
      .map((o) => o.id)
      .sort()

    const selectedIds = [...answer.selectedOptionIds].sort()

    const isCorrect =
      correctIds.length === selectedIds.length &&
      correctIds.every((id) => selectedIds.includes(id))

    if (isCorrect) score++
  }

  const totalQuestions = questions.length
  const percentage = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0

  // Only persist for logged-in students
  if (session && session.role === "STUDENT") {
    const attempt = await prisma.qcmAttempt.create({
      data: {
        qcmId,
        studentId: session.id,
        score,
        totalQuestions,
        percentage,
        answers: {
          create: answers.map((a) => ({
            questionId: a.questionId,
            selectedOptionIds: a.selectedOptionIds,
          })),
        },
      },
    })
    return { attemptId: attempt.id, score, totalQuestions, percentage }
  }

  // Guest: return results without persisting
  if (guestName) {
    return { score, totalQuestions, percentage }
  }

  return { score, totalQuestions, percentage }
}

export async function getAttemptResult(attemptId: string) {
  return prisma.qcmAttempt.findUnique({
    where: { id: attemptId },
    include: {
      answers: {
        include: {
          question: {
            include: { options: { orderBy: { order: "asc" } } },
          },
        },
      },
      qcm: true,
    },
  })
}

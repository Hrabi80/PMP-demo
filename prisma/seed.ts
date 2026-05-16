import "dotenv/config"
import { prisma } from "../lib/prisma"
import bcrypt from "bcryptjs"

async function main() {
  console.log("🌱 Seeding database...")

  // --- Specialities ---
  const specialities = await Promise.all([
    prisma.speciality.upsert({
      where: { name: "Neurology" },
      update: {},
      create: { name: "Neurology" },
    }),
    prisma.speciality.upsert({
      where: { name: "Cardiology" },
      update: {},
      create: { name: "Cardiology" },
    }),
    prisma.speciality.upsert({
      where: { name: "Anatomy" },
      update: {},
      create: { name: "Anatomy" },
    }),
    prisma.speciality.upsert({
      where: { name: "Biophysics" },
      update: {},
      create: { name: "Biophysics" },
    }),
    prisma.speciality.upsert({
      where: { name: "Psychology" },
      update: {},
      create: { name: "Psychology" },
    }),
  ])

  const [neurology, cardiology, anatomy, biophysics, psychology] = specialities

  // --- Class Levels ---
  const classLevelData = [
    { name: "First Year", specialityId: neurology.id },
    { name: "Second Year", specialityId: neurology.id },
    { name: "Third Year", specialityId: neurology.id },
    { name: "First Year", specialityId: cardiology.id },
    { name: "Second Year", specialityId: cardiology.id },
    { name: "Third Year", specialityId: cardiology.id },
    { name: "First Year", specialityId: anatomy.id },
    { name: "Second Year", specialityId: anatomy.id },
    { name: "First Year", specialityId: biophysics.id },
    { name: "Second Year", specialityId: biophysics.id },
    { name: "First Year", specialityId: psychology.id },
    { name: "Second Year", specialityId: psychology.id },
  ]

  const classLevels = await Promise.all(
    classLevelData.map((cl) =>
      prisma.classLevel.upsert({
        where: { id: `${cl.specialityId}-${cl.name}` },
        update: {},
        create: cl,
      }).catch(() => prisma.classLevel.create({ data: cl }))
    )
  )

  // --- Users ---
  const adminHash = await bcrypt.hash("admin123", 10)
  const professorHash = await bcrypt.hash("professor123", 10)
  const studentHash = await bcrypt.hash("student123", 10)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const admin = await prisma.user.upsert({
    where: { email: "admin@demo.com" },
    update: {},
    create: {
      fullName: "Admin User",
      email: "admin@demo.com",
      passwordHash: adminHash,
      role: "ADMIN",
    },
  })

  const professor = await prisma.user.upsert({
    where: { email: "professor@demo.com" },
    update: {},
    create: {
      fullName: "Dr. Sarah Johnson",
      email: "professor@demo.com",
      passwordHash: professorHash,
      role: "PROFESSOR",
      specialityId: neurology.id,
    },
  })

  await prisma.user.upsert({
    where: { email: "student@demo.com" },
    update: {},
    create: {
      fullName: "Alex Martin",
      email: "student@demo.com",
      passwordHash: studentHash,
      role: "STUDENT",
    },
  })

  // --- QCMs ---
  const neurologyCL = classLevels.find(
    (cl) => cl.specialityId === neurology.id && cl.name === "Second Year"
  ) || classLevels[0]

  const cardiologyCL = classLevels.find(
    (cl) => cl.specialityId === cardiology.id && cl.name === "First Year"
  ) || classLevels[3]

  const anatomyCL = classLevels.find(
    (cl) => cl.specialityId === anatomy.id && cl.name === "First Year"
  ) || classLevels[6]

  // QCM 1: Neurology
  await prisma.qcm.upsert({
    where: { id: "qcm-neurology-demo" },
    update: {},
    create: {
      id: "qcm-neurology-demo",
      title: "Fundamentals of the Nervous System",
      description:
        "Test your knowledge of the nervous system's structure, function, and clinical relevance.",
      year: 2024,
      specialityId: neurology.id,
      classLevelId: neurologyCL.id,
      professorId: professor.id,
      questions: {
        create: [
          {
            questionText: "Which part of the brain is primarily responsible for balance and coordination?",
            type: "SINGLE_CHOICE",
            order: 1,
            options: {
              create: [
                { text: "Cerebrum", isCorrect: false, order: 1 },
                { text: "Cerebellum", isCorrect: true, order: 2 },
                { text: "Brainstem", isCorrect: false, order: 3 },
                { text: "Thalamus", isCorrect: false, order: 4 },
              ],
            },
          },
          {
            questionText: "Which of the following are components of the central nervous system (CNS)?",
            type: "MULTIPLE_CHOICE",
            order: 2,
            options: {
              create: [
                { text: "Brain", isCorrect: true, order: 1 },
                { text: "Spinal cord", isCorrect: true, order: 2 },
                { text: "Peripheral nerves", isCorrect: false, order: 3 },
                { text: "Autonomic ganglia", isCorrect: false, order: 4 },
              ],
            },
          },
          {
            questionText: "The blood-brain barrier is primarily formed by which cell type?",
            type: "SINGLE_CHOICE",
            order: 3,
            options: {
              create: [
                { text: "Neurons", isCorrect: false, order: 1 },
                { text: "Microglia", isCorrect: false, order: 2 },
                { text: "Astrocytes", isCorrect: true, order: 3 },
                { text: "Oligodendrocytes", isCorrect: false, order: 4 },
              ],
            },
          },
          {
            questionText: "Which neurotransmitters are monoamines?",
            type: "MULTIPLE_CHOICE",
            order: 4,
            options: {
              create: [
                { text: "Dopamine", isCorrect: true, order: 1 },
                { text: "Serotonin", isCorrect: true, order: 2 },
                { text: "GABA", isCorrect: false, order: 3 },
                { text: "Norepinephrine", isCorrect: true, order: 4 },
              ],
            },
          },
        ],
      },
    },
  })

  // QCM 2: Cardiology
  await prisma.qcm.upsert({
    where: { id: "qcm-cardiology-demo" },
    update: {},
    create: {
      id: "qcm-cardiology-demo",
      title: "Cardiac Anatomy & Physiology",
      description:
        "Assess understanding of heart structure, conduction system, and hemodynamics.",
      year: 2024,
      specialityId: cardiology.id,
      classLevelId: cardiologyCL.id,
      professorId: professor.id,
      questions: {
        create: [
          {
            questionText: "How many chambers does the human heart have?",
            type: "SINGLE_CHOICE",
            order: 1,
            options: {
              create: [
                { text: "2", isCorrect: false, order: 1 },
                { text: "3", isCorrect: false, order: 2 },
                { text: "4", isCorrect: true, order: 3 },
                { text: "5", isCorrect: false, order: 4 },
              ],
            },
          },
          {
            questionText: "Which vessels carry oxygenated blood?",
            type: "MULTIPLE_CHOICE",
            order: 2,
            options: {
              create: [
                { text: "Pulmonary veins", isCorrect: true, order: 1 },
                { text: "Aorta", isCorrect: true, order: 2 },
                { text: "Pulmonary arteries", isCorrect: false, order: 3 },
                { text: "Superior vena cava", isCorrect: false, order: 4 },
              ],
            },
          },
          {
            questionText: "The SA node is located in which chamber?",
            type: "SINGLE_CHOICE",
            order: 3,
            options: {
              create: [
                { text: "Left ventricle", isCorrect: false, order: 1 },
                { text: "Right ventricle", isCorrect: false, order: 2 },
                { text: "Left atrium", isCorrect: false, order: 3 },
                { text: "Right atrium", isCorrect: true, order: 4 },
              ],
            },
          },
          {
            questionText: "Which of the following are risk factors for coronary artery disease?",
            type: "MULTIPLE_CHOICE",
            order: 4,
            options: {
              create: [
                { text: "Hypertension", isCorrect: true, order: 1 },
                { text: "Smoking", isCorrect: true, order: 2 },
                { text: "High HDL cholesterol", isCorrect: false, order: 3 },
                { text: "Diabetes mellitus", isCorrect: true, order: 4 },
              ],
            },
          },
        ],
      },
    },
  })

  // QCM 3: Anatomy
  await prisma.qcm.upsert({
    where: { id: "qcm-anatomy-demo" },
    update: {},
    create: {
      id: "qcm-anatomy-demo",
      title: "Upper Limb Anatomy",
      description:
        "Review the bones, muscles, nerves, and vessels of the upper extremity.",
      year: 2023,
      specialityId: anatomy.id,
      classLevelId: anatomyCL.id,
      professorId: professor.id,
      questions: {
        create: [
          {
            questionText: "Which bone forms the lateral border of the forearm?",
            type: "SINGLE_CHOICE",
            order: 1,
            options: {
              create: [
                { text: "Ulna", isCorrect: false, order: 1 },
                { text: "Radius", isCorrect: true, order: 2 },
                { text: "Humerus", isCorrect: false, order: 3 },
                { text: "Carpals", isCorrect: false, order: 4 },
              ],
            },
          },
          {
            questionText: "Which muscles make up the rotator cuff?",
            type: "MULTIPLE_CHOICE",
            order: 2,
            options: {
              create: [
                { text: "Supraspinatus", isCorrect: true, order: 1 },
                { text: "Infraspinatus", isCorrect: true, order: 2 },
                { text: "Deltoid", isCorrect: false, order: 3 },
                { text: "Teres minor", isCorrect: true, order: 4 },
              ],
            },
          },
          {
            questionText: "The brachial plexus originates from which spinal levels?",
            type: "SINGLE_CHOICE",
            order: 3,
            options: {
              create: [
                { text: "T1–T5", isCorrect: false, order: 1 },
                { text: "C5–T1", isCorrect: true, order: 2 },
                { text: "C1–C5", isCorrect: false, order: 3 },
                { text: "C3–C7", isCorrect: false, order: 4 },
              ],
            },
          },
          {
            questionText: "The axillary nerve supplies which muscles?",
            type: "MULTIPLE_CHOICE",
            order: 4,
            options: {
              create: [
                { text: "Deltoid", isCorrect: true, order: 1 },
                { text: "Teres minor", isCorrect: true, order: 2 },
                { text: "Biceps brachii", isCorrect: false, order: 3 },
                { text: "Triceps brachii", isCorrect: false, order: 4 },
              ],
            },
          },
        ],
      },
    },
  })

  console.log("✅ Seed complete!")
  console.log(`  Admin: admin@demo.com / admin123`)
  console.log(`  Professor: professor@demo.com / professor123`)
  console.log(`  Student: student@demo.com / student123`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())

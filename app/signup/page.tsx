import type { Metadata } from "next"
import { getSpecialities } from "@/features/specialities/actions"
import { SignupForm } from "@/components/auth/signup-form"

export const metadata: Metadata = {
  title: "Sign Up – MedQCM",
  description: "Create your MedQCM account",
}

export default async function SignupPage() {
  const specialities = await getSpecialities()
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <SignupForm specialities={specialities} />
    </div>
  )
}

import type { Metadata } from "next"
import { Roboto, Geist_Mono } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Navbar } from "@/components/layout/navbar"
import { getSession } from "@/lib/auth"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "MedQCM – Medical Quiz Platform",
  description: "A medical QCM platform for students and professors",
}

const roboto = Roboto({ subsets: ["latin"], variable: "--font-sans" })
const fontMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" })

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()

  return (
    <html lang="en" suppressHydrationWarning className={cn("antialiased", fontMono.variable, "font-sans", roboto.variable)}>
      <body>
        <ThemeProvider>
          <Navbar user={session} />
          <main className="mx-auto max-w-7xl px-4 py-8">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  )
}

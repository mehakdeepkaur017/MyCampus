"use client"

import { useEffect } from "react"
import Link from "next/link"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-slate-50 dark:bg-[#0a0a0a] p-4">
      <div className="flex max-w-md flex-col items-center text-center p-8 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="mb-6 rounded-full bg-red-100 p-4 dark:bg-red-900/30">
          <AlertTriangle className="h-12 w-12 text-red-600 dark:text-red-500" />
        </div>
        <h1 className="mb-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Something went wrong
        </h1>
        <p className="mb-8 text-slate-500 dark:text-slate-400">
          An unexpected error occurred while processing your request. Please try again later.
        </p>
        <div className="flex gap-4">
          <Button onClick={() => reset()} variant="outline">
            Try again
          </Button>
          <Button render={<Link href="/" />} className="bg-slate-900 text-white dark:bg-white dark:text-slate-900">
            Return to Home
          </Button>
        </div>
      </div>
    </div>
  )
}

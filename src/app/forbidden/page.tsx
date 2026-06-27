"use client"

import Link from "next/link"
import { ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-slate-50 dark:bg-[#0a0a0a] p-4">
      <div className="flex max-w-md flex-col items-center text-center p-8 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="mb-6 rounded-full bg-amber-100 p-4 dark:bg-amber-900/30">
          <ShieldAlert className="h-12 w-12 text-amber-600 dark:text-amber-500" />
        </div>
        <h1 className="mb-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          403 - Access Denied
        </h1>
        <p className="mb-8 text-slate-500 dark:text-slate-400">
          You do not have permission to view this page. If you believe this is an error, please contact the administrator.
        </p>
        <Button render={<Link href="/" />} className="bg-slate-900 text-white dark:bg-white dark:text-slate-900">
          Return to Home
        </Button>
      </div>
    </div>
  )
}

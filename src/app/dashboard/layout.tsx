"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  LayoutDashboard,
  Calendar,
  CheckSquare,
  BookOpen,
  Bell,
  GraduationCap,
  User,
  Settings,
  Menu,
  LogOut
} from "lucide-react"

import { UserNav } from "@/components/user-nav"

const sidebarLinks = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Timetable", href: "/dashboard/timetable", icon: Calendar },
  { name: "Tasks", href: "/dashboard/tasks", icon: CheckSquare },
  { name: "Attendance", href: "/dashboard/attendance", icon: CheckSquare },
  { name: "Notices", href: "/dashboard/notices", icon: Bell },
  { name: "Notes", href: "/dashboard/notes", icon: BookOpen },
  { name: "Profile", href: "/dashboard/profile", icon: User },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

const mobileNavLinks = [
  { name: "Home", href: "/dashboard", icon: LayoutDashboard },
  { name: "Timetable", href: "/dashboard/timetable", icon: Calendar },
  { name: "Tasks", href: "/dashboard/tasks", icon: CheckSquare },
  { name: "Notices", href: "/dashboard/notices", icon: Bell },
  { name: "Menu", href: "/dashboard/profile", icon: Menu }, // Opens profile/menu
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [user, setUser] = useState<{ name: string; email: string; avatar: string | null; role: string } | null>(null)

  useEffect(() => {
    fetch("/api/student/profile")
      .then(res => res.json())
      .then(data => {
        if (data.name) setUser(data)
      })
      .catch(() => {})
  }, [])

  return (
    <div className="flex h-[100dvh] w-full bg-slate-50 dark:bg-[#0a0a0a] overflow-hidden">
      {/* Sidebar - Desktop (Matching Screenshot exactly: dark bg, green active state) */}
      <aside className="hidden w-[260px] flex-col bg-[#0f172a] text-slate-300 md:flex h-full shadow-xl z-20 shrink-0">
        <div className="flex h-20 items-center gap-3 px-8">
          <Image src="/logo.png" alt="MyCampus Logo" width={32} height={32} className="rounded-lg shadow-lg" />
          <div>
            <span className="text-xl font-bold tracking-tight text-white leading-none block">My</span>
            <span className="text-xl font-bold tracking-tight text-white leading-none block">Campus</span>
          </div>
        </div>

        <nav className="flex-1 space-y-1.5 px-4 py-8 overflow-y-auto hide-scrollbar">
          {sidebarLinks.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href

            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-3.5 rounded-full px-5 py-3 text-[15px] font-medium transition-all duration-200 ${
                  isActive 
                    ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/10" 
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? "text-white" : "text-slate-400"}`} strokeWidth={isActive ? 2.5 : 2} />
                {link.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 mt-auto border-t border-slate-800/50">
          <div className="flex items-center gap-2 rounded-2xl bg-slate-800/50 p-2 pr-3">
            <Link href="/dashboard/profile" className="flex items-center gap-3 flex-1 min-w-0 group cursor-pointer hover:bg-slate-800 p-1.5 rounded-xl transition-colors">
              <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-white shrink-0 overflow-hidden">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user?.name || "Student"} className="h-full w-full object-cover" />
                ) : (
                  (user?.name || "S").charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate group-hover:text-emerald-400 transition-colors">{user?.name || "Loading..."}</p>
                <p className="text-xs text-slate-400 truncate">{user?.email || "..."}</p>
              </div>
            </Link>
            
            <div className="flex shrink-0">
              <ThemeToggle />
              <button 
                onClick={async () => {
                  await fetch("/api/auth/logout", { method: "POST" });
                  window.location.href = "/";
                }}
                className="h-9 w-9 rounded-xl text-slate-400 hover:bg-rose-500/10 hover:text-rose-500 flex items-center justify-center transition-colors"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex flex-1 flex-col h-full overflow-hidden relative">
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-6 p-4 md:p-8 relative bg-slate-50 dark:bg-[#0a0a0a]">
          <div className="max-w-5xl mx-auto h-full">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Navigation Bar (Mimicking screenshot Mobile spec) */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pb-safe z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          <div className="flex h-16 items-center justify-around px-2">
            {mobileNavLinks.map((link) => {
              const Icon = link.icon
              const isActive = pathname === link.href || (link.name === "Menu" && (pathname.includes("profile") || pathname.includes("settings") || pathname.includes("attendance") || pathname.includes("notes")))
              
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                    isActive ? "text-emerald-500" : "text-slate-400 hover:text-slate-900 dark:hover:text-slate-300"
                  }`}
                >
                  <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-[10px] font-medium">{link.name}</span>
                </Link>
              )
            })}
          </div>
        </nav>
      </div>
    </div>
  )
}

"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, Calendar, CheckSquare, Menu } from "lucide-react"

const mobileNavLinks = [
  { name: "Home", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Students", href: "/admin/dashboard/students", icon: Users },
  { name: "Timetable", href: "/admin/dashboard/timetable", icon: Calendar },
  { name: "Tasks", href: "/admin/dashboard/assignments", icon: CheckSquare },
  { name: "Menu", href: "/admin/dashboard/settings", icon: Menu }, 
]

export function AdminMobileBottomNav() {
  const pathname = usePathname()
  
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pb-safe z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      <div className="flex h-16 items-center justify-around px-2">
        {mobileNavLinks.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href || (link.name === "Menu" && (pathname.includes("notices") || pathname.includes("settings") || pathname.includes("attendance") || pathname.includes("notes")))
          
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                isActive ? "text-blue-500" : "text-slate-400 hover:text-slate-900 dark:hover:text-slate-300"
              }`}
            >
              <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{link.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

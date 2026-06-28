"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Menu, 
  X, 
  ShieldAlert, 
  LogOut,
  LayoutDashboard,
  Users,
  Calendar,
  Bell,
  BarChart3,
  Settings,
  BookOpen,
  CheckSquare
} from "lucide-react";

const sidebarLinks = [
  { name: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Students", href: "/admin/dashboard/students", icon: Users },
  { name: "Attendance", href: "/admin/dashboard/attendance", icon: BarChart3 },
  { name: "Timetable", href: "/admin/dashboard/timetable", icon: Calendar },
  { name: "Assignments", href: "/admin/dashboard/assignments", icon: CheckSquare },
  { name: "Notices", href: "/admin/dashboard/notices", icon: Bell },
  { name: "Notes", href: "/admin/dashboard/notes", icon: BookOpen },
  { name: "Settings", href: "/admin/dashboard/settings", icon: Settings },
];

export function AdminMobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex items-center md:hidden">
      <button 
        onClick={() => setIsOpen(true)}
        className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
      >
        <Menu className="h-6 w-6" />
      </button>
      <span className="ml-4 font-semibold md:hidden dark:text-white text-slate-900">Admin</span>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="relative flex w-72 max-w-[80vw] flex-col bg-slate-900 shadow-xl animate-in slide-in-from-left duration-300">
            <div className="flex h-16 flex-shrink-0 items-center justify-between px-6 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 text-white shadow-inner">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <span className="text-lg font-bold tracking-tight text-white">Admin Portal</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto hide-scrollbar">
              {sidebarLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive ? "bg-slate-800 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {link.name}
                  </Link>
                );
              })}
            </nav>
            
            <div className="p-4 border-t border-slate-800">
              <form action="/api/auth/logout" method="POST">
                <button type="submit" className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-red-500/10 hover:text-red-500 transition-colors">
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
